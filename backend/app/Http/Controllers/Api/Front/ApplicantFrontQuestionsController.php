<?php

namespace App\Http\Controllers\Api\Front;

use App\Http\Controllers\Controller;
use App\Models\ApplicantExampage;
use App\Models\ApplicantGroup;
use App\Models\ApplicantQuestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ApplicantFrontQuestionsController extends Controller
{
    public function exampages(): JsonResponse
    {
        // Both demo and paid papers are shown — paid ones are gated behind
        // registration/payment and their scheduled start time client-side.
        $exampages = ApplicantExampage::orderBy('id', 'desc')->get();
        return response()->json([
            'success' => true,
            'data' => $exampages
        ]);
    }

    public function groups(int $exampageId): JsonResponse
    {
        $exampage = ApplicantExampage::with(['groups' => fn($q) => $q->orderBy('order')])->find($exampageId);
        
        if (!$exampage) {
            return response()->json(['success' => false, 'message' => 'İmtahan vərəqi tapılmadı.'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $exampage->groups
        ]);
    }

    public function subjects(int $exampageId, int $groupId): JsonResponse
    {
        $group = ApplicantGroup::with('subjects')->find($groupId);

        if (!$group) {
            return response()->json(['success' => false, 'message' => 'Qrup tapılmadı.'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $group->subjects
        ]);
    }

    public function subjectQuestions(int $exampageId, int $groupId, int $subjectId): JsonResponse
    {
        $questions = ApplicantQuestion::with(['options' => fn($q) => $q->orderBy('order'), 'passage'])
            ->where('applicant_exampage_id', $exampageId)
            ->where('applicant_group_id', $groupId)
            ->where('applicant_subject_id', $subjectId)
            ->orderBy('question_type')
            ->orderBy(DB::raw('COALESCE(applicant_question_passage_id, id)'))
            ->orderBy('order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $questions
        ]);
    }

    public function groupQuestions(int $exampageId, int $groupId): JsonResponse
    {
        $questions = ApplicantQuestion::with([
            'options' => fn($q) => $q->orderBy('order'),
            'subject',
            'passage',
        ])
            ->where('applicant_exampage_id', $exampageId)
            ->where('applicant_group_id', $groupId)
            ->orderBy('applicant_subject_id')
            ->orderBy('question_type')
            ->orderBy(DB::raw('COALESCE(applicant_question_passage_id, id)'))
            ->orderBy('order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $questions
        ]);
    }
}
