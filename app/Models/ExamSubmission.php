<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExamSubmission extends Model
{
    public $timestamps = false;
    const CREATED_AT = 'submitted_at';

    protected $fillable = [
        'exam_id',
        'user_id',
        'answers',
        'score',
        'time_taken_sec',
        'warning_count',
        'is_disqualified',
        'rank',
    ];

    protected function casts(): array
    {
        return [
            'answers'         => 'array',
            'score'           => 'decimal:2',
            'is_disqualified' => 'boolean',
            'submitted_at'    => 'datetime',
        ];
    }

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
