<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Vincula memoria_calculos/memorias_descriptivas a un cad_models — pedido del
// cliente: al generar un reporte de un módulo de diseño (losa aligerada,
// luego vigas/columnas/muros) desde el CAD, que se pueda mandar DIRECTO a la
// Memoria de Cálculo/Descriptiva del mismo proyecto, sin subir la imagen a
// mano después. "Un proyecto" = un CadModel (el modelo que ya autoguarda
// this._serverModelId, ver resources/js/cad/mixins/io/autosave.js) -- una
// Memoria de Cálculo y una Memoria Descriptiva por CadModel (get-or-create).
//
// project_code pasa a nullable: hoy es NOT NULL + UNIQUE sin default, pero un
// registro creado automáticamente por este flujo no tiene ese dato todavía
// (nadie lo tipeó a mano) -- se deja para cuando el usuario lo complete desde
// el propio formulario de Memoria de Cálculo, como ya hace con el resto de
// campos de portada.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('memoria_calculos', function (Blueprint $table) {
            $table->foreignId('cad_model_id')->nullable()->after('user_id')->constrained('cad_models')->nullOnDelete();
        });

        // project_code hoy es NOT NULL + UNIQUE sin default -- se recrea como
        // nullable (sin ->change(), que exige doctrine/dbal como dependencia
        // directa y este proyecto no la trae) en vez de alterar in situ. La
        // tabla no tiene ningún consumidor todavía (ver conversación), así
        // que no hay filas reales que preservar.
        Schema::table('memoria_calculos', function (Blueprint $table) {
            $table->dropUnique(['project_code']);
            $table->dropColumn('project_code');
        });
        Schema::table('memoria_calculos', function (Blueprint $table) {
            $table->string('project_code')->nullable()->unique()->after('cad_model_id');
        });

        // HALLAZGO (ver conversación): memorias_descriptivas se creó como stub
        // (solo id+timestamps, migración 2026_05_14_150725) y nunca se
        // completó -- el modelo MemoriaDescriptiva declara user_id/project_name/
        // uei/etc. en $fillable pero NINGUNA de esas columnas existe todavía en
        // la tabla real. Se completan acá (nunca hubo filas reales, tabla sin
        // consumidor hasta hoy) en vez de dejar el modelo roto.
        Schema::table('memorias_descriptivas', function (Blueprint $table) {
            $table->foreignId('user_id')->after('id')->constrained()->onDelete('cascade');
            $table->foreignId('cad_model_id')->nullable()->after('user_id')->constrained('cad_models')->nullOnDelete();
            $table->string('project_name')->nullable();
            $table->string('uei')->nullable();
            $table->string('codigo_unificado')->nullable();
            $table->string('nombre_ie')->nullable();
            $table->string('codigo_local')->nullable();
            $table->string('codigo_modular')->nullable();
            $table->string('centro_poblado')->nullable();
            $table->string('region')->nullable();
            $table->string('provincia')->nullable();
            $table->string('distrito')->nullable();
            $table->json('data')->nullable();
            $table->string('file_path')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('memoria_calculos', function (Blueprint $table) {
            $table->dropConstrainedForeignId('cad_model_id');
        });

        Schema::table('memorias_descriptivas', function (Blueprint $table) {
            $table->dropConstrainedForeignId('cad_model_id');
            $table->dropConstrainedForeignId('user_id');
            $table->dropColumn([
                'project_name', 'uei', 'codigo_unificado', 'nombre_ie', 'codigo_local',
                'codigo_modular', 'centro_poblado', 'region', 'provincia', 'distrito',
                'data', 'file_path',
            ]);
        });
    }
};
