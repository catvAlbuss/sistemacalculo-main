<?php

namespace App\Console\Commands;

use App\Services\Culqi;
use Illuminate\Console\Command;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;

class VerifyCulqi extends Command
{
    protected $signature = 'culqi:verificar {--online : Consultar la API sin crear cargos}';

    protected $description = 'Revisa la configuración Culqi sin mostrar credenciales ni cobrar';

    public function handle(Culqi $culqi): int
    {
        $this->line('Pago en línea: '.($culqi->enabled() ? 'habilitado' : 'deshabilitado'));
        $errors = $culqi->configurationErrors();
        if (!Schema::hasColumns('payment_requests', ['payment_method', 'gateway_charge_id', 'gateway_state', 'gateway_context'])) {
            $errors[] = 'Falta la migración de pagos Culqi. Ejecuta php artisan migrate.';
        }
        foreach ($errors as $error) {
            $this->error($error);
        }
        if ($errors) {
            return self::FAILURE;
        }
        $this->info('Configuración local válida. No se muestran llaves ni token webhook.');
        if (!$this->option('online')) {
            return self::SUCCESS;
        }
        try {
            $response = Http::withToken(config('services.culqi.secret_key'))->acceptJson()->timeout(20)
                ->get(config('services.culqi.api_url').'/charges', ['limit' => 1]);
        } catch (ConnectionException) {
            $this->error('No se pudo conectar con Culqi.');

            return self::FAILURE;
        }
        if (!$response->successful()) {
            $this->error('Culqi no aceptó la consulta (HTTP '.$response->status().'). Revisa las llaves y permisos del comercio.');

            return self::FAILURE;
        }
        $this->info('Culqi aceptó la llave privada. Completa las pruebas de Checkout, 3DS y webhook antes de activar producción.');

        return self::SUCCESS;
    }
}
