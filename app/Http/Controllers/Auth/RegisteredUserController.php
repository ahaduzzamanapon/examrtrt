<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name'      => 'required|string|max:255',
            'email'     => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password'  => ['required', 'confirmed', Rules\Password::defaults()],
            'exam_goal' => 'nullable|string|max:50',
        ]);

        // OTP must have been verified in step 2
        if (!Cache::get('email_verified_' . $request->email)) {
            return back()->withErrors(['email' => 'ইমেইল যাচাই করা হয়নি। আবার চেষ্টা করুন।']);
        }
        Cache::forget('email_verified_' . $request->email);

        $refCode = $request->input('ref') ?? $request->input('referral_code');
        $referrer = null;
        if ($refCode) {
            $referrer = User::where('referral_code', $refCode)->first();
        }

        $myRefCode = strtoupper(substr(md5(uniqid(rand(), true)), 0, 8));

        $user = User::create([
            'name'          => $request->name,
            'email'         => $request->email,
            'password'      => Hash::make($request->password),
            'exam_goal'     => $request->exam_goal,
            'referral_code' => $myRefCode,
            'referred_by'   => $referrer ? $referrer->id : null,
        ]);

        // Mark email as verified (OTP already confirmed) & give 50 signup bonus tokens
        $user->markEmailAsVerified();
        $user->increment('token_balance', 50);

        // Referral reward: 10 tokens to referrer & 10 tokens to new user
        if ($referrer) {
            $referrer->increment('token_balance', 10);
            \App\Models\TokenTransaction::create([
                'user_id'       => $referrer->id,
                'type'          => 'REFERRAL',
                'amount'        => 10,
                'balance_after' => $referrer->token_balance,
                'description'   => "{$user->name} আপনার রেফারেল পেয়ে যোগ দিয়েছেন (+১০ টোকেন)",
            ]);

            $user->increment('token_balance', 10);
            \App\Models\TokenTransaction::create([
                'user_id'       => $user->id,
                'type'          => 'REFERRAL',
                'amount'        => 10,
                'balance_after' => $user->token_balance,
                'description'   => "রেফারেল বোনাস (+১০ টোকেন)",
            ]);
        }

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
