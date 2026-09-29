<?php

namespace App\Services;

use App\Models\ApplicantExampage;
use App\Models\MiqExampage;
use App\Models\User;
use App\Repositories\Contracts\ExamRegistrationRepositoryInterface;
use App\Services\Contracts\ExamRegistrationServiceInterface;

class ExamRegistrationService implements ExamRegistrationServiceInterface
{
    protected ExamRegistrationRepositoryInterface $registrationRepository;

    public function __construct(ExamRegistrationRepositoryInterface $registrationRepository)
    {
        $this->registrationRepository = $registrationRepository;
    }

    public function register(User $user, string $examType, int $exampageId): array
    {
        $exampage = $examType === 'applicant'
            ? ApplicantExampage::find($exampageId)
            : MiqExampage::find($exampageId);

        if (!$exampage) {
            return ['success' => false, 'message' => 'İmtahan vərəqi tapılmadı.', 'status_code' => 404];
        }

        $existing = $this->registrationRepository->findForUser($user->id, $examType, $exampageId);
        if ($existing) {
            return [
                'success' => true,
                'message' => $existing->status === 'paid' ? 'Artıq qeydiyyatdan keçmisiniz.' : 'Ödəniş gözlənilir.',
                'data' => $existing,
                'status_code' => 200,
            ];
        }

        $registration = $this->registrationRepository->create([
            'user_id' => $user->id,
            'miq_exampage_id' => $examType === 'applicant' ? null : $exampageId,
            'applicant_exampage_id' => $examType === 'applicant' ? $exampageId : null,
            'status' => 'pending_payment',
            'amount' => $exampage->price,
        ]);

        return [
            'success' => true,
            'message' => 'Qeydiyyat yaradıldı, ödənişi tamamlayın.',
            'data' => $registration,
            'status_code' => 201,
        ];
    }

    public function findForUser(User $user, int $registrationId): array
    {
        $registration = $this->registrationRepository->findById($registrationId);

        if (!$registration || $registration->user_id !== $user->id) {
            return ['success' => false, 'message' => 'Qeydiyyat tapılmadı.', 'status_code' => 404];
        }

        return ['success' => true, 'data' => $registration, 'status_code' => 200];
    }

    /**
     * Marks a registration as paid using a fake/mock reference. This is the
     * seam to replace once a real payment gateway (and its webhook/return
     * callback) is wired up — the rest of the system only cares about
     * `status === 'paid'`.
     */
    public function mockConfirmPayment(User $user, int $registrationId): array
    {
        $registration = $this->registrationRepository->findById($registrationId);

        if (!$registration || $registration->user_id !== $user->id) {
            return ['success' => false, 'message' => 'Qeydiyyat tapılmadı.', 'status_code' => 404];
        }

        if ($registration->status === 'paid') {
            return ['success' => true, 'message' => 'Ödəniş artıq təsdiqlənib.', 'data' => $registration, 'status_code' => 200];
        }

        $reference = 'MOCK-' . strtoupper(uniqid());
        $registration = $this->registrationRepository->markPaid($registration, $reference);

        return [
            'success' => true,
            'message' => 'Ödəniş uğurla təsdiqləndi.',
            'data' => $registration,
            'status_code' => 200,
        ];
    }

    public function listForUser(User $user): array
    {
        $registrations = $this->registrationRepository->listForUser($user->id);

        return ['success' => true, 'data' => $registrations, 'status_code' => 200];
    }

    public function listForExampage(string $examType, int $exampageId, ?string $search = null): array
    {
        $registrations = $this->registrationRepository->listForExampage($examType, $exampageId, $search);

        return ['success' => true, 'data' => $registrations, 'status_code' => 200];
    }

    /**
     * Admin manually enrolls a person into a paid exam (e.g. offline/cash
     * payment) — marks the registration paid immediately, bypassing the
     * student-facing (mock) payment step entirely.
     */
    public function adminRegister(string $examType, int $exampageId, int $userId): array
    {
        $exampage = $examType === 'applicant'
            ? ApplicantExampage::find($exampageId)
            : MiqExampage::find($exampageId);

        if (!$exampage) {
            return ['success' => false, 'message' => 'İmtahan vərəqi tapılmadı.', 'status_code' => 404];
        }

        $user = User::find($userId);
        if (!$user) {
            return ['success' => false, 'message' => 'İstifadəçi tapılmadı.', 'status_code' => 404];
        }

        $existing = $this->registrationRepository->findForUser($userId, $examType, $exampageId);
        if ($existing) {
            if ($existing->status !== 'paid') {
                $existing = $this->registrationRepository->markPaid($existing, 'ADMIN-MANUAL');
            }
            return ['success' => true, 'message' => 'İstifadəçi artıq qeydiyyatdadır, ödəniş təsdiqləndi.', 'data' => $existing, 'status_code' => 200];
        }

        $registration = $this->registrationRepository->create([
            'user_id' => $userId,
            'miq_exampage_id' => $examType === 'applicant' ? null : $exampageId,
            'applicant_exampage_id' => $examType === 'applicant' ? $exampageId : null,
            'status' => 'paid',
            'amount' => $exampage->price,
            'payment_reference' => 'ADMIN-MANUAL',
            'paid_at' => now(),
        ]);

        return ['success' => true, 'message' => 'İstifadəçi qeydiyyata əlavə edildi.', 'data' => $registration, 'status_code' => 201];
    }

    /**
     * Hours before the scheduled start after which a student can no longer
     * cancel their own registration (a same-day cutoff, not just "already
     * started"), so a refund can't be requested at the last minute.
     */
    private const CANCELLATION_CUTOFF_HOURS = 24;

    /**
     * Student cancels their own registration — only allowed while more than
     * CANCELLATION_CUTOFF_HOURS remain before the exam's scheduled start.
     */
    public function cancelRegistration(User $user, int $registrationId): array
    {
        $registration = $this->registrationRepository->findById($registrationId);

        if (!$registration || $registration->user_id !== $user->id) {
            return ['success' => false, 'message' => 'Qeydiyyat tapılmadı.', 'status_code' => 404];
        }

        $exampage = $registration->applicant_exampage_id
            ? $registration->applicantExampage
            : $registration->miqExampage;

        if ($exampage && $exampage->starts_at) {
            $cutoff = $exampage->starts_at->copy()->subHours(self::CANCELLATION_CUTOFF_HOURS);
            if (now()->gte($cutoff)) {
                return [
                    'success' => false,
                    'message' => 'İmtahana 1 gündən az qaldığı üçün qeydiyyatı ləğv edə bilməzsiniz.',
                    'status_code' => 403,
                ];
            }
        }

        $this->registrationRepository->delete($registration);

        return ['success' => true, 'message' => 'Qeydiyyat ləğv edildi.', 'status_code' => 200];
    }

    public function deleteRegistration(int $id): array
    {
        $registration = $this->registrationRepository->findById($id);
        if (!$registration) {
            return ['success' => false, 'message' => 'Qeydiyyat tapılmadı.', 'status_code' => 404];
        }

        $this->registrationRepository->delete($registration);

        return ['success' => true, 'message' => 'Qeydiyyat silindi.', 'status_code' => 200];
    }

    public function isRegisteredAndPaid(int $userId, string $examType, int $exampageId): bool
    {
        $registration = $this->registrationRepository->findForUser($userId, $examType, $exampageId);

        return $registration !== null && $registration->status === 'paid';
    }
}
