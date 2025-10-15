<?php

namespace Database\Seeders;

use App\Models\Subscription;
use App\Models\User;
use App\Models\UserSubscription;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class RootUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Buscar o crear el plan de por vida para el usuario root
        $lifetimePlan = Subscription::where('slug', 'de-por-vida')->first();

        if (!$lifetimePlan) {
            $lifetimePlan = Subscription::create([
                'name' => 'De Por Vida',
                'slug' => 'de-por-vida',
                'description' => 'Acceso permanente',
                'price' => 0,
                'duration_days' => null,
                'type' => 'lifetime',
                'is_active' => true,
                'sort_order' => 0,
            ]);
        }

        // Crear usuario ROOT
        $rootUser = User::firstOrCreate(
            ['email' => 'root@sistemacalculo.com'],
            [
                'name' => 'Administrador Root',
                'password' => Hash::make('password'), // Cambiar en producción
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // Asignar rol ROOT
        $rootRole = Role::firstOrCreate(['name' => 'root']);

        if (!$rootUser->hasRole('root')) {
            $rootUser->assignRole($rootRole);
        }

        // Crear suscripción de por vida para el usuario root
        $subscription = UserSubscription::firstOrCreate(
            ['user_id' => $rootUser->id],
            [
                'subscription_plan_id' => $lifetimePlan->id,
                'status' => 'active',
                'starts_at' => now(),
                'ends_at' => null, // Sin fecha de expiración
                'amount_paid' => 0,
            ]
        );

        // Actualizar usuario con la suscripción actual
        $rootUser->update([
            'current_subscription_id' => $subscription->id,
            'subscription_ends_at' => null,
            'is_active' => true,
        ]);

        $this->command->info('Usuario ROOT creado exitosamente:');
        $this->command->info('Email: root@sistemacalculo.com');
        $this->command->info('Password: password');
        $this->command->warn('¡RECUERDA CAMBIAR LA CONTRASEÑA EN PRODUCCIÓN!');
    }
}
