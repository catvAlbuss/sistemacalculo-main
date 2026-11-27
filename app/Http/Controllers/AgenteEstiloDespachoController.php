<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Estilo de dibujo aprendido de los planos de estructuras terminados del cliente
 * (resources/js/ingenieria/aprendizaje/estiloDespacho.js): por cada planta (cimentación, cimiento
 * corrido, losa, tabiquería) y cada elemento, qué fracción del dibujo ocupa y en qué capa lo pone.
 *
 * Solo fracciones y nombres de capa: ni coordenadas, ni textos, ni nombres del proyecto. El módulo es
 * un código corto (hash) que da el navegador. Archivo privado por usuario:
 * storage/app/private/agente/dibujo/usuarios/{id}/estilo-laminas.json
 */
class AgenteEstiloDespachoController extends Controller
{
    private const TIPOS = ['cimentacion', 'cimiento', 'losa', 'tabiqueria'];

    private const CLASES = ['muro', 'columneta', 'acero', 'vigueta', 'viga', 'zapata', 'cimiento', 'columna'];

    private const MAX_PLANOS = 100;

    private function archivo(int $usuario): string
    {
        return "agente/dibujo/usuarios/{$usuario}/estilo-laminas.json";
    }

    public function guardar(Request $request): JsonResponse
    {
        $data = $request->validate([
            'modulo' => 'required|string|max:40|regex:/^[A-Za-z0-9_-]+$/',
            'tipos' => 'required|array|min:1|max:4',
        ]);
        $tipos = [];
        foreach ($data['tipos'] as $tipo => $t) {
            if (! in_array($tipo, self::TIPOS, true) || ! is_array($t)) {
                continue;
            }
            $clases = [];
            foreach (self::CLASES as $clase) {
                $c = $t['clases'][$clase] ?? null;
                if (! is_array($c) || ! is_numeric($c['fraccion'] ?? null)) {
                    continue;
                }
                $capa = isset($c['capa']) && is_string($c['capa']) ? mb_substr(preg_replace('/[^\pL\pN _.\-&#()\/]/u', '', $c['capa']), 0, 64) : null;
                $clases[$clase] = ['fraccion' => round(max(0, min(1, (float) $c['fraccion'])), 3)] + ($capa !== null && $capa !== '' ? ['capa' => $capa] : []);
            }
            $tipos[$tipo] = ['vistas' => max(1, min(20, (int) ($t['vistas'] ?? 1))), 'clases' => $clases];
        }
        if (! $tipos) {
            return response()->json(['ok' => false, 'error' => 'Sin plantas reconocibles.'], 422);
        }

        $archivo = $this->archivo($request->user()->id);
        $disco = Storage::disk('local');
        $planos = $disco->exists($archivo) ? (json_decode($disco->get($archivo), true)['planos'] ?? []) : [];
        // Volver a leer el mismo plano reemplaza la lectura anterior.
        $planos[$data['modulo']] = ['fecha' => now()->toIso8601String(), 'tipos' => $tipos];
        if (count($planos) > self::MAX_PLANOS) {
            uasort($planos, fn ($a, $b) => strcmp($a['fecha'], $b['fecha']));
            $planos = array_slice($planos, -self::MAX_PLANOS, null, true);
        }
        $disco->put($archivo, json_encode(['planos' => $planos]));

        return response()->json(['ok' => true, 'planos' => count($planos)]);
    }

    // Solo los planos de ESTE usuario.
    public function datos(Request $request): JsonResponse
    {
        $disco = Storage::disk('local');
        $archivo = $this->archivo($request->user()->id);
        $planos = $disco->exists($archivo) ? array_values(array_map(fn ($p) => ['tipos' => $p['tipos']], json_decode($disco->get($archivo), true)['planos'] ?? [])) : [];

        return response()->json(['planos' => $planos]);
    }

    public function olvidar(Request $request): JsonResponse
    {
        Storage::disk('local')->delete($this->archivo($request->user()->id));

        return response()->json(['ok' => true]);
    }
}
