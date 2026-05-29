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
    Route::get('miq-exampages', [\App\Http\Controllers\Api\AdminApi\MiqExampageController::class, 'index']);
    Route::get('miq-exampages/{exampageId}/subjects', [\App\Http\Controllers\Api\AdminApi\MiqExampageSubjectController::class, 'index']);
    Route::get('miq-exampages/{exampageId}/question-types/{questionTypeId}/subjects/{subjectId}/questions', [\App\Http\Controllers\Api\Front\MiqFrontQuestionsController::class, 'subjectQuestions']);
    Route::get('miq-exampages/{exampageId}/question-types/{questionTypeId}/direct-questions', [\App\Http\Controllers\Api\Front\MiqFrontQuestionsController::class, 'directQuestions']);

    // Authenticated routes
    Route::middleware(JwtAuthMiddleware::class)->group(function () {
        Route::get('profile', [ProfileController::class, 'getProfile']);
        Route::put('profile/category', [ProfileController::class, 'updateCategory']);
        Route::put('profile/name', [ProfileController::class, 'updateName']);
        Route::post('profile/email/request', [ProfileController::class, 'requestEmailChange']);
        Route::put('profile/email/confirm', [ProfileController::class, 'confirmEmailChange']);
        Route::post('profile/password/request', [ProfileController::class, 'requestPasswordChange']);
        Route::put('profile/password/confirm', [ProfileController::class, 'confirmPasswordChange']);

        // Exam Session Routes
        Route::get('exam-sessions', [\App\Http\Controllers\Api\Front\ExamSessionController::class, 'index']);
        Route::post('exam-sessions', [\App\Http\Controllers\Api\Front\ExamSessionController::class, 'startOrResume']);
        Route::post('exam-sessions/{sessionId}/answer', [\App\Http\Controllers\Api\Front\ExamSessionController::class, 'saveAnswer']);
        Route::post('exam-sessions/{sessionId}/submit', [\App\Http\Controllers\Api\Front\ExamSessionController::class, 'submit']);
        Route::get('exam-sessions/{sessionId}/results', [\App\Http\Controllers\Api\Front\ExamSessionController::class, 'getResults']);
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
        Route::put('miq-exampages/{id}', [\App\Http\Controllers\Api\AdminApi\MiqExampageController::class, 'update']);
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

        // MIQ Question Options Endpoints (subject-based questions)
        Route::get('miq-questions/{questionId}/options', [\App\Http\Controllers\Api\AdminApi\MiqQuestionOptionController::class, 'index']);
        Route::post('miq-questions/{questionId}/options', [\App\Http\Controllers\Api\AdminApi\MiqQuestionOptionController::class, 'store']);
        Route::put('miq-questions/{questionId}/options/reorder', [\App\Http\Controllers\Api\AdminApi\MiqQuestionOptionController::class, 'reorder']);
        Route::put('miq-questions/{questionId}/options/{id}', [\App\Http\Controllers\Api\AdminApi\MiqQuestionOptionController::class, 'update']);
        Route::delete('miq-questions/{questionId}/options/{id}', [\App\Http\Controllers\Api\AdminApi\MiqQuestionOptionController::class, 'destroy']);

        // MIQ Direct Questions (question-type level, no subject)
        Route::get('miq-exampages/{exampageId}/question-types/{questionTypeId}/questions', [\App\Http\Controllers\Api\AdminApi\MiqDirectQuestionController::class, 'index']);
        Route::post('miq-exampages/{exampageId}/question-types/{questionTypeId}/questions', [\App\Http\Controllers\Api\AdminApi\MiqDirectQuestionController::class, 'store']);
        Route::put('miq-exampages/{exampageId}/question-types/{questionTypeId}/questions/reorder', [\App\Http\Controllers\Api\AdminApi\MiqDirectQuestionController::class, 'reorder']);
        Route::post('miq-exampages/{exampageId}/question-types/{questionTypeId}/questions/{id}', [\App\Http\Controllers\Api\AdminApi\MiqDirectQuestionController::class, 'update']);
        Route::delete('miq-exampages/{exampageId}/question-types/{questionTypeId}/questions/{id}', [\App\Http\Controllers\Api\AdminApi\MiqDirectQuestionController::class, 'destroy']);

        // MIQ Direct Question Options
        Route::get('miq-direct-questions/{questionId}/options', [\App\Http\Controllers\Api\AdminApi\MiqDirectQuestionOptionController::class, 'index']);
        Route::post('miq-direct-questions/{questionId}/options', [\App\Http\Controllers\Api\AdminApi\MiqDirectQuestionOptionController::class, 'store']);
        Route::put('miq-direct-questions/{questionId}/options/reorder', [\App\Http\Controllers\Api\AdminApi\MiqDirectQuestionOptionController::class, 'reorder']);
        Route::put('miq-direct-questions/{questionId}/options/{id}', [\App\Http\Controllers\Api\AdminApi\MiqDirectQuestionOptionController::class, 'update']);
        Route::delete('miq-direct-questions/{questionId}/options/{id}', [\App\Http\Controllers\Api\AdminApi\MiqDirectQuestionOptionController::class, 'destroy']);

        // Applicant Subjects
        Route::get('applicant-subjects', [\App\Http\Controllers\Api\AdminApi\ApplicantSubjectController::class, 'index']);
        Route::post('applicant-subjects', [\App\Http\Controllers\Api\AdminApi\ApplicantSubjectController::class, 'store']);
        Route::put('applicant-subjects/reorder', [\App\Http\Controllers\Api\AdminApi\ApplicantSubjectController::class, 'reorder']);
        Route::put('applicant-subjects/{id}', [\App\Http\Controllers\Api\AdminApi\ApplicantSubjectController::class, 'update']);
        Route::delete('applicant-subjects/{id}', [\App\Http\Controllers\Api\AdminApi\ApplicantSubjectController::class, 'destroy']);

        // Admin Exam Results Route
        Route::get('exam-results', [\App\Http\Controllers\Api\AdminApi\ExamResultController::class, 'index']);
    });
});
