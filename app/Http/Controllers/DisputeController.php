<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\QuestionDispute;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DisputeController extends Controller
{
    // ── My Reports List in Student Panel ──────────────────────────────────────
    public function index()
    {
        $user = auth()->user();

        $disputes = QuestionDispute::with('question:id,question_text,subject,exam_goal')
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Disputes/Index', [
            'disputes' => $disputes,
        ]);
    }

    // ── Submit Question Report ────────────────────────────────────────────────
    public function store(Request $request)
    {
        $request->validate([
            'question_id'   => 'required|exists:questions,id',
            'report_reason' => 'required|string|max:500',
        ]);

        $user = auth()->user();

        // Prevent duplicate pending reports for same question by same user
        $exists = QuestionDispute::where('user_id', $user->id)
            ->where('question_id', $request->question_id)
            ->where('status', 'PENDING')
            ->exists();

        if ($exists) {
            return back()->withErrors(['report' => 'এই প্রশ্নটি নিয়ে আপনার রিপোর্ট ইতোমধ্যে প্রক্রিয়াধীন আছে।']);
        }

        QuestionDispute::create([
            'user_id'       => $user->id,
            'question_id'   => $request->question_id,
            'report_reason' => $request->report_reason,
            'status'        => 'PENDING',
        ]);

        return back()->with('success', '🚩 প্রশ্ন রিপোর্টটি জমা দেওয়া হয়েছে। অ্যাডমিন পর্যালোচনা করে ব্যবস্থা নেবেন।');
    }
}
