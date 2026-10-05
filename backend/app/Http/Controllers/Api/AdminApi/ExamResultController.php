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
            $questions = \App\Models\ApplicantQuestion::with(['options', 'passage'])
                ->where('applicant_exampage_id', $session->applicant_exampage_id)
                ->where('applicant_group_id', $session->applicant_group_id)
                ->orderBy('applicant_subject_id')
                ->orderBy('question_type')
                ->orderBy(\Illuminate\Support\Facades\DB::raw('COALESCE(applicant_question_passage_id, id)'))
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
            'is_correct' => 'nullable|boolean',
            'points' => 'nullable|numeric|min:0|max:2',
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

        if ($request->has('points') && !is_null($request->points)) {
            $points = (float) $request->points;
            $isCorrect = $points > 0;
        } else {
            $isCorrect = (bool) $request->is_correct;
            $points = $isCorrect ? 2.0 : 0.0;
        }

        $writtenAnswer->update([
            'is_correct' => $isCorrect,
            'points' => $points,
        ]);

        // Recalculate score
        $session->score = $session->calculateApplicantScore();
        $session->save();

        $session->load([
            'user',
            'exampage',
            'subject',
            'applicantExampage',
            'applicantGroup',
            'applicantSubject',
            'answers.applicantQuestion',
            'answers.applicantOption',
            'applicantWrittenAnswers.question',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cavab uğurla qiymətləndirildi.',
            'session' => $session,
        ]);
    }

    public function approveGrading(Request $request, int $id): JsonResponse
    {
        return $this->setGradingApproval($request, $id, true);
    }

    public function revokeGrading(Request $request, int $id): JsonResponse
    {
        return $this->setGradingApproval($request, $id, false);
    }

    private function setGradingApproval(Request $request, int $id, bool $approved): JsonResponse
    {
        $session = ExamSession::findOrFail($id);

        if (is_null($session->applicant_exampage_id)) {
            return response()->json(['success' => false, 'message' => 'Bu MİQ imtahanıdır, təsdiq tələb olunmur.'], 400);
        }

        if ($session->status !== 'completed') {
            return response()->json(['success' => false, 'message' => 'İmtahan hələ bitməyib.'], 400);
        }

        $session->forceFill([
            'grading_approved_at' => $approved ? now() : null,
            'grading_approved_by' => $approved ? optional($request->user())->id : null,
        ])->save();

        $session->load([
            'user',
            'exampage',
            'subject',
            'applicantExampage',
            'applicantGroup',
            'applicantSubject',
            'answers.applicantQuestion',
            'answers.applicantOption',
            'applicantWrittenAnswers.question',
        ]);

        return response()->json([
            'success' => true,
            'message' => $approved ? 'Yoxlama təsdiqləndi, nəticə tələbəyə göstəriləcək.' : 'Təsdiq geri çəkildi, nəticə tələbədən gizlədildi.',
            'session' => $session,
        ]);
    }

    public function updateWrittenAnswer(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'applicant_question_id' => 'required|exists:applicant_questions,id',
            'written_answer' => 'nullable|string',
        ]);

        $session = ExamSession::findOrFail($id);
        if (is_null($session->applicant_exampage_id)) {
            return response()->json(['success' => false, 'message' => 'Bu MİQ imtahanıdır, əl ilə redaktə dəstəklənmir.'], 400);
        }

        $writtenAnswer = \App\Models\ApplicantWrittenAnswer::where('exam_session_id', $session->id)
            ->where('applicant_question_id', $request->applicant_question_id)
            ->first();

        if (!$writtenAnswer) {
            $writtenAnswer = \App\Models\ApplicantWrittenAnswer::create([
                'exam_session_id' => $session->id,
                'applicant_question_id' => $request->applicant_question_id,
                'written_answer' => $request->written_answer ?? '',
            ]);
        } else {
            $writtenAnswer->update([
                'written_answer' => $request->written_answer ?? '',
            ]);
        }

        // Recalculate score (codeable answers are auto-graded against written_answer)
        $session->score = $session->calculateApplicantScore();
        $session->save();

        $session->load([
            'user',
            'exampage',
            'subject',
            'applicantExampage',
            'applicantGroup',
            'applicantSubject',
            'answers.applicantQuestion',
            'answers.applicantOption',
            'applicantWrittenAnswers.question',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cavab uğurla yeniləndi.',
            'session' => $session,
        ]);
    }
}
