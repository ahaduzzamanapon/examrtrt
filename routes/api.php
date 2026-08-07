<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MobileAuthController;
use App\Http\Controllers\Api\MobileApiController;

/*
|--------------------------------------------------------------------------
| Mobile API Routes (Sanctum Token Auth)
|--------------------------------------------------------------------------
*/

// ── Public (no auth) ─────────────────────────────────────────────────────────
Route::prefix('mobile')->group(function () {
    Route::post('login',          [MobileAuthController::class, 'login']);
    Route::post('register',       [MobileAuthController::class, 'register']);
    Route::post('google-login',   [MobileAuthController::class, 'googleLogin']);
    Route::post('send-otp',       [MobileAuthController::class, 'sendOtp']);
    Route::post('verify-otp',     [MobileAuthController::class, 'verifyOtp']);
    Route::post('forgot-password',[MobileAuthController::class, 'forgotPassword']);
});

// ── Authenticated (Sanctum token required) ────────────────────────────────────
Route::prefix('mobile')->middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('logout',         [MobileAuthController::class, 'logout']);
    Route::get('user',            [MobileAuthController::class, 'user']);
    Route::post('onboarding',     [MobileAuthController::class, 'saveOnboarding']);

    // Dashboard & Subjects
    Route::get('subjects',        [MobileApiController::class, 'getSubjects']);
    Route::get('dashboard',       [MobileApiController::class, 'dashboard']);

    // Exams
    Route::get('exams',                  [MobileApiController::class, 'exams']);
    Route::get('exams/{id}',             [MobileApiController::class, 'examShow']);
    Route::post('exams/{id}/join',       [MobileApiController::class, 'examJoin']);
    Route::get('exams/{id}/room',        [MobileApiController::class, 'examRoom']);
    Route::post('exams/{id}/submit',     [MobileApiController::class, 'examSubmit']);
    Route::get('exams/{id}/result',      [MobileApiController::class, 'examResult']);

    // MCQ Reel
    Route::get('reel/questions',         [MobileApiController::class, 'reelQuestions']);

    // Practice
    Route::post('practice/start',        [MobileApiController::class, 'practiceStart']);
    Route::post('practice/ask-ai',       [MobileApiController::class, 'practiceAskAi']);

    // Survival
    Route::get('survival/questions',     [MobileApiController::class, 'survivalQuestions']);
    Route::post('survival/loss',         [MobileApiController::class, 'survivalLoss']);

    // Model Test
    Route::get('model-test',             [MobileApiController::class, 'modelTests']);
    Route::post('model-test/store',      [MobileApiController::class, 'modelTestStore']);
    Route::get('model-test/{id}/room',   [MobileApiController::class, 'modelTestRoom']);
    Route::post('model-test/{id}/submit',[MobileApiController::class, 'modelTestSubmit']);
    Route::get('model-test/{id}/result', [MobileApiController::class, 'modelTestResult']);

    // Battle
    Route::get('battle',                         [MobileApiController::class, 'battle']);
    Route::post('battle/create-invite',          [MobileApiController::class, 'battleCreate']);
    Route::post('battle/accept/{id}',            [MobileApiController::class, 'battleAccept']);
    Route::post('battle/cancel/{id}',            [MobileApiController::class, 'battleCancel']);
    Route::get('battle/room/{id}',               [MobileApiController::class, 'battleRoom']);
    Route::post('battle/room/{id}/submit',       [MobileApiController::class, 'battleSubmit']);
    Route::post('battle/heartbeat/{id}',         [MobileApiController::class, 'battleHeartbeat']);

    // Token Store
    Route::get('tokens',                         [MobileApiController::class, 'tokens']);
    Route::post('tokens/daily-claim',            [MobileApiController::class, 'tokensDailyClaim']);
    Route::post('tokens/watch-ad',               [MobileApiController::class, 'tokensWatchAd']);
    Route::post('tokens/buy',                    [MobileApiController::class, 'tokensBuy']);

    // Wallet
    Route::get('wallet',                         [MobileApiController::class, 'wallet']);
    Route::post('wallet/deposit',                [MobileApiController::class, 'walletDeposit']);
    Route::post('wallet/withdraw',               [MobileApiController::class, 'walletWithdraw']);

    // Leaderboard
    Route::get('leaderboard',                    [MobileApiController::class, 'leaderboard']);

    // Profile
    Route::get('profile',                        [MobileApiController::class, 'profile']);
    Route::patch('profile',                      [MobileApiController::class, 'profileUpdate']);

    // Feedback & Disputes
    Route::post('feedback',                      [MobileApiController::class, 'feedbackStore']);
    Route::post('disputes',                      [MobileApiController::class, 'disputeStore']);
});
