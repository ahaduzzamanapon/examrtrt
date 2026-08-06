<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $fillable = [
        'exam_goal', 'exam_type', 'board_year', 'subject',
        'question_text', 'image_url',
        'options',                    // JSON: {"a":"..","b":"..","c":"..","d":".."}
        'correct_answer',             // 'a'|'b'|'c'|'d'
        'explanation', 'difficulty_level',
        'is_ai_generated', 'is_active',
    ];

    protected $casts = [
        'options'          => 'array',
        'is_ai_generated'  => 'boolean',
        'is_active'        => 'boolean',
    ];
}
