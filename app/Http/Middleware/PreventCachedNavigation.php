<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PreventCachedNavigation
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Public HTML also contains navigation that depends on the current session.
        if (str_contains((string) $response->headers->get('Content-Type'), 'text/html')) {
            $response->headers->set('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
            $response->setVary('Cookie', false);
        }

        return $response;
    }
}
