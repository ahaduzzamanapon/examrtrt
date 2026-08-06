<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Generic in-app toast notification for a specific user.
 * Used for: exam reminders, result published, dispute resolved, etc.
 */
class UserNotificationEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int    $userId,
        public readonly string $type,     // 'exam_reminder'|'result'|'dispute'|'referral'|'streak'|'general'
        public readonly string $title,
        public readonly string $body,
        public readonly ?string $actionUrl = null,
        public readonly ?string $icon      = null,
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel('user.' . $this->userId)];
    }

    public function broadcastAs(): string
    {
        return 'notification';
    }

    public function broadcastWith(): array
    {
        return [
            'id'         => uniqid('notif_'),
            'type'       => $this->type,
            'title'      => $this->title,
            'body'       => $this->body,
            'action_url' => $this->actionUrl,
            'icon'       => $this->icon,
            'created_at' => now()->toISOString(),
        ];
    }
}
