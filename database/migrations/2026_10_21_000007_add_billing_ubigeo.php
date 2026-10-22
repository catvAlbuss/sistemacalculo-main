<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        $file = fopen(database_path('data/ubigeos_inei.csv'), 'r');
        if (!$file) throw new RuntimeException('No se encuentra el catálogo de ubigeos.');
        fgetcsv($file);
        $rows = [];
        while (($row = fgetcsv($file)) !== false) {
            if (count($row) !== 4 || !preg_match('/^[0-9]{6}$/', $row[0])) throw new RuntimeException('Catálogo de ubigeos inválido.');
            $rows[] = array_combine(['codigo', 'departamento', 'provincia', 'distrito'], $row);
        }
        fclose($file);
        Schema::create('ubigeos', function (Blueprint $table) {
            $table->char('codigo', 6)->primary();
            $table->string('departamento', 120);
            $table->string('provincia', 120);
            $table->string('distrito', 120);
        });
        foreach (array_chunk($rows, 200) as $chunk) DB::table('ubigeos')->insert($chunk);
        Schema::table('payment_requests', function (Blueprint $table) {
            $table->char('billing_ubigeo', 6)->nullable();
            $table->json('billing_location')->nullable();
        });
        Schema::table('billing_receipts', fn (Blueprint $table) => $table->json('customer_location')->nullable());
    }

    public function down(): void
    {
        Schema::table('billing_receipts', fn (Blueprint $table) => $table->dropColumn('customer_location'));
        Schema::table('payment_requests', fn (Blueprint $table) => $table->dropColumn(['billing_ubigeo', 'billing_location']));
        Schema::dropIfExists('ubigeos');
    }
};
