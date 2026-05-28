<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;
use App\Models\MiqExampageSubject;

interface MiqExampageSubjectRepositoryInterface
{
    public function getByExampageId(int $exampageId): Collection;
    public function findByExampageAndSubject(int $exampageId, int $subjectId): ?MiqExampageSubject;
    public function create(array $data): MiqExampageSubject;
    public function delete(MiqExampageSubject $association): bool;
}
