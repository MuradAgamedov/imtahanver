<?php

namespace App\Repositories\Eloquent;

use App\Models\MiqQuestion;
use App\Repositories\Contracts\MiqQuestionRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class MiqQuestionRepository implements MiqQuestionRepositoryInterface
{
    public function getQuestions(int $exampageId, int $questionTypeId, ?int $subjectId): Collection
    {
        return MiqQuestion::where('miq_exampage_id', $exampageId)
            ->where('miq_question_type_id', $questionTypeId)
            ->where('miq_subject_id', $subjectId)
            ->orderBy('order')
            ->get();
    }

    public function findById(int $id): ?MiqQuestion
    {
        return MiqQuestion::find($id);
    }

    public function create(array $data): MiqQuestion
    {
        return MiqQuestion::create($data);
    }

    public function update(MiqQuestion $question, array $data): bool
    {
        return $question->update($data);
    }

    public function delete(MiqQuestion $question): bool
    {
        return $question->delete();
    }

    public function updateOrder(array $ids): bool
    {
        return DB::transaction(function () use ($ids) {
            foreach ($ids as $index => $id) {
                MiqQuestion::where('id', $id)->update(['order' => $index]);
            }
            return true;
        });
    }
}
