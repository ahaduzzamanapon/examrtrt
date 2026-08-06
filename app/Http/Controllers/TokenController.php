<?php

namespace App\Http\Controllers;

use App\Models\TokenPackage;
use App\Models\User;
use App\Services\TokenService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TokenController extends Controller
{
    public function index(TokenService $tokenService)
    {
        $user = auth()->user();

        // Get active packages or fallback default packages
        $packages = TokenPackage::where('is_active', true)->orderBy('price')->get();

        if ($packages->isEmpty()) {
            $packages = collect([
                ['id' => 1, 'name' => 'স্টার্টার প্যাক', 'tokens' => 50,  'price' => 20, 'badge' => null],
                ['id' => 2, 'name' => 'পপুলার প্যাক',   'tokens' => 150, 'price' => 50, 'badge' => '🔥 সেরা পছন্দ'],
                ['id' => 3, 'name' => 'প্রো প্যাক',      'tokens' => 350, 'price' => 100,'badge' => '⚡ সর্বোচ্চ ভ্যালু'],
            ]);
        }

        $referralCode = $user->referral_code ?? strtoupper(substr(md5($user->id . 'examarena'), 0, 8));
        if (!$user->referral_code) {
            $user->update(['referral_code' => $referralCode]);
        }

        $referralLink = url("/register?ref={$referralCode}");

        return Inertia::render('TokenStore/Index', [
            'tokenBalance' => (int) $user->token_balance,
            'walletBalance'=> (float) $user->wallet_balance,
            'packages'     => $packages,
            'referralCode' => $referralCode,
            'referralLink' => $referralLink,
            'status'       => $tokenService->todayStatus($user),
        ]);
    }

    public function buyPackage(Request $request, TokenService $tokenService)
    {
        $user = auth()->user();
        $packageId = (int) $request->input('package_id');

        // Check package or use preset
        $presets = [
            1 => ['tokens' => 50,  'price' => 20,  'name' => 'স্টার্টার প্যাক'],
            2 => ['tokens' => 150, 'price' => 50,  'name' => 'পপুলার প্যাক'],
            3 => ['tokens' => 350, 'price' => 100, 'name' => 'প্রো প্যাক'],
        ];

        $pkg = TokenPackage::find($packageId);
        $tokens = $pkg ? $pkg->tokens : ($presets[$packageId]['tokens'] ?? 50);
        $price  = $pkg ? $pkg->price  : ($presets[$packageId]['price'] ?? 20);
        $name   = $pkg ? $pkg->name   : ($presets[$packageId]['name'] ?? 'টোকেন প্যাক');

        if ($user->wallet_balance < $price) {
            return back()->withErrors(['wallet' => "ওয়ালেটে পর্যাপ্ত টাকা নেই। দরকার ৳{$price}, আছে ৳{$user->wallet_balance}। আগে ওয়ালেটে ডিপোজিট করুন।"]);
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($user, $price, $tokens, $name, $packageId) {
            $user->decrement('wallet_balance', $price);
            $user->increment('token_balance', $tokens);

            \App\Models\WalletTransaction::create([
                'user_id'       => $user->id,
                'type'          => 'withdrawal',
                'gross_amount'  => $price,
                'fee'           => 0,
                'net_amount'    => $price,
                'status'        => 'approved',
                'payment_method'=> 'wallet',
                'trx_id'        => 'TOKEN-' . strtoupper(\Illuminate\Support\Str::random(8)),
                'admin_note'    => "{$tokens} Tokens purchased ({$name})",
            ]);

            \App\Models\TokenTransaction::create([
                'user_id'       => $user->id,
                'type'          => 'PURCHASE',
                'amount'        => $tokens,
                'balance_after' => $user->token_balance,
                'description'   => "টোকেন কেনা: {$name} (৳{$price})",
            ]);
        });

        return back()->with('success', "🎉 সফলভাবে {$tokens} টোকেন কেনা হয়েছে!");
    }

    public function claimDailyBonus(TokenService $tokenService)
    {
        $result = $tokenService->claimDailyBonus(auth()->user());

        if (!$result['success']) {
            return back()->withErrors(['bonus' => $result['message']]);
        }

        return back()->with('success', $result['message']);
    }
}
