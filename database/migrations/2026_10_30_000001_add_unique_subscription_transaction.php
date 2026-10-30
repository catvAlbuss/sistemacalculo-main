<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

// Última barrera: un cargo de Culqi solo puede activar una cobertura.
return new class extends Migration
{
    public function up(): void
    {
        $duplicates = DB::table('user_subscriptions')->whereNotNull('transaction_id')
            ->groupBy('transaction_id')->havingRaw('COUNT(*) > 1')->pluck('transaction_id');
        if ($duplicates->isNotEmpty()) {
            // Requires a human decision about real coverage; it must not stop the deployment.
            Log::critical('Coberturas duplicadas por cargo. Índice único no creado.', ['charges' => $duplicates->all()]);

            return;
        }
        Schema::table('user_subscriptions', fn (Blueprint $table) => $table->unique('transaction_id'));
    }

    public function down(): void
    {
        if (Schema::hasIndex('user_subscriptions', ['transaction_id'], 'unique')) {
            Schema::table('user_subscriptions', fn (Blueprint $table) => $table->dropUnique(['transaction_id']));
        }
    }
};
