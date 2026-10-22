<?php

namespace App\Console\Commands;

use App\Models\PaymentTask;
use App\Services\PaymentTasks;
use Illuminate\Console\Command;

class DispatchPaymentTasks extends Command
{
    protected $signature = 'payments:dispatch-pending {--limit=100}';
    protected $description = 'Recupera tareas de pagos pendientes sin repetir cargos';

    public function handle(PaymentTasks $tasks): int
    {
        PaymentTask::where('status', 'processing')->where('locked_at', '<', now()->subMinutes(15))
            ->update(['status' => 'pending', 'locked_at' => null, 'dispatched_at' => null]);
        $pending = PaymentTask::where('status', 'pending')->where('available_at', '<=', now())
            ->where(fn ($query) => $query->whereNull('dispatched_at')->orWhere('dispatched_at', '<', now()->subMinutes(10)))
            ->orderBy('id')->limit(max(1, min(1000, (int) $this->option('limit'))))->get();
        foreach ($pending as $task) {
            $tasks->dispatch($task);
        }
        $this->info('Tareas pendientes revisadas: '.$pending->count());

        return self::SUCCESS;
    }
}
