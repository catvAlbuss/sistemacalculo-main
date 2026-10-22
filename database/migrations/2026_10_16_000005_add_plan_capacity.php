<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->unsignedInteger('max_users')->default(1);
            $table->unsignedInteger('max_projects')->default(10);
        });
        DB::table('subscriptions')->where('type', 'trial')->update(['max_projects' => 2]);
        DB::table('subscriptions')->where('type', 'lifetime')->update(['max_projects' => 30]);
    }

    public function down(): void
    {
        Schema::table('subscriptions', fn (Blueprint $table) => $table->dropColumn(['max_users', 'max_projects']));
    }
};
