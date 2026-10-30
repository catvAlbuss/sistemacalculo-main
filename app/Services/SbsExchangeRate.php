<?php

namespace App\Services;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;

class SbsExchangeRate
{
    public const URL = 'https://www.sbs.gob.pe/app/pp/SISTIP_PORTAL/Paginas/Publicacion/TipoCambioPromedio.aspx';

    public function latest(): array
    {
        $response = Http::accept('text/html')->timeout(25)->get(self::URL);
        if (!$response->successful()) { throw new \RuntimeException('SBS no disponible.'); }
        $html = $response->body();
        if (!mb_check_encoding($html, 'UTF-8')) { $html = mb_convert_encoding($html, 'UTF-8', 'Windows-1252'); }
        $html = preg_replace('/<\/(?:td|th|tr|div|p|span|h[1-6])\s*>/i', ' $0 ', $html);
        $document = new \DOMDocument();
        @$document->loadHTML('<?xml encoding="UTF-8">'.$html);
        $text = preg_replace('/[\s\x{00a0}]+/u', ' ', $document->textContent);
        if (!preg_match('/Tipo de Cambio al\s*(\d{2}\/\d{2}\/\d{4})/u', $text, $date)
            || !preg_match('/D[oó]lar\s+de\s+N\.?\s*A\.?\s+([0-9]+\.[0-9]+)\s+([0-9]+\.[0-9]+)/u', $text, $values)) {
            throw new \RuntimeException('SBS no devolvió una cotización verificable.');
        }
        $day = Carbon::createFromFormat('!d/m/Y', $date[1], 'America/Lima');
        $sell = (float) $values[2];
        if ($day->format('d/m/Y') !== $date[1] || $day->isAfter(today('America/Lima'))
            || $day->isBefore(today('America/Lima')->subDays(7)) || $sell < 2 || $sell > 6) {
            throw new \RuntimeException('Cotización SBS no vigente.');
        }
        return ['date' => $day->toDateString(), 'sell' => $sell, 'source' => 'SBS / Tipo de cambio promedio ponderado - venta'];
    }
}
