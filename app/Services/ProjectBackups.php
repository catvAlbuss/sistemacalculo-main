<?php

namespace App\Services;

use App\Models\CadModel;
use App\Models\MemoriaCalculo;
use App\Models\MemoriaDescriptiva;
use App\Models\MemoriaImagen;
use App\Models\ProjectBackup;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ProjectBackups
{
    // Allowlist: account credentials, sessions, payments and complaints never enter a project backup.
    private const MODELS = ['cad_models' => CadModel::class, 'memoria_calculos' => MemoriaCalculo::class,
        'memorias_descriptivas' => MemoriaDescriptiva::class, 'memoria_imagenes' => MemoriaImagen::class];

    private const MAX_BYTES = 67108864;

    public function create(User $user, bool $safety = false): ProjectBackup
    {
        return Cache::lock('project-data:'.$user->id, 300)->block(5, fn () => DB::transaction(fn () => $this->capture($user, $safety)));
    }

    private function capture(User $user, bool $safety): ProjectBackup
    {
        $tables = [];
        foreach (self::MODELS as $table => $model) {
            $query = $table === 'memoria_imagenes'
                ? $model::whereIn('memoria_calculo_id', array_column($tables['memoria_calculos'], 'id'))
                : $model::where('user_id', $user->id);
            $columns = array_merge(['id', 'created_at', 'updated_at'], (new $model)->getFillable());
            // Generated files outside the project tables are not part of this format.
            $columns = array_values(array_diff($columns, ['file_path']));
            $tables[$table] = $query->orderBy('id')->get($columns)->map(fn ($row) => $row->getRawOriginal())->all();
            if (in_array($table, ['memoria_calculos', 'memorias_descriptivas'], true)) {
                $owned = array_column($tables['cad_models'], 'id');
                foreach ($tables[$table] as &$row) {
                    if ($row['cad_model_id'] && ! in_array($row['cad_model_id'], $owned)) {
                        $row['cad_model_id'] = null;
                    }
                }
                unset($row);
            }
        }
        $json = json_encode(['format' => 1, 'owner' => $user->id, 'captured_at' => now()->toIso8601String(), 'tables' => $tables], JSON_THROW_ON_ERROR);
        if (strlen($json) > self::MAX_BYTES) {
            throw ValidationException::withMessages(['backup' => 'La copia supera 64 MB. Contacta a soporte para un respaldo asistido.']);
        }
        $path = 'project-backups/'.$user->id.'/'.Str::uuid().'.enc';
        $file = Crypt::encryptString(base64_encode(gzencode($json, 6)));
        if (! Storage::disk('local')->put($path, $file)) {
            throw new \RuntimeException('No se pudo guardar el respaldo privado.');
        }
        try {
            return ProjectBackup::create(['user_id' => $user->id, 'path' => $path, 'checksum' => hash('sha256', $file),
                'bytes' => strlen($file), 'counts' => array_map('count', $tables), 'safety' => $safety]);
        } catch (\Throwable $e) {
            Storage::disk('local')->delete($path);
            throw $e;
        }
    }

    public function read(User $user, ProjectBackup $backup): array
    {
        abort_unless($backup->user_id === $user->id, 404);
        $file = Storage::disk('local')->get($backup->path);
        if (! is_string($file) || ! hash_equals($backup->checksum, hash('sha256', $file))) {
            throw ValidationException::withMessages(['backup' => 'La copia no supera la verificación de integridad.']);
        }
        try {
            $json = gzdecode(base64_decode(Crypt::decryptString($file), true), self::MAX_BYTES + 1);
            $data = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
            if (($data['format'] ?? null) !== 1 || ($data['owner'] ?? null) !== $user->id
                || array_keys($data['tables'] ?? []) !== array_keys(self::MODELS)) {
                throw new \RuntimeException;
            }

            return $data;
        } catch (\Throwable) {
            throw ValidationException::withMessages(['backup' => 'La copia no es compatible o no se puede descifrar.']);
        }
    }

    private function current(User $user): array
    {
        $result = [];
        foreach (self::MODELS as $table => $model) {
            $query = $table === 'memoria_imagenes'
                ? $model::whereIn('memoria_calculo_id', MemoriaCalculo::where('user_id', $user->id)->select('id'))
                : $model::where('user_id', $user->id);
            $result[$table] = $query->orderBy('id')->get()->map(fn ($row) => $row->getRawOriginal())->all();
        }

        return $result;
    }

    public function preview(User $user, ProjectBackup $backup): array
    {
        return Cache::lock('project-data:'.$user->id, 300)->block(5, function () use ($user, $backup) {
            $copy = $this->read($user, $backup);
            $current = $this->current($user);

            $projects = [];
            foreach (['cad_models', 'memoria_calculos', 'memorias_descriptivas'] as $table) {
                $projects[$table] = [
                    'restore' => array_map(fn ($row) => ['id' => $row['id'], 'name' => $row['name'] ?? $row['project_name'] ?? 'Sin nombre'], $copy['tables'][$table]),
                    'remove' => array_values(array_map(fn ($row) => ['id' => $row['id'], 'name' => $row['name'] ?? $row['project_name'] ?? 'Sin nombre'],
                        array_filter($current[$table], fn ($row) => !in_array($row['id'], array_column($copy['tables'][$table], 'id'))))),
                ];
            }

            return ['counts' => $backup->counts, 'current' => array_map('count', $current), 'projects' => $projects,
                'revision' => hash('sha256', json_encode($current, JSON_THROW_ON_ERROR))];
        });
    }

    public function restore(User $user, ProjectBackup $backup, string $revision): ProjectBackup
    {
        return Cache::lock('project-data:'.$user->id, 300)->block(5, function () use ($user, $backup, $revision) {
            $copy = $this->read($user, $backup);
            $current = $this->current($user);
            if (! hash_equals(hash('sha256', json_encode($current, JSON_THROW_ON_ERROR)), $revision)) {
                throw ValidationException::withMessages(['backup' => 'Tus proyectos cambiaron desde la vista previa. Revisa de nuevo antes de restaurar.']);
            }
            // Reject collisions before deleting anything: never touch another owner's project IDs.
            foreach (self::MODELS as $table => $model) {
                $own = array_column($current[$table], 'id');
                foreach ($copy['tables'][$table] as $row) {
                    if (! in_array($row['id'], $own) && DB::table($table)->where('id', $row['id'])->exists()) {
                        throw ValidationException::withMessages(['backup' => 'La copia contiene un identificador que ya no se puede restaurar. Contacta a soporte.']);
                    }
                }
            }
            $safety = DB::transaction(fn () => $this->capture($user, true));

            return DB::transaction(function () use ($user, $backup, $copy, $current, $safety) {
                $owner = User::whereKey($user->id)->lockForUpdate()->firstOrFail();
                $version = max(now()->timestamp, (int) $owner->project_restore_version,
                    ...array_column($current['cad_models'], 'version'), ...array_column($copy['tables']['cad_models'], 'version')) + 1;
                $owner->forceFill(['project_restore_version' => $version])->save();
                foreach (array_reverse(array_keys(self::MODELS)) as $table) {
                    DB::table($table)->whereIn('id', array_column($current[$table], 'id'))->delete();
                }
                foreach (self::MODELS as $table => $model) {
                    $allowed = array_merge(['id', 'created_at', 'updated_at'], (new $model)->getFillable());
                    foreach ($copy['tables'][$table] as $row) {
                        $row = array_intersect_key($row, array_flip(array_diff($allowed, ['file_path'])));
                        if ($table !== 'memoria_imagenes') {
                            $row['user_id'] = $user->id;
                        }
                        if ($table === 'cad_models') {
                            $row['version'] = $version;
                            $row['last_saved_at'] = now()->toDateTimeString();
                        }
                        DB::table($table)->insert($row);
                    }
                }
                $this->event($user, $backup, 'restore', $safety->id);

                return $safety;
            });
        });
    }

    public function event(User $user, ProjectBackup $backup, string $kind, ?int $safetyId = null): void
    {
        DB::table('project_backup_events')->insert(['user_id' => $user->id, 'backup_id' => $backup->id,
            'kind' => $kind, 'safety_backup_id' => $safetyId, 'created_at' => now()]);
    }

    public function prune(User $user): void
    {
        Cache::lock('project-data:'.$user->id, 300)->block(5, fn () => $this->pruneUnlocked($user));
    }

    private function pruneUnlocked(User $user): void
    {
        $backups = ProjectBackup::where('user_id', $user->id)->orderByDesc('id')->get();
        $keep = $backups->where('safety', true)->take(4)->pluck('id')->all();
        $daily = [];
        $sundays = [];
        foreach ($backups->where('safety', false) as $backup) {
            $day = $backup->created_at->timezone('America/Lima')->toDateString();
            if ((! isset($daily[$day]) && count($daily) < 7)
                || ($backup->created_at->isSunday() && ! isset($sundays[$day]) && count($sundays) < 4)) {
                $keep[] = $backup->id;
            }
            $daily[$day] ??= $backup->id;
            if ($backup->created_at->isSunday()) {
                $sundays[$day] ??= $backup->id;
            }
        }
        foreach ($backups->whereNotIn('id', $keep) as $backup) {
            if (Storage::disk('local')->delete($backup->path)) {
                $backup->delete();
            }
        }
    }
}
