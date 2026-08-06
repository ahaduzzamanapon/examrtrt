<?php

namespace App\Console\Commands;

use App\Models\AppSetting;
use App\Models\Question;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GenerateQuestions extends Command
{
    protected $signature   = 'questions:generate
                                {--goal= : Specific exam goal (bcs/hsc/ssc/...). Default: all}
                                {--subject= : Specific subject. Default: all}
                                {--count=5 : Questions per subject}
                                {--difficulty=MEDIUM : LOW|MEDIUM|HIGH}
                                {--force : Generate even if questions already exist}';

    protected $description = 'Generate AI questions for every exam goal × subject. Skips combinations that already have questions.';

    /** PHP mirror of resources/js/data/subjects.js */
    private const SUBJECTS = [
        'bcs' => [
            'বাংলা ভাষা ও সাহিত্য',
            'English Language & Literature',
            'বাংলাদেশ বিষয়াবলী',
            'আন্তর্জাতিক বিষয়াবলী',
            'ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা',
            'সাধারণ বিজ্ঞান',
            'কম্পিউটার ও তথ্যপ্রযুক্তি',
            'গণিত',
            'মানসিক দক্ষতা',
            'নৈতিকতা, মূল্যবোধ ও সুশাসন',
        ],
        'ssc' => [
            'বাংলা', 'ইংরেজি', 'গণিত', 'সাধারণ বিজ্ঞান',
            'বাংলাদেশ ও বিশ্বপরিচয়', 'তথ্য ও যোগাযোগ প্রযুক্তি',
            'ধর্ম ও নৈতিক শিক্ষা', 'পদার্থবিজ্ঞান', 'রসায়ন',
            'জীববিজ্ঞান', 'উচ্চতর গণিত', 'ভূগোল ও পরিবেশ',
            'অর্থনীতি', 'ইতিহাস ও বিশ্বসভ্যতা', 'হিসাববিজ্ঞান', 'ব্যবসায় উদ্যোগ',
        ],
        'hsc' => [
            'বাংলা', 'ইংরেজি', 'পদার্থবিজ্ঞান', 'রসায়ন', 'জীববিজ্ঞান',
            'গণিত', 'উচ্চতর গণিত', 'তথ্য ও যোগাযোগ প্রযুক্তি',
            'অর্থনীতি', 'হিসাববিজ্ঞান', 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা',
            'ফিন্যান্স, ব্যাংকিং ও বিমা', 'মার্কেটিং', 'পৌরনীতি ও সুশাসন',
            'ইসলামের ইতিহাস ও সংস্কৃতি', 'ইতিহাস', 'ভূগোল', 'সমাজকর্ম', 'মনোবিজ্ঞান',
        ],
        'medical' => [
            'জীববিজ্ঞান', 'রসায়ন', 'পদার্থবিজ্ঞান', 'English', 'সাধারণ জ্ঞান',
        ],
        'engineering' => [
            'গণিত', 'পদার্থবিজ্ঞান', 'রসায়ন', 'English', 'বাংলা',
        ],
        'bank' => [
            'বাংলা', 'English', 'গণিত', 'সাধারণ জ্ঞান',
            'বাংলাদেশ বিষয়াবলী', 'আন্তর্জাতিক বিষয়াবলী',
            'কম্পিউটার ও তথ্যপ্রযুক্তি', 'মানসিক দক্ষতা',
        ],
        'university' => [
            'বাংলা', 'English', 'গণিত', 'সাধারণ জ্ঞান',
            'আইকিউ ও মানসিক দক্ষতা', 'বিজ্ঞান',
        ],
        'primary' => [
            'বাংলা', 'ইংরেজি', 'গণিত', 'সাধারণ জ্ঞান',
            'বাংলাদেশ বিষয়াবলী', 'শিশু মনোবিজ্ঞান ও শিক্ষাবিজ্ঞান',
        ],
    ];

    public function handle(): int
    {
        $apiKey = AppSetting::nextGeminiKey();
        if (!$apiKey) {
            $this->error('❌ কোনো Gemini API key নেই। Admin → Settings এ key যোগ করো।');
            return 1;
        }

        $model      = AppSetting::get('gemini_model', 'gemini-3.6-flash');
        $count      = (int) $this->option('count');
        $difficulty = strtoupper($this->option('difficulty'));
        $force      = $this->option('force');

        // Build job list: [['goal' => 'bcs', 'subject' => '...']]
        $jobs = $this->buildJobs();

        $total   = count($jobs);
        $skipped = 0;
        $saved   = 0;
        $failed  = 0;

        $this->info("📋 মোট {$total}টি combination চেক করা হবে...");
        $bar = $this->output->createProgressBar($total);
        $bar->start();

        foreach ($jobs as $job) {
            $goal    = $job['goal'];
            $subject = $job['subject'];

            // Skip if questions already exist (unless --force)
            if (!$force) {
                $existing = Question::where('exam_goal', $goal)
                    ->where('subject', $subject)
                    ->count();
                if ($existing > 0) {
                    $skipped++;
                    $bar->advance();
                    continue;
                }
            }

            // Generate via Gemini
            $questions = $this->callGemini($apiKey, $model, $goal, $subject, $count, $difficulty);

            if ($questions === null) {
                $failed++;
                $bar->advance();
                // Rotate key on failure
                $apiKey = AppSetting::nextGeminiKey() ?? $apiKey;
                sleep(2);
                continue;
            }

            // Save
            foreach ($questions as $q) {
                try {
                    Question::create([
                        'exam_goal'        => $goal,
                        'exam_type'        => strtoupper($goal),
                        'board_year'       => null,
                        'subject'          => $subject,
                        'question_text'    => $q['question_text'] ?? '',
                        'image_url'        => null,
                        'options'          => $q['options'] ?? ['a'=>'','b'=>'','c'=>'','d'=>''],
                        'correct_answer'   => $q['correct_answer'] ?? 'a',
                        'explanation'      => $q['explanation'] ?? null,
                        'difficulty_level' => $q['difficulty_level'] ?? $difficulty,
                        'is_ai_generated'  => true,
                        'is_active'        => true,
                    ]);
                    $saved++;
                } catch (\Throwable $e) {
                    Log::warning("[GenerateQuestions] save failed: {$e->getMessage()}");
                }
            }

            $bar->advance();

            // Small delay between requests to respect rate limits
            usleep(800_000); // 0.8 seconds
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("✅ Done! Saved: {$saved} | Skipped (existed): {$skipped} | Failed: {$failed}");

        return 0;
    }

    private function buildJobs(): array
    {
        $goalFilter    = $this->option('goal');
        $subjectFilter = $this->option('subject');
        $jobs = [];

        $goals = $goalFilter ? [$goalFilter] : array_keys(self::SUBJECTS);

        foreach ($goals as $goal) {
            $subjects = self::SUBJECTS[$goal] ?? [];
            if ($subjectFilter) {
                $subjects = array_filter($subjects, fn($s) => $s === $subjectFilter);
            }
            foreach ($subjects as $subject) {
                $jobs[] = ['goal' => $goal, 'subject' => $subject];
            }
        }

        return $jobs;
    }

    private function callGemini(string $apiKey, string $model, string $goal, string $subject, int $count, string $difficulty): ?array
    {
        $goalUpper = strtoupper($goal);
        $prompt    = <<<PROMPT
Generate {$count} MCQ questions for {$goalUpper} exam in Bangladesh.
Subject: {$subject}
Difficulty: {$difficulty}

Return ONLY a valid JSON array (no markdown):
[{"subject":"{$subject}","exam_type":"{$goalUpper}","board_year":null,"difficulty_level":"{$difficulty}","question_text":"...Bengali...","image_url":null,"options":{"a":"...","b":"...","c":"...","d":"..."},"correct_answer":"a","explanation":"...Bengali..."}]
PROMPT;

        try {
            $response = Http::withHeaders(['Content-Type' => 'application/json'])
                ->timeout(45)
                ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}", [
                    'contents'        => [['parts' => [['text' => $prompt]]]],
                    'generationConfig' => ['temperature' => 0.7, 'maxOutputTokens' => 4096],
                ]);

            if (!$response->successful()) {
                Log::warning("[GenerateQuestions] API {$response->status()} for {$goal}/{$subject}: " . $response->body());
                return null;
            }

            $text = $response->json('candidates.0.content.parts.0.text') ?? '';
            $text = trim(preg_replace('/```json\s*|\s*```/', '', $text));

            $parsed = json_decode($text, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::warning("[GenerateQuestions] JSON parse error: " . json_last_error_msg() . " | Text: " . substr($text, 0, 200));
                return null;
            }

            if (isset($parsed['questions']) && is_array($parsed['questions'])) {
                $parsed = $parsed['questions'];
            }

            if (!is_array($parsed)) {
                Log::warning("[GenerateQuestions] Parsed data is not an array for {$goal}/{$subject}");
                return null;
            }

            return $parsed;
        } catch (\Throwable $e) {
            Log::warning("[GenerateQuestions] Exception: {$e->getMessage()}");
            return null;
        }
    }
}
