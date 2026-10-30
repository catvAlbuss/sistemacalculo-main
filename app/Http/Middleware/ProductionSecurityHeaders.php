<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ProductionSecurityHeaders
{
    public function handle(Request $request, Closure $next)
    {
        if(app()->isProduction()) {
            $host=parse_url(config('app.url'),PHP_URL_HOST);
            abort_unless($host && strcasecmp($host,$request->getHost())===0,400,'Host no permitido.');
        }
        $response=$next($request);
        header_remove('X-Powered-By'); // No revelar la versión de PHP.
        $response->headers->remove('X-Powered-By');
        $response->headers->set('X-Content-Type-Options','nosniff');
        $response->headers->set('X-Frame-Options','SAMEORIGIN');
        if(!$response->headers->has('Referrer-Policy')) { $response->headers->set('Referrer-Policy','strict-origin-when-cross-origin'); }
        // Funciones del navegador que la aplicación no usa.
        $response->headers->set('Permissions-Policy','camera=(), microphone=(), geolocation=(), usb=(), serial=(), bluetooth=()');
        // CSP mínima: sin plugins, sin <base> ajeno y sin incrustación por otros sitios. No restringe scripts:
        // las hojas cargan librerías de varios CDN y una política de scripts debe probarse antes en modo report-only.
        if(!$response->headers->has('Content-Security-Policy')) {
            $response->headers->set('Content-Security-Policy',"object-src 'none'; base-uri 'self'; frame-ancestors 'self'");
        }
        if(app()->isProduction() && $request->isSecure()) { $response->headers->set('Strict-Transport-Security','max-age=31536000'); }
        return $response;
    }
}
