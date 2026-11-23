<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

/**
 * Arma la biblioteca publicable del agente a partir de la biblioteca privada del despacho
 * (storage/app/private/entrenamiento/biblioteca/<tipo>/<grupo>-<modulo>-<n>.json).
 *
 * Por cada tipo escribe storage/app/private/agente/biblioteca-publicable/<tipo>.json (y su .gz):
 * {esquema, version, tipo, piezas: [{id, tipo, titulo, escala, parametros, niveles, ejes,
 * entidades, textos, capas, dudas}]}. Nada identifica al proyecto: no hay proyecto, módulo,
 * huella ni archivo de origen; los ids son "<tipo>-NNN" en orden de huella del contenido (no
 * agrupados por proyecto); los textos que nombran a un grupo se descartan. Coordenadas a mm,
 * sin entidades repetidas ni degeneradas.
 *
 * Se corre donde esté la biblioteca privada (en local) y se sube la carpeta publicable al
 * servidor: storage/ no viaja con el deploy por git.
 */
class PublicarBibliotecaAgente extends Command
{
    protected $signature = 'agente:publicar-biblioteca
        {--tipo=* : Solo estos tipos (por defecto todos los de config agente.biblioteca_tipos)}
        {--prohibir=* : Palabras extra que no pueden aparecer (además de los grupos de los archivos)}';

    protected $description = 'Publica la biblioteca de detalles del despacho para el agente, anónima y liviana';

    public const ESQUEMA = 'BIBLIOTECA-PUBLICABLE';

    public const VERSION = '1.0.0';

    private const CAMPOS_ENTIDAD = ['tipo', 'capa', 'color', 'puntos', 'cerrada', 'centro', 'radio', 'alto', 'texto', 'rotacion', 'rot', 'ancla'];

    /** @var string regex de palabras prohibidas */
    private string $prohibidas = '';

    private array $cuenta = [];

