<?php

namespace App\Services;

use App\Jobs\ProcessPaymentTask;
use App\Mail\PaymentReceipt;
use App\Mail\SolicitudAdmin;
use App\Mail\SolicitudCliente;
use App\Models\PaymentRequest;
use App\Models\PaymentTask;
use App\Models\UserSubscription;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class PaymentTasks
{
    public function create(string $kind, ?PaymentRequest $payment, array $payload = [], ?string $identity = null): PaymentTask
    {
        $identity ??= in_array($kind, ['webhook', 'reconcile'], true) ? $payload['charge_id'] : (string) $payment->id;

        return PaymentTask::firstOrCreate(['task_key' => hash('sha256', $kind.':'.$identity)], [
            'kind' => $kind, 'payment_request_id' => $payment?->id, 'payload' => $payload,
            'status' => 'pending', 'available_at' => now(),
        ]);
    }

    /** Durable rows are created in the business transaction; dispatch happens only after it returns. */
    public function dispatch(PaymentTask $task): void
    {
        if ($task->status !== 'pending' || ($task->available_at && $task->available_at->isFuture())
            || ($task->dispatched_at && $task->dispatched_at->isAfter(now()->subMinutes(10)))) {
            return;
        }
        try {
            ProcessPaymentTask::dispatch($task->id);
            PaymentTask::whereKey($task->id)->update(['dispatched_at' => now()]);
        } catch (\Throwable) {
            // The outbox remains pending and the scheduler can enqueue it after the broker recovers.
            Log::warning('Tarea de pago pendiente de encolar', ['task_id' => $task->id, 'kind' => $task->kind]);
        }
    }

    public function dispatchFor(PaymentRequest $payment): void
    {
        foreach (PaymentTask::where('payment_request_id', $payment->id)->where('status', 'pending')->get() as $task) {
            $this->dispatch($task);
        }
    }

    public function run(int $id): void
    {
        $task = DB::transaction(function () use ($id) {
            $row = PaymentTask::whereKey($id)->lockForUpdate()->first();
            if (!$row || $row->status !== 'pending' || ($row->available_at && $row->available_at->isFuture())) {
                return null;
            }
            if ($row->attempts >= 5) {
                $row->update(['status' => 'failed']);

                return null;
            }
            $row->update(['status' => 'processing', 'locked_at' => now(), 'attempts' => $row->attempts + 1]);

            return $row;
        });
        if (!$task) {
            return;
        }
        $mailConfigurationError = false;
        try {
            if (app()->isProduction() && in_array($task->kind, PaymentMailRecovery::KINDS, true)
                && app(MailConfiguration::class)->errors() !== []) {
                $mailConfigurationError = true;
                throw new \RuntimeException('Proveedor de correo sin configurar.');
            }
            $result = match ($task->kind) {
                'webhook', 'reconcile' => $this->webhook($task),
                'renewal_reminder' => $this->reminder($task),
                'account_deletion_notice', 'account_deleted' => $this->cuenta($task),
                'complaint_copy', 'complaint_admin', 'complaint_answer' => $this->complaint($task),
                default => $this->mail($task),
            };
            $task->update(['status' => 'completed', 'completed_at' => now(), 'locked_at' => null, 'payload' => null, 'result' => $result]);
        } catch (\Throwable $exception) {
            $delay = [30, 120, 300, 600, 600][min($task->attempts - 1, 4)];
            $hostingerError = $exception instanceof \App\Mail\Transport\HostingerMailException;
            $task->update(['status' => $task->attempts >= 5 || ($hostingerError && !$exception->retryable) ? 'failed' : 'pending', 'locked_at' => null,
                'available_at' => now()->addSeconds($delay), 'result' => $mailConfigurationError ? 'mail_configuration'
                    : ($hostingerError ? $exception->deliveryResult : 'retry_required')]);
            Log::warning('Tarea de pago no completada', ['task_id' => $task->id, 'kind' => $task->kind,
                'attempt' => $task->attempts, 'result' => $task->result]);
            // Avoid putting SMTP credentials, document data or provider response bodies in failed_jobs.
            throw new \RuntimeException('No se completó la tarea de pago '.$task->id.'.');
        }
    }

    private function webhook(PaymentTask $task): string
    {
        $culqi = app(Culqi::class);
        $charge = $culqi->fetchCharge($task->payload['charge_id']);
        if (!$charge) {
            throw new \RuntimeException('Cargo no disponible.');
        }
        if (($charge['metadata']['application'] ?? '') !== 'rizabal') {
            return 'foreign_application';
        }
        $payment = PaymentRequest::find((int) ($charge['metadata']['payment_request_id'] ?? 0));
        if (!$payment) {
            return 'unknown_payment';
        }
        if ($task->kind === 'reconcile' && $task->payment_request_id !== $payment->id) {
            \App\Models\PaymentEvent::record($task->payment, 'charge_mismatch', $charge['id'], ['charge_id' => $charge['id']], 'warning');
            return 'review_required';
        }
        $task->update(['payment_request_id' => $payment->id]);

        return $culqi->confirm($payment, $charge) ? 'confirmed' : 'review_required';
    }

    private function mail(PaymentTask $task): string
    {
        $payment = PaymentRequest::with('user', 'plan')->findOrFail($task->payment_request_id);
        $purchasedPlan = $payment->purchasedPlan();
        if ($task->kind === 'access_client') {
            if (!$payment->user->is_active || $payment->user->account_status !== 'enabled') {
                return 'account_unavailable';
            }
            $url = route('password.reset', ['token' => \Illuminate\Support\Facades\Password::createToken($payment->user),
                'email' => $payment->user->email]);
            Mail::to($payment->user->email)->send(new \App\Mail\AccountAccessLink($payment->user->name, $url));
        } elseif ($task->kind === 'signup_client') {
            $activationUrl = ($task->payload['new_account'] ?? false)
                ? route('password.reset', ['token' => \Illuminate\Support\Facades\Password::createToken($payment->user), 'email' => $payment->email]) : null;
            Mail::to($payment->email)->send(new SolicitudCliente($payment->user, $purchasedPlan, $payment, null, $activationUrl));
        } elseif ($task->kind === 'signup_admin') {
            Mail::to(config('mail.admin_email'))->send(new SolicitudAdmin($payment->user, $purchasedPlan, $payment));
        } elseif (in_array($task->kind, ['paid_client', 'paid_admin'], true)) {
            $subscription = UserSubscription::where('user_id', $payment->user_id)->where('transaction_id', $payment->gateway_charge_id)->firstOrFail();
            $forAdmin = $task->kind === 'paid_admin';
            Mail::to($forAdmin ? config('mail.admin_email') : $payment->email)
                ->send(new PaymentReceipt($payment, $purchasedPlan, $subscription, $forAdmin));
        } else {
            throw new \RuntimeException('Tipo de tarea desconocido.');
        }

        return 'sent';
    }

    private function reminder(PaymentTask $task): string
    {
        $subscription = UserSubscription::with('user', 'plan')->find($task->payload['subscription_id']);
        if (!$subscription || !$subscription->user->is_active || !$subscription->isActive()
            || $subscription->ends_at?->toDateString() !== $task->payload['ends_at']
            || $subscription->user->currentSubscription?->id !== $subscription->id
            || $subscription->user->subscriptions()->where('status', 'active')->where('amount_paid', '>', 0)
                ->whereKeyNot($subscription->id)->where('starts_at', '>=', $subscription->ends_at)->exists()) {
            return 'superseded';
        }
        Mail::to($subscription->user->email)->send(new \App\Mail\RenewalReminder($subscription, (int) ($task->payload['days'] ?? 0)));

        return 'sent';
    }

    // Avisos del ciclo de vida de la cuenta (accounts:expire): un día antes de la baja y la baja.
    private function cuenta(PaymentTask $task): string
    {
        $user = \App\Models\User::find($task->payload['user_id'] ?? null);
        if (!$user || !$user->email) {
            return 'superseded';
        }
        if ($task->kind === 'account_deletion_notice') {
            // Renovó o ya no está habilitada: el aviso ya no corresponde.
            if ($user->account_status !== 'enabled' || $user->currentSubscription()->exists()) {
                return 'superseded';
            }
            Mail::to($user->email)->send(new \App\Mail\AccountDeletionNotice($user, $task->payload['ends_at'], $task->payload['baja']));

            return 'sent';
        }
        if ($user->account_status !== 'deleted') {
            return 'superseded';
        }
        Mail::to($user->email)->send(new \App\Mail\AccountDeactivated($user, (int) config('subscriptions.dias_para_baja', 7)));

        return 'sent';
    }

    private function complaint(PaymentTask $task): string
    {
        $complaint = \App\Models\Complaint::findOrFail($task->payload['complaint_id']);
        $recipient = $task->kind === 'complaint_admin' ? ($complaint->provider['email'] ?? null) : $complaint->email;
        if (!$recipient) {
            throw new \RuntimeException('Configura el correo de atención del Libro de Reclamaciones.');
        }
        Mail::to($recipient)->send(new \App\Mail\ComplaintNotification($complaint, $task->kind === 'complaint_answer'));

        return 'sent';
    }
}
