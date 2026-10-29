<?php

namespace App\Http\Controllers;

use App\Models\PaymentRequest;
use App\Models\Subscription;
use Illuminate\Http\Request;

class MyPlanController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();
        $permanent = $user->hasPermanentCoverage();
        $plans = $permanent ? collect() : Subscription::active()->where('price', '>', 0)->where('type', '!=', 'lifetime')->ordered()->get();
        $renewalQuotes = $plans->mapWithKeys(function ($plan) use ($user) {
            try {
                return [$plan->id => app(\App\Services\PlanPricing::class)->purchaseQuote($plan, null, 1, 'PEN', $user)];
            } catch (\Illuminate\Validation\ValidationException $exception) {
                return [$plan->id => ['unavailable' => $exception->validator->errors()->first()]];
            }
        });

        return response()->view('planesUser.my-plan', [
            'user' => $user,
            'permanent' => $permanent,
            'current' => $user->currentSubscription()->first(),
            'subscriptions' => $user->subscriptions()->with('plan')->orderByDesc('starts_at')->limit(30)->get(),
            'payments' => PaymentRequest::with('plan', 'receipt')->where('user_id', $user->id)->where('payment_method', 'culqi')->latest()->paginate(15),
            'plans' => $plans,
            'renewalQuotes' => $renewalQuotes,
        ])->header('Cache-Control', 'private, no-store');
    }
}