    public function handle(): int
    {
        $disco = Storage::disk('local');
        $origen = trim((string) config('agente.biblioteca_origen'), '/');
        $destino = trim((string) config('agente.biblioteca_publicable'), '/');
        $permitidos = (array) config('agente.biblioteca_tipos', []);
        $tipos = $this->option('tipo') ?: $permitidos;

        if (! $disco->exists($origen)) {
            $this->error("No existe la biblioteca privada en storage/app/private/{$origen}.");

            return self::FAILURE;
        }

        $this->prohibidas = $this->armarProhibidas($disco, $origen);

        $indice = [];
        $filas = [];
        foreach ($tipos as $tipo) {
            if (! in_array($tipo, $permitidos, true)) {
                $this->warn("Tipo {$tipo} fuera de la lista blanca: se omite.");

                continue;
            }
            $archivos = array_values(array_filter($disco->files("{$origen}/{$tipo}"), fn ($f) => str_ends_with($f, '.json')));
            if (! $archivos) {
                continue;
            }
            $this->cuenta = ['entidades' => 0, 'repetidas' => 0, 'degeneradas' => 0, 'textosQuitados' => 0, 'piezasRepetidas' => 0];

            // Cada pieza se guarda ya serializada (las piezas de pórtico pesan mucho como arreglo).
            $piezas = [];
            $bytesOrigen = 0;
            foreach ($archivos as $archivo) {
                $crudo = $disco->get($archivo);
                $bytesOrigen += strlen($crudo);
                $pieza = json_decode($crudo, true);
                unset($crudo);
                if (! is_array($pieza)) {
                    continue;
                }
                $json = json_encode($this->pieza($pieza, $tipo), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                $huella = sha1($json);
                if (isset($piezas[$huella])) {
                    $this->cuenta['piezasRepetidas']++;

                    continue;
                }
                $piezas[$huella] = $json;
            }
            ksort($piezas);

            $partes = [];
            $n = 0;
            foreach ($piezas as $json) {
                $id = sprintf('%s-%03d', $tipo, ++$n);
                $partes[] = '{"id":"'.$id.'",'.substr($json, 1);
            }
            $salida = '{"esquema":"'.self::ESQUEMA.'","version":"'.self::VERSION.'","tipo":"'.$tipo.'","piezas":['.implode(',', $partes).']}';
            unset($partes, $piezas);

            if ($this->prohibidas !== '' && preg_match($this->prohibidas, $salida, $m)) {
                $this->error("La salida de {$tipo} aún contiene un nombre de proyecto ({$m[0]}); no se publica.");

                return self::FAILURE;
            }

            $gz = gzencode($salida, 9);
            $disco->put("{$destino}/{$tipo}.json", $salida);
            $disco->put("{$destino}/{$tipo}.json.gz", $gz);
            $indice[$tipo] = [
                'piezas' => $n,
                'bytes' => strlen($salida),
                'bytesGz' => strlen($gz),
                'etag' => sha1($salida),
            ];
            $filas[] = [
                $tipo, $n, $this->kb($bytesOrigen), $this->kb(strlen($salida)), $this->kb(strlen($gz)),
                $this->cuenta['entidades'], $this->cuenta['repetidas'] + $this->cuenta['degeneradas'],
                $this->cuenta['textosQuitados'], $this->cuenta['piezasRepetidas'],
            ];
        }

        $disco->put("{$destino}/indice.json", json_encode([
            'esquema' => self::ESQUEMA, 'version' => self::VERSION, 'generado' => now()->toIso8601String(), 'tipos' => $indice,
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        $this->table(['tipo', 'piezas', 'origen', 'publicable', 'gzip', 'entidades', 'quitadas', 'textos quitados', 'piezas repetidas'], $filas);
        $this->info("Biblioteca publicable en storage/app/private/{$destino}.");

        return self::SUCCESS;
    }

    /** Grupos de los nombres de archivo (<grupo>-modulo-..), proyectos del índice y --prohibir. */
    private function armarProhibidas($disco, string $origen): string
    {
        $palabras = array_map('strval', (array) $this->option('prohibir'));
        foreach ($disco->allFiles($origen) as $f) {
            if (preg_match('~/([^/]+?)-modulo-[^/]*\.json$~i', $f, $m)) {
                $palabras[] = $m[1];
            }
        }
        $indice = json_decode((string) $disco->get("{$origen}/indice.json"), true);
        foreach (array_keys((array) ($indice['proyectos'] ?? [])) as $p) {
            $palabras[] = (string) $p;
        }
        $palabras = array_values(array_unique(array_filter(array_map(fn ($p) => mb_strtolower(trim($p)), $palabras), fn ($p) => mb_strlen($p) >= 3)));
        if (! $palabras) {
            return '';
        }

        return '~(?<![\p{L}\p{N}])('.implode('|', array_map(fn ($p) => preg_quote($p, '~'), $palabras)).')(?![\p{L}\p{N}])~iu';
    }

    private function prohibido(string $s): bool
    {
        return $this->prohibidas !== '' && preg_match($this->prohibidas, $s) === 1;
    }

    private function pieza(array $p, string $tipo): array
    {
        // Los ejes de los parámetros son coordenadas: a mm como las entidades. El resto de
        // parámetros (cuantías, relaciones) se deja con su precisión.
        if (isset($p['parametros']['ejes']) && is_array($p['parametros']['ejes'])) {
            $p['parametros']['ejes'] = $this->redondear($p['parametros']['ejes']);
        }
        $salida = [
            'tipo' => $tipo,
            'titulo' => $this->limpiarTexto((string) ($p['titulo'] ?? '')),
            'escala' => $p['escala'] ?? null,
            'parametros' => $this->limpiar($p['parametros'] ?? (object) []),
            'niveles' => $this->limpiar($this->redondear($p['niveles'] ?? [])),
        ];
        if (isset($p['ejes'])) {
            $salida['ejes'] = $this->limpiar($this->redondear($p['ejes']));
        }
        $salida['entidades'] = $this->entidades($p['entidades'] ?? []);
        $textos = [];
        foreach ((array) ($p['textos'] ?? []) as $t) {
            if (! is_string($t) || $this->prohibido($t)) {
                $this->cuenta['textosQuitados'] += is_string($t) ? 1 : 0;

                continue;
            }
            $textos[$t] = true;
        }
        $salida['textos'] = array_keys($textos);
        $salida['capas'] = array_values(array_filter((array) ($p['capas'] ?? []), fn ($c) => is_string($c) && ! $this->prohibido($c)));
        if (! empty($p['dudas'])) {
            $salida['dudas'] = $this->limpiar($p['dudas']);
        }

        return $salida;
    }

    private function entidades(array $entidades): array
    {
        $vistas = [];
        $salida = [];
        foreach ($entidades as $e) {
            if (! is_array($e)) {
                continue;
            }
            $this->cuenta['entidades']++;
            if (isset($e['texto']) && (! is_string($e['texto']) || $this->prohibido($e['texto']))) {
                $this->cuenta['textosQuitados']++;

                continue;
            }
            if (isset($e['capa']) && is_string($e['capa']) && $this->prohibido($e['capa'])) {
                $e['capa'] = '0';
            }
            $n = [];
            foreach (self::CAMPOS_ENTIDAD as $k) {
                if (array_key_exists($k, $e) && $e[$k] !== null) {
                    $n[$k] = $k === 'texto' || $k === 'capa' || $k === 'tipo' ? $e[$k] : $this->redondear($e[$k]);
                }
            }
            if ($this->degenerada($n)) {
                $this->cuenta['degeneradas']++;

                continue;
            }
            $clave = $this->clave($n);
            if (isset($vistas[$clave])) {
                $this->cuenta['repetidas']++;

                continue;
            }
            $vistas[$clave] = true;
            $salida[] = $n;
        }

        return $salida;
    }

    private function degenerada(array $e): bool
    {
        if (isset($e['puntos'])) {
            $pts = array_map(fn ($q) => json_encode($q), (array) $e['puntos']);

            return count(array_unique($pts)) < 2;
        }
        if (($e['tipo'] ?? '') === 'circulo') {
            return ! isset($e['centro']) || ($e['radio'] ?? 0) <= 0;
        }
        if (($e['tipo'] ?? '') === 'texto') {
            return trim((string) ($e['texto'] ?? '')) === '' || ! isset($e['centro']);
        }

        return false;
    }

    // Una línea o polilínea abierta dibujada al revés es la misma entidad.
    private function clave(array $e): string
    {
        $a = json_encode($e);
        if (isset($e['puntos']) && empty($e['cerrada'])) {
            $r = $e;
            $r['puntos'] = array_reverse($e['puntos']);
            $b = json_encode($r);

            return $a < $b ? $a : $b;
        }

        return $a;
    }

    /** Números a milímetros (las piezas están en metros); enteros sin ".0". */
    private function redondear(mixed $v): mixed
    {
        if (is_array($v)) {
            return array_map(fn ($x) => $this->redondear($x), $v);
        }
        if (is_float($v)) {
            $r = round($v, 3);
            if ($r == 0.0) {
                return 0;
            }

            return floor($r) == $r && abs($r) < 1e15 ? (int) $r : $r;
        }

        return $v;
    }

    /** Quita de cualquier texto anidado los nombres prohibidos. */
    private function limpiar(mixed $v): mixed
    {
        if (is_array($v)) {
            $salida = [];
            foreach ($v as $k => $x) {
                $salida[is_string($k) ? $this->limpiarTexto($k) : $k] = $this->limpiar($x);
            }

            return $salida;
        }

        return is_string($v) ? $this->limpiarTexto($v) : $v;
    }

    private function limpiarTexto(string $s): string
    {
        return $this->prohibidas === '' ? $s : trim(preg_replace('~\s{2,}~', ' ', preg_replace($this->prohibidas, '', $s)));
    }

    private function kb(int $bytes): string
    {
        return $bytes >= 1048576 ? round($bytes / 1048576, 2).' MB' : round($bytes / 1024, 1).' KB';
    }
}
