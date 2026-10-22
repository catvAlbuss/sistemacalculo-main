<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['payment_requests', 'billing_receipts'] as $name) {
            Schema::table($name, function (Blueprint $table) {
                $table->decimal('subtotal', 10, 2)->nullable();
                $table->decimal('tax_rate', 5, 2)->nullable();
                $table->decimal('tax_amount', 10, 2)->nullable();
            });
        }
    }

    public function down(): void
    {
        foreach (['billing_receipts', 'payment_requests'] as $name) {
            Schema::table($name, fn (Blueprint $table) => $table->dropColumn(['subtotal', 'tax_rate', 'tax_amount']));
        }
    }
};
