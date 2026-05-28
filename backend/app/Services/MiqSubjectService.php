<?php

namespace App\Services;

use App\Repositories\Contracts\MiqSubjectRepositoryInterface;
use App\Services\Contracts\MiqSubjectServiceInterface;

class MiqSubjectService implements MiqSubjectServiceInterface
{
    protected MiqSubjectRepositoryInterface $subjectRepository;

    public function __construct(MiqSubjectRepositoryInterface $subjectRepository)
    {
        $this->subjectRepository = $subjectRepository;
    }

    public function listSubjects(): array
    {
        $subjects = $this->subjectRepository->all();
        return [
            'success' => true,
            'data' => $subjects,
            'status_code' => 200
        ];
    }

    public function createSubject(array $data): array
    {
        $title = $data['title'];
        $identify = !empty($data['identify']) ? $data['identify'] : \App\Models\MiqSubject::generateSlug($title);

        $existing = $this->subjectRepository->findByIdentify($identify);
        if ($existing) {
            return [
                'success' => false,
                'message' => 'Bu identify (slug) ilə artıq fənn mövcuddur.',
                'status_code' => 422
            ];
        }

        $subject = $this->subjectRepository->create([
            'title' => $title,
            'identify' => $identify,
        ]);

        return [
            'success' => true,
            'message' => 'Fənn uğurla yaradıldı.',
            'data' => $subject,
            'status_code' => 201
        ];
    }

    public function updateSubject(int $id, array $data): array
    {
        $subject = $this->subjectRepository->findById($id);
        if (!$subject) {
            return [
                'success' => false,
                'message' => 'Fənn tapılmadı.',
                'status_code' => 404
            ];
        }

        $title = $data['title'];
        $identify = !empty($data['identify']) ? $data['identify'] : \App\Models\MiqSubject::generateSlug($title);

        if ($identify !== $subject->identify) {
            $existing = $this->subjectRepository->findByIdentify($identify);
            if ($existing) {
                return [
                    'success' => false,
                    'message' => 'Bu identify (slug) artıq istifadə olunur.',
                    'status_code' => 422
                ];
            }
        }

        $this->subjectRepository->update($subject, [
            'title' => $title,
            'identify' => $identify,
        ]);

        return [
            'success' => true,
            'message' => 'Fənn məlumatları yeniləndi.',
            'data' => $subject->fresh(),
            'status_code' => 200
        ];
    }

    public function deleteSubject(int $id): array
    {
        $subject = $this->subjectRepository->findById($id);
        if (!$subject) {
            return [
                'success' => false,
                'message' => 'Fənn tapılmadı.',
                'status_code' => 404
            ];
        }

        $this->subjectRepository->delete($subject);

        return [
            'success' => true,
            'message' => 'Fənn silindi.',
            'status_code' => 200
        ];
    }

    public function reorderSubjects(array $orderedIds): array
    {
        foreach ($orderedIds as $index => $id) {
            $subject = $this->subjectRepository->findById($id);
            if ($subject) {
                $this->subjectRepository->update($subject, ['order' => $index]);
            }
        }

        return [
            'success' => true,
            'message' => 'Fənlərin ardıcıllığı yeniləndi.',
            'status_code' => 200
        ];
    }
}
