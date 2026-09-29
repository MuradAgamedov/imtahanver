<?php

namespace App\Http\Controllers\Api\Front;

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
        $result = $this->registrationService->listForUser($request->user());
        return response()->json($result, $result['status_code']);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $result = $this->registrationService->findForUser($request->user(), $id);
        return response()->json($result, $result['status_code']);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'exam_type' => 'required|in:miq,applicant',
            'exampage_id' => 'required|integer',
        ]);

        $result = $this->registrationService->register(
            $request->user(),
            $request->exam_type,
            (int) $request->exampage_id
        );

        if ($result['success'] && isset($result['data'])) {
            // Placeholder redirect target — swap for a real payment
            // gateway checkout URL once one is wired up.
            $result['payment_redirect_url'] = '/odenis/' . $result['data']->id;
        }

        return response()->json($result, $result['status_code']);
    }

    public function mockConfirm(Request $request, int $id): JsonResponse
    {
        $result = $this->registrationService->mockConfirmPayment($request->user(), $id);
        return response()->json($result, $result['status_code']);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $result = $this->registrationService->cancelRegistration($request->user(), $id);
        return response()->json($result, $result['status_code']);
    }
}
