<?php

namespace App\Repositories\Contracts;

use App\Models\ExamRegistration;
use Illuminate\Database\Eloquent\Collection;

interface ExamRegistrationRepositoryInterface
{
    public function findForUser(int $userId, string $examType, int $exampageId): ?ExamRegistration;
    public function findById(int $id): ?ExamRegistration;
    public function create(array $data): ExamRegistration;
    public function markPaid(ExamRegistration $registration, string $paymentReference): ExamRegistration;
    public function listForExampage(string $examType, int $exampageId, ?string $search = null, int $limit = 10): Collection;
    public function listForUser(int $userId): Collection;
    public function delete(ExamRegistration $registration): bool;
}
