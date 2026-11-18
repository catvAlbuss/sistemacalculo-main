<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Observaciones del ingeniero con fotos (una lámina impresa marcada, un detalle de obra, una
 * captura): quedan guardadas para revisar y entrenar al agente. Las fotos van a
 * storage/app/private/agente/observaciones (nunca a public/) y el índice a
 * agente/observaciones.jsonl con el texto, las fotos y solo la geometría del plano.
 */
class AgenteObservacionesController extends Controller
{
    private const INDICE = 'agente/observaciones.jsonl';

    private const RASGOS = ['niveles', 'luzLosa', 'luzMax', 'largo', 'ancho', 'area', 'columnas', 'columnetas', 'placas', 'techoLiviano'];

    public function guardar(Request $request): JsonResponse
    {
        $data = $request->validate([
            'texto' => 'nullable|string|max:2000',
            'fotos' => 'nullable|array|max:6',
            'fotos.*' => 'file|mimes:jpg,jpeg,png,webp|max:4096',
            'rasgos' => 'nullable|string|max:2000',
        ]);
        $fotos = $request->file('fotos', []);
        if (trim((string) ($data['texto'] ?? '')) === '' && ! count($fotos)) {
            return response()->json(['ok' => false, 'error' => 'La observación está vacía.'], 422);
        }
        $carpeta = 'agente/observaciones/' . now()->format('Y-m');
        $guardadas = [];
        foreach ($fotos as $foto) {
            $guardadas[] = $foto->storeAs($carpeta, Str::uuid() . '.' . strtolower($foto->extension() ?: 'jpg'), 'local');
        }
        $rasgos = [];
        foreach ((array) json_decode((string) ($data['rasgos'] ?? '[]'), true) as $k => $v) {
            if (in_array($k, self::RASGOS, true) && (is_int($v) || is_float($v) || is_bool($v))) {
                $rasgos[$k] = $v;
            }
        }
        $id = (string) Str::uuid();
        Storage::disk('local')->append(self::INDICE, json_encode([
            'id' => $id, 'fecha' => now()->toIso8601String(), 'usuario' => $request->user()->id,
            'texto' => $data['texto'] ?? null, 'fotos' => $guardadas, 'rasgos' => $rasgos,
        ], JSON_UNESCAPED_UNICODE));

        return response()->json(['ok' => true, 'id' => $id, 'fotos' => count($guardadas)]);
    }

    // Observaciones del despacho para revisarlas (sin quién las hizo).
    public function listar(): JsonResponse
    {
        if (! Storage::disk('local')->exists(self::INDICE)) {
            return response()->json(['observaciones' => []]);
        }
        $lineas = array_slice(preg_split('/\R/', trim(Storage::disk('local')->get(self::INDICE))), -200);
        $lista = [];
        foreach ($lineas as $linea) {
            $o = json_decode($linea, true);
            if (! is_array($o)) continue;
            unset($o['usuario']);
            $o['fotos'] = array_map(fn ($ruta) => route('software.etabs.agente.observaciones.foto', ['ruta' => basename(dirname($ruta)) . '/' . basename($ruta)]), $o['fotos'] ?? []);
            $lista[] = $o;
        }

        return response()->json(['observaciones' => array_reverse($lista)]);
    }

    // Foto de una observación (solo usuarios con sesión; la ruta no sale de su carpeta).
    public function foto(string $ruta): StreamedResponse
    {
        abort_unless(preg_match('/^\d{4}-\d{2}\/[0-9a-f\-]{36}\.(jpe?g|png|webp)$/i', $ruta), 404);
        $archivo = 'agente/observaciones/' . $ruta;
        abort_unless(Storage::disk('local')->exists($archivo), 404);

        return Storage::disk('local')->response($archivo);
    }
}
