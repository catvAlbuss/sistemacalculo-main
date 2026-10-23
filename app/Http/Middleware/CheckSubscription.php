<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSubscription
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $json = $request->expectsJson() || $request->isJson() || $request->is('api/*');
        if (!$user) {
            return $json ? response()->json(['message' => 'Inicia sesión para continuar.'], 401)
                : redirect()->guest(route('login'));
        }
        if ($user->is_active && ($user->hasRole(['root', 'gerencia']) || $user->hasActiveSubscription())) {
            return $next($request);
        }
        $message = $user->is_active
            ? 'Tu acceso ha vencido. La prueba dura 15 días; para continuar con el software debes contratar un plan pagado.'
            : 'Tu cuenta está suspendida. Contacta con soporte.';
        if ($json) {
            return response()->json(['message' => $message, 'code' => 'subscription_required', 'renewal_url' => route('plans.mine')], 403);
        }
        return redirect()->route('plans.mine')->with('subscription_notice', $message);
    }
}
