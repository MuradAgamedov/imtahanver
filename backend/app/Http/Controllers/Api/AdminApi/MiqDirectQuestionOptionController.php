<?php

namespace App\Http\Controllers\Api\AdminApi;

use App\Http\Controllers\Controller;
use App\Models\MiqDirectQuestion;
use App\Services\Contracts\MiqDirectQuestionOptionServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MiqDirectQuestionOptionController extends Controller
{
    public function __construct(
        protected MiqDirectQuestionOptionServiceInterface $optionService
    ) {}

    public function index(int $questionId): JsonResponse
    {
        $question = MiqDirectQuestion::find($questionId);
        if (!$question) {
            return response()->json(['success' => false, 'message' => 'Sual tapılmadı.'], 404);
        }

        return response()->json([
            'success'  => true,
            'question' => $question,
            'data'     => $this->optionService->getOptions($questionId),
        ]);
    }

    public function store(Request $request, int $questionId): JsonResponse
    {
        $question = MiqDirectQuestion::find($questionId);
        if (!$question) {
            return response()->json(['success' => false, 'message' => 'Sual tapılmadı.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'text'    => 'nullable|string',
            'is_true' => 'nullable|boolean',
            'image'   => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        try {
            $option = $this->optionService->createOption($questionId, [
                'text'    => $request->input('text'),
                'is_true' => $request->boolean('is_true', false),
                'image'   => $request->input('image'),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Cavab uğurla əlavə olundu.',
                'data'    => $option,
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, int $questionId, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'text'    => 'nullable|string',
            'is_true' => 'nullable|boolean',
            'image'   => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        try {
            $option = $this->optionService->updateOption($id, [
                'text'    => $request->input('text'),
                'is_true' => $request->boolean('is_true', false),
                'image'   => $request->input('image'),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Cavab uğurla yeniləndi.',
                'data'    => $option,
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy(int $questionId, int $id): JsonResponse
    {
        $deleted = $this->optionService->deleteOption($id);

        if (!$deleted) {
            return response()->json(['success' => false, 'message' => 'Cavab tapılmadı.'], 404);
        }

        return response()->json(['success' => true, 'message' => 'Cavab uğurla silindi.']);
    }

    public function reorder(Request $request, int $questionId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'ids'   => 'required|array',
            'ids.*' => 'integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        try {
            $this->optionService->reorderOptions($request->input('ids'));
            return response()->json(['success' => true, 'message' => 'Sıralama yadda saxlanıldı.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
