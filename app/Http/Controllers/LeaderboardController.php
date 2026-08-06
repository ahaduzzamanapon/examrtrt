<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ExamSubmission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaderboardController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->get('type', 'global'); // global | contest

        if ($type === 'contest') {
            // Rank by exam submission score
            $leaders = ExamSubmission::with('user:id,name,avatar,phone')
                ->where('is_disqualified', false)
                ->orderByDesc('score')
                ->orderBy('time_taken_seconds')
                ->limit(50)
                ->get();
        } else {
            // Rank users by wallet/activity/points
            $leaders = User::select('id', 'name', 'avatar', 'wallet_balance', 'exam_goal', 'stream')
                ->orderByDesc('wallet_balance')
                ->orderByDesc('id')
                ->limit(50)
                ->get();
        }

        $userRank = 1;

        return Inertia::render('Leaderboard/Index', [
            'leaders'  => $leaders,
            'type'     => $type,
            'userRank' => $userRank,
        ]);
    }
}
