<?php
// Check questions count by exam_goal and subject

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== QUESTIONS BY EXAM GOAL ===\n";
$goals = DB::table('questions')
    ->select('exam_goal', DB::raw('count(*) as total'))
    ->groupBy('exam_goal')
    ->orderByDesc('total')
    ->get();

foreach ($goals as $g) {
    echo sprintf("%-15s : %d\n", $g->exam_goal, $g->total);
}

echo "\n=== SSC SUBJECTS ===\n";
$ssc = DB::table('questions')
    ->select('subject', DB::raw('count(*) as total'))
    ->where('exam_goal', 'ssc')
    ->groupBy('subject')
    ->orderByDesc('total')
    ->get();
foreach ($ssc as $s) {
    echo sprintf("  %-40s : %d\n", $s->subject, $s->total);
}

echo "\n=== HSC SUBJECTS ===\n";
$hsc = DB::table('questions')
    ->select('subject', DB::raw('count(*) as total'))
    ->where('exam_goal', 'hsc')
    ->groupBy('subject')
    ->orderByDesc('total')
    ->get();
foreach ($hsc as $s) {
    echo sprintf("  %-40s : %d\n", $s->subject, $s->total);
}

echo "\n=== TOTAL: " . DB::table('questions')->count() . " questions ===\n";
