<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Proxy del Agente NovaCad hacia el modelo de lenguaje. Proveedor, URL, clave y modelo se
 * configuran solo en el .env (services.agente_llm): el navegador manda la conversación y las
 * herramientas a /software/etabs/agente/llm/chat/completions y recibe la respuesta, sin ver
 * nunca la clave, la URL ni el modelo. Así el producto se entrega con el agente sin exponer
 * las credenciales del despacho.
 *
 * Proveedores con API compatible con OpenAI: openai, gemini, grok y ollama (local, sin clave).
 * Controles: modelo fijado por el servidor, tope de tokens, tamaño máximo del pedido (fotos
 * incluidas), límite de pedidos por usuario y minuto, registro del consumo.
 */
class AgenteLlmController extends Controller
{
    private const MAX_BYTES = 6_000_000; // conversación + fotos comprimidas

    private const PROVEEDORES = [
        'openai' => ['url' => 'https://api.openai.com/v1', 'clave' => true, 'tokens' => 'max_completion_tokens', 'vision' => true],
        'gemini' => ['url' => 'https://generativelanguage.googleapis.com/v1beta/openai', 'clave' => true, 'tokens' => 'max_tokens', 'vision' => true],
        'grok' => ['url' => 'https://api.x.ai/v1', 'clave' => true, 'tokens' => 'max_tokens', 'vision' => true],
        'ollama' => ['url' => 'http://127.0.0.1:11434/v1', 'clave' => false, 'tokens' => 'max_tokens', 'vision' => false],
    ];

    /** Configuración efectiva (con los valores por defecto del proveedor). */
    public static function configuracion(): array
    {
        $cfg = config('services.agente_llm', []);
        $nombre = strtolower((string) ($cfg['proveedor'] ?? 'openai'));
        $p = self::PROVEEDORES[$nombre] ?? self::PROVEEDORES['openai'];
        $modelo = (string) ($cfg['model'] ?? '');
        $chico = $nombre === 'ollama' && ! preg_match('/gpt|oss|cloud|[:\-](1[4-9]|[2-9]\d|\d{3})b\b/i', $modelo);
        $memoria = in_array($cfg['memoria'] ?? 'auto', ['completa', 'corta'], true) ? $cfg['memoria'] : ($chico ? 'corta' : 'completa');
        $vision = match (strtolower((string) ($cfg['vision'] ?? 'auto'))) {
            '1', 'true', 'si', 'sí', 'yes' => true,
            '0', 'false', 'no' => false,
            default => $p['vision'],
        };

        return [
            'proveedor' => array_key_exists($nombre, self::PROVEEDORES) ? $nombre : 'openai',
            'url' => rtrim((string) (($cfg['url'] ?? null) ?: $p['url']), '/'),
            'key' => $cfg['key'] ?? null,
            'requiereClave' => $p['clave'],
            'campoTokens' => $p['tokens'],
            'model' => $modelo,
            'memoria' => $memoria,
            'vision' => $vision,
            'max_tokens' => max(100, (int) ($cfg['max_tokens'] ?? 1500)),
            'timeout' => max(10, (int) ($cfg['timeout'] ?? 90)),
            'por_minuto' => max(1, (int) ($cfg['por_minuto'] ?? 20)),
        ];
    }

    /** Estado para el panel: listo o no, y cómo usarlo. Sin clave, URL ni modelo. */
    public function estado(): JsonResponse
    {
        $c = self::configuracion();
        $listo = $c['model'] !== '' && (! $c['requiereClave'] || ! empty($c['key']));

        return response()->json([
            'listo' => $listo,
            'memoria' => $c['memoria'],
            'vision' => $c['vision'],
            'mensaje' => $listo ? null : 'El agente aún no tiene un motor de IA configurado. El administrador debe completarlo en el servidor.',
        ]);
    }

    public function chat(Request $request): JsonResponse
    {
        $c = self::configuracion();
        if ($c['model'] === '' || ($c['requiereClave'] && empty($c['key']))) {
            return $this->error(503, 'El agente aún no tiene un motor de IA configurado. El administrador debe completarlo en el servidor.');
        }
        if (strlen($request->getContent()) > self::MAX_BYTES) {
            return $this->error(413, 'El pedido es demasiado grande (fotos o conversación). Envía menos fotos o empieza una nueva sesión.');
        }
        $data = $request->validate([
            'messages' => 'required|array|min:1|max:80',
            'messages.*.role' => 'required|in:system,user,assistant,tool',
            'tools' => 'nullable|array|max:40',
            'tool_choice' => 'nullable',
            'temperature' => 'nullable|numeric|min:0|max:1',
        ]);

        $clave = 'agente-llm:' . $request->user()->id;
        if (RateLimiter::tooManyAttempts($clave, $c['por_minuto'])) {
            return $this->error(429, 'Demasiados pedidos al agente en un minuto. Espera unos segundos.');
        }
        RateLimiter::hit($clave, 60);

        $cuerpo = array_filter([
            'model' => $c['model'],
            'messages' => $data['messages'],
            'tools' => $data['tools'] ?? null,
            'tool_choice' => isset($data['tools']) ? ($data['tool_choice'] ?? 'auto') : null,
            'temperature' => $data['temperature'] ?? 0.2,
            $c['campoTokens'] => $c['max_tokens'],
            'stream' => false,
        ], fn ($v) => $v !== null);

        try {
            $http = Http::acceptJson()->timeout($c['timeout']);
            if (! empty($c['key'])) {
                $http = $http->withToken($c['key']);
            }
            $respuesta = $http->post($c['url'] . '/chat/completions', $cuerpo);
        } catch (\Throwable $e) {
            Log::warning('agente_llm: sin respuesta del modelo', ['usuario' => $request->user()->id, 'proveedor' => $c['proveedor'], 'error' => $e->getMessage()]);

            return $this->error(504, 'El motor de IA no respondió a tiempo. Intenta de nuevo.');
        }

        if (! $respuesta->successful()) {
            $mensaje = (string) data_get($respuesta->json(), 'error.message', 'error del proveedor');
            Log::warning('agente_llm: el proveedor respondió con error', ['usuario' => $request->user()->id, 'proveedor' => $c['proveedor'], 'status' => $respuesta->status(), 'mensaje' => mb_substr($mensaje, 0, 300)]);
            $status = in_array($respuesta->status(), [400, 404, 429], true) ? $respuesta->status() : 502;

            // Al usuario, un mensaje claro; el detalle del proveedor queda en el registro.
            return $this->error($status, $status === 429 ? 'El motor de IA está saturado. Intenta en unos segundos.' : 'El motor de IA no pudo responder este pedido. Intenta de nuevo; si sigue, avisa al administrador.');
        }

        $json = $respuesta->json();
        Log::info('agente_llm: uso', [
            'usuario' => $request->user()->id,
            'proveedor' => $c['proveedor'],
            'modelo' => $c['model'],
            'entrada' => data_get($json, 'usage.prompt_tokens'),
            'salida' => data_get($json, 'usage.completion_tokens'),
        ]);

        return response()->json($json);
    }

    private function error(int $status, string $mensaje): JsonResponse
    {
        return response()->json(['error' => ['message' => $mensaje]], $status);
    }
}
