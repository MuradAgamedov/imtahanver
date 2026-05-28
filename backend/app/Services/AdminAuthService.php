<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Services\Contracts\AdminAuthServiceInterface;
use Illuminate\Support\Facades\Hash;

class AdminAuthService implements AdminAuthServiceInterface
{
    protected UserRepositoryInterface $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function login(string $email, string $password): array
    {
        $user = $this->userRepository->findByEmail($email);

        if (!$user || !Hash::check($password, $user->password)) {
            return [
                'success' => false,
                'message' => 'E-poçt ünvanı və ya şifrə yanlışdır.',
                'status_code' => 401,
            ];
        }

        if (!$user->is_admin) {
            return [
                'success' => false,
                'message' => 'Bu panelə daxil olmaq üçün admin hüquqlarınız yoxdur.',
                'status_code' => 403,
            ];
        }

        $token = $this->generateToken($user);

        return [
            'success' => true,
            'message' => 'Giriş uğurludur.',
            'token' => $token,
            'admin' => [
                'id' => $user->id,
                'name' => ($user->first_name . ' ' . $user->last_name),
                'email' => $user->email,
            ],
            'status_code' => 200,
        ];
    }

    private function generateToken(User $user): string
    {
        $header = json_encode(['alg' => 'HS256', 'typ' => 'JWT']);
        $payload = json_encode([
            'sub' => $user->id,
            'email' => $user->email,
            'name' => ($user->first_name . ' ' . $user->last_name),
            'role' => 'admin',
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
