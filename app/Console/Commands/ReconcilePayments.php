<?php

namespace App\Console\Commands;

use App\Models\PaymentRequest;
use App\Services\PaymentTasks;
use Illuminate\Console\Command;

class ReconcilePayments extends Command
{
    protected $signature = 'payments:reconcile {--limit=100} {--dry-run}';
    protected $description = 'Encola la consulta de cargos conocidos pendientes; nunca vuelve a cobrar';

    public function handle(PaymentTasks $tasks): int
    {
        $payments = PaymentRequest::where('payment_method', 'culqi')->where('status', 'pending')
            ->whereIn('gateway_state', ['uncertain', 'processing'])->whereNotNull('gateway_charge_id')
            ->where('updated_at', '<', now()->subMinute())->orderBy('id')
            ->limit(max(1, min(1000, (int) $this->option('limit'))))->get();
        if (!$this->option('dry-run')) {
            foreach ($payments as $payment) {
                $tasks->dispatch($tasks->create('reconcile', $payment, ['charge_id' => $payment->gateway_charge_id]));
            }
        }
        $this->info(($this->option('dry-run') ? 'Simulación. ' : '').'Cargos conocidos pendientes: '.$payments->count());

        return self::SUCCESS;
    }
}
