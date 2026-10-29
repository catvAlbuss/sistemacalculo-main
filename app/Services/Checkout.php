<?php

namespace App\Services;

use App\Models\PaymentRequest;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class Checkout
{
    public function create(Request $request, Subscription $plan, array $billing): PaymentRequest
    {
        if ($plan->isLifetime()) {
            throw ValidationException::withMessages(['subscription_plan_id' => 'El plan de por vida requiere una propuesta creada por root o gerencia. Contáctenos.']);
        }
        $quote = app(PlanPricing::class)->purchaseQuote($plan, $request->input('billing_cycle'), (int) $request->input('months', 1),
            $request->input('currency', 'PEN'), $request->user(), $request->input('purchase_mode', 'renew'));
        if ($request->input('checkout_form_version') === '5' && !hash_equals($quote['pricing_key'], (string) $request->input('pricing_key'))) {
            throw ValidationException::withMessages(['pricing_key' => 'La cotización cambió. Revisa el resumen antes de continuar.']);
        }
        $intent = $request->input('checkout_key') ?: 'legacy:'.$request->session()->getId().':'.$plan->id.':'.$request->email;
        // A form's random intent survives session renewal and network retries; authenticated ownership is checked below.
        $key = hash_hmac('sha256', $intent, config('app.key'));
        $fingerprint = hash('sha256', json_encode([
            $request->name, $request->email, $request->phone, $plan->id, $quote, $billing,
        ], JSON_THROW_ON_ERROR));
        $lock = Cache::lock('checkout:email:'.hash('sha256', $request->email), 30);
        if (!$lock->get()) {
            throw ValidationException::withMessages(['email' => 'Estamos guardando tu solicitud. Espera un momento y vuelve a intentarlo.']);
        }
        try {
            return DB::transaction(function () use ($request, $plan, $billing, $key, $fingerprint, $quote) {
                $existing = PaymentRequest::where('checkout_key', $key)->lockForUpdate()->first();
                if ($existing) {
                    if (!hash_equals($existing->checkout_payload_hash, $fingerprint)
                        || ($request->user() && $existing->user_id !== $request->user()->id)) {
                        throw ValidationException::withMessages(['checkout_key' => 'Este intento ya fue registrado con otros datos. Vuelve a seleccionar tu plan.']);
                    }

                    return $existing;
                }
                $user = User::where('email', $request->email)->lockForUpdate()->first();
                if (($user && (!$request->user() || $request->user()->id !== $user->id))
                    || ($request->user() && strtolower($request->user()->email) !== $request->email)) {
                    throw ValidationException::withMessages(['email' => 'Inicia sesión con la cuenta de ese correo para contratar o renovar su plan.']);
                }
                if ($user && !$user->is_active) {
                    throw ValidationException::withMessages(['email' => 'Tu cuenta está suspendida. Contacta con soporte antes de comprar otro plan.']);
                }
                if ($user && !$plan->isFree() && $user->hasPermanentCoverage()) {
                    throw ValidationException::withMessages(['subscription_plan_id' => 'Ya tienes cobertura permanente. Contacta con soporte antes de contratar otro plan.']);
                }
                if ($user && $plan->isFree()) {
                    app(TrialAccess::class)->ensureEligible($user);
                }
                $password = null;
                if (!$user) {
                    $password = Str::random(24);
                    $user = User::create(['name' => $request->name, 'email' => $request->email,
                        'password' => Hash::make($password), 'is_active' => true]);
                    $user->assignRole('cliente');
                }
                if ($plan->isFree()) {
                    app(TrialAccess::class)->activate($user, $plan);
                }
                $totals = $quote;
                $legal = in_array($request->input('checkout_form_version'), ['4', '5'], true) && $request->boolean('accept_terms')
                    ? ['legal_acceptance' => app(LegalDocuments::class)->acceptance()] : [];
                $phone = preg_replace('/\D/', '', $request->phone);
                $phone = strlen($phone) === 11 && str_starts_with($phone, '51') ? $phone : '51'.$phone;
                $payment = PaymentRequest::create(array_merge([
                    'user_id' => $user->id, 'subscription_plan_id' => $plan->id,
                    'name' => $request->name, 'email' => $request->email, 'phone' => '+'.$phone,
                    'amount' => $quote['total'], 'subtotal' => $totals['subtotal'], 'tax_rate' => $totals['tax_rate'], 'tax_amount' => $totals['tax_amount'],
                    'currency' => $quote['currency'], 'charge_amount' => $quote['charge_amount'],
                    'exchange_rate' => $quote['exchange_rate'], 'exchange_rate_date' => $quote['exchange_rate_date'],
                    'status' => $plan->isFree() ? 'approved' : 'pending',
                    'confirmed_at' => $plan->isFree() ? now() : null,
                    'token' => Str::random(32), 'payment_proof' => null, 'message' => null,
                    'payment_method' => $plan->isFree() ? 'free' : ($plan->isLifetime() ? 'quote' : 'culqi'),
                    'checkout_key' => $key, 'checkout_payload_hash' => $fingerprint,
                    'plan_snapshot' => array_merge($quote, $legal, ['name' => $plan->name,
                        'type' => $quote['billing_cycle'] === 'yearly' ? 'yearly' : $plan->type]),
                ], $billing));
                app(PaymentTasks::class)->create('signup_client', $payment, ['new_account' => $password !== null]);
                app(PaymentTasks::class)->create('signup_admin', $payment);
                \App\Models\PaymentEvent::record($payment, 'registered');
                if ($plan->isFree()) {
                    \App\Models\PaymentEvent::record($payment, 'trial_activated');
                }
                if ($request->boolean('accept_terms')) {
                    \App\Models\PaymentEvent::record($payment, 'terms_accepted_v1');
                    if ($legal) {
                        \App\Models\PaymentEvent::record($payment, 'legal_accepted', config('legal.version'));
                    }
                }

                return $payment;
            });
        } finally {
            $lock->release();
        }
    }
}
