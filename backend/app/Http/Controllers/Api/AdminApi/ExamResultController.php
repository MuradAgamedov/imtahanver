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
        ExamSession::finalizeExpired();

        $query = ExamSession::with(['user', 'exampage', 'subject', 'applicantExampage', 'applicantGroup', 'applicantSubject', 'magistraturaExampage'])
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
            'magistraturaExampage',
            'answers.applicantQuestion',
            'answers.applicantOption',
            'answers.magistraturaQuestion',
            'answers.magistraturaOption',
            'applicantWrittenAnswers.question',
            'magistraturaWrittenAnswers.question',
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
        } elseif (!is_null($session->magistratura_exampage_id)) {
            $questions = \App\Models\MagistraturaQuestion::with(['options', 'passage'])
                ->where('magistratura_exampage_id', $session->magistratura_exampage_id)
                ->orderBy('magistratura_subject_id')
                ->orderBy('question_type')
                ->orderBy(\Illuminate\Support\Facades\DB::raw('COALESCE(magistratura_question_passage_id, id)'))
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
            'applicant_question_id' => 'nullable|exists:applicant_questions,id',
            'magistratura_question_id' => 'nullable|exists:magistratura_questions,id',
            'is_correct' => 'nullable|boolean',
            'points' => 'nullable|numeric|min:0|max:5',
        ]);

        $session = ExamSession::findOrFail($id);
        $isMagistratura = !is_null($session->magistratura_exampage_id);

        if (is_null($session->applicant_exampage_id) && !$isMagistratura) {
            return response()->json(['success' => false, 'message' => 'Bu MİQ imtahanıdır, əl ilə yoxlama dəstəklənmir.'], 400);
        }

        if ($request->has('points') && !is_null($request->points)) {
            $points = (float) $request->points;
            $isCorrect = $points > 0;
        } else {
            $isCorrect = (bool) $request->is_correct;
            $points = $isCorrect ? 2.0 : 0.0;
        }

        if ($isMagistratura) {
            $writtenAnswer = \App\Models\MagistraturaWrittenAnswer::firstOrCreate(
                ['exam_session_id' => $session->id, 'magistratura_question_id' => $request->magistratura_question_id],
                ['written_answer' => '']
            );
            $writtenAnswer->update(['is_correct' => $isCorrect, 'points' => $points]);
            $session->score = $session->calculateMagistraturaScore();
        } else {
            $writtenAnswer = \App\Models\ApplicantWrittenAnswer::firstOrCreate(
                ['exam_session_id' => $session->id, 'applicant_question_id' => $request->applicant_question_id],
                ['written_answer' => '']
            );
            $writtenAnswer->update(['is_correct' => $isCorrect, 'points' => $points]);
            $session->score = $session->calculateApplicantScore();
        }
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

        if (is_null($session->applicant_exampage_id) && is_null($session->magistratura_exampage_id)) {
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
            'applicant_question_id' => 'nullable|exists:applicant_questions,id',
            'magistratura_question_id' => 'nullable|exists:magistratura_questions,id',
            'written_answer' => 'nullable|string',
        ]);

        $session = ExamSession::findOrFail($id);
        $isMagistratura = !is_null($session->magistratura_exampage_id);

        if (is_null($session->applicant_exampage_id) && !$isMagistratura) {
            return response()->json(['success' => false, 'message' => 'Bu MİQ imtahanıdır, əl ilə redaktə dəstəklənmir.'], 400);
        }

        if ($isMagistratura) {
            \App\Models\MagistraturaWrittenAnswer::updateOrCreate(
                ['exam_session_id' => $session->id, 'magistratura_question_id' => $request->magistratura_question_id],
                ['written_answer' => $request->written_answer ?? '']
            );
            $session->score = $session->calculateMagistraturaScore();
        } else {
            \App\Models\ApplicantWrittenAnswer::updateOrCreate(
                ['exam_session_id' => $session->id, 'applicant_question_id' => $request->applicant_question_id],
                ['written_answer' => $request->written_answer ?? '']
            );
            $session->score = $session->calculateApplicantScore();
        }
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
