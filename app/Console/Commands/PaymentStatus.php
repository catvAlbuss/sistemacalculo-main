<?php

namespace App\Console\Commands;

use App\Models\PaymentRequest;
use App\Models\PaymentTask;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PaymentStatus extends Command
{
    protected $signature = 'payments:status';
    protected $description = 'Muestra pendientes y fallos de pagos sin datos personales ni secretos';

    public function handle(): int
    {
        $this->line('Cola: '.config('payments.queue_connection').' / payments');
        foreach (['pending', 'processing', 'failed'] as $status) {
            $this->line('Tareas '.$status.': '.PaymentTask::where('status', $status)->count());
        }
        $this->line('Eventos que requieren revisión: '.PaymentTask::where('result', 'review_required')->count());
        $this->line('Alertas sin revisar: '.\App\Models\PaymentEvent::where('severity', 'warning')->whereNull('reviewed_at')->count());
        $this->line('Pagos sin resultado confirmado: '.PaymentRequest::where('status', 'pending')->whereIn('gateway_state', ['processing', 'uncertain'])->count());
        $this->line('Jobs en payments: '.DB::table('jobs')->where('queue', 'payments')->count());

        return self::SUCCESS;
    }
}
