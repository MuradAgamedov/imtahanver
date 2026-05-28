<?php

namespace App\Http\Controllers\Api\AdminApi;

use App\Http\Controllers\Controller;
use App\Models\ExamSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExamResultController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ExamSession::with(['user', 'exampage', 'subject'])
            ->orderBy('created_at', 'desc');

        // Optional filtering by user name or email
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Optional filtering by status (active or completed)
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $results = $query->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $results,
        ]);
    }
}
