<?php

namespace App\Repositories\Contracts;

use App\Models\ApplicantGroup;
use Illuminate\Database\Eloquent\Collection;

interface ApplicantGroupRepositoryInterface
{
    public function all(?string $search = null): Collection;
    public function findById(int $id): ?ApplicantGroup;
    public function findByIdentify(string $identify): ?ApplicantGroup;
    public function create(array $data): ApplicantGroup;
    public function update(ApplicantGroup $group, array $data): bool;
    public function delete(ApplicantGroup $group): bool;
    public function syncSubjects(ApplicantGroup $group, array $subjectIds): void;
}
