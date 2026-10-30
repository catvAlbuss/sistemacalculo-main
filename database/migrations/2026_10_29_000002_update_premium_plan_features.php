<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// Beneficios de Anual y De por vida: exclusividad en nuevas herramientas y agentes de IA; no se entrega certificado.
// Solo agrega o quita esas líneas; conserva el resto de beneficios editados desde administración.
return new class extends Migration
{
    private const EXCLUSIVE = 'Acceso exclusivo a nuevas herramientas y agentes de IA';

    private const REMOVED = ['Certificado de usuario premium', 'Acceso prioritario a nuevas funciones'];

    public function up(): void
    {
        DB::table('subscriptions')->whereIn('slug', ['plan-anual', 'de-por-vida'])->get(['id', 'features'])->each(function ($plan) {
            $features = array_values(array_diff(json_decode($plan->features ?? '[]', true) ?: [], self::REMOVED));
            if (!in_array(self::EXCLUSIVE, $features, true)) {
                $features[] = self::EXCLUSIVE;
            }
            DB::table('subscriptions')->where('id', $plan->id)->update(['features' => json_encode($features, JSON_UNESCAPED_UNICODE)]);
        });
    }

    public function down(): void
    {
        DB::table('subscriptions')->whereIn('slug', ['plan-anual', 'de-por-vida'])->get(['id', 'features'])->each(function ($plan) {
            $features = array_values(array_diff(json_decode($plan->features ?? '[]', true) ?: [], [self::EXCLUSIVE]));
            DB::table('subscriptions')->where('id', $plan->id)->update(['features' => json_encode($features, JSON_UNESCAPED_UNICODE)]);
        });
    }
};
