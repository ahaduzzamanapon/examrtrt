<?php

namespace App\Http\Controllers;

use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WalletController extends Controller
{
    // ── Wallet page ───────────────────────────────────────────────────────────
    public function index()
    {
        $user = auth()->user();

        $transactions = WalletTransaction::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get(['id', 'type', 'gross_amount', 'net_amount', 'fee', 'status', 'payment_method', 'payment_number', 'trx_id', 'admin_note', 'created_at']);

        return Inertia::render('Wallet/Index', [
            'balance'      => (float) $user->wallet_balance,
            'transactions' => $transactions,
        ]);
    }

    // ── Submit deposit request ────────────────────────────────────────────────
    public function depositStore(Request $request)
    {
        $settings = \App\Models\AppSetting::get('deposit_min', 20);

        $request->validate([
            'payment_method'  => 'required|in:bkash,nagad,rocket',
            'gross_amount'    => "required|numeric|min:{$settings}|max:10000",
            'trx_id'          => 'required|string|min:6|max:30',
            'payment_number'  => 'required|string|min:11|max:15',
        ]);

        // Prevent duplicate TrxID
        $exists = WalletTransaction::where('trx_id', $request->trx_id)
            ->where('type', 'deposit')
            ->exists();
        if ($exists) {
            return back()->withErrors(['trx_id' => 'এই TrxID আগেই ব্যবহার হয়েছে।']);
        }

        WalletTransaction::create([
            'user_id'        => auth()->id(),
            'type'           => 'deposit',
            'gross_amount'   => $request->gross_amount,
            'fee'            => 0,
            'net_amount'     => $request->gross_amount,
            'trx_id'         => $request->trx_id,
            'payment_method' => $request->payment_method,
            'payment_number' => $request->payment_number,
            'status'         => 'pending',
        ]);

        return back()->with('success', 'ডিপোজিট রিকোয়েস্ট পাঠানো হয়েছে। অ্যাডমিন যাচাই করলে ব্যালেন্স যোগ হবে।');
    }

    // ── Submit withdrawal request ─────────────────────────────────────────────
    public function withdrawStore(Request $request)
    {
        $user = auth()->user();
        $feePercent = (float) \App\Models\AppSetting::get('withdraw_fee_percent', 2);

        $request->validate([
            'payment_method'  => 'required|in:bkash,nagad,rocket',
            'gross_amount'    => 'required|numeric|min:50|max:10000',
            'payment_number'  => 'required|string|min:11|max:15',
        ]);

        $gross  = (float) $request->gross_amount;
        $fee    = round($gross * $feePercent / 100, 2);
        $net    = $gross - $fee;

        if ($user->wallet_balance < $gross) {
            return back()->withErrors(['gross_amount' => 'ব্যালেন্স যথেষ্ট নেই।']);
        }

        // Check pending withdrawal
        if (WalletTransaction::where('user_id', $user->id)->where('type', 'withdrawal')->where('status', 'pending')->exists()) {
            return back()->withErrors(['gross_amount' => 'আগের উইথড্র প্রসেস হওয়ার আগে নতুন রিকোয়েস্ট করা যাবে না।']);
        }

        // Hold the amount
        $user->decrement('wallet_balance', $gross);

        WalletTransaction::create([
            'user_id'        => $user->id,
            'type'           => 'withdrawal',
            'gross_amount'   => $gross,
            'fee'            => $fee,
            'net_amount'     => $net,
            'payment_method' => $request->payment_method,
            'payment_number' => $request->payment_number,
            'status'         => 'pending',
        ]);

        return back()->with('success', "উইথড্র রিকোয়েস্ট পাঠানো হয়েছে। {$fee}৳ ফি কাটা হবে, {$net}৳ পাবেন।");
    }
}
