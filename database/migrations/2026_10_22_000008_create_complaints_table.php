<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();
            $table->uuid('submission_key')->unique();
            $table->string('payload_hash', 64);
            $table->string('code', 24)->nullable()->unique();
            $table->string('type', 10);
            $table->string('name', 150);
            $table->string('document_type', 12);
            $table->string('document_number', 20);
            $table->string('address');
            $table->string('phone', 20);
            $table->string('email', 150);
            $table->boolean('minor')->default(false);
            $table->string('guardian_name', 150)->nullable();
            $table->string('guardian_document', 20)->nullable();
            $table->string('guardian_address')->nullable();
            $table->string('guardian_phone', 20)->nullable();
            $table->string('item_type', 10);
            $table->decimal('amount', 12, 2)->nullable();
            $table->string('item_description', 500);
            $table->text('detail');
            $table->text('request');
            $table->json('provider');
            $table->string('legal_version', 20);
            $table->date('due_on');
            $table->string('status', 12)->default('pending');
            $table->text('answer')->nullable();
            $table->foreignId('answered_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('answered_at')->nullable();
            $table->timestamps();
            $table->index(['status', 'due_on']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaints');
    }
};
