<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyTokenClaim extends Model
{
    protected $fillable = ['user_id', 'claimed_date', 'tokens_earned'];

    protected $casts = ['claimed_date' => 'date'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
