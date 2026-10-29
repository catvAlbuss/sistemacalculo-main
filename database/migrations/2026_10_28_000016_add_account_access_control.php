<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('account_status', 20)->default('enabled')->index();
            $table->text('account_status_reason')->nullable();
            $table->unsignedBigInteger('session_version')->default(0);
        });
        Schema::create('account_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('version');
            $table->timestamp('last_seen_at')->index();
            $table->timestamps();
        });
        Schema::create('account_security_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('type', 40);
            $table->text('message');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('account_security_events');
        Schema::dropIfExists('account_sessions');
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn(['account_status', 'account_status_reason', 'session_version']));
    }
};
