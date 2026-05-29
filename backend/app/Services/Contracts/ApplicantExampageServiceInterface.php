<?php

namespace App\Services\Contracts;

interface ApplicantExampageServiceInterface
{
    public function listExampages(?string $search = null): array;
    public function createExampage(array $data): array;
    public function updateExampage(int $id, array $data): array;
    public function deleteExampage(int $id): array;
}
