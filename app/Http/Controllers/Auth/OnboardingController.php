<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OnboardingController extends Controller
{
    private const VALID_GOALS = ['ssc','hsc','bcs','medical','engineering','bank','university','primary','other'];

    /** Show onboarding page */
    public function show()
    {
        $user = Auth::user();

        // Skip onboarding if exam_goal already set
        if ($user && !empty($user->exam_goal)) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Auth/Onboarding');
    }

    /** Save exam_goals (array) and optionally FCM token */
    public function save(Request $request)
    {
        $request->validate([
            'exam_goals'  => 'required|array|min:1',
            'exam_goals.*'=> 'required|string|in:' . implode(',', self::VALID_GOALS),
            'fcm_token'   => 'nullable|string|max:500',
        ]);

        $user = Auth::user();

        $data = ['exam_goal' => $request->exam_goals]; // model cast → auto JSON encode


        if ($request->filled('fcm_token')) {
            $data['fcm_token'] = $request->fcm_token;
        }

        $user->update($data);

        if ($request->expectsJson()) {
            return response()->json(['ok' => true]);
        }

        return redirect()->route('dashboard');
    }
}
