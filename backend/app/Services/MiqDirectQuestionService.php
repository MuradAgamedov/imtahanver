<?php

namespace App\Services;

use App\Models\MiqDirectQuestion;
use App\Repositories\Contracts\MiqDirectQuestionRepositoryInterface;
use App\Services\Contracts\MiqDirectQuestionServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class MiqDirectQuestionService implements MiqDirectQuestionServiceInterface
{
    public function __construct(
        protected MiqDirectQuestionRepositoryInterface $questionRepository
    ) {}

    public function getQuestions(int $exampageId, int $questionTypeId): Collection
    {
        return $this->questionRepository->getByExampageAndType($exampageId, $questionTypeId);
    }

    public function getQuestionById(int $id): ?MiqDirectQuestion
    {
        return $this->questionRepository->findById($id);
    }

    public function createQuestion(array $data): MiqDirectQuestion
    {
        if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
            $path = $data['image']->store('uploads/miq-direct-questions', 'public');
            $data['image'] = '/storage/' . $path;
        }

        $existing = $this->questionRepository->getByExampageAndType(
            $data['miq_exampage_id'],
            $data['miq_question_type_id']
        );
        $data['order'] = $existing->count();

        return $this->questionRepository->create($data);
    }

    public function updateQuestion(int $id, array $data): MiqDirectQuestion
    {
        $question = $this->questionRepository->findById($id);
        if (!$question) {
            throw new \Exception('Sual tapılmadı.');
        }

        if (isset($data['image'])) {
            if ($data['image'] instanceof UploadedFile) {
                $this->deleteImageFile($question->image);
                $path = $data['image']->store('uploads/miq-direct-questions', 'public');
                $data['image'] = '/storage/' . $path;
            } elseif ($data['image'] === null) {
                $this->deleteImageFile($question->image);
                $data['image'] = null;
            }
        }

        return $this->questionRepository->update($question, $data);
    }

    public function deleteQuestion(int $id): bool
    {
        $question = $this->questionRepository->findById($id);
        if (!$question) {
            return false;
        }

        $this->deleteImageFile($question->image);
        return $this->questionRepository->delete($question);
    }

    public function reorderQuestions(array $ids): void
    {
        $this->questionRepository->reorderByIds($ids);
    }

    private function deleteImageFile(?string $imagePath): void
    {
        if ($imagePath) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $imagePath));
        }
    }
}
