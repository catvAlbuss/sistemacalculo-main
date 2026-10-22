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

        return response()->view('planesUser.my-plan', [
            'user' => $user,
            'current' => $user->currentSubscription,
            'subscriptions' => $user->subscriptions()->with('plan')->orderByDesc('starts_at')->limit(30)->get(),
            'payments' => PaymentRequest::with('plan', 'receipt')->where('user_id', $user->id)->latest()->paginate(15),
            'plans' => Subscription::active()->where('price', '>', 0)->where('type', '!=', 'lifetime')->ordered()->get(),
        ])->header('Cache-Control', 'private, no-store');
    }
}
