<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payment_requests', function (Blueprint $table) {
            $table->string('payment_method')->default('yape');
            $table->string('gateway_charge_id')->nullable()->unique();
            $table->string('gateway_state')->nullable();
            $table->json('gateway_context')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('payment_requests', function (Blueprint $table) {
            $table->dropUnique(['gateway_charge_id']);
            $table->dropColumn(['payment_method', 'gateway_charge_id', 'gateway_state', 'gateway_context']);
        });
    }
};
