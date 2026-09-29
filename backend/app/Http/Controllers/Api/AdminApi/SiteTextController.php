<?php

namespace App\Http\Controllers\Api\AdminApi;

use App\Http\Controllers\Controller;
use App\Models\SiteText;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SiteTextController extends Controller
{
    public function index(): JsonResponse
    {
        $texts = SiteText::all()->pluck('value', 'key');

        return response()->json([
            'success' => true,
            'data' => $texts,
            'status_code' => 200,
        ], 200);
    }

    public function update(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'texts' => 'required|array',
            'texts.*' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        foreach ($request->input('texts') as $key => $value) {
            SiteText::updateOrCreate(['key' => $key], ['value' => (string) $value]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Mətnlər yeniləndi.',
            'data' => SiteText::all()->pluck('value', 'key'),
        ], 200);
    }
}
