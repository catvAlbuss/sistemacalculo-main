<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// Plan Mensual a S/ 50 (más la comisión de Culqi al cobrar). Trimestral y Semestral se calculan desde él
// (config/payments.php) y el Anual son 12 mensualidades con 5 % de descuento: S/ 570.
// Solo cambia los importes que conservan el valor anterior, para no pisar ediciones de administración.
return new class extends Migration
{
    private const PRICES = [
        'plan-mensual' => [49.90, 50.00],
        'plan-anual' => [568.86, 570.00],
        'plan-trimestral' => [146.71, 150.00],
        'plan-semestral' => [290.42, 300.00],
    ];

    // Descripciones que la primera versión de la migración de planes por período dejó con descuentos.
    private const DESCRIPTIONS = [
        'plan-trimestral' => ['Acceso completo por tres meses con 2 % de descuento sobre tres mensualidades.', 'El Plan Mensual por tres meses: acceso completo durante 90 días.'],
        'plan-semestral' => ['Acceso completo por seis meses con 3 % de descuento sobre seis mensualidades.', 'El Plan Mensual por seis meses: acceso completo durante 180 días.'],
    ];

    public function up(): void
    {
        foreach (self::PRICES as $slug => [$old, $new]) {
            DB::table('subscriptions')->where('slug', $slug)->where('price', $old)->update(['price' => $new, 'updated_at' => now()]);
        }
        foreach (self::DESCRIPTIONS as $slug => [$old, $new]) {
            DB::table('subscriptions')->where('slug', $slug)->where('description', $old)->update(['description' => $new]);
        }
    }

    public function down(): void
    {
        foreach (self::PRICES as $slug => [$old, $new]) {
            DB::table('subscriptions')->where('slug', $slug)->where('price', $new)->update(['price' => $old, 'updated_at' => now()]);
        }
    }
};
