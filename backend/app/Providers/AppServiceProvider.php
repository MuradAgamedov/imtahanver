<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Repositories\Contracts\UserRepositoryInterface::class,
            \App\Repositories\Eloquent\UserRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\OtpRepositoryInterface::class,
            \App\Repositories\Redis\OtpRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\UserCategoryRepositoryInterface::class,
            \App\Repositories\Eloquent\UserCategoryRepository::class
        );
        $this->app->bind(
            \App\Services\Contracts\AuthServiceInterface::class,
            \App\Services\AuthService::class
        );
        $this->app->bind(
            \App\Services\Contracts\ProfileServiceInterface::class,
            \App\Services\ProfileService::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\AdminRepositoryInterface::class,
            \App\Repositories\Eloquent\AdminRepository::class
        );
        $this->app->bind(
            \App\Services\Contracts\AdminAuthServiceInterface::class,
            \App\Services\AdminAuthService::class
        );
        $this->app->bind(
            \App\Services\Contracts\AdminUserServiceInterface::class,
            \App\Services\AdminUserService::class
        );
        $this->app->bind(
            \App\Services\Contracts\UserCategoryServiceInterface::class,
            \App\Services\UserCategoryService::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\MiqSubjectRepositoryInterface::class,
            \App\Repositories\Eloquent\MiqSubjectRepository::class
        );
        $this->app->bind(
            \App\Services\Contracts\MiqSubjectServiceInterface::class,
            \App\Services\MiqSubjectService::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\MiqExampageRepositoryInterface::class,
            \App\Repositories\Eloquent\MiqExampageRepository::class
        );
        $this->app->bind(
            \App\Services\Contracts\MiqExampageServiceInterface::class,
            \App\Services\MiqExampageService::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\MiqQuestionTypeRepositoryInterface::class,
            \App\Repositories\Eloquent\MiqQuestionTypeRepository::class
        );
        $this->app->bind(
            \App\Services\Contracts\MiqQuestionTypeServiceInterface::class,
            \App\Services\MiqQuestionTypeService::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\MiqExampageSubjectRepositoryInterface::class,
            \App\Repositories\Eloquent\MiqExampageSubjectRepository::class
        );
        $this->app->bind(
            \App\Services\Contracts\MiqExampageSubjectServiceInterface::class,
            \App\Services\MiqExampageSubjectService::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\MiqQuestionRepositoryInterface::class,
            \App\Repositories\Eloquent\MiqQuestionRepository::class
        );
        $this->app->bind(
            \App\Services\Contracts\MiqQuestionServiceInterface::class,
            \App\Services\MiqQuestionService::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\MiqQuestionOptionRepositoryInterface::class,
            \App\Repositories\Eloquent\MiqQuestionOptionRepository::class
        );
        $this->app->bind(
            \App\Services\Contracts\MiqQuestionOptionServiceInterface::class,
            \App\Services\MiqQuestionOptionService::class
        );

        // MIQ Direct Questions (question-type level, no subject)
        $this->app->bind(
            \App\Repositories\Contracts\MiqDirectQuestionRepositoryInterface::class,
            \App\Repositories\Eloquent\MiqDirectQuestionRepository::class
        );
        $this->app->bind(
            \App\Services\Contracts\MiqDirectQuestionServiceInterface::class,
            \App\Services\MiqDirectQuestionService::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\MiqDirectQuestionOptionRepositoryInterface::class,
            \App\Repositories\Eloquent\MiqDirectQuestionOptionRepository::class
        );
        $this->app->bind(
            \App\Services\Contracts\MiqDirectQuestionOptionServiceInterface::class,
            \App\Services\MiqDirectQuestionOptionService::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
