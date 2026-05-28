<?php

namespace App\Services;

use App\Repositories\Contracts\MiqExampageRepositoryInterface;
use App\Services\Contracts\MiqExampageServiceInterface;

class MiqExampageService implements MiqExampageServiceInterface
{
    protected MiqExampageRepositoryInterface $exampageRepository;

    public function __construct(MiqExampageRepositoryInterface $exampageRepository)
    {
        $this->exampageRepository = $exampageRepository;
    }

    public function listExampages(): array
    {
        $exampages = $this->exampageRepository->all();
        return [
            'success' => true,
            'data' => $exampages,
            'status_code' => 200
        ];
    }

    public function createExampage(array $data): array
    {
        $exampage = $this->exampageRepository->create($data);

        return [
            'success' => true,
            'message' => 'İmtahan vərəqi uğurla yaradıldı.',
            'data' => $exampage->fresh(),
            'status_code' => 201
        ];
    }

    public function deleteExampage(int $id): array
    {
        $exampage = $this->exampageRepository->findById($id);
        if (!$exampage) {
            return [
                'success' => false,
                'message' => 'İmtahan vərəqi tapılmadı.',
                'status_code' => 404
            ];
        }

        $this->exampageRepository->delete($exampage);

        return [
            'success' => true,
            'message' => 'İmtahan vərəqi silindi.',
            'status_code' => 200
        ];
    }
}
