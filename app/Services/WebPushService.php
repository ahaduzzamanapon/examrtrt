<?php

namespace App\Services;

use App\Models\PushSubscription;
use App\Models\User;
use Minishlink\WebPush\MessageSentReport;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

class WebPushService
{
    private WebPush $webPush;

    public function __construct()
    {
        $auth = [
            'VAPID' => [
                'subject'    => config('app.url'),
                'publicKey'  => config('webpush.vapid.public_key'),
                'privateKey' => config('webpush.vapid.private_key'),
            ],
        ];

        $this->webPush = new WebPush($auth);
        $this->webPush->setDefaultOptions(['TTL' => 300]); // 5 minutes TTL
    }

    /**
     * Send a push notification to all subscriptions of a user.
     */
    public function sendToUser(User $user, array $payload): void
    {
        $subscriptions = PushSubscription::where('user_id', $user->id)->get();

        if ($subscriptions->isEmpty()) return;

        $json = json_encode([
            'title' => $payload['title'],
            'body'  => $payload['body'],
            'url'   => $payload['url']   ?? config('app.url'),
            'icon'  => $payload['icon']  ?? '/icons/icon-192.png',
            'badge' => $payload['badge'] ?? '/icons/badge-72.png',
            'tag'   => $payload['tag']   ?? 'arena-notif',
        ]);

        $deadEndpoints = [];

        foreach ($subscriptions as $sub) {
            $subscription = Subscription::create([
                'endpoint'        => $sub->endpoint,
                'publicKey'       => $sub->p256dh_key,
                'authToken'       => $sub->auth_token,
                'contentEncoding' => 'aes128gcm',
            ]);

            $this->webPush->queueNotification($subscription, $json);
        }

        /** @var MessageSentReport $report */
        foreach ($this->webPush->flush() as $report) {
            if ($report->isSubscriptionExpired()) {
                $deadEndpoints[] = $report->getRequest()->getUri()->__toString();
            }
        }

        // Clean up expired subscriptions
        if (!empty($deadEndpoints)) {
            PushSubscription::where('user_id', $user->id)
                ->whereIn('endpoint', $deadEndpoints)
                ->delete();
        }
    }

    /**
     * Send exam reminder to all enrolled users of an exam.
     */
    public function sendExamReminder(int $examId, string $title, string $body): void
    {
        // Get all users who joined (submitted entry fee or free pass)
        $userIds = \App\Models\ExamSubmission::where('exam_id', $examId)
            ->whereNull('submitted_at')    // not yet submitted = still registered
            ->pluck('user_id');

        $subscriptions = PushSubscription::whereIn('user_id', $userIds)->get();

        foreach ($subscriptions as $sub) {
            $user = User::find($sub->user_id);
            if ($user) {
                $this->sendToUser($user, [
                    'title' => $title,
                    'body'  => $body,
                    'url'   => config('app.url') . "/exams/{$examId}",
                    'tag'   => "exam-{$examId}",
                ]);
            }
        }
    }
}
