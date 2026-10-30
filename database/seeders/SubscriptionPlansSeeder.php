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
                'description' => 'Prueba todas las funcionalidades durante 5 días sin costo.',
                'price' => 0.00,
                'duration_days' => 5,
                'type' => 'trial',
                'is_active' => true,
                'sort_order' => 1,
                'max_users' => 1, 'max_projects' => 2,
                'features' => [
                    'Acceso completo a todas las herramientas',
                    'Calculadoras de estudiante',
                    'Software básico',
                    '5 días de prueba',
                    'Soporte por email',
                ],
            ],
            [
                'name' => 'Plan Mensual',
                'slug' => 'plan-mensual',
                'description' => 'Acceso completo por un mes.',
                'price' => 50.00,
                'duration_days' => 30,
                'type' => 'monthly',
                'is_active' => true,
                'sort_order' => 2,
                'max_users' => 1, 'max_projects' => 10,
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
                'name' => 'Plan Trimestral',
                'slug' => 'plan-trimestral',
                'description' => 'El Plan Mensual por tres meses: acceso completo durante 90 días.',
                'price' => 150.00,
                'duration_days' => 90,
                'type' => 'quarterly',
                'is_active' => true,
                'sort_order' => 3,
                'max_users' => 1, 'max_projects' => 10,
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
                'name' => 'Plan Semestral',
                'slug' => 'plan-semestral',
                'description' => 'El Plan Mensual por seis meses: acceso completo durante 180 días.',
                'price' => 300.00,
                'duration_days' => 180,
                'type' => 'semiannual',
                'is_active' => true,
                'sort_order' => 4,
                'max_users' => 1, 'max_projects' => 10,
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
                'description' => 'Paga un año completo con 5% de descuento sobre 12 mensualidades.',
                'price' => 570.00,
                'duration_days' => 365,
                'type' => 'yearly',
                'is_active' => true,
                'sort_order' => 5,
                'max_users' => 1, 'max_projects' => 10,
                'features' => [
                    'Acceso completo a todas las herramientas',
                    'Calculadoras de estudiante y asistente',
                    'Software avanzado',
                    'Actualizaciones constantes',
                    'Soporte prioritario 24/7',
                    'Exportación ilimitada',
                    'Acceso a webinars exclusivos',
                    'Acceso exclusivo a nuevas herramientas y agentes de IA',
                    'Ahorro de 5% sobre 12 mensualidades',
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
                'sort_order' => 6,
                'max_users' => 1, 'max_projects' => 30,
                'features' => [
                    'Acceso de por vida a todas las herramientas',
                    'Calculadoras de estudiante y asistente',
                    'Software avanzado y premium',
                    'Todas las actualizaciones futuras incluidas',
                    'Soporte VIP de por vida',
                    'Exportación ilimitada',
                    'Acceso exclusivo a nuevas herramientas y agentes de IA',
                    'Webinars y capacitaciones exclusivas',
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
