<?php

namespace App\Repositories\Contracts;

interface OtpRepositoryInterface
{
    public function store(string $email, string $code, int $ttlSeconds): void;
    
    public function get(string $email): ?string;
    
    public function delete(string $email): void;
}
