<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exchange_rates', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique();
            $table->decimal('sell', 10, 4);
            $table->string('source', 100);
            $table->timestamps();
        });
        Schema::table('payment_requests', function (Blueprint $table) {
            $table->string('currency', 3)->default('PEN');
            $table->decimal('charge_amount', 12, 2)->nullable();
            $table->decimal('exchange_rate', 10, 4)->nullable();
            $table->date('exchange_rate_date')->nullable();
        });
        Schema::table('users', fn (Blueprint $table) => $table->unsignedBigInteger('payment_in_progress_id')->nullable());
        Schema::table('user_subscriptions', fn (Blueprint $table) => $table->decimal('credit_basis', 12, 2)->nullable());
        Schema::create('project_backups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('path')->unique();
            $table->string('checksum', 64);
            $table->unsignedBigInteger('bytes');
            $table->json('counts');
            $table->boolean('safety')->default(false);
            $table->timestamps();
        });
        Schema::create('project_backup_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('backup_id');
            $table->unsignedBigInteger('safety_backup_id')->nullable();
            $table->string('kind', 20);
            $table->timestamp('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_backup_events');
        Schema::dropIfExists('project_backups');
        Schema::table('user_subscriptions', fn (Blueprint $table) => $table->dropColumn('credit_basis'));
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn('payment_in_progress_id'));
        Schema::table('payment_requests', fn (Blueprint $table) => $table->dropColumn(['currency', 'charge_amount', 'exchange_rate', 'exchange_rate_date']));
        Schema::dropIfExists('exchange_rates');
    }
};
