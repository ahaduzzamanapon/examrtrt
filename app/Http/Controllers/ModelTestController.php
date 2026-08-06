<?php

namespace App\Http\Controllers;

use App\Models\ModelTest;
use App\Models\Question;
use App\Models\TokenTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ModelTestController extends Controller
{
    // ── Student Model Test Dashboard & History List ───────────────────────────
    public function index()
    {
        $user = auth()->user();

        $history = ModelTest::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        $goals = is_array($user->exam_goal) ? $user->exam_goal : [$user->exam_goal ?? 'bcs'];

        return Inertia::render('ModelTest/Index', [
            'history'      => $history,
            'tokenBalance' => (int) $user->token_balance,
            'userGoals'    => array_filter($goals),
            'stream'       => $user->stream,
        ]);
    }

    // ── Create & Start Model Test (Cost: 10 Tokens) ───────────────────────────
    public function store(Request $request)
    {
        $user = auth()->user();

        // 1. Check token balance (Cost: 10 Tokens)
        if ($user->token_balance < 10) {
            return back()->withErrors(['tokens' => "মডেল টেস্ট দিতে ১০টি টোকেন প্রয়োজন। আপনার ব্যালেন্স: {$user->token_balance} টোকেন।"]);
        }

        $request->validate([
            'goal'             => 'required|string',
            'subject'          => 'nullable|string',
            'question_count'   => 'required|integer|in:10,20,30,50,100',
            'duration_minutes' => 'required|integer|min:5|max:120',
            'negative_marking' => 'boolean',
        ]);

        $goal     = $request->goal;
        $subject  = $request->subject;
        $qCount   = (int) $request->question_count;
        $duration = (int) $request->duration_minutes;
        $negMark  = (bool) $request->negative_marking;

        // Fetch matching questions
        $qQuery = Question::where('is_active', true)->where('exam_goal', $goal);

        if ($subject && $subject !== 'all') {
            $qQuery->where('subject', $subject);
        }

        if (in_array($goal, ['hsc', 'ssc']) && $user->stream) {
            $qQuery->where(function ($q) use ($user) {
                $q->where('stream', $user->stream)->orWhere('stream', 'general');
            });
        }

        $questions = $qQuery->inRandomOrder()->limit($qCount)
            ->get(['id', 'question_text', 'options', 'correct_answer', 'explanation', 'subject', 'difficulty_level'])
            ->toArray();

        if (count($questions) < 5) {
            return back()->withErrors(['tokens' => 'পর্যাপ্ত প্রশ্ন পাওয়া যায়নি। অন্য ক্যাটাগরি বা বিষয় সিলেক্ট করুন।']);
        }

        // Deduct 10 tokens
        $user->decrement('token_balance', 10);

        TokenTransaction::create([
            'user_id'       => $user->id,
            'type'          => 'EXAM_SPEND',
            'amount'        => -10,
            'balance_after' => $user->token_balance,
            'description'   => "Custom Model Test — " . strtoupper($goal),
        ]);

        $title = strtoupper($goal) . ($subject && $subject !== 'all' ? " ({$subject})" : '') . " মডেল টেস্ট";

        $test = ModelTest::create([
            'user_id'            => $user->id,
            'title'              => $title,
            'goal'               => $goal,
            'stream'             => $user->stream,
            'subject'            => $subject !== 'all' ? $subject : null,
            'question_count'     => count($questions),
            'duration_minutes'   => $duration,
            'negative_marking'   => $negMark,
            'negative_value'     => 0.25,
            'questions_snapshot' => $questions,
            'score'              => 0,
            'total_marks'        => count($questions),
            'completed'          => false,
        ]);

        return redirect()->route('model-test.room', $test->id);
    }

    // ── Test Room UI ──────────────────────────────────────────────────────────
    public function room($id)
    {
        $test = ModelTest::where('user_id', auth()->id())->findOrFail($id);

        if ($test->completed) {
            return redirect()->route('model-test.result', $test->id);
        }

        return Inertia::render('ModelTest/Room', [
            'test' => $test,
        ]);
    }

    // ── Submit Model Test ─────────────────────────────────────────────────────
    public function submit(Request $request, $id)
    {
        $test = ModelTest::where('user_id', auth()->id())->findOrFail($id);

        if ($test->completed) {
            return redirect()->route('model-test.result', $test->id);
        }

        $userAnswers  = $request->input('answers', []); // {question_id: selected_key}
        $timeTakenSec = (int) $request->input('time_taken_sec', 0);

        $questions = $test->questions_snapshot ?? [];
        $score = 0.0;
        $negValue = $test->negative_marking ? (float) $test->negative_value : 0.0;

        foreach ($questions as $q) {
            $qId = $q['id'];
            $correctKey = strtolower($q['correct_answer']);
            if (isset($userAnswers[$qId])) {
                $userOpt = strtolower($userAnswers[$qId]);
                if ($userOpt === $correctKey) {
                    $score += 1.0;
                } else {
                    $score -= $negValue;
                }
            }
        }

        $test->update([
            'answers'        => $userAnswers,
            'score'          => max(0, $score),
            'time_taken_sec' => $timeTakenSec,
            'completed'      => true,
            'submitted_at'   => now(),
        ]);

        return redirect()->route('model-test.result', $test->id);
    }

    // ── View Result & Answer Sheet Review ─────────────────────────────────────
    public function result($id)
    {
        $test = ModelTest::where('user_id', auth()->id())->findOrFail($id);

        return Inertia::render('ModelTest/Result', [
            'test' => $test,
        ]);
    }
}
