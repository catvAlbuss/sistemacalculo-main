<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
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
 * escribió mal los argumentos) se repite con el siguiente, más capaz, y así hasta el último. Así se paga el modelo
 * caro solo cuando hace falta. La cadena se puede fijar con AGENTE_LLM_MODELOS.
 */
class AgenteLlmController extends Controller
{
    private bool $falloTransitorio = false;
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
    public function estado(Request $request): JsonResponse
    {
        $c = self::configuracion();
        $listo = $c['model'] !== '' && (! $c['requiereClave'] || ! empty($c['key']));

        return response()->json([
            'listo' => $listo,
            'memoria' => $c['memoria'],
            'vision' => $c['vision'],
            // El panel pide la biblioteca del despacho solo si está activa y el usuario puede verla.
            'biblioteca' => (bool) config('agente.biblioteca_activa') && AgenteBibliotecaController::puedeVer($request->user()),
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

        $data['_crudo'] = json_decode($request->getContent()) ?: null;

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
        $json = null;
        $usados = 0;
        $ultimoError = null;
        $escalado = false;
        // El siguiente modelo también sirve de respaldo ante un fallo transitorio persistente.
        // Autenticación, parámetros y cuota no se arreglan cambiando de modelo.
        foreach ($c['cadena'] as $indice => $siguiente) {
            if ($json !== null && ! $this->respuestaFloja($json, $data)) {
                break;
            }
            $otro = $this->pedir($c, $siguiente, $data, $request);
            if ($otro instanceof JsonResponse) {
                $ultimoError = $otro;
                if (! $this->falloTransitorio) {
                    break;
                }
                continue;
            }
            [$json, $modelo, $escalado] = [$otro, $siguiente, $indice > 0];
            $usados += $this->tokens($otro);
        }
        if ($json === null) {
            return $ultimoError ?? $this->error(502, 'El motor de IA no pudo responder este pedido. Intenta de nuevo.');
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
        $this->falloTransitorio = false;
        // Modelos de razonamiento (GPT-5, o3…): sin temperature; razonamiento bajo para no gastar.
        $razona = (bool) preg_match('/^(gpt-5|gpt-6|o\d)/i', $modelo);
        $cuerpo = array_filter([
            'model' => $modelo,
            // Tal como llegaron (objetos): un esquema vacío {} decodificado como arreglo PHP se
            // reenviaría como [] y OpenAI rechaza todo el pedido ("[] is not of type 'object'").
            'messages' => $data['_crudo']->messages ?? $data['messages'],
            'tools' => $data['_crudo']->tools ?? ($data['tools'] ?? null),
            'tool_choice' => isset($data['tools']) ? ($data['tool_choice'] ?? 'auto') : null,
            'temperature' => $razona ? null : ($data['temperature'] ?? 0.2),
            'reasoning_effort' => $razona ? $c['razonamiento'] : null,
            $c['campoTokens'] => $c['max_tokens'],
            'stream' => false,
        ], fn ($v) => $v !== null);

        // Modelos que solo aceptan herramientas por la API Responses (GPT-6.2: razonamiento
        // siempre activo). Se aprende del primer rechazo del proveedor (no se cobra) y se recuerda.
        $porResponses = 'agente-llm:responses:' . $modelo;
        try {
            $http = Http::acceptJson()->connectTimeout(10)->timeout($c['timeout'])
                ->retry(2, 400, fn (\Throwable $e) => $e instanceof ConnectionException
                    || ($e instanceof RequestException && ($e->response->serverError() || $e->response->status() === 408)), throw: false);
            if (! empty($c['key'])) {
                $http = $http->withToken($c['key']);
            }
            if ($c['proveedor'] === 'openai' && Cache::get($porResponses)) {
                return $this->pedirResponses($http, $c, $modelo, $data, $request);
            }
            $respuesta = $http->post($c['url'] . '/chat/completions', $cuerpo);
            if ($c['proveedor'] === 'openai' && $respuesta->status() === 400 && str_contains((string) data_get($respuesta->json(), 'error.message', ''), '/v1/responses')) {
                Cache::put($porResponses, true, now()->addDay());
                Log::info('agente_llm: el modelo usa la API Responses para herramientas', ['modelo' => $modelo]);

                return $this->pedirResponses($http, $c, $modelo, $data, $request);
            }
            // Modelo nuevo que no acepta un parámetro (temperature, reasoning_effort…): una vez sin él.
            $rechazado = $this->parametroRechazado($respuesta, $cuerpo);
            if ($rechazado !== null) {
                Log::info('agente_llm: el modelo no acepta un parámetro; se repite sin él', ['modelo' => $modelo, 'parametro' => $rechazado]);
                unset($cuerpo[$rechazado]);
                $respuesta = $http->post($c['url'] . '/chat/completions', $cuerpo);
            }
        } catch (\Throwable $e) {
            $this->falloTransitorio = $e instanceof ConnectionException;
            Log::warning('agente_llm: sin respuesta del modelo', ['usuario' => $request->user()->id, 'proveedor' => $c['proveedor'], 'modelo' => $modelo, 'error' => $e->getMessage()]);

            return $this->error(504, 'El motor de IA no respondió a tiempo. Intenta de nuevo.');
        }

        if (! $respuesta->successful()) {
            $this->falloTransitorio = $respuesta->serverError() || $respuesta->status() === 408;
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

    /**
     * El mismo pedido por la API Responses de OpenAI, devuelto con la forma de chat/completions
     * (el panel no cambia): mensajes → input (system → developer, llamadas y resultados de
     * herramientas como function_call / function_call_output, fotos como input_image).
     */
    private function pedirResponses($http, array $c, string $modelo, array $data, Request $request): array|JsonResponse
    {
        $mensajes = json_decode(json_encode($data['_crudo']->messages ?? $data['messages']), true);
        $input = [];
        foreach ($mensajes as $m) {
            $rol = $m['role'] ?? 'user';
            if ($rol === 'tool') {
                $input[] = ['type' => 'function_call_output', 'call_id' => $m['tool_call_id'] ?? '', 'output' => is_string($m['content'] ?? null) ? $m['content'] : json_encode($m['content'] ?? '')];

                continue;
            }
            if ($rol === 'assistant' && ! empty($m['tool_calls'])) {
                if (! empty($m['content'])) {
                    $input[] = ['role' => 'assistant', 'content' => $m['content']];
                }
                foreach ($m['tool_calls'] as $tc) {
                    $input[] = ['type' => 'function_call', 'call_id' => $tc['id'] ?? '', 'name' => $tc['function']['name'] ?? '', 'arguments' => $tc['function']['arguments'] ?? '{}'];
                }

                continue;
            }
            $contenido = $m['content'] ?? '';
            if (is_array($contenido)) {
                $partes = [];
                foreach ($contenido as $parte) {
                    if (($parte['type'] ?? '') === 'image_url') {
                        $partes[] = ['type' => 'input_image', 'image_url' => $parte['image_url']['url'] ?? ''];
                    } elseif (($parte['type'] ?? '') === 'text') {
                        $partes[] = ['type' => 'input_text', 'text' => $parte['text'] ?? ''];
                    }
                }
                $contenido = $partes;
            }
            $input[] = ['role' => $rol === 'system' ? 'developer' : $rol, 'content' => $contenido];
        }
        // Herramientas: los esquemas tal como llegaron (objetos; {} sigue siendo {}).
        $tools = [];
        foreach ($data['_crudo']->tools ?? [] as $t) {
            $f = $t->function ?? null;
            if ($f) {
                $tools[] = ['type' => 'function', 'name' => $f->name, 'description' => $f->description ?? '', 'parameters' => $f->parameters ?? (object) []];
            }
        }
        $cuerpo = array_filter([
            'model' => $modelo,
            'input' => $input,
            'tools' => $tools ?: null,
            'reasoning' => ['effort' => $c['razonamiento']],
            'max_output_tokens' => $c['max_tokens'],
            'store' => false,
        ], fn ($v) => $v !== null);
        $respuesta = $http->post($c['url'] . '/responses', $cuerpo);
        if (! $respuesta->successful()) {
            $this->falloTransitorio = $respuesta->serverError() || $respuesta->status() === 408;
            $mensaje = (string) data_get($respuesta->json(), 'error.message', 'error del proveedor');
            Log::warning('agente_llm: el proveedor respondió con error (responses)', ['usuario' => $request->user()->id, 'modelo' => $modelo, 'status' => $respuesta->status(), 'mensaje' => mb_substr($mensaje, 0, 300)]);

            return $this->error($respuesta->status() === 429 ? 429 : 502, $respuesta->status() === 429 ? 'El motor de IA está saturado. Intenta en unos segundos.' : 'El motor de IA no pudo responder este pedido. Intenta de nuevo; si sigue, avisa al administrador.');
        }
        $r = (array) $respuesta->json();
        $texto = '';
        $llamadas = [];
        foreach ($r['output'] ?? [] as $item) {
            if (($item['type'] ?? '') === 'function_call') {
                $llamadas[] = ['id' => $item['call_id'] ?? ($item['id'] ?? ''), 'type' => 'function', 'function' => ['name' => $item['name'] ?? '', 'arguments' => $item['arguments'] ?? '{}']];
            } elseif (($item['type'] ?? '') === 'message') {
                foreach ($item['content'] ?? [] as $parte) {
                    if (($parte['type'] ?? '') === 'output_text') {
                        $texto .= $parte['text'] ?? '';
                    }
                }
            }
        }

        return [
            'model' => $modelo,
            'choices' => [['message' => array_filter(['role' => 'assistant', 'content' => $texto, 'tool_calls' => $llamadas ?: null], fn ($v) => $v !== null)]],
            'usage' => [
                'prompt_tokens' => data_get($r, 'usage.input_tokens', 0),
                'completion_tokens' => data_get($r, 'usage.output_tokens', 0),
                'prompt_tokens_details' => ['cached_tokens' => data_get($r, 'usage.input_tokens_details.cached_tokens', 0)],
                'completion_tokens_details' => ['reasoning_tokens' => data_get($r, 'usage.output_tokens_details.reasoning_tokens', 0)],
            ],
        ];
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
