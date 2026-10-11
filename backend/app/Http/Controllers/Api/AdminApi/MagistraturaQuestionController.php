<?php

namespace App\Http\Controllers\Api\AdminApi;

use App\Http\Controllers\Controller;
use App\Models\MagistraturaQuestion;
use App\Models\MagistraturaQuestionOption;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MagistraturaQuestionController extends Controller
{
    // ─── Questions ───────────────────────────────────────────────────────────

    public function index(int $exampageId, int $subjectId): JsonResponse
    {
        $questions = MagistraturaQuestion::with(['options', 'passage'])
            ->where('magistratura_exampage_id', $exampageId)
            ->where('magistratura_subject_id', $subjectId)
            ->orderBy('question_type')
            ->orderBy(DB::raw('COALESCE(magistratura_question_passage_id, id)'))
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
            'limits'  => MagistraturaQuestion::TYPE_LIMITS,
            'labels'  => MagistraturaQuestion::TYPE_LABELS,
        ]);
    }

    public function store(Request $request, int $exampageId, int $subjectId): JsonResponse
    {
        $request->validate([
            'question_type'                  => 'required|integer|in:1,2,3',
            'title'                           => 'nullable|string',
            'magistratura_question_passage_id'   => 'nullable|integer|exists:magistratura_question_passages,id',
        ]);

        if ($request->magistratura_question_passage_id) {
            $passageBelongs = \App\Models\MagistraturaQuestionPassage::where('id', $request->magistratura_question_passage_id)
                ->where('magistratura_exampage_id', $exampageId)
                ->where('magistratura_subject_id', $subjectId)
                ->exists();

            if (!$passageBelongs) {
                return response()->json(['success' => false, 'message' => 'Keçid tapılmadı.'], 422);
            }
        }

        $type = (int) $request->question_type;
        $limit = MagistraturaQuestion::TYPE_LIMITS[$type];

        $existingCount = MagistraturaQuestion::where('magistratura_exampage_id', $exampageId)
            ->where('magistratura_subject_id', $subjectId)
            ->where('question_type', $type)
            ->count();

        if ($existingCount >= $limit) {
            return response()->json([
                'success' => false,
                'message' => MagistraturaQuestion::TYPE_LABELS[$type] . " üçün maksimum sual limiti ({$limit}) aşılıb.",
            ], 422);
        }

        $maxOrder = MagistraturaQuestion::where('magistratura_exampage_id', $exampageId)
            ->where('magistratura_subject_id', $subjectId)
            ->where('question_type', $type)
            ->max('order') ?? -1;

        $question = MagistraturaQuestion::create([
            'magistratura_exampage_id'          => $exampageId,
            'magistratura_subject_id'           => $subjectId,
            'magistratura_question_passage_id'  => $request->magistratura_question_passage_id ?? null,
            'question_type'                  => $type,
            'title'                          => $request->title,
            'image'                          => $request->image ?? null,
            'audio'                          => $request->audio ?? null,
            'order'                          => $maxOrder + 1,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Sual əlavə edildi.',
            'data'    => $question->load('options'),
        ], 201);
    }

    public function update(Request $request, int $exampageId, int $subjectId, int $id): JsonResponse
    {
        $question = MagistraturaQuestion::where('id', $id)
            ->where('magistratura_exampage_id', $exampageId)
            ->where('magistratura_subject_id', $subjectId)
            ->first();

        if (!$question) {
            return response()->json(['success' => false, 'message' => 'Sual tapılmadı.'], 404);
        }

        $request->validate([
            'title'                          => 'nullable|string',
            'magistratura_question_passage_id'  => 'nullable|integer|exists:magistratura_question_passages,id',
        ]);

        if ($request->filled('magistratura_question_passage_id')) {
            $passageBelongs = \App\Models\MagistraturaQuestionPassage::where('id', $request->magistratura_question_passage_id)
                ->where('magistratura_exampage_id', $exampageId)
                ->where('magistratura_subject_id', $subjectId)
                ->exists();

            if (!$passageBelongs) {
                return response()->json(['success' => false, 'message' => 'Keçid tapılmadı.'], 422);
            }
        }

        $question->update([
            'title' => $request->title,
            'image' => $request->image ?? $question->image,
            'audio' => $request->audio ?? $question->audio,
            'magistratura_question_passage_id' => $request->has('magistratura_question_passage_id')
                ? $request->magistratura_question_passage_id
                : $question->magistratura_question_passage_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Sual yeniləndi.',
            'data'    => $question->fresh()->load('options'),
        ]);
    }

    public function destroy(int $exampageId, int $subjectId, int $id): JsonResponse
    {
        $question = MagistraturaQuestion::where('id', $id)
            ->where('magistratura_exampage_id', $exampageId)
            ->where('magistratura_subject_id', $subjectId)
            ->first();

        if (!$question) {
            return response()->json(['success' => false, 'message' => 'Sual tapılmadı.'], 404);
        }

        $question->delete();

        return response()->json(['success' => true, 'message' => 'Sual silindi.']);
    }

    public function reorder(Request $request, int $exampageId, int $subjectId): JsonResponse
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer']);

        foreach ($request->ids as $index => $id) {
            MagistraturaQuestion::where('id', $id)
                ->where('magistratura_exampage_id', $exampageId)
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

        $path = $request->file('image')->store('magistratura-questions', 'public');

        return response()->json([
            'success' => true,
            'path'    => 'storage/' . $path,
        ]);
    }

    public function uploadAudio(Request $request): JsonResponse
    {
        $request->validate([
            'audio' => 'required|mimes:mp3,wav,ogg,m4a,aac',
        ]);

        $path = $request->file('audio')->store('magistratura-audio', 'public');

        return response()->json([
            'success' => true,
            'path'    => 'storage/' . $path,
        ]);
    }

    // ─── Options (type 1 only) ────────────────────────────────────────────────

    public function indexOptions(int $questionId): JsonResponse
    {
        $question = MagistraturaQuestion::find($questionId);
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
        $question = MagistraturaQuestion::find($questionId);
        if (!$question || $question->question_type !== 1) {
            return response()->json(['success' => false, 'message' => 'Sual tapılmadı və ya tip 1 deyil.'], 404);
        }

        $request->validate([
            'text'    => 'nullable|string',
            'is_true' => 'boolean',
            'image'   => 'nullable|string',
        ]);

        $maxOrder = MagistraturaQuestionOption::where('magistratura_question_id', $questionId)->max('order') ?? -1;

        if ($request->boolean('is_true')) {
            MagistraturaQuestionOption::where('magistratura_question_id', $questionId)->update(['is_true' => false]);
        }

        $option = MagistraturaQuestionOption::create([
            'magistratura_question_id' => $questionId,
            'text'                  => $request->text,
            'is_true'               => $request->boolean('is_true'),
            'image'                 => $request->image,
            'order'                 => $maxOrder + 1,
        ]);

        return response()->json(['success' => true, 'message' => 'Cavab əlavə edildi.', 'data' => $option], 201);
    }

    public function updateOption(Request $request, int $questionId, int $optionId): JsonResponse
    {
        $option = MagistraturaQuestionOption::where('id', $optionId)
            ->where('magistratura_question_id', $questionId)
            ->first();

        if (!$option) {
            return response()->json(['success' => false, 'message' => 'Cavab tapılmadı.'], 404);
        }

        $request->validate([
            'text'  => 'nullable|string',
            'image' => 'nullable|string',
        ]);

        if ($request->boolean('is_true')) {
            MagistraturaQuestionOption::where('magistratura_question_id', $questionId)->update(['is_true' => false]);
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
        $option = MagistraturaQuestionOption::where('id', $optionId)
            ->where('magistratura_question_id', $questionId)
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
            MagistraturaQuestionOption::where('id', $id)
                ->where('magistratura_question_id', $questionId)
                ->update(['order' => $index]);
        }

        return response()->json(['success' => true, 'message' => 'Cavab sıralaması yeniləndi.']);
    }

    public function copyQuestions(Request $request, int $exampageId, int $subjectId): JsonResponse
    {
        $request->validate([
            'question_ids' => 'required|array|min:1',
            'question_ids.*' => 'integer|exists:magistratura_questions,id',
        ]);

        $maxOrder = MagistraturaQuestion::where('magistratura_exampage_id', $exampageId)
            ->where('magistratura_subject_id', $subjectId)
            ->max('order') ?? 0;

        $sourceQuestions = MagistraturaQuestion::with(['options'])
            ->whereIn('id', $request->question_ids)
            ->get();

        $copiedCount = 0;

        DB::transaction(function () use ($sourceQuestions, $exampageId, $subjectId, &$maxOrder, &$copiedCount) {
            foreach ($sourceQuestions as $src) {
                $maxOrder++;
                $newQuestion = MagistraturaQuestion::create([
                    'magistratura_exampage_id' => $exampageId,
                    'magistratura_subject_id' => $subjectId,
                    'magistratura_question_passage_id' => $src->magistratura_question_passage_id,
                    'question_type' => $src->question_type,
                    'title' => $src->title,
                    'description' => $src->description,
                    'image' => $src->image,
                    'audio' => $src->audio,
                    'order' => $maxOrder,
                ]);

                foreach ($src->options as $opt) {
                    MagistraturaQuestionOption::create([
                        'magistratura_question_id' => $newQuestion->id,
                        'text' => $opt->text,
                        'is_true' => (bool)$opt->is_true,
                        'image' => $opt->image,
                        'order' => $opt->order,
                    ]);
                }
                $copiedCount++;
            }
        });

        return response()->json([
            'success' => true,
            'message' => "{$copiedCount} sual uğurla bu vərəqə kopyalandı.",
        ]);
    }
}
