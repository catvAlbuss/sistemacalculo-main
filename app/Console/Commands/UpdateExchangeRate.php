<?php

namespace App\Console\Commands;

use App\Models\ExchangeRate;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class UpdateExchangeRate extends Command
{
    private const RECENT_DAYS = 3;

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
            if (ExchangeRate::where('date', $date)->exists()) {
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

    /** Today may be unpublished: recent days are still valid, and SBS covers an ApiPeru outage. */
    private function lookup(string $date, bool $exact): ?array
    {
        if (config('services.apiperu.token')) {
            foreach (range(0, $exact ? 0 : self::RECENT_DAYS) as $back) {
                $day = Carbon::parse($date)->subDays($back)->toDateString();
                if ($back && ExchangeRate::where('date', $day)->exists()) {
                    break;
                }
                if ($rate = $this->fromApiPeru($day)) {
                    return $rate;
                }
            }
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
                ->post('https://api.apiperu.dev/tipo_de_cambio', ['fecha' => $date]);
        } catch (\Throwable) {
            return null;
        }
        $data = $response->json('data');
        $sell = is_array($data) ? ($data['venta'] ?? null) : null;

        return $response->successful() && $response->json('success') === true && ($data['fecha'] ?? null) === $date
            && is_numeric($sell) && $sell >= 2 && $sell <= 6
            ? ['date' => $date, 'sell' => $sell, 'source' => 'ApiPeru / SUNAT'] : null;
    }
}
