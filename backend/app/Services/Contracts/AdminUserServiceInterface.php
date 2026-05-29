<?php

namespace App\Services\Contracts;

interface AdminUserServiceInterface
{
    // Standard User CRUD
    public function listUsers(?string $search = null): array;
    public function createUser(array $data): array;
    public function updateUser(int $id, array $data): array;
    public function deleteUser(int $id): array;

    // Admin User CRUD
    public function listAdmins(?string $search = null): array;
    public function createAdmin(array $data): array;
    public function updateAdmin(int $id, array $data): array;
    public function deleteAdmin(int $id): array;
}
