<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TokenPackage extends Model
{
    protected $fillable = ['name', 'tokens', 'price', 'is_popular', 'is_active', 'sort_order'];

    protected $casts = [
        'is_popular' => 'boolean',
        'is_active'  => 'boolean',
        'tokens'     => 'integer',
        'price'      => 'float',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }
}
