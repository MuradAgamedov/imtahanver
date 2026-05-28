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
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
