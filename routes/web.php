<?php

use App\Http\Controllers\PushSubscriptionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\FcmTokenController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\PracticeController;
use App\Http\Controllers\SurvivalController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\ModelTestController;
use App\Http\Controllers\BattleController;
use App\Http\Controllers\TokenController;
use App\Http\Controllers\DisputeController;
use App\Http\Controllers\Admin\NotificationController as AdminNotification;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\QuestionController as AdminQuestionController;
use App\Http\Controllers\Admin\ExamController as AdminExamController;
use App\Http\Controllers\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Admin\WalletController as AdminWalletController;
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
    Route::post('/profile/theme',  [ProfileController::class, 'saveTheme'])->name('profile.theme');
    Route::post('/profile/setup',  [ProfileController::class, 'saveSetup'])->name('profile.setup');

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

        Route::get('/users',              [AdminUserController::class, 'index'])->name('users');
        Route::patch('/users/{user}/role',  [AdminUserController::class, 'updateRole'])->name('users.role');
        Route::patch('/users/{user}/tokens',[AdminUserController::class, 'updateTokens'])->name('users.tokens');
        Route::delete('/users/{user}',      [AdminUserController::class, 'destroy'])->name('users.destroy');

        // Questions
        Route::get('/questions',                [AdminQuestionController::class, 'index'])->name('questions');
        Route::post('/questions',               [AdminQuestionController::class, 'store'])->name('questions.store');
        Route::patch('/questions/{question}',   [AdminQuestionController::class, 'update'])->name('questions.update');
        Route::delete('/questions/{question}',  [AdminQuestionController::class, 'destroy'])->name('questions.destroy');
        Route::post('/questions/import',        [AdminQuestionController::class, 'import'])->name('questions.import');
        Route::post('/questions/ai-generate',   [AdminQuestionController::class, 'aiGenerate'])->name('questions.ai');
        Route::post('/questions/bulk-save',     [AdminQuestionController::class, 'bulkSave'])->name('questions.bulk');
        Route::post('/questions/image',         [AdminQuestionController::class, 'extractFromImage'])->name('questions.image');
        Route::get('/questions/ai-status',      [AdminQuestionController::class, 'aiJobStatus'])->name('questions.ai-status');
        Route::post('/questions/ai-run',        [AdminQuestionController::class, 'runAiCommand'])->name('questions.ai-run');
        Route::post('/questions/ai-clear',      [AdminQuestionController::class, 'clearAiJob'])->name('questions.ai-clear');

        // Exams (Admin)
        Route::get('/exams',                   [AdminExamController::class, 'index'])->name('exams.index');
        Route::get('/exams/create',             [AdminExamController::class, 'create'])->name('exams.create');
        Route::post('/exams',                   [AdminExamController::class, 'store'])->name('exams.store');
        Route::get('/exams/{id}/edit',          [AdminExamController::class, 'edit'])->name('exams.edit');
        Route::patch('/exams/{id}',             [AdminExamController::class, 'update'])->name('exams.update');
        Route::post('/exams/{id}/live',         [AdminExamController::class, 'goLive'])->name('exams.live');
        Route::post('/exams/{id}/complete',     [AdminExamController::class, 'complete'])->name('exams.complete');
        Route::delete('/exams/{id}',            [AdminExamController::class, 'destroy'])->name('exams.destroy');

        // Settings
        Route::get('/settings',  [AdminSettingsController::class, 'index'])->name('settings');
        Route::post('/settings', [AdminSettingsController::class, 'save'])->name('settings.save');

        // Wallet Management
        Route::get('/wallet/deposits',                               [AdminWalletController::class, 'deposits'])->name('wallet.deposits');
        Route::post('/wallet/deposits/{transaction}/approve',        [AdminWalletController::class, 'approveDeposit'])->name('wallet.deposits.approve');
        Route::post('/wallet/deposits/{transaction}/reject',         [AdminWalletController::class, 'rejectDeposit'])->name('wallet.deposits.reject');
        Route::get('/wallet/withdrawals',                            [AdminWalletController::class, 'withdrawals'])->name('wallet.withdrawals');
        Route::post('/wallet/withdrawals/{transaction}/approve',     [AdminWalletController::class, 'approveWithdrawal'])->name('wallet.withdrawals.approve');
        Route::post('/wallet/withdrawals/{transaction}/reject',      [AdminWalletController::class, 'rejectWithdrawal'])->name('wallet.withdrawals.reject');
    });

    // ── Feature pages ─────────────────────────────────────────────────────────
    // Exams (User)
    Route::get('/exams',                      [ExamController::class, 'index'])->name('exams.index');
    Route::get('/exams/{id}',                 [ExamController::class, 'show'])->name('exams.show');
    Route::post('/exams/{id}/join',           [ExamController::class, 'join'])->name('exams.join');
    Route::get('/exams/{id}/room',            [ExamController::class, 'room'])->name('exams.room');
    Route::post('/exams/{id}/save-progress',  [ExamController::class, 'saveProgress'])->name('exams.save-progress');
    Route::post('/exams/{id}/warn',           [ExamController::class, 'warn'])->name('exams.warn');
    Route::post('/exams/{id}/submit',         [ExamController::class, 'submit'])->name('exams.submit');
    Route::get('/exams/{id}/result',          [ExamController::class, 'result'])->name('exams.result');

    Route::get('/reel',                [\App\Http\Controllers\ReelController::class, 'index'])->name('reel.index');
    Route::get('/api/reel/questions',  [\App\Http\Controllers\ReelController::class, 'fetchQuestions'])->name('reel.api');
    // ── 1v1 Battle ─────────────────────────────────────────────────────────────
    Route::get('/battle',                     [BattleController::class, 'index'])->name('battle.index');
    Route::post('/battle/create-invite',      [BattleController::class, 'createInvite'])->name('battle.create-invite');
    Route::post('/battle/accept/{id}',        [BattleController::class, 'acceptInvite'])->name('battle.accept');
    Route::get('/battle/room/{id}',           [BattleController::class, 'room'])->name('battle.room');
    Route::post('/battle/room/{id}/submit',    [BattleController::class, 'submitAnswer'])->name('battle.submit-answer');

    // ── Practice & Survival ───────────────────────────────────────────────────
    Route::get('/practice',            [PracticeController::class, 'index'])->name('practice.index');
    Route::post('/practice/start',     [PracticeController::class, 'start'])->name('practice.start');
    Route::post('/practice/ask-ai',    [PracticeController::class, 'askAi'])->name('practice.ask-ai');
    Route::get('/survival',            [SurvivalController::class, 'index'])->name('survival.index');
    Route::get('/api/survival/q',      [SurvivalController::class, 'fetchQuestions'])->name('survival.questions');
    Route::post('/api/survival/loss',   [SurvivalController::class, 'recordLoss'])->name('survival.loss');
    Route::get('/leaderboard',         [LeaderboardController::class, 'index'])->name('leaderboard.index');

    // ── Model Test ─────────────────────────────────────────────────────────────
    Route::get('/model-test',                 [ModelTestController::class, 'index'])->name('model-test.index');
    Route::post('/model-test/store',          [ModelTestController::class, 'store'])->name('model-test.store');
    Route::get('/model-test/{id}/room',       [ModelTestController::class, 'room'])->name('model-test.room');
    Route::post('/model-test/{id}/submit',    [ModelTestController::class, 'submit'])->name('model-test.submit');
    Route::get('/model-test/{id}/result',     [ModelTestController::class, 'result'])->name('model-test.result');

    // ── Question Disputes / Reports ───────────────────────────────────────────
    Route::get('/disputes',                   [DisputeController::class, 'index'])->name('disputes.index');
    Route::post('/disputes/store',            [DisputeController::class, 'store'])->name('disputes.store');

    // ── Token Store ────────────────────────────────────────────────────────────
    Route::get('/tokens',                     [TokenController::class, 'index'])->name('tokens.index');
    Route::post('/tokens/buy',                [TokenController::class, 'buyPackage'])->name('tokens.buy');
    Route::post('/tokens/daily-claim',        [TokenController::class, 'claimDailyBonus'])->name('tokens.daily-claim');

    // ── Wallet ─────────────────────────────────────────────────────────────────
    Route::get('/wallet',              [WalletController::class, 'index'])->name('wallet.index');
    Route::post('/wallet/deposit',     [WalletController::class, 'depositStore'])->name('wallet.deposit');
    Route::post('/wallet/withdraw',    [WalletController::class, 'withdrawStore'])->name('wallet.withdraw');
});

require __DIR__ . '/auth.php';
