<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;
use App\Models\MiqQuestionOption;

interface MiqQuestionOptionRepositoryInterface
{
    public function getByQuestionId(int $questionId): Collection;
    public function findById(int $id): ?MiqQuestionOption;
    public function create(array $data): MiqQuestionOption;
    public function update(MiqQuestionOption $option, array $data): MiqQuestionOption;
    public function delete(MiqQuestionOption $option): bool;
    public function clearTrueForQuestion(int $questionId): void;
    public function reorderByIds(array $ids): void;
}
