<?php

namespace App\Http\Controllers\Api\Front;

use App\Http\Controllers\Controller;
use App\Models\MiqDirectQuestion;
use App\Models\MiqQuestion;
use Illuminate\Http\JsonResponse;

class MiqFrontQuestionsController extends Controller
{
    public function subjectQuestions(int $exampageId, int $questionTypeId, int $subjectId): JsonResponse
    {
        $questions = MiqQuestion::with(['options' => fn($q) => $q->orderBy('order')])
            ->where('miq_exampage_id', $exampageId)
            ->where('miq_question_type_id', $questionTypeId)
            ->where('miq_subject_id', $subjectId)
            ->orderBy('order')
            ->get();

        return response()->json(['success' => true, 'data' => $questions]);
    }

    public function directQuestions(int $exampageId, int $questionTypeId): JsonResponse
    {
        $questions = MiqQuestion::with(['options' => fn($q) => $q->orderBy('order')])
            ->where('miq_exampage_id', $exampageId)
            ->where('miq_question_type_id', $questionTypeId)
            ->whereNull('miq_subject_id')
            ->orderBy('order')
            ->get();

        return response()->json(['success' => true, 'data' => $questions]);
    }
}
