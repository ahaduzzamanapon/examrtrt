<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class NotificationController extends Controller
{
    private string $projectId = 'exam-arena-6148c';

    // ── Show admin notification page ──────────────────────────────────────────
    public function index()
    {
        $stats = [
            'total'       => User::whereNotNull('fcm_token')->count(),
            'by_goal'     => User::whereNotNull('fcm_token')
                ->selectRaw('exam_goal, COUNT(*) as count')
                ->groupBy('exam_goal')
                ->pluck('count', 'exam_goal'),
        ];

        return Inertia::render('Admin/Notifications', compact('stats'));
    }

    // ── Send notification ─────────────────────────────────────────────────────
    public function send(Request $request)
    {
        $data = $request->validate([
            'title'     => 'required|string|max:100',
            'body'      => 'required|string|max:500',
            'image_url' => 'nullable|url|max:500',
            'target'    => 'required|in:all,ssc,hsc,bcs,medical,engineering,bank,university,primary,other',
            'click_url' => 'nullable|string|max:200',
        ]);

        // Get FCM tokens for target audience
        $query = User::whereNotNull('fcm_token');
        if ($data['target'] !== 'all') {
            $query->where('exam_goal', $data['target']);
        }

        $tokens = $query->pluck('fcm_token')->filter()->unique()->values()->toArray();

        if (empty($tokens)) {
            return back()->with('error', 'কোনো FCM token পাওয়া যায়নি।');
        }

        // Get access token
        $accessToken = $this->getAccessToken();
        if (!$accessToken) {
            return back()->with('error', 'Firebase authentication ব্যর্থ।');
        }

        $sent    = 0;
        $failed  = 0;
        $batches = array_chunk($tokens, 500); // FCM limit: 500 per batch

        foreach ($batches as $batch) {
            foreach ($batch as $token) {
                $message = [
                    'message' => [
                        'token'        => $token,
                        'notification' => [
                            'title' => $data['title'],
                            'body'  => $data['body'],
                        ],
                        'webpush' => [
                            'notification' => array_filter([
                                'title' => $data['title'],
                                'body'  => $data['body'],
                                'icon'  => '/favicon.png',
                                'image' => $data['image_url'] ?? null,
                                'badge' => '/favicon.png',
                                'requireInteraction' => true,
                            ]),
                            'fcm_options' => [
                                'link' => $data['click_url'] ?? '/',
                            ],
                        ],
                        'android' => [
                            'notification' => array_filter([
                                'title'      => $data['title'],
                                'body'       => $data['body'],
                                'image'      => $data['image_url'] ?? null,
                                'icon'       => 'notification_icon',
                                'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                            ]),
                        ],
                        'data' => [
                            'url'  => $data['click_url'] ?? '/',
                            'type' => 'broadcast',
                        ],
                    ],
                ];

                $response = Http::withToken($accessToken)
                    ->post("https://fcm.googleapis.com/v1/projects/{$this->projectId}/messages:send", $message);

                if ($response->successful()) {
                    $sent++;
                } else {
                    $failed++;
                    // Remove invalid tokens
                    $err = $response->json('error.details.0.errorCode') ?? '';
                    if (in_array($err, ['UNREGISTERED', 'INVALID_ARGUMENT'])) {
                        User::where('fcm_token', $token)->update(['fcm_token' => null]);
                    }
                }
            }
        }

        return back()->with('success', "সফল: {$sent} জনকে পাঠানো হয়েছে। ব্যর্থ: {$failed}।");
    }

    // ── Generate FCM access token from service account ────────────────────────
    private function getAccessToken(): ?string
    {
        $keyFile = base_path('exam-arena-6148c-firebase-adminsdk-fbsvc-7bc628ee97.json');
        if (!file_exists($keyFile)) return null;

        $key = json_decode(file_get_contents($keyFile), true);

        $now    = time();
        $header = base64url_encode(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
        $claims = base64url_encode(json_encode([
            'iss'   => $key['client_email'],
            'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
            'aud'   => 'https://oauth2.googleapis.com/token',
            'iat'   => $now,
            'exp'   => $now + 3600,
        ]));

        $signingInput = "{$header}.{$claims}";
        $pkeyId = openssl_pkey_get_private($key['private_key']);
        openssl_sign($signingInput, $signature, $pkeyId, 'sha256WithRSAEncryption');
        $jwt = "{$signingInput}." . base64url_encode($signature);

        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion'  => $jwt,
        ]);

        return $response->json('access_token');
    }
}

// Helper: URL-safe base64 encode
if (!function_exists('base64url_encode')) {
    function base64url_encode(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
