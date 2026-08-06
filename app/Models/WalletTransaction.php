<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WalletTransaction extends Model
{
    public $timestamps = false;
    const CREATED_AT = 'created_at';

    protected $fillable = [
        'user_id',
        'type',
        'gross_amount',
        'fee',
        'net_amount',
        'trx_id',
        'payment_method',
        'payment_number',
        'status',
        'admin_note',
    ];

    protected function casts(): array
    {
        return [
            'gross_amount' => 'decimal:2',
            'fee'          => 'decimal:2',
            'net_amount'   => 'decimal:2',
            'created_at'   => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
