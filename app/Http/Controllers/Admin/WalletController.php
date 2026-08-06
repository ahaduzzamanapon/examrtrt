<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WalletController extends Controller
{
    // ── Pending deposits ──────────────────────────────────────────────────────
    public function deposits()
    {
        $deposits = WalletTransaction::with('user:id,name,email,phone')
            ->where('type', 'deposit')
            ->orderByRaw("FIELD(status,'pending','approved','rejected')")
            ->orderByDesc('created_at')
            ->paginate(30);

        return Inertia::render('Admin/Wallet/Deposits', ['deposits' => $deposits]);
    }

    // ── Approve deposit → add to wallet ───────────────────────────────────────
    public function approveDeposit(WalletTransaction $transaction)
    {
        if ($transaction->type !== 'deposit' || $transaction->status !== 'pending') {
            return back()->withErrors(['msg' => 'Invalid transaction.']);
        }

        $transaction->update(['status' => 'approved']);
        $transaction->user->increment('wallet_balance', $transaction->net_amount);

        return back()->with('success', '✅ Deposit approved — ব্যালেন্স যোগ হয়েছে।');
    }

    // ── Reject deposit ────────────────────────────────────────────────────────
    public function rejectDeposit(Request $request, WalletTransaction $transaction)
    {
        if ($transaction->type !== 'deposit' || $transaction->status !== 'pending') {
            return back()->withErrors(['msg' => 'Invalid transaction.']);
        }

        $transaction->update([
            'status'     => 'rejected',
            'admin_note' => $request->note ?? 'Rejected by admin',
        ]);

        return back()->with('success', '❌ Deposit rejected.');
    }

    // ── Pending withdrawals ───────────────────────────────────────────────────
    public function withdrawals()
    {
        $withdrawals = WalletTransaction::with('user:id,name,email,phone')
            ->where('type', 'withdrawal')
            ->orderByRaw("FIELD(status,'pending','approved','rejected')")
            ->orderByDesc('created_at')
            ->paginate(30);

        return Inertia::render('Admin/Wallet/Withdrawals', ['withdrawals' => $withdrawals]);
    }

    // ── Approve withdrawal (mark as sent) ─────────────────────────────────────
    public function approveWithdrawal(WalletTransaction $transaction)
    {
        if ($transaction->type !== 'withdrawal' || $transaction->status !== 'pending') {
            return back()->withErrors(['msg' => 'Invalid transaction.']);
        }

        $transaction->update(['status' => 'approved']);

        return back()->with('success', '✅ Withdrawal approved — টাকা পাঠানো হয়েছে।');
    }

    // ── Reject withdrawal → refund balance ────────────────────────────────────
    public function rejectWithdrawal(Request $request, WalletTransaction $transaction)
    {
        if ($transaction->type !== 'withdrawal' || $transaction->status !== 'pending') {
            return back()->withErrors(['msg' => 'Invalid transaction.']);
        }

        $transaction->update([
            'status'     => 'rejected',
            'admin_note' => $request->note ?? 'Rejected by admin',
        ]);

        // Refund gross amount
        $transaction->user->increment('wallet_balance', $transaction->gross_amount);

        return back()->with('success', '↩️ Withdrawal rejected — ব্যালেন্স ফেরত দেওয়া হয়েছে।');
    }
}
