<?php

namespace App\Http\Controllers\Api\AdminApi;

use App\Http\Controllers\Controller;
use App\Services\Contracts\ApplicantGroupServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ApplicantGroupController extends Controller
{
    protected ApplicantGroupServiceInterface $groupService;

    public function __construct(ApplicantGroupServiceInterface $groupService)
    {
        $this->groupService = $groupService;
    }

    public function index(Request $request): JsonResponse
    {
        $result = $this->groupService->listGroups($request->query('search'));
        return response()->json($result, $result['status_code']);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title'    => 'required|string|max:150',
            'identify' => 'nullable|string|max:150',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $result = $this->groupService->createGroup($request->all());
        return response()->json($result, $result['status_code']);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title'    => 'required|string|max:150',
            'identify' => 'nullable|string|max:150',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $result = $this->groupService->updateGroup($id, $request->all());
        return response()->json($result, $result['status_code']);
    }

    public function destroy(int $id): JsonResponse
    {
        $result = $this->groupService->deleteGroup($id);
        return response()->json($result, $result['status_code']);
    }

    public function reorder(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'ids'   => 'required|array',
            'ids.*' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $result = $this->groupService->reorderGroups($request->get('ids'));
        return response()->json($result, $result['status_code']);
    }

    public function syncSubjects(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'subject_ids'   => 'required|array',
            'subject_ids.*' => 'integer|exists:applicant_subjects,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $result = $this->groupService->syncSubjects($id, $request->get('subject_ids'));
        return response()->json($result, $result['status_code']);
    }
}
