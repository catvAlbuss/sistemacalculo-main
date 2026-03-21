<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Illuminate\Support\Facades\File;

class VigaCaptureController extends Controller
{
    public function capturarFragmento(Request $request): JsonResponse|BinaryFileResponse
    {
        try {
            $data = $this->validarDatos($request);

            $timestamp = now()->format('Ymd_His_u');
            $jsonPath = $this->obtenerRutaJson($timestamp);
            $imagePath = $this->obtenerRutaImagen($timestamp);

            $this->guardarPayload($jsonPath, $data);

            $output = $this->ejecutarCapturaNode($jsonPath, $imagePath);

            if (!File::exists($imagePath)) {
                return response()->json([
                    'ok' => false,
                    'message' => 'No se generó la imagen.',
                    'raw' => trim((string) $output),
                ], 500);
            }

            return response()->download(
                $imagePath,
                $this->generarNombreDescarga($timestamp),
                ['Content-Type' => 'image/png']
            );
        } catch (\Throwable $e) {
            return response()->json([
                'ok' => false,
                'message' => $e->getMessage(),
                'trace' => $e->getFile() . ':' . $e->getLine(),
            ], 500);
        }
    }

    private function validarDatos(Request $request): array
    {
        return $request->validate([
            'html' => 'required|string',
            'stylesheets' => 'nullable|array',
            'stylesheets.*' => 'string',
            'inlineStyles' => 'nullable|string',
        ]);
    }

    private function obtenerRutaJson(string $timestamp): string
    {
        return storage_path("app/viga-fragmento-{$timestamp}.json");
    }

    private function obtenerRutaImagen(string $timestamp): string
    {
        return public_path("captures/resultado_viga_{$timestamp}.png");
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

        $command = "\"{$node}\" \"{$script}\" \"{$jsonPath}\" \"{$imagePath}\" 2>&1";

        return (string) shell_exec($command);
    }

    private function generarNombreDescarga(string $timestamp): string
    {
        return "resultado_viga_{$timestamp}.png";
    }
}
