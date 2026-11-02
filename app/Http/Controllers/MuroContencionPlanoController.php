<?php

namespace App\Http\Controllers;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

// Intermediario hacia la API CAD: el token nunca llega al navegador.
class MuroContencionPlanoController extends Controller
{
    private const MAX_BODY_BYTES = 262144;

    public function __invoke(Request $request): Response|JsonResponse
    {
        $body = $request->getContent();
        if (strlen($body) > self::MAX_BODY_BYTES) {
            return response()->json(['error' => ['code' => 'PAYLOAD_TOO_LARGE', 'message' => 'Los datos del plano son demasiado grandes.', 'fields' => []]], 413);
        }

        $url = config('services.cad_api.url');
        $token = config('services.cad_api.token');
        if (! $url || ! $token) {
            return $this->unavailable();
        }

        try {
            // Cuerpo sin decodificar: PHP convertiría {} en [] y el contrato espera objetos.
            $response = Http::withToken($token)->acceptJson()
                ->connectTimeout(config('services.cad_api.timeout'))
                ->timeout(config('services.cad_api.timeout'))
                ->withBody($body, 'application/json')
                ->post(rtrim($url, '/').'/api/v1/planos/muro-contencion');
        } catch (ConnectionException) {
            return $this->unavailable();
        }

        if ($response->successful()) {
            return response($response->body(), 200, [
                'Content-Type' => 'application/dxf',
                'Content-Disposition' => 'attachment; filename="plano-muro-contencion.dxf"',
                'Cache-Control' => 'private, no-store',
            ]);
        }
        if ($response->status() === 400) {
            return response()->json($response->json(), 400);
        }

        Log::warning('API CAD rechazó la generación del plano', ['status' => $response->status()]);

        return $this->unavailable();
    }

    private function unavailable(): JsonResponse
    {
        return response()->json(['error' => ['code' => 'CAD_API_UNAVAILABLE', 'message' => 'El servicio de planos no está disponible.', 'fields' => []]], 503);
    }
}
