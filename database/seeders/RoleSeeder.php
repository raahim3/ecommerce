<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::firstOrCreate(
            ['slug' => 'admin'],
            [
                'name' => 'Admin',
                'description' => 'Super Administrator with full access to admin dashboard and store settings.',
            ]
        );

        $customerRole = Role::firstOrCreate(
            ['slug' => 'customer'],
            [
                'name' => 'Customer',
                'description' => 'Regular customer with storefront access, order history, and account profile.',
            ]
        );

        // Seed default Super Admin
        User::firstOrCreate(
            ['email' => 'admin@atelier.luxury'],
            [
                'name' => 'Alex Rivers (Admin)',
                'password' => Hash::make('password'),
                'role_id' => $adminRole->id,
                'email_verified_at' => now(),
            ]
        );

        // Seed demo customer
        User::firstOrCreate(
            ['email' => 'demo@atelier.luxury'],
            [
                'name' => 'Demo Customer',
                'password' => Hash::make('password'),
                'role_id' => $customerRole->id,
                'email_verified_at' => now(),
            ]
        );
    }
}
