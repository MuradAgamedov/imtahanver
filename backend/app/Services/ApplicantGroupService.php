<?php

namespace App\Services;

use App\Models\ApplicantGroup;
use App\Repositories\Contracts\ApplicantGroupRepositoryInterface;
use App\Services\Contracts\ApplicantGroupServiceInterface;

class ApplicantGroupService implements ApplicantGroupServiceInterface
{
    protected ApplicantGroupRepositoryInterface $groupRepository;

    public function __construct(ApplicantGroupRepositoryInterface $groupRepository)
    {
        $this->groupRepository = $groupRepository;
    }

    public function listGroups(?string $search = null): array
    {
        return [
            'success'     => true,
            'data'        => $this->groupRepository->all($search),
            'status_code' => 200,
        ];
    }

    public function createGroup(array $data): array
    {
        $title    = $data['title'];
        $identify = !empty($data['identify']) ? $data['identify'] : ApplicantGroup::generateSlug($title);

        if ($this->groupRepository->findByIdentify($identify)) {
            return [
                'success'     => false,
                'message'     => 'Bu identify (slug) ilə artıq qrup mövcuddur.',
                'status_code' => 422,
            ];
        }

        $group = $this->groupRepository->create(['title' => $title, 'identify' => $identify]);

        return [
            'success'     => true,
            'message'     => 'Qrup uğurla yaradıldı.',
            'data'        => $group,
            'status_code' => 201,
        ];
    }

    public function updateGroup(int $id, array $data): array
    {
        $group = $this->groupRepository->findById($id);
        if (!$group) {
            return ['success' => false, 'message' => 'Qrup tapılmadı.', 'status_code' => 404];
        }

        $title    = $data['title'];
        $identify = !empty($data['identify']) ? $data['identify'] : ApplicantGroup::generateSlug($title);

        if ($identify !== $group->identify && $this->groupRepository->findByIdentify($identify)) {
            return [
                'success'     => false,
                'message'     => 'Bu identify (slug) artıq istifadə olunur.',
                'status_code' => 422,
            ];
        }

        $this->groupRepository->update($group, ['title' => $title, 'identify' => $identify]);

        return [
            'success'     => true,
            'message'     => 'Qrup məlumatları yeniləndi.',
            'data'        => $group->fresh(),
            'status_code' => 200,
        ];
    }

    public function deleteGroup(int $id): array
    {
        $group = $this->groupRepository->findById($id);
        if (!$group) {
            return ['success' => false, 'message' => 'Qrup tapılmadı.', 'status_code' => 404];
        }

        $this->groupRepository->delete($group);

        return ['success' => true, 'message' => 'Qrup silindi.', 'status_code' => 200];
    }

    public function reorderGroups(array $orderedIds): array
    {
        foreach ($orderedIds as $index => $id) {
            $group = $this->groupRepository->findById($id);
            if ($group) {
                $this->groupRepository->update($group, ['order' => $index]);
            }
        }

        return ['success' => true, 'message' => 'Qrupların ardıcıllığı yeniləndi.', 'status_code' => 200];
    }

    public function syncSubjects(int $groupId, array $subjectIds): array
    {
        $group = $this->groupRepository->findById($groupId);
        if (!$group) {
            return ['success' => false, 'message' => 'Qrup tapılmadı.', 'status_code' => 404];
        }

        $this->groupRepository->syncSubjects($group, $subjectIds);

        return [
            'success'     => true,
            'message'     => 'Fənlər uğurla yeniləndi.',
            'data'        => $group->fresh()->load('subjects'),
            'status_code' => 200,
        ];
    }
}
