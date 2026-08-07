<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    use HasFactory;

    protected $table = 'feedbacks';

    protected $fillable = [
        'user_id',
        'type',
        'rating',
        'message',
        'status',
        'admin_reply',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
