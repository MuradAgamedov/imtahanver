<?php

namespace App\Services\Contracts;

interface MiqExampageServiceInterface
{
    public function listExampages(): array;
    public function createExampage(array $data): array;
    public function updateExampage(int $id, array $data): array;
    public function deleteExampage(int $id): array;
}
