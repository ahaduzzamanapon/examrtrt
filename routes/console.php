<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ── Auto-generate questions daily at 3 AM ─────────────────────────────────────
// Skip any exam+subject combo that already has questions.
// Cron to add on server: * * * * * cd /home/lcsyxfen/exam-arena-app && php artisan schedule:run >> /dev/null 2>&1
Schedule::command('questions:generate --count=5 --difficulty=MEDIUM')
    ->dailyAt('03:00')
    ->withoutOverlapping()
    ->runInBackground()
    ->appendOutputTo(storage_path('logs/question-generate.log'));
