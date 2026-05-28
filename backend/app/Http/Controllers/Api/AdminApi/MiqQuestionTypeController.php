<?php

namespace App\Http\Controllers\Api\AdminApi;

use App\Http\Controllers\Controller;
use App\Services\Contracts\MiqQuestionTypeServiceInterface;
use Illuminate\Http\JsonResponse;

class MiqQuestionTypeController extends Controller
{
    protected MiqQuestionTypeServiceInterface $questionTypeService;

    public function __construct(MiqQuestionTypeServiceInterface $questionTypeService)
    {
        $this->questionTypeService = $questionTypeService;
    }

    public function show(int $exampageId): JsonResponse
    {
        $result = $this->questionTypeService->getOrSeedQuestionTypes($exampageId);
        return response()->json($result, $result['status_code']);
    }
}
