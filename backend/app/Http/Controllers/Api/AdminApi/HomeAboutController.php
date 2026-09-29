<?php

namespace App\Http\Controllers\Api\AdminApi;

use App\Http\Controllers\Controller;
use App\Models\HomeAbout;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class HomeAboutController extends Controller
{
    public function show(): JsonResponse
    {
        $about = HomeAbout::first();

        return response()->json([
            'success' => true,
            'data' => $about,
            'status_code' => 200,
        ], 200);
    }

    public function update(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'heading' => 'required|string|max:255',
            'intro' => 'required|string|max:2000',
            'body' => 'required|string',
            'mission_heading' => 'nullable|string|max:255',
            'mission_text' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $about = HomeAbout::first();
        if (!$about) {
            $about = new HomeAbout();
        }

        $about->fill($request->only(['heading', 'intro', 'body', 'mission_heading', 'mission_text']));
        $about->save();

        return response()->json([
            'success' => true,
            'message' => 'Haqqımızda bölməsi yeniləndi.',
            'data' => $about->fresh(),
        ], 200);
    }
}
