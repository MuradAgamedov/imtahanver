<?php

namespace App\Services;

use App\Repositories\Contracts\ApplicantExampageRepositoryInterface;
use App\Services\Contracts\ApplicantExampageServiceInterface;

class ApplicantExampageService implements ApplicantExampageServiceInterface
{
    protected ApplicantExampageRepositoryInterface $exampageRepository;

    public function __construct(ApplicantExampageRepositoryInterface $exampageRepository)
    {
        $this->exampageRepository = $exampageRepository;
    }

    public function listExampages(?string $search = null): array
    {
        return [
            'success'     => true,
            'data'        => $this->exampageRepository->all($search),
            'status_code' => 200,
        ];
    }

    public function createExampage(array $data): array
    {
        $exampage = $this->exampageRepository->create(['title' => '']);

        return [
            'success'     => true,
            'message'     => 'İmtahan vərəqi uğurla yaradıldı.',
            'data'        => $exampage->fresh(),
            'status_code' => 201,
        ];
    }

    public function updateExampage(int $id, array $data): array
    {
        $exampage = $this->exampageRepository->findById($id);
        if (!$exampage) {
            return ['success' => false, 'message' => 'İmtahan vərəqi tapılmadı.', 'status_code' => 404];
        }

        $fields = [];
        if (isset($data['title']))         $fields['title']         = $data['title'];
        if (isset($data['exam_duration'])) $fields['exam_duration'] = (int) $data['exam_duration'];

        $updated = $this->exampageRepository->update($exampage, $fields);

        return [
            'success'     => true,
            'message'     => 'İmtahan vərəqi yeniləndi.',
            'data'        => $updated,
            'status_code' => 200,
        ];
    }

    public function deleteExampage(int $id): array
    {
        $exampage = $this->exampageRepository->findById($id);
        if (!$exampage) {
            return ['success' => false, 'message' => 'İmtahan vərəqi tapılmadı.', 'status_code' => 404];
        }

        $this->exampageRepository->delete($exampage);

        return ['success' => true, 'message' => 'İmtahan vərəqi silindi.', 'status_code' => 200];
    }

    public function syncGroups(int $id, array $groupIds): array
    {
        $exampage = $this->exampageRepository->findById($id);
        if (!$exampage) {
            return ['success' => false, 'message' => 'İmtahan vərəqi tapılmadı.', 'status_code' => 404];
        }

        $this->exampageRepository->syncGroups($exampage, $groupIds);

        return [
            'success'     => true,
            'message'     => 'Qruplar uğurla yeniləndi.',
            'data'        => $exampage->fresh()->load('groups'),
            'status_code' => 200,
        ];
    }
}
