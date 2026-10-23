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

        return response()->view('planesUser.my-plan', [
            'user' => $user,
            'permanent' => $permanent,
            'current' => $user->currentSubscription()->first(),
            'subscriptions' => $user->subscriptions()->with('plan')->orderByDesc('starts_at')->limit(30)->get(),
            'payments' => PaymentRequest::with('plan', 'receipt')->where('user_id', $user->id)->where('payment_method', 'culqi')->latest()->paginate(15),
            'plans' => $permanent ? collect() : Subscription::active()->where('price', '>', 0)->where('type', '!=', 'lifetime')->ordered()->get(),
        ])->header('Cache-Control', 'private, no-store');
    }
}
