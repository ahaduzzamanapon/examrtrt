<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\TokenService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;

class MobileAuthController extends Controller
{
    // ── Email/Password Login ──────────────────────────────────────────────────
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['ইমেইল বা পাসওয়ার্ড ভুল।'],
            ]);
        }

        $token = $user->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $this->userData($user),
        ]);
    }

    // ── Register ──────────────────────────────────────────────────────────────
    public function register(Request $request)
    {
        $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|email|unique:users,email',
            'password'      => 'required|min:8|confirmed',
            'phone'         => 'nullable|string|max:20',
            'referral_code' => 'nullable|string',
        ]);

        $referrer = null;
        if (!empty($request->referral_code)) {
            $referrer = User::where('referral_code', trim($request->referral_code))->first();
        }

        $referralCode = strtoupper(substr(md5(uniqid(rand(), true)), 0, 8));

        $user = User::create([
            'name'              => $request->name,
            'email'             => $request->email,
            'phone'             => $request->phone,
            'password'          => Hash::make($request->password),
            'role'              => 'STUDENT',
            'referred_by'       => $referrer ? $referrer->id : null,
            'referral_code'     => $referralCode,
            'email_verified_at' => now(),
        ]);

        // Welcome bonus (50 tokens)
        app(TokenService::class)->transact($user, 'ADMIN_GRANT', 50, 'নিবন্ধন বোনাস — স্বাগতম! 🎉');

        // Referral bonus (+20 tokens for each)
        if ($referrer) {
            app(TokenService::class)->transact($referrer, 'REFERRAL_BONUS', 20, "রেফারেল বোনাস — {$user->name} যোগদান করেছেন! 🎁");
            app(TokenService::class)->transact($user, 'REFERRAL_BONUS', 20, 'রেফারেল কোড ব্যবহার বোনাস! 🎁');
        }

        $token = $user->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $this->userData($user),
        ], 201);
    }

    // ── Google Login (via google id_token) ────────────────────────────────────
    public function googleLogin(Request $request)
    {
        $request->validate([
            'id_token' => 'required|string',
        ]);

        $googleUser = null;

        // Try verifying ID Token via Google oauth2 tokeninfo endpoint
        try {
            $resp = \Illuminate\Support\Facades\Http::get('https://oauth2.googleapis.com/tokeninfo', [
                'id_token' => $request->id_token,
            ]);

            if ($resp->successful() && !empty($resp->json()['email'])) {
                $data = $resp->json();
                $googleUser = (object) [
                    'id'     => $data['sub'],
                    'name'   => $data['name'] ?? explode('@', $data['email'])[0],
                    'email'  => $data['email'],
                    'avatar' => $data['picture'] ?? null,
                ];
            }
        } catch (\Exception $e) {}

        // Fallback: Try Socialite with access_token or id_token
        if (!$googleUser) {
            try {
                $token = $request->access_token ?? $request->id_token;
                $socUser = Socialite::driver('google')->stateless()->userFromToken($token);
                $googleUser = (object) [
                    'id'     => $socUser->getId(),
                    'name'   => $socUser->getName() ?? $socUser->getEmail(),
                    'email'  => $socUser->getEmail(),
                    'avatar' => $socUser->getAvatar(),
                ];
            } catch (\Exception $e) {
                return response()->json(['message' => 'Google token যাচাই ব্যর্থ হয়েছে।'], 401);
            }
        }

        if (!$googleUser || empty($googleUser->email)) {
            return response()->json(['message' => 'Google অ্যাকাউন্ট থেকে ইমেইল পাওয়া যায়নি।'], 422);
        }

        $user = User::where('google_id', $googleUser->id)->first()
             ?? User::where('email', $googleUser->email)->first();

        if ($user) {
            if (!$user->google_id) {
                $user->update([
                    'google_id' => $googleUser->id,
                    'avatar'    => $googleUser->avatar ?? $user->avatar,
                ]);
            }
        } else {
            $user = User::create([
                'name'              => $googleUser->name,
                'email'             => $googleUser->email,
                'google_id'         => $googleUser->id,
                'avatar'            => $googleUser->avatar,
                'email_verified_at' => now(),
                'password'          => null,
                'role'              => 'STUDENT',
            ]);

            app(TokenService::class)->transact($user, 'ADMIN_GRANT', 50, 'নিবন্ধন বোনাস — স্বাগতম! 🎉');
        }

        $token = $user->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $this->userData($user),
        ]);
    }

    // ── Send OTP ──────────────────────────────────────────────────────────────
    public function sendOtp(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $otp = rand(100000, 999999);
        \Cache::put('otp_' . $request->email, $otp, now()->addMinutes(10));

        // Send email
        try {
            Mail::raw("আপনার ExamArena OTP কোড: {$otp}", function ($m) use ($request) {
                $m->to($request->email)->subject('ExamArena OTP যাচাই');
            });
        } catch (\Exception $e) {}

        return response()->json(['message' => 'OTP পাঠানো হয়েছে।']);
    }

    // ── Verify OTP ────────────────────────────────────────────────────────────
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp'   => 'required|digits:6',
        ]);

        $stored = \Cache::get('otp_' . $request->email);
        if (!$stored || (string)$stored !== (string)$request->otp) {
            return response()->json(['message' => 'OTP ভুল বা মেয়াদোত্তীর্ণ।'], 422);
        }

        \Cache::forget('otp_' . $request->email);
        return response()->json(['message' => 'OTP যাচাই সফল।']);
    }

    // ── Forgot Password ───────────────────────────────────────────────────────
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);
        \Password::sendResetLink($request->only('email'));
        return response()->json(['message' => 'পাসওয়ার্ড রিসেট লিংক ইমেইলে পাঠানো হয়েছে।']);
    }

    // ── Logout ────────────────────────────────────────────────────────────────
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'লগআউট সফল।']);
    }

    // ── Get current user ──────────────────────────────────────────────────────
    public function user(Request $request)
    {
        return response()->json(['user' => $this->userData($request->user())]);
    }

    // ── Save onboarding (exam_goal) ───────────────────────────────────────────
    public function saveOnboarding(Request $request)
    {
        $request->validate([
            'exam_goal' => 'required|string',
            'stream'    => 'nullable|string',
        ]);

        $user = $request->user();
        $cleanGoal = str_replace(['[', ']', '"', "'", '\\'], '', $request->exam_goal);
        $user->update([
            'exam_goal' => $cleanGoal,
            'stream'    => $request->stream,
        ]);

        return response()->json(['user' => $this->userData($user)]);
    }

    // ── Helper: User data array ───────────────────────────────────────────────
    private function userData(User $user): array
    {
        $rawGoal = $user->exam_goal;
        if (is_array($rawGoal)) {
            $cleanGoal = implode(',', array_filter(array_map('trim', $rawGoal)));
        } else {
            $cleanGoal = str_replace(['[', ']', '"', "'", '\\'], '', (string)$rawGoal);
        }

        return [
            'id'            => $user->id,
            'name'          => $user->name,
            'email'         => $user->email,
            'phone'         => $user->phone,
            'avatar'        => $user->avatar,
            'role'          => $user->role,
            'exam_goal'     => $cleanGoal,
            'stream'        => $user->stream,
            'token_balance' => (int) $user->token_balance,
            'wallet_balance'=> (float) $user->wallet_balance,
            'google_id'     => $user->google_id,
            'has_password'  => !is_null($user->password),
        ];
    }
}
