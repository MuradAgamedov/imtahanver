<?php

namespace App\Http\Controllers\Api\AdminApi;

use App\Http\Controllers\Controller;
use App\Models\HomeCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class HomeCategoryController extends Controller
{
    public const COLORS = ['red', 'blue', 'navy', 'teal'];
    public const ICONS = ['rocket', 'cap', 'building', 'flag'];

    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => HomeCategory::orderBy('order')->get(),
            'status_code' => 200,
        ], 200);
    }

    private function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'badge' => 'required|string|max:50',
            'color' => 'required|string|in:' . implode(',', self::COLORS),
            'icon' => 'required|string|in:' . implode(',', self::ICONS),
            'href' => 'nullable|url|max:500',
            'active' => 'required|boolean',
        ];
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), $this->rules());

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $category = HomeCategory::create($request->only(['title', 'badge', 'color', 'icon', 'href', 'active']));

        return response()->json([
            'success' => true,
            'message' => 'Kateqoriya əlavə olundu.',
            'data' => $category,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $category = HomeCategory::find($id);
        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Kateqoriya tapılmadı.'], 404);
        }

        $validator = Validator::make($request->all(), $this->rules());

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $category->update($request->only(['title', 'badge', 'color', 'icon', 'href', 'active']));

        return response()->json([
            'success' => true,
            'message' => 'Kateqoriya yeniləndi.',
            'data' => $category->fresh(),
        ], 200);
    }

    public function destroy(int $id): JsonResponse
    {
        $category = HomeCategory::find($id);
        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Kateqoriya tapılmadı.'], 404);
        }

        $category->delete();

        return response()->json(['success' => true, 'message' => 'Kateqoriya silindi.'], 200);
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
            HomeCategory::where('id', $id)->update(['order' => $index]);
        }

        return response()->json(['success' => true, 'message' => 'Ardıcıllıq yeniləndi.'], 200);
    }
}
