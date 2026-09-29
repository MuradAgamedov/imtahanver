<?php

namespace App\Services\Contracts;

use App\Models\User;

interface ExamRegistrationServiceInterface
{
    public function register(User $user, string $examType, int $exampageId): array;
    public function findForUser(User $user, int $registrationId): array;
    public function mockConfirmPayment(User $user, int $registrationId): array;
    public function cancelRegistration(User $user, int $registrationId): array;
    public function listForUser(User $user): array;
    public function listForExampage(string $examType, int $exampageId, ?string $search = null): array;
    public function adminRegister(string $examType, int $exampageId, int $userId): array;
    public function deleteRegistration(int $id): array;
    public function isRegisteredAndPaid(int $userId, string $examType, int $exampageId): bool;
}
