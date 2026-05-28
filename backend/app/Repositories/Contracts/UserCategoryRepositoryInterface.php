<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;
use App\Models\UserCategory;

interface UserCategoryRepositoryInterface
{
    public function all(): Collection;
    
    public function findByIdentify(string $identify): ?UserCategory;
}
