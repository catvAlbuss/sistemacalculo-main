<?php

namespace App\Http\Controllers;

use App\Models\CadModel;
use App\Models\MemoriaCalculo;
use App\Models\MemoriaDescriptiva;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

// Puente entre los módulos de diseño del CAD (losa aligerada primero, luego
// vigas/columnas/muros) y Memoria de Cálculo/Descriptiva -- pedido del
// cliente: al generar un reporte, poder mandarlo DIRECTO a la memoria del
// mismo proyecto en vez de descargar y volver a subir la imagen a mano.
//
// "Mismo proyecto" = mismo CadModel (this._serverModelId en autosave.js) --
// una sola Memoria de Cálculo y una sola Memoria Descriptiva por CadModel,
// creada la primera vez que algo se envía (get-or-create, nunca duplica).
//
// Memoria de Cálculo ya tenía el esquema pensado para esto (MemoriaCalculo::
// saveImage(), tabla memoria_imagenes agrupada por group_key/index/sub_key/
// sub_index) -- solo hacía falta el controlador. Memoria Descriptiva NO tiene
// todavía una sección de plantilla para "diseño de losa aligerada" (es un
// documento más narrativo) -- de momento solo se guarda en su columna `data`
// (JSON), bajo la clave `adjuntosDiseno`, para no perder el dato; falta
// decidir con Jack cómo (o si) se muestra en el documento generado.
class MemoriaSyncController extends Controller
{
    /**
     * Ancho/alto REAL en píxeles de una imagen base64 -- pedido del cliente
     * (ver conversación): el Word forzaba TODAS las imágenes de una sección
     * a una caja fija (500x800, etc.) sin importar su proporción real; las
     * capturas del CAD (viguetas/cargas/asd/vu) son tiras muy anchas y bajas
     * (hasta 17:1 ancho:alto) -- forzarlas a una caja alta y angosta las
     * estira/aplasta hasta volverlas ilegibles. getimagesizefromstring() lee
     * el tamaño real sin depender de ninguna librería nueva (ya viene con
     * PHP/GD). Null si el string no es una imagen decodificable.
     */
    private function imageDimensions(string $base64): ?array
    {
        $raw = preg_replace('#^data:image/\w+;base64,#', '', $base64);
        $binary = base64_decode($raw, true);
        if ($binary === false) return null;
        $info = @getimagesizefromstring($binary);
        if (!$info) return null;
        return ['width' => $info[0], 'height' => $info[1]];
    }

    /**
     * Devuelve la Memoria de Cálculo del usuario para este CadModel,
     * creándola si es la primera vez que se envía algo para ese proyecto.
     */
    public function resolveCalculo(Request $request)
    {
        $data = $request->validate([
            'cad_model_id' => ['required', 'integer'],
        ]);

        $cadModel = CadModel::where('id', $data['cad_model_id'])
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $memoria = MemoriaCalculo::firstOrCreate(
            ['user_id' => Auth::id(), 'cad_model_id' => $cadModel->id],
            ['project_name' => $cadModel->name],
        );

        return response()->json(['id' => $memoria->id]);
    }

    /**
     * Guarda (o reemplaza, mismo group_key/index/sub_key/sub_index) una
     * imagen capturada en un módulo de diseño -- mismo mecanismo que ya usa
     * el formulario manual de Memoria de Cálculo, solo que llamado desde
     * afuera en vez de un <input type="file">.
     */
    public function storeCalculoImage(Request $request, MemoriaCalculo $memoriaCalculo)
    {
        if ($memoriaCalculo->user_id !== Auth::id()) {
            abort(403);
        }

        $data = $request->validate([
            'group_key' => ['required', 'string', 'max:100'],
            'index' => ['required', 'integer', 'min:0'],
            'sub_index' => ['nullable', 'integer', 'min:0'],
            'sub_key' => ['nullable', 'string', 'max:100'],
            'image_base64' => ['required', 'string'],
        ]);

        $memoriaCalculo->saveImage(
            $data['group_key'],
            $data['index'],
            $data['image_base64'],
            $data['sub_index'] ?? null,
            $data['sub_key'] ?? null,
        );

        return response()->json(['ok' => true]);
    }

