<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\User;
use App\Models\UserSubscription;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\Models\Role;

class GestionUserRolSuscripcion extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $users = User::withCount('activeSessions')
            ->with(['roles', 'currentSubscription.plan', 'activeSessions'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10);

        $roles = Role::all();
        $plans = Subscription::active()->ordered()->get();

        return view('planesUser.usersus.index', [
            'users' => $users,
            'roles' => $roles,
            'plans' => $plans,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::min(8)],
            'roles' => 'required|array|min:1',
            'roles.*' => 'exists:roles,name',
        ], [
            'name.required' => 'El nombre es obligatorio.',
            'email.required' => 'El email es obligatorio.',
            'email.unique' => 'Este email ya está registrado.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
            'roles.required' => 'Debe seleccionar al menos un rol.',
        ]);

        try {
            DB::transaction(function () use ($request) {
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'is_active' => false,
                ]);

                $user->syncRoles($request->roles);

                Log::info('Usuario creado exitosamente', ['user_id' => $user->id]);
            });

            return redirect()->route('planUser.index')
                ->with('success', 'Usuario creado exitosamente.');
        } catch (\Exception $e) {
            Log::error('Error al crear usuario: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Error al crear el usuario. Por favor, intente nuevamente.')
                ->withInput();
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $planUser)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($planUser->id)],
            'password' => ['nullable', 'confirmed', Password::min(8)],
            'roles' => 'required|array|min:1',
            'roles.*' => 'exists:roles,name',
        ], [
            'name.required' => 'El nombre es obligatorio.',
            'email.required' => 'El email es obligatorio.',
            'email.unique' => 'Este email ya está registrado.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
            'roles.required' => 'Debe seleccionar al menos un rol.',
        ]);

        try {
            DB::transaction(function () use ($request, $planUser) {
                $data = [
                    'name' => $request->name,
                    'email' => $request->email,
                ];

                if ($request->filled('password')) {
                    $data['password'] = Hash::make($request->password);
                }

                $planUser->update($data);
                $planUser->syncRoles($request->roles);

                Log::info('Usuario actualizado exitosamente', [
                    'user_id' => $planUser->id,
                    'updated_fields' => array_keys($data)
                ]);
            });

            return redirect()->route('planUser.index')
                ->with('success', 'Usuario actualizado exitosamente.');
        } catch (\Exception $e) {
            Log::error('Error al actualizar usuario: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Error al actualizar el usuario. Por favor, intente nuevamente.')
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $planUser)
    {
        try {
            // Verificar que no sea el usuario autenticado
            if (auth()->id() === $planUser->id) {
                return redirect()->back()
                    ->with('error', 'No puedes eliminar tu propia cuenta.');
            }

            DB::transaction(function () use ($planUser) {
                // Cancelar suscripciones activas
                $planUser->subscriptions()->where('status', 'active')->update([
                    'status' => 'cancelled',
                    'cancelled_at' => now(),
                ]);

                // Eliminar el usuario
                $planUser->delete();

                Log::info('Usuario eliminado exitosamente', ['user_id' => $planUser->id]);
            });

            return redirect()->route('planUser.index')
                ->with('success', 'Usuario eliminado exitosamente.');
        } catch (\Exception $e) {
            Log::error('Error al eliminar usuario: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Error al eliminar el usuario. Por favor, intente nuevamente.');
        }
    }

    /**
     * Asignar o cambiar suscripción a un usuario
     */
    public function assignSubscription(Request $request, User $planUser)
    {
        $request->validate([
            'subscription_plan_id' => 'required|exists:subscriptions,id',
            'ends_at' => 'nullable|date|after:today',
        ], [
            'subscription_plan_id.required' => 'Debe seleccionar un plan.',
            'subscription_plan_id.exists' => 'El plan seleccionado no existe.',
            'ends_at.after' => 'La fecha de finalización debe ser posterior a hoy.',
        ]);

        try {
            DB::transaction(function () use ($request, $planUser) {
                $plan = Subscription::findOrFail($request->subscription_plan_id);

                // Cancelar suscripción activa anterior si existe
                $currentSubscription = $planUser->subscriptions()
                    ->where('status', 'active')
                    ->first();

                if ($currentSubscription) {
                    $currentSubscription->update([
                        'status' => 'cancelled',
                        'cancelled_at' => now(),
                    ]);
                }

                // Calcular fecha de finalización
                $endsAt = null;
                if (!$plan->isLifetime()) {
                    if ($request->filled('ends_at')) {
                        $endsAt = Carbon::parse($request->ends_at);
                    } else {
                        $endsAt = now()->addDays($plan->duration_days);
                    }
                }

                // Crear nueva suscripción
                $newSubscription = UserSubscription::create([
                    'user_id' => $planUser->id,
                    'subscription_plan_id' => $plan->id,
                    'status' => 'active',
                    'starts_at' => now(),
                    'ends_at' => $endsAt,
                    'amount_paid' => $plan->price,
                    'payment_method' => 'manual',
                ]);

                // Actualizar usuario
                $planUser->update([
                    'current_subscription_id' => $newSubscription->id,
                    'subscription_ends_at' => $endsAt,
                    'is_active' => true,
                ]);

                Log::info('Suscripción asignada exitosamente', [
                    'user_id' => $planUser->id,
                    'subscription_id' => $newSubscription->id,
                    'plan_id' => $plan->id
                ]);
            });

            return redirect()->route('planUser.index')
                ->with('success', 'Plan asignado exitosamente.');
        } catch (\Exception $e) {
            Log::error('Error al asignar suscripción: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Error al asignar el plan. Por favor, intente nuevamente.');
        }
    }

    /**
     * Cancelar (dar de baja) suscripción de un usuario
     */
    public function cancelSubscription(UserSubscription $subscription)
    {
        try {
            DB::transaction(function () use ($subscription) {
                $subscription->cancel();

                Log::info('Suscripción cancelada exitosamente', [
                    'subscription_id' => $subscription->id,
                    'user_id' => $subscription->user_id
                ]);
            });

            return redirect()->route('planUser.index')
                ->with('success', 'Suscripción cancelada exitosamente.');
        } catch (\Exception $e) {
            Log::error('Error al cancelar suscripción: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Error al cancelar la suscripción. Por favor, intente nuevamente.');
        }
    }

    /**
     * Suspender suscripción de un usuario
     */
    public function suspendSubscription(UserSubscription $subscription)
    {
        try {
            DB::transaction(function () use ($subscription) {
                $subscription->suspend();

                Log::info('Suscripción suspendida exitosamente', [
                    'subscription_id' => $subscription->id,
                    'user_id' => $subscription->user_id
                ]);
            });

            return redirect()->route('planUser.index')
                ->with('success', 'Suscripción suspendida exitosamente.');
        } catch (\Exception $e) {
            Log::error('Error al suspender suscripción: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Error al suspender la suscripción. Por favor, intente nuevamente.');
        }
    }

    /**
     * Reactivar suscripción de un usuario
     */
    public function reactivateSubscription(UserSubscription $subscription)
    {
        try {
            DB::transaction(function () use ($subscription) {
                $subscription->reactivate();

                Log::info('Suscripción reactivada exitosamente', [
                    'subscription_id' => $subscription->id,
                    'user_id' => $subscription->user_id
                ]);
            });

            return redirect()->route('planUser.index')
                ->with('success', 'Suscripción reactivada exitosamente.');
        } catch (\Exception $e) {
            Log::error('Error al reactivar suscripción: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Error al reactivar la suscripción. Por favor, intente nuevamente.');
        }
    }

    /**
     * Extender suscripción de un usuario
     */
    public function extendSubscription(Request $request, UserSubscription $subscription)
    {
        $request->validate([
            'days' => 'required|integer|min:1|max:3650',
        ], [
            'days.required' => 'Debe especificar los días a extender.',
            'days.min' => 'Debe ser al menos 1 día.',
            'days.max' => 'No puede extender más de 3650 días (10 años).',
        ]);

        try {
            DB::transaction(function () use ($request, $subscription) {
                $subscription->extend($request->days);

                Log::info('Suscripción extendida exitosamente', [
                    'subscription_id' => $subscription->id,
                    'user_id' => $subscription->user_id,
                    'days_added' => $request->days
                ]);
            });

            return redirect()->route('planUser.index')
                ->with('success', "Suscripción extendida por {$request->days} días exitosamente.");
        } catch (\Exception $e) {
            Log::error('Error al extender suscripción: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Error al extender la suscripción. Por favor, intente nuevamente.');
        }
    }
}
