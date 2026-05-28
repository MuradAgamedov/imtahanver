<?php

namespace App\Repositories\Eloquent;

use App\Models\MiqExampageSubject;
use App\Repositories\Contracts\MiqExampageSubjectRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class MiqExampageSubjectRepository implements MiqExampageSubjectRepositoryInterface
{
    public function getByExampageId(int $exampageId): Collection
    {
        return MiqExampageSubject::with('subject')
            ->where('miq_exampage_id', $exampageId)
            ->get();
    }

    public function findByExampageAndSubject(int $exampageId, int $subjectId): ?MiqExampageSubject
    {
        return MiqExampageSubject::where('miq_exampage_id', $exampageId)
            ->where('miq_subject_id', $subjectId)
            ->first();
    }

    public function create(array $data): MiqExampageSubject
    {
        return MiqExampageSubject::create($data);
    }

    public function delete(MiqExampageSubject $association): bool
    {
        return $association->delete();
    }
}
