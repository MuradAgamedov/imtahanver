<?php

namespace App\Http\Controllers\Api\Front;

use App\Http\Controllers\Controller;
use App\Services\Contracts\ProfileServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    protected ProfileServiceInterface $profileService;

    public function __construct(ProfileServiceInterface $profileService)
    {
        $this->profileService = $profileService;
    }

    public function getCategories(): JsonResponse
    {
        $result = $this->profileService->getUserCategories();
        return response()->json($result, $result['status_code']);
    }

    public function updateCategory(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'identify' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $userId = $request->user()->id;
        $result = $this->profileService->updateCategory($userId, $request->input('identify'));

        return response()->json($result, $result['status_code']);
    }

    public function updateName(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|min:2|max:50',
            'last_name' => 'required|string|min:2|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $userId = $request->user()->id;
        $result = $this->profileService->updateName(
            $userId,
            $request->input('first_name'),
            $request->input('last_name')
        );

        return response()->json($result, $result['status_code']);
    }

    public function requestEmailChange(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $userId = $request->user()->id;
        $result = $this->profileService->requestEmailChange($userId, $request->input('email'));

        return response()->json($result, $result['status_code']);
    }

    public function confirmEmailChange(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $userId = $request->user()->id;
        $result = $this->profileService->confirmEmailChange(
            $userId,
            $request->input('email'),
            $request->input('otp')
        );

        return response()->json($result, $result['status_code']);
    }

    public function requestPasswordChange(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $result = $this->profileService->requestPasswordChange($userId);

        return response()->json($result, $result['status_code']);
    }

    public function confirmPasswordChange(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'password' => 'required|string|min:8',
            'otp' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $userId = $request->user()->id;
        $result = $this->profileService->confirmPasswordChange(
            $userId,
            $request->input('password'),
            $request->input('otp')
        );

        return response()->json($result, $result['status_code']);
    }

    public function getProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'user_category_identify' => $user->user_category_identify,
            ]
        ], 200);
    }
}
