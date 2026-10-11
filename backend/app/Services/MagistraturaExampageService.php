<?php

namespace App\Services;

use App\Repositories\Contracts\MagistraturaExampageRepositoryInterface;
use App\Services\Contracts\MagistraturaExampageServiceInterface;

class MagistraturaExampageService implements MagistraturaExampageServiceInterface
{
    protected MagistraturaExampageRepositoryInterface $exampageRepository;

    public function __construct(MagistraturaExampageRepositoryInterface $exampageRepository)
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
        if (array_key_exists('is_demo', $data)) $fields['is_demo'] = (bool) $data['is_demo'];
        if (array_key_exists('starts_at', $data)) {
            $fields['starts_at'] = !empty($data['starts_at']) ? $data['starts_at'] : null;
        }
        if (array_key_exists('price', $data)) {
            $fields['price'] = $data['price'] !== null && $data['price'] !== '' ? (float) $data['price'] : null;
        }
        if (($fields['is_demo'] ?? null) === true) {
            $fields['starts_at'] = null;
            $fields['price'] = null;
        }

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

    public function syncSubjects(int $id, array $subjectIds): array
    {
        $exampage = $this->exampageRepository->findById($id);
        if (!$exampage) {
            return ['success' => false, 'message' => 'İmtahan vərəqi tapılmadı.', 'status_code' => 404];
        }

        $this->exampageRepository->syncSubjects($exampage, $subjectIds);

        return [
            'success'     => true,
            'message'     => 'Fənlər uğurla yeniləndi.',
            'data'        => $exampage->fresh()->load('subjects'),
            'status_code' => 200,
        ];
    }

    public function listSubjects(int $id): array
    {
        $exampage = $this->exampageRepository->findById($id);
        if (!$exampage) {
            return ['success' => false, 'message' => 'İmtahan vərəqi tapılmadı.', 'status_code' => 404];
        }

        return [
            'success'     => true,
            'data'        => $exampage->subjects()->orderBy('magistratura_exampage_subject.order')->get(),
            'status_code' => 200,
        ];
    }
}
