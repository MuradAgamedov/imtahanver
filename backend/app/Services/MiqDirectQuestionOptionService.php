<?php

namespace App\Services;

use App\Models\MiqDirectQuestionOption;
use App\Repositories\Contracts\MiqDirectQuestionOptionRepositoryInterface;
use App\Services\Contracts\MiqDirectQuestionOptionServiceInterface;
use Illuminate\Database\Eloquent\Collection;

class MiqDirectQuestionOptionService implements MiqDirectQuestionOptionServiceInterface
{
    public function __construct(
        protected MiqDirectQuestionOptionRepositoryInterface $optionRepository
    ) {}

    public function getOptions(int $questionId): Collection
    {
        return $this->optionRepository->getByQuestionId($questionId);
    }

    public function createOption(int $questionId, array $data): MiqDirectQuestionOption
    {
        if (!empty($data['is_true'])) {
            $this->optionRepository->clearTrueForQuestion($questionId);
        }

        $order = $this->optionRepository->getByQuestionId($questionId)->count();

        return $this->optionRepository->create([
            'miq_direct_question_id' => $questionId,
            'text'                   => $data['text'] ?? null,
            'is_true'                => !empty($data['is_true']),
            'order'                  => $order,
        ]);
    }

    public function updateOption(int $optionId, array $data): MiqDirectQuestionOption
    {
        $option = $this->optionRepository->findById($optionId);
        if (!$option) {
            throw new \Exception('Cavab tapılmadı.');
        }

        if (!empty($data['is_true'])) {
            $this->optionRepository->clearTrueForQuestion($option->miq_direct_question_id);
        }

        return $this->optionRepository->update($option, [
            'text'    => array_key_exists('text', $data) ? $data['text'] : $option->text,
            'is_true' => !empty($data['is_true']),
        ]);
    }

    public function deleteOption(int $optionId): bool
    {
        $option = $this->optionRepository->findById($optionId);
        if (!$option) {
            return false;
        }

        return $this->optionRepository->delete($option);
    }

    public function reorderOptions(array $ids): void
    {
        $this->optionRepository->reorderByIds($ids);
    }
}
