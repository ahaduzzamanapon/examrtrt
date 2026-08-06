<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuestionDispute extends Model
{
    public $timestamps = false;
    const CREATED_AT = 'created_at';

    protected $fillable = [
        'question_id', 'user_id', 'report_reason', 'status', 'admin_note',
    ];

    protected function casts(): array
    {
        return ['created_at' => 'datetime'];
    }

    public function question() { return $this->belongsTo(Question::class); }
    public function user()     { return $this->belongsTo(User::class); }
}
