<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Exam;
use App\Models\ModelTest;
use App\Models\PracticeTest;
use App\Models\Question;
use App\Models\TokenPackage;
use App\Models\TokenTransaction;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Models\Battle;
use App\Services\TokenService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class MobileApiController extends Controller
{
    // ── Dashboard ─────────────────────────────────────────────────────────────
    public function dashboard(Request $request)
    {
        $user = $request->user();

        $upcomingExams = Exam::where('status', 'SCHEDULED')
            ->where('scheduled_at', '>', now())
            ->orderBy('scheduled_at')->limit(5)
            ->get(['id', 'title', 'entry_fee', 'scheduled_at', 'max_participants']);

        $recentTokens = TokenTransaction::where('user_id', $user->id)
            ->latest()->limit(5)
            ->get(['id', 'type', 'amount', 'description', 'created_at']);

        return response()->json([
            'user'           => $this->userData($user),
            'upcoming_exams' => $upcomingExams,
            'recent_tokens'  => $recentTokens,
            'stats' => [
                'token_balance'  => (int) $user->token_balance,
                'wallet_balance' => (float) $user->wallet_balance,
            ],
        ]);
    }

    // ── Exams ─────────────────────────────────────────────────────────────────
    public function exams(Request $request)
    {
        $exams = Exam::whereIn('status', ['SCHEDULED', 'LIVE'])
            ->orderBy('scheduled_at')->limit(20)
            ->get(['id', 'title', 'entry_fee', 'scheduled_at', 'status', 'max_participants', 'duration_minutes']);

        return response()->json(['exams' => $exams]);
    }

    public function examShow(Request $request, $id)
    {
        $exam = Exam::findOrFail($id);
        return response()->json(['exam' => $exam]);
    }

    public function examJoin(Request $request, $id)
    {
        $user = $request->user();
        $exam = Exam::findOrFail($id);

        if ($user->wallet_balance < $exam->entry_fee) {
            return response()->json(['message' => 'অপর্যাপ্ত ব্যালেন্স।'], 422);
        }

        $user->decrement('wallet_balance', $exam->entry_fee);
        $exam->participants()->attach($user->id);

        return response()->json(['message' => 'পরীক্ষায় যোগদান সফল।']);
    }

    public function examRoom(Request $request, $id)
    {
        $exam = Exam::with('questions')->findOrFail($id);
        $questions = $exam->questions()->get(['id', 'question_text', 'options'])->map(function ($q) {
            return [
                'id'            => $q->id,
                'question_text' => $q->question_text,
                'options'       => is_string($q->options) ? json_decode($q->options, true) : $q->options,
            ];
        });

        return response()->json([
            'exam'      => $exam->only('id', 'title', 'duration_minutes', 'status', 'scheduled_at'),
            'questions' => $questions,
        ]);
    }

    public function examSubmit(Request $request, $id)
    {
        $user    = $request->user();
        $exam    = Exam::with('questions')->findOrFail($id);
        $answers = $request->input('answers', []);

        $score = 0;
        foreach ($exam->questions as $q) {
            $given = $answers[$q->id] ?? null;
            if ($given && strtolower($given) === strtolower($q->correct_answer)) {
                $score++;
            }
        }

        return response()->json([
            'score'   => $score,
            'total'   => $exam->questions->count(),
            'message' => 'পরীক্ষা জমা হয়েছে।',
        ]);
    }

    public function examResult(Request $request, $id)
    {
        return $this->examSubmit($request, $id);
    }

    // ── MCQ Reel ──────────────────────────────────────────────────────────────
    public function reelQuestions(Request $request)
    {
        $user = $request->user();
        $goal = is_array($user->exam_goal) ? ($user->exam_goal[0] ?? 'bcs') : ($user->exam_goal ?? 'bcs');

        $query = Question::where('is_active', true);
        if ($goal && $goal !== 'all') {
            $query->where('exam_goal', $goal);
        }

        $questions = $query->inRandomOrder()->limit(30)
            ->get(['id', 'question_text', 'options', 'correct_answer', 'explanation', 'subject'])
            ->map(function ($q) {
                return [
                    'id'            => $q->id,
                    'question_text' => $q->question_text,
                    'options'       => is_string($q->options) ? json_decode($q->options, true) : $q->options,
                    'correct_answer'=> $q->correct_answer,
                    'explanation'   => $q->explanation,
                    'subject'       => $q->subject,
                ];
            });

        if ($questions->isEmpty()) {
            $questions = Question::where('is_active', true)->inRandomOrder()->limit(30)
                ->get(['id', 'question_text', 'options', 'correct_answer', 'explanation', 'subject'])
                ->map(function ($q) {
                    return [
                        'id'            => $q->id,
                        'question_text' => $q->question_text,
                        'options'       => is_string($q->options) ? json_decode($q->options, true) : $q->options,
                        'correct_answer'=> $q->correct_answer,
                        'explanation'   => $q->explanation,
                        'subject'       => $q->subject,
                    ];
                });
        }

        return response()->json(['questions' => $questions]);
    }

    // ── Practice ──────────────────────────────────────────────────────────────
    public function practiceStart(Request $request)
    {
        $user = $request->user();
        $cost = (int) AppSetting::get('token_practice_cost', 2);

        if ($user->token_balance < $cost) {
            return response()->json([
                'message' => "প্র্যাকটিস শুরু করতে {$cost} টোকেন প্রয়োজন। বর্তমান: {$user->token_balance}",
            ], 422);
        }

        $goal  = $request->input('goal', $user->exam_goal ?? 'bcs');
        $count = min((int) $request->input('count', 10), 30);

        $questions = Question::where('is_active', true)->where('exam_goal', $goal)
            ->inRandomOrder()->limit($count)
            ->get(['id', 'question_text', 'options', 'correct_answer', 'explanation', 'subject'])
            ->map(function ($q) {
                return [
                    'id'            => $q->id,
                    'question_text' => $q->question_text,
                    'options'       => is_string($q->options) ? json_decode($q->options, true) : $q->options,
                    'correct_answer'=> $q->correct_answer,
                    'explanation'   => $q->explanation,
                    'subject'       => $q->subject,
                ];
            });

        $user->decrement('token_balance', $cost);
        TokenTransaction::create([
            'user_id'       => $user->id,
            'type'          => 'PRACTICE_SPEND',
            'amount'        => -$cost,
            'balance_after' => $user->token_balance,
            'description'   => "প্র্যাকটিস সেশন (-{$cost} Token)",
        ]);

        PracticeTest::create(['user_id' => $user->id, 'goal' => $goal, 'question_count' => $count]);

        return response()->json([
            'questions'     => $questions,
            'token_balance' => (int) $user->token_balance,
        ]);
    }

    public function practiceAskAi(Request $request)
    {
        $request->validate([
            'question' => 'required|string',
            'context'  => 'nullable|string',
        ]);

        $apiKey = AppSetting::get('gemini_api_key');
        if (!$apiKey) {
            return response()->json(['answer' => 'AI সেবা এই মুহূর্তে অনুপলব্ধ।']);
        }

        $prompt  = "তুমি একজন বাংলাদেশি MCQ শিক্ষক। প্রশ্ন: {$request->question}. প্রসঙ্গ: {$request->context}. সহজ বাংলায় ব্যাখ্যা করো।";

        try {
            $res = Http::withHeaders(['Content-Type' => 'application/json'])
                ->timeout(15)
                ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}", [
                    'contents' => [['parts' => [['text' => $prompt]]]],
                ]);

            $text = $res->json('candidates.0.content.parts.0.text') ?? 'উত্তর পাওয়া যায়নি।';
        } catch (\Exception $e) {
            $text = 'AI উত্তর দিতে সমস্যা হয়েছে।';
        }

        return response()->json(['answer' => $text]);
    }

    // ── Survival ──────────────────────────────────────────────────────────────
    public function survivalQuestions(Request $request)
    {
        $user = $request->user();
        $goal = is_array($user->exam_goal) ? ($user->exam_goal[0] ?? 'bcs') : ($user->exam_goal ?? 'bcs');

        $questions = Question::where('is_active', true)->where('exam_goal', $goal)
            ->inRandomOrder()->limit(30)
            ->get(['id', 'question_text', 'options', 'correct_answer', 'explanation', 'subject'])
            ->map(function ($q) {
                return [
                    'id'            => $q->id,
                    'question_text' => $q->question_text,
                    'options'       => is_string($q->options) ? json_decode($q->options, true) : $q->options,
                    'correct_answer'=> $q->correct_answer,
                    'explanation'   => $q->explanation,
                ];
            });

        return response()->json(['questions' => $questions]);
    }

    public function survivalLoss(Request $request)
    {
        $user = $request->user();
        if ($user->token_balance >= 1) {
            $user->decrement('token_balance', 1);
            TokenTransaction::create([
                'user_id'       => $user->id,
                'type'          => 'PRACTICE_SPEND',
                'amount'        => -1,
                'balance_after' => $user->token_balance,
                'description'   => 'Survival Deathmatch Loss (-1 Token)',
            ]);
        }

        return response()->json([
            'success'       => true,
            'token_balance' => (int) $user->token_balance,
        ]);
    }

    // ── Model Test ────────────────────────────────────────────────────────────
    public function modelTests(Request $request)
    {
        $user  = $request->user();
        $tests = ModelTest::where('user_id', $user->id)->latest()->limit(10)->get();
        return response()->json(['model_tests' => $tests]);
    }

    public function modelTestStore(Request $request)
    {
        $user  = $request->user();
        $goal  = $request->input('goal', $user->exam_goal ?? 'bcs');
        $count = min((int) $request->input('count', 20), 50);

        $questions = Question::where('is_active', true)->where('exam_goal', $goal)
            ->inRandomOrder()->limit($count)
            ->get(['id', 'question_text', 'options', 'correct_answer', 'subject'])
            ->map(function ($q) {
                return [
                    'id'            => $q->id,
                    'question_text' => $q->question_text,
                    'options'       => is_string($q->options) ? json_decode($q->options, true) : $q->options,
                    'correct_answer'=> $q->correct_answer,
                    'subject'       => $q->subject,
                ];
            });

        $test = ModelTest::create([
            'user_id'        => $user->id,
            'goal'           => $goal,
            'question_count' => $count,
            'status'         => 'ongoing',
        ]);

        return response()->json(['model_test_id' => $test->id, 'questions' => $questions]);
    }

    public function modelTestRoom(Request $request, $id)
    {
        $test      = ModelTest::where('user_id', $request->user()->id)->findOrFail($id);
        $goal      = $test->goal ?? 'bcs';
        $questions = Question::where('is_active', true)->where('exam_goal', $goal)
            ->inRandomOrder()->limit($test->question_count ?? 20)
            ->get(['id', 'question_text', 'options', 'subject'])
            ->map(function ($q) {
                return [
                    'id'            => $q->id,
                    'question_text' => $q->question_text,
                    'options'       => is_string($q->options) ? json_decode($q->options, true) : $q->options,
                    'subject'       => $q->subject,
                ];
            });

        return response()->json(['model_test' => $test, 'questions' => $questions]);
    }

    public function modelTestSubmit(Request $request, $id)
    {
        $test    = ModelTest::where('user_id', $request->user()->id)->findOrFail($id);
        $answers = $request->input('answers', []);
        $score   = $request->input('score', 0);

        $test->update(['status' => 'completed', 'score' => $score]);

        return response()->json(['message' => 'মডেল টেস্ট জমা হয়েছে।', 'score' => $score]);
    }

    public function modelTestResult(Request $request, $id)
    {
        $test = ModelTest::where('user_id', $request->user()->id)->findOrFail($id);
        return response()->json(['model_test' => $test]);
    }

    // ── Battle ────────────────────────────────────────────────────────────────
    public function battle(Request $request)
    {
        $user    = $request->user();
        $battles = Battle::where(function ($q) use ($user) {
            $q->where('challenger_id', $user->id)->orWhere('challenged_id', $user->id);
        })->with(['challenger:id,name,avatar', 'challenged:id,name,avatar'])
            ->latest()->limit(10)->get();

        return response()->json(['battles' => $battles]);
    }

    public function battleCreate(Request $request)
    {
        // Placeholder — full implementation mirrors BattleController
        return response()->json(['message' => '১v১ চ্যালেঞ্জ তৈরি হচ্ছে...']);
    }

    public function battleAccept(Request $request, $id) { return response()->json(['message' => 'গৃহীত']); }
    public function battleCancel(Request $request, $id) { return response()->json(['message' => 'বাতিল']); }
    public function battleRoom(Request $request, $id)   { return response()->json(['battle' => Battle::findOrFail($id)]); }
    public function battleSubmit(Request $request, $id) { return response()->json(['message' => 'জমা দেওয়া হয়েছে']); }
    public function battleHeartbeat(Request $request, $id) { return response()->json(['ok' => true]); }

    // ── Token Store ───────────────────────────────────────────────────────────
    public function tokens(Request $request)
    {
        $user     = $request->user();
        $tokenSvc = app(TokenService::class);

        $packages = TokenPackage::where('is_active', true)->orderBy('price')->get();
        if ($packages->isEmpty()) {
            $packages = collect([
                ['id' => 1, 'name' => 'স্টার্টার প্যাক', 'tokens' => 50,  'price' => 20, 'badge' => null],
                ['id' => 2, 'name' => 'পপুলার প্যাক',   'tokens' => 150, 'price' => 50, 'badge' => '🔥 সেরা পছন্দ'],
                ['id' => 3, 'name' => 'প্রো প্যাক',      'tokens' => 350, 'price' => 100,'badge' => '⚡ সর্বোচ্চ ভ্যালু'],
            ]);
        }

        $adViewActive = (bool) AppSetting::get('ad_view_active', true);
        $adViewAmount = (int) AppSetting::get('token_ad_view_amount', 2);

        $referralCode = $user->referral_code ?? strtoupper(substr(md5($user->id . 'examarena'), 0, 8));
        if (!$user->referral_code) $user->update(['referral_code' => $referralCode]);

        return response()->json([
            'token_balance'  => (int) $user->token_balance,
            'wallet_balance' => (float) $user->wallet_balance,
            'packages'       => $packages,
            'referral_code'  => $referralCode,
            'referral_link'  => url("/register?ref={$referralCode}"),
            'status'         => $tokenSvc->todayStatus($user),
            'ad_view_active' => $adViewActive,
            'ad_view_amount' => $adViewAmount,
        ]);
    }

    public function tokensDailyClaim(Request $request)
    {
        $user     = $request->user();
        $tokenSvc = app(TokenService::class);
        $amount   = (int) AppSetting::get('token_daily_login_bonus', 5);

        $lastClaim = \Cache::get("daily_claim_{$user->id}");
        if ($lastClaim && now()->isSameDay(\Carbon\Carbon::parse($lastClaim))) {
            return response()->json(['message' => 'আজকের বোনাস ইতিমধ্যে নেওয়া হয়েছে।'], 422);
        }

        $tokenSvc->transact($user, 'DAILY_LOGIN', $amount, 'দৈনিক লগইন বোনাস');
        \Cache::put("daily_claim_{$user->id}", now(), now()->addDay());

        return response()->json([
            'message'       => "{$amount} টোকেন বোনাস পেয়েছ!",
            'token_balance' => (int) $user->fresh()->token_balance,
        ]);
    }

    public function tokensWatchAd(Request $request)
    {
        $user   = $request->user();
        $amount = (int) AppSetting::get('token_ad_view_amount', 2);

        app(TokenService::class)->transact($user, 'AD_WATCH', $amount, 'বিজ্ঞাপন দেখার পুরস্কার');

        return response()->json([
            'message'       => "{$amount} টোকেন পেয়েছ!",
            'token_balance' => (int) $user->fresh()->token_balance,
        ]);
    }

    public function tokensBuy(Request $request)
    {
        return response()->json(['message' => 'টোকেন কেনার জন্য ওয়ালেটে টাকা যোগ করুন।']);
    }

    // ── Wallet ────────────────────────────────────────────────────────────────
    public function wallet(Request $request)
    {
        $user         = $request->user();
        $transactions = WalletTransaction::where('user_id', $user->id)->latest()->limit(20)->get();

        return response()->json([
            'wallet_balance' => (float) $user->wallet_balance,
            'token_balance'  => (int) $user->token_balance,
            'transactions'   => $transactions,
        ]);
    }

    public function walletDeposit(Request $request)
    {
        $request->validate([
            'amount'   => 'required|numeric|min:10',
            'method'   => 'required|string',
            'trx_id'   => 'required|string',
        ]);

        WalletTransaction::create([
            'user_id' => $request->user()->id,
            'type'    => 'DEPOSIT',
            'amount'  => $request->amount,
            'method'  => $request->method,
            'trx_id'  => $request->trx_id,
            'status'  => 'PENDING',
        ]);

        return response()->json(['message' => 'ডিপোজিট রিকোয়েস্ট পাঠানো হয়েছে। অনুমোদনের অপেক্ষায়।']);
    }

    public function walletWithdraw(Request $request)
    {
        $request->validate([
            'amount'  => 'required|numeric|min:50',
            'method'  => 'required|string',
            'account' => 'required|string',
        ]);

        $user = $request->user();
        if ($user->wallet_balance < $request->amount) {
            return response()->json(['message' => 'অপর্যাপ্ত ব্যালেন্স।'], 422);
        }

        WalletTransaction::create([
            'user_id' => $user->id,
            'type'    => 'WITHDRAW',
            'amount'  => -$request->amount,
            'method'  => $request->method,
            'account' => $request->account,
            'status'  => 'PENDING',
        ]);

        return response()->json(['message' => 'উইথড্র রিকোয়েস্ট পাঠানো হয়েছে।']);
    }

    // ── Leaderboard ───────────────────────────────────────────────────────────
    public function leaderboard(Request $request)
    {
        $users = User::where('role', 'STUDENT')
            ->orderByDesc('token_balance')
            ->limit(50)
            ->get(['id', 'name', 'avatar', 'token_balance', 'exam_goal']);

        return response()->json(['leaderboard' => $users]);
    }

    // ── Profile ───────────────────────────────────────────────────────────────
    public function profile(Request $request)
    {
        $user   = $request->user();
        $tokens = TokenTransaction::where('user_id', $user->id)->latest()->limit(10)->get();

        return response()->json([
            'user'   => $this->userData($user),
            'recent_transactions' => $tokens,
        ]);
    }

    public function profileUpdate(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'name'  => 'sometimes|string|max:255',
            'phone' => 'sometimes|nullable|string|max:20',
        ]);

        $user->update($data);
        return response()->json(['user' => $this->userData($user)]);
    }

    // ── Disputes ─────────────────────────────────────────────────────────────
    public function disputeStore(Request $request)
    {
        $request->validate([
            'question_id' => 'required|integer',
            'reason'      => 'required|string|max:500',
        ]);

        \App\Models\Dispute::create([
            'user_id'     => $request->user()->id,
            'question_id' => $request->question_id,
            'reason'      => $request->reason,
            'status'      => 'PENDING',
        ]);

        return response()->json(['message' => 'অভিযোগ দাখিল হয়েছে।']);
    }

    // ── Helper ────────────────────────────────────────────────────────────────
    private function userData(User $user): array
    {
        return [
            'id'             => $user->id,
            'name'           => $user->name,
            'email'          => $user->email,
            'phone'          => $user->phone,
            'avatar'         => $user->avatar,
            'role'           => $user->role,
            'exam_goal'      => $user->exam_goal,
            'stream'         => $user->stream,
            'token_balance'  => (int) $user->token_balance,
            'wallet_balance' => (float) $user->wallet_balance,
            'google_id'      => $user->google_id,
            'has_password'   => !is_null($user->password),
            'referral_code'  => $user->referral_code,
        ];
    }
}
