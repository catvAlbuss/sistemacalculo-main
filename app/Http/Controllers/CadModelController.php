<?php

namespace App\Http\Controllers;

use App\Models\CadModel;
use Illuminate\Http\Request;

/**
 * Modelos CAD (ETABS web) guardados en la nube, por usuario.
 *
 * Fase 1: autoguardado del modelo actual (`autosave` + `latest`).
 * Fase 2: multi-modelo (listar / abrir / renombrar / borrar / guardar como).
 *
 * `data` llega ya comprimido (gzip+base64) desde el frontend y se guarda opaco
 * (el servidor no lo descomprime). Si algún día se necesita leerlo en PHP:
 *   $json = gzdecode(base64_decode($model->data));
 */
class CadModelController extends Controller
{
    /** Modelos del usuario autenticado (sin el blob `data`, para listar rápido). */
    public function index(Request $request)
    {
        $models = CadModel::where('user_id', $request->user()->id)
            ->orderByDesc('updated_at')
            ->get(['id', 'name', 'node_count', 'version', 'last_saved_at', 'updated_at']);

        return response()->json(['models' => $models]);
    }

    /** Un modelo concreto (con `data`) — para abrirlo. */
    public function show(Request $request, int $id)
    {
        $model = CadModel::where('user_id', $request->user()->id)->findOrFail($id);

        return response()->json([
            'exists' => true,
            'id' => $model->id,
            'name' => $model->name,
            'data' => $model->data,
            'is_compressed' => $model->is_compressed,
            'node_count' => $model->node_count,
            'version' => $model->version,
            'last_saved_at' => $model->last_saved_at,
        ]);
    }

    /** Crea un modelo nuevo (Guardar como / primera subida). */
    public function store(Request $request)
    {
        $data = $request->validate([
            'data' => 'required|string',
            'name' => 'required|string|max:255',
            'node_count' => 'nullable|integer',
            'is_compressed' => 'nullable|boolean',
        ]);

        $model = CadModel::create([
            'user_id' => $request->user()->id,
            'name' => $data['name'],
            'data' => $data['data'],
            'is_compressed' => $data['is_compressed'] ?? true,
            'node_count' => $data['node_count'] ?? 0,
            'version' => 1,
            'last_saved_at' => now(),
        ]);

        return response()->json([
            'ok' => true,
            'id' => $model->id,
            'name' => $model->name,
            'version' => $model->version,
            'last_saved_at' => $model->last_saved_at,
        ], 201);
    }

    /** Renombrar. */
    public function update(Request $request, int $id)
    {
        $data = $request->validate(['name' => 'required|string|max:255']);

        $model = CadModel::where('user_id', $request->user()->id)->findOrFail($id);
        $model->update(['name' => $data['name']]);

        return response()->json(['ok' => true, 'id' => $model->id, 'name' => $model->name]);
    }

    /** Borrar. */
    public function destroy(Request $request, int $id)
    {
        $model = CadModel::where('user_id', $request->user()->id)->findOrFail($id);
        $model->delete();

        return response()->json(['ok' => true]);
    }

    /**
     * Autoguardado del modelo ACTUAL. Si viene `id` actualiza ese modelo; si no,
     * crea uno nuevo y devuelve su id (el frontend lo recuerda para los próximos).
     * Concurrencia optimista por `version` → 409 si el servidor tiene una más nueva.
     */
    public function autosave(Request $request)
    {
        $data = $request->validate([
            'id' => 'nullable|integer',
            'data' => 'required|string',
            'name' => 'nullable|string|max:255',
            'node_count' => 'nullable|integer',
            'version' => 'nullable|integer',
            'is_compressed' => 'nullable|boolean',
        ]);

        $userId = $request->user()->id;
        $model = ! empty($data['id'])
            ? CadModel::where('user_id', $userId)->find($data['id'])
            : null;

        if ($model && isset($data['version']) && (int) $data['version'] < $model->version) {
            return response()->json([
                'conflict' => true,
                'server_version' => $model->version,
                'last_saved_at' => $model->last_saved_at,
            ], 409);
        }

        $payload = [
            'user_id' => $userId,
            'name' => $data['name'] ?? ($model->name ?? 'modelo'),
            'data' => $data['data'],
            'is_compressed' => $data['is_compressed'] ?? true,
            'node_count' => $data['node_count'] ?? 0,
            'version' => ($model->version ?? 0) + 1,
            'last_saved_at' => now(),
        ];

        if ($model) {
            $model->update($payload);
        } else {
            $model = CadModel::create($payload);
        }

        return response()->json([
            'ok' => true,
            'id' => $model->id,
            'name' => $model->name,
            'version' => $model->version,
            'last_saved_at' => $model->last_saved_at,
        ]);
    }

    /** Último modelo del usuario (para ofrecer recuperación al abrir la app). */
    public function latest(Request $request)
    {
        $model = CadModel::where('user_id', $request->user()->id)
            ->latest('updated_at')
            ->first();

        if (! $model) {
            return response()->json(['exists' => false]);
        }

        return response()->json([
            'exists' => true,
            'id' => $model->id,
            'name' => $model->name,
            'data' => $model->data,
            'is_compressed' => $model->is_compressed,
            'node_count' => $model->node_count,
            'version' => $model->version,
            'last_saved_at' => $model->last_saved_at,
        ]);
    }
}
