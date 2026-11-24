<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Corrections are appended to private storage as pending review events. Only approved
 * corrections are returned to agent proposals; legacy events without a status remain approved.
 * File: storage/app/private/aprendizaje/eventos.jsonl (outside public and git).
 */
class AgenteAprendizajeController extends Controller
{
    private const ARCHIVO = 'aprendizaje/eventos.jsonl';

    // Decisiones que el agente propone (resources/js/ingenieria/aprendizaje/casos.js).
    private const CLAVES = [
        'cimentacion', 'cimientoCorrido', 'hz', 'df', 'losa', 'espesorLosa', 'losaDeTecho', 'techoDosAguas',
        'fcColumnas', 'fcColumnetas', 'estribos', 'columnasComoArquitectura', 'niveles',
        // Decisiones que pregunta la construcción guiada (consultas.js): losa maciza en baños y
        // malla completa vs. solo bastones en la cimentación. Sin ellas el POST daba 422 y no se aprendía.
        'losaMaciza', 'mallaCimentacion',
        // Corrección de una fila del metrado en la vista previa (partida, fila y campo) y nombre que
        // el despacho le da a un tipo de elemento en la planilla (terminología).
        'metrado', 'termino',
    ];

    // Tipos de elemento con nombre en la planilla (resources/js/ingenieria/metrado/terminologia.js).
    private const TERMINOS = ['platea', 'zapata', 'cimientoEje', 'cimiento', 'sobrecimientoEje', 'sobrecimiento', 'columna', 'areaInterior'];

    // Campos de una fila del metrado que el especialista puede corregir.
    private const CAMPOS_METRADO = ['simil', 'largo', 'ancho', 'alto', 'veces', 'longitud', 'gancho', 'empalme', 'varillas', 'parcial'];

    // Rasgos numéricos o lógicos del plano: lo único del proyecto que se guarda.
    private const RASGOS = ['niveles', 'luzLosa', 'luzMax', 'largo', 'ancho', 'area', 'columnas', 'columnetas', 'placas', 'techoLiviano', 'cubierta', 'falsoCielo', 'deportivo', 'agua', 'banos'];

