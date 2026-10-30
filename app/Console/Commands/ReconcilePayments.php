<?php

namespace App\Console\Commands;

use App\Models\PaymentEvent;
use App\Models\PaymentRequest;
use App\Models\PaymentTask;
use App\Services\Culqi;
use App\Services\PaymentTasks;
use Illuminate\Console\Command;

class ReconcilePayments extends Command
{
    protected $signature = 'payments:reconcile {--limit=100} {--dry-run}';
    protected $description = 'Busca y consulta cargos pendientes de resultado; nunca vuelve a cobrar';

    public function handle(PaymentTasks $tasks, Culqi $culqi): int
    {
        $limit = max(1, min(1000, (int) $this->option('limit')));
        $unknown = $this->unresolved()->whereNull('gateway_charge_id')
            ->where('updated_at', '<', now()->subMinutes(5))->orderBy('id')->limit(min($limit, 20))->get();
        if (!$this->option('dry-run')) {
            $unknown->each(fn ($payment) => $this->locate($payment, $culqi));
        }
        $payments = $this->unresolved()->whereNotNull('gateway_charge_id')
            ->where('updated_at', '<', now()->subMinute())->orderBy('id')->limit($limit)->get();
        if (!$this->option('dry-run')) {
            foreach ($payments as $payment) {
                $task = $tasks->create('reconcile', $payment, ['charge_id' => $payment->gateway_charge_id]);
                // Consulting is read-only, so a long Culqi outage must not leave the order waiting for a person.
                if ($task->status === 'failed' && $task->updated_at->isBefore(now()->subHour())) {
                    PaymentTask::whereKey($task->id)->update(['status' => 'pending', 'attempts' => 0, 'available_at' => now(), 'dispatched_at' => null]);
                    $task->refresh();
                }
                $tasks->dispatch($task);
            }
        }
        $this->info(($this->option('dry-run') ? 'Simulación. ' : '').'Cargos conocidos pendientes: '.$payments->count().'. Sin cargo conocido: '.$unknown->count());

        return self::SUCCESS;
    }

    private function unresolved()
    {
        return PaymentRequest::where('payment_method', 'culqi')->where('status', 'pending')
            ->whereIn('gateway_state', ['uncertain', 'processing']);
    }

    private function locate(PaymentRequest $payment, Culqi $culqi): void
    {
        $charge = $culqi->findCharge($payment);
        if ($charge) {
            PaymentRequest::whereKey($payment->id)->where('status', 'pending')->whereNull('gateway_charge_id')
                ->update(['gateway_charge_id' => $charge['id']]);
        } elseif ($charge === [] && $payment->updated_at->isBefore(now()->subMinutes(30))) {
            PaymentEvent::record($payment, 'charge_not_found', '', [], 'warning');
        }
    }
}
