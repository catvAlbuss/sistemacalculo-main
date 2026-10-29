<?php

namespace App\Services;

use App\Models\PaymentRequest;
use App\Models\PaymentEvent;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class Culqi
{
    public function configurationErrors(): array
    {
        $public = (string) config('services.culqi.public_key');
        $secret = (string) config('services.culqi.secret_key');
        $errors = [];
        if (!preg_match('/^pk_(test|live)_[A-Za-z0-9]+$/', $public, $pk)
            || !preg_match('/^sk_(test|live)_[A-Za-z0-9]+$/', $secret, $sk)) {
            $errors[] = 'Faltan llaves Culqi válidas (pk_test_/sk_test_ o pk_live_/sk_live_).';
        } elseif ($pk[1] !== $sk[1]) {
            $errors[] = 'Las llaves pública y privada deben pertenecer al mismo entorno.';
        } elseif (app()->environment('local', 'testing') && $pk[1] === 'live') {
            $errors[] = 'En local y testing solo se permiten llaves de integración (test).';
        } elseif (app()->isProduction() && $pk[1] !== 'live') {
            $errors[] = 'En producción se requieren llaves live del comercio, no llaves test.';
        }
        if (!preg_match('/^[A-Za-z0-9_-]{32,128}$/', (string) config('services.culqi.webhook_token'))) {
            $errors[] = 'Configura CULQI_WEBHOOK_TOKEN con 32 a 128 caracteres alfanuméricos.';
        }

        return $errors;
    }

    public function enabled(): bool
    {
        return (bool) config('services.culqi.enabled') && $this->configurationErrors() === [];
    }

    public function charge(PaymentRequest $payment, array $data): array
    {
        $lock = Cache::lock('culqi:payment:'.$payment->id, 120);
        if (!$lock->get()) {
            return $this->result(false, 'processing', 'Estamos procesando este pago. Revisa su estado en un momento.');
        }
        try {
            $payment->refresh();
            if ($payment->payment_method !== 'culqi' || $payment->status === 'rejected') {
                return $this->result(false, 'closed', 'Este pago no está disponible.');
            }
            if ($payment->status === 'approved') {
                return $this->result(true, 'paid', 'Este pago ya fue confirmado.');
            }
            if (!$payment->user->is_active) {
                return $this->result(false, 'closed', 'Tu cuenta está suspendida. Contacta con soporte.');
            }
            if ($payment->user->hasPermanentCoverage()) {
                return $this->result(false, 'closed', 'Ya tienes cobertura permanente. Contacta con soporte.');
            }
            // A lost response never expires into permission to charge again.
            if (in_array($payment->gateway_state, ['processing', 'uncertain'], true)) {
                return $this->result(false, 'uncertain', 'Estamos confirmando tu pago. No pagues otra vez; revisa el estado o contáctanos.');
            }
            $until=$payment->plan_snapshot['lifetime_quote']['valid_until'] ?? null;
            if($until && \Illuminate\Support\Carbon::parse($until)->isPast()) {
                return $this->result(false,'closed','Esta propuesta venció. Contáctenos para que root o gerencia emitan una nueva.');
            }
            $context = $payment->gateway_context ?? [];
            if ($payment->gateway_state === 'authentication' && isset($data['authentication_3DS'])) {
                if (!hash_equals($context['token_hash'] ?? '', hash('sha256', $data['token']))
                    || ($context['device_id'] ?? '') !== ($data['device_id'] ?? '')) {
                    return $this->result(false, 'authentication', 'Completa la autenticación de tu tarjeta o recarga la página.');
                }
            } elseif (isset($data['authentication_3DS'])) {
                return $this->result(false, 'invalid', 'La autenticación no corresponde a este intento.');
            }
            if ($payment->currency === 'USD' && str_starts_with($data['token'], 'ype_')) {
                return $this->result(false, 'invalid', 'Yape está disponible en soles. Para USD utiliza tarjeta.');
            }
            $amount = (int) round((float) ($payment->charge_amount ?? $payment->amount) * 100);
            if ($amount < 300) {
                return $this->result(false, 'invalid', 'El monto no permite un pago en línea. Contáctanos para continuar.');
            }
            if (!app(PlanChanges::class)->reserve($payment)) {
                return $this->result(false, 'invalid', 'Hay otro pago pendiente de confirmar o cambió tu cobertura. Revisa Mi plan antes de continuar.');
            }
            $context = ['token_hash' => hash('sha256', $data['token']), 'device_id' => $data['device_id'] ?? null];
            $claim = PaymentRequest::whereKey($payment->id)->where('status', 'pending');
            $payment->gateway_state === null ? $claim->whereNull('gateway_state') : $claim->where('gateway_state', $payment->gateway_state);
            if (!$claim->update(['gateway_state' => 'processing', 'gateway_context' => json_encode($context, JSON_THROW_ON_ERROR)])) {
                return $this->result(false, 'processing', 'Este pago ya está siendo procesado. Revisa su estado.');
            }
            PaymentEvent::record($payment, 'charge_started', $context['token_hash']);
            $names = explode(' ', trim($payment->name), 2);
            $payload = [
                'amount' => $amount,
                'currency_code' => $payment->currency ?: 'PEN',
                'email' => $payment->email,
                'source_id' => $data['token'],
                'capture' => true,
                'description' => $payment->purchaseDescription(),
                'metadata' => ['payment_request_id' => (string) $payment->id, 'payment_reference' => $payment->token, 'application' => 'rizabal'],
                'antifraud_details' => array_filter([
                    'first_name' => $names[0], 'last_name' => $names[1] ?? $names[0],
                    'phone_number' => $payment->phone,
                    'device_finger_print_id' => $data['device_id'] ?? null,
                ]),
            ];
            if (isset($data['authentication_3DS'])) {
                $payload['authentication_3DS'] = $data['authentication_3DS'];
            }
            try {
                // Never retry a charge automatically: a timeout may hide a successful debit.
                $response = Http::withToken(config('services.culqi.secret_key'))->acceptJson()->timeout(40)
                    ->post(config('services.culqi.api_url').'/charges', $payload);
            } catch (ConnectionException) {
                return $this->uncertain($payment);
            }
            $charge = $response->json();
            if (!is_array($charge) || $response->serverError() || $response->status() === 408) {
                return $this->uncertain($payment);
            }
            if ($response->successful() && ($charge['action_code'] ?? null) === 'REVIEW'
                && ($charge['object'] ?? null) !== 'charge') {
                PaymentRequest::whereKey($payment->id)->where('status', 'pending')->where('gateway_state', 'processing')->update(['gateway_state' => 'authentication']);
                PaymentEvent::record($payment, 'authentication_required', $context['token_hash']);

                return $this->result(false, 'requires_3ds', 'Confirma tu tarjeta con el banco.');
            }
            if (!$response->successful()) {
                PaymentRequest::whereKey($payment->id)->where('status', 'pending')->where('gateway_state', 'processing')->update(['gateway_state' => 'declined', 'gateway_context' => null]);
                PaymentEvent::record($payment, 'declined', $context['token_hash']);
                app(PlanChanges::class)->release($payment);

                return $this->result(false, 'declined', 'El pago fue rechazado. Revisa los datos o usa otro medio de pago.');
            }
            $id = $charge['id'] ?? null;
            if (($charge['object'] ?? null) !== 'charge' || !is_string($id) || !str_starts_with($id, 'chr_')) {
                return $this->uncertain($payment);
            }
            PaymentRequest::whereKey($payment->id)->where('status', 'pending')->whereNull('gateway_charge_id')->update(['gateway_charge_id' => $id]);
            $confirmed = $this->fetchCharge($id);
            if (!$confirmed || !$this->confirm($payment, $confirmed)) {
                return $this->uncertain($payment);
            }

            return $this->result(true, 'paid', '¡Pago confirmado! Tu cobertura quedó registrada. Puedes revisar sus fechas en Mi plan.');
        } finally {
            $lock->release();
        }
    }

    private function uncertain(PaymentRequest $payment): array
    {
        // A webhook can win the race while the HTTP response is being handled.
        PaymentRequest::whereKey($payment->id)->where('status', 'pending')->update(['gateway_state' => 'uncertain']);
        $payment->refresh();
        if ($payment->status === 'approved') {
            return $this->result(true, 'paid', 'Tu pago está confirmado.');
        }
        PaymentEvent::record($payment, 'uncertain', (string) ($payment->gateway_context['token_hash'] ?? ''), [], 'warning');

        return $this->result(false, 'uncertain', 'Estamos confirmando tu pago. No pagues otra vez; revisa el estado o contáctanos.');
    }

    public function fetchCharge(string $id): ?array
    {
        if (!preg_match('/^chr_[A-Za-z0-9_]+$/', $id)) {
            return null;
        }
        try {
            $response = Http::withToken(config('services.culqi.secret_key'))->acceptJson()->timeout(20)
                ->get(config('services.culqi.api_url').'/charges/'.$id);
        } catch (ConnectionException) {
            return null;
        }
        $charge = $response->json();

        return $response->successful() && is_array($charge)
            && ($charge['object'] ?? null) === 'charge' && ($charge['id'] ?? null) === $id ? $charge : null;
    }

    public function confirm(PaymentRequest $payment, array $charge): bool
    {
        $activated = false;
        $ok = DB::transaction(function () use ($payment, $charge, &$activated) {
            $row = PaymentRequest::whereKey($payment->id)->lockForUpdate()->firstOrFail();
            $reference = $charge['metadata']['payment_reference'] ?? null;
            $referenceMatches = !$row->checkout_key && $reference === null
                ? true : is_string($reference) && hash_equals($row->token, $reference);
            $source = $charge['source']['id'] ?? null;
            $tokenHash = $row->gateway_context['token_hash'] ?? null;
            $sourceMatches = !$tokenHash || (is_string($source) && hash_equals($tokenHash, hash('sha256', $source)));
            $mode = str_starts_with((string) config('services.culqi.secret_key'), 'sk_live_') ? 'live' : 'test';
            if ($row->payment_method !== 'culqi' || ($charge['object'] ?? '') !== 'charge'
                || !preg_match('/^chr_'.$mode.'_[A-Za-z0-9_]+$/', $charge['id'] ?? '')
                || !$referenceMatches || !$sourceMatches
                || ($charge['outcome']['type'] ?? '') !== 'venta_exitosa'
                || ($charge['capture'] ?? false) !== true || (int) ($charge['amount_refunded'] ?? 0) !== 0
                || ($charge['currency_code'] ?? '') !== ($row->currency ?: 'PEN')
                || (int) ($charge['amount'] ?? 0) !== (int) round((float) ($row->charge_amount ?? $row->amount) * 100)
                || (string) ($charge['metadata']['payment_request_id'] ?? '') !== (string) $row->id
                || ($charge['metadata']['application'] ?? '') !== 'rizabal') {
                Log::warning('Cargo Culqi no coincide', ['payment_request_id' => $row->id, 'charge_id' => $charge['id'] ?? null]);
                PaymentEvent::record($row, 'charge_mismatch', (string) ($charge['id'] ?? ''), ['charge_id' => $charge['id'] ?? null], 'warning');

                return false;
            }
            if ($row->status === 'approved') {
                if ($row->gateway_charge_id !== $charge['id']) {
                    PaymentEvent::record($row, 'duplicate_charge', $charge['id'], ['charge_id' => $charge['id']], 'warning');
                }
                return $row->gateway_charge_id === $charge['id'];
            }
            if ($row->status !== 'pending' || ($row->gateway_charge_id && $row->gateway_charge_id !== $charge['id'])) {
                Log::error('Cargo Culqi requiere revisión manual', ['payment_request_id' => $row->id, 'charge_id' => $charge['id']]);
                PaymentEvent::record($row, 'closed_payment_charge', $charge['id'], ['charge_id' => $charge['id']], 'warning');

                return false;
            }
            $plan = $row->plan;
            $user = User::whereKey($row->user_id)->lockForUpdate()->firstOrFail();
            if (!$user->is_active) {
                PaymentEvent::record($row, 'suspended_account_charge', $charge['id'], ['charge_id' => $charge['id']], 'warning');
                return false;
            }
            $snapshot = $row->plan_snapshot ?? [];
            $change = $snapshot['change'] ?? null;
            if (($user->payment_in_progress_id && (int) $user->payment_in_progress_id !== $row->id)
                || ($change && !app(PlanChanges::class)->matches($user, $change))) {
                PaymentEvent::record($row, 'coverage_changed', $charge['id'], ['charge_id' => $charge['id']], 'warning');
                return false;
            }
            // Serialize renewals on the user row: concurrent paid orders append distinct periods.
            $paid = $user->subscriptions()->where('status', 'active')->where('amount_paid', '>', 0)
                ->where(fn ($query) => $query->whereNull('ends_at')->orWhere('ends_at', '>', now()));
            if ($user->hasPermanentCoverage()) {
                PaymentEvent::record($row, 'permanent_plan_charge', $charge['id'], ['charge_id' => $charge['id']], 'warning');
                return false;
            }
            $end = $paid->max('ends_at');
            $start = $change ? now(config('app.timezone')) : ($end ? \Illuminate\Support\Carbon::parse($end, config('app.timezone')) : now(config('app.timezone')));
            if ($change) {
                // Query update intentionally avoids lifecycle hooks that would suspend the account mid-change.
                $user->subscriptions()->whereIn('id', array_column($change['sources'], 'id'))
                    ->update(['status' => 'cancelled', 'cancelled_at' => now()]);
            }
            $subscription = $user->subscriptions()->create([
                'subscription_plan_id' => $plan->id, 'status' => 'active', 'starts_at' => $start,
                'ends_at' => ($snapshot['type'] ?? $plan->type) === 'lifetime' ? null
                    : (!empty($snapshot['duration_months']) ? $start->copy()->addMonthsNoOverflow($snapshot['duration_months'])
                        : $start->copy()->addDays($snapshot['duration_days'] ?? $plan->duration_days)),
                'amount_paid' => $row->amount, 'payment_method' => 'culqi', 'transaction_id' => $charge['id'],
                'credit_basis' => $snapshot['plan_total'] ?? $row->amount,
                'notes' => 'Pago confirmado por Culqi',
            ]);
            if (!$start->isFuture()) {
                $user->subscriptions()->whereKeyNot($subscription->id)->where('status', 'active')->where('amount_paid', 0)
                    ->update(['status' => 'cancelled', 'cancelled_at' => now()]);
            }
            $row->update([
                'status' => 'approved', 'confirmed_at' => now(), 'gateway_charge_id' => $charge['id'],
                'gateway_state' => 'paid', 'gateway_context' => null,
            ]);
            app(Billing::class)->issue($row);
            app(PlanChanges::class)->release($row);
            app(PaymentTasks::class)->create('paid_client', $row);
            PaymentEvent::record($row, 'paid', $charge['id'], [
                'charge_id' => $charge['id'], 'amount' => $row->charge_amount ?? $row->amount, 'currency' => $row->currency ?: 'PEN',
                'starts_at' => $subscription->starts_at->toIso8601String(), 'ends_at' => $subscription->ends_at?->toIso8601String(),
            ]);
            $activated = true;

            return true;
        });
        if ($activated) {
            app(PaymentTasks::class)->dispatchFor($payment);
        }

        return $ok;
    }

    private function result(bool $ok, string $code, string $message): array
    {
        return compact('ok', 'code', 'message');
    }
}
