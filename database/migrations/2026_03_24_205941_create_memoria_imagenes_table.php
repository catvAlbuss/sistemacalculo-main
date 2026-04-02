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
        Schema::create('memoria_imagenes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('memoria_calculo_id')->constrained()->onDelete('cascade');
            
            // Identificadores de la imagen (coinciden con tu estructura)
            $table->string('group_key'); // 'coverImage', 'floorImages', 'materialImages', etc.
            $table->string('sub_key')->nullable(); // Para arrays como 'floorImages_0'
            $table->integer('index')->default(0);
            $table->integer('sub_index')->nullable(); // Para arrays anidados como losaImages[seccion][imagen]
            
            // Datos de la imagen
            $table->longText('image_base64');
            $table->string('image_type')->default('jpeg');
            $table->integer('size_kb')->nullable();
            
            // Metadatos
            $table->json('metadata')->nullable();
            
            $table->timestamps();
            
            // Índices para búsqueda rápida
            $table->index(['memoria_calculo_id', 'group_key']);
            $table->index(['memoria_calculo_id', 'group_key', 'sub_key']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('memoria_imagenes');
    }
};
