<?php

namespace App\Console\Commands;

use App\Models\PaymentTask;
use App\Services\PaymentTasks;
use Illuminate\Console\Command;

class RetryPaymentTask extends Command
{
    protected $signature = 'payments:retry-task {task}';
    protected $description = 'Reencola una tarea fallida de consulta o correo; nunca vuelve a crear un cargo';

    public function handle(PaymentTasks $tasks): int
    {
        $task = PaymentTask::find($this->argument('task'));
        if (!$task || $task->status !== 'failed') {
            $this->error('La tarea no existe o no está fallida.');

            return self::FAILURE;
        }
        $task->update(['status' => 'pending', 'attempts' => 0, 'available_at' => now(), 'dispatched_at' => null, 'locked_at' => null]);
        $tasks->dispatch($task);
        $this->info('Tarea reencolada. No se ha creado ningún cargo.');

        return self::SUCCESS;
    }
}
