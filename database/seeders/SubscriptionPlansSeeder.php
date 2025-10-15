<?php

namespace Database\Seeders;

use App\Models\Subscription;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SubscriptionPlansSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Prueba Gratuita',
                'slug' => 'prueba-gratuita',
                'description' => 'Prueba todas las funcionalidades durante 15 días sin costo.',
                'price' => 0.00,
                'duration_days' => 15,
                'type' => 'trial',
                'is_active' => true,
                'sort_order' => 1,
                'features' => [
                    'Acceso completo a todas las herramientas',
                    'Calculadoras de estudiante',
                    'Software básico',
                    '15 días de prueba',
                    'Soporte por email',
                ],
            ],
            [
                'name' => 'Plan Mensual',
                'slug' => 'plan-mensual',
                'description' => 'Acceso completo por un mes con renovación automática.',
                'price' => 49.90,
                'duration_days' => 30,
                'type' => 'monthly',
                'is_active' => true,
                'sort_order' => 2,
                'features' => [
                    'Acceso completo a todas las herramientas',
                    'Calculadoras de estudiante y asistente',
                    'Software avanzado',
                    'Actualizaciones constantes',
                    'Soporte prioritario',
                    'Exportación de resultados',
                ],
            ],
            [
                'name' => 'Plan Anual',
                'slug' => 'plan-anual',
                'description' => 'Ahorra 20% con el plan anual. El mejor valor.',
                'price' => 479.90,
                'duration_days' => 365,
                'type' => 'yearly',
                'is_active' => true,
                'sort_order' => 3,
                'features' => [
                    'Acceso completo a todas las herramientas',
                    'Calculadoras de estudiante y asistente',
                    'Software avanzado',
                    'Actualizaciones constantes',
                    'Soporte prioritario 24/7',
                    'Exportación ilimitada',
                    'Acceso a webinars exclusivos',
                    'Ahorro de 20%',
                ],
            ],
            [
                'name' => 'De Por Vida',
                'slug' => 'de-por-vida',
                'description' => 'Pago único para acceso permanente. La mejor inversión.',
                'price' => 1499.90,
                'duration_days' => null,
                'type' => 'lifetime',
                'is_active' => true,
                'sort_order' => 4,
                'features' => [
                    'Acceso de por vida a todas las herramientas',
                    'Calculadoras de estudiante y asistente',
                    'Software avanzado y premium',
                    'Todas las actualizaciones futuras incluidas',
                    'Soporte VIP de por vida',
                    'Exportación ilimitada',
                    'Acceso prioritario a nuevas funciones',
                    'Webinars y capacitaciones exclusivas',
                    'Certificado de usuario premium',
                ],
            ],
        ];

        foreach ($plans as $plan) {
            Subscription::updateOrCreate(
                ['slug' => $plan['slug']],
                $plan
            );
        }

        $this->command->info('Planes de suscripción creados exitosamente.');
    }
}
