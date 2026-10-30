<?php

namespace App\Http\Controllers;

use App\Models\PaymentRequest;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;


class ContactPaymentController extends Controller
{
    /**
     * Display a listing of the resource.resources/views/landing/contact.blade.php
     */
    public function index()
    {
        return response()
            ->view('landing.contact')
            ->header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    }

    /**
     * Procesar solicitud de suscripción
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255', 'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20', 'subscription_plan_id' => 'required|exists:subscriptions,id',
            'payment_proof' => 'prohibited', 'message' => 'prohibited',
            'payment_method' => 'sometimes|in:culqi', 'checkout_key' => 'sometimes|uuid',
            'billing_cycle' => 'sometimes|in:monthly,yearly',
            'months' => 'sometimes|integer|min:1|max:12',
            'accept_terms' => 'sometimes|accepted',
            'currency' => 'sometimes|in:PEN,USD', 'purchase_mode' => 'sometimes|in:renew,upgrade',
            'pricing_key' => 'sometimes|string|size:64',
        ], [
            'name.required' => 'El nombre o razón social es obligatorio.', 'email.required' => 'El correo es obligatorio.',
            'phone.required' => 'El teléfono es obligatorio.',
            'payment_proof.prohibited' => 'No se reciben comprobantes. Los pagos se realizan en línea con Culqi.',
            'payment_method.in' => 'Los pagos se realizan únicamente con tarjeta o Yape en línea mediante Culqi.',
            'message.prohibited' => 'El formulario no admite mensajes adicionales.',
        ]);
        $request->merge(['email' => strtolower(trim($request->email)), 'name' => trim($request->name)]);
        $digits = preg_replace('/\D/', '', $request->phone);
        if (!preg_match('/^(?:51)?[0-9]{9}$/', $digits)) {
            throw \Illuminate\Validation\ValidationException::withMessages(['phone' => 'Ingresa un teléfono de 9 dígitos, con prefijo +51 opcional.']);
        }
        $plan = Subscription::active()->findOrFail($request->subscription_plan_id);
        if ($plan->isLifetime()) {
            throw \Illuminate\Validation\ValidationException::withMessages(['subscription_plan_id' => 'Plan de por vida: contáctenos. El importe lo define root o gerencia; no admite registro ni activación automática.']);
        }
        $online = !$plan->isFree() && !$plan->isLifetime();
        if (!$online) { $request->merge(['currency' => 'PEN', 'purchase_mode' => 'renew']); }
        $quote = app(\App\Services\PlanPricing::class)->purchaseQuote($plan, $request->input('billing_cycle'), (int) $request->input('months', 1),
            $request->input('currency', 'PEN'), $request->user(), $request->input('purchase_mode', 'renew'));
        if ($request->input('checkout_form_version') === '5' && !hash_equals($quote['pricing_key'], (string) $request->input('pricing_key'))) {
            throw \Illuminate\Validation\ValidationException::withMessages(['pricing_key' => 'La cotización cambió. Revisa el resumen actualizado antes de continuar.']);
        }
        if (in_array($request->input('checkout_form_version'), ['4', '5'], true)
            || ($online && in_array($request->input('checkout_form_version'), ['2', '3'], true))) {
            $request->validate(['accept_terms' => 'required|accepted'], [
                'accept_terms.required' => 'Debes aceptar los Términos y condiciones y la Política de cambios y devoluciones.',
                'accept_terms.accepted' => 'Debes aceptar los Términos y condiciones y la Política de cambios y devoluciones.',
            ]);
        }
        $billing = $online ? app(\App\Services\Billing::class)->validate($request) : [];
        if ($online && (!app(\App\Services\Culqi::class)->enabledFor($request->user()) || $quote['charge_amount'] < 3)) {
            return back()->withInput()->withErrors(['payment_method' => 'El pago en línea no está disponible en este momento.']);
        }
        try {
            $payment = app(\App\Services\Checkout::class)->create($request, $plan, $billing);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Throwable) {
            Log::error('No se pudo registrar una solicitud de pago.');
            return back()->withInput()->with('error', 'No se pudo guardar la solicitud. Espera un momento e intenta nuevamente.');
        }
        app(\App\Services\PaymentTasks::class)->dispatchFor($payment);
        if ($online) {
            return redirect(CulqiController::paymentUrl($payment));
        }
        session()->flash('registration', ['plan' => $plan->name, 'free' => $plan->isFree(),
            'custom' => $plan->isLifetime(), 'duration' => $quote['duration_text']]);

        return redirect()->route('landing.success')->with('success', 'Tu solicitud está registrada. Te enviaremos la información por correo.');
    }


    /**
     * Página de éxito
     */
    public function success()
    {
        return view('landing.success');
    }
}
