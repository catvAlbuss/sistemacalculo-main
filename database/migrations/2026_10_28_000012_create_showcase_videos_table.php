<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('showcase_videos', function (Blueprint $table) {
            $table->id();
            $table->string('slot')->index();
            $table->string('title', 160);
            $table->text('transcript')->nullable();
            $table->string('status')->default('queued');
            $table->boolean('is_published')->default(false);
            $table->boolean('publish_when_ready')->default(true);
            $table->json('metadata')->nullable();
            $table->text('error')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('showcase_videos'); }
};
