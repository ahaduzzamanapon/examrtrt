<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BotKnowledgeBase extends Model
{
    protected $table = 'bot_knowledge_base';

    protected $fillable = [
        'category', 'keywords', 'question_pattern', 'answer_text', 'is_admin_verified',
    ];

    protected function casts(): array
    {
        return [
            'keywords'          => 'array',
            'is_admin_verified' => 'boolean',
        ];
    }
}
