<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('showcase_videos', function (Blueprint $table) {
            $table->string('source_type')->default('file');
            $table->string('youtube_id', 11)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('showcase_videos', fn (Blueprint $table) => $table->dropColumn(['source_type', 'youtube_id']));
    }
};
