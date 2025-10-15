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
        $suscripciones = Subscription::withCount('activeSubscriptions')
            ->orderBy('sort_order')
            ->get()
            ->map(function ($suscripcion) {
                return [
                    'id' => $suscripcion->id,
                    'name' => $suscripcion->name,
                    'slug' => $suscripcion->slug,
                    'description' => $suscripcion->description,
                    'price' => $suscripcion->price,
                    'duration_days' => $suscripcion->duration_days,
                    'type' => $suscripcion->type,
                    'is_active' => $suscripcion->is_active,
                    'features' => $suscripcion->features ?? [],
                    'sort_order' => $suscripcion->sort_order,
                    'active_subscriptions_count' => $suscripcion->active_subscriptions_count,
                    'is_lifetime' => $suscripcion->type === 'lifetime',
                    'formatted_price' => $suscripcion->price == 0 ? 'Gratis' : 'S/ ' . number_format($suscripcion->price, 2, '.', ''),
                    'duration_text' => match ($suscripcion->type) {
                        'lifetime' => 'De por vida',
                        'trial' => '10 días',
                        'monthly' => '1 mes',
                        'yearly' => '1 año',
                        default => $suscripcion->duration_days . ' días'
                    },
                ];
            })
            ->values()
            ->toArray();

        return view('planesUser.subscription-plans.index', compact('suscripciones'));
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
