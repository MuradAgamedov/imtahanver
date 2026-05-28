<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\OtpRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Services\Contracts\AuthServiceInterface;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthService implements AuthServiceInterface
{
    protected UserRepositoryInterface $userRepository;
    protected OtpRepositoryInterface $otpRepository;

    public function __construct(
        UserRepositoryInterface $userRepository,
        OtpRepositoryInterface $otpRepository
    ) {
        $this->userRepository = $userRepository;
        $this->otpRepository = $otpRepository;
    }

    public function register(array $data): array
    {
        // Check if user already exists
        $existingUser = $this->userRepository->findByEmail($data['email']);
        if ($existingUser) {
            if ($existingUser->email_verified_at) {
                return [
                    'success' => false,
                    'message' => 'Bu email ünvanı ilə artıq qeydiyyatdan keçilib.',
                    'status_code' => 400
                ];
            }
            // If not verified, we can overwrite or reuse the user. Let's delete the unverified user.
            $existingUser->delete();
        }

        // Hash password
        $data['password'] = Hash::make($data['password']);

        // Create unverified user
        $user = $this->userRepository->create($data);

        // Generate a 6-digit OTP code
        $otp = (string) rand(100000, 999999);

        // Store OTP in cache/redis for 10 minutes (600 seconds)
        $this->otpRepository->store($user->email, $otp, 600);

        // Send OTP email using background Redis job
        \App\Jobs\SendOtpEmailJob::dispatch($user->email, $user->first_name, $otp);
        Log::info("Verification OTP for {$user->email}: {$otp}");

        return [
            'success' => true,
            'message' => 'Qeydiyyat tamamlandı. Zəhmət olmasa emailinizə göndərilən OTP kodunu təsdiqləyin.',
            'email' => $user->email,
            'status_code' => 201
        ];
    }

    public function verifyOtp(string $email, string $otp): array
    {
        $storedOtp = $this->otpRepository->get($email);

        if (!$storedOtp || $storedOtp !== $otp) {
            return [
                'success' => false,
                'message' => 'Daxil edilən OTP kod yanlışdır və ya vaxtı bitib.',
                'status_code' => 400
            ];
        }

        $user = $this->userRepository->findByEmail($email);
        if (!$user) {
            return [
                'success' => false,
                'message' => 'İstifadəçi tapılmadı.',
                'status_code' => 404
            ];
        }

        // Verify user email
        $this->userRepository->verifyEmail($user);

        // Delete OTP
        $this->otpRepository->delete($email);

        // Generate login token
        $token = $this->generateToken($user);

        return [
            'success' => true,
            'message' => 'Email ünvanınız uğurla təsdiqləndi!',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email
            ],
            'status_code' => 200
        ];
    }

    public function login(string $email, string $password): array
    {
        $user = $this->userRepository->findByEmail($email);

        if (!$user || !Hash::check($password, $user->password)) {
            return [
                'success' => false,
                'message' => 'Email və ya şifrə yanlışdır.',
                'status_code' => 401
            ];
        }

        if (!$user->email_verified_at) {
            // Generate new OTP
            $otp = (string) rand(100000, 999999);
            $this->otpRepository->store($user->email, $otp, 600);
            \App\Jobs\SendOtpEmailJob::dispatch($user->email, $user->first_name, $otp);
            Log::info("Verification OTP for {$user->email}: {$otp}");

            return [
                'success' => false,
                'requires_verification' => true,
                'message' => 'Zəhmət olmasa əvvəlcə emailinizi təsdiqləyin.',
                'email' => $user->email,
                'status_code' => 403
            ];
        }

        // Generate login token
        $token = $this->generateToken($user);

        return [
            'success' => true,
            'message' => 'Giriş uğurludur.',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email
            ],
            'status_code' => 200
        ];
    }

    private function generateToken(User $user): string
    {
        $header = json_encode(['alg' => 'HS256', 'typ' => 'JWT']);
        $payload = json_encode([
            'sub' => $user->id,
            'email' => $user->email,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'iat' => time(),
            'exp' => time() + (3600 * 24), // 24 hours
        ]);

        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, config('app.key'));
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }
}
