<?php

namespace App\Http\Controllers\Api\AdminApi;

use App\Http\Controllers\Controller;
use App\Models\HomeFeature;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class HomeFeatureController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => HomeFeature::orderBy('order')->get(),
            'status_code' => 200,
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'icon' => 'required|string|in:' . implode(',', HomeFeature::ICONS),
            'title' => 'required|string|max:100',
            'description' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $feature = HomeFeature::create($request->only(['icon', 'title', 'description']));

        return response()->json([
            'success' => true,
            'message' => 'Xüsusiyyət uğurla əlavə olundu.',
            'data' => $feature,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $feature = HomeFeature::find($id);
        if (!$feature) {
            return response()->json(['success' => false, 'message' => 'Xüsusiyyət tapılmadı.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'icon' => 'required|string|in:' . implode(',', HomeFeature::ICONS),
            'title' => 'required|string|max:100',
            'description' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $feature->update($request->only(['icon', 'title', 'description']));

        return response()->json([
            'success' => true,
            'message' => 'Xüsusiyyət yeniləndi.',
            'data' => $feature->fresh(),
        ], 200);
    }

    public function destroy(int $id): JsonResponse
    {
        $feature = HomeFeature::find($id);
        if (!$feature) {
            return response()->json(['success' => false, 'message' => 'Xüsusiyyət tapılmadı.'], 404);
        }

        $feature->delete();

        return response()->json(['success' => true, 'message' => 'Xüsusiyyət silindi.'], 200);
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
            HomeFeature::where('id', $id)->update(['order' => $index]);
        }

        return response()->json(['success' => true, 'message' => 'Ardıcıllıq yeniləndi.'], 200);
    }
}
