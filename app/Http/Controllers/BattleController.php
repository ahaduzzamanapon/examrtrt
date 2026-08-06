<?php

namespace App\Http\Controllers;

use App\Events\BattleInviteEvent;
use App\Models\BattleInvite;
use App\Models\BattleSession;
use App\Models\Question;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BattleController extends Controller
{
    // ── 1v1 Battle Lobby ──────────────────────────────────────────────────────
    public function index()
    {
        $user = auth()->user();

        // Get open invites (pending challenges)
        $invites = BattleInvite::with(['sender:id,name,avatar', 'receiver:id,name,avatar'])
            ->where('status', 'PENDING')
            ->orderByDesc('id')
            ->limit(20)
            ->get();

        // Active running sessions
        $mySessions = BattleSession::with(['sender:id,name', 'receiver:id,name', 'winner:id,name'])
            ->where(function ($q) use ($user) {
                $q->where('sender_id', $user->id)->orWhere('receiver_id', $user->id);
            })
            ->orderByDesc('id')
            ->limit(10)
            ->get();

        return Inertia::render('Battle/Index', [
            'invites'    => $invites,
            'mySessions' => $mySessions,
            'wallet'     => (float) $user->wallet_balance,
        ]);
    }

    // ── Create a Battle Invite (Stake: 0, 10, 20 Tk) ──────────────────────────
    public function createInvite(Request $request)
    {
        $user = auth()->user();

        $request->validate([
            'stake_amount' => 'required|numeric|in:0,10,20,50',
            'receiver_id'  => 'nullable|exists:users,id',
        ]);

        $stake = (float) $request->stake_amount;

        if ($stake > 0 && $user->wallet_balance < $stake) {
            return back()->withErrors(['stake' => "স্টেক ফি (৳{$stake}) পরিশোধ করার জন্য ওয়ালেটে পর্যাপ্ত টাকা নেই।"]);
        }

        // Fetch 10 random active questions based on user goal
        $goal = is_array($user->exam_goal) ? ($user->exam_goal[0] ?? 'bcs') : ($user->exam_goal ?? 'bcs');
        $qQuery = Question::where('is_active', true)->where('exam_goal', $goal);
        if (in_array($goal, ['hsc', 'ssc']) && $user->stream) {
            $qQuery->where(function ($q) use ($user) {
                $q->where('stream', $user->stream)->orWhere('stream', 'general');
            });
        }
        $questions = $qQuery->inRandomOrder()->limit(10)->get(['id', 'question_text', 'options', 'correct_answer', 'subject'])->toArray();

        if (count($questions) < 5) {
            return back()->withErrors(['stake' => 'পর্যাপ্ত প্রশ্ন পাওয়া যায়নি।']);
        }

        // Deduct stake if paid match
        if ($stake > 0) {
            $user->decrement('wallet_balance', $stake);
            WalletTransaction::create([
                'user_id'       => $user->id,
                'type'          => 'ENTRY_FEE',
                'gross_amount'  => $stake,
                'fee'           => 0,
                'net_amount'    => $stake,
                'status'        => 'APPROVED',
                'payment_method'=> 'wallet',
                'trx_id'        => 'BATTLE-' . strtoupper(\Illuminate\Support\Str::random(6)),
                'admin_note'    => '1v1 Battle Stake',
            ]);
        }

        $invite = BattleInvite::create([
            'sender_id'          => $user->id,
            'receiver_id'        => $request->receiver_id,
            'stake_amount'       => $stake,
            'status'             => 'PENDING',
            'questions_snapshot' => $questions,
        ]);

        // If specific receiver invited, dispatch Pusher real-time event
        if ($request->receiver_id) {
            event(new BattleInviteEvent(
                (int) $request->receiver_id,
                (int) $invite->id,
                (string) $user->name,
                (string) ($user->avatar ?? ''),
                (float) $stake,
                (string) $goal
            ));
        }

        return redirect()->route('battle.room', $invite->id);
    }

    // ── Accept an Invite ──────────────────────────────────────────────────────
    public function acceptInvite($id)
    {
        $user = auth()->user();
        $invite = BattleInvite::where('status', 'PENDING')->findOrFail($id);

        if ($invite->sender_id === $user->id) {
            return back()->withErrors(['msg' => 'নিজের চ্যালেঞ্জে নিজে যোগ দেওয়া যাবে না।']);
        }

        $stake = (float) $invite->stake_amount;
        if ($stake > 0 && $user->wallet_balance < $stake) {
            return back()->withErrors(['msg' => "চ্যালেঞ্জ গ্রহণ করতে ৳{$stake} স্টেক ফি লাগবে।"]);
        }

        if ($stake > 0) {
            $user->decrement('wallet_balance', $stake);
            WalletTransaction::create([
                'user_id'       => $user->id,
                'type'          => 'ENTRY_FEE',
                'gross_amount'  => $stake,
                'fee'           => 0,
                'net_amount'    => $stake,
                'status'        => 'APPROVED',
                'payment_method'=> 'wallet',
                'trx_id'        => 'BATTLE-' . strtoupper(\Illuminate\Support\Str::random(6)),
                'admin_note'    => '1v1 Battle Stake Accept',
            ]);
        }

        $invite->update([
            'receiver_id' => $user->id,
            'status'      => 'ACCEPTED',
        ]);

        // Create or get session
        $session = BattleSession::firstOrCreate([
            'invite_id' => $invite->id,
        ], [
            'sender_id'              => $invite->sender_id,
            'receiver_id'            => $user->id,
            'sender_score'           => 0,
            'receiver_score'         => 0,
            'current_question_index' => 0,
            'status'                 => 'ONGOING',
        ]);

        return redirect()->route('battle.room', $invite->id);
    }

    // ── 1v1 Battle Arena Room ──────────────────────────────────────────────────
    public function room($id)
    {
        $user = auth()->user();
        $invite = BattleInvite::with(['sender:id,name,avatar', 'receiver:id,name,avatar'])->findOrFail($id);

        $session = BattleSession::where('invite_id', $invite->id)->first();

        return Inertia::render('Battle/Room', [
            'invite'  => $invite,
            'session' => $session,
            'userId'  => $user->id,
        ]);
    }

    // ── Update score / Submit answer live ─────────────────────────────────────
    public function submitAnswer(Request $request, $id)
    {
        $user = auth()->user();
        $invite = BattleInvite::findOrFail($id);
        $session = BattleSession::where('invite_id', $invite->id)->first();

        if (!$session || $session->status === 'COMPLETED') {
            return response()->json(['status' => 'completed']);
        }

        $score = (int) $request->input('score', 0);
        $isFinished = (bool) $request->input('is_finished', false);

        if ($user->id === $session->sender_id) {
            $session->sender_score = max($session->sender_score, $score);
        } else {
            $session->receiver_score = max($session->receiver_score, $score);
        }

        if ($isFinished && $session->status !== 'COMPLETED') {
            // Determine winner if both players done or forced end
            $stake = (float) $invite->stake_amount;
            $winnerId = null;

            if ($session->sender_score > $session->receiver_score) {
                $winnerId = $session->sender_id;
            } elseif ($session->receiver_score > $session->sender_score) {
                $winnerId = $session->receiver_id;
            }

            $session->status = 'COMPLETED';
            $session->winner_id = $winnerId;

            // Payout prize if winner exists and stake > 0
            if ($winnerId && $stake > 0) {
                $prize = $stake * 2 * 0.9; // 10% platform fee
                User::where('id', $winnerId)->increment('wallet_balance', $prize);

                WalletTransaction::create([
                    'user_id'       => $winnerId,
                    'type'          => 'PRIZE_PAYOUT',
                    'gross_amount'  => $prize,
                    'fee'           => $stake * 2 * 0.1,
                    'net_amount'    => $prize,
                    'status'        => 'APPROVED',
                    'payment_method'=> 'wallet',
                    'trx_id'        => 'WIN-' . strtoupper(\Illuminate\Support\Str::random(6)),
                    'admin_note'    => '1v1 Battle Winner Payout',
                ]);
            }
        }

        $session->save();

        return response()->json([
            'session' => $session,
        ]);
    }
}
