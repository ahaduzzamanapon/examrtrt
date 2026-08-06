<?php

namespace App\Services;

use App\Models\AdView;
use App\Models\DailyTokenClaim;
use App\Models\SystemSetting;
use App\Models\TokenPackage;
use App\Models\TokenTransaction;
use App\Models\User;
use App\Events\WalletBalanceUpdated;
use Illuminate\Support\Facades\DB;

class TokenService
{
    // ── Rate helpers — reads from system_settings (admin configurable) ────────

    private function rate(string $key, int $default): int
    {
        return (int) (SystemSetting::get($key, $default) ?? $default);
    }

    public function dailyBonusAmount(): int  { return $this->rate('token_daily_bonus', 10); }
    public function adViewAmount(): int      { return $this->rate('token_ad_view_amount', 5); }
    public function adDailyLimit(): int      { return $this->rate('token_ad_daily_limit', 5); }
    public function referralAmount(): int    { return $this->rate('token_referral_bonus', 50); }
    public function streak7Amount(): int     { return $this->rate('token_streak_7_bonus', 30); }
    public function streak30Amount(): int    { return $this->rate('token_streak_30_bonus', 100); }
    public function practiceTestCost(): int  { return $this->rate('token_practice_cost', 5); }
    public function modelTestCost(): int     { return $this->rate('token_model_test_cost', 20); }

    // ── Core atomic transact ──────────────────────────────────────────────────

    public function transact(
        User    $user,
        string  $type,
        int     $amount,
        string  $description,
        ?string $referenceId = null,
        array   $meta = []
    ): TokenTransaction {
        return DB::transaction(function () use ($user, $type, $amount, $description, $referenceId, $meta) {
            $user = User::lockForUpdate()->find($user->id);

            if ($amount < 0 && $user->token_balance < abs($amount)) {
                throw new \RuntimeException('টোকেন পর্যাপ্ত নয়। আরো টোকেন অর্জন করুন।');
            }

            $user->token_balance += $amount;
            $user->save();

            return TokenTransaction::create([
                'user_id'       => $user->id,
                'type'          => $type,
                'amount'        => $amount,
                'balance_after' => $user->token_balance,
                'description'   => $description,
                'reference_id'  => $referenceId,
                'meta'          => $meta ?: null,
            ]);
        });
    }

    // ── Daily free bonus ──────────────────────────────────────────────────────

    public function claimDailyBonus(User $user): array
    {
        $today = now()->toDateString();

        if (DailyTokenClaim::where('user_id', $user->id)->where('claimed_date', $today)->exists()) {
            return ['success' => false, 'message' => 'আজকের ডেইলি বোনাস আগেই নেওয়া হয়েছে। আগামীকাল আবার আসুন! ⏰'];
        }

        $streak = $user->streak_count ?? 0;
        $base   = $this->dailyBonusAmount();

        $amount = $streak >= 30 ? (int) ($base * 2)
                : ($streak >= 7  ? (int) ($base * 1.5) : $base);

        DB::transaction(function () use ($user, $today, $amount) {
            DailyTokenClaim::create(['user_id' => $user->id, 'claimed_date' => $today, 'tokens_earned' => $amount]);
            $this->transact($user, 'DAILY_BONUS', $amount, "দৈনিক বোনাস — {$today}");
        });

        return ['success' => true, 'amount' => $amount, 'message' => "+{$amount} টোকেন পেয়েছেন! 🎉"];
    }

    // ── Ad view reward ────────────────────────────────────────────────────────

    public function recordAdView(User $user, string $adId): array
    {
        $today      = now()->toDateString();
        $limit      = $this->adDailyLimit();
        $viewsToday = AdView::where('user_id', $user->id)->where('view_date', $today)->count();

        if ($viewsToday >= $limit) {
            return ['success' => false, 'message' => "আজ সর্বোচ্চ {$limit}টি বিজ্ঞাপন দেখা হয়ে গেছে। কাল আবার আসুন।"];
        }

        $amount    = $this->adViewAmount();
        $remaining = $limit - $viewsToday - 1;

        DB::transaction(function () use ($user, $adId, $today, $amount) {
            AdView::create(['user_id' => $user->id, 'ad_id' => $adId, 'tokens_earned' => $amount, 'view_date' => $today]);
            $this->transact($user, 'AD_VIEW', $amount, "বিজ্ঞাপন দেখার পুরস্কার", $adId);
        });

        return [
            'success'   => true,
            'amount'    => $amount,
            'remaining' => $remaining,
            'message'   => "+{$amount} টোকেন! আরো {$remaining}টি বিজ্ঞাপন দেখতে পারবেন আজ।",
        ];
    }

