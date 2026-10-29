<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    // Días de gracia para planes de pago antes de alertar
    protected const ALERT_DAYS = 3;

    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->canManageUsers()) {
            return view('dashboard', $this->dashboardData($user, null));
        }
        $subscription = $user->activeSubscription()->first();

        // --- 1. Lógica de Restricción de Acceso (Plan Inactivo/Expirado) ---

        // Si no tiene suscripción activa O la suscripción ha expirado
        if (!$subscription || ($subscription->ends_at && Carbon::parse($subscription->ends_at)->isPast())) {

            // Keep the owner authenticated so an expired plan can be renewed safely.

            return view('dashboard', $this->dashboardData($user, [
                'type' => 'warning', 'message' => 'Tu cuenta no tiene acceso vigente a los programas. Puedes revisar tus proyectos y respaldos; elige o renueva un plan para usar las herramientas.', 'show_button' => true,
            ]));
        }

        // --- 2. Lógica de Alerta para Dashboard (Solo si tiene acceso) ---
        $alert = $this->getSubscriptionAlert($user, $subscription);

        return view('dashboard', $this->dashboardData($user, $alert));
    }

    private function dashboardData(\App\Models\User $user, ?array $alert): array
    {
        $projectCount = 0;
        foreach (['cad_models', 'memoria_calculos', 'memorias_descriptivas'] as $table) {
            $query = \Illuminate\Support\Facades\DB::table($table)->where('user_id', $user->id);
            if ($table !== 'cad_models') {
                $query->whereNull('cad_model_id');
            }
            $projectCount += $query->count();
        }

        return ['user' => $user, 'alert' => $alert, 'current' => $user->currentSubscription()->first(),
            'isAdmin' => $user->canManageUsers(),
            'canUseTools' => $user->canManageUsers() || $user->hasActiveSubscription(),
            'roleNames' => $user->getRoleNames()->sortBy(fn ($role) => \App\Services\RoleHierarchy::rank($role))->values(),
            'recentModels' => \Illuminate\Support\Facades\DB::table('cad_models')->where('user_id', $user->id)->latest('updated_at')->limit(4)->get(['name','updated_at']),
            'adminMetrics' => $user->canManageUsers() ? [
                'users' => \App\Models\User::where('account_status', '!=', 'deleted')->count(),
                'restricted' => \App\Models\User::whereIn('account_status', ['blocked','banned'])->count(),
                'payments' => \App\Models\PaymentRequest::where('status', 'pending')->where('payment_method','culqi')->count(),
            ] : null,
            'projectCount' => $projectCount,
            'pendingPayments' => \App\Models\PaymentRequest::where('user_id', $user->id)->where('status', 'pending')->count(),
            'lastBackup' => \App\Models\ProjectBackup::where('user_id', $user->id)->latest()->first(),
        ];
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
        $endsAt = $subscription->accessEndsAt();
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

                $baseMessage = "Tu período de prueba ({$planName}) está activo hasta el {$endsAt->format('d/m/Y')}. Si contratas un plan, se activará cuando la pasarela confirme el pago.";

                return [
                    'type' => $diffInDays <= self::ALERT_DAYS ? 'warning' : 'info',
                    'message' => $baseMessage,
                    'show_button' => true, // 👈 Indicamos que debe mostrar el botón
                ];
            }


            // Caso 2: Plan Mensual o Anual (Restante)
            //if (in_array($planType, ['monthly', 'annual'])) {
            if (in_array($planType, ['monthly', 'yearly'], true)) {
                if ($diffInDays <= self::ALERT_DAYS) {
                    return [
                        'type' => 'warning',
                        'message' => "Tu plan {$planName} vence el {$endsAt->format('d/m/Y')}. Revisa tu cobertura y las opciones de renovación.",
                    ];
                }
            }
        }

        // Caso 3: Plan de por Vida
        //if ($planType === 'lifetime') {
        if ($planType === 'lifetime') {
            return [
                'type' => 'success',
                'message' => 'Tu acceso permanente no requiere renovación. Consulta las capacidades incluidas en Mi plan y pagos.',
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
