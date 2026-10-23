<?php

namespace App\Services;

use App\Models\PaymentRequest;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class PlanChanges
{
    public function quote(User $user, Subscription $plan, array $quote): array
    {
        $periods = $user->subscriptions()->with('plan')->where('status', 'active')->where('amount_paid', '>', 0)
            ->where('ends_at', '>', now())->orderBy('starts_at')->get();
        $current = $periods->first(fn ($period) => ! $period->starts_at->isFuture());
        $original = $current ? PaymentRequest::where('user_id', $user->id)->where('gateway_charge_id', $current->transaction_id)
            ->where('status', 'approved')->value('plan_snapshot') : null;
        $oldRate = $original['monthly_reference'] ?? ($current ? $this->monthlyPrice($current->plan) : 0);
        if (! $current || $current->subscription_plan_id === $plan->id || $quote['monthly_reference'] <= $oldRate) {
            throw ValidationException::withMessages(['purchase_mode' => 'El cambio inmediato requiere un plan pagado vigente y un plan de mayor precio mensual.']);
        }
        $sources = [];
        $credit = 0;
        foreach ($periods as $period) {
            $days = max(1, (int) $period->starts_at->copy()->startOfDay()->diffInDays($period->ends_at->copy()->startOfDay()));
            $remaining = $period->starts_at->isFuture() ? $days : max(0, min($days,
                (int) today('America/Lima')->diffInDays($period->ends_at->copy()->timezone('America/Lima')->startOfDay(), false)));
            $basis = (int) round((float) ($period->credit_basis ?? $period->amount_paid) * 100);
            $credit += (int) round($basis * $remaining / $days);
            $sources[] = ['id' => $period->id, 'starts_at' => $period->starts_at->toDateTimeString(),
                'ends_at' => $period->ends_at->toDateTimeString(), 'basis' => $basis];
        }
        if ($credit > (int) round($quote['total'] * 100)) {
            throw ValidationException::withMessages(['months' => 'El saldo por tiempo no usado supera este período. Elige más meses o un año para conservar todo tu saldo.']);
        }

        return ['credit' => $credit / 100, 'sources' => $sources, 'quoted_on' => today('America/Lima')->toDateString()];
    }

    public function monthlyPrice(Subscription $plan): float
    {
        return (float) $plan->price / ($plan->type === 'yearly' ? 12 : max(1, ($plan->duration_days ?? 30) / 30));
    }

    public function ensureDowngradeFits(User $user, Subscription $plan): void
    {
        $current = $user->currentSubscription;
        if (! $current || $this->monthlyPrice($plan) >= $this->monthlyPrice($current->plan) || $plan->max_projects === null) {
            return;
        }
        $count = 0;
        foreach (['cad_models', 'memoria_calculos', 'memorias_descriptivas'] as $table) {
            if (Schema::hasTable($table)) {
                $query = DB::table($table)->where('user_id', $user->id);
                if ($table !== 'cad_models') {
                    $query->whereNull('cad_model_id');
                }
                $count += $query->count();
            }
        }
        if ($count > $plan->max_projects) {
            throw ValidationException::withMessages(['subscription_plan_id' => 'Tienes '.$count.' proyectos guardados y este plan admite '.$plan->max_projects.'. Revisa tus proyectos antes de bajar de plan.']);
        }
    }

    public function matches(User $user, array $change): bool
    {
        $current = $user->subscriptions()->where('status', 'active')->where('amount_paid', '>', 0)
            ->where('ends_at', '>', now())->orderBy('starts_at')->get()->map(fn ($period) => [
                'id' => $period->id, 'starts_at' => $period->starts_at->toDateTimeString(),
                'ends_at' => $period->ends_at->toDateTimeString(),
                'basis' => (int) round((float) ($period->credit_basis ?? $period->amount_paid) * 100),
            ])->all();

        return $current === $change['sources'];
    }

    public function reserve(PaymentRequest $payment): bool
    {
        return DB::transaction(function () use ($payment) {
            $row = PaymentRequest::whereKey($payment->id)->lockForUpdate()->firstOrFail();
            if ($row->status !== 'pending') {
                return false;
            }
            $user = User::whereKey($payment->user_id)->lockForUpdate()->firstOrFail();
            if ($user->payment_in_progress_id && (int) $user->payment_in_progress_id !== $payment->id) {
                return false;
            }
            $change = $payment->plan_snapshot['change'] ?? null;
            if ($change && ($change['quoted_on'] !== today('America/Lima')->toDateString() || ! $this->matches($user, $change))) {
                return false;
            }
            $user->forceFill(['payment_in_progress_id' => $payment->id])->save();

            return true;
        });
    }

    public function release(PaymentRequest $payment): void
    {
        User::whereKey($payment->user_id)->where('payment_in_progress_id', $payment->id)->update(['payment_in_progress_id' => null]);
    }
}
