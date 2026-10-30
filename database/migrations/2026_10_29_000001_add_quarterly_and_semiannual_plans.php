<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Catálogo por duración: agrega Trimestral y Semestral sin modificar los planes existentes.
// Precio: el Plan Mensual por 3 y 6 meses, sin descuento (config/payments.php, period_bases).
return new class extends Migration
{
    private function plans(): array
    {
        $features = [
            'Acceso completo a todas las herramientas',
            'Calculadoras de estudiante y asistente',
            'Software avanzado',
            'Actualizaciones constantes',
            'Soporte prioritario',
            'Exportación de resultados',
        ];

        return [
            'plan-trimestral' => ['name' => 'Plan Trimestral', 'description' => 'El Plan Mensual por tres meses: acceso completo durante 90 días.',
                'price' => 150.00, 'duration_days' => 90, 'type' => 'quarterly', 'sort_order' => 3, 'features' => $features],
            'plan-semestral' => ['name' => 'Plan Semestral', 'description' => 'El Plan Mensual por seis meses: acceso completo durante 180 días.',
                'price' => 300.00, 'duration_days' => 180, 'type' => 'semiannual', 'sort_order' => 4, 'features' => $features],
        ];
    }

    public function up(): void
    {
        // El tipo era un ENUM de cuatro valores; los planes por duración agregan quarterly y semiannual.
        Schema::table('subscriptions', fn (Blueprint $table) => $table->string('type', 20)->default('trial')->change());
        foreach ($this->plans() as $slug => $plan) {
            if (DB::table('subscriptions')->where('slug', $slug)->exists()) {
                continue;
            }
            DB::table('subscriptions')->insert(array_merge($plan, [
                'slug' => $slug, 'is_active' => true, 'max_users' => 1, 'max_projects' => 10,
                'features' => json_encode($plan['features'], JSON_UNESCAPED_UNICODE),
                'created_at' => now(), 'updated_at' => now(),
            ]));
        }
        // Mantiene el orden por duración: Prueba, Mensual, Trimestral, Semestral, Anual, De por vida.
        DB::table('subscriptions')->where('slug', 'plan-anual')->where('sort_order', '<', 5)->update(['sort_order' => 5]);
        DB::table('subscriptions')->where('slug', 'de-por-vida')->where('sort_order', '<', 6)->update(['sort_order' => 6]);
    }

    public function down(): void
    {
        DB::table('subscriptions')->whereIn('slug', array_keys($this->plans()))
            ->whereNotExists(fn ($q) => $q->select(DB::raw(1))->from('user_subscriptions')->whereColumn('user_subscriptions.subscription_plan_id', 'subscriptions.id'))
            ->delete();
    }
};
