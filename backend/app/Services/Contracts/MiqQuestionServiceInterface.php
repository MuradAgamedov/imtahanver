<?php

namespace App\Services\Contracts;

use Illuminate\Database\Eloquent\Collection;
use App\Models\MiqQuestion;

interface MiqQuestionServiceInterface
{
    public function getQuestions(int $exampageId, int $questionTypeId, ?int $subjectId): Collection;
    public function getQuestionById(int $id): ?MiqQuestion;
    public function createQuestion(array $data): MiqQuestion;
    public function updateQuestion(int $id, array $data): MiqQuestion;
    public function deleteQuestion(int $id): bool;
    public function reorderQuestions(array $ids): bool;
}
