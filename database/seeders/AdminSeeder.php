<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@exam-arena.com'],
            [
                'name'              => 'Admin',
                'email'             => 'admin@exam-arena.com',
                'password'          => Hash::make('Admin@ExamArena2026!'),
                'email_verified_at' => now(),
                'exam_goal'         => 'other',
                'tokens'            => 9999,
            ]
        );
    }
}
