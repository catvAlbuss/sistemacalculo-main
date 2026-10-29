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
use Spatie\Permission\Models\Permission;

class GestionUserRolSuscripcion extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $roleRank = DB::table('model_has_roles as assigned')->join('roles', 'roles.id', '=', 'assigned.role_id')
            ->whereColumn('assigned.model_id', 'users.id')->where('assigned.model_type', (new User)->getMorphClass())
            ->selectRaw("MIN(CASE roles.name WHEN 'root' THEN 0 WHEN 'gerencia' THEN 1 WHEN 'asistente' THEN 2 WHEN 'cliente' THEN 3 ELSE 999 END)");
        $users = User::select('users.*')->selectSub($roleRank, 'role_rank')->where('account_status', '!=', 'deleted')->withCount('accountSessions')
            ->with(['roles', 'permissions', 'currentSubscription.plan', 'subscriptions' => fn ($q) => $q->with('plan')->latest('starts_at')->limit(20)])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderByRaw('COALESCE(role_rank, 999)')->orderByRaw("CASE WHEN account_status = 'enabled' THEN 0 ELSE 1 END")->orderBy('name')
            ->paginate(10)->withQueryString();

        $roles = Role::where('guard_name', 'web')->get()->sortBy(fn ($role) => \App\Services\RoleHierarchy::rank($role->name))->values();
        $plans = Subscription::active()->ordered()->get();
        $userDetails = $users->mapWithKeys(function ($user) {
            $history = $user->subscriptions->map(fn ($sub) => [
                'id' => $sub->id, 'plan' => ['name' => $sub->plan->name], 'status' => $sub->status,
                'starts_at' => $sub->starts_at->format('d/m/Y'), 'ends_at' => $sub->accessEndsAt()?->format('d/m/Y'),
                'payment_method' => $sub->payment_method, 'amount_paid' => $sub->amount_paid,
                'label' => $sub->status === 'active' ? ($sub->starts_at->isFuture() ? 'Programado' : ($sub->isActive() ? 'Vigente' : 'Vencido')) : (['suspended' => 'Suspendido', 'cancelled' => 'Cancelado'][$sub->status] ?? $sub->status),
            ]);
            $selected = $history->firstWhere('label', 'Vigente') ?? $history->firstWhere('status', 'suspended') ?? $history->first();
            return [$user->id => array_merge($user->only('id', 'name', 'email', 'account_status'), [
                'roles' => $user->roles->map->only('name')->values(), 'permissions' => $user->permissions->map->only('name')->values(),
                'current_subscription' => $selected, 'history' => $history->values(), 'protected_root' => $user->hasRole('root'),
            ])];
        });

        return view('planesUser.usersus.index', [
            'users' => $users,
            'roles' => $roles,
            'plans' => $plans,
            'userDetails' => $userDetails,
            'summary' => [
                'total' => User::where('account_status', '!=', 'deleted')->count(),
                'covered' => User::whereHas('currentSubscription')->where('account_status', 'enabled')->count(),
                'restricted' => User::whereIn('account_status', ['blocked', 'banned'])->count(),
            ],
            'securityEvents' => \App\Models\AccountSecurityEvent::with('user')->latest('id')->limit(8)->get(),
            'permissions' => Permission::where('guard_name', 'web')->orderBy('name')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorizeRoles($request);
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::min(8)],
            'roles' => 'required|array|min:1',
            'roles.*' => ['string', Rule::exists('roles', 'name')->where('guard_name', 'web')],
            'permissions' => 'sometimes|array',
            'permissions.*' => ['string', Rule::exists('permissions', 'name')->where('guard_name', 'web')],
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
                    'is_active' => true,
                ]);

                $user->syncRoles($request->roles);
                if ($request->has('permissions_present')) {
                    $user->syncPermissions($request->input('permissions', []));
                }

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
        $this->authorizeTarget($planUser);
        $this->authorizeRoles($request);
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($planUser->id)],
            'password' => ['nullable', 'confirmed', Password::min(8)],
            'roles' => 'required|array|min:1',
            'roles.*' => ['string', Rule::exists('roles', 'name')->where('guard_name', 'web')],
            'permissions' => 'sometimes|array',
            'permissions.*' => ['string', Rule::exists('permissions', 'name')->where('guard_name', 'web')],
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
                    $locked = User::whereKey($planUser->id)->lockForUpdate()->firstOrFail();
                    app(\App\Services\AccountAccess::class)->revoke($locked);
                }

                if ($planUser->email !== $data['email']) {
                    $planUser->email_verified_at = null;
                }

                $planUser->update($data);
                $roles = $request->roles;
                if ($planUser->hasRole('root')) { $roles = array_values(array_unique([...$roles, 'root'])); }
                $planUser->syncRoles($roles);
                if ($request->has('permissions_present')) {
                    $planUser->syncPermissions($request->input('permissions', []));
                }

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
        $this->authorizeTarget($planUser, true);
        try {
            // Verificar que no sea el usuario autenticado
            if (auth()->id() === $planUser->id) {
                return redirect()->back()
                    ->with('error', 'No puedes eliminar tu propia cuenta.');
            }

            DB::transaction(function () use ($planUser) {
                // Cancelar suscripciones activas
                $planUser->subscriptions()->whereIn('status', ['active','suspended'])->update([
                    'status' => 'cancelled',
                    'cancelled_at' => now(),
                ]);

                // Preserve invoices, payments and the email restriction; remove access instead of cascading financial records.
                $locked = User::whereKey($planUser->id)->lockForUpdate()->firstOrFail();
                $locked->forceFill(['account_status' => 'deleted', 'account_status_reason' => 'Baja administrativa', 'is_active' => false])->save();
                app(\App\Services\AccountAccess::class)->revoke($locked);
                app(\App\Services\AccountAccess::class)->record($locked, 'deleted', 'Cuenta dada de baja por administración. Historial financiero conservado.', auth()->id());

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
        $this->authorizeTarget($planUser);
        $request->validate([
            'subscription_plan_id' => ['required', Rule::exists('subscriptions', 'id')->where('is_active', true)],
            'ends_at' => 'nullable|date|after:today',
            'assignment_mode' => 'sometimes|in:replace,renew',
            'notes' => 'nullable|string|max:1000',
        ], [
            'subscription_plan_id.required' => 'Debe seleccionar un plan.',
            'subscription_plan_id.exists' => 'El plan seleccionado no existe.',
            'ends_at.after' => 'La fecha de finalización debe ser posterior a hoy.',
        ]);

        try {
            DB::transaction(function () use ($request, $planUser) {
                $planUser = User::whereKey($planUser->id)->lockForUpdate()->firstOrFail();
                if ($planUser->account_status !== 'enabled') {
                    throw \Illuminate\Validation\ValidationException::withMessages(['subscription_plan_id' => 'Primero debes habilitar esta cuenta. Asignar un plan no retira un bloqueo.']);
                }
                $plan = Subscription::findOrFail($request->subscription_plan_id);
                if ($plan->isFree()) {
                    app(\App\Services\TrialAccess::class)->ensureEligible($planUser);
                    if ($request->filled('ends_at')) {
                        throw \Illuminate\Validation\ValidationException::withMessages(['ends_at' => 'La prueba gratuita dura exactamente 5 días y no admite una fecha personalizada.']);
                    }
                }
                $startsAt = now();
                $renew = $request->input('assignment_mode', 'replace') === 'renew';
                $coverage = $planUser->subscriptions()->where('status', 'active')->get();
                if ($renew) {
                    foreach ($coverage as $existing) {
                        if (!$existing->accessEndsAt()) {
                            throw \Illuminate\Validation\ValidationException::withMessages(['subscription_plan_id' => 'El usuario ya tiene cobertura permanente.']);
                        }
                        if ($existing->accessEndsAt()->isAfter($startsAt)) { $startsAt = $existing->accessEndsAt()->copy(); }
                    }
                } else {
                    $planUser->subscriptions()->whereIn('status', ['active', 'suspended'])->update([
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
                        $endsAt = $startsAt->copy()->addDays($plan->isFree() ? \App\Services\TrialAccess::DAYS : $plan->duration_days);
                    }
                }
                if ($endsAt && $endsAt->lte($startsAt)) {
                    throw \Illuminate\Validation\ValidationException::withMessages(['ends_at' => 'La finalización debe ser posterior al inicio de la nueva cobertura.']);
                }

                // Crear nueva suscripción
                $newSubscription = UserSubscription::create([
                    'user_id' => $planUser->id,
                    'subscription_plan_id' => $plan->id,
                    'status' => 'active',
                    'starts_at' => $startsAt,
                    'ends_at' => $endsAt,
                    'amount_paid' => 0,
                    'payment_method' => $plan->isFree() ? 'trial' : 'manual',
                    'notes' => 'Asignación administrativa por #'.auth()->id().'. '.($request->notes ?? ''),
                ]);

                // Actualizar usuario
                if (!$startsAt->isFuture()) { $planUser->update([
                    'current_subscription_id' => $newSubscription->id,
                    'subscription_ends_at' => $endsAt,
                    'is_active' => true,
                ]); }
                app(\App\Services\AccountAccess::class)->record($planUser, 'plan_assigned', 'Plan '.$plan->name.' asignado desde '.$startsAt->format('d/m/Y').'. No se registró un cobro Culqi.', auth()->id());

                Log::info('Suscripción asignada exitosamente', [
                    'user_id' => $planUser->id,
                    'subscription_id' => $newSubscription->id,
                    'plan_id' => $plan->id
                ]);
            });

            return redirect()->route('planUser.index')
                ->with('success', 'Plan asignado exitosamente.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
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
        $this->authorizeTarget($subscription->user);
        try {
            DB::transaction(function () use ($subscription) {
                $subscription->cancel();
                app(\App\Services\AccountAccess::class)->record($subscription->user, 'plan_cancelled', 'Cobertura #'.$subscription->id.' cancelada por administración.', auth()->id());

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
        $this->authorizeTarget($subscription->user);
        try {
            DB::transaction(function () use ($subscription) {
                $subscription->suspend();
                app(\App\Services\AccountAccess::class)->record($subscription->user, 'plan_suspended', 'Cobertura #'.$subscription->id.' suspendida por administración.', auth()->id());

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
        $this->authorizeTarget($subscription->user);
        abort_if($subscription->status !== 'suspended', 422, 'Solo se puede reactivar una cobertura suspendida.');
        abort_if($subscription->user->account_status !== 'enabled', 403, 'Primero habilita la cuenta.');
        abort_if($subscription->isExpired() || $subscription->starts_at->isFuture(), 422, 'La cobertura está vencida o todavía no ha comenzado.');
        try {
            DB::transaction(function () use ($subscription) {
                $owner = User::whereKey($subscription->user_id)->lockForUpdate()->firstOrFail();
                $subscription->refresh();
                abort_if($owner->account_status !== 'enabled' || $subscription->status !== 'suspended', 422, 'Revisa el estado de la cuenta y su cobertura.');
                $overlap = $owner->subscriptions()->where('status', 'active')->where('id', '!=', $subscription->id)->get()
                    ->contains(fn ($other) => (!$subscription->accessEndsAt() || $other->starts_at->lt($subscription->accessEndsAt()))
                        && (!$other->accessEndsAt() || $other->accessEndsAt()->gt($subscription->starts_at)));
                if ($overlap) {
                    throw \Illuminate\Validation\ValidationException::withMessages(['subscription_plan_id' => 'Ya existe una cobertura activa para ese período. Revisa el historial o usa la asignación de reemplazo.']);
                }
                $subscription->reactivate();
                app(\App\Services\AccountAccess::class)->record($subscription->user, 'plan_reactivated', 'Cobertura #'.$subscription->id.' reactivada por administración.', auth()->id());

                Log::info('Suscripción reactivada exitosamente', [
                    'subscription_id' => $subscription->id,
                    'user_id' => $subscription->user_id
                ]);
            });

            return redirect()->route('planUser.index')
                ->with('success', 'Suscripción reactivada exitosamente.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
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
        $this->authorizeTarget($subscription->user);
        abort_if($subscription->payment_method === 'trial', 422, 'La prueba gratuita no puede extenderse.');
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
                app(\App\Services\AccountAccess::class)->record($subscription->user, 'plan_extended', 'Cobertura #'.$subscription->id.' extendida '.$request->days.' días por administración.', auth()->id());

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

    public function accountStatus(Request $request, User $planUser)
    {
        $this->authorizeTarget($planUser, true);
        $data = $request->validate(['status' => 'required|in:enabled,blocked,banned', 'reason' => 'required|string|min:5|max:1000']);
        DB::transaction(function () use ($data, $planUser) {
            $user = User::whereKey($planUser->id)->lockForUpdate()->firstOrFail();
            abort_if($user->account_status === 'deleted', 422, 'La cuenta ya fue dada de baja.');
            $user->forceFill(['account_status' => $data['status'], 'account_status_reason' => $data['reason'], 'is_active' => $data['status'] === 'enabled'])->save();
            app(\App\Services\AccountAccess::class)->revoke($user);
            app(\App\Services\AccountAccess::class)->record($user, $data['status'], $data['reason'], auth()->id());
        });
        return back()->with('success', 'Estado de la cuenta actualizado. Sus sesiones se cerraron; el historial de pagos se conserva.');
    }

    private function authorizeTarget(User $user, bool $destructive = false): void
    {
        abort_unless(auth()->user()?->canManageUsers(), 403);
        abort_if($user->hasRole('root') && !auth()->user()->hasRole('root'), 403);
        abort_if($destructive && auth()->id() === $user->id, 403, 'No puedes bloquear ni dar de baja tu propia cuenta.');
    }

    private function authorizeRoles(Request $request): void
    {
        abort_unless($request->user()?->canManageUsers(), 403);
        abort_if(in_array('root', (array) $request->input('roles', []), true) && !$request->user()->hasRole('root'), 403);
    }
}
