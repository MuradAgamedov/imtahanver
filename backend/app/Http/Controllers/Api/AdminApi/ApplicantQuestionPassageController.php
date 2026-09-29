<?php

namespace App\Http\Controllers\Api\AdminApi;

use App\Http\Controllers\Controller;
use App\Models\ApplicantQuestionPassage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicantQuestionPassageController extends Controller
{
    public function index(int $exampageId, int $groupId, int $subjectId): JsonResponse
    {
        $passages = ApplicantQuestionPassage::withCount('questions')
            ->where('applicant_exampage_id', $exampageId)
            ->where('applicant_group_id', $groupId)
            ->where('applicant_subject_id', $subjectId)
            ->orderBy('id')
            ->get();

        return response()->json(['success' => true, 'data' => $passages]);
    }

    public function store(Request $request, int $exampageId, int $groupId, int $subjectId): JsonResponse
    {
        $request->validate([
            'text'  => 'required|string',
            'audio' => 'nullable|string',
        ]);

        $passage = ApplicantQuestionPassage::create([
            'applicant_exampage_id' => $exampageId,
            'applicant_group_id'    => $groupId,
            'applicant_subject_id'  => $subjectId,
            'text'                  => $request->text,
            'audio'                 => $request->audio ?? null,
        ]);

        return response()->json(['success' => true, 'message' => 'Keçid əlavə edildi.', 'data' => $passage], 201);
    }

    public function update(Request $request, int $exampageId, int $groupId, int $subjectId, int $id): JsonResponse
    {
        $passage = ApplicantQuestionPassage::where('id', $id)
            ->where('applicant_exampage_id', $exampageId)
            ->where('applicant_group_id', $groupId)
            ->where('applicant_subject_id', $subjectId)
            ->first();

        if (!$passage) {
            return response()->json(['success' => false, 'message' => 'Keçid tapılmadı.'], 404);
        }

        $request->validate([
            'text'  => 'required|string',
            'audio' => 'nullable|string',
        ]);

        $passage->update([
            'text'  => $request->text,
            'audio' => $request->audio ?? $passage->audio,
        ]);

        return response()->json(['success' => true, 'message' => 'Keçid yeniləndi.', 'data' => $passage->fresh()]);
    }

    public function destroy(int $exampageId, int $groupId, int $subjectId, int $id): JsonResponse
    {
        $passage = ApplicantQuestionPassage::where('id', $id)
            ->where('applicant_exampage_id', $exampageId)
            ->where('applicant_group_id', $groupId)
            ->where('applicant_subject_id', $subjectId)
            ->first();

        if (!$passage) {
            return response()->json(['success' => false, 'message' => 'Keçid tapılmadı.'], 404);
        }

        // Unlink any questions still pointing at this passage before deleting it,
        // so they fall back to being standalone questions instead of failing the
        // delete or being silently orphaned.
        $passage->questions()->update(['applicant_question_passage_id' => null]);
        $passage->delete();

        return response()->json(['success' => true, 'message' => 'Keçid silindi.']);
    }
}
