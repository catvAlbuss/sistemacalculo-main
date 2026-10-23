<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\ProjectBackups;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class BackupProjects extends Command
{
    protected $signature = 'project-backups:daily {--dry-run}';

    protected $description = 'Genera copias privadas de CAD y memorias por propietario, con retención de 7 días y 4 domingos';

    public function handle(ProjectBackups $service): int
    {
        $ids = collect(['cad_models', 'memoria_calculos', 'memorias_descriptivas'])
            ->flatMap(fn ($table) => DB::table($table)->distinct()->pluck('user_id'))->unique();
        if ($this->option('dry-run')) {
            $this->info('Cuentas con proyectos para respaldar: '.$ids->count());

            return self::SUCCESS;
        }
        $failed = 0;
        foreach (User::whereIn('id', $ids)->lazyById(50) as $user) {
            try {
                $today = today('America/Lima')->utc();
                if (! \App\Models\ProjectBackup::where('user_id', $user->id)->where('safety', false)->where('created_at', '>=', $today)->exists()) {
                    $service->create($user);
                }
                $service->prune($user);
            } catch (\Throwable) {
                $failed++;
                $this->error('No se completó la copia de la cuenta #'.$user->id.'. Revisa almacenamiento y tamaño de proyectos.');
            }
        }

        return $failed ? self::FAILURE : self::SUCCESS;
    }
}
