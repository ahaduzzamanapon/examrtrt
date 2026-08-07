<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OnboardingController extends Controller
{
    /** Show onboarding page */
    public function show()
    {
        $user = Auth::user();

        if ($user && !empty($user->exam_goal)) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Auth/Onboarding');
    }

    /** Save exam_goal (multiple comma-separated string or array) and stream/department */
    public function save(Request $request)
    {
        $user = Auth::user();

        $rawGoals = $request->input('exam_goals') ?? $request->input('exam_goal');
        if (is_array($rawGoals)) {
            $goals = implode(',', array_map('trim', $rawGoals));
        } else {
            $goals = trim((string)$rawGoals);
        }

        $data = [];
        if (!empty($goals)) {
            $data['exam_goal'] = strtoupper($goals);
        }

        if ($request->filled('stream')) {
            $data['stream'] = trim($request->stream);
        }

        if ($request->filled('fcm_token')) {
            $data['fcm_token'] = $request->fcm_token;
        }

        if (!empty($data)) {
            $user->update($data);
        }

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json([
                'ok' => true,
                'message' => 'লক্ষ্য ও বিভাগ সেভ হয়েছে।',
                'user' => [
                    'id'             => $user->id,
                    'name'           => $user->name,
                    'email'          => $user->email,
                    'phone'          => $user->phone,
                    'avatar'         => $user->avatar,
                    'role'           => $user->role,
                    'exam_goal'      => $user->exam_goal,
                    'stream'         => $user->stream,
                    'token_balance'  => (int)$user->token_balance,
                    'wallet_balance' => (float)$user->wallet_balance,
                    'google_id'      => $user->google_id,
                    'has_password'   => !is_null($user->password),
                    'referral_code'  => $user->referral_code,
                ],
            ]);
        }

        return redirect()->route('dashboard');
    }
}
