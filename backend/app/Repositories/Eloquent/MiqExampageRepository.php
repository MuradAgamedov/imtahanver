<?php

namespace App\Repositories\Eloquent;

use App\Models\MiqExampage;
use App\Repositories\Contracts\MiqExampageRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class MiqExampageRepository implements MiqExampageRepositoryInterface
{
    public function all(): Collection
    {
        return MiqExampage::orderBy('id', 'desc')->get();
    }

    public function findById(int $id): ?MiqExampage
    {
        return MiqExampage::find($id);
    }

    public function create(array $data): MiqExampage
    {
        return MiqExampage::create($data);
    }

    public function delete(MiqExampage $exampage): bool
    {
        return $exampage->delete();
    }
}
