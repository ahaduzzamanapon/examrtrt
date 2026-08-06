<?php

namespace App\Jobs;

use App\Events\LiveLeaderboardUpdated;
use App\Models\Exam;
use App\Models\ExamSubmission;
use App\Models\WalletTransaction;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessExamResults implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $examId) {}

    public function handle(): void
    {
        $exam = Exam::find($this->examId);

        if (!$exam || $exam->status === 'COMPLETED') {
            return;
        }

        DB::transaction(function () use ($exam) {
            // 1. Mark exam as PROCESSING
            $exam->update(['status' => 'PROCESSING']);

            // 2. Rank submissions: highest score, then fastest time
            $submissions = ExamSubmission::where('exam_id', $exam->id)
                ->whereNotNull('score')
                ->where('is_disqualified', false)
                ->orderByDesc('score')
                ->orderBy('time_taken_sec')
                ->lockForUpdate()
                ->get();

            // Assign rank (ties get same rank if score AND time match)
            $rank = 1;
            foreach ($submissions as $i => $sub) {
                if ($i > 0) {
                    $prev = $submissions[$i - 1];
                    $sameScore = (float)$sub->score === (float)$prev->score;
                    $sameTime  = (int)$sub->time_taken_sec === (int)$prev->time_taken_sec;
                    if (!($sameScore && $sameTime)) {
                        $rank = $i + 1;
                    }
                }
                $sub->rank = $rank;
                $sub->save();
            }

            // 3. Distribute prizes (PRD: PRIZE_PAYOUT, split on tie)
            $prizePool    = $exam->prizePool();
            $distribution = $exam->prize_distribution ?? [];

            if ($prizePool > 0 && count($distribution) > 0) {
                foreach ($distribution as $tier) {
                    $rankPos = $tier['rank'] ?? null;
                    $percent = $tier['percent'] ?? 0;

                    if (!$rankPos || $percent <= 0) continue;

                    // Find ALL winners at this rank (tie = split)
                    $winners   = $submissions->where('rank', $rankPos)->values();
                    if ($winners->isEmpty()) continue;

                    $tierPrize = round($prizePool * $percent / 100, 2);
                    $perWinner = round($tierPrize / $winners->count(), 2);

                    foreach ($winners as $winner) {
                        User::where('id', $winner->user_id)
                            ->lockForUpdate()
                            ->increment('wallet_balance', $perWinner);

                        WalletTransaction::create([
                            'user_id'      => $winner->user_id,
                            'type'         => 'PRIZE_PAYOUT',
                            'gross_amount' => $perWinner,
                            'fee'          => 0,
                            'net_amount'   => $perWinner,
                            'status'       => 'APPROVED',
                            'trx_id'       => 'PRIZE-EXAM-' . $exam->id . '-RANK-' . $rankPos,
                        ]);
                    }
                }
            }

            // 4. Mark COMPLETED
            $exam->update(['status' => 'COMPLETED']);

            // 5. Broadcast final leaderboard
            $leaderboard = ExamSubmission::with('user:id,name,avatar')
                ->where('exam_id', $exam->id)
                ->whereNotNull('score')
                ->where('is_disqualified', false)
                ->orderBy('rank')
                ->limit(50)
                ->get()
                ->map(fn($s) => [
                    'rank'           => $s->rank,
                    'name'           => $s->user?->name ?? 'Anonymous',
                    'avatar'         => $s->user?->avatar,
                    'score'          => $s->score,
                    'time_taken_sec' => $s->time_taken_sec,
                ])
                ->toArray();

            $totalSubs = $submissions->count();
            broadcast(new LiveLeaderboardUpdated($exam->id, $leaderboard, $totalSubs));
        });

        Log::info("ProcessExamResults completed for exam #{$this->examId}");
    }
}
