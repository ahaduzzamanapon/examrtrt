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
        $goal = $request->get('goal', $user->exam_goal ?? 'bcs');

        $questions = $this->getQuestions($goal, 10);

        return Inertia::render('Reel/Index', [
            'initialQuestions' => $questions,
            'currentGoal'      => $goal,
            'userGoal'         => $user->exam_goal ?? 'bcs',
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

    private function getQuestions(string $goal, int $limit = 10)
    {
        $query = Question::query()->where('is_active', true);

        if ($goal && $goal !== 'all') {
            $query->where('exam_goal', $goal);
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
