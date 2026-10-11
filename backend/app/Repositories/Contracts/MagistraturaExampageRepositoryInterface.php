<?php

namespace App\Repositories\Contracts;

use App\Models\MagistraturaExampage;
use Illuminate\Database\Eloquent\Collection;

interface MagistraturaExampageRepositoryInterface
{
    public function all(?string $search = null): Collection;
    public function findById(int $id): ?MagistraturaExampage;
    public function create(array $data): MagistraturaExampage;
    public function update(MagistraturaExampage $exampage, array $data): MagistraturaExampage;
    public function delete(MagistraturaExampage $exampage): bool;
    public function syncSubjects(MagistraturaExampage $exampage, array $subjectIds): void;
}
