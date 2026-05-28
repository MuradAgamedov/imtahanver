<?php

namespace App\Services\Contracts;

use App\Models\MiqDirectQuestionOption;
use Illuminate\Database\Eloquent\Collection;

interface MiqDirectQuestionOptionServiceInterface
{
    public function getOptions(int $questionId): Collection;
    public function createOption(int $questionId, array $data): MiqDirectQuestionOption;
    public function updateOption(int $optionId, array $data): MiqDirectQuestionOption;
    public function deleteOption(int $optionId): bool;
    public function reorderOptions(array $ids): void;
}
