<?php

namespace App\Http\Controllers;

use App\Models\Question;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReelController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        // exam_goal is stored as JSON array; pick first or default
        $userGoal = is_array($user->exam_goal)
            ? ($user->exam_goal[0] ?? 'bcs')
            : ($user->exam_goal ?? 'bcs');

        $goal = $request->get('goal', $userGoal);

        $questions = $this->getQuestions($goal, 10, $user);

        return Inertia::render('Reel/Index', [
            'initialQuestions' => $questions,
            'currentGoal'      => $goal,
            'userGoal'         => $userGoal,
            'adsterraScript'   => (string) \App\Models\AppSetting::get('adsterra_script', ''),
        ]);
    }

    public function fetchQuestions(Request $request)
    {
        $goal  = $request->get('goal', 'bcs');
        $count = (int) $request->get('count', 10);

        $questions = $this->getQuestions($goal, $count);

        return response()->json([
            'questions' => $questions,
        ]);
    }

    private function getQuestions(string $goal, int $limit = 10, $user = null)
    {
        $query = Question::query()->where('is_active', true);

        if ($goal && $goal !== 'all') {
            $query->where('exam_goal', $goal);
        }

        if (in_array($goal, ['hsc', 'ssc']) && $user && $user->stream) {
            $query->where(function ($q) use ($user) {
                $q->where('stream', $user->stream)->orWhere('stream', 'general');
            });
        }

        return $query->inRandomOrder()
            ->limit($limit)
            ->get()
            ->map(function ($q) {
                return [
                    'id'               => $q->id,
                    'exam_goal'        => $q->exam_goal,
                    'exam_type'        => $q->exam_type,
                    'board_year'       => $q->board_year,
                    'subject'          => $q->subject,
                    'question_text'    => $q->question_text,
                    'image_url'        => $q->image_url,
                    'options'          => $q->options,
                    'correct_answer'   => strtolower($q->correct_answer),
                    'explanation'      => $q->explanation,
                    'difficulty_level' => $q->difficulty_level,
                ];
            });
    }
}
