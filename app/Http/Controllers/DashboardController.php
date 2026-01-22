<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    // Días de gracia para planes de pago antes de alertar
    protected const ALERT_DAYS = 3;

    public function index(Request $request)
    {
        $user = $request->user();
        $subscription = $user->activeSubscription; // Asume la relación existe

        // --- 1. Lógica de Restricción de Acceso (Plan Inactivo/Expirado) ---

        // Si no tiene suscripción activa O la suscripción ha expirado
        if (!$subscription || ($subscription->ends_at && Carbon::parse($subscription->ends_at)->isPast())) {

            // Si el usuario ya está autenticado y su plan expiró, lo cerramos
            // y lo redirigimos con un mensaje de error.

            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect('/login')->with('error', 'Tu plan ha expirado o no tienes una suscripción activa. Por favor, revisa tu cuenta.');
        }

        // --- 2. Lógica de Alerta para Dashboard (Solo si tiene acceso) ---
        $alert = $this->getSubscriptionAlert($user, $subscription);

        return view('dashboard', [
            'alert' => $alert,
        ]);
    }

    /**
     * Determina el tipo de alerta de suscripción para mostrar en el Dashboard.
     * @param \App\Models\User $user
     * @param mixed $subscription
     * @return array|null
     */
    protected function getSubscriptionAlert($user, $subscription)
    {
        $planName = $subscription->plan->name ?? 'Plan Desconocido';
        $planType = $subscription->plan->type ?? 'trial'; // 'monthly', 'annual', 'lifetime', 'trial'
        $endsAt = optional($subscription)->ends_at ? Carbon::parse($subscription->ends_at) : null;
        $now = Carbon::now();

        if ($endsAt) {
            $diffInDays = $now->diffInDays($endsAt, false);

            // Caso 1: Periodo de Prueba
            if ($planType === 'trial') {
                if ($diffInDays <= 0) {
                    return [
                        'type' => 'danger',
                        'message' => 'Tu periodo de prueba ha expirado. ¡Actualiza tu plan para seguir usando R&AIE!',
                    ];
                }

                $baseMessage = "Estás disfrutando de tu Período de Prueba (Plan: <strong>{$planName}</strong>). Tendrás acceso completo hasta el {$endsAt->format('d/m/Y')}. Si decides adquirir un plan, este se activará en un plazo de 24 a 48 horas.";

                return [
                    'type' => $diffInDays <= self::ALERT_DAYS ? 'warning' : 'info',
                    'message' => $baseMessage,
                    'show_button' => true, // 👈 Indicamos que debe mostrar el botón
                ];
            }


            // Caso 2: Plan Mensual o Anual (Restante)
            //if (in_array($planType, ['monthly', 'annual'])) {
            if ($planType === 'monthly') {
                if ($diffInDays <= self::ALERT_DAYS) {
                    return [
                        'type' => 'warning',
                        'message' => "¡Alerta! Tu plan de pago (**{$planName}**) expira en **$diffInDays días**. Renueva tu suscripción para continuar sin interrupciones.",
                    ];
                }
            }
        }

        // Caso 3: Plan de por Vida
        //if ($planType === 'lifetime') {
        if ($planType === 'lifetime') {
            return [
                'type' => 'success',
                'message' => '¡Felicidades! Tienes un **Plan de por Vida**. Disfruta de acceso ilimitado.',
            ];
        }

        return null; // No hay alerta crítica
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
    public function destroy(string $id)
    {
        //
    }
}
