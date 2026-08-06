<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class QuestionController extends Controller
{
    // ── List ──────────────────────────────────────────────────────────────────
    public function index(Request $request)
    {
        $q = $request->get('q', '');
        $goal = $request->get('goal', '');

        $questions = Question::query()
            ->when($q,    fn($query) => $query->where('question_text', 'like', "%{$q}%")
                ->orWhere('subject', 'like', "%{$q}%"))
            ->when($goal, fn($query) => $query->where('exam_goal', $goal))
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn($q) => [
                'id'             => $q->id,
                'exam_goal'      => $q->exam_goal,
                'exam_type'      => $q->exam_type,
                'board_year'     => $q->board_year,
                'subject'        => $q->subject,
                'question_text'  => $q->question_text,
                'options'        => $q->options,
                'correct_answer' => $q->correct_answer,
                'explanation'    => $q->explanation,
                'difficulty_level' => $q->difficulty_level,
                'is_ai_generated'  => $q->is_ai_generated,
                'is_active'      => $q->is_active,
            ]);

        return Inertia::render('Admin/Questions', [
            'questions' => $questions,
            'filters'   => ['q' => $q, 'goal' => $goal],
            'stats'     => [
                'total'     => Question::count(),
                'ai'        => Question::where('is_ai_generated', true)->count(),
                'by_goal'   => Question::selectRaw('exam_goal, count(*) as cnt')->groupBy('exam_goal')->pluck('cnt', 'exam_goal'),
            ],
        ]);
    }

    // ── Store (manual) ────────────────────────────────────────────────────────
    public function store(Request $request)
    {
        $data = $request->validate([
            'exam_goal'      => 'required|string|max:50',
            'exam_type'      => 'nullable|string|max:150',
            'board_year'     => 'nullable|string|max:200',
            'subject'        => 'nullable|string|max:200',
            'question_text'  => 'required|string',
            'image_url'      => 'nullable|url|max:500',
            'options'        => 'required|array',
            'options.a'      => 'required|string',
            'options.b'      => 'required|string',
            'options.c'      => 'required|string',
            'options.d'      => 'required|string',
            'correct_answer' => 'required|in:a,b,c,d',
            'explanation'    => 'nullable|string',
            'difficulty_level' => 'required|in:LOW,MEDIUM,HIGH',
        ]);

        Question::create($data + ['is_ai_generated' => false]);
        return back()->with('success', 'প্রশ্ন যোগ করা হয়েছে।');
    }

    // ── Update ────────────────────────────────────────────────────────────────
    public function update(Request $request, Question $question)
    {
        $data = $request->validate([
            'exam_goal'      => 'required|string|max:50',
            'exam_type'      => 'nullable|string|max:150',
            'board_year'     => 'nullable|string|max:200',
            'subject'        => 'nullable|string|max:200',
            'question_text'  => 'required|string',
            'image_url'      => 'nullable|url|max:500',
            'options'        => 'required|array',
            'options.a'      => 'required|string',
            'options.b'      => 'required|string',
            'options.c'      => 'required|string',
            'options.d'      => 'required|string',
            'correct_answer' => 'required|in:a,b,c,d',
            'explanation'    => 'nullable|string',
            'difficulty_level' => 'required|in:LOW,MEDIUM,HIGH',
            'is_active'      => 'boolean',
        ]);

        $question->update($data);
        return back()->with('success', 'প্রশ্ন আপডেট হয়েছে।');
    }

    // ── Delete ────────────────────────────────────────────────────────────────
    public function destroy(Question $question)
    {
        $question->delete();
        return back()->with('success', 'প্রশ্ন মুছে ফেলা হয়েছে।');
    }

    // ── JSON Bulk Import ──────────────────────────────────────────────────────
    public function import(Request $request)
    {
        $request->validate(['json' => 'required|string']);

        $parsed = json_decode($request->json, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return back()->with('error', 'JSON invalid: ' . json_last_error_msg());
        }

        // Support both: array of questions or object with "questions" key
        $items = isset($parsed['questions']) ? $parsed['questions'] : $parsed;
        if (!is_array($items)) {
            return back()->with('error', 'JSON এ questions array পাওয়া যায়নি।');
        }

        $imported = 0;
        $failed   = 0;
        $examGoal = $request->get('exam_goal', 'bcs');

        foreach ($items as $item) {
            try {
                $options = $item['options'] ?? null;
                if (is_array($options) && isset($options['a'])) {
                    // already {"a":..,"b":..}
                } else {
                    continue;
                }

                $correct = strtolower($item['correct_answer'] ?? $item['correct_option'] ?? 'a');

                Question::create([
                    'exam_goal'       => $examGoal,
                    'exam_type'       => $item['exam_type'] ?? null,
                    'board_year'      => $item['board_year'] ?? null,
                    'subject'         => $item['subject'] ?? null,
                    'question_text'   => $item['question_text'] ?? $item['question'] ?? '',
                    'image_url'       => $item['image_url'] ?? null,
                    'options'         => $options,
                    'correct_answer'  => in_array($correct, ['a','b','c','d']) ? $correct : 'a',
                    'explanation'     => $item['explanation'] ?? null,
                    'difficulty_level'=> strtoupper($item['difficulty_level'] ?? $item['difficulty'] ?? 'MEDIUM'),
                    'is_ai_generated' => false,
                    'is_active'       => true,
                ]);
                $imported++;
            } catch (\Throwable $e) {
                $failed++;
                \Log::warning('[Import] Failed: ' . $e->getMessage());
            }
        }

        return back()->with('success', "✅ {$imported}টি প্রশ্ন import হয়েছে" . ($failed ? ", ❌ {$failed}টি ব্যর্থ" : ''));
    }

    // ── Gemini AI Generate ────────────────────────────────────────────────────
    public function aiGenerate(Request $request)
    {
        $request->validate([
            'exam_goal'   => 'required|string',
            'subject'     => 'nullable|string',   // optional – Gemini picks topic if empty
            'board_year'  => 'nullable|string',
            'count'       => 'required|integer|min:1|max:20',
            'difficulty'  => 'nullable|in:MIXED,LOW,MEDIUM,HIGH',
        ]);

        $apiKey = AppSetting::nextGeminiKey();
        if (!$apiKey) {
            return response()->json(['error' => 'কোনো Gemini API key সেট করা নেই। Admin → Settings এ যাও।'], 422);
        }

        $goal       = strtoupper($request->exam_goal);
        $subject    = $request->subject ?? '';
        $boardYear  = $request->board_year ?? '';
        $count      = $request->count;
        $difficulty = $request->difficulty ?? 'MIXED';

        $subjectLine = $subject ? "Subject: {$subject}" : "Subject: Any relevant subject for {$goal} exam";
        $boardLine   = $boardYear
            ? "Exam Year/Type requirement: {$boardYear}"
            : "If this is a real authentic past exam question in Bangladesh (e.g. 45th BCS, Dhaka Board 2023), set 'board_year' to that exam name in Bengali (e.g. '৪৫তম বিসিএস প্রিলিমিনারি'). If it is a new custom/model question, set 'board_year' to 'NEW'.";

        $diffLine = ($difficulty === 'MIXED' || !$difficulty)
            ? "Difficulty: Mix LOW, MEDIUM, and HIGH difficulty questions realistically for standard exam distribution."
            : "Difficulty level target: {$difficulty}";

        $prompt = <<<PROMPT
Generate {$count} multiple choice questions for {$goal} exam in Bangladesh.
{$subjectLine}
{$boardLine}
{$diffLine}

IMPORTANT for fields:
- "board_year": Exam name in Bengali or "NEW"
- "difficulty_level": Must be "LOW", "MEDIUM", or "HIGH" based on how challenging the question is.

Return ONLY a valid JSON array (no markdown, no explanation outside JSON):
[
  {
    "subject": "the subject of the question",
    "exam_type": "{$goal}",
    "board_year": "Exam name in Bengali or 'NEW'",
    "difficulty_level": "LOW or MEDIUM or HIGH",
    "question_text": "...(in Bengali)...",
    "image_url": null,
    "options": {"a": "...", "b": "...", "c": "...", "d": "..."},
    "correct_answer": "a",
    "explanation": "...(in Bengali)..."
  }
]
PROMPT;

        $model = AppSetting::get('gemini_model', 'gemini-3.6-flash');

        $response = Http::withHeaders(['Content-Type' => 'application/json'])
            ->timeout(30)
            ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}", [
                'contents' => [['parts' => [['text' => $prompt]]]],
                'generationConfig' => ['temperature' => 0.7, 'maxOutputTokens' => 4096],
            ]);

        if (!$response->successful()) {
            return response()->json(['error' => 'Gemini API error: ' . $response->status()], 422);
        }

        $text = $response->json('candidates.0.content.parts.0.text') ?? '';

        // Strip markdown code fences if present
        $text = preg_replace('/```json\s*|\s*```/', '', $text);
        $text = trim($text);

        $questions = json_decode($text, true);
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($questions)) {
            return response()->json(['error' => 'JSON generate করতে ব্যর্থ হয়েছে। আবার চেষ্টা করো।'], 422);
        }

        return response()->json(['questions' => $questions]);
    }

    // ── Bulk Save (after AI generate review) ─────────────────────────────────
    public function bulkSave(Request $request)
    {
        $request->validate([
            'questions'   => 'required|array|min:1',
            'exam_goal'   => 'required|string',
        ]);

        $saved = 0;
        foreach ($request->questions as $item) {
            try {
                $by = !empty($item['board_year']) && strtolower(trim($item['board_year'])) !== 'null' ? trim($item['board_year']) : 'NEW';
                Question::create([
                    'exam_goal'        => $request->exam_goal,
                    'exam_type'        => $item['exam_type'] ?? null,
                    'board_year'       => $by,
                    'subject'          => $item['subject'] ?? null,
                    'question_text'    => $item['question_text'] ?? '',
                    'image_url'        => $item['image_url'] ?? null,
                    'options'          => $item['options'] ?? ['a'=>'','b'=>'','c'=>'','d'=>''],
                    'correct_answer'   => $item['correct_answer'] ?? 'a',
                    'explanation'      => $item['explanation'] ?? null,
                    'difficulty_level' => $item['difficulty_level'] ?? 'MEDIUM',
                    'is_ai_generated'  => true,
                    'is_active'        => true,
                ]);
                $saved++;
            } catch (\Throwable) {}
        }

        return response()->json(['saved' => $saved]);
    }

    // ── Extract Questions from Image (Gemini Vision) ──────────────────────────
    public function extractFromImage(Request $request)
    {
        $request->validate([
            'image'     => 'required|image|max:10240',  // max 10 MB
            'exam_goal' => 'nullable|string',
        ]);

        $apiKey = AppSetting::nextGeminiKey();
        if (!$apiKey) {
            return response()->json(['error' => 'Gemini API key নেই। Settings এ যোগ করো।'], 422);
        }

        $model    = AppSetting::get('gemini_model', 'gemini-2.0-flash');
        $goal     = $request->exam_goal ?? 'bcs';
        $goalUp   = strtoupper($goal);

        // Encode image as base64
        $imgPath  = $request->file('image')->path();
        $mimeType = $request->file('image')->getMimeType();
        $imgBase64 = base64_encode(file_get_contents($imgPath));

        $prompt = <<<PROMPT
Look at this image carefully. Extract ALL multiple choice questions (MCQ) visible in the image.
This is likely a Bengali exam question paper (exam type: {$goalUp}).

For each question found, return a JSON object. Return ONLY a valid JSON array, no markdown:
[
  {
    "subject": "subject name in Bengali if visible, else null",
    "exam_type": "{$goalUp}",
    "board_year": "year or exam session if visible, else null",
    "difficulty_level": "MEDIUM",
    "question_text": "full question text (in Bengali or English as shown)",
    "image_url": null,
    "options": {"a": "...", "b": "...", "c": "...", "d": "..."},
    "correct_answer": "a",
    "explanation": null
  }
]

If no MCQ questions are found in the image, return an empty array: []
PROMPT;

        try {
            $response = Http::withHeaders(['Content-Type' => 'application/json'])
                ->timeout(60)
                ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}", [
                    'contents' => [[
                        'parts' => [
                            ['text' => $prompt],
                            ['inline_data' => [
                                'mime_type' => $mimeType,
                                'data'      => $imgBase64,
                            ]],
                        ],
                    ]],
                    'generationConfig' => ['temperature' => 0.2, 'maxOutputTokens' => 4096],
                ]);

            if (!$response->successful()) {
                return response()->json(['error' => 'Gemini API error: ' . $response->status()], 422);
            }

            $text = $response->json('candidates.0.content.parts.0.text') ?? '';
            $text = trim(preg_replace('/```json\s*|\s*```/', '', $text));

            $questions = json_decode($text, true);
            if (json_last_error() !== JSON_ERROR_NONE || !is_array($questions)) {
                return response()->json(['error' => 'ছবিতে কোনো প্রশ্ন খুঁজে পাওয়া যায়নি বা JSON parse হয়নি।', 'raw' => substr($text, 0, 300)], 422);
            }

            return response()->json(['questions' => $questions, 'count' => count($questions)]);

        } catch (\Throwable $e) {
            return response()->json(['error' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // ── AI Background Job Status & Execution ─────────────────────────────────
    public function aiJobStatus()
    {
        $status = AppSetting::get('ai_job_status', [
            'state'   => 'idle',
            'total'   => 0,
            'done'    => 0,
            'current' => '',
            'saved'   => 0,
            'skipped' => 0,
            'failed'  => 0,
            'logs'    => [],
            'updated_at' => null,
        ]);

        return response()->json($status);
    }

    public function runAiCommand(Request $request)
    {
        $goal       = $request->get('exam_goal', '');
        $subject    = $request->get('subject', '');
        $count      = (int) $request->get('count', 3);
        $difficulty = $request->get('difficulty', 'MIXED');
        $force      = $request->boolean('force', false);

        $cmdString = "questions:generate";
        if ($goal) $cmdString .= " --goal={$goal}";
        if ($subject) $cmdString .= " --subject=" . escapeshellarg($subject);
        $cmdString .= " --count={$count} --difficulty={$difficulty}";
        if ($force) $cmdString .= " --force";

        // Initialize job status
        AppSetting::set('ai_job_status', [
            'state'      => 'running',
            'total'      => 1,
            'done'       => 0,
            'current'    => 'Starting background command...',
            'saved'      => 0,
            'skipped'    => 0,
            'failed'     => 0,
            'logs'       => ["🚀 Launching: php artisan {$cmdString}"],
            'updated_at' => now()->toIso8601String(),
        ]);

        // Launch in background
        if (str_starts_with(PHP_OS, 'WIN')) {
            pclose(popen("start /B php artisan {$cmdString} > NUL 2>&1", "r"));
        } else {
            exec("/usr/local/bin/php artisan {$cmdString} > /dev/null 2>&1 &");
        }

        return response()->json(['message' => 'Background generation command started!']);
    }

    public function clearAiJob()
    {
        AppSetting::set('ai_job_status', [
            'state'   => 'idle',
            'total'   => 0,
            'done'    => 0,
            'current' => '',
            'saved'   => 0,
            'skipped' => 0,
            'failed'  => 0,
            'logs'    => [],
            'updated_at' => null,
        ]);

        return response()->json(['message' => 'Job status cleared']);
    }
}
