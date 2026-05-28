<?php

use App\Http\Controllers\Api\Front\LoginController;
use App\Http\Controllers\Api\Front\RegisterController;
use App\Http\Controllers\Api\Front\ProfileController;
use App\Http\Middleware\JwtAuthMiddleware;
use Illuminate\Support\Facades\Route;

Route::prefix('front')->group(function () {
    // Guest routes
    Route::post('register', [RegisterController::class, 'register']);
    Route::post('verify-otp', [RegisterController::class, 'verifyOtp']);
    Route::post('login', [LoginController::class, 'login']);
    Route::get('user-categories', [ProfileController::class, 'getCategories']);

    // Authenticated routes
    Route::middleware(JwtAuthMiddleware::class)->group(function () {
        Route::get('profile', [ProfileController::class, 'getProfile']);
        Route::put('profile/category', [ProfileController::class, 'updateCategory']);
        Route::put('profile/name', [ProfileController::class, 'updateName']);
        Route::post('profile/email/request', [ProfileController::class, 'requestEmailChange']);
        Route::put('profile/email/confirm', [ProfileController::class, 'confirmEmailChange']);
        Route::post('profile/password/request', [ProfileController::class, 'requestPasswordChange']);
        Route::put('profile/password/confirm', [ProfileController::class, 'confirmPasswordChange']);
    });
});
