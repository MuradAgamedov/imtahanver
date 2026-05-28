<?php

namespace App\Services\Contracts;

interface AdminAuthServiceInterface
{
    public function login(string $email, string $password): array;
}
