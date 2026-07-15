<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Modelos CAD (ETABS web) guardados por usuario. Autoguardado a servidor:
 * respaldo + acceso multi-dispositivo, complementario al IndexedDB offline.
 *
 * `data` = exportToJSON() del modelo, comprimido con gzip y en base64
 * (el modelo pesa 2-5 MB; gzip lo baja a ~0.5 MB → evita max_allowed_packet).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cad_models', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name')->default('modelo');
            $table->longText('data')->nullable();   // gzip+base64 del exportToJSON
            $table->boolean('is_compressed')->default(true);
            $table->unsignedInteger('node_count')->default(0);
            $table->unsignedInteger('version')->default(1); // concurrencia optimista
            $table->timestamp('last_saved_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'updated_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cad_models');
    }
};
