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
        $response->headers->set('X-Content-Type-Options','nosniff');
        $response->headers->set('X-Frame-Options','SAMEORIGIN');
        if(!$response->headers->has('Referrer-Policy')) { $response->headers->set('Referrer-Policy','strict-origin-when-cross-origin'); }
        if(app()->isProduction() && $request->isSecure()) { $response->headers->set('Strict-Transport-Security','max-age=31536000'); }
        return $response;
    }
}
