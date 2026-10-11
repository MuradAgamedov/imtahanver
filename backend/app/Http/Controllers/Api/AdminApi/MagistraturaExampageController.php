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

    public function syncGroups(Request $request, int $id): JsonResponse
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'group_ids'   => 'required|array',
            'group_ids.*' => 'integer|exists:magistratura_groups,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $result = $this->exampageService->syncGroups($id, $request->get('group_ids'));
        return response()->json($result, $result['status_code']);
    }
}
