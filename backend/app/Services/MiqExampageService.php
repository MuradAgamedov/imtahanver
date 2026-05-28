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

    public function updateExampage(int $id, array $data): array
    {
        $exampage = $this->exampageRepository->findById($id);
        if (!$exampage) {
            return ['success' => false, 'message' => 'İmtahan vərəqi tapılmadı.', 'status_code' => 404];
        }

        $fields = [];
        if (isset($data['title'])) $fields['title'] = $data['title'];
        if (isset($data['exam_duration'])) $fields['exam_duration'] = (int) $data['exam_duration'];

        $updated = $this->exampageRepository->update($exampage, $fields);

        return ['success' => true, 'message' => 'İmtahan vərəqi yeniləndi.', 'data' => $updated, 'status_code' => 200];
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
