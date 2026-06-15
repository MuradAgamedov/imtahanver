<?php

namespace App\Http\Controllers\Api\AdminApi;

use App\Http\Controllers\Controller;
use App\Models\ApplicantQuestion;
use App\Models\ApplicantQuestionOption;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicantQuestionController extends Controller
{
    // ─── Questions ───────────────────────────────────────────────────────────

    public function index(int $exampageId, int $groupId, int $subjectId): JsonResponse
    {
        $questions = ApplicantQuestion::with('options')
            ->where('applicant_exampage_id', $exampageId)
            ->where('applicant_group_id', $groupId)
            ->where('applicant_subject_id', $subjectId)
            ->orderBy('question_type')
            ->orderBy('order')
            ->get();

        $counts = [
            1 => $questions->where('question_type', 1)->count(),
            2 => $questions->where('question_type', 2)->count(),
            3 => $questions->where('question_type', 3)->count(),
        ];

        return response()->json([
            'success' => true,
            'data'    => $questions,
            'counts'  => $counts,
            'limits'  => ApplicantQuestion::TYPE_LIMITS,
            'labels'  => ApplicantQuestion::TYPE_LABELS,
        ]);
    }

    public function store(Request $request, int $exampageId, int $groupId, int $subjectId): JsonResponse
    {
        $request->validate([
            'question_type' => 'required|integer|in:1,2,3',
            'title'         => 'nullable|string',
        ]);

        $type = (int) $request->question_type;
        $limit = ApplicantQuestion::TYPE_LIMITS[$type];

        $existingCount = ApplicantQuestion::where('applicant_exampage_id', $exampageId)
            ->where('applicant_group_id', $groupId)
            ->where('applicant_subject_id', $subjectId)
            ->where('question_type', $type)
            ->count();

        if ($existingCount >= $limit) {
            return response()->json([
                'success' => false,
                'message' => ApplicantQuestion::TYPE_LABELS[$type] . " üçün maksimum sual limiti ({$limit}) aşılıb.",
            ], 422);
        }

        $maxOrder = ApplicantQuestion::where('applicant_exampage_id', $exampageId)
            ->where('applicant_group_id', $groupId)
            ->where('applicant_subject_id', $subjectId)
            ->where('question_type', $type)
            ->max('order') ?? -1;

        $question = ApplicantQuestion::create([
            'applicant_exampage_id' => $exampageId,
            'applicant_group_id'    => $groupId,
            'applicant_subject_id'  => $subjectId,
            'question_type'         => $type,
            'title'                 => $request->title,
            'image'                 => $request->image ?? null,
            'order'                 => $maxOrder + 1,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Sual əlavə edildi.',
            'data'    => $question->load('options'),
        ], 201);
    }

    public function update(Request $request, int $exampageId, int $groupId, int $subjectId, int $id): JsonResponse
    {
        $question = ApplicantQuestion::where('id', $id)
            ->where('applicant_exampage_id', $exampageId)
            ->where('applicant_group_id', $groupId)
            ->where('applicant_subject_id', $subjectId)
            ->first();

        if (!$question) {
            return response()->json(['success' => false, 'message' => 'Sual tapılmadı.'], 404);
        }

        $request->validate(['title' => 'nullable|string']);

        $question->update([
            'title' => $request->title,
            'image' => $request->image ?? $question->image,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Sual yeniləndi.',
            'data'    => $question->fresh()->load('options'),
        ]);
    }

    public function destroy(int $exampageId, int $groupId, int $subjectId, int $id): JsonResponse
    {
        $question = ApplicantQuestion::where('id', $id)
            ->where('applicant_exampage_id', $exampageId)
            ->where('applicant_group_id', $groupId)
            ->where('applicant_subject_id', $subjectId)
            ->first();

        if (!$question) {
            return response()->json(['success' => false, 'message' => 'Sual tapılmadı.'], 404);
        }

        $question->delete();

        return response()->json(['success' => true, 'message' => 'Sual silindi.']);
    }

    public function reorder(Request $request, int $exampageId, int $groupId, int $subjectId): JsonResponse
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer']);

        foreach ($request->ids as $index => $id) {
            ApplicantQuestion::where('id', $id)
                ->where('applicant_exampage_id', $exampageId)
                ->update(['order' => $index]);
        }

        return response()->json(['success' => true, 'message' => 'Sıralama yeniləndi.']);
    }

    // ─── Image Upload ─────────────────────────────────────────────────────────

    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|max:5120', // 5 MB
        ]);

        $path = $request->file('image')->store('applicant-questions', 'public');

        return response()->json([
            'success' => true,
            'path'    => 'storage/' . $path,
        ]);
    }

    // ─── Options (type 1 only) ────────────────────────────────────────────────

    public function indexOptions(int $questionId): JsonResponse
    {
        $question = ApplicantQuestion::find($questionId);
        if (!$question || $question->question_type !== 1) {
            return response()->json(['success' => false, 'message' => 'Sual tapılmadı və ya tip 1 deyil.'], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $question->options,
        ]);
    }

    public function storeOption(Request $request, int $questionId): JsonResponse
    {
        $question = ApplicantQuestion::find($questionId);
        if (!$question || $question->question_type !== 1) {
            return response()->json(['success' => false, 'message' => 'Sual tapılmadı və ya tip 1 deyil.'], 404);
        }

        $request->validate([
            'text'    => 'nullable|string',
            'is_true' => 'boolean',
            'image'   => 'nullable|string',
        ]);

        $maxOrder = ApplicantQuestionOption::where('applicant_question_id', $questionId)->max('order') ?? -1;

        if ($request->boolean('is_true')) {
            ApplicantQuestionOption::where('applicant_question_id', $questionId)->update(['is_true' => false]);
        }

        $option = ApplicantQuestionOption::create([
            'applicant_question_id' => $questionId,
            'text'                  => $request->text,
            'is_true'               => $request->boolean('is_true'),
            'image'                 => $request->image,
            'order'                 => $maxOrder + 1,
        ]);

        return response()->json(['success' => true, 'message' => 'Cavab əlavə edildi.', 'data' => $option], 201);
    }

    public function updateOption(Request $request, int $questionId, int $optionId): JsonResponse
    {
        $option = ApplicantQuestionOption::where('id', $optionId)
            ->where('applicant_question_id', $questionId)
            ->first();

        if (!$option) {
            return response()->json(['success' => false, 'message' => 'Cavab tapılmadı.'], 404);
        }

        $request->validate([
            'text'  => 'nullable|string',
            'image' => 'nullable|string',
        ]);

        if ($request->boolean('is_true')) {
            ApplicantQuestionOption::where('applicant_question_id', $questionId)->update(['is_true' => false]);
        }

        $option->update([
            'text'    => $request->text,
            'is_true' => $request->boolean('is_true'),
            'image'   => $request->image,
        ]);

        return response()->json(['success' => true, 'message' => 'Cavab yeniləndi.', 'data' => $option->fresh()]);
    }

    public function destroyOption(int $questionId, int $optionId): JsonResponse
    {
        $option = ApplicantQuestionOption::where('id', $optionId)
            ->where('applicant_question_id', $questionId)
            ->first();

        if (!$option) {
            return response()->json(['success' => false, 'message' => 'Cavab tapılmadı.'], 404);
        }

        $option->delete();

        return response()->json(['success' => true, 'message' => 'Cavab silindi.']);
    }

    public function reorderOptions(Request $request, int $questionId): JsonResponse
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer']);

        foreach ($request->ids as $index => $id) {
            ApplicantQuestionOption::where('id', $id)
                ->where('applicant_question_id', $questionId)
                ->update(['order' => $index]);
        }

        return response()->json(['success' => true, 'message' => 'Cavab sıralaması yeniləndi.']);
    }
}
