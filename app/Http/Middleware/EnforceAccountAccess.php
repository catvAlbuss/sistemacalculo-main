<?php

namespace App\Http\Middleware;

use App\Services\AccountAccess;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class EnforceAccountAccess
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->hasSession() || !$user = $request->user()) {
            return $next($request);
        }
        $message = null;
        if ($request->session()->has('account_session_user') && (int) $request->session()->get('account_session_user') !== (int) $user->id) {
            $request->session()->forget(['account_session', 'account_session_version', 'account_session_user']);
        }
        if ($user->account_status !== 'enabled') {
            $message = 'Esta cuenta está bloqueada o dada de baja. Contacta con soporte para revisar su estado.';
        } elseif ($request->session()->has('account_session_version')
            && (int) $request->session()->get('account_session_version') !== (int) $user->session_version) {
            $message = 'Tu sesión fue cerrada por seguridad. Revisa los avisos de tu cuenta al volver a ingresar.';
        } elseif (!$request->session()->has('account_session')) {
            // Includes remember-me and sessions opened before this policy was installed.
            if (!app(AccountAccess::class)->register($user, $request)) {
                $message = AccountAccess::LIMIT_MESSAGE;
            }
        } else {
            $session = DB::table('account_sessions')->where('id', $request->session()->get('account_session'))
                ->where('user_id', $user->id)->where('version', $user->session_version)
                ->where('last_seen_at', '>=', now()->subMinutes(config('session.lifetime', 120)));
            if (!$session->exists()) {
                $message = 'Tu sesión ha vencido o fue cerrada. Vuelve a iniciar sesión.';
            } else {
                $session->update(['last_seen_at' => now(), 'updated_at' => now()]);
            }
        }
        if ($message) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return $request->expectsJson()
                ? response()->json(['message' => $message, 'code' => 'account_access_revoked'], 401)
                : redirect()->route('login')->withErrors(['email' => $message]);
        }
        return $next($request);
    }
}
