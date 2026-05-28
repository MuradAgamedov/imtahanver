<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;
use App\Models\MiqSubject;

interface MiqSubjectRepositoryInterface
{
    public function all(): Collection;
    public function findById(int $id): ?MiqSubject;
    public function findByIdentify(string $identify): ?MiqSubject;
    public function create(array $data): MiqSubject;
    public function update(MiqSubject $subject, array $data): bool;
    public function delete(MiqSubject $subject): bool;
}
