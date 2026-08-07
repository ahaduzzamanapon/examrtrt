<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeedbackController extends Controller
{
    public function index(Request $request)
    {
        $feedbacks = Feedback::with('user:id,name,email,avatar')
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Feedbacks/Index', [
            'feedbacks' => $feedbacks,
        ]);
    }

    public function reply(Request $request, $id)
    {
        $request->validate([
            'admin_reply' => 'required|string|max:1000',
            'status'      => 'sometimes|string|in:PENDING,REVIEWED,RESOLVED',
        ]);

        $feedback = Feedback::findOrFail($id);
        $feedback->update([
            'admin_reply' => $request->admin_reply,
            'status'      => $request->input('status', 'RESOLVED'),
        ]);

        return back()->with('message', 'ফিডব্যাক রিপ্লাই সফল হয়েছে।');
    }
}
