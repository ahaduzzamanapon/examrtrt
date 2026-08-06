<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SurvivalController extends Controller
{
    // ── Survival Home & Top Leaderboard ───────────────────────────────────────
    public function index()
    {
        $user = auth()->user();

        // Top survival players today/overall based on highest score recorded (we can use existing user fields or practice stats)
        $topPlayers = User::select('id', 'name', 'avatar', 'wallet_balance')
            ->orderByDesc('id')
            ->limit(10)
            ->get();

        return Inertia::render('Survival/Index', [
            'topPlayers' => $topPlayers,
            'user'       => $user,
        ]);
    }

    // ── Fetch batch of random questions for survival ─────────────────────────
    public function fetchQuestions(Request $request)
    {
        $user = auth()->user();
        $goal = is_array($user->exam_goal) ? ($user->exam_goal[0] ?? 'bcs') : ($user->exam_goal ?? 'bcs');

        $query = Question::where('is_active', true);

        if (in_array($goal, ['hsc', 'ssc']) && $user->stream) {
            $query->where(function ($q) use ($user) {
                $q->where('stream', $user->stream)->orWhere('stream', 'general');
            });
        }

        $questions = $query->inRandomOrder()->limit(30)
            ->get(['id', 'question_text', 'options', 'correct_answer', 'explanation', 'subject', 'difficulty_level'])
            ->toArray();

        if (empty($questions)) {
            $questions = Question::where('is_active', true)
                ->inRandomOrder()
                ->limit(30)
                ->get(['id', 'question_text', 'options', 'correct_answer', 'explanation', 'subject', 'difficulty_level'])
                ->toArray();
        }

        return response()->json([
            'questions' => $questions,
        ]);
    }

    public function recordLoss(Request $request)
    {
        $user = auth()->user();

        if ($user->token_balance >= 1) {
            $user->decrement('token_balance', 1);

            \App\Models\TokenTransaction::create([
                'user_id'       => $user->id,
                'type'          => 'PRACTICE_SPEND',
                'amount'        => -1,
                'balance_after' => $user->token_balance,
                'description'   => 'Survival Deathmatch Loss (-1 Token)',
            ]);
        }

        return response()->json([
            'success'       => true,
            'token_balance' => (int) $user->token_balance,
        ]);
    }
}
