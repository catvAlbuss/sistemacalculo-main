<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\Process\Process;

class VigaCaptureController extends Controller
{
    public function capturarFragmento(Request $request): JsonResponse|BinaryFileResponse
    {
        $data = $this->validarDatos($request);
        $jsonPath = null;
        try {
            $timestamp = (string) Str::uuid();
            $jsonPath = $this->obtenerRutaJson($timestamp);
            $imagePath = $this->obtenerRutaImagen($timestamp);

            $this->guardarPayload($jsonPath, $data);

            $output = $this->ejecutarCapturaNode($jsonPath, $imagePath);

            if (!File::exists($imagePath)) {
                return response()->json([
                    'ok' => false,
                    'message' => 'No se generó la imagen.',
                ], 500);
            }

            return response()->download(
                $imagePath,
                $this->generarNombreDescarga($timestamp),
                ['Content-Type' => 'image/png']
            )->deleteFileAfterSend(true);
        } catch (\Throwable $e) {
            Log::warning('No se pudo capturar el resultado de vigas.', ['exception'=>get_class($e)]);
            return response()->json([
                'ok' => false,
                'message' => 'No se pudo generar la imagen. Intenta nuevamente o contacta con soporte.',
            ], 500);
        } finally {
            if ($jsonPath && File::exists($jsonPath)) { File::delete($jsonPath); }
        }
    }

    private function validarDatos(Request $request): array
    {
        return $request->validate([
            'html' => 'required|string|max:3000000',
            'stylesheets' => 'nullable|array|max:30',
            'stylesheets.*' => 'string|max:2048',
            'inlineStyles' => 'nullable|string|max:300000',
        ]);
    }

    private function obtenerRutaJson(string $timestamp): string
    {
        return storage_path("app/viga-fragmento-{$timestamp}.json");
    }

    private function obtenerRutaImagen(string $timestamp): string
    {
        return storage_path("app/private/captures/resultado_viga_{$timestamp}.png");
    }

    private function guardarPayload(string $jsonPath, array $data): void
    {
        File::put(
            $jsonPath,
            json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT)
        );
    }

    private function ejecutarCapturaNode(string $jsonPath, string $imagePath): string
    {
        $node = 'node';
        $script = base_path('capture-viga-fragmento.mjs');

        $environment=['CAPTURE_APP_URL'=>request()->getSchemeAndHttpHost()];
        if(app()->isLocal() && is_file(public_path('hot'))) {
            $hot=trim(file_get_contents(public_path('hot')));
            if(in_array(parse_url($hot,PHP_URL_HOST),['localhost','127.0.0.1','::1'],true)){$environment['CAPTURE_DEV_ORIGIN']=$hot;}
        }
        $process = new Process([$node, $script, $jsonPath, $imagePath], base_path(), $environment);
        $process->setTimeout(60)->mustRun();
        return $process->getOutput();
    }

    private function generarNombreDescarga(string $timestamp): string
    {
        return "resultado_viga_{$timestamp}.png";
    }
}
