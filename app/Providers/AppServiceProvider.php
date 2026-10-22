<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \Illuminate\Support\Facades\RateLimiter::for('culqi-charge', function (\Illuminate\Http\Request $request) {
            $payment = $request->route('paymentRequest');
            $id = is_object($payment) ? $payment->id : (string) $payment;

            return \Illuminate\Cache\RateLimiting\Limit::perMinutes(10, 8)->by('culqi:'.$id.':'.$request->ip());
        });
    }
}