    /**
     * Envía TODO el diseño actual de "Losa Aligerada" (ver rcAligeradoDesign.js
     * -- built.groups completo, uno por vigueta continua) y REEMPLAZA por
     * completo la sección 4.2 de Memoria de Cálculo (campo real: sections.
     * disenoElementos.losa/lista + previews.losaImages[sección][slot] -- NO
     * disenoLosaAligeradaImages, que es un slot manual único sin relación).
     *
     * CAMBIO DE DISEÑO (ver conversación, decisión explícita del cliente):
     * antes cada grupo se mandaba por separado y se ACUMULABA contra envíos
     * previos (reconociendo "misma vigueta" por losas compartidas -- ver
     * historial de esta función). Se descartó: el cliente quiere que cada
     * "Enviar a Memoria" reemplace el resultado anterior, no lo acumule --
     * más simple y predecible (lo que ves en el CAD ahora mismo es
     * exactamente lo que va a quedar en Memoria de Cálculo, sin arrastrar
     * pruebas de sesiones anteriores).
     */
    public function replaceLosaAligerada(Request $request, MemoriaCalculo $memoriaCalculo)
    {
        if ($memoriaCalculo->user_id !== Auth::id()) {
            abort(403);
        }

        $data = $request->validate([
            'groups' => ['required', 'array', 'min:1'],
            'groups.*.area_ids' => ['required', 'array', 'min:1'],
            'groups.*.section_label' => ['required', 'string', 'max:200'],
            'groups.*.images' => ['required', 'array'],
            // Tablas T1 (flexión)/T2 (cortante) -- misma forma de celda
            // ({text,...}) que ya arma _rcAligeradoCaptureGroup para el PDF;
            // ContentProcessorMC.createTable la acepta tal cual.
            'groups.*.t1_rows' => ['nullable', 'array'],
            'groups.*.t2_rows' => ['nullable', 'array'],
            // "1.- Datos Generales" del PDF de referencia (f'c/fy/B/T/
            // factores/ancho tributario) -- un solo dato para todo el diseño.
            'datos_generales' => ['nullable', 'array'],
        ]);
        // Mismo orden que _rcAligeradoCaptureGroup / SLOT_CAPTIONS del Word.
        $slots = ['viguetas', 'cargaMuerta', 'cargaViva', 'asd', 'vu', 'fuerzasCortantes', 'momentosFlectores'];

        // Borra TODO lo que había antes -- este envío reemplaza, no acumula.
        $memoriaCalculo->images()->where('group_key', 'losaImages')->delete();

        $lista = [];
        $losaTablas = [];
        $losaAreaIds = [];

        foreach (array_values($data['groups']) as $sectionIndex => $group) {
            $areaIds = array_map('strval', $group['area_ids']);
            $lista[] = $group['section_label'];
            $losaTablas[(string) $sectionIndex] = [
                't1' => $group['t1_rows'] ?? [],
                't2' => $group['t2_rows'] ?? [],
            ];
            $losaAreaIds[(string) $sectionIndex] = $areaIds;

            foreach ($slots as $slotIndex => $slotKey) {
                $base64 = $group['images'][$slotKey] ?? null;
                if (!$base64) continue;
                $memoriaCalculo->saveImage('losaImages', $sectionIndex, $base64, $slotIndex, null, [
                    'area_ids' => $areaIds,
                    'dimensions' => $this->imageDimensions($base64),
                ]);
            }
        }

        $disenoElementos = $memoriaCalculo->diseno_elementos ?? [];
        $memoriaCalculo->diseno_elementos = array_merge($disenoElementos, [
            'losa' => count($lista),
            'lista' => implode("\n", $lista),
            'losaTablas' => $losaTablas,
            'losaAreaIds' => $losaAreaIds,
            'datosGeneralesAligerado' => $data['datos_generales'] ?? ($disenoElementos['datosGeneralesAligerado'] ?? null),
        ]);
        $memoriaCalculo->save();

        return response()->json(['ok' => true, 'sections' => count($lista)]);
    }

