<?php

namespace App\Http\Controllers\Api\AdminApi;

use App\Http\Controllers\Controller;
use App\Models\ExamSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExamResultController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ExamSession::with(['user', 'exampage', 'subject', 'applicantExampage', 'applicantGroup', 'applicantSubject'])
            ->orderBy('created_at', 'desc');

        // Optional filtering by user name or email
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Optional filtering by status (active or completed)
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $results = $query->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $results,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $session = ExamSession::with([
            'user',
            'exampage',
            'subject',
            'applicantExampage',
            'applicantGroup',
            'applicantSubject',
            'answers.applicantQuestion',
            'answers.applicantOption',
            'applicantWrittenAnswers.question'
        ])->findOrFail($id);

        $questions = [];
        if (!is_null($session->applicant_exampage_id)) {
            $questions = \App\Models\ApplicantQuestion::with('options')
                ->where('applicant_exampage_id', $session->applicant_exampage_id)
                ->where('applicant_group_id', $session->applicant_group_id)
                ->orderBy('order')
                ->get();
        }

        return response()->json([
            'success' => true,
            'session' => $session,
            'questions' => $questions,
        ]);
    }

    public function grade(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'applicant_question_id' => 'required|exists:applicant_questions,id',
            'is_correct' => 'required|boolean',
        ]);

        $session = ExamSession::findOrFail($id);
        if (is_null($session->applicant_exampage_id)) {
            return response()->json(['success' => false, 'message' => 'Bu MİQ imtahanıdır, əl ilə yoxlama dəstəklənmir.'], 400);
        }

        $writtenAnswer = \App\Models\ApplicantWrittenAnswer::where('exam_session_id', $session->id)
            ->where('applicant_question_id', $request->applicant_question_id)
            ->first();

        if (!$writtenAnswer) {
            $writtenAnswer = \App\Models\ApplicantWrittenAnswer::create([
                'exam_session_id' => $session->id,
                'applicant_question_id' => $request->applicant_question_id,
                'written_answer' => '',
            ]);
        }

        $isCorrect = (bool) $request->is_correct;
        $writtenAnswer->update([
            'is_correct' => $isCorrect,
            'points' => $isCorrect ? 2.0 : 0.0,
        ]);

        // Recalculate score
        $session->score = $session->calculateApplicantScore();
        $session->save();

        return response()->json([
            'success' => true,
            'message' => 'Cavab uğurla qiymətləndirildi.',
            'session' => $session,
        ]);
    }
}
