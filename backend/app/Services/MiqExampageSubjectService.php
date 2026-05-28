<?php

namespace App\Services;

use App\Repositories\Contracts\MiqExampageSubjectRepositoryInterface;
use App\Repositories\Contracts\MiqExampageRepositoryInterface;
use App\Repositories\Contracts\MiqSubjectRepositoryInterface;
use App\Services\Contracts\MiqExampageSubjectServiceInterface;

class MiqExampageSubjectService implements MiqExampageSubjectServiceInterface
{
    protected MiqExampageSubjectRepositoryInterface $associationRepository;
    protected MiqExampageRepositoryInterface $exampageRepository;
    protected MiqSubjectRepositoryInterface $subjectRepository;

    public function __construct(
        MiqExampageSubjectRepositoryInterface $associationRepository,
        MiqExampageRepositoryInterface $exampageRepository,
        MiqSubjectRepositoryInterface $subjectRepository
    ) {
        $this->associationRepository = $associationRepository;
        $this->exampageRepository = $exampageRepository;
        $this->subjectRepository = $subjectRepository;
    }

    public function listAssociatedSubjects(int $exampageId): array
    {
        $exampage = $this->exampageRepository->findById($exampageId);
        if (!$exampage) {
            return [
                'success' => false,
                'message' => 'İmtahan vərəqi tapılmadı.',
                'status_code' => 404
            ];
        }

        $associations = $this->associationRepository->getByExampageId($exampageId);

        return [
            'success' => true,
            'exampage' => $exampage,
            'data' => $associations,
            'status_code' => 200
        ];
    }

    public function associateSubject(int $exampageId, int $subjectId): array
    {
        $exampage = $this->exampageRepository->findById($exampageId);
        if (!$exampage) {
            return [
                'success' => false,
                'message' => 'İmtahan vərəqi tapılmadı.',
                'status_code' => 404
            ];
        }

        $subject = $this->subjectRepository->findById($subjectId);
        if (!$subject) {
            return [
                'success' => false,
                'message' => 'Fənn tapılmadı.',
                'status_code' => 404
            ];
        }

        $existing = $this->associationRepository->findByExampageAndSubject($exampageId, $subjectId);
        if ($existing) {
            return [
                'success' => false,
                'message' => 'Bu fənn artıq bu imtahan vərəqinə əlavə edilib.',
                'status_code' => 422
            ];
        }

        $association = $this->associationRepository->create([
            'miq_exampage_id' => $exampageId,
            'miq_subject_id' => $subjectId
        ]);

        return [
            'success' => true,
            'message' => 'Fənn uğurla əlavə olundu.',
            'data' => $association,
            'status_code' => 201
        ];
    }

    public function dissociateSubject(int $exampageId, int $subjectId): array
    {
        $association = $this->associationRepository->findByExampageAndSubject($exampageId, $subjectId);
        if (!$association) {
            return [
                'success' => false,
                'message' => 'Fənn əlaqəsi tapılmadı.',
                'status_code' => 404
            ];
        }

        $this->associationRepository->delete($association);

        return [
            'success' => true,
            'message' => 'Fənn uğurla silindi.',
            'status_code' => 200
        ];
    }
}
