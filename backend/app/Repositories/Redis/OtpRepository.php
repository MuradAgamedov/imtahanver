<?php

namespace App\Repositories\Redis;

use App\Repositories\Contracts\OtpRepositoryInterface;
use Illuminate\Support\Facades\Cache;

class OtpRepository implements OtpRepositoryInterface
{
    private string $prefix = 'otp:';

    public function store(string $email, string $code, int $ttlSeconds): void
    {
        Cache::put($this->prefix . $email, $code, $ttlSeconds);
    }

    public function get(string $email): ?string
    {
        return Cache::get($this->prefix . $email);
    }

    public function delete(string $email): void
    {
        Cache::forget($this->prefix . $email);
    }
}
