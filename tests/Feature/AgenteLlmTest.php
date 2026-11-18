<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Http\Client\Request as PedidoHttp;
use Illuminate\Support\Facades\Http;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

// El agente usa GPT a través del servidor: la clave nunca llega al navegador, el modelo y
// los límites los pone el servidor.
class AgenteLlmTest extends TestCase
{
    use RefreshPaymentsDatabase;

    private const CLAVE = 'sk-prueba-no-real-123';

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware();
        $this->actingAs(User::factory()->create());
        config(['services.agente_llm' => ['url' => 'https://api.openai.com/v1', 'key' => self::CLAVE, 'model' => 'modelo-del-servidor', 'max_tokens' => 800, 'timeout' => 30, 'por_minuto' => 2]]);
    }

    private function pedido(array $extra = []): array
    {
        return ['model' => 'otro-modelo-caro', 'messages' => [['role' => 'system', 'content' => 'Eres el Agente'], ['role' => 'user', 'content' => 'genera el plano de estructuras']],
            'tools' => [['type' => 'function', 'function' => ['name' => 'plano_estructuras', 'parameters' => ['type' => 'object', 'properties' => new \stdClass]]]], 'tool_choice' => 'auto'] + $extra;
    }

    public function test_the_server_adds_the_key_and_fixes_the_model(): void
    {
        Http::fake(['api.openai.com/*' => Http::response(['choices' => [['message' => ['role' => 'assistant', 'content' => '', 'tool_calls' => [['id' => 'c1', 'type' => 'function', 'function' => ['name' => 'plano_estructuras', 'arguments' => '{}']]]]]], 'usage' => ['prompt_tokens' => 900, 'completion_tokens' => 20]])]);
        $r = $this->postJson(route('software.etabs.agente.llm'), $this->pedido());
        $r->assertOk()->assertJsonPath('choices.0.message.tool_calls.0.function.name', 'plano_estructuras');
        $this->assertStringNotContainsString(self::CLAVE, $r->getContent());
        Http::assertSent(fn (PedidoHttp $p) => $p->hasHeader('Authorization', 'Bearer ' . self::CLAVE)
            && $p['model'] === 'modelo-del-servidor' && $p['max_completion_tokens'] === 800 && count($p['tools']) === 1);
    }

    public function test_without_a_key_or_over_the_limit_it_says_so_clearly(): void
    {
        Http::fake(['api.openai.com/*' => Http::response(['choices' => [['message' => ['role' => 'assistant', 'content' => 'ok']]]])]);
        $this->postJson(route('software.etabs.agente.llm'), $this->pedido())->assertOk();
        $this->postJson(route('software.etabs.agente.llm'), $this->pedido())->assertOk();
        $this->postJson(route('software.etabs.agente.llm'), $this->pedido())->assertStatus(429)->assertJsonPath('error.message', 'Demasiados pedidos al agente en un minuto. Espera unos segundos.');
        config(['services.agente_llm.key' => null]);
        $this->postJson(route('software.etabs.agente.llm'), $this->pedido())->assertStatus(503);
    }

    public function test_provider_errors_do_not_leak_the_key(): void
    {
        Http::fake(['api.openai.com/*' => Http::response(['error' => ['message' => 'Incorrect API key provided: sk-pru****123']], 401)]);
        $r = $this->postJson(route('software.etabs.agente.llm'), $this->pedido());
        $r->assertStatus(502);
        $this->assertStringNotContainsString(self::CLAVE, $r->getContent());
    }
}
