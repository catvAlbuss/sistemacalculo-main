<?php

namespace App\Console\Commands;

use App\Models\ExchangeRate;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class UpdateExchangeRate extends Command
{
    protected $signature = 'tipo-cambio:actualizar {--fecha=} {--venta=} {--fuente=}';

    protected $description = 'Guarda el tipo de cambio de venta; consulta ApiPeru o la publicación oficial SBS cuando no hay token';

    public function handle(): int
    {
        $date = $this->option('fecha') ?: today('America/Lima')->toDateString();
        if (Validator::make(['date' => $date], ['date' => 'required|date_format:Y-m-d'])->fails()
            || $date > today('America/Lima')->toDateString()) {
            $this->error('Indica una fecha válida, no futura.');

            return self::FAILURE;
        }
        $sell = $this->option('venta');
        $source = $this->option('fuente');
        if ($sell === null) {
            if (ExchangeRate::where('date', $date)->exists()) {
                $this->info('La fecha ya tiene un tipo de cambio. No se realizó otra consulta.');

                return self::SUCCESS;
            }
            if (! config('services.apiperu.token')) {
                try {
                    $latest = app(\App\Services\SbsExchangeRate::class)->latest();
                    if ($this->option('fecha') && $latest['date'] !== $date) { throw new \RuntimeException; }
                    ExchangeRate::updateOrCreate(['date' => $latest['date']], ['sell' => $latest['sell'], 'source' => $latest['source']]);
                    $this->info('Tipo de cambio oficial SBS guardado con fecha '.$latest['date'].'. Las compras existentes conservan su cotización.');
                    return self::SUCCESS;
                } catch (\Throwable) {
                    $this->error('No se pudo verificar la cotización SBS. Se mantienen los valores anteriores; no se inventó un tipo de cambio.');
                    return self::FAILURE;
                }
            }
            try {
                $response = Http::withToken(config('services.apiperu.token'))->acceptJson()->timeout(10)
                    ->post('https://api.apiperu.dev/tipo_de_cambio', ['fecha' => $date]);
                $data = $response->json('data');
                if (! $response->successful() || $response->json('success') !== true || ! is_array($data)
                    || ($data['fecha'] ?? null) !== $date) {
                    throw new \RuntimeException;
                }
                $sell = $data['venta'] ?? null;
                $source = 'ApiPeru / SUNAT';
            } catch (\Throwable) {
                $this->error('No se obtuvo un tipo de cambio verificable. No se guardaron valores.');

                return self::FAILURE;
            }
        }
        if (Validator::make(['sell' => $sell, 'source' => $source], [
            'sell' => 'required|numeric|between:2,6', 'source' => 'required|string|max:100',
        ])->fails()) {
            $this->error('Indica venta entre 2 y 6 PEN/USD y una fuente.');

            return self::FAILURE;
        }
        ExchangeRate::updateOrCreate(['date' => $date], ['sell' => $sell, 'source' => $source]);
        $this->info('Tipo de cambio guardado. Las compras existentes conservan su cotización.');

        return self::SUCCESS;
    }
}
