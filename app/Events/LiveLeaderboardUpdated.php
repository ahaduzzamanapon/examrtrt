<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Fired when a submission lands during a live contest.
 * Updates leaderboard in real-time for all participants.
 */
class LiveLeaderboardUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int   $examId,
        public readonly array $leaderboard,  // top N entries [{user_id, name, avatar, score, rank, time_taken_sec}]
        public readonly int   $totalSubmissions,
    ) {}

    public function broadcastOn(): array
    {
        return [new PresenceChannel('exam.' . $this->examId)];
    }

    public function broadcastAs(): string
    {
        return 'leaderboard.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'leaderboard'       => $this->leaderboard,
            'total_submissions' => $this->totalSubmissions,
            'updated_at'        => now()->toISOString(),
        ];
    }
}
