<?php

namespace App\Http\Controllers\Api\AdminApi;

use App\Http\Controllers\Controller;
use App\Services\Contracts\AdminUserServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    protected AdminUserServiceInterface $userService;

    public function __construct(AdminUserServiceInterface $userService)
    {
        $this->userService = $userService;
    }

    public function index(): JsonResponse
    {
        $result = $this->userService->listUsers();
        return response()->json($result, $result['status_code']);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:50',
            'last_name' => 'required|string|max:50',
            'email' => 'required|email',
            'password' => 'required|string|min:8',
            'user_category_identify' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $result = $this->userService->createUser($request->all());
        return response()->json($result, $result['status_code']);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:50',
            'last_name' => 'required|string|max:50',
            'email' => 'required|email',
            'password' => 'nullable|string|min:8',
            'user_category_identify' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $result = $this->userService->updateUser($id, $request->all());
        return response()->json($result, $result['status_code']);
    }

    public function destroy(int $id): JsonResponse
    {
        $result = $this->userService->deleteUser($id);
        return response()->json($result, $result['status_code']);
    }
}
