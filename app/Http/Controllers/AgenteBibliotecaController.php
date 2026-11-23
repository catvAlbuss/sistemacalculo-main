<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

/**
 * Biblioteca de detalles del despacho para el panel del agente (solo lectura).
 *
 * Sirve storage/app/private/agente/biblioteca-publicable/<tipo>.json, que arma
 * `php artisan agente:publicar-biblioteca` sin nombres de proyecto. Solo usuarios con sesión y
 * con un rol de config('agente.biblioteca_roles') ('*' = todos). El tipo se valida contra la lista
 * blanca config('agente.biblioteca_tipos'); nunca se arma una ruta con texto del usuario.
 * Caché HTTP por ETag (304) y, si el navegador acepta gzip, el .gz ya comprimido.
 */
class AgenteBibliotecaController extends Controller
{
    public static function puedeVer($user): bool
    {
        if (! $user) {
            return false;
        }
        $roles = (array) config('agente.biblioteca_roles', []);
        if (in_array('*', $roles, true)) {
            return true;
        }

        return $roles !== [] && method_exists($user, 'hasAnyRole') && $user->hasAnyRole($roles);
    }

    public function mostrar(Request $request, string $tipo): Response
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['ok' => false, 'error' => 'Sin sesión.'], 401);
        }
        if (! self::puedeVer($user)) {
            return response()->json(['ok' => false, 'error' => 'Sin permiso para la biblioteca del despacho.'], 403);
        }
        if (! in_array($tipo, (array) config('agente.biblioteca_tipos', []), true)) {
            return response()->json(['ok' => false, 'error' => 'Tipo de detalle desconocido.'], 404);
        }

        $disco = Storage::disk('local');
        $base = trim((string) config('agente.biblioteca_publicable'), '/');
        $json = "{$base}/{$tipo}.json";
        if (! $disco->exists($json)) {
            return response()->json(['ok' => false, 'error' => 'La biblioteca aún no se publicó.'], 404);
        }

        $indice = json_decode((string) $disco->get("{$base}/indice.json"), true);
        $etag = (string) ($indice['tipos'][$tipo]['etag'] ?? sha1_file($disco->path($json)));

        $gzip = in_array('gzip', $request->getEncodings(), true) && $disco->exists("{$json}.gz");
        $ruta = $disco->path($gzip ? "{$json}.gz" : $json);
        $etiqueta = $gzip ? "{$etag}-gz" : $etag;

        $headers = [
            'Content-Type' => 'application/json; charset=UTF-8',
            'Vary' => 'Accept-Encoding',
            'X-Content-Type-Options' => 'nosniff',
        ];
        if ($gzip) {
            $headers['Content-Encoding'] = 'gzip';
        }

        $respuesta = response()->file($ruta, $headers);
        $respuesta->setEtag($etiqueta);
        $respuesta->setPrivate();
        $respuesta->headers->addCacheControlDirective('no-cache');
        $respuesta->isNotModified($request);

        return $respuesta;
    }
}
