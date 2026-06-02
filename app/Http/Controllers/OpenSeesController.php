<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenSeesController extends Controller
{
    public function analyze(Request $request)
    {
        // Validar datos de entrada
        $validated = $request->validate([
            'nodes' => 'required|array',
            'elements' => 'required|array',
            'supports' => 'array',
            'loads' => 'array'
        ]);

        // Preparar datos para Python
        $modelData = [
            'nodes' => $this->prepareNodes($request->nodes),
            'elements' => $this->prepareElements($request->elements),
            'supports' => $this->prepareSupports($request->nodes),
            'loads' => $this->prepareLoads($request->nodes)
        ];

        try {
            // Llamar al servicio Python
            $response = Http::timeout(30)->post('http://localhost:5001/api/analyze', $modelData);
            
            if ($response->successful()) {
                return response()->json($response->json());
            }
            
            return response()->json([
                'success' => false,
                'error' => 'Error en el servicio de cálculo'
            ], 500);
            
        } catch (\Exception $e) {
            Log::error('OpenSeesPy error: ' . $e->getMessage());
            
            // Fallback: usar Octave si OpenSeesPy no está disponible
            return $this->fallbackToOctave($request);
        }
    }

    /**
     * Preparar datos de nodos para OpenSees
     */
    private function prepareNodes($nodes)
    {
        $prepared = [];
        foreach ($nodes as $index => $node) {
            // El frontend puede enviar 'x','y' directamente o dentro de 'position'
            $x = $node['x'] ?? $node['position']['x'] ?? 0;
            $y = $node['y'] ?? $node['position']['y'] ?? 0;
            
            $prepared[] = [
                'id' => $index + 1,
                'x' => $x,
                'y' => $y
            ];
        }
        return $prepared;
    }


    /**
     * Preparar elementos para OpenSees
     */
    private function prepareElements($elements)
    {
        return collect($elements)->map(function($element, $index) {
            return [
                'id' => $index + 1,
                'node_i' => $element['node_i'],
                'node_j' => $element['node_j'],
                'area' => $element['area'] ?? 0.01,
                'E' => $element['E'] ?? 200e9
            ];
        })->values()->toArray();
    }

    /**
     * Preparar condiciones de soporte
     */
    private function prepareSupports($supports)
    {
        $prepared = [];
        foreach ($supports as $index => $support) {
            $prepared[] = [
                'node' => $index + 1,
                'ux' => $support['ux'] ?? 0,
                'uy' => $support['uy'] ?? 1,
                'rz' => $support['rz'] ?? 1
            ];
        }
        return $prepared;
    }
    /**
     * Preparar cargas
     */
    private function prepareLoads($loads)
    {
        $prepared = [];
        foreach ($loads as $index => $load) {
            $prepared[] = [
                'node' => $index + 1,
                'fx' => $load['fx'] ?? 0,
                'fy' => $load['fy'] ?? 0,
                'mz' => $load['mz'] ?? 0
            ];
        }
        return $prepared;
    }

    /**
     * Fallback al método original con Octave
     */
    private function fallbackToOctave($request)
    {
        $octaveController = new OctavePlotController();
        return $octaveController->calcularFuerzasArmaduras($request);
    }
}
