<?php

namespace App\Http\Controllers\Api\AdminApi;

use App\Http\Controllers\Controller;
use App\Models\BuraxilisQuestion;
use App\Models\BuraxilisQuestionOption;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BuraxilisQuestionController extends Controller
{
    public function index(int $exampageId, int $subjectId): JsonResponse
    {
        $questions = BuraxilisQuestion::with(['options', 'passage'])
            ->where('buraxilis_exampage_id', $exampageId)
            ->where('buraxilis_subject_id', $subjectId)
            ->orderBy('question_type')
            ->orderBy(DB::raw('COALESCE(buraxilis_question_passage_id, id)'))
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
            'limits'  => BuraxilisQuestion::TYPE_LIMITS,
            'labels'  => BuraxilisQuestion::TYPE_LABELS,
        ]);
    }

    public function store(Request $request, int $exampageId, int $subjectId): JsonResponse
    {
        $request->validate([
            'question_type'                 => 'required|integer|in:1,2,3',
            'title'                          => 'nullable|string',
            'buraxilis_question_passage_id' => 'nullable|integer|exists:buraxilis_question_passages,id',
        ]);

        $type = (int) $request->question_type;
        $maxOrder = BuraxilisQuestion::where('buraxilis_exampage_id', $exampageId)
            ->where('buraxilis_subject_id', $subjectId)
            ->where('question_type', $type)
            ->max('order') ?? -1;

        $question = BuraxilisQuestion::create([
            'buraxilis_exampage_id'         => $exampageId,
            'buraxilis_subject_id'          => $subjectId,
            'buraxilis_question_passage_id' => $request->buraxilis_question_passage_id ?? null,
            'question_type'                 => $type,
            'title'                         => $request->title,
            'image'                         => $request->image ?? null,
            'audio'                         => $request->audio ?? null,
            'order'                         => $maxOrder + 1,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Sual əlavə edildi.',
            'data'    => $question->load('options'),
        ], 201);
    }

    public function update(Request $request, int $exampageId, int $subjectId, int $id): JsonResponse
    {
        $question = BuraxilisQuestion::where('id', $id)
            ->where('buraxilis_exampage_id', $exampageId)
            ->where('buraxilis_subject_id', $subjectId)
            ->first();

        if (!$question) {
            return response()->json(['success' => false, 'message' => 'Sual tapılmadı.'], 404);
        }

        $question->update([
            'title'                         => $request->title,
            'image'                         => $request->has('image') ? $request->image : $question->image,
            'audio'                         => $request->has('audio') ? $request->audio : $question->audio,
            'buraxilis_question_passage_id' => $request->has('buraxilis_question_passage_id') ? $request->buraxilis_question_passage_id : $question->buraxilis_question_passage_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Sual yeniləndi.',
            'data'    => $question->fresh()->load('options'),
        ]);
    }

    public function destroy(int $exampageId, int $subjectId, int $id): JsonResponse
    {
        $question = BuraxilisQuestion::where('id', $id)
            ->where('buraxilis_exampage_id', $exampageId)
            ->where('buraxilis_subject_id', $subjectId)
            ->first();

        if (!$question) {
            return response()->json(['success' => false, 'message' => 'Sual tapılmadı.'], 404);
        }

        $question->delete();
        return response()->json(['success' => true, 'message' => 'Sual silindi.']);
    }

    public function reorder(Request $request, int $exampageId, int $subjectId): JsonResponse
    {
        $request->validate(['ids' => 'required|array']);
        foreach ($request->ids as $idx => $id) {
            BuraxilisQuestion::where('id', $id)
                ->where('buraxilis_exampage_id', $exampageId)
                ->where('buraxilis_subject_id', $subjectId)
                ->update(['order' => $idx + 1]);
        }
        return response()->json(['success' => true, 'message' => 'Sıralama yeniləndi.']);
    }

    // ── Options ──
    public function storeOption(Request $request, int $questionId): JsonResponse
    {
        $question = BuraxilisQuestion::find($questionId);
        if (!$question) {
            return response()->json(['success' => false, 'message' => 'Sual tapılmadı.'], 404);
        }

        $maxOrder = BuraxilisQuestionOption::where('buraxilis_question_id', $questionId)->max('order') ?? -1;

        $option = BuraxilisQuestionOption::create([
            'buraxilis_question_id' => $questionId,
            'text'                  => $request->text,
            'image'                 => $request->image ?? null,
            'is_true'               => (bool) $request->is_true,
            'order'                 => $maxOrder + 1,
        ]);

        return response()->json(['success' => true, 'data' => $option], 201);
    }

    public function updateOption(Request $request, int $questionId, int $optionId): JsonResponse
    {
        $option = BuraxilisQuestionOption::where('id', $optionId)->where('buraxilis_question_id', $questionId)->first();
        if (!$option) {
            return response()->json(['success' => false, 'message' => 'Variant tapılmadı.'], 404);
        }

        $option->update([
            'text'    => $request->text,
            'image'   => $request->has('image') ? $request->image : $option->image,
            'is_true' => (bool) $request->is_true,
        ]);

        return response()->json(['success' => true, 'data' => $option]);
    }

    public function destroyOption(int $questionId, int $optionId): JsonResponse
    {
        $option = BuraxilisQuestionOption::where('id', $optionId)->where('buraxilis_question_id', $questionId)->first();
        if (!$option) {
            return response()->json(['success' => false, 'message' => 'Variant tapılmadı.'], 404);
        }

        $option->delete();
        return response()->json(['success' => true, 'message' => 'Variant silindi.']);
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate(['image' => 'required|image|max:10240']);
        $path = $request->file('image')->store('buraxilis_questions/images', 'public');
        return response()->json(['success' => true, 'path' => '/storage/' . $path]);
    }

    public function uploadAudio(Request $request): JsonResponse
    {
        $request->validate(['audio' => 'required|mimes:mp3,wav,ogg,m4a,aac|max:20480']);
        $path = $request->file('audio')->store('buraxilis_questions/audio', 'public');
        return response()->json(['success' => true, 'path' => '/storage/' . $path]);
    }
}
