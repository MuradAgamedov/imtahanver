<?php

namespace App\Http\Controllers\Api\AdminApi;

use App\Http\Controllers\Controller;
use App\Services\Contracts\MiqExampageSubjectServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MiqExampageSubjectController extends Controller
{
    protected MiqExampageSubjectServiceInterface $associationService;

    public function __construct(MiqExampageSubjectServiceInterface $associationService)
    {
        $this->associationService = $associationService;
    }

    public function index(int $exampageId): JsonResponse
    {
        $result = $this->associationService->listAssociatedSubjects($exampageId);
        return response()->json($result, $result['status_code']);
    }

    public function store(Request $request, int $exampageId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'miq_subject_id' => 'required|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $result = $this->associationService->associateSubject($exampageId, $request->get('miq_subject_id'));
        return response()->json($result, $result['status_code']);
    }

    public function destroy(int $exampageId, int $subjectId): JsonResponse
    {
        $result = $this->associationService->dissociateSubject($exampageId, $subjectId);
        return response()->json($result, $result['status_code']);
    }
}
