<?php

namespace App\Services\Contracts;

use App\Models\MiqDirectQuestion;
use Illuminate\Database\Eloquent\Collection;

interface MiqDirectQuestionServiceInterface
{
    public function getQuestions(int $exampageId, int $questionTypeId): Collection;
    public function getQuestionById(int $id): ?MiqDirectQuestion;
    public function createQuestion(array $data): MiqDirectQuestion;
    public function updateQuestion(int $id, array $data): MiqDirectQuestion;
    public function deleteQuestion(int $id): bool;
    public function reorderQuestions(array $ids): void;
}
