<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessExamResults;
use App\Models\Exam;
use App\Models\Question;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExamController extends Controller
{
    // ── List all exams ────────────────────────────────────────────────────────
    public function index()
    {
        $exams = Exam::withCount('submissions')
            ->orderByDesc('id')
            ->paginate(20);

        return Inertia::render('Admin/Exams/Index', ['exams' => $exams]);
    }

    // ── Show create form ──────────────────────────────────────────────────────
    public function create()
    {
        $categories = Question::select('exam_goal')->distinct()->pluck('exam_goal');
        return Inertia::render('Admin/Exams/Form', ['categories' => $categories]);
    }

    // ── Store new exam ────────────────────────────────────────────────────────
    public function store(Request $request)
    {
        $data = $request->validate([
            'title'             => 'required|string|max:255',
            'description'       => 'nullable|string',
            'type'              => 'required|in:FREE,CONTEST',
            'categories'        => 'required|array|min:1',
            'target_streams'    => 'nullable|array',
            'target_streams.*'  => 'in:science,arts,commerce,general',
            'entry_fee'         => 'required|numeric|min:0',
            'total_marks'       => 'required|integer|min:1',
            'duration_minutes'  => 'required|integer|min:1',
            'negative_marking'  => 'boolean',
            'negative_value'    => 'nullable|numeric|min:0',
            'anti_cheat_limit'  => 'nullable|integer|min:0',
            'scheduled_at'      => 'required|date|after:now',
            'admin_fee_percent' => 'nullable|numeric|min:0|max:100',
            'prize_distribution'=> 'nullable|array',
            'question_count'    => 'required|integer|min:1|max:200',
        ]);

        // Snapshot questions: filter by category and stream if specified
        $targetStreams = $data['target_streams'] ?? [];
        $qQuery = Question::whereIn('exam_goal', $data['categories'])
            ->where('is_active', true);
        if (!empty($targetStreams)) {
            $qQuery->where(function ($q) use ($targetStreams) {
                $q->whereIn('stream', $targetStreams)->orWhere('stream', 'general');
            });
        }
        $questions = $qQuery->inRandomOrder()
            ->limit($data['question_count'])
            ->get(['id', 'question_text', 'options', 'correct_answer', 'subject', 'exam_goal'])
            ->toArray();

        if (count($questions) < $data['question_count']) {
            return back()->withErrors(['question_count' => 'Not enough questions in the selected categories. Found: ' . count($questions)]);
        }

        $exam = Exam::create([
            'title'              => $data['title'],
            'description'        => $data['description'],
            'type'               => $data['type'],
            'categories'         => $data['categories'],
            'target_streams'     => !empty($targetStreams) ? $targetStreams : null,
            'entry_fee'          => $data['type'] === 'FREE' ? 0 : $data['entry_fee'],
            'total_marks'        => $data['total_marks'],
            'duration_minutes'   => $data['duration_minutes'],
            'negative_marking'   => $data['negative_marking'] ?? false,
            'negative_value'     => $data['negative_value'] ?? 0,
            'anti_cheat_limit'   => $data['anti_cheat_limit'] ?? 3,
            'scheduled_at'       => $data['scheduled_at'],
            'status'             => 'SCHEDULED',
            'admin_fee_percent'  => $data['admin_fee_percent'] ?? 10,
            'prize_distribution' => $data['prize_distribution'] ?? [
                ['rank' => 1, 'percent' => 60],
                ['rank' => 2, 'percent' => 30],
                ['rank' => 3, 'percent' => 10],
            ],
            'questions_snapshot' => $questions,
        ]);

        return redirect()->route('admin.exams.index')
            ->with('success', 'Exam created! ID: ' . $exam->id);
    }

    // ── Edit form ─────────────────────────────────────────────────────────────
    public function edit($id)
    {
        $exam = Exam::findOrFail($id);
        return Inertia::render('Admin/Exams/Form', ['exam' => $exam]);
    }

    // ── Update exam metadata ──────────────────────────────────────────────────
    public function update(Request $request, $id)
    {
        $exam = Exam::findOrFail($id);

        if ($exam->status === 'LIVE' || $exam->status === 'COMPLETED') {
            return back()->withErrors(['exam' => 'Cannot edit a live or completed exam.']);
        }

        $data = $request->validate([
            'title'             => 'required|string|max:255',
            'description'       => 'nullable|string',
            'entry_fee'         => 'required|numeric|min:0',
            'target_streams'    => 'nullable|array',
            'target_streams.*'  => 'in:science,arts,commerce,general',
            'total_marks'       => 'required|integer|min:1',
            'duration_minutes'  => 'required|integer|min:1',
            'negative_marking'  => 'boolean',
            'negative_value'    => 'nullable|numeric|min:0',
            'anti_cheat_limit'  => 'nullable|integer|min:0',
            'scheduled_at'      => 'required|date',
            'admin_fee_percent' => 'nullable|numeric|min:0|max:100',
            'prize_distribution'=> 'nullable|array',
        ]);

        $data['target_streams'] = !empty($data['target_streams']) ? $data['target_streams'] : null;
        $exam->update($data);

        return redirect()->route('admin.exams.index')->with('success', 'Exam updated.');
    }

    // ── Go LIVE ───────────────────────────────────────────────────────────────
    public function goLive($id)
    {
        $exam = Exam::findOrFail($id);

        if ($exam->status !== 'SCHEDULED') {
            return back()->withErrors(['exam' => 'Exam must be SCHEDULED to go LIVE.']);
        }

        $exam->update(['status' => 'LIVE']);

        // Schedule auto-close after duration
        ProcessExamResults::dispatch($exam->id)
            ->delay(now()->addMinutes($exam->duration_minutes));

        return back()->with('success', 'Exam is now LIVE!');
    }

    // ── Force complete + process results ──────────────────────────────────────
    public function complete($id)
    {
        $exam = Exam::findOrFail($id);

        if (!in_array($exam->status, ['LIVE', 'SCHEDULED'])) {
            return back()->withErrors(['exam' => 'Exam is already completed.']);
        }

        ProcessExamResults::dispatch($exam->id);

        return back()->with('success', 'Results processing dispatched.');
    }

    // ── Delete exam ───────────────────────────────────────────────────────────
    public function destroy($id)
    {
        $exam = Exam::findOrFail($id);

        if ($exam->status === 'LIVE') {
            return back()->withErrors(['exam' => 'Cannot delete a live exam.']);
        }

        $exam->delete();

        return back()->with('success', 'Exam deleted.');
    }
}
