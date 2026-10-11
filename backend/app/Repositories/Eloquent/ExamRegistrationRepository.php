<?php

namespace App\Repositories\Eloquent;

use App\Models\ExamRegistration;
use App\Repositories\Contracts\ExamRegistrationRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class ExamRegistrationRepository implements ExamRegistrationRepositoryInterface
{
    private function columnFor(string $examType): string
    {
        return match ($examType) {
            'applicant' => 'applicant_exampage_id',
            'magistratura' => 'magistratura_exampage_id',
            default => 'miq_exampage_id',
        };
    }

    public function findForUser(int $userId, string $examType, int $exampageId): ?ExamRegistration
    {
        $column = $this->columnFor($examType);

        return ExamRegistration::where('user_id', $userId)
            ->where($column, $exampageId)
            ->first();
    }

    public function findById(int $id): ?ExamRegistration
    {
        return ExamRegistration::with(['miqExampage', 'applicantExampage', 'magistraturaExampage'])->find($id);
    }

    public function create(array $data): ExamRegistration
    {
        return ExamRegistration::create($data);
    }

    public function markPaid(ExamRegistration $registration, string $paymentReference): ExamRegistration
    {
        $registration->update([
            'status' => 'paid',
            'payment_reference' => $paymentReference,
            'paid_at' => now(),
        ]);

        return $registration->fresh();
    }

    public function listForExampage(string $examType, int $exampageId, ?string $search = null, int $limit = 10): Collection
    {
        $column = $this->columnFor($examType);

        $query = ExamRegistration::with('user')
            ->where($column, $exampageId);

        if (!empty($search)) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('user_code', $search)
                  ->orWhere('first_name', 'like', '%' . $search . '%')
                  ->orWhere('last_name', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        return $query->orderBy('created_at', 'desc')->limit($limit)->get();
    }

    public function listForUser(int $userId): Collection
    {
        return ExamRegistration::with(['miqExampage', 'applicantExampage', 'magistraturaExampage'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function delete(ExamRegistration $registration): bool
    {
        return $registration->delete();
    }
}
