<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

/**
 * Las correcciones de dibujo de cada cliente (AgenteAprendizajeDibujoController, por usuario) entrenan
 * primero SU modelo; con este comando un responsable las incorpora a la base del despacho, con la que
 * aprende el modelo de todos. Solo números (rasgos, regla, etiqueta, largo): sin nombres ni planos.
 *
 *   php artisan agente:incorporar-correcciones            # resumen de lo que hay por usuario
 *   php artisan agente:incorporar-correcciones --usuario=12 --confirmar
 *   php artisan agente:incorporar-correcciones --todos --confirmar
 */
class IncorporarCorreccionesAgente extends Command
{
    protected $signature = 'agente:incorporar-correcciones {--usuario=* : ids de usuario} {--todos} {--confirmar} {--decision=muro-cimentacion} {--maximo=20000}';

    protected $description = 'Incorpora a la base del despacho las correcciones de dibujo de los clientes (aprendizaje del agente)';

    public function handle(): int
    {
        $disco = Storage::disk('local');
        $decision = $this->option('decision');
        $base = "agente/dibujo/base-{$decision}.json";
        $incorporados = "agente/dibujo/incorporados-{$decision}.json";
        $hechos = $disco->exists($incorporados) ? json_decode($disco->get($incorporados), true) : [];

        $filas = [];
        foreach ($disco->directories('agente/dibujo/usuarios') as $dir) {
            $usuario = (int) basename($dir);
            $archivo = "{$dir}/{$decision}.json";
            if (! $disco->exists($archivo)) {
                continue;
            }
            $modulos = json_decode($disco->get($archivo), true)['modulos'] ?? [];
            $nuevos = array_filter($modulos, fn ($m, $k) => ($hechos["{$usuario}:{$k}"] ?? null) !== $m['fecha'], ARRAY_FILTER_USE_BOTH);
            $filas[] = ['usuario' => $usuario, 'modulos' => count($modulos), 'nuevos' => $nuevos];
        }
        $this->table(['Usuario', 'Módulos corregidos', 'Sin incorporar'], array_map(fn ($f) => [$f['usuario'], $f['modulos'], count($f['nuevos'])], $filas));

        $elegidos = $this->option('todos') ? array_column($filas, 'usuario') : array_map('intval', (array) $this->option('usuario'));
        if (! $elegidos) {
            $this->line('Elige --usuario=ID o --todos, y --confirmar para incorporarlos a la base del despacho.');

            return self::SUCCESS;
        }
        $muestras = [];
        foreach ($filas as $f) {
            if (! in_array($f['usuario'], $elegidos, true)) {
                continue;
            }
            foreach ($f['nuevos'] as $modulo => $m) {
                array_push($muestras, ...$m['muestras']);
                $hechos["{$f['usuario']}:{$modulo}"] = $m['fecha'];
            }
        }
        if (! $muestras) {
            $this->info('No hay correcciones nuevas para incorporar.');

            return self::SUCCESS;
        }
        if (! $this->option('confirmar')) {
            $this->warn(count($muestras).' tramos listos para incorporar. Repite con --confirmar.');

            return self::SUCCESS;
        }
        $actual = $disco->exists($base) ? json_decode($disco->get($base), true) : ['decision' => $decision, 'muestras' => []];
        $todas = array_merge($actual['muestras'] ?? [], $muestras);
        $todas = array_slice($todas, -max(1000, (int) $this->option('maximo')));
        $disco->put($base, json_encode(['decision' => $decision, 'generado' => now()->toIso8601String(), 'muestras' => $todas]));
        $disco->put($incorporados, json_encode($hechos));
        $this->info(count($muestras).' tramos incorporados; la base del despacho tiene '.count($todas).'.');

        return self::SUCCESS;
    }
}
