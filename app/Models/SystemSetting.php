<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $table = 'system_settings';
    public $timestamps = false;
    public $incrementing = false;

    protected $fillable = [
        'ai_generator_active',
        'daily_practice_limit',
        'min_deposit_amount',
        'min_withdrawal_amount',
        'withdrawal_fee_percent',
    ];

    protected function casts(): array
    {
        return [
            'ai_generator_active'    => 'boolean',
            'min_deposit_amount'     => 'decimal:2',
            'min_withdrawal_amount'  => 'decimal:2',
            'withdrawal_fee_percent' => 'decimal:2',
        ];
    }

    /**
     * Always return the single settings row (singleton pattern).
     */
    public static function get(): self
    {
        return static::firstOrCreate(['id' => 1]);
    }
}
