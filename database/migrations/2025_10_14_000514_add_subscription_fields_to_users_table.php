<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('current_subscription_id')->nullable()->after('remember_token')->constrained('user_subscriptions')->nullOnDelete();
            $table->boolean('is_active')->default(true)->after('current_subscription_id');
            $table->timestamp('subscription_ends_at')->nullable()->after('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['current_subscription_id']);
            $table->dropColumn(['current_subscription_id', 'is_active', 'subscription_ends_at']);
        });
    }
};
