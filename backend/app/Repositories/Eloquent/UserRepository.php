<?php

namespace App\Repositories\Eloquent;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;

class UserRepository implements UserRepositoryInterface
{
    public function findById(int $id): ?User
    {
        return User::find($id);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function create(array $data): User
    {
        return User::create([
            'first_name' => $data['firstName'],
            'last_name' => $data['lastName'],
            'email' => $data['email'],
            'password' => $data['password'],
        ]);
    }

    public function verifyEmail(User $user): bool
    {
        return $user->update([
            'email_verified_at' => now(),
        ]);
    }

    public function update(User $user, array $data): bool
    {
        return $user->update($data);
    }

    public function all(): \Illuminate\Database\Eloquent\Collection
    {
        return User::orderBy('id', 'desc')->get();
    }

    public function allNonAdmins(): \Illuminate\Database\Eloquent\Collection
    {
        return User::where('is_admin', false)->orderBy('id', 'desc')->get();
    }

    public function allAdmins(): \Illuminate\Database\Eloquent\Collection
    {
        return User::where('is_admin', true)->orderBy('id', 'desc')->get();
    }

    public function delete(User $user): bool
    {
        return $user->delete();
    }
}
