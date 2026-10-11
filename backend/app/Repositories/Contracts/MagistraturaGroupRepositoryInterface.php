<?php

namespace App\Repositories\Contracts;

use App\Models\MagistraturaGroup;
use Illuminate\Database\Eloquent\Collection;

interface MagistraturaGroupRepositoryInterface
{
    public function all(?string $search = null): Collection;
    public function findById(int $id): ?MagistraturaGroup;
    public function findByIdentify(string $identify): ?MagistraturaGroup;
    public function create(array $data): MagistraturaGroup;
    public function update(MagistraturaGroup $group, array $data): bool;
    public function delete(MagistraturaGroup $group): bool;
    public function syncSubjects(MagistraturaGroup $group, array $subjectIds): void;
}
