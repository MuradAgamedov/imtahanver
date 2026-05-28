<?php

namespace App\Services;

use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Contracts\UserCategoryRepositoryInterface;
use App\Repositories\Contracts\OtpRepositoryInterface;
use App\Services\Contracts\ProfileServiceInterface;
use App\Jobs\SendProfileOtpJob;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class ProfileService implements ProfileServiceInterface
{
    protected UserRepositoryInterface $userRepository;
    protected UserCategoryRepositoryInterface $categoryRepository;
    protected OtpRepositoryInterface $otpRepository;

    public function __construct(
        UserRepositoryInterface $userRepository,
        UserCategoryRepositoryInterface $categoryRepository,
        OtpRepositoryInterface $otpRepository
    ) {
        $this->userRepository = $userRepository;
        $this->categoryRepository = $categoryRepository;
        $this->otpRepository = $otpRepository;
    }

    public function getUserCategories(): array
    {
        $categories = $this->categoryRepository->all();
        return [
            'success' => true,
            'data' => $categories->map(function ($cat) {
                return [
                    'title' => $cat->title,
                    'identify' => $cat->identify
                ];
            })->toArray(),
            'status_code' => 200
        ];
    }

    public function updateCategory(int $userId, string $identify): array
    {
        $user = $this->userRepository->findById($userId);
        if (!$user) {
            return ['success' => false, 'message' => 'İstifadəçi tapılmadı.', 'status_code' => 404];
        }

        $category = $this->categoryRepository->findByIdentify($identify);
        if (!$category) {
            return ['success' => false, 'message' => 'Kateqoriya tapılmadı.', 'status_code' => 404];
        }

        $this->userRepository->update($user, [
            'user_category_identify' => $identify
        ]);

        return [
            'success' => true,
            'message' => 'Profil kateqoriyanız uğurla yeniləndi.',
            'category' => [
                'title' => $category->title,
                'identify' => $category->identify
            ],
            'status_code' => 200
        ];
    }

    public function updateName(int $userId, string $firstName, string $lastName): array
    {
        $user = $this->userRepository->findById($userId);
        if (!$user) {
            return ['success' => false, 'message' => 'İstifadəçi tapılmadı.', 'status_code' => 404];
        }

        $this->userRepository->update($user, [
            'first_name' => $firstName,
            'last_name' => $lastName
        ]);

        return [
            'success' => true,
            'message' => 'Ad və soyadınız uğurla yeniləndi.',
            'user' => [
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $user->email
            ],
            'status_code' => 200
        ];
    }

    public function requestEmailChange(int $userId, string $newEmail): array
    {
        $user = $this->userRepository->findById($userId);
        if (!$user) {
            return ['success' => false, 'message' => 'İstifadəçi tapılmadı.', 'status_code' => 404];
        }

        if ($user->email === $newEmail) {
            return ['success' => false, 'message' => 'Yeni email cari emailinizlə eyni ola bilməz.', 'status_code' => 400];
        }

        $existingUser = $this->userRepository->findByEmail($newEmail);
        if ($existingUser) {
            return ['success' => false, 'message' => 'Bu email artıq başqa bir istifadəçi tərəfindən istifadə olunur.', 'status_code' => 400];
        }

        // Generate OTP
        $otp = (string) rand(100000, 999999);

        // Store OTP in cache/redis for 10 minutes
        $cacheKey = "email_change:{$userId}:{$newEmail}";
        $this->otpRepository->store($cacheKey, $otp, 600);

        // Dispatch background job to send OTP to the NEW email
        SendProfileOtpJob::dispatch($newEmail, $user->first_name, $otp, 'email_change');
        Log::info("Email change OTP for User {$userId} to {$newEmail}: {$otp}");

        return [
            'success' => true,
            'message' => 'Yeni emailinizə 6 rəqəmli təsdiqləmə kodu göndərildi.',
            'status_code' => 200
        ];
    }

    public function confirmEmailChange(int $userId, string $newEmail, string $otp): array
    {
        $user = $this->userRepository->findById($userId);
        if (!$user) {
            return ['success' => false, 'message' => 'İstifadəçi tapılmadı.', 'status_code' => 404];
        }

        $cacheKey = "email_change:{$userId}:{$newEmail}";
        $storedOtp = $this->otpRepository->get($cacheKey);

        if (!$storedOtp || $storedOtp !== $otp) {
            return ['success' => false, 'message' => 'Təqdim edilən OTP kod yanlışdır və ya vaxtı bitib.', 'status_code' => 400];
        }

        // Update email
        $this->userRepository->update($user, [
            'email' => $newEmail
        ]);

        // Clean up OTP
        $this->otpRepository->delete($cacheKey);

        return [
            'success' => true,
            'message' => 'Email ünvanınız uğurla yeniləndi.',
            'email' => $newEmail,
            'status_code' => 200
        ];
    }

    public function requestPasswordChange(int $userId): array
    {
        $user = $this->userRepository->findById($userId);
        if (!$user) {
            return ['success' => false, 'message' => 'İstifadəçi tapılmadı.', 'status_code' => 404];
        }

        // Generate OTP
        $otp = (string) rand(100000, 999999);

        // Store OTP in cache
        $cacheKey = "password_change:{$userId}";
        $this->otpRepository->store($cacheKey, $otp, 600);

        // Send OTP to CURRENT email
        SendProfileOtpJob::dispatch($user->email, $user->first_name, $otp, 'password_change');
        Log::info("Password change OTP for User {$userId}: {$otp}");

        return [
            'success' => true,
            'message' => 'Cari email ünvanınıza təsdiqləmə kodu göndərildi.',
            'status_code' => 200
        ];
    }

    public function confirmPasswordChange(int $userId, string $newPassword, string $otp): array
    {
        $user = $this->userRepository->findById($userId);
        if (!$user) {
            return ['success' => false, 'message' => 'İstifadəçi tapılmadı.', 'status_code' => 404];
        }

        $cacheKey = "password_change:{$userId}";
        $storedOtp = $this->otpRepository->get($cacheKey);

        if (!$storedOtp || $storedOtp !== $otp) {
            return ['success' => false, 'message' => 'Təqdim edilən OTP kod yanlışdır və ya vaxtı bitib.', 'status_code' => 400];
        }

        // Update password
        $this->userRepository->update($user, [
            'password' => Hash::make($newPassword)
        ]);

        // Clean up OTP
        $this->otpRepository->delete($cacheKey);

        return [
            'success' => true,
            'message' => 'Şifrəniz uğurla yeniləndi.',
            'status_code' => 200
        ];
    }
}
