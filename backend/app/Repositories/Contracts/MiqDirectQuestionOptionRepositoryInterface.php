<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;
use App\Models\MiqDirectQuestionOption;

interface MiqDirectQuestionOptionRepositoryInterface
{
    public function getByQuestionId(int $questionId): Collection;
    public function findById(int $id): ?MiqDirectQuestionOption;
    public function create(array $data): MiqDirectQuestionOption;
    public function update(MiqDirectQuestionOption $option, array $data): MiqDirectQuestionOption;
    public function delete(MiqDirectQuestionOption $option): bool;
    public function clearTrueForQuestion(int $questionId): void;
    public function reorderByIds(array $ids): void;
}
