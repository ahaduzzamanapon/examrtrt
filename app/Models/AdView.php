<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdView extends Model
{
    protected $fillable = ['user_id', 'ad_id', 'tokens_earned', 'view_date'];

    protected $casts = ['view_date' => 'date'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
