<?php

namespace App\Http\Controllers\Api\Front;

use App\Http\Controllers\Controller;
use App\Models\MiqDirectQuestion;
use App\Models\MiqQuestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class MiqFrontQuestionsController extends Controller
{
    public function subjectQuestions(int $exampageId, int $questionTypeId, int $subjectId): JsonResponse
    {
        $questions = MiqQuestion::with(['options' => fn($q) => $q->orderBy('order'), 'passage'])
            ->where('miq_exampage_id', $exampageId)
            ->where('miq_question_type_id', $questionTypeId)
            ->where('miq_subject_id', $subjectId)
            ->orderBy(DB::raw('COALESCE(miq_question_passage_id, id)'))
            ->orderBy('order')
            ->get();

        return response()->json(['success' => true, 'data' => $questions]);
    }

    public function directQuestions(int $exampageId, int $questionTypeId): JsonResponse
    {
        $questions = MiqQuestion::with(['options' => fn($q) => $q->orderBy('order'), 'passage'])
            ->where('miq_exampage_id', $exampageId)
            ->where('miq_question_type_id', $questionTypeId)
            ->whereNull('miq_subject_id')
            ->orderBy(DB::raw('COALESCE(miq_question_passage_id, id)'))
            ->orderBy('order')
            ->get();

        return response()->json(['success' => true, 'data' => $questions]);
    }
}
