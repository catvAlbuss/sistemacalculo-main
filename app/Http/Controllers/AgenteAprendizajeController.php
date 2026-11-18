<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Aprendizaje del Agente NovaCad por uso: cada corrección (o confirmación) que el ingeniero
 * hace a una decisión del agente se guarda con los rasgos del plano (solo geometría: niveles,
 * luces, columnas…), sin datos personales del proyecto. El entrenamiento
 * (scripts/agente/aprender-pares.mjs) los suma a los casos, y el agente los usa en la misma
 * sesión. Archivo: storage/app/private/aprendizaje/eventos.jsonl (fuera de public y de git).
 */
class AgenteAprendizajeController extends Controller
{
    private const ARCHIVO = 'aprendizaje/eventos.jsonl';

    // Decisiones que el agente propone (resources/js/ingenieria/aprendizaje/casos.js).
    private const CLAVES = [
        'cimentacion', 'cimientoCorrido', 'hz', 'df', 'losa', 'espesorLosa', 'losaDeTecho',
        'fcColumnas', 'fcColumnetas', 'estribos', 'columnasComoArquitectura', 'niveles',
        // Corrección de una fila del metrado en la vista previa (partida, fila y campo).
        'metrado',
    ];

    // Campos de una fila del metrado que el especialista puede corregir.
    private const CAMPOS_METRADO = ['simil', 'largo', 'ancho', 'alto', 'veces', 'longitud', 'gancho', 'varillas', 'parcial'];

    // Rasgos numéricos o lógicos del plano: lo único del proyecto que se guarda.
    private const RASGOS = ['niveles', 'luzLosa', 'luzMax', 'largo', 'ancho', 'area', 'columnas', 'columnetas', 'placas', 'techoLiviano'];

    public function guardar(Request $request): JsonResponse
    {
        $data = $request->validate([
            'tipo' => 'required|in:correccion,confirmacion',
            'clave' => 'required|in:' . implode(',', self::CLAVES),
            'valor' => 'present',
            'propuesto' => 'nullable',
            'motivo' => 'nullable|string|max:300',
            'rasgos' => 'required|array',
            'partida' => 'required_if:clave,metrado|nullable|string|max:24|regex:/^[0-9.]+$/',
            'fila' => 'required_if:clave,metrado|nullable|string|max:140',
            'campo' => 'required_if:clave,metrado|nullable|in:' . implode(',', self::CAMPOS_METRADO),
        ]);
        if ($data['clave'] === 'metrado' && ! is_numeric($data['valor'])) {
            return response()->json(['ok' => false, 'error' => 'valor no válido'], 422);
        }
        foreach (['valor', 'propuesto'] as $campo) {
            $v = $data[$campo] ?? null;
            if (! (is_null($v) || is_bool($v) || is_int($v) || is_float($v) || (is_string($v) && mb_strlen($v) <= 60))) {
                return response()->json(['ok' => false, 'error' => "$campo no válido"], 422);
            }
        }
        $rasgos = [];
        foreach (self::RASGOS as $r) {
            $v = $data['rasgos'][$r] ?? null;
            if (is_bool($v) || is_int($v) || is_float($v)) $rasgos[$r] = $v;
        }
        $evento = [
            'fecha' => now()->toIso8601String(),
            'usuario' => $request->user()->id, // solo para auditar; no sale en el entrenamiento
            'tipo' => $data['tipo'],
            'clave' => $data['clave'],
            'valor' => $data['valor'],
            'propuesto' => $data['propuesto'] ?? null,
            'motivo' => $data['motivo'] ?? null,
            'rasgos' => $rasgos,
        ];
        if ($data['clave'] === 'metrado') {
            $evento += ['partida' => $data['partida'], 'fila' => $data['fila'], 'campo' => $data['campo']];
        }
        Storage::disk('local')->append(self::ARCHIVO, json_encode($evento, JSON_UNESCAPED_UNICODE));

        return response()->json(['ok' => true]);
    }

    // Últimos eventos de todo el despacho (sin usuario): lo que corrige un ingeniero lo aprende
    // el agente para todos.
    public function listar(): JsonResponse
    {
        if (! Storage::disk('local')->exists(self::ARCHIVO)) {
            return response()->json(['eventos' => []]);
        }
        $lineas = array_slice(preg_split('/\R/', trim(Storage::disk('local')->get(self::ARCHIVO))), -500);
        $eventos = [];
        foreach ($lineas as $linea) {
            $e = json_decode($linea, true);
            if (! is_array($e)) continue;
            unset($e['usuario']);
            $eventos[] = $e;
        }

        return response()->json(['eventos' => $eventos]);
    }
}
