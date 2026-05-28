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
    Route::get('miq-subjects', [\App\Http\Controllers\Api\AdminApi\MiqSubjectController::class, 'index']);

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

Route::prefix('adminapi')->group(function () {
    Route::post('login', [\App\Http\Controllers\Api\AdminApi\LoginController::class, 'login']);

    Route::middleware(JwtAuthMiddleware::class)->group(function () {
        Route::get('users', [\App\Http\Controllers\Api\AdminApi\UserController::class, 'index']);
        Route::post('users', [\App\Http\Controllers\Api\AdminApi\UserController::class, 'store']);
        Route::put('users/{id}', [\App\Http\Controllers\Api\AdminApi\UserController::class, 'update']);
        Route::delete('users/{id}', [\App\Http\Controllers\Api\AdminApi\UserController::class, 'destroy']);

        Route::get('admins', [\App\Http\Controllers\Api\AdminApi\AdminController::class, 'index']);
        Route::post('admins', [\App\Http\Controllers\Api\AdminApi\AdminController::class, 'store']);
        Route::put('admins/{id}', [\App\Http\Controllers\Api\AdminApi\AdminController::class, 'update']);
        Route::delete('admins/{id}', [\App\Http\Controllers\Api\AdminApi\AdminController::class, 'destroy']);

        Route::get('user-categories', [\App\Http\Controllers\Api\AdminApi\UserCategoryController::class, 'index']);
        Route::post('user-categories', [\App\Http\Controllers\Api\AdminApi\UserCategoryController::class, 'store']);
        Route::put('user-categories/{id}', [\App\Http\Controllers\Api\AdminApi\UserCategoryController::class, 'update']);
        Route::delete('user-categories/{id}', [\App\Http\Controllers\Api\AdminApi\UserCategoryController::class, 'destroy']);

        Route::get('miq-subjects', [\App\Http\Controllers\Api\AdminApi\MiqSubjectController::class, 'index']);
        Route::post('miq-subjects', [\App\Http\Controllers\Api\AdminApi\MiqSubjectController::class, 'store']);
        Route::put('miq-subjects/reorder', [\App\Http\Controllers\Api\AdminApi\MiqSubjectController::class, 'reorder']);
        Route::put('miq-subjects/{id}', [\App\Http\Controllers\Api\AdminApi\MiqSubjectController::class, 'update']);
        Route::delete('miq-subjects/{id}', [\App\Http\Controllers\Api\AdminApi\MiqSubjectController::class, 'destroy']);

        Route::get('miq-exampages', [\App\Http\Controllers\Api\AdminApi\MiqExampageController::class, 'index']);
        Route::post('miq-exampages', [\App\Http\Controllers\Api\AdminApi\MiqExampageController::class, 'store']);
        Route::delete('miq-exampages/{id}', [\App\Http\Controllers\Api\AdminApi\MiqExampageController::class, 'destroy']);
        Route::get('miq-exampages/{exampageId}/question-types', [\App\Http\Controllers\Api\AdminApi\MiqQuestionTypeController::class, 'show']);

        Route::get('miq-exampages/{exampageId}/subjects', [\App\Http\Controllers\Api\AdminApi\MiqExampageSubjectController::class, 'index']);
        Route::post('miq-exampages/{exampageId}/subjects', [\App\Http\Controllers\Api\AdminApi\MiqExampageSubjectController::class, 'store']);
        Route::delete('miq-exampages/{exampageId}/subjects/{subjectId}', [\App\Http\Controllers\Api\AdminApi\MiqExampageSubjectController::class, 'destroy']);

        // MIQ Questions Endpoints
        Route::get('miq-exampages/{exampageId}/question-types/{questionTypeId}/subjects/{subjectId}/questions', [\App\Http\Controllers\Api\AdminApi\MiqQuestionController::class, 'index']);
        Route::post('miq-exampages/{exampageId}/question-types/{questionTypeId}/subjects/{subjectId}/questions', [\App\Http\Controllers\Api\AdminApi\MiqQuestionController::class, 'store']);
        Route::post('miq-exampages/{exampageId}/question-types/{questionTypeId}/subjects/{subjectId}/questions/{id}', [\App\Http\Controllers\Api\AdminApi\MiqQuestionController::class, 'update']);
        Route::delete('miq-exampages/{exampageId}/question-types/{questionTypeId}/subjects/{subjectId}/questions/{id}', [\App\Http\Controllers\Api\AdminApi\MiqQuestionController::class, 'destroy']);
        Route::put('miq-exampages/{exampageId}/question-types/{questionTypeId}/subjects/{subjectId}/questions/reorder', [\App\Http\Controllers\Api\AdminApi\MiqQuestionController::class, 'reorder']);
    });
});
