<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TokenTransaction extends Model
{
    protected $fillable = [
        'user_id', 'type', 'amount', 'balance_after',
        'description', 'reference_id', 'meta',
    ];

    protected $casts = [
        'meta'         => 'array',
        'amount'       => 'integer',
        'balance_after'=> 'integer',
    ];

    // Earn types (positive)
    const EARN_TYPES = [
        'DAILY_BONUS', 'REFERRAL', 'AD_VIEW', 'PURCHASE', 'STREAK_BONUS', 'ADMIN_GRANT',
    ];

    // Spend types (negative)
    const SPEND_TYPES = [
        'PRACTICE_SPEND', 'EXAM_SPEND',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isEarn(): bool
    {
        return $this->amount > 0;
    }
}
