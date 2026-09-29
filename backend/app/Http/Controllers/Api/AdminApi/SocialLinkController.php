<?php

namespace App\Http\Controllers\Api\AdminApi;

use App\Http\Controllers\Controller;
use App\Models\SocialLink;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SocialLinkController extends Controller
{
    public const PLATFORMS = ['facebook', 'instagram', 'youtube', 'tiktok', 'telegram', 'whatsapp', 'linkedin', 'x'];

    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => SocialLink::orderBy('order')->get(),
            'status_code' => 200,
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'platform' => 'required|string|in:' . implode(',', self::PLATFORMS),
            'url' => 'required|url|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $link = SocialLink::create($request->only(['platform', 'url']));

        return response()->json([
            'success' => true,
            'message' => 'Sosial şəbəkə əlavə olundu.',
            'data' => $link,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $link = SocialLink::find($id);
        if (!$link) {
            return response()->json(['success' => false, 'message' => 'Sosial şəbəkə tapılmadı.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'platform' => 'required|string|in:' . implode(',', self::PLATFORMS),
            'url' => 'required|url|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $link->update($request->only(['platform', 'url']));

        return response()->json([
            'success' => true,
            'message' => 'Sosial şəbəkə yeniləndi.',
            'data' => $link->fresh(),
        ], 200);
    }

    public function destroy(int $id): JsonResponse
    {
        $link = SocialLink::find($id);
        if (!$link) {
            return response()->json(['success' => false, 'message' => 'Sosial şəbəkə tapılmadı.'], 404);
        }

        $link->delete();

        return response()->json(['success' => true, 'message' => 'Sosial şəbəkə silindi.'], 200);
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
            SocialLink::where('id', $id)->update(['order' => $index]);
        }

        return response()->json(['success' => true, 'message' => 'Ardıcıllıq yeniləndi.'], 200);
    }
}
