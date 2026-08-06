<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Fired when a user sends a 1v1 battle invite.
 * Broadcasts instantly to the receiver's private channel.
 */
class BattleInviteEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int    $receiverId,
        public readonly int    $inviteId,
        public readonly string $senderName,
        public readonly string $senderAvatar,
        public readonly float  $stakeAmount,
        public readonly string $examType,   // e.g. "BCS"
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel('user.' . $this->receiverId)];
    }

    public function broadcastAs(): string
    {
        return 'battle.invite';
    }

    public function broadcastWith(): array
    {
        return [
            'invite_id'    => $this->inviteId,
            'sender_name'  => $this->senderName,
            'sender_avatar'=> $this->senderAvatar,
            'stake_amount' => $this->stakeAmount,
            'exam_type'    => $this->examType,
            'expires_at'   => now()->addSeconds(30)->toISOString(),
        ];
    }
}
