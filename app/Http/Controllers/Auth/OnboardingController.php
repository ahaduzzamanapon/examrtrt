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

        // Skip onboarding if exam_goal already set
        if ($user && $user->exam_goal) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Auth/Onboarding');
    }

    /** Save exam_goal (and optionally FCM token) */
    public function save(Request $request)
    {
        $request->validate([
            'exam_goal' => 'required|string|in:ssc,hsc,bcs,medical,engineering,bank,university,primary,other',
            'fcm_token' => 'nullable|string|max:500',
        ]);

        $user = Auth::user();
        $data = ['exam_goal' => $request->exam_goal];

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
