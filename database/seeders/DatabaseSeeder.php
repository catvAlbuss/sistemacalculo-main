<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Primero crear roles y permisos
        $this->call(RolesAndPermissionsSeeder::class);

        // 2. Luego crear planes de suscripción
        $this->call(SubscriptionPlansSeeder::class);

        // 3. Finalmente crear usuario root
        $this->call(RootUserSeeder::class);

        $this->command->info('============================================');
        $this->command->info('¡Base de datos sembrada exitosamente!');
        $this->command->info('============================================');
        $this->command->info('Usuario ROOT creado:');
        $this->command->info('Email: root@sistemacalculo.com');
        $this->command->info('Password: password');
        $this->command->warn('¡CAMBIA LA CONTRASEÑA INMEDIATAMENTE!');
        $this->command->info('============================================');
    }
}
