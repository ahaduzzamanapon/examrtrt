<?php

namespace App\Http\Controllers;

use App\Events\LiveLeaderboardUpdated;
use App\Jobs\ProcessExamResults;
use App\Models\Exam;
use App\Models\ExamSubmission;
use App\Models\Question;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ExamController extends Controller
{
    // ── List upcoming / live exams ────────────────────────────────────────────────────
    public function index()
    {
        $user       = auth()->user();
        $userStream = $user->stream ?? null; // science | arts | commerce | null

        $exams = Exam::whereIn('status', ['SCHEDULED', 'LIVE'])
            ->orderBy('scheduled_at')
            ->get()
            ->filter(function ($exam) use ($userStream) {
                // target_streams null or empty = open to everyone
                $targets = $exam->target_streams ?? [];
                if (empty($targets)) return true;

                // user has no stream set = show open exams only
                if (!$userStream) return false;

                // show if exam targets user's stream
                return in_array($userStream, $targets);
            })
            ->map(function ($exam) use ($user) {
                $joined = $user
                    ? ExamSubmission::where('exam_id', $exam->id)->where('user_id', $user->id)->exists()
                    : false;

                return [
                    'id'                => $exam->id,
                    'title'             => $exam->title,
                    'description'       => $exam->description,
                    'type'              => $exam->type,
                    'categories'        => $exam->categories,
                    'target_streams'    => $exam->target_streams,
                    'entry_fee'         => $exam->entry_fee,
                    'total_marks'       => $exam->total_marks,
                    'duration_minutes'  => $exam->duration_minutes,
                    'scheduled_at'      => $exam->scheduled_at,
                    'status'            => $exam->status,
                    'participant_count' => $exam->submissions()->count(),
                    'prize_pool'        => $exam->prizePool(),
                    'joined'            => $joined,
                ];
            })
            ->values();

        return Inertia::render('Exams/Index', ['exams' => $exams]);
    }

    // ── Show exam lobby / detail ──────────────────────────────────────────────
    public function show($id)
    {
        $exam = Exam::findOrFail($id);
        $user = auth()->user();

        $submission = $user
            ? ExamSubmission::where('exam_id', $id)->where('user_id', $user->id)->first()
            : null;

        return Inertia::render('Exams/Show', [
            'exam'       => [
                'id'               => $exam->id,
                'title'            => $exam->title,
                'description'      => $exam->description,
                'type'             => $exam->type,
                'categories'       => $exam->categories,
                'entry_fee'        => $exam->entry_fee,
                'total_marks'      => $exam->total_marks,
                'duration_minutes' => $exam->duration_minutes,
                'negative_marking' => $exam->negative_marking,
                'negative_value'   => $exam->negative_value,
                'anti_cheat_limit' => $exam->anti_cheat_limit,
                'scheduled_at'     => $exam->scheduled_at,
                'status'           => $exam->status,
                'participant_count'=> $exam->submissions()->count(),
                'prize_pool'       => $exam->prizePool(),
                'prize_distribution'=> $exam->prize_distribution,
                'is_contest'       => $exam->type === 'CONTEST',
            ],
            'joined'     => (bool) $submission,
            'submitted'  => $submission ? (bool) $submission->score !== null : false,
        ]);
    }

    // ── Join exam (pay entry fee) ─────────────────────────────────────────────
    public function join(Request $request, $id)
    {
        $exam = Exam::findOrFail($id);
        $user = auth()->user();

        if ($exam->status !== 'SCHEDULED') {
            return back()->withErrors(['exam' => 'Exam is not open for registration.']);
        }

        $alreadyJoined = ExamSubmission::where('exam_id', $id)
            ->where('user_id', $user->id)->exists();
        if ($alreadyJoined) {
            return back()->withErrors(['exam' => 'You have already joined this exam.']);
        }

        $entryFee = (float) $exam->entry_fee;

        DB::transaction(function () use ($user, $exam, $entryFee, $id) {
            if ($entryFee > 0) {
                if ($user->wallet_balance < $entryFee) {
                    throw new \Exception('Insufficient wallet balance.');
                }
                $user->decrement('wallet_balance', $entryFee);
                WalletTransaction::create([
                    'user_id'        => $user->id,
                    'type'           => 'ENTRY_FEE',
                    'gross_amount'   => $entryFee,
                    'fee'            => 0,
                    'net_amount'     => $entryFee,
                    'status'         => 'APPROVED',
                    'trx_id'         => 'EXAM-' . $id . '-' . $user->id,
                ]);
            }

            ExamSubmission::create([
                'exam_id'  => $id,
                'user_id'  => $user->id,
                'answers'  => [],
                'score'    => null,
            ]);
        });

        return back()->with('success', 'Successfully joined the exam!');
    }

    // ── Enter exam room (get questions) ───────────────────────────────────────
    public function room($id)
    {
        $exam = Exam::findOrFail($id);
        $user = auth()->user();

        if ($exam->status !== 'LIVE') {
            return redirect()->route('exams.show', $id)
                ->withErrors(['exam' => 'Exam is not live yet.']);
        }

        $submission = ExamSubmission::where('exam_id', $id)
            ->where('user_id', $user->id)->first();

        if (!$submission) {
            return redirect()->route('exams.show', $id)
                ->withErrors(['exam' => 'You have not joined this exam.']);
        }

        // Already submitted — redirect to result
        if ($submission->score !== null) {
            return redirect()->route('exams.result', $id);
        }

        // Serve questions (no correct_answer exposed)
        $questions = collect($exam->questions_snapshot ?? [])->map(fn($q) => [
            'id'            => $q['id'],
            'question_text' => $q['question_text'],
            'options'       => $q['options'],
            'subject'       => $q['subject'],
        ]);

        $endsAt = $exam->scheduled_at->copy()->addMinutes($exam->duration_minutes);

        return Inertia::render('Exams/Room', [
            'exam'            => [
                'id'               => $exam->id,
                'title'            => $exam->title,
                'duration_minutes' => $exam->duration_minutes,
                'total_marks'      => $exam->total_marks,
                'negative_marking' => $exam->negative_marking,
                'negative_value'   => $exam->negative_value,
                'anti_cheat_limit' => $exam->anti_cheat_limit,
                'ends_at'          => $endsAt->toISOString(),
            ],
            'questions'       => $questions,
            'saved_answers'   => $submission->answers ?? [],
            'warning_count'   => $submission->warning_count ?? 0,
        ]);
    }

    // ── Auto-save answers (AJAX) ──────────────────────────────────────────────
    public function saveProgress(Request $request, $id)
    {
        $submission = ExamSubmission::where('exam_id', $id)
            ->where('user_id', auth()->id())
            ->whereNull('score')
            ->firstOrFail();

        $submission->update(['answers' => $request->answers ?? []]);

        return response()->json(['ok' => true]);
    }

    // ── Increment warning count ───────────────────────────────────────────────
    public function warn(Request $request, $id)
    {
        $exam = Exam::findOrFail($id);

        $submission = ExamSubmission::where('exam_id', $id)
            ->where('user_id', auth()->id())
            ->whereNull('score')
            ->firstOrFail();

        $submission->increment('warning_count');
        $newCount = $submission->fresh()->warning_count;

        // Auto-disqualify if over the limit
        if ($exam->anti_cheat_limit > 0 && $newCount >= $exam->anti_cheat_limit) {
            $submission->update(['is_disqualified' => true, 'score' => 0]);
            return response()->json(['disqualified' => true, 'warning_count' => $newCount]);
        }

        return response()->json(['disqualified' => false, 'warning_count' => $newCount]);
    }

    // ── Final submit ──────────────────────────────────────────────────────────
    public function submit(Request $request, $id)
    {
        $exam = Exam::findOrFail($id);

        $submission = ExamSubmission::where('exam_id', $id)
            ->where('user_id', auth()->id())
            ->whereNull('score')
            ->firstOrFail();

        $answers    = $request->answers ?? $submission->answers ?? [];
        $timeTaken  = $request->time_taken_sec ?? 0;
        $snapshot   = collect($exam->questions_snapshot ?? []);

        // ── Score calculation ─────────────────────────────────────────────────
        $perQ    = $exam->total_marks / max($snapshot->count(), 1);
        $negVal  = $exam->negative_marking ? (float) $exam->negative_value : 0;
        $score   = 0;

        foreach ($snapshot as $q) {
            $qId     = (string) $q['id'];
            $correct = $q['correct_answer'];
            $given   = $answers[$qId] ?? null;

            if ($given === null) continue;
            if ($given === $correct) {
                $score += $perQ;
            } else {
                $score -= $negVal;
            }
        }

        $submission->update([
            'answers'       => $answers,
            'score'         => max(0, $score),
            'time_taken_sec'=> $timeTaken,
        ]);

        // Broadcast leaderboard update
        $totalSubs = ExamSubmission::where('exam_id', $id)->whereNotNull('score')->count();
        broadcast(new LiveLeaderboardUpdated($id, $this->buildLeaderboard($exam), $totalSubs));

        return redirect()->route('exams.result', $id);
    }

    // ── Result page ───────────────────────────────────────────────────────────
    public function result($id)
    {
        $exam = Exam::findOrFail($id);
        $user = auth()->user();

        $submission = ExamSubmission::where('exam_id', $id)
            ->where('user_id', $user->id)->firstOrFail();

        $leaderboard = $this->buildLeaderboard($exam);

        return Inertia::render('Exams/Result', [
            'exam'        => [
                'id'          => $exam->id,
                'title'       => $exam->title,
                'total_marks' => $exam->total_marks,
                'status'      => $exam->status,
                'prize_pool'  => $exam->prizePool(),
            ],
            'submission'  => [
                'score'           => $submission->score,
                'time_taken_sec'  => $submission->time_taken_sec,
                'rank'            => $submission->rank,
                'is_disqualified' => $submission->is_disqualified,
                'warning_count'   => $submission->warning_count,
            ],
            'leaderboard' => $leaderboard,
        ]);
    }

    // ── Helper: build leaderboard array ──────────────────────────────────────
    private function buildLeaderboard(Exam $exam): array
    {
        return ExamSubmission::with('user:id,name,avatar')
            ->where('exam_id', $exam->id)
            ->whereNotNull('score')
            ->where('is_disqualified', false)
            ->orderByDesc('score')
            ->orderBy('time_taken_sec')
            ->limit(50)
            ->get()
            ->map(fn($s, $i) => [
                'rank'           => $i + 1,
                'name'           => $s->user?->name ?? 'Anonymous',
                'avatar'         => $s->user?->avatar,
                'score'          => $s->score,
                'time_taken_sec' => $s->time_taken_sec,
            ])
            ->toArray();
    }
}
