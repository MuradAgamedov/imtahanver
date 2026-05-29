<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;
use App\Models\UserCategory;

interface UserCategoryRepositoryInterface
{
    public function all(?string $search = null): Collection;
    
    public function findByIdentify(string $identify): ?UserCategory;

    public function findById(int $id): ?UserCategory;

    public function create(array $data): UserCategory;

    public function update(UserCategory $category, array $data): bool;

    public function delete(UserCategory $category): bool;
}
