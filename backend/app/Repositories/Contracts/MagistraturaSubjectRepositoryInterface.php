<?php

namespace App\Repositories\Contracts;

use App\Models\MagistraturaSubject;
use Illuminate\Database\Eloquent\Collection;

interface MagistraturaSubjectRepositoryInterface
{
    public function all(?string $search = null): Collection;
    public function findById(int $id): ?MagistraturaSubject;
    public function findByIdentify(string $identify): ?MagistraturaSubject;
    public function create(array $data): MagistraturaSubject;
    public function update(MagistraturaSubject $subject, array $data): bool;
    public function delete(MagistraturaSubject $subject): bool;
}
