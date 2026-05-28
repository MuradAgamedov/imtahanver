<?php

namespace App\Services;

use App\Models\MiqQuestion;
use App\Repositories\Contracts\MiqQuestionRepositoryInterface;
use App\Services\Contracts\MiqQuestionServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

class MiqQuestionService implements MiqQuestionServiceInterface
{
    protected $questionRepository;

    public function __construct(MiqQuestionRepositoryInterface $questionRepository)
    {
        $this->questionRepository = $questionRepository;
    }

    public function getQuestions(int $exampageId, int $questionTypeId, ?int $subjectId): Collection
    {
        return $this->questionRepository->getQuestions($exampageId, $questionTypeId, $subjectId);
    }

    public function getQuestionById(int $id): ?MiqQuestion
    {
        return $this->questionRepository->findById($id);
    }

    public function createQuestion(array $data): MiqQuestion
    {
        if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
            $path = $data['image']->store('uploads/miq-questions', 'public');
            $data['image'] = '/storage/' . $path;
        }

        return $this->questionRepository->create($data);
    }

    public function updateQuestion(int $id, array $data): MiqQuestion
    {
        $question = $this->questionRepository->findById($id);
        if (!$question) {
            throw new \Exception("Sual tapılmadı.");
        }

        if (isset($data['image'])) {
            if ($data['image'] instanceof UploadedFile) {
                // Delete old image if exists
                if ($question->image) {
                    $oldPath = str_replace('/storage/', '', $question->image);
                    Storage::disk('public')->delete($oldPath);
                }
                $path = $data['image']->store('uploads/miq-questions', 'public');
                $data['image'] = '/storage/' . $path;
            } elseif ($data['image'] === null || $data['image'] === 'null' || $data['image'] === '') {
                // Delete old image if requested to remove
                if ($question->image) {
                    $oldPath = str_replace('/storage/', '', $question->image);
                    Storage::disk('public')->delete($oldPath);
                }
                $data['image'] = null;
            }
        }

        $this->questionRepository->update($question, $data);
        return $question->refresh();
    }

    public function deleteQuestion(int $id): bool
    {
        $question = $this->questionRepository->findById($id);
        if (!$question) {
            return false;
        }

        if ($question->image) {
            $oldPath = str_replace('/storage/', '', $question->image);
            Storage::disk('public')->delete($oldPath);
        }

        return $this->questionRepository->delete($question);
    }

    public function reorderQuestions(array $ids): bool
    {
        return $this->questionRepository->updateOrder($ids);
    }
}
