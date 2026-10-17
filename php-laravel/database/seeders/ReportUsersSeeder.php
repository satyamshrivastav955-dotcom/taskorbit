<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReportUsersSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('report_users')->insert([
            'name' => 'Demo Manager',
            'email' => 'manager@example.test',
            'password_hash' => password_hash('demo123456', PASSWORD_DEFAULT),
            'role' => 'manager',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
