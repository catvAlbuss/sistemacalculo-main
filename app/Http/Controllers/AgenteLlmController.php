<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Proxy del Agente NovaCad hacia el modelo de lenguaje (GPT u otra API compatible con
 * OpenAI). La clave está solo en el servidor (.env → services.agente_llm): el navegador
 * manda la conversación y las herramientas a /software/etabs/agente/llm/chat/completions y
 * recibe la respuesta del modelo, sin ver nunca la clave.
 *
 * Controles: el modelo lo fija el servidor, tope de tokens por respuesta, tamaño máximo del
 * pedido, límite de pedidos por usuario y minuto, y registro del consumo por usuario.
 */
class AgenteLlmController extends Controller
{
    private const MAX_BYTES = 200_000;

    public function chat(Request $request): JsonResponse
    {
        $cfg = config('services.agente_llm');
        if (empty($cfg['key'])) {
            return $this->error(503, 'El agente con GPT no está configurado en el servidor (falta AGENTE_LLM_KEY en el .env).');
        }
        if (strlen($request->getContent()) > self::MAX_BYTES) {
            return $this->error(413, 'La conversación es demasiado larga para el agente. Empieza una nueva.');
        }
        $data = $request->validate([
            'messages' => 'required|array|min:1|max:80',
            'messages.*.role' => 'required|in:system,user,assistant,tool',
            'tools' => 'nullable|array|max:40',
            'tool_choice' => 'nullable',
            'temperature' => 'nullable|numeric|min:0|max:1',
        ]);

        $clave = 'agente-llm:' . $request->user()->id;
        if (RateLimiter::tooManyAttempts($clave, max(1, (int) $cfg['por_minuto']))) {
            return $this->error(429, 'Demasiados pedidos al agente en un minuto. Espera unos segundos.');
        }
        RateLimiter::hit($clave, 60);

        $cuerpo = array_filter([
            'model' => $cfg['model'],
            'messages' => $data['messages'],
            'tools' => $data['tools'] ?? null,
            'tool_choice' => isset($data['tools']) ? ($data['tool_choice'] ?? 'auto') : null,
            'temperature' => $data['temperature'] ?? 0.2,
            'max_completion_tokens' => max(100, (int) $cfg['max_tokens']),
        ], fn ($v) => $v !== null);

        try {
            $respuesta = Http::withToken($cfg['key'])->acceptJson()->timeout(max(10, (int) $cfg['timeout']))
                ->post(rtrim($cfg['url'], '/') . '/chat/completions', $cuerpo);
        } catch (\Throwable $e) {
            Log::warning('agente_llm: sin respuesta del modelo', ['usuario' => $request->user()->id, 'error' => $e->getMessage()]);

            return $this->error(504, 'El modelo no respondió a tiempo. Intenta de nuevo.');
        }

        if (! $respuesta->successful()) {
            $mensaje = (string) data_get($respuesta->json(), 'error.message', 'error del proveedor');
            Log::warning('agente_llm: el proveedor respondió con error', ['usuario' => $request->user()->id, 'status' => $respuesta->status(), 'mensaje' => mb_substr($mensaje, 0, 300)]);
            $status = in_array($respuesta->status(), [400, 404, 429], true) ? $respuesta->status() : 502;

            return $this->error($status, 'El modelo respondió con un error: ' . mb_substr($mensaje, 0, 200));
        }

        $json = $respuesta->json();
        Log::info('agente_llm: uso', [
            'usuario' => $request->user()->id,
            'modelo' => $cfg['model'],
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
