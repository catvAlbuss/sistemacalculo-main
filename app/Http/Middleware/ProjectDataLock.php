<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ProjectDataLock
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->isMethodSafe() || ! $request->user()
            || ! ($request->routeIs('software.etabs.model.*', 'software.etabs.models.*', 'software.memoria-*'))) {
            return $next($request);
        }
        try {
            return Cache::lock('project-data:'.$request->user()->id, 300)->block(5, fn () => $next($request));
        } catch (\Illuminate\Contracts\Cache\LockTimeoutException) {
            return response()->json(['message' => 'Hay un respaldo o restauración en curso. Reintenta al terminar.'], 409);
        }
    }
}
