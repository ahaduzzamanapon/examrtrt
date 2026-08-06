<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BotChatLog extends Model
{
    public $timestamps = false;
    const CREATED_AT = 'created_at';

    protected $fillable = [
        'user_id', 'user_message', 'bot_response',
        'admin_corrected_response', 'is_reviewed', 'is_fed_to_model',
    ];

    protected function casts(): array
    {
        return [
            'is_reviewed'     => 'boolean',
            'is_fed_to_model' => 'boolean',
            'created_at'      => 'datetime',
        ];
    }

    public function user() { return $this->belongsTo(User::class); }
}
