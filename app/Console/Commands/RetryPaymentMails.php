<?php

namespace App\Console\Commands;

use App\Models\PaymentTask;
use App\Services\PaymentMailRecovery;
use Illuminate\Console\Command;

class RetryPaymentMails extends Command
{
    protected $signature = 'payments:retry-mails {--days=7 : Antigüedad máxima del último intento} {--limit=100} {--apply : Reencolar los fallidos mostrados} {--include-uncertain : Incluir inciertos después de verificar Enviados en Hostinger}';
    protected $description = 'Muestra o recupera correos fallidos recientes; no reenvía los completados ni repite cobros';

    public function handle(PaymentMailRecovery $recovery): int
    {
        $days = filter_var($this->option('days'), FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 365]]);
        $limit = filter_var($this->option('limit'), FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 1000]]);
        if (!$days || !$limit) {
            $this->error('Usa days entre 1 y 365 y limit entre 1 y 1000.');
            return self::FAILURE;
        }
        $tasks = PaymentTask::whereIn('kind', PaymentMailRecovery::KINDS)->where('status', 'failed')
            ->where('updated_at', '>=', now()->subDays($days))->orderByDesc('id')->limit($limit)->get();
        $this->table(['Tarea', 'Solicitud', 'Correo', 'Intentos', 'Resultado'], $tasks->map(fn ($task) => [
            $task->id, $task->payment_request_id, $task->kind, $task->attempts, $task->result,
        ])->all());
        if (!$this->option('apply')) {
            $this->info('Vista previa. Usa --apply después de corregir el proveedor y verificar los envíos inciertos.');
            return self::SUCCESS;
        }
        $count = 0;
        $uncertain = 0;
        foreach ($tasks as $task) {
            if ($task->result === 'delivery_uncertain' && !$this->option('include-uncertain')) { $uncertain++; continue; }
            $count += (int) $recovery->retry($task);
        }
        $this->info('Correos reencolados: '.$count.'. Requiere el worker payments activo.');
        if ($uncertain) { $this->warn('Omitidos por entrega incierta: '.$uncertain.'. Revisa Enviados antes de usar --include-uncertain.'); }

        return self::SUCCESS;
    }
}
