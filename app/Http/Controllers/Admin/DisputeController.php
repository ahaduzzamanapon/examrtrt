<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\QuestionDispute;
use App\Models\Question;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DisputeController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->input('status', 'PENDING');

        $disputes = QuestionDispute::with(['user:id,name,email', 'question:id,question_text,subject,exam_goal,options,correct_answer'])
            ->when($status !== 'ALL', function ($q) use ($status) {
                $q->where('status', $status);
            })
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Disputes/Index', [
            'disputes' => $disputes,
            'currentStatus' => $status,
        ]);
    }

    public function update(Request $request, $id)
    {
        $dispute = QuestionDispute::findOrFail($id);

        $request->validate([
            'status'     => 'required|in:PENDING,RESOLVED,REJECTED',
            'admin_note' => 'nullable|string|max:500',
        ]);

        $dispute->update([
            'status'     => $request->status,
            'admin_note' => $request->admin_note,
        ]);

        return back()->with('success', 'রিপোর্ট স্ট্যাটাস আপডেট হয়েছে।');
    }
}