    /**
     * Lectura para la página de Memoria de Cálculo: dado un cad_model_id (ver
     * `?cad_model_id=` que el CAD agrega al link "Ver en Memoria de Cálculo"),
     * devuelve el id de la memoria y TODAS sus imágenes agrupadas por
     * group_key -- listas para volcar directo a
     * $store.memoriaCalculo.previews[group_key] al abrir la página, sin que
     * el usuario tenga que volver a subir nada.
     */
    public function showCalculoByCadModel(int $cadModelId)
    {
        $memoria = MemoriaCalculo::where('user_id', Auth::id())
            ->where('cad_model_id', $cadModelId)
            ->with('images')
            ->first();

        if (!$memoria) {
            return response()->json(['exists' => false]);
        }

        $imagesByGroup = [];
        foreach ($memoria->images as $img) {
            $imagesByGroup[$img->group_key] ??= [];
            $key = $img->sub_index !== null ? $img->index . '.' . $img->sub_index : (string) $img->index;
            $imagesByGroup[$img->group_key][$key] = [
                'base64' => $img->image_base64,
                'index' => $img->index,
                'subIndex' => $img->sub_index,
                'subKey' => $img->sub_key,
                // Ver imageDimensions() -- ancho/alto REAL en píxeles, para
                // que el Word respete la proporción real en vez de forzar
                // una caja fija (ver conversación). Null en imágenes
                // guardadas ANTES de este cambio (no se recalcula solo).
                'width' => $img->metadata['dimensions']['width'] ?? null,
                'height' => $img->metadata['dimensions']['height'] ?? null,
            ];
        }

        return response()->json([
            'exists' => true,
            'id' => $memoria->id,
            'projectName' => $memoria->project_name,
            'imagesByGroup' => $imagesByGroup,
            // losa/lista de la sección 4.2 (Diseño de Losa Aligerada) -- ver
            // storeLosaAligeradaSection(). El resto de diseno_elementos
            // (viga/columna/etc.) no se sincroniza todavía.
            'disenoElementos' => [
                'losa' => $memoria->diseno_elementos['losa'] ?? null,
                'lista' => $memoria->diseno_elementos['lista'] ?? null,
                'losaTablas' => $memoria->diseno_elementos['losaTablas'] ?? null,
                'datosGeneralesAligerado' => $memoria->diseno_elementos['datosGeneralesAligerado'] ?? null,
            ],
        ]);
    }

    /** Mismo get-or-create que resolveCalculo(), para Memoria Descriptiva. */
    public function resolveDescriptiva(Request $request)
    {
        $data = $request->validate([
            'cad_model_id' => ['required', 'integer'],
        ]);

        $cadModel = CadModel::where('id', $data['cad_model_id'])
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $memoria = MemoriaDescriptiva::firstOrCreate(
            ['user_id' => Auth::id(), 'cad_model_id' => $cadModel->id],
            ['project_name' => $cadModel->name],
        );

        return response()->json(['id' => $memoria->id]);
    }

    /**
     * Guarda un adjunto de diseño en Memoria Descriptiva -- TEMPORAL (ver
     * conversación): sin sección de plantilla propia todavía, se guarda tal
     * cual dentro de `data.adjuntosDiseno.{key}` (JSON) para no perder el
     * dato mientras se decide cómo mostrarlo en el documento.
     */
    public function storeDescriptivaAttachment(Request $request, MemoriaDescriptiva $memoriaDescriptiva)
    {
        if ($memoriaDescriptiva->user_id !== Auth::id()) {
            abort(403);
        }

        $data = $request->validate([
            'key' => ['required', 'string', 'max:100'],
            'label' => ['nullable', 'string', 'max:200'],
            'image_base64' => ['required', 'string'],
        ]);

        $current = $memoriaDescriptiva->data ?? [];
        $current['adjuntosDiseno'] ??= [];
        $current['adjuntosDiseno'][$data['key']] = [
            'label' => $data['label'] ?? $data['key'],
            'base64' => $data['image_base64'],
            'savedAt' => now()->toISOString(),
        ];
        $memoriaDescriptiva->data = $current;
        $memoriaDescriptiva->save();

        return response()->json(['ok' => true]);
    }
}
