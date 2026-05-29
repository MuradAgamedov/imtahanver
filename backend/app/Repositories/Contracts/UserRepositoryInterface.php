<?php

namespace App\Repositories\Contracts;

use App\Models\User;

interface UserRepositoryInterface
{
    public function findById(int $id): ?User;
    
    public function findByEmail(string $email): ?User;
    
    public function create(array $data): User;
    
    public function verifyEmail(User $user): bool;
    
    public function update(User $user, array $data): bool;

    public function all(): \Illuminate\Database\Eloquent\Collection;

    public function allNonAdmins(?string $search = null): \Illuminate\Database\Eloquent\Collection;

    public function allAdmins(?string $search = null): \Illuminate\Database\Eloquent\Collection;

    public function delete(User $user): bool;
}
