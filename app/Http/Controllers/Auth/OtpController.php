<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;

class OtpController extends Controller
{
    public function send(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'name'  => 'required|string',
        ]);

        if (\App\Models\User::where('email', $request->email)->exists()) {
            return response()->json(['message' => 'এই ইমেইলে ইতিমধ্যে একটি একাউন্ট আছে।'], 422);
        }

        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        Cache::put('reg_otp_' . $request->email, $otp, 1800); // 30 min

        try {
            Mail::send('emails.otp', ['otp' => $otp, 'name' => $request->name], function ($m) use ($request, $otp) {
                $m->to($request->email)
                  ->subject("NXLY Exam Arena — কোড: {$otp}");
            });
        } catch (\Exception $e) {
            // Log but still return success if in dev
            if (config('app.debug')) {
                \Log::info("OTP for {$request->email}: {$otp}");
                return response()->json(['message' => 'OTP পাঠানো হয়েছে (dev: check log)', 'otp_debug' => $otp]);
            }
            return response()->json(['message' => 'ইমেইল পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।'], 500);
        }

        return response()->json(['message' => 'OTP পাঠানো হয়েছে।']);
    }

    public function verify(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp'   => 'required|string',
        ]);

        $stored = Cache::get('reg_otp_' . $request->email);

        if (!$stored || $stored !== $request->otp) {
            return response()->json(['message' => 'ভুল কোড। আবার চেষ্টা করুন।'], 422);
        }

        Cache::forget('reg_otp_' . $request->email);
        Cache::put('email_verified_' . $request->email, true, 1800);

        return response()->json(['message' => 'ইমেইল যাচাই সম্পন্ন!']);
    }
}
