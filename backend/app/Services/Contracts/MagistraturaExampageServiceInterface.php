<?php

namespace App\Services\Contracts;

interface MagistraturaExampageServiceInterface
{
    public function listExampages(?string $search = null): array;
    public function createExampage(array $data): array;
    public function updateExampage(int $id, array $data): array;
    public function deleteExampage(int $id): array;
    public function syncSubjects(int $id, array $subjectIds): array;
    public function listSubjects(int $id): array;
}
