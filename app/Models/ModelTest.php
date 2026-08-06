<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ModelTest extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'goal',
        'stream',
        'subject',
        'question_count',
        'duration_minutes',
        'negative_marking',
        'negative_value',
        'questions_snapshot',
        'answers',
        'score',
        'total_marks',
        'time_taken_sec',
        'completed',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'questions_snapshot' => 'array',
            'answers'            => 'array',
            'negative_marking'   => 'boolean',
            'completed'          => 'boolean',
            'score'              => 'decimal:2',
            'negative_value'     => 'decimal:2',
            'submitted_at'       => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
