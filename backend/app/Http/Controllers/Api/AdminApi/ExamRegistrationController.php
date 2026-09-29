<?php

namespace App\Http\Controllers\Api\AdminApi;

use App\Http\Controllers\Controller;
use App\Services\Contracts\ExamRegistrationServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExamRegistrationController extends Controller
{
    protected ExamRegistrationServiceInterface $registrationService;

    public function __construct(ExamRegistrationServiceInterface $registrationService)
    {
        $this->registrationService = $registrationService;
    }

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'exam_type' => 'required|in:miq,applicant',
            'exampage_id' => 'required|integer',
        ]);

        $result = $this->registrationService->listForExampage(
            $request->query('exam_type'),
            (int) $request->query('exampage_id'),
            $request->query('search')
        );

        return response()->json($result, $result['status_code']);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'exam_type' => 'required|in:miq,applicant',
            'exampage_id' => 'required|integer',
            'user_id' => 'required|integer|exists:users,id',
        ]);

        $result = $this->registrationService->adminRegister(
            $request->exam_type,
            (int) $request->exampage_id,
            (int) $request->user_id
        );

        return response()->json($result, $result['status_code']);
    }

    public function destroy(int $id): JsonResponse
    {
        $result = $this->registrationService->deleteRegistration($id);
        return response()->json($result, $result['status_code']);
    }
}
