<?php

namespace App\Http\Controllers\Api\AdminApi;

use App\Http\Controllers\Controller;
use App\Models\MiqExampage;
use App\Models\MiqQuestionType;
use App\Services\Contracts\MiqDirectQuestionServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MiqDirectQuestionController extends Controller
{
    public function __construct(
        protected MiqDirectQuestionServiceInterface $questionService
    ) {}

    public function index(int $exampageId, int $questionTypeId): JsonResponse
    {
        $exampage     = MiqExampage::find($exampageId);
        $questionType = MiqQuestionType::find($questionTypeId);

        $questions = $this->questionService->getQuestions($exampageId, $questionTypeId);

        return response()->json([
            'success'       => true,
            'exampage'      => $exampage,
            'question_type' => $questionType,
            'data'          => $questions,
        ]);
    }

    public function store(Request $request, int $exampageId, int $questionTypeId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'text'  => 'nullable|string',
            'image' => 'nullable|image|max:4096',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        try {
            $question = $this->questionService->createQuestion([
                'miq_exampage_id'      => $exampageId,
                'miq_question_type_id' => $questionTypeId,
                'text'                 => $request->input('text'),
                'image'                => $request->file('image'),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Sual uğurla əlavə olundu.',
                'data'    => $question,
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, int $exampageId, int $questionTypeId, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'text'  => 'nullable|string',
            'image' => 'nullable',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        $data = ['text' => $request->input('text')];

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image');
        } elseif ($request->input('image_removed') === 'true') {
            $data['image'] = null;
        }

        try {
            $question = $this->questionService->updateQuestion($id, $data);

            return response()->json([
                'success' => true,
                'message' => 'Sual uğurla yeniləndi.',
                'data'    => $question,
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy(int $exampageId, int $questionTypeId, int $id): JsonResponse
    {
        $deleted = $this->questionService->deleteQuestion($id);

        if (!$deleted) {
            return response()->json(['success' => false, 'message' => 'Sual tapılmadı.'], 404);
        }

        return response()->json(['success' => true, 'message' => 'Sual uğurla silindi.']);
    }

    public function reorder(Request $request, int $exampageId, int $questionTypeId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'ids'   => 'required|array',
            'ids.*' => 'integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        try {
            $this->questionService->reorderQuestions($request->input('ids'));
            return response()->json(['success' => true, 'message' => 'Sıralama uğurla yadda saxlanıldı.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
