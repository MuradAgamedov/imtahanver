<?php

namespace App\Services;

use App\Repositories\Contracts\UserRepositoryInterface;
use App\Services\Contracts\AdminUserServiceInterface;
use Illuminate\Support\Facades\Hash;

class AdminUserService implements AdminUserServiceInterface
{
    protected UserRepositoryInterface $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    // ─── Standard User CRUD ──────────────────────────────────────────────────────

    public function listUsers(?string $search = null): array
    {
        $users = $this->userRepository->allNonAdmins($search);
        return [
            'success' => true,
            'data' => $users,
            'status_code' => 200
        ];
    }

    public function createUser(array $data): array
    {
        $existing = $this->userRepository->findByEmail($data['email']);
        if ($existing) {
            return [
                'success' => false,
                'message' => 'Bu email ünvanı ilə artıq istifadəçi qeydiyyatdan keçib.',
                'status_code' => 422
            ];
        }

        $user = $this->userRepository->create([
            'firstName' => $data['first_name'],
            'lastName' => $data['last_name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        $user->update([
            'is_admin' => false,
            'email_verified_at' => now(),
        ]);

        if (isset($data['user_category_identify'])) {
            $user->update(['user_category_identify' => $data['user_category_identify']]);
        }

        return [
            'success' => true,
            'message' => 'İstifadəçi uğurla yaradıldı.',
            'data' => $user,
            'status_code' => 201
        ];
    }

    public function updateUser(int $id, array $data): array
    {
        $user = $this->userRepository->findById($id);
        if (!$user || $user->is_admin) {
            return [
                'success' => false,
                'message' => 'İstifadəçi tapılmadı.',
                'status_code' => 404
            ];
        }

        if (isset($data['email']) && $data['email'] !== $user->email) {
            $existing = $this->userRepository->findByEmail($data['email']);
            if ($existing) {
                return [
                    'success' => false,
                    'message' => 'Bu email ünvanı artıq istifadə olunur.',
                    'status_code' => 422
                ];
            }
        }

        $updateData = [];
        if (isset($data['first_name'])) $updateData['first_name'] = $data['first_name'];
        if (isset($data['last_name'])) $updateData['last_name'] = $data['last_name'];
        if (isset($data['email'])) $updateData['email'] = $data['email'];
        if (isset($data['user_category_identify'])) $updateData['user_category_identify'] = $data['user_category_identify'];
        if (isset($data['password']) && !empty($data['password'])) {
            $updateData['password'] = Hash::make($data['password']);
        }

        $this->userRepository->update($user, $updateData);

        return [
            'success' => true,
            'message' => 'İstifadəçi məlumatları yeniləndi.',
            'data' => $user->fresh(),
            'status_code' => 200
        ];
    }

    public function deleteUser(int $id): array
    {
        $user = $this->userRepository->findById($id);
        if (!$user || $user->is_admin) {
            return [
                'success' => false,
                'message' => 'İstifadəçi tapılmadı.',
                'status_code' => 404
            ];
        }

        $this->userRepository->delete($user);

        return [
            'success' => true,
            'message' => 'İstifadəçi silindi.',
            'status_code' => 200
        ];
    }

    // ─── Admin User CRUD ─────────────────────────────────────────────────────────

    public function listAdmins(?string $search = null): array
    {
        $admins = $this->userRepository->allAdmins($search);
        return [
            'success' => true,
            'data' => $admins,
            'status_code' => 200
        ];
    }

    public function createAdmin(array $data): array
    {
        $existing = $this->userRepository->findByEmail($data['email']);
        if ($existing) {
            return [
                'success' => false,
                'message' => 'Bu email ünvanı ilə artıq istifadəçi qeydiyyatdan keçib.',
                'status_code' => 422
            ];
        }

        $admin = $this->userRepository->create([
            'firstName' => $data['first_name'],
            'lastName' => $data['last_name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        $admin->update([
            'is_admin' => true,
            'email_verified_at' => now(),
        ]);

        return [
            'success' => true,
            'message' => 'Admin uğurla yaradıldı.',
            'data' => $admin,
            'status_code' => 201
        ];
    }

    public function updateAdmin(int $id, array $data): array
    {
        $admin = $this->userRepository->findById($id);
        if (!$admin || !$admin->is_admin) {
            return [
                'success' => false,
                'message' => 'Admin tapılmadı.',
                'status_code' => 404
            ];
        }

        if (isset($data['email']) && $data['email'] !== $admin->email) {
            $existing = $this->userRepository->findByEmail($data['email']);
            if ($existing) {
                return [
                    'success' => false,
                    'message' => 'Bu email ünvanı artıq istifadə olunur.',
                    'status_code' => 422
                ];
            }
        }

        $updateData = [];
        if (isset($data['first_name'])) $updateData['first_name'] = $data['first_name'];
        if (isset($data['last_name'])) $updateData['last_name'] = $data['last_name'];
        if (isset($data['email'])) $updateData['email'] = $data['email'];
        if (isset($data['password']) && !empty($data['password'])) {
            $updateData['password'] = Hash::make($data['password']);
        }

        $this->userRepository->update($admin, $updateData);

        return [
            'success' => true,
            'message' => 'Admin məlumatları yeniləndi.',
            'data' => $admin->fresh(),
            'status_code' => 200
        ];
    }

    public function deleteAdmin(int $id): array
    {
        $admin = $this->userRepository->findById($id);
        if (!$admin || !$admin->is_admin) {
            return [
                'success' => false,
                'message' => 'Admin tapılmadı.',
                'status_code' => 404
            ];
        }

        // Prevent self deletion
        if (auth()->id() === $admin->id) {
            return [
                'success' => false,
                'message' => 'Öz admin hesabınızı silə bilməzsiniz.',
                'status_code' => 422
            ];
        }

        $this->userRepository->delete($admin);

        return [
            'success' => true,
            'message' => 'Admin silindi.',
            'status_code' => 200
        ];
    }
}
