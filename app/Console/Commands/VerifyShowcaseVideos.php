<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;

class VerifyShowcaseVideos extends Command
{
    protected $signature = 'videos:verificar';
    protected $description = 'Verifica binarios, almacenamiento, tablas y configuración de la cola de videos';

    public function handle(): int
    {
        $ok = true;
        foreach (['ffmpeg', 'ffprobe'] as $binary) {
            try {
                $process = new Process([config('showcase.'.$binary), '-version'], timeout: 10);
                $process->mustRun(); $this->info($binary.': disponible');
            } catch (\Throwable $error) { $ok = false; $this->error($binary.': no disponible; revisa su ruta en .env'); }
        }
        foreach (['media', 'showcase_videos', 'jobs'] as $table) {
            if (Schema::hasTable($table)) $this->info('Tabla '.$table.': disponible');
            else { $ok = false; $this->error('Falta tabla '.$table.': ejecuta las migraciones'); }
        }
        foreach (['local', 'showcase_public'] as $disk) {
            $probe = 'readiness-'.\Illuminate\Support\Str::uuid().'.txt';
            try {
                if (!Storage::disk($disk)->put($probe, 'ok')) throw new \RuntimeException('write failed');
                Storage::disk($disk)->delete($probe); $this->info('Disco '.$disk.': escritura disponible');
            } catch (\Throwable $error) { $ok = false; $this->error('Disco '.$disk.': revisa permisos de escritura'); }
        }
        $connection = config('showcase.queue_connection');
        if ($connection === 'sync' || config('queue.connections.'.$connection.'.retry_after', 0) <= 900) {
            $ok = false; $this->error('Usa una cola persistente de videos con retry_after mayor a 900 segundos.');
        } else $this->info('Cola '.$connection.': configuración disponible');
        $this->line('Mantén activo: php artisan queue:work '.$connection.' --queue=media --timeout=900 --tries=2 --sleep=3');
        return $ok ? self::SUCCESS : self::FAILURE;
    }
}