    public function guardar(Request $request): JsonResponse
    {
        $data = $request->validate([
            'tipo' => 'required|in:correccion,confirmacion',
            'clave' => 'required|in:'.implode(',', self::CLAVES),
            'valor' => 'present',
            'propuesto' => 'nullable',
            'motivo' => 'nullable|string|max:300',
            'rasgos' => 'present|array',
            'partida' => 'required_if:clave,metrado|nullable|string|max:24|regex:/^[0-9.]+$/',
            'fila' => 'required_if:clave,metrado|nullable|string|max:140',
            'campo' => 'required_if:clave,metrado|nullable|in:'.implode(',', self::CAMPOS_METRADO),
            'termino' => 'required_if:clave,termino|nullable|in:'.implode(',', self::TERMINOS),
        ]);
        if ($data['clave'] === 'termino' && ! (is_string($data['valor']) && trim($data['valor']) !== '' && mb_strlen($data['valor']) <= 140)) {
            return response()->json(['ok' => false, 'error' => 'nombre no válido'], 422);
        }
        if ($data['clave'] === 'metrado' && ! is_numeric($data['valor'])) {
            return response()->json(['ok' => false, 'error' => 'valor no válido'], 422);
        }
        $largo = $data['clave'] === 'termino' ? 140 : 60;
        foreach (['valor', 'propuesto'] as $campo) {
            $v = $data[$campo] ?? null;
            if (! (is_null($v) || is_bool($v) || is_int($v) || is_float($v) || (is_string($v) && mb_strlen($v) <= $largo))) {
                return response()->json(['ok' => false, 'error' => "$campo no válido"], 422);
            }
        }
        $rasgos = [];
        foreach (self::RASGOS as $r) {
            $v = $data['rasgos'][$r] ?? null;
            if (is_bool($v) || is_int($v) || is_float($v)) {
                $rasgos[$r] = $v;
            }
        }
        $evento = [
            'evento_id' => (string) Str::uuid(),
            'fecha' => now()->toIso8601String(),
            'usuario' => $request->user()->id, // solo para auditar; no sale en el entrenamiento
            'estado' => 'pendiente',
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
        if ($data['clave'] === 'termino') {
            $evento['termino'] = $data['termino'];
        }
        Storage::disk('local')->append(self::ARCHIVO, json_encode($evento, JSON_UNESCAPED_UNICODE));

        return response()->json(['ok' => true, 'evento_id' => $evento['evento_id'], 'estado' => 'pendiente']);
    }

    // Approved events only; the submitter identity is never shared with the agent.
    public function listar(): JsonResponse
    {
        if (! Storage::disk('local')->exists(self::ARCHIVO)) {
            return response()->json(['eventos' => []]);
        }
        $lineas = array_slice(preg_split('/\R/', trim(Storage::disk('local')->get(self::ARCHIVO))), -500);
        [$eventosBase, $estadoPorId] = $this->resolverEstados($lineas);
        $eventos = [];
        foreach ($eventosBase as $e) {
            $id = $e['evento_id'] ?? null;
            if ($id !== null) {
                $estado = $estadoPorId[$id] ?? ($e['estado'] ?? 'pendiente');
                if ($estado !== 'aprobado') {
                    continue;
                }
            }
            // Legacy rows without event status or id remain approved.
            unset($e['usuario']);
            $eventos[] = $e;
        }

        return response()->json(['eventos' => $eventos]);
    }

    public function pendientes(Request $request): JsonResponse
    {
        $this->autorizarRevision($request);
        if (! Storage::disk('local')->exists(self::ARCHIVO)) {
            return response()->json(['eventos' => []]);
        }
        $lineas = preg_split('/\R/', trim(Storage::disk('local')->get(self::ARCHIVO)));
        [$eventosBase, $estadoPorId] = $this->resolverEstados($lineas);
        $eventos = [];
        foreach ($eventosBase as $e) {
            $id = $e['evento_id'] ?? null;
            if ($id === null) {
                continue;
            }
            $estado = $estadoPorId[$id] ?? ($e['estado'] ?? 'pendiente');
            if ($estado === 'pendiente') {
                unset($e['usuario']);
                $eventos[] = $e;
            }
        }

        return response()->json(['eventos' => $eventos]);
    }

    public function aprobar(Request $request, string $id): JsonResponse
    {
        $this->autorizarRevision($request);

        return $this->resolver($request, $id, 'aprobado');
    }

    public function rechazar(Request $request, string $id): JsonResponse
    {
        $this->autorizarRevision($request);

        return $this->resolver($request, $id, 'rechazado');
    }

    private function autorizarRevision(Request $request): void
    {
        $u = $request->user();
        abort_unless($u && ($u->hasRole('root') || $u->can('agente.aprendizaje.aprobar')), 403);
    }

    private function resolver(Request $request, string $id, string $estado): JsonResponse
    {
        if (! Storage::disk('local')->exists(self::ARCHIVO)) {
            abort(404);
        }
        $encontrado = false;
        foreach (preg_split('/\R/', trim(Storage::disk('local')->get(self::ARCHIVO))) as $linea) {
            $e = json_decode($linea, true);
            if (is_array($e) && ($e['evento_id'] ?? null) === $id && isset($e['clave'])) {
                $encontrado = true;
                break;
            }
        }
        abort_unless($encontrado, 404);
        Storage::disk('local')->append(self::ARCHIVO, json_encode([
            'evento_id' => $id,
            'estado' => $estado,
            'revisado_por' => $request->user()->id,
            'fecha' => now()->toIso8601String(),
        ], JSON_UNESCAPED_UNICODE));

        return response()->json(['ok' => true, 'estado' => $estado]);
    }

    private function resolverEstados(array $lineas): array
    {
        $eventosBase = [];
        $estadoPorId = [];
        foreach ($lineas as $linea) {
            $e = json_decode($linea, true);
            if (! is_array($e)) {
                continue;
            }
            if (isset($e['evento_id']) && isset($e['estado']) && ! isset($e['clave'])) {
                $estadoPorId[$e['evento_id']] = $e['estado'];
            } elseif (isset($e['evento_id']) || ! isset($e['estado'])) {
                $eventosBase[] = $e;
            }
        }

        return [$eventosBase, $estadoPorId];
    }
}
