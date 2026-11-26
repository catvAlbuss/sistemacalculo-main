<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Aprendizaje del dibujo con el cliente: el ingeniero corrige una lámina del agente y el agente guarda,
 * por usuario, qué muros quedaron y cuáles no (con sus rasgos geométricos). Con eso se entrena el modelo
 * de ese usuario en el navegador (resources/js/ingenieria/aprendizaje/aprendizajeCliente.js), junto con
 * la base del despacho (scripts/agente/publicar-base-dibujo.mjs).
 *
 * Solo números: rasgos geométricos, la decisión de la regla, la del ingeniero y el largo. Ni nombres,
 * ni textos, ni coordenadas del plano. El módulo es un código corto (hash) que da el navegador.
 * Archivos privados: storage/app/private/agente/dibujo/usuarios/{id}/{decision}.json y la base en
 * storage/app/private/agente/dibujo/base-{decision}.json.
 */
class AgenteAprendizajeDibujoController extends Controller
{
    private const DECISIONES = ['muro-cimentacion'];

    // Rasgos de cimentacionPlano.js → RASGOS_MURO (y reglaSi del híbrido no se guarda: sale de "regla").
    private const RASGOS = ['largo', 'dBorde', 'dEje', 'inclinacion', 'dColumna', 'dExtremoColumna', 'dColumneta', 'posRelativa', 'paralelos', 'platea', 'niveles', 'area'];

    private const MAX_MODULOS = 200;

    private function archivoUsuario(int $usuario, string $decision): string
    {
        return "agente/dibujo/usuarios/{$usuario}/{$decision}.json";
    }

    public function guardar(Request $request): JsonResponse
    {
        $data = $request->validate([
            'decision' => 'required|in:'.implode(',', self::DECISIONES),
            'modulo' => 'required|string|max:40|regex:/^[A-Za-z0-9_-]+$/',
            'muestras' => 'required|array|min:1|max:5000',
            'muestras.*.rasgos' => 'required|array',
            'muestras.*.regla' => 'required|boolean',
            'muestras.*.etiqueta' => 'required|boolean',
            'muestras.*.largo' => 'required|numeric|min:0|max:1000',
        ]);
        $muestras = array_map(function (array $m) {
            $rasgos = [];
            foreach (self::RASGOS as $r) {
                $v = $m['rasgos'][$r] ?? 0;
                $rasgos[$r] = is_numeric($v) ? round((float) $v, 4) : 0;
            }

            return ['rasgos' => $rasgos, 'regla' => (bool) $m['regla'], 'etiqueta' => (bool) $m['etiqueta'], 'largo' => round((float) $m['largo'], 3)];
        }, $data['muestras']);

        $archivo = $this->archivoUsuario($request->user()->id, $data['decision']);
        $disco = Storage::disk('local');
        $modulos = $disco->exists($archivo) ? (json_decode($disco->get($archivo), true)['modulos'] ?? []) : [];
        // La última corrección de un módulo reemplaza a la anterior (el ingeniero puede volver a corregir).
        $modulos[$data['modulo']] = ['fecha' => now()->toIso8601String(), 'muestras' => $muestras];
        if (count($modulos) > self::MAX_MODULOS) {
            uasort($modulos, fn ($a, $b) => strcmp($a['fecha'], $b['fecha']));
            $modulos = array_slice($modulos, -self::MAX_MODULOS, null, true);
        }
        $disco->put($archivo, json_encode(['modulos' => $modulos]));

        return response()->json(['ok' => true, 'modulos' => count($modulos), 'muestras' => count($muestras)]);
    }

    // Base del despacho + correcciones de ESTE usuario (nunca las de otros).
    public function datos(Request $request): JsonResponse
    {
        $decision = $request->validate(['decision' => 'required|in:'.implode(',', self::DECISIONES)])['decision'];
        $disco = Storage::disk('local');
        $base = $disco->exists("agente/dibujo/base-{$decision}.json") ? (json_decode($disco->get("agente/dibujo/base-{$decision}.json"), true)['muestras'] ?? []) : [];
        $archivo = $this->archivoUsuario($request->user()->id, $decision);
        $cliente = [];
        if ($disco->exists($archivo)) {
            foreach (json_decode($disco->get($archivo), true)['modulos'] ?? [] as $modulo => $m) {
                foreach ($m['muestras'] as $muestra) {
                    $cliente[] = ['modulo' => (string) $modulo] + $muestra;
                }
            }
        }

        return response()->json(['decision' => $decision, 'base' => $base, 'cliente' => $cliente]);
    }

    // El usuario borra lo que el agente aprendió de él (vuelve a la regla del despacho).
    public function olvidar(Request $request): JsonResponse
    {
        $decision = $request->validate(['decision' => 'required|in:'.implode(',', self::DECISIONES)])['decision'];
        Storage::disk('local')->delete($this->archivoUsuario($request->user()->id, $decision));

        return response()->json(['ok' => true]);
    }
}
