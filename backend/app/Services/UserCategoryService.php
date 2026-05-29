<?php

namespace App\Services;

use App\Repositories\Contracts\UserCategoryRepositoryInterface;
use App\Services\Contracts\UserCategoryServiceInterface;

class UserCategoryService implements UserCategoryServiceInterface
{
    protected UserCategoryRepositoryInterface $categoryRepository;

    public function __construct(UserCategoryRepositoryInterface $categoryRepository)
    {
        $this->categoryRepository = $categoryRepository;
    }

    public function listCategories(?string $search = null): array
    {
        $categories = $this->categoryRepository->all($search);
        return [
            'success' => true,
            'data' => $categories,
            'status_code' => 200
        ];
    }

    public function createCategory(array $data): array
    {
        $title = $data['title'];
        $identify = !empty($data['identify']) ? $data['identify'] : \App\Models\UserCategory::generateSlug($title);

        $existing = $this->categoryRepository->findByIdentify($identify);
        if ($existing) {
            return [
                'success' => false,
                'message' => 'Bu identify (slug) ilə artıq kateqoriya mövcuddur.',
                'status_code' => 422
            ];
        }

        $category = $this->categoryRepository->create([
            'title' => $title,
            'identify' => $identify,
        ]);

        return [
            'success' => true,
            'message' => 'Kateqoriya uğurla yaradıldı.',
            'data' => $category,
            'status_code' => 201
        ];
    }

    public function updateCategory(int $id, array $data): array
    {
        $category = $this->categoryRepository->findById($id);
        if (!$category) {
            return [
                'success' => false,
                'message' => 'Kateqoriya tapılmadı.',
                'status_code' => 404
            ];
        }

        $title = $data['title'];
        $identify = !empty($data['identify']) ? $data['identify'] : \App\Models\UserCategory::generateSlug($title);

        if ($identify !== $category->identify) {
            $existing = $this->categoryRepository->findByIdentify($identify);
            if ($existing) {
                return [
                    'success' => false,
                    'message' => 'Bu identify (slug) artıq istifadə olunur.',
                    'status_code' => 422
                ];
            }
        }

        $this->categoryRepository->update($category, [
            'title' => $title,
            'identify' => $identify,
        ]);

        return [
            'success' => true,
            'message' => 'Kateqoriya məlumatları yeniləndi.',
            'data' => $category->fresh(),
            'status_code' => 200
        ];
    }

    public function deleteCategory(int $id): array
    {
        $category = $this->categoryRepository->findById($id);
        if (!$category) {
            return [
                'success' => false,
                'message' => 'Kateqoriya tapılmadı.',
                'status_code' => 404
            ];
        }

        if ($category->users()->count() > 0) {
            return [
                'success' => false,
                'message' => 'Bu kateqoriyaya aid istifadəçilər olduğu üçün onu silmək olmaz.',
                'status_code' => 422
            ];
        }

        $this->categoryRepository->delete($category);

        return [
            'success' => true,
            'message' => 'Kateqoriya silindi.',
            'status_code' => 200
        ];
    }
}
