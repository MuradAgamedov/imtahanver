<?php

namespace App\Services\Contracts;

interface MiqQuestionOptionServiceInterface
{
    public function getOptions(int $questionId): mixed;
    public function createOption(int $questionId, array $data): mixed;
    public function updateOption(int $optionId, array $data): mixed;
    public function deleteOption(int $optionId): bool;
    public function reorderOptions(array $ids): void;
}
