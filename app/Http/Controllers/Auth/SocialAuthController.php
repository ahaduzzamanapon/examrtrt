<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\TokenService;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Redirect to Google OAuth.
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle Google callback — login or register.
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Exception $e) {
            return redirect()->route('login')->withErrors(['google' => 'Google লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।']);
        }

        // Find by Google ID first, then by email
        $user = User::where('google_id', $googleUser->getId())->first()
             ?? User::where('email', $googleUser->getEmail())->first();

        if ($user) {
            // Update Google ID if not set
            if (!$user->google_id) {
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'avatar'    => $googleUser->getAvatar() ?? $user->avatar,
                ]);
            }
        } else {
            // New user — create account
            $user = User::create([
                'name'              => $googleUser->getName(),
                'email'             => $googleUser->getEmail(),
                'google_id'         => $googleUser->getId(),
                'avatar'            => $googleUser->getAvatar(),
                'email_verified_at' => now(),
                'password'          => null, // Google users have no password
                'role'              => 'STUDENT',
            ]);

            // Grant 50 welcome tokens to new users
            app(TokenService::class)->transact(
                $user,
                'ADMIN_GRANT',
                50,
                'নিবন্ধন বোনাস — স্বাগতম! 🎉'
            );
        }

        Auth::login($user, remember: true);

        // New user (no exam_goal) → onboarding
        if (!$user->exam_goal) {
            return redirect()->route('onboarding');
        }

        return redirect()->intended(route('dashboard'));
    }
}
