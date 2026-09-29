<?php

namespace App\Http\Controllers\Api\AdminApi;

use App\Http\Controllers\Controller;
use App\Models\HomeFaq;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class HomeFaqController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => HomeFaq::orderBy('order')->get(),
            'status_code' => 200,
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'question' => 'required|string|max:255',
            'answer' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $faq = HomeFaq::create($request->only(['question', 'answer']));

        return response()->json([
            'success' => true,
            'message' => 'Sual uğurla əlavə olundu.',
            'data' => $faq,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $faq = HomeFaq::find($id);
        if (!$faq) {
            return response()->json(['success' => false, 'message' => 'Sual tapılmadı.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'question' => 'required|string|max:255',
            'answer' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $faq->update($request->only(['question', 'answer']));

        return response()->json([
            'success' => true,
            'message' => 'Sual yeniləndi.',
            'data' => $faq->fresh(),
        ], 200);
    }

    public function destroy(int $id): JsonResponse
    {
        $faq = HomeFaq::find($id);
        if (!$faq) {
            return response()->json(['success' => false, 'message' => 'Sual tapılmadı.'], 404);
        }

        $faq->delete();

        return response()->json(['success' => true, 'message' => 'Sual silindi.'], 200);
    }

    public function reorder(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        foreach ($request->get('ids') as $index => $id) {
            HomeFaq::where('id', $id)->update(['order' => $index]);
        }

        return response()->json(['success' => true, 'message' => 'Ardıcıllıq yeniləndi.'], 200);
    }
}
