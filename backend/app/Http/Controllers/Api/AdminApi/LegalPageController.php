<?php

namespace App\Http\Controllers\Api\AdminApi;

use App\Http\Controllers\Controller;
use App\Models\LegalPage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LegalPageController extends Controller
{
    public const SLUGS = ['privacy', 'terms', 'refund'];

    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => LegalPage::whereIn('slug', self::SLUGS)->get(),
            'status_code' => 200,
        ], 200);
    }

    public function show(string $slug): JsonResponse
    {
        if (!in_array($slug, self::SLUGS, true)) {
            return response()->json(['success' => false, 'message' => 'Səhifə tapılmadı.'], 404);
        }

        $page = LegalPage::where('slug', $slug)->first();

        return response()->json([
            'success' => true,
            'data' => $page,
            'status_code' => 200,
        ], 200);
    }

    public function update(Request $request, string $slug): JsonResponse
    {
        if (!in_array($slug, self::SLUGS, true)) {
            return response()->json(['success' => false, 'message' => 'Səhifə tapılmadı.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'heading' => 'required|string|max:255',
            'body' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $page = LegalPage::where('slug', $slug)->first();
        if (!$page) {
            $page = new LegalPage(['slug' => $slug]);
        }

        $page->fill($request->only(['heading', 'body']));
        $page->save();

        return response()->json([
            'success' => true,
            'message' => 'Səhifə yeniləndi.',
            'data' => $page->fresh(),
        ], 200);
    }
}
