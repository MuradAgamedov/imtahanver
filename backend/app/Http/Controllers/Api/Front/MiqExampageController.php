<?php

namespace App\Http\Controllers\Api\Front;

use App\Http\Controllers\Controller;
use App\Services\Contracts\MiqExampageServiceInterface;
use Illuminate\Http\JsonResponse;

class MiqExampageController extends Controller
{
    protected MiqExampageServiceInterface $exampageService;

    public function __construct(MiqExampageServiceInterface $exampageService)
    {
        $this->exampageService = $exampageService;
    }

    /**
     * Public exam-paper listing (used by the "Vərəq Seçimi" screen).
     * Both demo and paid papers are shown — paid ones are gated behind
     * registration/payment and their scheduled start time client-side.
     */
    public function index(): JsonResponse
    {
        $result = $this->exampageService->listExampages();
        return response()->json($result, $result['status_code']);
    }
}
