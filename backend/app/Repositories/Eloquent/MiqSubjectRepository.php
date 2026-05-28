<?php

namespace App\Repositories\Eloquent;

use App\Models\MiqSubject;
use App\Repositories\Contracts\MiqSubjectRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class MiqSubjectRepository implements MiqSubjectRepositoryInterface
{
    public function all(): Collection
    {
        return MiqSubject::orderBy('order', 'asc')->get();
    }

    public function findById(int $id): ?MiqSubject
    {
        return MiqSubject::find($id);
    }

    public function findByIdentify(string $identify): ?MiqSubject
    {
        return MiqSubject::where('identify', $identify)->first();
    }

    public function create(array $data): MiqSubject
    {
        return MiqSubject::create($data);
    }

    public function update(MiqSubject $subject, array $data): bool
    {
        return $subject->update($data);
    }

    public function delete(MiqSubject $subject): bool
    {
        return $subject->delete();
    }
}
