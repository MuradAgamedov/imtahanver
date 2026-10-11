<?php

namespace App\Http\Controllers\Api\Front;

use App\Http\Controllers\Controller;
use App\Models\MagistraturaExampage;
use App\Models\MagistraturaQuestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class MagistraturaFrontQuestionsController extends Controller
{
    public function exampages(): JsonResponse
    {
        $exampages = MagistraturaExampage::orderBy('id', 'desc')->get();
        return response()->json(['success' => true, 'data' => $exampages]);
    }

    public function subjects(int $exampageId): JsonResponse
    {
        $exampage = MagistraturaExampage::with(['subjects' => fn($q) => $q->orderBy('magistratura_exampage_subject.order')])->find($exampageId);
        if (!$exampage) {
            return response()->json(['success' => false, 'message' => 'İmtahan vərəqi tapılmadı.'], 404);
        }
        return response()->json(['success' => true, 'data' => $exampage->subjects]);
    }

    public function subjectQuestions(int $exampageId, int $subjectId): JsonResponse
    {
        $questions = MagistraturaQuestion::with(['options' => fn($q) => $q->orderBy('order'), 'passage'])
            ->where('magistratura_exampage_id', $exampageId)
            ->where('magistratura_subject_id', $subjectId)
            ->orderBy('question_type')
            ->orderBy(DB::raw('COALESCE(magistratura_question_passage_id, id)'))
            ->orderBy('order')
            ->get();
        return response()->json(['success' => true, 'data' => $questions]);
    }

    public function exampageQuestions(int $exampageId): JsonResponse
    {
        $questions = MagistraturaQuestion::with(['options' => fn($q) => $q->orderBy('order'), 'subject', 'passage'])
            ->where('magistratura_exampage_id', $exampageId)
            ->orderBy('magistratura_subject_id')
            ->orderBy('question_type')
            ->orderBy(DB::raw('COALESCE(magistratura_question_passage_id, id)'))
            ->orderBy('order')
            ->get();
        return response()->json(['success' => true, 'data' => $questions]);
    }
}
