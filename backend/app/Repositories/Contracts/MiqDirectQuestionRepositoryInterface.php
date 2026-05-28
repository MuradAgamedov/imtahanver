<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;
use App\Models\MiqDirectQuestion;

interface MiqDirectQuestionRepositoryInterface
{
    public function getByExampageAndType(int $exampageId, int $questionTypeId): Collection;
    public function findById(int $id): ?MiqDirectQuestion;
    public function create(array $data): MiqDirectQuestion;
    public function update(MiqDirectQuestion $question, array $data): MiqDirectQuestion;
    public function delete(MiqDirectQuestion $question): bool;
    public function reorderByIds(array $ids): void;
}
