<?php

namespace App\Services\Contracts;

use App\Models\User;

interface AuthServiceInterface
{
    public function register(array $data): array;
    
    public function verifyOtp(string $email, string $otp): array;
    
    public function login(string $email, string $password): array;
}
