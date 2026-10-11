<?php

namespace App\Http\Controllers\Api\AdminApi;

use App\Http\Controllers\Controller;
use App\Models\BuraxilisQuestionPassage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BuraxilisQuestionPassageController extends Controller
{
    public function index(int $exampageId, int $subjectId): JsonResponse
    {
        $passages = BuraxilisQuestionPassage::where('buraxilis_exampage_id', $exampageId)
            ->where('buraxilis_subject_id', $subjectId)
            ->orderBy('id', 'asc')
            ->get();

        return response()->json(['success' => true, 'data' => $passages]);
    }

    public function store(Request $request, int $exampageId, int $subjectId): JsonResponse
    {
        $passage = BuraxilisQuestionPassage::create([
            'buraxilis_exampage_id' => $exampageId,
            'buraxilis_subject_id'  => $subjectId,
            'text'                  => $request->text,
            'audio'                 => $request->audio ?? null,
        ]);

        return response()->json(['success' => true, 'data' => $passage], 201);
    }

    public function update(Request $request, int $exampageId, int $subjectId, int $id): JsonResponse
    {
        $passage = BuraxilisQuestionPassage::where('id', $id)
            ->where('buraxilis_exampage_id', $exampageId)
            ->where('buraxilis_subject_id', $subjectId)
            ->first();

        if (!$passage) {
            return response()->json(['success' => false, 'message' => 'Keçid tapılmadı.'], 404);
        }

        $passage->update([
            'text'  => $request->text,
            'audio' => $request->has('audio') ? $request->audio : $passage->audio,
        ]);

        return response()->json(['success' => true, 'data' => $passage]);
    }

    public function destroy(int $exampageId, int $subjectId, int $id): JsonResponse
    {
        $passage = BuraxilisQuestionPassage::where('id', $id)
            ->where('buraxilis_exampage_id', $exampageId)
            ->where('buraxilis_subject_id', $subjectId)
            ->first();

        if (!$passage) {
            return response()->json(['success' => false, 'message' => 'Keçid tapılmadı.'], 404);
        }

        $passage->delete();
        return response()->json(['success' => true, 'message' => 'Keçid silindi.']);
    }
}
