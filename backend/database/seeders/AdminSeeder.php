<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@imtahanver.az'],
            [
                'first_name' => 'Murad',
                'last_name' => 'Ağamedov',
                'password' => Hash::make('admin12345'),
                'is_admin' => true,
                'email_verified_at' => now(),
            ]
        );
    }
}
