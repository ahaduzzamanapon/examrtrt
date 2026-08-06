<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    public $timestamps = false;
    const CREATED_AT = 'created_at';

    protected $fillable = [
        'subject',
        'exam_type',
        'board_year',
        'difficulty_level',
        'question_text',
        'image_url',
        'options',
        'correct_answer',
        'explanation',
        'is_ai_generated',
    ];

    protected function casts(): array
    {
        return [
            'options'          => 'array',
            'is_ai_generated'  => 'boolean',
            'created_at'       => 'datetime',
        ];
    }

    public function disputes()
    {
        return $this->hasMany(QuestionDispute::class);
    }
}
