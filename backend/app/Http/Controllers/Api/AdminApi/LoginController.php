<?php

namespace App\Http\Controllers\Api\AdminApi;

use App\Http\Controllers\Controller;
use App\Services\Contracts\AdminAuthServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LoginController extends Controller
{
    protected AdminAuthServiceInterface $adminAuthService;

    public function __construct(AdminAuthServiceInterface $adminAuthService)
    {
        $this->adminAuthService = $adminAuthService;
    }

    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $result = $this->adminAuthService->login(
            $request->input('email'),
            $request->input('password')
        );

        return response()->json($result, $result['status_code']);
    }
}
