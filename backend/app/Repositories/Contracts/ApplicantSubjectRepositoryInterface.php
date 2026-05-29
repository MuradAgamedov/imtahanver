<?php

namespace App\Repositories\Contracts;

use App\Models\ApplicantSubject;
use Illuminate\Database\Eloquent\Collection;

interface ApplicantSubjectRepositoryInterface
{
    public function all(?string $search = null): Collection;
    public function findById(int $id): ?ApplicantSubject;
    public function findByIdentify(string $identify): ?ApplicantSubject;
    public function create(array $data): ApplicantSubject;
    public function update(ApplicantSubject $subject, array $data): bool;
    public function delete(ApplicantSubject $subject): bool;
}
