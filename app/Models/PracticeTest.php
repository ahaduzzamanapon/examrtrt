<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PracticeTest extends Model
{
    public $timestamps = false;
    const CREATED_AT = 'created_at';

    protected $fillable = [
        'user_id', 'categories', 'questions_snapshot',
        'answers', 'score', 'time_taken_sec', 'completed',
    ];

    protected function casts(): array
    {
        return [
            'categories'         => 'array',
            'questions_snapshot' => 'array',
            'answers'            => 'array',
            'completed'          => 'boolean',
            'score'              => 'decimal:2',
            'created_at'         => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
