<?php

namespace App\Notifications;

use App\Events\UserNotificationEvent;
use App\Models\Exam;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

/**
 * Sent 15 minutes and 5 minutes before an exam starts.
 * Triggers both Pusher in-app notification AND browser Web Push.
 */
class ExamStartingSoon extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Exam   $exam,
        public readonly int    $minutesBefore, // 15 or 5
    ) {}

    public function via(object $notifiable): array
    {
        return ['database']; // stored in DB; Pusher push done via UserNotificationEvent
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'       => 'exam_reminder',
            'exam_id'    => $this->exam->id,
            'exam_title' => $this->exam->title,
            'title'      => "⏰ {$this->minutesBefore} মিনিট বাকি!",
            'body'       => "\"{$this->exam->title}\" শুরু হতে আর মাত্র {$this->minutesBefore} মিনিট। এখনই জয়েন করুন!",
            'action_url' => "/exams/{$this->exam->id}",
        ];
    }

    /**
     * After storing in DB, also fire Pusher + browser push.
     */
    public function handle(object $notifiable): void
    {
        $data = $this->toDatabase($notifiable);

        // 1. Pusher in-app notification
        event(new UserNotificationEvent(
            userId:    $notifiable->id,
            type:      'exam_reminder',
            title:     $data['title'],
            body:      $data['body'],
            actionUrl: $data['action_url'],
            icon:      '⏰',
        ));

        // 2. Browser Web Push (via service)
        app(\App\Services\WebPushService::class)->sendToUser($notifiable, [
            'title' => $data['title'],
            'body'  => $data['body'],
            'url'   => config('app.url') . $data['action_url'],
            'icon'  => '/icons/icon-192.png',
        ]);
    }
}
