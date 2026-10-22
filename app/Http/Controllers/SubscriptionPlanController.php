<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use Illuminate\Http\Request;

class SubscriptionPlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return view('planesUser.subscription-plans.manage');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Subscription $suscripcion)
    {
        if ($suscripcion->activeSubscriptions()->count() > 0) {
            return redirect()->back()
                ->withErrors(['error' => 'No se puede eliminar el plan porque tiene suscripciones activas.']);
        }

        $suscripcion->delete();

        return redirect()->route('suscripciones.index')
            ->with('success', 'Plan de suscripción eliminado exitosamente.');
    }

    /**
     * Toggle active status (método adicional)
     */
    public function toggleStatus(Subscription $suscripcion)
    {
        $suscripcion->update(['is_active' => !$suscripcion->is_active]);

        return redirect()->back()
            ->with('success', 'Estado del plan actualizado.');
    }
}
