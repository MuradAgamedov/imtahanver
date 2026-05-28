<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;
use App\Models\MiqExampage;

interface MiqExampageRepositoryInterface
{
    public function all(): Collection;
    public function findById(int $id): ?MiqExampage;
    public function create(array $data): MiqExampage;
    public function update(MiqExampage $exampage, array $data): MiqExampage;
    public function delete(MiqExampage $exampage): bool;
}
