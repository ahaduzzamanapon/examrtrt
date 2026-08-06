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
                                {--stream= : Specific stream (science/arts/commerce/general). Default: all}
                                {--subject= : Specific subject. Default: all}
                                {--count=5 : Questions per subject}
                                {--difficulty=MEDIUM : LOW|MEDIUM|HIGH}
                                {--force : Generate even if questions already exist}';

    protected $description = 'Generate AI questions for every exam goal × subject × stream. Skips combinations that already have questions.';

    /**
     * Subjects mapped with their stream.
     * stream: science | arts | commerce | general
     * 'general' = visible to all streams (common subjects)
     */
    private const SUBJECTS = [
        'bcs' => [
            ['subject' => 'বাংলা ভাষা ও সাহিত্য',              'stream' => 'general'],
            ['subject' => 'English Language & Literature',       'stream' => 'general'],
            ['subject' => 'বাংলাদেশ বিষয়াবলী',                  'stream' => 'general'],
            ['subject' => 'আন্তর্জাতিক বিষয়াবলী',               'stream' => 'general'],
            ['subject' => 'ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা', 'stream' => 'general'],
            ['subject' => 'সাধারণ বিজ্ঞান',                     'stream' => 'general'],
            ['subject' => 'কম্পিউটার ও তথ্যপ্রযুক্তি',          'stream' => 'general'],
            ['subject' => 'গণিত',                               'stream' => 'general'],
            ['subject' => 'মানসিক দক্ষতা',                      'stream' => 'general'],
            ['subject' => 'নৈতিকতা, মূল্যবোধ ও সুশাসন',         'stream' => 'general'],
        ],
        'ssc' => [
            // Common / General (visible to all streams)
            ['subject' => 'বাংলা',                              'stream' => 'general'],
            ['subject' => 'ইংরেজি',                             'stream' => 'general'],
            ['subject' => 'গণিত',                               'stream' => 'general'],
            ['subject' => 'বাংলাদেশ ও বিশ্বপরিচয়',             'stream' => 'general'],
            ['subject' => 'তথ্য ও যোগাযোগ প্রযুক্তি',           'stream' => 'general'],
            ['subject' => 'ধর্ম ও নৈতিক শিক্ষা',               'stream' => 'general'],
            // Science stream
            ['subject' => 'পদার্থবিজ্ঞান',                      'stream' => 'science'],
            ['subject' => 'রসায়ন',                              'stream' => 'science'],
            ['subject' => 'জীববিজ্ঞান',                         'stream' => 'science'],
            ['subject' => 'উচ্চতর গণিত',                        'stream' => 'science'],
            ['subject' => 'সাধারণ বিজ্ঞান',                     'stream' => 'science'],
            // Arts stream
            ['subject' => 'ভূগোল ও পরিবেশ',                     'stream' => 'arts'],
            ['subject' => 'ইতিহাস ও বিশ্বসভ্যতা',               'stream' => 'arts'],
            // Commerce stream
            ['subject' => 'হিসাববিজ্ঞান',                       'stream' => 'commerce'],
            ['subject' => 'ব্যবসায় উদ্যোগ',                     'stream' => 'commerce'],
            ['subject' => 'অর্থনীতি',                           'stream' => 'commerce'],
        ],
        'hsc' => [
            // Common / General (visible to all streams)
            ['subject' => 'বাংলা',                              'stream' => 'general'],
            ['subject' => 'ইংরেজি',                             'stream' => 'general'],
            ['subject' => 'তথ্য ও যোগাযোগ প্রযুক্তি',           'stream' => 'general'],
            // Science stream
            ['subject' => 'পদার্থবিজ্ঞান',                      'stream' => 'science'],
            ['subject' => 'রসায়ন',                              'stream' => 'science'],
            ['subject' => 'জীববিজ্ঞান',                         'stream' => 'science'],
            ['subject' => 'গণিত',                               'stream' => 'science'],
            ['subject' => 'উচ্চতর গণিত',                        'stream' => 'science'],
            // Arts stream
            ['subject' => 'পৌরনীতি ও সুশাসন',                   'stream' => 'arts'],
            ['subject' => 'ইসলামের ইতিহাস ও সংস্কৃতি',          'stream' => 'arts'],
            ['subject' => 'ইতিহাস',                              'stream' => 'arts'],
            ['subject' => 'ভূগোল',                              'stream' => 'arts'],
            ['subject' => 'সমাজকর্ম',                           'stream' => 'arts'],
            ['subject' => 'মনোবিজ্ঞান',                         'stream' => 'arts'],
            // Commerce stream
            ['subject' => 'অর্থনীতি',                           'stream' => 'commerce'],
            ['subject' => 'হিসাববিজ্ঞান',                       'stream' => 'commerce'],
            ['subject' => 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা',         'stream' => 'commerce'],
            ['subject' => 'ফিন্যান্স, ব্যাংকিং ও বিমা',          'stream' => 'commerce'],
            ['subject' => 'মার্কেটিং',                           'stream' => 'commerce'],
        ],
        'medical' => [
            ['subject' => 'জীববিজ্ঞান',    'stream' => 'general'],
            ['subject' => 'রসায়ন',         'stream' => 'general'],
            ['subject' => 'পদার্থবিজ্ঞান', 'stream' => 'general'],
            ['subject' => 'English',        'stream' => 'general'],
            ['subject' => 'সাধারণ জ্ঞান',  'stream' => 'general'],
        ],
        'engineering' => [
            ['subject' => 'গণিত',          'stream' => 'general'],
            ['subject' => 'পদার্থবিজ্ঞান', 'stream' => 'general'],
            ['subject' => 'রসায়ন',         'stream' => 'general'],
            ['subject' => 'English',        'stream' => 'general'],
            ['subject' => 'বাংলা',          'stream' => 'general'],
        ],
        'bank' => [
            ['subject' => 'বাংলা',                      'stream' => 'general'],
            ['subject' => 'English',                    'stream' => 'general'],
            ['subject' => 'গণিত',                       'stream' => 'general'],
            ['subject' => 'সাধারণ জ্ঞান',               'stream' => 'general'],
            ['subject' => 'বাংলাদেশ বিষয়াবলী',          'stream' => 'general'],
            ['subject' => 'আন্তর্জাতিক বিষয়াবলী',       'stream' => 'general'],
            ['subject' => 'কম্পিউটার ও তথ্যপ্রযুক্তি',  'stream' => 'general'],
            ['subject' => 'মানসিক দক্ষতা',              'stream' => 'general'],
        ],
        'university' => [
            ['subject' => 'বাংলা',                    'stream' => 'general'],
            ['subject' => 'English',                  'stream' => 'general'],
            ['subject' => 'গণিত',                     'stream' => 'general'],
            ['subject' => 'সাধারণ জ্ঞান',             'stream' => 'general'],
            ['subject' => 'আইকিউ ও মানসিক দক্ষতা',   'stream' => 'general'],
            ['subject' => 'বিজ্ঞান',                  'stream' => 'general'],
        ],
        'primary' => [
            ['subject' => 'বাংলা',                              'stream' => 'general'],
            ['subject' => 'ইংরেজি',                             'stream' => 'general'],
            ['subject' => 'গণিত',                               'stream' => 'general'],
            ['subject' => 'সাধারণ জ্ঞান',                       'stream' => 'general'],
            ['subject' => 'বাংলাদেশ বিষয়াবলী',                  'stream' => 'general'],
            ['subject' => 'শিশু মনোবিজ্ঞান ও শিক্ষাবিজ্ঞান',     'stream' => 'general'],
        ],
    ];

    public function handle(): int
    {
        $model        = AppSetting::get('gemini_model', 'gemini-3.6-flash');
        $count        = (int) $this->option('count');
        $difficulty   = strtoupper($this->option('difficulty'));
        $force        = $this->option('force');

        $jobs    = $this->buildJobs();
        $total   = count($jobs);
        $skipped = 0;
        $saved   = 0;
        $failed  = 0;

        $logs = ["📋 Total {$total} combinations scheduled..."];
        $this->updateStatus('running', $total, 0, 'Starting...', $saved, $skipped, $failed, $logs);

        $this->info("📋 মোট {$total}টি combination চেক করা হবে...");
        $bar = $this->output->createProgressBar($total);
        $bar->start();

        foreach ($jobs as $index => $job) {
            $step         = $index + 1;
            $goal         = $job['goal'];
            $subject      = $job['subject'];
            $stream       = $job['stream'];
            $currentLabel = strtoupper($goal) . " [{$stream}] → {$subject}";

            // Skip if questions already exist (unless --force)
            if (!$force) {
                $existing = Question::where('exam_goal', $goal)
                    ->where('subject', $subject)
                    ->where('stream', $stream)
                    ->count();
                if ($existing > 0) {
                    $skipped++;
                    $bar->advance();
                    $logs[] = "⏭️ [{$step}/{$total}] {$currentLabel}: Skipped (already has {$existing} questions)";
                    $this->updateStatus('running', $total, $step, $currentLabel, $saved, $skipped, $failed, $logs);
                    continue;
                }
            }

            // Generate via Gemini with smart rate-limit retries
            $questions = null;
            for ($attempt = 1; $attempt <= 5; $attempt++) {
                $apiKey = AppSetting::nextGeminiKey();
                if (!$apiKey) {
                    $logs[] = "❌ [{$step}/{$total}] {$currentLabel}: No Gemini API Key available!";
                    break;
                }

                $res = $this->callGemini($apiKey, $model, $goal, $subject, $stream, $count, $difficulty);

                if ($res['status'] === 200 && is_array($res['questions'])) {
                    $questions = $res['questions'];
                    break;
                }

                if ($res['status'] === 429) {
                    $logs[] = "⏳ [{$step}/{$total}] {$currentLabel}: Rate limit (429) hit! Waiting 12s... (Attempt {$attempt}/5)";
                    $this->updateStatus('running', $total, $step, $currentLabel, $saved, $skipped, $failed, $logs);
                    sleep(12);
                } else {
                    $logs[] = "⚠️ [{$step}/{$total}] {$currentLabel}: Error HTTP {$res['status']}! Retrying ({$attempt}/5)...";
                    $this->updateStatus('running', $total, $step, $currentLabel, $saved, $skipped, $failed, $logs);
                    sleep(3);
                }
            }

            if ($questions === null) {
                $failed++;
                $bar->advance();
                $logs[] = "❌ [{$step}/{$total}] {$currentLabel}: Generation failed after retries.";
                $this->updateStatus('running', $total, $step, $currentLabel, $saved, $skipped, $failed, $logs);
                continue;
            }

            // Save
            $itemSaved = 0;
            foreach ($questions as $q) {
                try {
                    $qText = trim($q['question_text'] ?? '');
                    if (empty($qText)) continue;

                    // Skip duplicate question text
                    if (Question::where('question_text', $qText)->exists()) {
                        continue;
                    }

                    $by = !empty($q['board_year']) && strtolower(trim($q['board_year'])) !== 'null'
                        ? trim($q['board_year']) : 'NEW';

                    Question::create([
                        'exam_goal'        => $goal,
                        'stream'           => $stream,   // ← NEW
                        'exam_type'        => strtoupper($goal),
                        'board_year'       => $by,
                        'subject'          => $subject,
                        'question_text'    => $qText,
                        'image_url'        => null,
                        'options'          => $q['options'] ?? ['a'=>'','b'=>'','c'=>'','d'=>''],
                        'correct_answer'   => $q['correct_answer'] ?? 'a',
                        'explanation'      => $q['explanation'] ?? null,
                        'difficulty_level' => $q['difficulty_level'] ?? $difficulty,
                        'is_ai_generated'  => true,
                        'is_active'        => true,
                    ]);
                    $saved++;
                    $itemSaved++;
                } catch (\Throwable $e) {
                    Log::warning("[GenerateQuestions] save failed: {$e->getMessage()}");
                }
            }

            $logs[] = "✅ [{$step}/{$total}] {$currentLabel}: Saved {$itemSaved} questions.";
            $bar->advance();
            $this->updateStatus('running', $total, $step, $currentLabel, $saved, $skipped, $failed, $logs);

            sleep(3);
        }

        $bar->finish();
        $this->newLine(2);
        $summary = "Completed! Saved: {$saved} | Skipped: {$skipped} | Failed: {$failed}";
        $logs[] = "🎉 {$summary}";
        $this->info("✅ {$summary}");
        $this->updateStatus('completed', $total, $total, 'Done', $saved, $skipped, $failed, $logs);

        return 0;
    }

    private function buildJobs(): array
    {
        $goalFilter   = $this->option('goal');
        $streamFilter = $this->option('stream');
        $subjectFilter = $this->option('subject');
        $jobs = [];

        $goals = $goalFilter ? [$goalFilter] : array_keys(self::SUBJECTS);

        foreach ($goals as $goal) {
            $entries = self::SUBJECTS[$goal] ?? [];
            foreach ($entries as $entry) {
                if ($streamFilter && $entry['stream'] !== $streamFilter) continue;
                if ($subjectFilter && $entry['subject'] !== $subjectFilter) continue;
                $jobs[] = [
                    'goal'    => $goal,
                    'subject' => $entry['subject'],
                    'stream'  => $entry['stream'],
                ];
            }
        }

        return $jobs;
    }

    private function updateStatus(string $state, int $total, int $done, string $current, int $saved, int $skipped, int $failed, array $logs): void
    {
        $recentLogs = array_slice($logs, -30);
        AppSetting::set('ai_job_status', [
            'state'      => $state,
            'total'      => $total,
            'done'       => $done,
            'current'    => $current,
            'saved'      => $saved,
            'skipped'    => $skipped,
            'failed'     => $failed,
            'logs'       => $recentLogs,
            'updated_at' => now()->toIso8601String(),
        ]);
    }

    private function callGemini(string $apiKey, string $model, string $goal, string $subject, string $stream, int $count, string $difficulty): array
    {
        $goalUpper  = strtoupper($goal);
        $streamNote = ($stream !== 'general')
            ? "This subject is for the {$stream} stream/group."
            : "This is a common subject visible to all streams.";
        $diffPrompt = ($difficulty === 'MIXED' || !$difficulty)
            ? "Vary difficulty levels naturally (LOW, MEDIUM, HIGH)."
            : "Target Difficulty: {$difficulty}";

        $prompt = <<<PROMPT
Generate {$count} MCQ questions for {$goalUpper} exam in Bangladesh.
Subject: {$subject}
{$streamNote}
{$diffPrompt}

IMPORTANT for fields:
- "board_year": Authentic past exam → set to that session in Bengali (e.g. "ঢাকা বোর্ড ২০২৩"). New question → set "NEW".
- "difficulty_level": Assign "LOW", "MEDIUM", or "HIGH" per question.
- All question text and options MUST be in Bengali.

Return ONLY a valid JSON array (no markdown):
[{"subject":"{$subject}","exam_type":"{$goalUpper}","board_year":"NEW","difficulty_level":"MEDIUM","question_text":"...Bengali...","image_url":null,"options":{"a":"...","b":"...","c":"...","d":"..."},"correct_answer":"a","explanation":"...Bengali..."}]
PROMPT;

        try {
            $response = Http::withHeaders(['Content-Type' => 'application/json'])
                ->timeout(45)
                ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}", [
                    'contents'         => [['parts' => [['text' => $prompt]]]],
                    'generationConfig' => ['temperature' => 0.7, 'maxOutputTokens' => 4096],
                ]);

            $status = $response->status();
            if (!$response->successful()) {
                Log::warning("[GenerateQuestions] API {$status} for {$goal}/{$subject}/{$stream}: " . $response->body());
                return ['status' => $status, 'questions' => null];
            }

            $text   = $response->json('candidates.0.content.parts.0.text') ?? '';
            $text   = trim(preg_replace('/```json\s*|\s*```/', '', $text));
            $parsed = json_decode($text, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::warning("[GenerateQuestions] JSON parse error: " . json_last_error_msg());
                return ['status' => 500, 'questions' => null];
            }

            if (isset($parsed['questions']) && is_array($parsed['questions'])) {
                $parsed = $parsed['questions'];
            }

            if (!is_array($parsed)) {
                return ['status' => 500, 'questions' => null];
            }

            return ['status' => 200, 'questions' => $parsed];
        } catch (\Throwable $e) {
            Log::warning("[GenerateQuestions] Exception: {$e->getMessage()}");
            return ['status' => 500, 'questions' => null];
        }
    }
}
