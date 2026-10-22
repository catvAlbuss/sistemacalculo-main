<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payment_requests', function (Blueprint $table) {
            $table->string('checkout_key', 64)->nullable()->unique();
            $table->string('checkout_payload_hash', 64)->nullable();
            $table->json('plan_snapshot')->nullable();
        });
        Schema::create('payment_tasks', function (Blueprint $table) {
            $table->id();
            $table->string('task_key', 64)->unique();
            $table->foreignId('payment_request_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('kind', 30);
            $table->text('payload')->nullable();
            $table->string('status', 20)->default('pending');
            $table->unsignedSmallInteger('attempts')->default(0);
            $table->timestamp('available_at')->nullable();
            $table->timestamp('locked_at')->nullable();
            $table->timestamp('dispatched_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->string('result', 40)->nullable();
            $table->timestamps();
            $table->index(['status', 'available_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_tasks');
        Schema::table('payment_requests', function (Blueprint $table) {
            $table->dropUnique(['checkout_key']);
            $table->dropColumn(['checkout_key', 'checkout_payload_hash', 'plan_snapshot']);
        });
    }
};
