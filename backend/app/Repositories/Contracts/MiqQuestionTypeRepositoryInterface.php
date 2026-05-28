<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;
use App\Models\MiqQuestionType;

interface MiqQuestionTypeRepositoryInterface
{
    public function getByExampageId(int $exampageId): Collection;
    public function create(array $data): MiqQuestionType;
}
