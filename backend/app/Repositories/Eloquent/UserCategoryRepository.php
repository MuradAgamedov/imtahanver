<?php

namespace App\Repositories\Eloquent;

use App\Models\UserCategory;
use App\Repositories\Contracts\UserCategoryRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class UserCategoryRepository implements UserCategoryRepositoryInterface
{
    public function all(): Collection
    {
        return UserCategory::all();
    }

    public function findByIdentify(string $identify): ?UserCategory
    {
        return UserCategory::where('identify', $identify)->first();
    }
}
