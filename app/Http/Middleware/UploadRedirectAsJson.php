<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

// La carga con progreso no debe seguir la redirección: consumiría el mensaje flash antes de mostrarlo.
class UploadRedirectAsJson
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        return $request->hasHeader('X-Upload-Progress') && $response instanceof RedirectResponse
            ? response()->json(['redirect' => $response->getTargetUrl()])
            : $response;
    }
}
