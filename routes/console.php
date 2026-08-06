<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ── Auto-generate questions every 30 minutes ───────────────────────────────────
// Skip any exam+subject combo that already has questions.
// Cron running on server: * * * * * cd /home/lcsyxfen/exam-arena-app && /usr/local/bin/php artisan schedule:run >> /dev/null 2>&1
Schedule::command('questions:generate --count=3 --difficulty=MIXED')
    ->everyThirtyMinutes()
    ->withoutOverlapping()
    ->runInBackground()
    ->appendOutputTo(storage_path('logs/question-generate.log'));
