<?php

namespace App\Services\Contracts;

interface ApplicantGroupServiceInterface
{
    public function listGroups(?string $search = null): array;
    public function createGroup(array $data): array;
    public function updateGroup(int $id, array $data): array;
    public function deleteGroup(int $id): array;
    public function reorderGroups(array $orderedIds): array;
    public function syncSubjects(int $groupId, array $subjectIds): array;
}
