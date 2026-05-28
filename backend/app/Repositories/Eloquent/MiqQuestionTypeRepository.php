<?php

namespace App\Repositories\Eloquent;

use App\Models\MiqQuestionType;
use App\Repositories\Contracts\MiqQuestionTypeRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class MiqQuestionTypeRepository implements MiqQuestionTypeRepositoryInterface
{
    public function getByExampageId(int $exampageId): Collection
    {
        return MiqQuestionType::where('miq_exampage_id', $exampageId)->get();
    }

    public function create(array $data): MiqQuestionType
    {
        return MiqQuestionType::create($data);
    }
}
