<?php

namespace App\Console\Commands;

use App\Models\ExchangeRate;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class UpdateExchangeRate extends Command
{
    protected $signature = 'tipo-cambio:actualizar {--fecha=} {--venta=} {--fuente=}';

    protected $description = 'Guarda el tipo de cambio de venta; consulta ApiPeru y, si falla, la publicación oficial SBS';

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
            // fecha_sunat is usually yesterday, so "today's" row may never exist: created_at avoids a second paid query.
            if (ExchangeRate::where('date', $date)->exists()
                || (! $this->option('fecha') && ExchangeRate::where('created_at', '>=', now()->subHours(12))->exists())) {
                $this->info('La fecha ya tiene un tipo de cambio. No se realizó otra consulta.');

                return self::SUCCESS;
            }
            $rate = $this->lookup($date, (bool) $this->option('fecha'));
            if (! $rate) {
                $this->error('No se obtuvo un tipo de cambio verificable. Se mantienen los valores anteriores; no se inventó ninguno.');

                return self::FAILURE;
            }
            ExchangeRate::updateOrCreate(['date' => $rate['date']], ['sell' => $rate['sell'], 'source' => $rate['source']]);
            $this->info('Tipo de cambio de '.$rate['source'].' guardado con fecha '.$rate['date'].'. Las compras existentes conservan su cotización.');

            return self::SUCCESS;
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

    /** Each ApiPeru query spends a credit, so it runs once and SBS covers an outage. */
    private function lookup(string $date, bool $exact): ?array
    {
        $rate = config('services.apiperu.token') ? $this->fromApiPeru($date) : null;
        if ($rate && (! $exact || $rate['date'] === $date)) {
            return $rate;
        }
        try {
            $latest = app(\App\Services\SbsExchangeRate::class)->latest();

            return ! $exact || $latest['date'] === $date ? $latest : null;
        } catch (\Throwable) {
            return null;
        }
    }

    private function fromApiPeru(string $date): ?array
    {
        try {
            $response = Http::withToken(config('services.apiperu.token'))->acceptJson()->timeout(10)
                ->post('https://api.apiperu.dev/tipo-de-cambio', ['fecha' => $date, 'moneda' => 'USD']);
        } catch (\Throwable) {
            $this->warn('ApiPeru no respondió.');

            return null;
        }
        // The provider answers with the last published business day, stated in fecha_sunat.
        $data = $response->json('data');
        $published = is_array($data) ? ($data['fecha_sunat'] ?? null) : null;
        $sell = is_array($data) ? ($data['venta'] ?? null) : null;
        if (! $response->successful() || $response->json('success') !== true || ! is_numeric($sell) || $sell < 2 || $sell > 6
            || ! is_string($published) || ! preg_match('/^\d{4}-\d{2}-\d{2}$/', $published) || $published > $date) {
            $this->warn('ApiPeru rechazó la consulta (HTTP '.$response->status().').');

            return null;
        }

        return ['date' => $published, 'sell' => $sell, 'source' => 'ApiPeru / SBS'];
    }
}
