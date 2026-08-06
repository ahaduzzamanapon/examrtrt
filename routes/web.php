<?php

use App\Http\Controllers\PushSubscriptionController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ── Public landing page ───────────────────────────────────────────────────────
Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
});

// ── Authenticated routes ──────────────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard — home screen with stats & upcoming exams
    Route::get('/dashboard', function () {
        $user = auth()->user();

        $upcomingExams = \App\Models\Exam::where('status', 'SCHEDULED')
            ->where('scheduled_at', '>', now())
            ->orderBy('scheduled_at')
            ->limit(5)
            ->get(['id', 'title', 'entry_fee', 'scheduled_at', 'total_questions']);

        return Inertia::render('Dashboard', [
            'upcomingExams' => $upcomingExams,
        ]);
    })->name('dashboard');

    // Profile
    Route::get('/profile',    [ProfileController::class, 'edit'])->name('profile.show');
    Route::patch('/profile',  [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ── Firebase Web Push ─────────────────────────────────────────────────────
    Route::prefix('push')->name('push.')->group(function () {
        Route::post('subscribe',   [PushSubscriptionController::class, 'store'])->name('subscribe');
        Route::post('unsubscribe', [PushSubscriptionController::class, 'destroy'])->name('unsubscribe');
        Route::get('vapid-key',    [PushSubscriptionController::class, 'vapidKey'])->name('vapid-key');
    });

    // ── Stub routes (placeholder until controllers are built) ─────────────────
    // These prevent route() helper errors in the frontend nav
    Route::get('/exams',       fn () => Inertia::render('Exams/Index'))->name('exams.index');
    Route::get('/exams/{id}',  fn ($id) => Inertia::render('Exams/Show', ['examId' => $id]))->name('exams.show');
    Route::get('/battle',      fn () => Inertia::render('Battle/Index'))->name('battle.index');
    Route::get('/practice',    fn () => Inertia::render('Practice/Index'))->name('practice.index');
    Route::get('/survival',    fn () => Inertia::render('Survival/Index'))->name('survival.index');
    Route::get('/leaderboard', fn () => Inertia::render('Leaderboard/Index'))->name('leaderboard.index');
    Route::get('/wallet',      fn () => Inertia::render('Wallet/Index'))->name('wallet.index');
    Route::get('/admin',       fn () => Inertia::render('Admin/Dashboard'))->name('admin.dashboard');
});

require __DIR__ . '/auth.php';
