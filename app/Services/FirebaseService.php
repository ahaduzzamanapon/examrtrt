<?php

namespace App\Services;

use App\Models\User;
use Google\Client as GoogleClient;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Firebase Cloud Messaging (FCM) Service
 * Supports both Web (browser) and Mobile (Android/iOS) push notifications.
 * Uses FCM HTTP v1 API with Service Account authentication.
 */
class FirebaseService
{
    private string $projectId;
    private ?string $accessToken = null;
    private int $tokenExpiresAt = 0;

    public function __construct()
    {
        $this->projectId = config('firebase.project_id');
    }

    /**
     * Get OAuth2 access token from service account credentials.
     */
    private function getAccessToken(): string
    {
        if ($this->accessToken && time() < $this->tokenExpiresAt - 60) {
            return $this->accessToken;
        }

        $credentialsPath = base_path(config('firebase.credentials'));

        if (!file_exists($credentialsPath)) {
            Log::warning('[FCM] Service account JSON not found at: ' . $credentialsPath);
            return '';
        }

        $client = new GoogleClient();
        $client->setAuthConfig($credentialsPath);
        $client->addScope('https://www.googleapis.com/auth/firebase.messaging');
        $client->useApplicationDefaultCredentials();

        $token = $client->fetchAccessTokenWithAssertion();

        $this->accessToken    = $token['access_token'] ?? '';
        $this->tokenExpiresAt = time() + ($token['expires_in'] ?? 3600);

        return $this->accessToken;
    }

    /**
     * Send FCM notification to a single FCM token (web or mobile).
     */
    public function sendToToken(string $fcmToken, array $payload): bool
    {
        $accessToken = $this->getAccessToken();
        if (!$accessToken) return false;

        $body = [
            'message' => [
                'token'        => $fcmToken,
                'notification' => [
                    'title' => $payload['title'],
                    'body'  => $payload['body'],
                ],
                'data'         => array_map('strval', $payload['data'] ?? []),
                'webpush'      => [
                    'headers'      => ['TTL' => '300'],
                    'notification' => [
                        'title'   => $payload['title'],
                        'body'    => $payload['body'],
                        'icon'    => $payload['icon']  ?? '/icons/icon-192.png',
                        'badge'   => $payload['badge'] ?? '/icons/badge-72.png',
                        'click_action' => $payload['url'] ?? config('app.url'),
                        'tag'     => $payload['tag']   ?? 'arena-notif',
                        'renotify'=> true,
                        'vibrate' => [200, 100, 200],
                        'actions' => [
                            ['action' => 'open',    'title' => 'খুলুন'],
                            ['action' => 'dismiss', 'title' => 'বাতিল'],
                        ],
                    ],
                ],
                'android'      => [
                    'notification' => [
                        'channel_id' => 'arena_default',
                        'priority'   => 'high',
                        'sound'      => 'default',
                        'icon'       => 'ic_notification',
                        'color'      => '#4d6fff',
                    ],
                    'priority' => 'high',
                ],
                'apns' => [
                    'payload' => [
                        'aps' => [
                            'alert' => ['title' => $payload['title'], 'body' => $payload['body']],
                            'sound' => 'default',
                            'badge' => 1,
                        ],
                    ],
                ],
            ],
        ];

        $response = Http::withToken($accessToken)
            ->post("https://fcm.googleapis.com/v1/projects/{$this->projectId}/messages:send", $body);

        if (!$response->successful()) {
            Log::error('[FCM] Send failed', [
                'token'  => substr($fcmToken, 0, 20) . '...',
                'status' => $response->status(),
                'error'  => $response->json(),
            ]);
            return false;
        }

        return true;
    }

    /**
     * Send to all FCM tokens of a user (web + mobile).
     */
    public function sendToUser(User $user, array $payload): void
    {
        $subscriptions = \App\Models\PushSubscription::where('user_id', $user->id)
            ->whereNotNull('fcm_token')
            ->get();

        if ($subscriptions->isEmpty()) return;

        $deadTokens = [];

        foreach ($subscriptions as $sub) {
            $sent = $this->sendToToken($sub->fcm_token, $payload);

            // If token is invalid/unregistered, mark for cleanup
            if (!$sent) {
                $deadTokens[] = $sub->fcm_token;
            }
        }

        if (!empty($deadTokens)) {
            \App\Models\PushSubscription::where('user_id', $user->id)
                ->whereIn('fcm_token', $deadTokens)
                ->delete();
        }
    }

    /**
     * Send exam reminder to all registered participants.
     */
    public function sendExamReminder(int $examId, string $title, string $body): void
    {
        $userIds = \App\Models\ExamSubmission::where('exam_id', $examId)
            ->whereNull('submitted_at')
            ->pluck('user_id');

        $subscriptions = \App\Models\PushSubscription::whereIn('user_id', $userIds)
            ->whereNotNull('fcm_token')
            ->get();

        foreach ($subscriptions as $sub) {
            $this->sendToToken($sub->fcm_token, [
                'title' => $title,
                'body'  => $body,
                'url'   => config('app.url') . "/exams/{$examId}",
                'tag'   => "exam-{$examId}",
                'data'  => ['exam_id' => (string)$examId, 'type' => 'exam_reminder'],
            ]);
        }
    }
}
