<?php

namespace App\Http\Controllers\Api\AdminApi;

use App\Http\Controllers\Controller;
use App\Models\BuraxilisExampage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BuraxilisExampageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $query = BuraxilisExampage::with('subjects')->orderBy('id', 'desc');

        if ($search) {
            $query->where('title', 'like', '%' . $search . '%');
        }

        $exampages = $query->get();
        return response()->json(['success' => true, 'data' => $exampages, 'status_code' => 200]);
    }

    public function store(Request $request): JsonResponse
    {
        $exampage = BuraxilisExampage::create([
            'title' => '',
            'exam_duration' => 180,
            'is_demo' => true,
        ]);

        return response()->json([
            'success'     => true,
            'message'     => 'İmtahan vərəqi uğurla yaradıldı.',
            'data'        => $exampage->fresh()->load('subjects'),
            'status_code' => 201,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $exampage = BuraxilisExampage::find($id);
        if (!$exampage) {
            return response()->json(['success' => false, 'message' => 'Vərəq tapılmadı.'], 404);
        }

        $isDemo = $request->has('is_demo') ? (bool) $request->is_demo : $exampage->is_demo;

        $exampage->update([
            'title'         => $request->title ?? $exampage->title,
            'exam_duration' => $request->exam_duration ? (int) $request->exam_duration : $exampage->exam_duration,
            'is_demo'       => $isDemo,
            'starts_at'     => $isDemo ? null : ($request->starts_at ?: null),
            'price'         => $isDemo ? null : ($request->price ? (float) $request->price : null),
        ]);

        return response()->json([
            'success'     => true,
            'message'     => 'İmtahan vərəqi yeniləndi.',
            'data'        => $exampage->fresh()->load('subjects'),
            'status_code' => 200,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $exampage = BuraxilisExampage::find($id);
        if (!$exampage) {
            return response()->json(['success' => false, 'message' => 'Vərəq tapılmadı.'], 404);
        }

        $exampage->delete();
        return response()->json(['success' => true, 'message' => 'İmtahan vərəqi silindi.', 'status_code' => 200]);
    }

    public function syncSubjects(Request $request, int $id): JsonResponse
    {
        $exampage = BuraxilisExampage::find($id);
        if (!$exampage) {
            return response()->json(['success' => false, 'message' => 'Vərəq tapılmadı.'], 404);
        }

        $request->validate(['subject_ids' => 'required|array']);
        $exampage->subjects()->sync($request->subject_ids);

        return response()->json([
            'success'     => true,
            'message'     => 'Fənlər uğurla yeniləndi.',
            'data'        => $exampage->fresh()->load('subjects'),
            'status_code' => 200,
        ]);
    }

    public function listSubjects(int $id): JsonResponse
    {
        $exampage = BuraxilisExampage::find($id);
        if (!$exampage) {
            return response()->json(['success' => false, 'message' => 'Vərəq tapılmadı.'], 404);
        }

        return response()->json([
            'success'     => true,
            'data'        => $exampage->subjects()->orderBy('buraxilis_exampage_subject.order')->get(),
            'status_code' => 200,
        ]);
    }
}
