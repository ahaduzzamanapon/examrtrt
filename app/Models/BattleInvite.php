<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BattleInvite extends Model
{
    public $timestamps = false;
    const CREATED_AT = 'created_at';

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'stake_amount',
        'status',
        'questions_snapshot',
    ];

    protected function casts(): array
    {
        return [
            'questions_snapshot' => 'array',
            'stake_amount'       => 'decimal:2',
            'created_at'         => 'datetime',
        ];
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function session()
    {
        return $this->hasOne(BattleSession::class, 'invite_id');
    }
}
