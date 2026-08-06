<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    public $timestamps = false;
    const CREATED_AT = 'created_at';

    protected $fillable = [
        'title',
        'description',
        'type',
        'categories',
        'entry_fee',
        'total_marks',
        'duration_minutes',
        'negative_marking',
        'negative_value',
        'anti_cheat_limit',
        'scheduled_at',
        'status',
        'admin_fee_percent',
        'prize_distribution',
        'questions_snapshot',
    ];

    protected function casts(): array
    {
        return [
            'categories'         => 'array',
            'prize_distribution' => 'array',
            'questions_snapshot' => 'array',
            'negative_marking'   => 'boolean',
            'scheduled_at'       => 'datetime',
            'entry_fee'          => 'decimal:2',
            'negative_value'     => 'decimal:2',
            'created_at'         => 'datetime',
        ];
    }

    public function submissions()
    {
        return $this->hasMany(ExamSubmission::class);
    }

    public function isLive(): bool
    {
        return $this->status === 'LIVE';
    }

    public function prizePool(): float
    {
        $totalEntryFees = $this->submissions()->count() * $this->entry_fee;
        $adminFee = $totalEntryFees * ($this->admin_fee_percent / 100);
        return max(0, $totalEntryFees - $adminFee);
    }
}
