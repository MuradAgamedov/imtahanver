<?php

namespace App\Repositories\Eloquent;

use App\Models\MiqDirectQuestion;
use App\Repositories\Contracts\MiqDirectQuestionRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class MiqDirectQuestionRepository implements MiqDirectQuestionRepositoryInterface
{
    public function getByExampageAndType(int $exampageId, int $questionTypeId): Collection
    {
        return MiqDirectQuestion::where('miq_exampage_id', $exampageId)
            ->where('miq_question_type_id', $questionTypeId)
            ->orderBy('order')
            ->get();
    }

    public function findById(int $id): ?MiqDirectQuestion
    {
        return MiqDirectQuestion::find($id);
    }

    public function create(array $data): MiqDirectQuestion
    {
        return MiqDirectQuestion::create($data);
    }

    public function update(MiqDirectQuestion $question, array $data): MiqDirectQuestion
    {
        $question->update($data);
        return $question->fresh();
    }

    public function delete(MiqDirectQuestion $question): bool
    {
        return $question->delete();
    }

    public function reorderByIds(array $ids): void
    {
        DB::transaction(function () use ($ids) {
            foreach ($ids as $order => $id) {
                MiqDirectQuestion::where('id', $id)->update(['order' => $order]);
            }
        });
    }
}
