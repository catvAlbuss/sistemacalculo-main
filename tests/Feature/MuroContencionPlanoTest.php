<?php

namespace Tests\Feature;

use App\Http\Controllers\MuroContencionPlanoController;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request as ClientRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MuroContencionPlanoTest extends TestCase
{
    private const BODY = '{"geo":{"stem":6.65},"steel":{"punta":{}},"materials":{"fc":210}}';

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.cad_api' => ['url' => 'https://cad.test/', 'token' => 'token-secreto', 'timeout' => 5]]);
    }

    private function send(string $body = self::BODY)
    {
        return app(MuroContencionPlanoController::class)(Request::create('/muros-contencion/plano', 'POST', [], [], [], [], $body));
    }

    public function test_returns_the_dxf_and_forwards_the_body_untouched_with_the_token(): void
    {
        Http::fake(['*' => Http::response('DXF', 200, ['Content-Type' => 'application/dxf'])]);

        $response = $this->send();

        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('DXF', $response->getContent());
        $this->assertSame('application/dxf', $response->headers->get('Content-Type'));
        Http::assertSent(fn (ClientRequest $request) => $request->url() === 'https://cad.test/api/v1/planos/muro-contencion'
            && $request->body() === self::BODY
            && $request->hasHeader('Authorization', 'Bearer token-secreto'));
    }

    public function test_keeps_the_validation_message_of_the_api(): void
    {
        $error = ['error' => ['code' => 'VALIDATION_ERROR', 'message' => 'geo.stem debe ser mayor que 0', 'fields' => ['geo.stem']]];
        Http::fake(['*' => Http::response($error, 400)]);

        $response = $this->send();

        $this->assertSame(400, $response->getStatusCode());
        $this->assertSame($error, json_decode($response->getContent(), true));
    }

    public function test_api_failures_become_503_without_exposing_the_token(): void
    {
        foreach ([401, 429, 500] as $status) {
            Http::fake(['*' => Http::response('detalle interno', $status)]);
            $response = $this->send();
            $this->assertSame(503, $response->getStatusCode());
            $this->assertStringNotContainsString('detalle interno', $response->getContent());
            $this->assertStringNotContainsString('token-secreto', $response->getContent());
        }
    }

    public function test_unreachable_api_becomes_503(): void
    {
        Http::fake(fn () => throw new ConnectionException('sin conexión'));

        $this->assertSame(503, $this->send()->getStatusCode());
    }

    public function test_missing_configuration_becomes_503_without_calling_the_api(): void
    {
        config(['services.cad_api.token' => null]);
        Http::fake();

        $this->assertSame(503, $this->send()->getStatusCode());
        Http::assertNothingSent();
    }

    public function test_rejects_oversized_bodies_without_calling_the_api(): void
    {
        Http::fake();

        $this->assertSame(413, $this->send(str_repeat('x', 262145))->getStatusCode());
        Http::assertNothingSent();
    }

    public function test_guests_cannot_reach_the_route(): void
    {
        Http::fake();

        $this->post(route('murosContencion.plano'))->assertRedirect();
        Http::assertNothingSent();
    }
}
