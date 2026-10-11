<?php

namespace App\Http\Controllers\Api\AdminApi;

use App\Http\Controllers\Controller;
use App\Services\Contracts\MagistraturaExampageServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MagistraturaExampageController extends Controller
{
    protected MagistraturaExampageServiceInterface $exampageService;

    public function __construct(MagistraturaExampageServiceInterface $exampageService)
    {
        $this->exampageService = $exampageService;
    }

    public function index(Request $request): JsonResponse
    {
        $result = $this->exampageService->listExampages($request->query('search'));
        return response()->json($result, $result['status_code']);
    }

    public function store(Request $request): JsonResponse
    {
        $result = $this->exampageService->createExampage($request->all());
        return response()->json($result, $result['status_code']);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $result = $this->exampageService->updateExampage($id, $request->all());
        return response()->json($result, $result['status_code']);
    }

    public function destroy(int $id): JsonResponse
    {
        $result = $this->exampageService->deleteExampage($id);
        return response()->json($result, $result['status_code']);
    }

    public function syncSubjects(Request $request, int $id): JsonResponse
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'subject_ids'   => 'required|array',
            'subject_ids.*' => 'integer|exists:magistratura_subjects,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $result = $this->exampageService->syncSubjects($id, $request->get('subject_ids'));
        return response()->json($result, $result['status_code']);
    }

    public function listSubjects(int $id): JsonResponse
    {
        $result = $this->exampageService->listSubjects($id);
        return response()->json($result, $result['status_code']);
    }
}
