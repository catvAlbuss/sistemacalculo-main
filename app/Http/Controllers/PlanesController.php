<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Services\Culqi;
use Illuminate\Http\Request;

class PlanesController extends Controller
{
    public function index()
    {
        return response()->view('landing.planes', [
            'plans' => Subscription::active()->ordered()->get(),
        ])->header('Cache-Control', 'private, no-store');
    }

    public function register(Request $request, Culqi $culqi)
    {
        $id = $request->old('subscription_plan_id', $request->query('plan'));
        if (!$id) {
            return redirect()->route('landing.plans');
        }
        abort_unless(is_scalar($id) && ctype_digit((string) $id), 404);
        $plan = Subscription::active()->findOrFail($id);
        if ($plan->isLifetime()) {
            return redirect()->route($request->user() ? 'account.support' : 'contacto.index',['plan'=>'por-vida'])
                ->with('success', 'Plan de por vida: contáctenos. Solo root o gerencia definen el importe de tu propuesta.');
        }
        if (!$plan->isFree() && $request->user()?->hasPermanentCoverage()) {
            return redirect()->route('plans.mine')->with('success', 'Tu acceso es permanente y no necesita renovación. Para modificarlo, contacta con soporte.');
        }
        $request->validate(['currency' => 'sometimes|in:PEN,USD', 'purchase_mode' => 'sometimes|in:renew,upgrade']);
        $currency = $request->old('currency', $request->query('currency', 'PEN'));
        $mode = $request->old('purchase_mode', $request->query('purchase_mode', 'renew'));
        $currency = is_string($currency) && in_array($currency, ['PEN', 'USD'], true) ? $currency : 'PEN';
        $mode = is_string($mode) && in_array($mode, ['renew', 'upgrade'], true) ? $mode : 'renew';
        $requiresPayment = !$plan->isFree() && !$plan->isLifetime();
        if (!$requiresPayment) { $currency = 'PEN'; $mode = 'renew'; }
        if ($plan->isFree() && $request->user() && $request->user()->subscriptions()->exists()) {
            return redirect()->route('plans.mine')->withErrors(['subscription_plan_id' => 'La prueba es única por cuenta y dura 5 días. Para continuar, elige un plan pagado.']);
        }
        $exchangeRate = \App\Models\ExchangeRate::current();
        if ($currency === 'USD' && !$exchangeRate) {
            return redirect()->route('planes.register', ['plan' => $plan->id])->withErrors(['currency' => 'No hay un tipo de cambio vigente. Puedes continuar en soles.']);
        }
        $months = max(1, min(12, (int) $request->old('months', 1)));
        $pricing = app(\App\Services\PlanPricing::class);
        $pricingOptions = [];
        $lastError = null;
        foreach (array_keys($pricing->options($plan, $months)) as $option) {
            $periods = [];
            foreach ($option === 'monthly' && $plan->type === 'monthly' ? range(1, 12) : [1] as $count) {
                try {
                    $quote = $pricing->purchaseQuote($plan, $option, $count, $currency, $request->user(), $mode);
                    if ($mode === 'upgrade' && $quote['charge_amount'] < 3) { continue; }
                    $periods[$count] = $quote;
                } catch (\Illuminate\Validation\ValidationException $e) { $lastError = $e->errors(); }
            }
            if ($periods) {
                $pricingOptions[$option] = $periods[$months] ?? reset($periods);
                if ($option === 'monthly' && $plan->type === 'monthly') {
                    $pricingOptions[$option]['periods'] = $periods;
                }
            }
        }
        if (!$pricingOptions) {
            return redirect()->route($mode === 'upgrade' ? 'plans.mine' : (auth()->check() ? 'plans.catalog' : 'landing.plans'))
                ->withErrors($lastError ?? ['purchase_mode' => 'Selecciona un período mayor para conservar tu saldo.']);
        }
        $customer = $request->user() ? \App\Models\PaymentRequest::where('user_id', $request->user()->id)->latest('id')->first() : null;
        $cycle = $request->old('billing_cycle', $request->query('cycle', array_key_first($pricingOptions)));
        $cycle = is_string($cycle) && isset($pricingOptions[$cycle]) ? $cycle : array_key_first($pricingOptions);
        $totals = $pricingOptions[$cycle];
        if ($cycle === 'monthly') { $months = $totals['months']; }
        $canUpgrade = $request->user()?->currentSubscription?->amount_paid > 0
            && app(\App\Services\PlanChanges::class)->monthlyPrice($plan) > app(\App\Services\PlanChanges::class)->monthlyPrice($request->user()->currentSubscription->plan);
        $culqiEnabled = $culqi->enabled() && $totals['charge_amount'] >= 3;
        $lookupEnabled = app(\App\Services\DocumentLookup::class)->enabled();
        $checkoutKey = $request->old('checkout_key', (string) \Illuminate\Support\Str::uuid());
        $ubigeos = \App\Models\Ubigeo::orderBy('departamento')->orderBy('provincia')->orderBy('distrito')->get();
        return response()->view('landing.planes-registro', compact('plan', 'requiresPayment', 'culqiEnabled', 'totals', 'lookupEnabled', 'checkoutKey', 'pricingOptions', 'cycle', 'months', 'customer', 'ubigeos', 'currency', 'mode', 'exchangeRate', 'canUpgrade'))
            ->header('Cache-Control', 'private, no-store');
    }

    public function store(Request $request)
    {
        return app(ContactPaymentController::class)->store($request);
    }
}
