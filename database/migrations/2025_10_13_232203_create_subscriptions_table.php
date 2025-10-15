<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations. php artisan make:migration create_table_name
     */
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Prueba, Mensual, Anual, De por vida
            $table->string('slug')->unique(); // trial, monthly, yearly, lifetime
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->integer('duration_days')->nullable(); // null para lifetime
            $table->enum('type', ['trial', 'monthly', 'yearly', 'lifetime'])->default('trial');
            $table->boolean('is_active')->default(true);
            $table->json('features')->nullable(); // Características del plan
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index('slug');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
