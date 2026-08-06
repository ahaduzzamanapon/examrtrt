<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'is_phone_verified',
        'google_id',
        'avatar',
        'role',
        'exam_goal',
        'stream',
        'fcm_token',
        'token_balance',
        'wallet_balance',
        'free_contest_passes',
        'total_points',
        'streak_count',
        'last_login_date',
        'theme_preference',
        'referral_code',
        'referred_by',
        'password',
    ];

    public function referrals()
    {
        return $this->hasMany(User::class, 'referred_by');
    }

    public function referrer()
    {
        return $this->belongsTo(User::class, 'referred_by');
    }

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_date'   => 'date',
            'password'          => 'hashed',
            'wallet_balance'    => 'decimal:2',
            'token_balance'     => 'integer',
            'total_points'      => 'decimal:2',
            'is_phone_verified' => 'boolean',
            'exam_goal'         => 'array',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function examSubmissions()
    {
        return $this->hasMany(ExamSubmission::class);
    }

    public function practiceTests()
    {
        return $this->hasMany(PracticeTest::class);
    }

    public function walletTransactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }

    public function sentBattleInvites()
    {
        return $this->hasMany(BattleInvite::class, 'sender_id');
    }

    public function receivedBattleInvites()
    {
        return $this->hasMany(BattleInvite::class, 'receiver_id');
    }

    public function questionDisputes()
    {
        return $this->hasMany(QuestionDispute::class);
    }

    public function botChatLogs()
    {
        return $this->hasMany(BotChatLog::class);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    public function isAdmin(): bool
    {
        return $this->role === 'ADMIN';
    }

    public function hasEnoughBalance(float $amount): bool
    {
        return $this->wallet_balance >= $amount;
    }
}
