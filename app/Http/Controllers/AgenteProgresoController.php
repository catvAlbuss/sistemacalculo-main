<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;

/**
 * Tablero de progreso del agente (NovaCad y Análisis Estructural): muestra las métricas internas que
 * deja scripts/agente/progreso.mjs (storage/app/private/agente/progreso.json) y la revisión contra
 * la norma (norma.json), junto a la NOTA DEL INGENIERO, que es la referencia real de calidad y se
 * registra aquí (progreso-notas.json). Todo en almacenamiento privado.
 */
class AgenteProgresoController extends Controller
{
    private function leer(string $archivo): ?array
    {
        $disco = Storage::disk('local');

        return $disco->exists($archivo) ? json_decode($disco->get($archivo), true) : null;
    }

    public function index(): View
    {
        return view('agente.progreso', [
            'progreso' => $this->leer('agente/progreso.json'),
            'norma' => $this->leer('agente/norma.json'),
            'notas' => $this->leer('agente/progreso-notas.json')['notas'] ?? [],
        ]);
    }

    public function guardarNota(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'nota' => 'required|integer|min:0|max:100',
            'modulo' => 'required|in:novacad,analisis',
            'comentario' => 'nullable|string|max:500',
        ]);
        $notas = $this->leer('agente/progreso-notas.json')['notas'] ?? [];
        $notas[] = $data + ['fecha' => now()->toDateString(), 'usuario' => $request->user()->id];
        Storage::disk('local')->put('agente/progreso-notas.json', json_encode(['notas' => array_slice($notas, -200)], JSON_UNESCAPED_UNICODE));

        return redirect()->route('software.etabs.agente.progreso')->with('status', 'Nota del ingeniero registrada.');
    }
}
