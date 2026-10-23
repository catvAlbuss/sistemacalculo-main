<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;

class VerifyLegalReadiness extends Command
{
    protected $signature = 'legal:verificar';

    protected $description = 'Revisa datos del comercio y Libro de Reclamaciones sin enviar correos ni modificar registros';

    public function handle(): int
    {
        $provider = config('legal.provider');
        $errors = [];
        foreach (['name' => 'Razón social', 'ruc' => 'RUC', 'address' => 'Dirección', 'email' => 'Correo de atención', 'phone' => 'Teléfono'] as $field => $label) {
            if (!filled($provider[$field] ?? null)) {
                $errors[] = $label.': pendiente de configurar.';
            }
        }
        if (filled($provider['ruc']) && !preg_match('/^\d{11}$/', $provider['ruc'])) {
            $errors[] = 'El RUC del proveedor debe tener 11 dígitos.';
        }
        if (filled($provider['email']) && (!filter_var($provider['email'], FILTER_VALIDATE_EMAIL)
            || str_ends_with(strtolower($provider['email']), '@example.com'))) {
            $errors[] = 'Configura un correo real de atención.';
        }
        if (!Schema::hasTable('complaints')) {
            $errors[] = 'Falta aplicar la migración del Libro de Reclamaciones.';
        }
        foreach (['project_backups', 'project_backup_events', 'exchange_rates', 'cad_models', 'memoria_calculos', 'memorias_descriptivas', 'memoria_imagenes'] as $table) {
            if (!Schema::hasTable($table)) { $errors[] = 'Falta la tabla '.$table.'. Revisa las migraciones antes de publicar.'; }
        }
        if (!Schema::hasColumn('users', 'project_restore_version')) {
            $errors[] = 'Falta la migración de versiones para restaurar proyectos.';
        }
        if (Schema::hasTable('exchange_rates') && !\App\Models\ExchangeRate::current()) {
            $this->warn('USD permanecerá deshabilitado hasta guardar un tipo de cambio vigente.');
        }
        if (Schema::hasTable('exchange_rates')) {
            try { app(\App\Services\ProcessingPrice::class)->quote(5000, 'PEN'); }
            catch (\Illuminate\Validation\ValidationException $exception) { $errors[] = $exception->errors()['processing'][0]; }
        }
        if (app()->isProduction() && (parse_url(config('app.url'), PHP_URL_SCHEME) !== 'https'
            || !config('session.secure') || config('app.debug'))) {
            $errors[] = 'En producción usa APP_URL con HTTPS, cookie segura y APP_DEBUG=false.';
        }
        foreach ($errors as $error) {
            $this->error($error);
        }
        $this->line('Verifica en el servidor el certificado y la redirección HTTP→HTTPS en todas las rutas.');
        $this->line('El worker payments debe procesar copias y respuestas; conserva un libro físico de respaldo.');
        if ($errors) {
            return self::FAILURE;
        }
        $this->info('Configuración legal y tabla disponibles. No se enviaron correos ni se realizaron cobros.');

        return self::SUCCESS;
    }
}
