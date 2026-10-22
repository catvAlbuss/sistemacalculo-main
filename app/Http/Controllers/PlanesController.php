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
        $months = max(1, min(12, (int) $request->old('months', 1)));
        $pricingOptions = app(\App\Services\PlanPricing::class)->options($plan, $months);
        if ($plan->type === 'monthly' && !$plan->isFree()) {
            $pricingOptions['monthly']['periods'] = collect(range(1, 12))->mapWithKeys(fn ($count) => [
                $count => app(\App\Services\PlanPricing::class)->quote($plan, 'monthly', $count),
            ])->all();
        }
        $customer = $request->user() ? \App\Models\PaymentRequest::where('user_id', $request->user()->id)->latest('id')->first() : null;
        $cycle = $request->old('billing_cycle', $request->query('cycle', array_key_first($pricingOptions)));
        $cycle = is_string($cycle) && isset($pricingOptions[$cycle]) ? $cycle : array_key_first($pricingOptions);
        $requiresPayment = !$plan->isFree() && !$plan->isLifetime();
        $totals = $pricingOptions[$cycle];
        $culqiEnabled = $culqi->enabled() && $totals['total'] >= 3;
        $lookupEnabled = app(\App\Services\DocumentLookup::class)->enabled();
        $checkoutKey = $request->old('checkout_key', (string) \Illuminate\Support\Str::uuid());
        $ubigeos = \App\Models\Ubigeo::orderBy('departamento')->orderBy('provincia')->orderBy('distrito')->get();
        return response()->view('landing.planes-registro', compact('plan', 'requiresPayment', 'culqiEnabled', 'totals', 'lookupEnabled', 'checkoutKey', 'pricingOptions', 'cycle', 'months', 'customer', 'ubigeos'))
            ->header('Cache-Control', 'private, no-store');
    }

    public function store(Request $request)
    {
        return app(ContactPaymentController::class)->store($request);
    }
}
