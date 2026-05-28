<?php

namespace App\Services\Contracts;

interface ProfileServiceInterface
{
    public function getUserCategories(): array;
    
    public function updateCategory(int $userId, string $identify): array;
    
    public function updateName(int $userId, string $firstName, string $lastName): array;
    
    public function requestEmailChange(int $userId, string $newEmail): array;
    
    public function confirmEmailChange(int $userId, string $newEmail, string $otp): array;
    
    public function requestPasswordChange(int $userId): array;
    
    public function confirmPasswordChange(int $userId, string $newPassword, string $otp): array;
}
