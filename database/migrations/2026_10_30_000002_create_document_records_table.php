<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Resultados de ApiPeru ya pagados. Sin número en claro: clave HMAC y datos cifrados.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_records', function (Blueprint $table) {
            $table->id();
            $table->char('lookup_key', 64)->unique();
            $table->text('data');
            $table->timestamp('looked_up_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_records');
    }
};
