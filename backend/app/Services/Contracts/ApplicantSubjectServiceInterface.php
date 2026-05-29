<?php

namespace App\Services\Contracts;

interface ApplicantSubjectServiceInterface
{
    public function listSubjects(?string $search = null): array;
    public function createSubject(array $data): array;
    public function updateSubject(int $id, array $data): array;
    public function deleteSubject(int $id): array;
    public function reorderSubjects(array $orderedIds): array;
}
