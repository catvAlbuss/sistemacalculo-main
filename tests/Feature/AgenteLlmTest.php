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

    public function test_the_provider_comes_from_the_env_and_the_panel_only_sees_its_state(): void
    {
        // Ollama local: sin clave, su URL por defecto, memoria corta para un modelo de 4B.
        config(['services.agente_llm' => ['proveedor' => 'ollama', 'model' => 'qwen3-cad', 'key' => null]]);
        $estado = $this->getJson(route('software.etabs.agente.llm.estado'))->assertOk();
        $estado->assertJson(['listo' => true, 'memoria' => 'corta', 'vision' => false]);
        foreach (['qwen3-cad', '11434', 'url', 'key', 'model'] as $secreto) {
            $this->assertStringNotContainsString($secreto, $estado->getContent());
        }
        Http::fake(['127.0.0.1:11434/*' => Http::response(['choices' => [['message' => ['role' => 'assistant', 'content' => 'ok']]]])]);
        $this->postJson(route('software.etabs.agente.llm'), $this->pedido())->assertOk();
        Http::assertSent(fn (PedidoHttp $p) => str_starts_with($p->url(), 'http://127.0.0.1:11434/v1/chat/completions') && ! $p->hasHeader('Authorization') && $p['max_tokens'] === 1500);

        // Gemini: su URL compatible con OpenAI y la clave del .env.
        config(['services.agente_llm' => ['proveedor' => 'gemini', 'model' => 'modelo-gemini', 'key' => 'clave-gemini']]);
        Http::fake(['generativelanguage.googleapis.com/*' => Http::response(['choices' => [['message' => ['role' => 'assistant', 'content' => 'ok']]]])]);
        $this->postJson(route('software.etabs.agente.llm'), $this->pedido())->assertOk();
        Http::assertSent(fn (PedidoHttp $p) => str_contains($p->url(), 'generativelanguage.googleapis.com/v1beta/openai/chat/completions') && $p->hasHeader('Authorization', 'Bearer clave-gemini'));

        // Sin configurar: el panel lo sabe sin ver detalles.
        config(['services.agente_llm' => ['proveedor' => 'grok', 'model' => 'auto', 'key' => 'k']]);
        $this->getJson(route('software.etabs.agente.llm.estado'))->assertJson(['listo' => false]);
        config(['services.agente_llm' => ['proveedor' => 'openai', 'model' => 'x', 'key' => null]]);
        $this->getJson(route('software.etabs.agente.llm.estado'))->assertJson(['listo' => false]);
    }

    public function test_auto_mode_uses_the_cheap_model_and_escalates_only_when_it_fails(): void
    {
        config(['services.agente_llm' => ['proveedor' => 'openai', 'model' => 'auto', 'key' => self::CLAVE, 'tokens_dia' => 0]]);
        $herramienta = ['choices' => [['message' => ['role' => 'assistant', 'content' => '', 'tool_calls' => [['id' => 'c1', 'type' => 'function', 'function' => ['name' => 'plano_estructuras', 'arguments' => '{}']]]]]], 'usage' => ['prompt_tokens' => 10, 'completion_tokens' => 2]];
        $soloTexto = ['choices' => [['message' => ['role' => 'assistant', 'content' => 'Claro, lo haré.']]], 'usage' => ['prompt_tokens' => 10, 'completion_tokens' => 5]];

        // Una sola secuencia de respuestas del proveedor para los cuatro pedidos.
        Http::fake(['api.openai.com/*' => Http::sequence()->push($herramienta)->push($soloTexto)->push($herramienta)->push($soloTexto)->push($herramienta)]);
        $modelos = fn () => collect(Http::recorded())->map(fn ($par) => $par[0]['model'])->all();

        // 1) El económico resuelve: una sola llamada, con gpt-4.1-mini.
        $this->postJson(route('software.etabs.agente.llm'), $this->pedido())->assertOk()->assertJsonPath('choices.0.message.tool_calls.0.function.name', 'plano_estructuras');
        $this->assertSame(['gpt-4.1-mini'], $modelos());

        // 2) El económico no eligió herramienta: se repite con el más capaz y se devuelve ese.
        $this->postJson(route('software.etabs.agente.llm'), $this->pedido())->assertOk()->assertJsonPath('choices.0.message.tool_calls.0.function.name', 'plano_estructuras');
        $this->assertSame(['gpt-4.1-mini', 'gpt-4.1-mini', 'gpt-4.1'], $modelos());

        // 3) Después de una herramienta (respuesta final en texto) no se escala.
        $tras = $this->pedido();
        $tras['messages'][] = ['role' => 'assistant', 'content' => '', 'tool_calls' => $herramienta['choices'][0]['message']['tool_calls']];
        $tras['messages'][] = ['role' => 'tool', 'tool_call_id' => 'c1', 'content' => '{"ok":true}'];
        $this->postJson(route('software.etabs.agente.llm'), $tras)->assertOk()->assertJsonPath('choices.0.message.content', 'Claro, lo haré.');
        $this->assertCount(4, $modelos());

        // 4) GPT-5 y similares: sin temperature, con razonamiento bajo.
        config(['services.agente_llm.modelos' => 'gpt-5-mini']);
        $this->postJson(route('software.etabs.agente.llm'), $this->pedido())->assertOk();
        $ultimo = collect(Http::recorded())->last()[0];
        $this->assertSame('gpt-5-mini', $ultimo['model']);
        $this->assertFalse(isset($ultimo['temperature']));
        $this->assertSame('low', $ultimo['reasoning_effort']);
    }

    public function test_daily_budget_and_empty_account_are_explained(): void
    {
        config(['services.agente_llm' => ['proveedor' => 'openai', 'model' => 'auto', 'key' => self::CLAVE, 'tokens_dia' => 100, 'por_minuto' => 50]]);
        Http::fake(['api.openai.com/*' => Http::sequence()
            ->push(['choices' => [['message' => ['role' => 'assistant', 'content' => '', 'tool_calls' => [['id' => 'c', 'type' => 'function', 'function' => ['name' => 'plano_estructuras', 'arguments' => '{}']]]]]], 'usage' => ['prompt_tokens' => 90, 'completion_tokens' => 20]])
            ->push(['error' => ['message' => 'You have no credits remaining. Add credits to continue.']], 429)]);
        $this->postJson(route('software.etabs.agente.llm'), $this->pedido())->assertOk();
        $this->postJson(route('software.etabs.agente.llm'), $this->pedido())->assertStatus(429)->assertJsonPath('error.message', fn ($m) => str_contains($m, 'consumo diario'));

        // Cuenta sin saldo: se dice así, sin el mensaje crudo del proveedor.
        config(['services.agente_llm.tokens_dia' => 0]);
        $this->postJson(route('software.etabs.agente.llm'), $this->pedido())->assertStatus(503)->assertJsonPath('error.message', fn ($m) => str_contains($m, 'no tiene saldo'));
    }
}
