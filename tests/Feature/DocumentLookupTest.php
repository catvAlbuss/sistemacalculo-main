<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class DocumentLookupTest extends TestCase
{
    use \Tests\Concerns\RefreshPaymentsDatabase;

    public function test_ruc_location_is_returned_only_when_its_code_exists_in_the_catalog(): void
    {
        Http::fake(['*' => Http::sequence()->push(['success' => true, 'data' => [
            'ruc' => '20131312955', 'nombre_o_razon_social' => 'Empresa', 'ubigeo_sunat' => '150101',
        ]])->push(['success' => true, 'data' => [
            'ruc' => '20123456789', 'nombre_o_razon_social' => 'Otra empresa', 'ubigeo_sunat' => '000000',
        ]])]);
        $this->postJson(route('planes.document.lookup'), ['document_type' => 'RUC', 'document_number' => '20131312955'])
            ->assertOk()->assertJsonPath('data.ubigeo', '150101');
        $this->postJson(route('planes.document.lookup'), ['document_type' => 'RUC', 'document_number' => '20123456789'])
            ->assertOk()->assertJsonMissingPath('data.ubigeo');
    }

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.apiperu.token' => 'test-private-token', 'cache.default' => 'array']);
        Http::preventStrayRequests();
    }

    public function test_dni_lookup_returns_only_name_and_preserves_leading_zeroes(): void
    {
        Http::fake(['*' => Http::response(['success' => true, 'data' => [
            'numero' => '00123456', 'nombres' => 'Ana', 'apellido_paterno' => 'Perez', 'apellido_materno' => 'Lopez',
            'direccion' => 'Dato que no se devuelve', 'email' => 'privado@example.com', 'password' => 'privado',
        ]])]);
        $this->postJson(route('planes.document.lookup'), ['document_type' => 'DNI', 'document_number' => '00123456'])
            ->assertOk()->assertExactJson(['success' => true, 'data' => ['name' => 'Ana Perez Lopez', 'address' => '']]);
        Http::assertSent(fn ($request) => $request->method() === 'POST' && $request->url() === 'https://api.apiperu.dev/dni'
            && $request['dni'] === '00123456' && $request->hasHeader('Authorization', 'Bearer test-private-token'));
    }

    public function test_ruc_lookup_fills_name_and_address_and_reuses_a_successful_lookup(): void
    {
        Http::fake(['*' => Http::response(['success' => true, 'data' => [
            'ruc' => '20131312955', 'nombre_o_razon_social' => 'Empresa Ejemplo', 'direccion' => 'Av. Ejemplo 123',
        ]])]);
        $data = ['document_type' => 'RUC', 'document_number' => '20131312955'];
        $this->postJson(route('planes.document.lookup'), $data)->assertOk()
            ->assertExactJson(['success' => true, 'data' => ['name' => 'Empresa Ejemplo', 'address' => 'Av. Ejemplo 123']]);
        $this->postJson(route('planes.document.lookup'), $data)->assertOk()->assertJsonPath('data.name', 'Empresa Ejemplo');
        Http::assertSentCount(1);
    }

    public function test_unconfigured_service_and_invalid_inputs_do_not_call_the_provider(): void
    {
        $this->postJson(route('planes.document.lookup'), ['document_type' => 'DNI', 'document_number' => '123'])
            ->assertUnprocessable()->assertJsonValidationErrors('document_number');
        $this->postJson(route('planes.document.lookup'), ['document_type' => 'OTRO', 'document_number' => '00123456'])
            ->assertUnprocessable()->assertJsonValidationErrors('document_type');
        config(['services.apiperu.token' => '']);
        $this->postJson(route('planes.document.lookup'), ['document_type' => 'DNI', 'document_number' => '00123456'])
            ->assertOk()->assertJson(['success' => false])->assertJsonMissing(['test-private-token']);
        Http::assertNothingSent();
    }

    public function test_failed_or_mismatched_provider_answers_never_fill_a_name(): void
    {
        Http::fake(['*' => Http::sequence()->push(['success' => true, 'data' => ['numero' => '99999999', 'nombre_completo' => 'Otra Persona']])
            ->push(['success' => false, 'message' => 'Proveedor y credenciales privadas'], 503)]);
        $data = ['document_type' => 'DNI', 'document_number' => '00123456'];
        $this->postJson(route('planes.document.lookup'), $data)->assertOk()->assertJson(['success' => false])->assertJsonMissingPath('data');
        $this->postJson(route('planes.document.lookup'), $data)->assertOk()->assertJson(['success' => false])->assertDontSee('credenciales privadas');
    }

    public function test_timeouts_offer_manual_entry_and_do_not_retry_the_paid_api(): void
    {
        $attempts = 0;
        Http::fake(function () use (&$attempts) {
            $attempts++;
            throw new \Illuminate\Http\Client\ConnectionException('timeout');
        });
        $this->postJson(route('planes.document.lookup'), ['document_type' => 'DNI', 'document_number' => '00123456'])
            ->assertOk()->assertJson(['success' => false])->assertSee('manualmente');
        $this->assertSame(1, $attempts);
    }

    public function test_public_lookups_are_rate_limited(): void
    {
        config(['services.apiperu.token' => '']);
        $data = ['document_type' => 'DNI', 'document_number' => '00123456'];
        for ($i = 0; $i < 10; $i++) {
            $this->postJson(route('planes.document.lookup'), $data)->assertOk();
        }
        $this->postJson(route('planes.document.lookup'), $data)->assertStatus(429);
        Http::assertNothingSent();
    }
}