    // ── Buy tokens with wallet balance ────────────────────────────────────────

    public function purchaseWithWallet(User $user, int $packageId): array
    {
        $package = TokenPackage::where('id', $packageId)->where('is_active', true)->first();

        if (!$package) {
            return ['success' => false, 'message' => 'প্যাকেজটি পাওয়া যায়নি।'];
        }

        return DB::transaction(function () use ($user, $package) {
            $user = User::lockForUpdate()->find($user->id);

            if ($user->wallet_balance < $package->price) {
                return [
                    'success' => false,
                    'message' => "ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই। দরকার ৳{$package->price}, আছে ৳{$user->wallet_balance}।",
                ];
            }

            // Deduct from wallet
            $user->wallet_balance -= $package->price;
            $user->save();

            // Record wallet transaction
            \App\Models\WalletTransaction::create([
                'user_id'     => $user->id,
                'type'        => 'TOKEN_PURCHASE',
                'amount'      => -$package->price,
                'status'      => 'COMPLETED',
                'description' => "{$package->tokens} টোকেন কেনা — {$package->name}",
                'reference_id'=> (string) $package->id,
            ]);

            // Grant tokens
            $this->transact(
                $user,
                'PURCHASE',
                $package->tokens,
                "টোকেন কেনা: {$package->name} (৳{$package->price})",
                (string) $package->id,
                ['package_name' => $package->name, 'price' => $package->price]
            );

            // Broadcast wallet update
            event(new WalletBalanceUpdated(
                $user->id,
                (float) $user->wallet_balance,
                -(float) $package->price,
                'TOKEN_PURCHASE',
                "{$package->tokens} টোকেন কেনা"
            ));

            return [
                'success'        => true,
                'tokens_received'=> $package->tokens,
                'new_wallet'     => $user->wallet_balance,
                'new_tokens'     => $user->fresh()->token_balance,
                'message'        => "✅ {$package->tokens} টোকেন পেয়েছেন! ওয়ালেট থেকে ৳{$package->price} কাটা হয়েছে।",
            ];
        });
    }

    // ── Referral bonus ────────────────────────────────────────────────────────

    public function grantReferralBonus(User $referrer, User $newUser): void
    {
        $this->transact($referrer, 'REFERRAL', $this->referralAmount(),
            "{$newUser->name} আপনার রেফারেল কোড ব্যবহার করে যোগ দিয়েছেন।",
            (string) $newUser->id);
    }

    // ── Streak bonuses ────────────────────────────────────────────────────────

    public function checkAndGrantStreakBonus(User $user): ?int
    {
        $streak = $user->streak_count ?? 0;

        if ($streak === 7)  { $this->transact($user, 'STREAK_BONUS', $this->streak7Amount(),  "৭ দিনের স্ট্রিক বোনাস 🔥"); return $this->streak7Amount(); }
        if ($streak === 30) { $this->transact($user, 'STREAK_BONUS', $this->streak30Amount(), "৩০ দিনের স্ট্রিক বোনাস 🏆"); return $this->streak30Amount(); }

        return null;
    }

    // ── Spend tokens ──────────────────────────────────────────────────────────

    public function spendForPractice(User $user, int $examId): bool
    {
        try { $this->transact($user, 'PRACTICE_SPEND', -$this->practiceTestCost(), "প্র্যাকটিস টেস্ট", (string) $examId); return true; }
        catch (\RuntimeException) { return false; }
    }

    public function spendForModelTest(User $user, int $examId): bool
    {
        try { $this->transact($user, 'EXAM_SPEND', -$this->modelTestCost(), "মডেল টেস্ট", (string) $examId); return true; }
        catch (\RuntimeException) { return false; }
    }

    // ── Today's status ────────────────────────────────────────────────────────

    public function todayStatus(User $user): array
    {
        $today        = now()->toDateString();
        $limit        = $this->adDailyLimit();
        $adViewsToday = AdView::where('user_id', $user->id)->where('view_date', $today)->count();

        return [
            'daily_claimed'      => DailyTokenClaim::where('user_id', $user->id)->where('claimed_date', $today)->exists(),
            'daily_amount'       => $this->dailyBonusAmount(),
            'ad_views_today'     => $adViewsToday,
            'ad_views_remaining' => max(0, $limit - $adViewsToday),
            'ad_amount'          => $this->adViewAmount(),
            'ad_daily_limit'     => $limit,
            'referral_amount'    => $this->referralAmount(),
            'practice_cost'      => $this->practiceTestCost(),
            'model_test_cost'    => $this->modelTestCost(),
        ];
    }
}
