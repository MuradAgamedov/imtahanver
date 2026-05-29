<?php

namespace App\Services\Contracts;

interface UserCategoryServiceInterface
{
    public function listCategories(?string $search = null): array;
    public function createCategory(array $data): array;
    public function updateCategory(int $id, array $data): array;
    public function deleteCategory(int $id): array;
}
