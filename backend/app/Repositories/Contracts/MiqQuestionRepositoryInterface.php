<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;
use App\Models\MiqQuestion;

interface MiqQuestionRepositoryInterface
{
    public function getQuestions(int $exampageId, int $questionTypeId, ?int $subjectId): Collection;
    public function findById(int $id): ?MiqQuestion;
    public function create(array $data): MiqQuestion;
    public function update(MiqQuestion $question, array $data): bool;
    public function delete(MiqQuestion $question): bool;
    public function updateOrder(array $ids): bool;
}
