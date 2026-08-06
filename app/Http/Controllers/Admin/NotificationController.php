<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\BroadcastNotificationMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class NotificationController extends Controller
{
    private string $projectId = 'exam-arena-6148c';

    public function index()
    {
        $stats = [
            'total'       => User::whereNotNull('fcm_token')->count(),
            'total_email' => User::whereNotNull('email')->count(),
            'by_goal'     => User::whereNotNull('fcm_token')
                ->selectRaw('exam_goal, COUNT(*) as count')
                ->groupBy('exam_goal')
                ->pluck('count', 'exam_goal'),
        ];

        return Inertia::render('Admin/Notifications', compact('stats'));
    }

    public function send(Request $request)
    {
        $data = $request->validate([
            'title'     => 'required|string|max:100',
            'body'      => 'required|string|max:500',
            'image_url' => 'nullable|url|max:500',
            'target'    => 'required|in:all,ssc,hsc,bcs,medical,engineering,bank,university,primary,other',
            'click_url' => 'nullable|string|max:200',
            'channel'   => 'required|in:push,email,both',
        ]);

        $channel   = $data['channel'];
        $pushSent  = 0;
        $emailSent = 0;
        $failed    = 0;

        // exam_goal is now stored as JSON array — use JSON_CONTAINS for filtering
        $baseQuery = $data['target'] === 'all'
            ? User::query()
            : User::whereRaw("JSON_CONTAINS(exam_goal, ?)", [json_encode($data['target'])]);

        // ── Push ──────────────────────────────────────────────────────────────
        if (in_array($channel, ['push', 'both'])) {
            $pushUsers = (clone $baseQuery)->whereNotNull('fcm_token')
                ->select('id', 'name', 'fcm_token')
                ->get();

            if ($pushUsers->isNotEmpty()) {
                $accessToken = $this->getAccessToken();
                if (!$accessToken) {
                    $failed += $pushUsers->count();
                    \Log::error('[FCM] Access token null — Firebase Admin SDK key missing or invalid.');
                } else {
                    foreach ($pushUsers as $pu) {
                        $resp = Http::withToken($accessToken)
                            ->post("https://fcm.googleapis.com/v1/projects/{$this->projectId}/messages:send", [
                                'message' => [
                                    'token'        => $pu->fcm_token,
                                    'notification' => ['title' => $data['title'], 'body' => $data['body']],
                                    'webpush'      => [
                                        'notification' => array_filter([
                                            'title' => $data['title'], 'body'  => $data['body'],
                                            'icon'  => '/favicon.png', 'image' => $data['image_url'] ?? null,
                                            'badge' => '/favicon.png', 'requireInteraction' => true,
                                        ]),
                                        'fcm_options' => ['link' => $data['click_url'] ?? '/'],
                                    ],
                                    'data' => ['url' => $data['click_url'] ?? '/', 'type' => 'broadcast'],
                                ],
                            ]);

                        if ($resp->successful()) {
                            $pushSent++;
                            \Log::info("[FCM] ✅ Push sent to {$pu->name} (id={$pu->id})");
                        } else {
                            $failed++;
                            $errCode = $resp->json('error.details.0.errorCode')
                                    ?? $resp->json('error.status')
                                    ?? 'UNKNOWN';
                            \Log::warning("[FCM] ❌ Push failed for {$pu->name} (id={$pu->id}): {$errCode} | " . $resp->body());
                            if (in_array($errCode, ['UNREGISTERED', 'INVALID_ARGUMENT'])) {
                                User::where('id', $pu->id)->update(['fcm_token' => null]);
                            }
                        }
                    }
                }
            }
        }

        // ── Email ─────────────────────────────────────────────────────────────
        if (in_array($channel, ['email', 'both'])) {
            $emails = (clone $baseQuery)->whereNotNull('email')
                ->pluck('email')->filter()->unique()->values();

            $mailable = new BroadcastNotificationMail(
                $data['title'], $data['body'],
                $data['image_url'] ?? null,
                $data['click_url'] ?? '/dashboard',
            );

            foreach ($emails as $email) {
                try {
                    Mail::to($email)->send($mailable);
                    $emailSent++;
                } catch (\Throwable) {
                    $failed++;
                }
            }
        }

        $parts = [];
        if ($pushSent > 0)  $parts[] = "📲 {$pushSent} জনকে push পাঠানো হয়েছে";
        if ($emailSent > 0) $parts[] = "📧 {$emailSent} জনকে email পাঠানো হয়েছে";
        if ($failed > 0)    $parts[] = "❌ {$failed}টি ব্যর্থ";

        return back()->with('success', $parts ? implode(' | ', $parts) : 'কোনো recipient পাওয়া যায়নি।');
    }

    private function getAccessToken(): ?string
    {
        $keyFile = base_path('exam-arena-6148c-firebase-adminsdk-fbsvc-7bc628ee97.json');
        if (!file_exists($keyFile)) return null;

        $key    = json_decode(file_get_contents($keyFile), true);
        $now    = time();
        $header = base64url_encode(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
        $claims = base64url_encode(json_encode([
            'iss'   => $key['client_email'],
            'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
            'aud'   => 'https://oauth2.googleapis.com/token',
            'iat'   => $now, 'exp' => $now + 3600,
        ]));

        $sig = "{$header}.{$claims}";
        openssl_sign($sig, $signature, openssl_pkey_get_private($key['private_key']), 'sha256WithRSAEncryption');
        $jwt = "{$sig}." . base64url_encode($signature);

        $resp = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion'  => $jwt,
        ]);

        return $resp->json('access_token');
    }
}

if (!function_exists('base64url_encode')) {
    function base64url_encode(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
