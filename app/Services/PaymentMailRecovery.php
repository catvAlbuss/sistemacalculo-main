<?php

namespace App\Services;

use App\Models\PaymentEvent;
use App\Models\PaymentRequest;
use App\Models\PaymentTask;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaymentMailRecovery
{
    public const KINDS = ['signup_client', 'signup_admin', 'paid_client', 'paid_admin', 'access_client',
        'renewal_reminder', 'complaint_copy', 'complaint_admin', 'complaint_answer', 'account_deletion_notice', 'account_deleted'];

    public function retry(PaymentTask $task): bool
    {
        if (!in_array($task->kind, self::KINDS, true)) { return false; }
        $updated = PaymentTask::whereKey($task->id)->where('status', 'failed')->update([
            'status' => 'pending', 'attempts' => 0, 'available_at' => now(), 'dispatched_at' => null,
            'locked_at' => null, 'completed_at' => null, 'result' => null,
        ]);
        if (!$updated) { return false; }
        if ($task->payment) {
            PaymentEvent::record($task->payment, 'mail_retry_requested', $task->id.':'.now()->format('U.u'),
                ['task_id' => $task->id, 'requested_by' => auth()->id()]);
        }
        app(PaymentTasks::class)->dispatch($task->fresh());

        return true;
    }

    public function resend(PaymentRequest $payment, string $kind, string $key): PaymentTask
    {
        if (!in_array($kind, ['signup_client', 'paid_client', 'paid_admin', 'access_client'], true)) {
            throw ValidationException::withMessages(['kind' => 'Selecciona un correo disponible.']);
        }
        $task = DB::transaction(function () use ($payment, $kind, $key) {
            $payment = PaymentRequest::whereKey($payment->id)->lockForUpdate()->firstOrFail();
            if (in_array($kind, ['paid_client', 'paid_admin'], true)
                && ($payment->status !== 'approved' || !$payment->gateway_charge_id || !$payment->receipt()->exists()
                    || !$payment->user->subscriptions()->where('transaction_id', $payment->gateway_charge_id)->exists())) {
                throw ValidationException::withMessages(['kind' => 'Solo se reenvían tickets de pagos confirmados con comprobante.']);
            }
            if ($kind === 'access_client' && (!$payment->user->is_active || $payment->user->account_status !== 'enabled')) {
                throw ValidationException::withMessages(['kind' => 'La cuenta no está habilitada para recibir un enlace de acceso.']);
            }
            $task = app(PaymentTasks::class)->create($kind, $payment, [], 'resend:'.$payment->id.':'.$key);
            if ($task->kind !== $kind) {
                throw ValidationException::withMessages(['resend_key' => 'Actualiza la página antes de solicitar otro correo.']);
            }
            PaymentEvent::record($payment, 'mail_resend_requested', (string) $task->id,
                ['task_id' => $task->id, 'kind' => $kind, 'requested_by' => auth()->id()]);

            return $task;
        });
        app(PaymentTasks::class)->dispatch($task);

        return $task;
    }
}
