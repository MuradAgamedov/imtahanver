<?php

namespace App\Repositories\Eloquent;

use App\Models\MiqQuestionOption;
use App\Repositories\Contracts\MiqQuestionOptionRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class MiqQuestionOptionRepository implements MiqQuestionOptionRepositoryInterface
{
    public function getByQuestionId(int $questionId): Collection
    {
        return MiqQuestionOption::where('miq_question_id', $questionId)
            ->orderBy('order')
            ->get();
    }

    public function findById(int $id): ?MiqQuestionOption
    {
        return MiqQuestionOption::find($id);
    }

    public function create(array $data): MiqQuestionOption
    {
        return MiqQuestionOption::create($data);
    }

    public function update(MiqQuestionOption $option, array $data): MiqQuestionOption
    {
        $option->update($data);
        return $option->fresh();
    }

    public function delete(MiqQuestionOption $option): bool
    {
        return $option->delete();
    }

    public function clearTrueForQuestion(int $questionId): void
    {
        MiqQuestionOption::where('miq_question_id', $questionId)
            ->where('is_true', true)
            ->update(['is_true' => false]);
    }

    public function reorderByIds(array $ids): void
    {
        foreach ($ids as $order => $id) {
            MiqQuestionOption::where('id', $id)->update(['order' => $order]);
        }
    }
}
