<?php

namespace App\Services;

use App\Repositories\Contracts\MiqQuestionOptionRepositoryInterface;
use App\Services\Contracts\MiqQuestionOptionServiceInterface;

class MiqQuestionOptionService implements MiqQuestionOptionServiceInterface
{
    protected MiqQuestionOptionRepositoryInterface $optionRepository;

    public function __construct(MiqQuestionOptionRepositoryInterface $optionRepository)
    {
        $this->optionRepository = $optionRepository;
    }

    public function getOptions(int $questionId): mixed
    {
        return $this->optionRepository->getByQuestionId($questionId);
    }

    public function createOption(int $questionId, array $data): mixed
    {
        // If this option is marked as correct, clear any existing correct answers first
        if (!empty($data['is_true']) && $data['is_true']) {
            $this->optionRepository->clearTrueForQuestion($questionId);
        }

        // Determine the order (append to end)
        $existing = $this->optionRepository->getByQuestionId($questionId);
        $order = $existing->count();

        return $this->optionRepository->create([
            'miq_question_id' => $questionId,
            'text'            => $data['text'] ?? null,
            'is_true'         => !empty($data['is_true']) && $data['is_true'] ? true : false,
            'image'           => $data['image'] ?? null,
            'order'           => $order,
        ]);
    }

    public function updateOption(int $optionId, array $data): mixed
    {
        $option = $this->optionRepository->findById($optionId);
        if (!$option) {
            throw new \Exception('Cavab tapılmadı.');
        }

        // If marking this option as correct, clear all others for the same question
        if (!empty($data['is_true']) && $data['is_true']) {
            $this->optionRepository->clearTrueForQuestion($option->miq_question_id);
        }

        return $this->optionRepository->update($option, [
            'text'    => array_key_exists('text', $data) ? $data['text'] : $option->text,
            'is_true' => !empty($data['is_true']) && $data['is_true'] ? true : false,
            'image'   => array_key_exists('image', $data) ? $data['image'] : $option->image,
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
