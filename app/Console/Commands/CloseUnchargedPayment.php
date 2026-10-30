<?php

namespace App\Console\Commands;

use App\Models\PaymentEvent;
use App\Models\PaymentRequest;
use App\Services\Culqi;
use App\Services\PlanChanges;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CloseUnchargedPayment extends Command
{
    protected $signature = 'payments:close-uncharged {payment} {--confirm : Ya se verificó en el panel de Culqi que no existe el cargo}';
    protected $description = 'Cierra un pago sin resultado cuando se comprobó que Culqi no registró un cargo';

    public function handle(Culqi $culqi): int
    {
        $payment = PaymentRequest::find($this->argument('payment'));
        if (!$payment || $payment->status !== 'pending' || $payment->gateway_charge_id
            || !in_array($payment->gateway_state, ['processing', 'uncertain'], true)
            || $payment->updated_at->isAfter(now()->subMinutes(30))) {
            $this->error('Solo se cierran pagos sin cargo conocido y sin resultado desde hace 30 minutos.');

            return self::FAILURE;
        }
        if ($culqi->findCharge($payment) !== []) {
            $this->error('Culqi no respondió o el cargo existe. El pago sigue abierto.');

            return self::FAILURE;
        }
        if (!$this->option('confirm')) {
            $this->warn('La consulta no halló el cargo. Revisa el panel de Culqi y repite con --confirm para cerrarlo.');

            return self::FAILURE;
        }
        $closed = DB::transaction(function () use ($payment) {
            $updated = PaymentRequest::whereKey($payment->id)->where('status', 'pending')->whereNull('gateway_charge_id')
                ->whereIn('gateway_state', ['processing', 'uncertain'])
                ->update(['status' => 'rejected', 'gateway_state' => 'no_charge', 'rejected_at' => now(), 'gateway_context' => null,
                    'rejection_reason' => 'Cerrada tras comprobar que Culqi no registró un cargo.']);
            if ($updated) {
                app(PlanChanges::class)->release($payment);
                PaymentEvent::record($payment, 'closed_without_charge');
            }

            return (bool) $updated;
        });
        if (!$closed) {
            $this->error('El pago cambió durante la verificación y sigue sin cerrarse.');

            return self::FAILURE;
        }
        $this->info('Pago cerrado. El cliente ya puede intentar otra compra.');

        return self::SUCCESS;
    }
}
