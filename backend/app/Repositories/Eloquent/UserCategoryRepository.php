<?php

namespace App\Repositories\Eloquent;

use App\Models\UserCategory;
use App\Repositories\Contracts\UserCategoryRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class UserCategoryRepository implements UserCategoryRepositoryInterface
{
    public function all(): Collection
    {
        return UserCategory::orderBy('id', 'asc')->get();
    }

    public function findByIdentify(string $identify): ?UserCategory
    {
        return UserCategory::where('identify', $identify)->first();
    }

    public function findById(int $id): ?UserCategory
    {
        return UserCategory::find($id);
    }

    public function create(array $data): UserCategory
    {
        return UserCategory::create($data);
    }

    public function update(UserCategory $category, array $data): bool
    {
        return $category->update($data);
    }

    public function delete(UserCategory $category): bool
    {
        return $category->delete();
    }
}
