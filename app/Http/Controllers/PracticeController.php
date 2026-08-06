<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\AppSetting;
use App\Models\PracticeTest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class PracticeController extends Controller
{
    // ── Practice home — category select ──────────────────────────────────────
    public function index()
    {
        $user = auth()->user();
        $goals = is_array($user->exam_goal) ? $user->exam_goal : [];

        // Count questions per goal for display
        $counts = Question::where('is_active', true)
            ->selectRaw('exam_goal, count(*) as total')
            ->groupBy('exam_goal')
            ->pluck('total', 'exam_goal');

        // Today's practice count
        $todayCount = PracticeTest::where('user_id', $user->id)
            ->whereDate('created_at', today())
            ->count();

        $dailyLimit = (int) AppSetting::get('practice_daily_limit', 5);

        return Inertia::render('Practice/Index', [
            'goals'      => $goals,
            'counts'     => $counts,
            'todayCount' => $todayCount,
            'dailyLimit' => $dailyLimit,
            'stream'     => $user->stream,
        ]);
    }

    // ── Start a practice session ──────────────────────────────────────────────
    public function start(Request $request)
    {
        $user = auth()->user();
        $dailyLimit = (int) AppSetting::get('practice_daily_limit', 5);

        $todayCount = PracticeTest::where('user_id', $user->id)
            ->whereDate('created_at', today())
            ->count();

        if ($todayCount >= $dailyLimit) {
            return back()->withErrors(['limit' => "আজকের {$dailyLimit}টি প্র্যাকটিস শেষ। আগামীকাল আবার চেষ্টা করো!"]);
        }

        $request->validate(['goal' => 'required|string', 'count' => 'integer|min:5|max:30']);

        $goal  = $request->goal;
        $count = (int) ($request->count ?? 10);

        // Build query — filter by stream for hsc/ssc
        $q = Question::where('exam_goal', $goal)->where('is_active', true);
        if (in_array($goal, ['hsc', 'ssc']) && $user->stream) {
            $q->where(function ($query) use ($user) {
                $query->where('stream', $user->stream)->orWhere('stream', 'general');
            });
        }
        $questions = $q->inRandomOrder()->limit($count)
            ->get(['id', 'question_text', 'options', 'correct_answer', 'explanation', 'subject', 'difficulty_level'])
            ->toArray();

        if (empty($questions)) {
            return back()->withErrors(['limit' => 'এই ক্যাটাগরিতে এখনো পর্যাপ্ত প্রশ্ন নেই।']);
        }

        // Record practice session
        PracticeTest::create([
            'user_id'            => $user->id,
            'categories'         => [$goal],
            'questions_snapshot' => $questions,
            'score'              => 0,
            'completed'          => false,
        ]);

        return Inertia::render('Practice/Session', [
            'questions' => $questions,
            'goal'      => $goal,
        ]);
    }

    // ── Ask AI about a question ───────────────────────────────────────────────
    public function askAi(Request $request)
    {
        $request->validate([
            'question' => 'required|string|max:500',
            'context'  => 'nullable|string|max:1000',
        ]);

        $apiKey = AppSetting::nextGeminiKey();
        if (!$apiKey) {
            return response()->json(['error' => 'AI সাময়িকভাবে অনুপলব্ধ।'], 503);
        }

        $model = AppSetting::get('gemini_model', 'gemini-2.0-flash');
        $prompt = "তুমি একজন বাংলাদেশের প্রতিযোগিতামূলক পরীক্ষার বিশেষজ্ঞ শিক্ষক। শিক্ষার্থীর প্রশ্নের উত্তর বাংলায় সহজ ভাষায় দাও।\n\nপ্রশ্নের প্রসঙ্গ: {$request->context}\n\nশিক্ষার্থীর জিজ্ঞাসা: {$request->question}\n\nসংক্ষেপে ও স্পষ্টভাবে উত্তর দাও (৩-৫ বাক্যে):";

        try {
            $response = Http::withHeaders(['Content-Type' => 'application/json'])
                ->timeout(20)
                ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}", [
                    'contents'         => [['parts' => [['text' => $prompt]]]],
                    'generationConfig' => ['temperature' => 0.5, 'maxOutputTokens' => 512],
                ]);

            $text = $response->json('candidates.0.content.parts.0.text') ?? 'উত্তর পাওয়া যায়নি।';
            return response()->json(['answer' => $text]);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'AI সংযোগে সমস্যা হয়েছে।'], 503);
        }
    }
}
