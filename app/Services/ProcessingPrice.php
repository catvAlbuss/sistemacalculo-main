<?php

namespace App\Services;

use App\Models\ExchangeRate;
use Illuminate\Validation\ValidationException;

class ProcessingPrice
{
    /** One final price for every supported payment method, rounded up to whole cents. */
    public function quote(int $netCents, string $currency, ?ExchangeRate $exchange = null): array
    {
        if ($netCents < 0 || !in_array($currency, ['PEN', 'USD'], true)) {
            throw new \InvalidArgumentException('Importe o moneda no válidos.');
        }
        if (!$netCents || !config('payments.processing.enabled')) {
            return ['gross_cents' => $netCents, 'included_cents' => 0, 'details' => null];
        }
        $percent = filter_var(config('payments.processing.rate_percent'), FILTER_VALIDATE_FLOAT);
        $fixedUsd = filter_var(config('payments.processing.fixed_usd'), FILTER_VALIDATE_FLOAT);
        if ($percent === false || !is_finite($percent) || $percent < 0 || $percent >= 100
            || $fixedUsd === false || !is_finite($fixedUsd) || $fixedUsd < 0 || $fixedUsd > 100) {
            throw ValidationException::withMessages(['processing' => 'El precio final requiere revisar la configuración de procesamiento.']);
        }
        $basisPoints = (int) round($percent * 100);
        if ($basisPoints >= 10000) {
            throw ValidationException::withMessages(['processing' => 'La comisión porcentual debe ser menor a 100 %.']);
        }
        $fixed = (int) round($fixedUsd * 100);
        $source = 'USD';
        if ($currency === 'PEN' && $fixed > 0) {
            $configuredPen = config('payments.processing.fixed_pen');
            if ($configuredPen !== null && $configuredPen !== '') {
                $pen = filter_var($configuredPen, FILTER_VALIDATE_FLOAT);
                if ($pen === false || !is_finite($pen) || $pen < 0 || $pen > 600) {
                    throw ValidationException::withMessages(['processing' => 'Revisa el cargo fijo de procesamiento en soles.']);
                }
                $fixed = (int) ceil(round($pen * 100, 6));
                $source = 'CulqiPanel / configuración PEN';
            } else {
                $exchange ??= ExchangeRate::current();
                if (!$exchange) {
                    throw ValidationException::withMessages(['processing' => 'El precio final está pendiente de confirmar el tipo de cambio del cargo fijo. Contáctanos antes de pagar.']);
                }
                if ((float) $exchange->sell < 2 || (float) $exchange->sell > 6) {
                    throw ValidationException::withMessages(['processing' => 'Revisa el tipo de cambio del cargo fijo.']);
                }
                $fixed = (int) ceil(round($fixed * (float) $exchange->sell, 6));
                $source = $exchange->source;
            }
        }
        $denominator = 10000 - $basisPoints;
        $gross = intdiv(($netCents + $fixed) * 10000 + $denominator - 1, $denominator);
        $variable = (int) round($gross * $basisPoints / 10000);

        return ['gross_cents' => $gross, 'included_cents' => $gross - $netCents, 'details' => [
            'rate_percent' => $basisPoints / 100, 'fixed_usd' => $fixedUsd,
            'currency' => $currency, 'fixed_amount' => $fixed / 100,
            'variable_amount' => $variable / 100, 'target_net' => $netCents / 100,
            'estimated_net' => ($gross - $variable - $fixed) / 100,
            'exchange_rate' => $currency === 'PEN' && $source !== 'CulqiPanel / configuración PEN' ? ($exchange ? (float) $exchange->sell : null) : null,
            'exchange_rate_date' => $exchange?->date->toDateString(), 'source' => $source,
            'policy' => 'single_final_price_v1',
        ]];
    }
}
