<?php

namespace App\Repositories\Contracts;

use App\Models\ApplicantExampage;
use Illuminate\Database\Eloquent\Collection;

interface ApplicantExampageRepositoryInterface
{
    public function all(?string $search = null): Collection;
    public function findById(int $id): ?ApplicantExampage;
    public function create(array $data): ApplicantExampage;
    public function update(ApplicantExampage $exampage, array $data): ApplicantExampage;
    public function delete(ApplicantExampage $exampage): bool;
    public function syncGroups(ApplicantExampage $exampage, array $groupIds): void;
}
