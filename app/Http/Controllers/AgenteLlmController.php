<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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
 * incluidas), límite de pedidos por usuario y minuto, tope diario de tokens, registro del consumo.
 *
 * Modelo automático (AGENTE_LLM_MODEL=auto): cada pedido va primero al modelo económico de la
 * cadena; solo si su respuesta no sirve (no eligió herramienta, eligió una que no existe o
 * escribió mal los argumentos) se repite con el siguiente, más capaz. Así se paga el modelo
 * caro solo cuando hace falta. La cadena se puede fijar con AGENTE_LLM_MODELOS.
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

    // Cadena del modo automático por proveedor: económico primero, el más capaz si hace falta.
    private const MODELOS_AUTO = [
        'openai' => ['gpt-4.1-mini', 'gpt-4.1'],
        'gemini' => ['gemini-2.5-flash', 'gemini-2.5-pro'],
        'grok' => [],
        'ollama' => ['qwen3-cad'],
    ];

    /** Configuración efectiva (con los valores por defecto del proveedor). */
    public static function configuracion(): array
    {
        $cfg = config('services.agente_llm', []);
        $nombre = strtolower((string) ($cfg['proveedor'] ?? 'openai'));
        $p = self::PROVEEDORES[$nombre] ?? self::PROVEEDORES['openai'];
        $pedido = trim((string) ($cfg['model'] ?? 'auto'));
        $lista = array_values(array_filter(array_map('trim', explode(',', (string) ($cfg['modelos'] ?? '')))));
        $cadena = $pedido === '' || strtolower($pedido) === 'auto'
            ? ($lista ?: (self::MODELOS_AUTO[$nombre] ?? []))
            : [$pedido];
        $modelo = (string) ($cadena[0] ?? '');
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
            'cadena' => $cadena,
            'razonamiento' => (string) ($cfg['razonamiento'] ?? 'low'),
            'tokens_dia' => max(0, (int) ($cfg['tokens_dia'] ?? 2_000_000)),
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

        // Tope diario de tokens (todo el despacho): protege la cuenta del proveedor.
        $dia = 'agente-llm:tokens:' . now()->format('Y-m-d');
        if ($c['tokens_dia'] > 0 && (int) Cache::get($dia, 0) >= $c['tokens_dia']) {
            return $this->error(429, 'Se alcanzó el consumo diario de IA del agente. Las acciones directas del panel siguen funcionando; el chat vuelve mañana.');
        }

        $modelo = $c['model'];
        $resultado = $this->pedir($c, $modelo, $data, $request);
        if ($resultado instanceof JsonResponse) {
            return $resultado;
        }
        $json = $resultado;
        $usados = $this->tokens($json);

        // Modo automático: si el económico no resolvió el pedido, una vez con el siguiente.
        $escalado = false;
        $siguiente = $c['cadena'][1] ?? null;
        if ($siguiente && $this->respuestaFloja($json, $data)) {
            $otro = $this->pedir($c, $siguiente, $data, $request);
            if (! $otro instanceof JsonResponse) {
                [$json, $modelo, $escalado] = [$otro, $siguiente, true];
                $usados += $this->tokens($otro);
            }
        }

        Cache::add($dia, 0, now()->addDays(2));
        Cache::increment($dia, $usados);
        Log::info('agente_llm: uso', [
            'usuario' => $request->user()->id,
            'proveedor' => $c['proveedor'],
            'modelo' => $modelo,
            'escalado' => $escalado,
            'entrada' => data_get($json, 'usage.prompt_tokens'),
            'en_cache' => data_get($json, 'usage.prompt_tokens_details.cached_tokens'),
            'salida' => data_get($json, 'usage.completion_tokens'),
            'tokens_del_dia' => (int) Cache::get($dia, 0),
        ]);

        return response()->json($json);
    }

    /** Un pedido al proveedor; un JsonResponse si falló (mensaje claro, detalle en el registro). */
    private function pedir(array $c, string $modelo, array $data, Request $request): array|JsonResponse
    {
        // Modelos de razonamiento (GPT-5, o3…): sin temperature; razonamiento bajo para no gastar.
        $razona = (bool) preg_match('/^(gpt-5|gpt-6|o\d)/i', $modelo);
        $cuerpo = array_filter([
            'model' => $modelo,
            'messages' => $data['messages'],
            'tools' => $data['tools'] ?? null,
            'tool_choice' => isset($data['tools']) ? ($data['tool_choice'] ?? 'auto') : null,
            'temperature' => $razona ? null : ($data['temperature'] ?? 0.2),
            'reasoning_effort' => $razona ? $c['razonamiento'] : null,
            $c['campoTokens'] => $c['max_tokens'],
            'stream' => false,
        ], fn ($v) => $v !== null);

        try {
            $http = Http::acceptJson()->timeout($c['timeout']);
            if (! empty($c['key'])) {
                $http = $http->withToken($c['key']);
            }
            $respuesta = $http->post($c['url'] . '/chat/completions', $cuerpo);
            // Modelo nuevo que no acepta un parámetro (temperature, reasoning_effort…): una vez sin él.
            $rechazado = $this->parametroRechazado($respuesta, $cuerpo);
            if ($rechazado !== null) {
                Log::info('agente_llm: el modelo no acepta un parámetro; se repite sin él', ['modelo' => $modelo, 'parametro' => $rechazado]);
                unset($cuerpo[$rechazado]);
                $respuesta = $http->post($c['url'] . '/chat/completions', $cuerpo);
            }
        } catch (\Throwable $e) {
            Log::warning('agente_llm: sin respuesta del modelo', ['usuario' => $request->user()->id, 'proveedor' => $c['proveedor'], 'modelo' => $modelo, 'error' => $e->getMessage()]);

            return $this->error(504, 'El motor de IA no respondió a tiempo. Intenta de nuevo.');
        }

        if (! $respuesta->successful()) {
            $mensaje = (string) data_get($respuesta->json(), 'error.message', 'error del proveedor');
            Log::warning('agente_llm: el proveedor respondió con error', ['usuario' => $request->user()->id, 'proveedor' => $c['proveedor'], 'modelo' => $modelo, 'status' => $respuesta->status(), 'mensaje' => mb_substr($mensaje, 0, 300)]);
            if (preg_match('/credit|quota|billing|insufficient/i', $mensaje)) {
                return $this->error(503, 'La cuenta del motor de IA no tiene saldo. El administrador debe recargarla; mientras tanto usa las acciones directas del panel.');
            }
            $status = in_array($respuesta->status(), [400, 404, 429], true) ? $respuesta->status() : 502;

            // Al usuario, un mensaje claro; el detalle del proveedor queda en el registro.
            return $this->error($status, $status === 429 ? 'El motor de IA está saturado. Intenta en unos segundos.' : 'El motor de IA no pudo responder este pedido. Intenta de nuevo; si sigue, avisa al administrador.');
        }

        return (array) $respuesta->json();
    }

    /** Parámetro opcional que el proveedor rechazó (400 con su nombre), o null. */
    private function parametroRechazado($respuesta, array $cuerpo): ?string
    {
        if ($respuesta->status() !== 400) {
            return null;
        }
        $error = (array) data_get($respuesta->json(), 'error', []);
        $texto = ($error['param'] ?? '') . ' ' . ($error['message'] ?? '');
        foreach (['temperature', 'reasoning_effort', 'tool_choice'] as $opcional) {
            if (array_key_exists($opcional, $cuerpo) && str_contains($texto, $opcional)) {
                return $opcional;
            }
        }

        return null;
    }

    private function tokens(array $json): int
    {
        return (int) data_get($json, 'usage.prompt_tokens', 0) + (int) data_get($json, 'usage.completion_tokens', 0);
    }

    /**
     * La respuesta del modelo económico no sirve para el primer paso del pedido: con herramientas
     * disponibles no eligió ninguna, eligió una que no existe o sus argumentos no son JSON.
     */
    private function respuestaFloja(array $json, array $data): bool
    {
        if (empty($data['tools']) || (end($data['messages'])['role'] ?? '') !== 'user') {
            return false;
        }
        $llamadas = data_get($json, 'choices.0.message.tool_calls') ?? [];
        if (! $llamadas) {
            return true;
        }
        $nombres = array_filter(array_map(fn ($t) => data_get($t, 'function.name'), $data['tools']));
        foreach ($llamadas as $llamada) {
            if (! in_array(data_get($llamada, 'function.name'), $nombres, true)) {
                return true;
            }
            $args = data_get($llamada, 'function.arguments');
            if (is_string($args) && trim($args) !== '' && ! is_array(json_decode($args, true))) {
                return true;
            }
        }

        return false;
    }

    private function error(int $status, string $mensaje): JsonResponse
    {
        return response()->json(['error' => ['message' => $mensaje]], $status);
    }
}
