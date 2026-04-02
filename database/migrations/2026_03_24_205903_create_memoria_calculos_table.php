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
        Schema::create('memoria_calculos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('project_name')->nullable();
            $table->string('project_code')->unique();
            
            // Datos de portada (cover)
            $table->json('cover_data')->nullable();
            
            // Secciones principales (coinciden con tu store)
            $table->json('generalidades')->nullable();
            $table->json('analisis_cargas')->nullable();
            $table->json('analisis_sismico')->nullable();
            $table->json('diseno_elementos')->nullable();
            $table->json('estructura_metalica')->nullable();
            $table->json('conclusiones')->nullable();
            $table->json('recomendaciones')->nullable();
            
            // Estado
            $table->integer('completion_percentage')->default(0);
            $table->enum('status', ['borrador', 'completado', 'exportado'])->default('borrador');
            $table->timestamp('last_saved_at')->nullable();
            $table->json('metadata')->nullable();
            
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
            $table->index('project_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('memoria_calculos');
    }
};
