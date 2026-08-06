<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BattleSession extends Model
{
    protected $fillable = [
        'invite_id',
        'sender_id',
        'receiver_id',
        'sender_score',
        'receiver_score',
        'current_question_index',
        'status',
        'winner_id',
    ];

    public function invite()
    {
        return $this->belongsTo(BattleInvite::class, 'invite_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function winner()
    {
        return $this->belongsTo(User::class, 'winner_id');
    }
}
