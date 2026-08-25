<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Ejecuta el motor de calculo estructural (Flask/OpenSeesPy) para un modo
 * dado y devuelve [statusCode, jsonBody].
 *
 * Mismo patron que OctavePlotController::runOctave() usa en produccion para
 * el motor Octave (ver /home/u112634954/domains/ryaie.com/octave): en Linux
 * no se levanta ningun servidor ni se abre ningun puerto -- se invoca un
 * subproceso corto por request via proc_open(), lo que si esta permitido en
 * hosting compartido (a diferencia de un daemon HTTP persistente).
 *
 * En Windows (desarrollo local) se sigue usando el backend Flask/exe que ya
 * corre en PYTHON_BACKEND_URL (por defecto http://127.0.0.1:5001), igual que
 * antes.
 */
class PythonEngineController extends Controller
{
    private const HTTP_ENDPOINTS = [
        'health' => ['GET', '/health'],
        'opensees-status' => ['GET', '/api/opensees/status'],
        'analyze' => ['POST', '/api/analyze'],
        'analyze-3d' => ['POST', '/api/analyze-3d'],
        'seismic-analyze' => ['POST', '/api/seismic/analyze'],
        'seismic-modal' => ['POST', '/api/seismic/modal'],
        'frame-forces' => ['POST', '/api/frame-forces'],
        'seismic-parse-spectrum' => ['POST', '/api/seismic/parse-spectrum'],
        'zapata-shell-design' => ['POST', '/api/zapata/shell-design'],
        'zapata-shell-combined-design' => ['POST', '/api/zapata/shell-combined-design'],
    ];

    /**
     * @return array{0:int,1:string} [statusCode, jsonBody]
     */
    public static function run(string $mode, array $payload): array
    {
        if (PHP_OS_FAMILY === 'Windows') {
            return self::runViaHttp($mode, $payload);
        }

        return self::runViaCli($mode, $payload);
    }

    private static function runViaHttp(string $mode, array $payload): array
    {
        if (!isset(self::HTTP_ENDPOINTS[$mode])) {
            return [400, json_encode(['success' => false, 'error' => "Modo desconocido: {$mode}"])];
        }

        [$method, $path] = self::HTTP_ENDPOINTS[$mode];
        $url = rtrim(config('services.python_backend.url', 'http://127.0.0.1:5001'), '/') . $path;

        try {
            $response = $method === 'GET'
                ? Http::timeout(10)->get($url)
                : Http::timeout(300)->withBody(json_encode($payload), 'application/json')->post($url);

            return [$response->status(), $response->body()];
        } catch (\Throwable $e) {
            Log::warning("PythonEngine HTTP no disponible [{$mode}]: " . $e->getMessage());

            return [503, json_encode([
                'success' => false,
                'error' => 'Motor Python local no disponible (127.0.0.1:5001). Inicia EJECUTAR_BACKEND_WINDOWS.bat.',
            ])];
        }
    }

    private static function runViaCli(string $mode, array $payload): array
    {
        // python-backend/ se despliega junto con el resto del repo (Git → Hostinger
        // autodeploy), así que por defecto el motor vive ahí mismo. El venv NO se
        // versiona (ver .gitignore); lo crea el "Build command" de Hostinger en cada
        // deploy (ver ETABS2_BACKEND_RELEASE/docs/README_DEPLOY_HOSTINGER.md).
        $engineHome = rtrim(config('services.python_backend.engine_home') ?: base_path('python-backend'), '/');
        $python = "{$engineHome}/venv/bin/python3";
        $cliEntry = "{$engineHome}/cli_entry.py";

        if (!is_file($python) || !is_file($cliEntry)) {
            Log::error("PythonEngine no instalado: engineHome={$engineHome} (python: " . (is_file($python) ? 'ok' : 'falta') . ', cli_entry: ' . (is_file($cliEntry) ? 'ok' : 'falta') . ')');

            return [503, json_encode([
                'success' => false,
                'error' => 'Motor de cálculo no instalado en el servidor. Verifica que el Build command de Hostinger (venv + pip install) haya corrido — ver ETABS2_BACKEND_RELEASE/docs/README_DEPLOY_HOSTINGER.md.',
            ])];
        }

        $descriptorSpec = [
            0 => ['pipe', 'r'],
            1 => ['pipe', 'wb'],
            2 => ['pipe', 'w'],
        ];

        $command = escapeshellarg($python) . ' ' . escapeshellarg($cliEntry) . ' ' . escapeshellarg($mode);
        $process = proc_open($command, $descriptorSpec, $pipes, $engineHome, self::cliEnv($engineHome));

        if (!is_resource($process)) {
            return [500, json_encode(['success' => false, 'error' => 'No se pudo iniciar el motor Python.'])];
        }

        fwrite($pipes[0], json_encode($payload));
        fclose($pipes[0]);

        $stdout = stream_get_contents($pipes[1]);
        $stderr = stream_get_contents($pipes[2]);
        fclose($pipes[1]);
        fclose($pipes[2]);

        $exitCode = proc_close($process);

        if ($exitCode !== 0 || trim((string) $stdout) === '') {
            Log::error("PythonEngine CLI error [{$mode}]: exit={$exitCode} stderr={$stderr}");

            return [500, json_encode([
                'success' => false,
                'error' => 'Error en el motor de calculo.',
                'detail' => $stderr,
            ])];
        }

        return [200, trim((string) $stdout)];
    }

    /**
     * Entorno para el subproceso. OpenSeesPy (openseespylinux) necesita
     * libblas.so.3, que viene empaquetada dentro del propio paquete pip en
     * openseespylinux/lib/ pero no está en el LD_LIBRARY_PATH del sistema
     * (hosting compartido, sin root para instalar BLAS). Mismo enfoque que
     * OctavePlotController usa con el bundle de Octave.
     *
     * proc_open() reemplaza TODO el entorno del hijo cuando se le pasa $env,
     * así que partimos del entorno actual (getenv()) para preservar PATH, etc.
     */
    private static function cliEnv(string $engineHome): ?array
    {
        $libDirs = glob("{$engineHome}/venv/lib/python*/site-packages/openseespylinux/lib");
        if (empty($libDirs)) {
            return null; // sin la carpeta, mejor heredar entorno tal cual
        }

        $env = getenv();
        $ld = $libDirs[0];
        $existing = $env['LD_LIBRARY_PATH'] ?? '';
        $env['LD_LIBRARY_PATH'] = $existing !== '' ? "{$ld}:{$existing}" : $ld;

        return $env;
    }
}
