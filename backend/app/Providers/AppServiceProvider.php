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
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
