<?php

namespace App\Http\Controllers\Api\Front;

use App\Http\Controllers\Controller;
use App\Models\BuraxilisExampage;
use App\Models\BuraxilisQuestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class BuraxilisFrontQuestionsController extends Controller
{
    public function exampages(): JsonResponse
    {
        $exampages = BuraxilisExampage::orderBy('id', 'desc')->get();
        return response()->json(['success' => true, 'data' => $exampages]);
    }

    public function subjects(int $exampageId): JsonResponse
    {
        $exampage = BuraxilisExampage::with(['subjects' => fn($q) => $q->orderBy('buraxilis_exampage_subject.order')])->find($exampageId);
        if (!$exampage) {
            return response()->json(['success' => false, 'message' => 'İmtahan vərəqi tapılmadı.'], 404);
        }
        return response()->json(['success' => true, 'data' => $exampage->subjects]);
    }

    public function exampageQuestions(int $exampageId): JsonResponse
    {
        $questions = BuraxilisQuestion::with(['options' => fn($q) => $q->orderBy('order'), 'subject', 'passage'])
            ->where('buraxilis_exampage_id', $exampageId)
            ->orderBy('buraxilis_subject_id')
            ->orderBy('question_type')
            ->orderBy(DB::raw('COALESCE(buraxilis_question_passage_id, id)'))
            ->orderBy('order')
            ->get();
        return response()->json(['success' => true, 'data' => $questions]);
    }
}
