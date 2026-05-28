<?php

namespace App\Repositories\Eloquent;

use App\Models\MiqDirectQuestionOption;
use App\Repositories\Contracts\MiqDirectQuestionOptionRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class MiqDirectQuestionOptionRepository implements MiqDirectQuestionOptionRepositoryInterface
{
    public function getByQuestionId(int $questionId): Collection
    {
        return MiqDirectQuestionOption::where('miq_direct_question_id', $questionId)
            ->orderBy('order')
            ->get();
    }

    public function findById(int $id): ?MiqDirectQuestionOption
    {
        return MiqDirectQuestionOption::find($id);
    }

    public function create(array $data): MiqDirectQuestionOption
    {
        return MiqDirectQuestionOption::create($data);
    }

    public function update(MiqDirectQuestionOption $option, array $data): MiqDirectQuestionOption
    {
        $option->update($data);
        return $option->fresh();
    }

    public function delete(MiqDirectQuestionOption $option): bool
    {
        return $option->delete();
    }

    public function clearTrueForQuestion(int $questionId): void
    {
        MiqDirectQuestionOption::where('miq_direct_question_id', $questionId)
            ->where('is_true', true)
            ->update(['is_true' => false]);
    }

    public function reorderByIds(array $ids): void
    {
        foreach ($ids as $order => $id) {
            MiqDirectQuestionOption::where('id', $id)->update(['order' => $order]);
        }
    }
}
