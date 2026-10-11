<?php

namespace App\Http\Controllers\Api\AdminApi;

use App\Http\Controllers\Controller;
use App\Models\BuraxilisSubject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BuraxilisSubjectController extends Controller
{
    public function index(): JsonResponse
    {
        $subjects = BuraxilisSubject::orderBy('order')->get();
        return response()->json(['success' => true, 'data' => $subjects]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title'    => 'required|string|max:255',
            'identify' => 'nullable|string|max:255',
        ]);

        $identify = $request->identify ?: \Illuminate\Support\Str::slug($request->title);
        $maxOrder = BuraxilisSubject::max('order') ?? 0;

        $subject = BuraxilisSubject::create([
            'title'    => $request->title,
            'identify' => $identify,
            'order'    => $maxOrder + 1,
        ]);

        return response()->json(['success' => true, 'message' => 'Fənn əlavə edildi.', 'data' => $subject], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $subject = BuraxilisSubject::find($id);
        if (!$subject) {
            return response()->json(['success' => false, 'message' => 'Fənn tapılmadı.'], 404);
        }

        $request->validate([
            'title'    => 'required|string|max:255',
            'identify' => 'nullable|string|max:255',
        ]);

        $subject->update([
            'title'    => $request->title,
            'identify' => $request->identify ?: $subject->identify,
        ]);

        return response()->json(['success' => true, 'message' => 'Fənn yeniləndi.', 'data' => $subject]);
    }

    public function destroy(int $id): JsonResponse
    {
        $subject = BuraxilisSubject::find($id);
        if (!$subject) {
            return response()->json(['success' => false, 'message' => 'Fənn tapılmadı.'], 404);
        }

        $subject->delete();
        return response()->json(['success' => true, 'message' => 'Fənn silindi.']);
    }

    public function reorder(Request $request): JsonResponse
    {
        $request->validate(['ids' => 'required|array']);
        foreach ($request->ids as $idx => $id) {
            BuraxilisSubject::where('id', $id)->update(['order' => $idx + 1]);
        }
        return response()->json(['success' => true, 'message' => 'Sıralama yeniləndi.']);
    }
}
