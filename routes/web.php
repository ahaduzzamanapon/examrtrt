<?php

use App\Http\Controllers\PushSubscriptionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\FcmTokenController;
use App\Http\Controllers\Admin\NotificationController as AdminNotification;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Auth\OnboardingController;
use App\Models\Exam;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ── Public landing page ───────────────────────────────────────────────────────
Route::get('/', function () {
    if (auth()->check()) return redirect()->route('dashboard');
    return Inertia::render('Welcome');
})->name('welcome');

// ── Authenticated routes ──────────────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', function () {
        $user = auth()->user();

        // Admin → admin panel
        if ($user && $user->role === 'ADMIN') {
            return redirect()->route('admin.dashboard');
        }

        // New user without exam_goal → onboarding
        if ($user && !$user->exam_goal) {
            return redirect()->route('onboarding');
        }

        $upcomingExams = Exam::where('status', 'SCHEDULED')
            ->where('scheduled_at', '>', now())
            ->orderBy('scheduled_at')->limit(5)
            ->get(['id', 'title', 'entry_fee', 'scheduled_at']);
        return Inertia::render('Dashboard', ['upcomingExams' => $upcomingExams]);
    })->name('dashboard');

    // ── Onboarding (new users) ────────────────────────────────────────────────
    Route::get('/onboarding',  [OnboardingController::class, 'show'])->name('onboarding');
    Route::post('/onboarding', [OnboardingController::class, 'save'])->name('onboarding.save');

    // Profile
    Route::get('/profile',    [ProfileController::class, 'edit'])->name('profile.show');
    Route::patch('/profile',  [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar'])->name('profile.avatar');

    // ── FCM Token save ────────────────────────────────────────────────────────
    Route::post('/fcm-token', [FcmTokenController::class, 'store'])->name('fcm.token');

    // ── Firebase Web Push ─────────────────────────────────────────────────────
    Route::prefix('push')->name('push.')->group(function () {
        Route::post('subscribe',   [PushSubscriptionController::class, 'store'])->name('subscribe');
        Route::post('unsubscribe', [PushSubscriptionController::class, 'destroy'])->name('unsubscribe');
        Route::get('vapid-key',    [PushSubscriptionController::class, 'vapidKey'])->name('vapid-key');
    });

    // ── Admin ────────────────────────────────────────────────────────────────
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/', function () {
            $stats = [
                'total_users'     => \App\Models\User::count(),
                'fcm_subscribers' => \App\Models\User::whereNotNull('fcm_token')->count(),
                'total_exams'     => \App\Models\Exam::count(),
                'today_logins'    => 0,
            ];
            return Inertia::render('Admin/Dashboard', compact('stats'));
        })->name('dashboard');
        Route::get('/notifications', [AdminNotification::class, 'index'])->name('notifications');
        Route::post('/notifications', [AdminNotification::class, 'send'])->name('notifications.send');

        Route::get('/users',           [AdminUserController::class, 'index'])->name('users');
        Route::patch('/users/{user}/role',  [AdminUserController::class, 'updateRole'])->name('users.role');
        Route::patch('/users/{user}/tokens',[AdminUserController::class, 'updateTokens'])->name('users.tokens');
        Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');
    });

    // ── Feature pages ─────────────────────────────────────────────────────────
    Route::get('/exams',       fn () => Inertia::render('Exams/Index'))->name('exams.index');
    Route::get('/exams/{id}',  fn ($id) => Inertia::render('Exams/Show', ['examId' => $id]))->name('exams.show');
    Route::get('/reel',        fn () => Inertia::render('Reel/Index'))->name('reel.index');
    Route::get('/battle',      fn () => Inertia::render('Battle/Index'))->name('battle.index');
    Route::get('/practice',    fn () => Inertia::render('Practice/Index'))->name('practice.index');
    Route::get('/survival',    fn () => Inertia::render('Survival/Index'))->name('survival.index');
    Route::get('/leaderboard', fn () => Inertia::render('Leaderboard/Index'))->name('leaderboard.index');
    Route::get('/wallet',      fn () => Inertia::render('Wallet/Index'))->name('wallet.index');
});

require __DIR__ . '/auth.php';
