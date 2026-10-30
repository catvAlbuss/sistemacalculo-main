<?php

namespace Tests\Feature;

use App\Models\ExchangeRate;
use App\Services\SbsExchangeRate;
use Illuminate\Support\Facades\Http;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

class SbsExchangeRateTest extends TestCase
{
    use RefreshPaymentsDatabase;

    protected function setUp(): void
    {
        parent::setUp(); config(['services.apiperu.token' => null]); Http::preventStrayRequests();
    }

    private function page(string $date, string $sell = '3.450'): string
    {
        return '<html><body><span>Tipo de Cambio al '.$date.'</span><table><tr><td>Dólar de N.A.</td><td>3.443</td><td>'.$sell.'</td></tr></table></body></html>';
    }

    public function test_without_a_token_the_command_uses_only_the_official_sbs_page_and_preserves_its_publication_date(): void
    {
        $date = today('America/Lima')->subDay();
        Http::fake([SbsExchangeRate::URL => Http::response($this->page($date->format('d/m/Y')))]);
        $this->artisan('tipo-cambio:actualizar')->assertSuccessful();
        $row = ExchangeRate::firstOrFail();
        $this->assertSame($date->toDateString(), $row->date->toDateString());
        $this->assertSame('3.4500', $row->sell);
        $this->assertStringContainsString('SBS', $row->source);
        Http::assertSent(fn ($request) => $request->url() === SbsExchangeRate::URL);
    }

    public function test_malformed_future_stale_or_unavailable_responses_never_replace_a_valid_rate(): void
    {
        $existing = ExchangeRate::create(['date' => today('America/Lima')->subDay(), 'sell' => 3.45, 'source' => 'Verificado']);
        ExchangeRate::query()->update(['created_at' => now()->subDay()]);
        foreach (['<html>Captcha</html>', $this->page(today('America/Lima')->addDay()->format('d/m/Y')),
            $this->page(today('America/Lima')->subDays(8)->format('d/m/Y')), $this->page(today('America/Lima')->format('d/m/Y'), '0.000')] as $html) {
            Http::fake([SbsExchangeRate::URL => Http::response($html)]);
            $this->artisan('tipo-cambio:actualizar')->assertFailed();
            $this->assertDatabaseCount('exchange_rates', 1);
            $this->assertSame('3.4500', $existing->fresh()->sell);
        }
    }

    public function test_apiperu_saves_its_published_day_with_a_single_paid_query(): void
    {
        config(['services.apiperu.token' => 'test_token']);
        $today = today('America/Lima')->toDateString();
        $yesterday = today('America/Lima')->subDay()->toDateString();
        Http::fake(['*' => Http::response(['success' => true, 'code' => 'found', 'data' => [
            'moneda' => 'USD', 'fecha_busqueda' => $today, 'fecha_sunat' => $yesterday, 'compra' => 3.45, 'venta' => 3.46,
        ]])]);

        $this->artisan('tipo-cambio:actualizar')->assertSuccessful();
        $this->artisan('tipo-cambio:actualizar')->assertSuccessful();

        $this->assertSame($yesterday, ExchangeRate::firstOrFail()->date->toDateString());
        $this->assertSame('3.4600', ExchangeRate::firstOrFail()->sell);
        Http::assertSentCount(1);
        Http::assertSent(fn ($request) => $request->url() === 'https://api.apiperu.dev/tipo-de-cambio'
            && $request['fecha'] === $today && $request['moneda'] === 'USD');
    }

    public function test_an_apiperu_outage_falls_back_to_the_official_sbs_page(): void
    {
        config(['services.apiperu.token' => 'test_token']);
        $date = today('America/Lima')->subDay();
        Http::fake(['api.apiperu.dev/*' => Http::response([], 401), SbsExchangeRate::URL => Http::response($this->page($date->format('d/m/Y')))]);

        $this->artisan('tipo-cambio:actualizar')->assertSuccessful();

        $this->assertStringContainsString('SBS', ExchangeRate::firstOrFail()->source);
    }

    public function test_a_requested_date_never_stores_another_day(): void
    {
        config(['services.apiperu.token' => 'test_token']);
        $date = today('America/Lima')->subDays(2);
        Http::fake(['api.apiperu.dev/*' => Http::response([], 500), SbsExchangeRate::URL => Http::response($this->page(today('America/Lima')->format('d/m/Y')))]);

        $this->artisan('tipo-cambio:actualizar', ['--fecha' => $date->toDateString()])->assertFailed();

        $this->assertDatabaseCount('exchange_rates', 0);
    }
}
