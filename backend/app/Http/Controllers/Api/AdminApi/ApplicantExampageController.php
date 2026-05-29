<?php

namespace App\Http\Controllers\Api\AdminApi;

use App\Http\Controllers\Controller;
use App\Services\Contracts\ApplicantExampageServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicantExampageController extends Controller
{
    protected ApplicantExampageServiceInterface $exampageService;

    public function __construct(ApplicantExampageServiceInterface $exampageService)
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
}
