<?php

namespace App\Services;

use App\Models\Subscription;
use Illuminate\Validation\ValidationException;

class PlanPricing
{
    public function quote(Subscription $plan, ?string $cycle = null, int $months = 1): array
    {
        $default = $plan->type === 'yearly' ? 'yearly' : 'monthly';
        $cycle ??= $default;
        $canChoose = $plan->type === 'monthly' && !$plan->isFree();
        if ($months < 1 || $months > 12 || (!$canChoose && $months !== 1) || ($cycle === 'yearly' && $months !== 1)) {
            throw ValidationException::withMessages(['months' => 'Selecciona de 1 a 12 meses; el pago anual cubre un año completo.']);
        }
        if (!in_array($cycle, $canChoose ? ['monthly', 'yearly'] : [$default], true)) {
            throw ValidationException::withMessages(['billing_cycle' => 'Selecciona un período válido para este plan.']);
        }
        $base = $plan;
        $periodMonths = 1;
        // Planes por período (trimestral, semestral): el Plan Mensual por N meses, sin descuento.
        $period = config('payments.period_bases.'.$plan->slug);
        $baseSlug = $plan->type === 'yearly' ? config('payments.annual_bases.'.$plan->slug) : ($period['base'] ?? null);
        if ($baseSlug) {
            $base = Subscription::active()->where('type', 'monthly')->where('slug', $baseSlug)->first();
            if (!$base || $base->isFree()) {
                throw ValidationException::withMessages(['billing_cycle' => 'El precio mensual de referencia no está disponible.']);
            }
            $periodMonths = $period ? (int) $period['months'] : 1;
        }
        $annualDiscount = $cycle === 'yearly' && $base->type === 'monthly';
        $cents = (int) round((float) $base->price * 100);
        $list = $annualDiscount ? $cents * 12 : $cents * $months * $periodMonths;
        $discount = $annualDiscount ? (int) round($list * 5 / 100) : 0;
        $total = $list - $discount;

        return array_merge(app(Billing::class)->breakdown($total / 100), [
            'billing_cycle' => $cycle, 'list_total' => $list / 100,
            'discount' => $discount / 100, 'discount_percent' => $annualDiscount ? 5 : 0,
            'duration_days' => $plan->isFree() ? TrialAccess::DAYS : ($cycle === 'yearly' ? 365 : ($plan->duration_days === null ? null : $plan->duration_days * $months)),
            'duration_months' => $cycle === 'yearly' ? 12 : null,
            'duration_text' => $plan->isFree() ? TrialAccess::DAYS.' días' : ($cycle === 'yearly' ? '1 año' : ($months > 1 ? $months.' meses' : $plan->duration_text)),
            'months' => $cycle === 'yearly' ? 12 : $months,
            'features' => $plan->features ?? [], 'max_users' => $plan->max_users, 'max_projects' => $plan->max_projects,
            'monthly_reference' => app(PlanChanges::class)->monthlyPrice($base),
        ]);
    }

    public function options(Subscription $plan, int $months = 1): array
    {
        if ($plan->type === 'monthly' && !$plan->isFree()) {
            return ['monthly' => $this->quote($plan, 'monthly', $months), 'yearly' => $this->quote($plan, 'yearly')];
        }
        $quote = $this->quote($plan);

        return [$quote['billing_cycle'] => $quote];
    }

    public function purchaseQuote(Subscription $plan, ?string $cycle, int $months, string $currency = 'PEN', ?\App\Models\User $user = null, string $mode = 'renew'): array
    {
        $quote = $this->quote($plan, $cycle, $months);
        if ($user) { app(PlanChanges::class)->ensureDowngradeFits($user, $plan); }
        $quote['plan_total'] = $quote['total'];
        $quote['credit'] = 0;
        if ($mode === 'upgrade') {
            if (!$user || $plan->isFree() || $plan->isLifetime()) {
                throw ValidationException::withMessages(['purchase_mode' => 'Inicia sesión y selecciona un plan pagado para cambiar de inmediato.']);
            }
            $quote['change'] = app(PlanChanges::class)->quote($user, $plan, $quote);
            $quote['credit'] = $quote['change']['credit'];
            $quote = array_merge($quote, app(Billing::class)->breakdown(round($quote['total'] - $quote['credit'], 2)));
        }
        $rate = $currency === 'USD' ? \App\Models\ExchangeRate::current() : null;
        if (!in_array($currency, ['PEN', 'USD'], true) || ($currency === 'USD' && !$rate)) {
            throw ValidationException::withMessages(['currency' => 'USD requiere un tipo de cambio vigente. Puedes continuar en soles.']);
        }
        $quote['currency'] = $currency;
        $quote['charge_amount'] = $rate ? ceil(round($quote['total'] / (float) $rate->sell * 100, 6)) / 100 : $quote['total'];
        $quote['service_total'] = $quote['total'];
        $quote['processing_fee'] = 0;
        $quote['processing'] = null;
        if (!$plan->isFree() && !$plan->isLifetime()) {
            $processing = app(ProcessingPrice::class)->quote((int) round($quote['charge_amount'] * 100), $currency, $rate);
            $quote['charge_amount'] = $processing['gross_cents'] / 100;
            if ($processing['details']) {
                $finalPen = $rate ? round($quote['charge_amount'] * (float) $rate->sell, 2) : $quote['charge_amount'];
                $quote['processing_fee'] = round($finalPen - $quote['service_total'], 2);
                $quote['processing'] = $processing['details'];
                $quote = array_merge($quote, app(Billing::class)->breakdown($finalPen));
            }
        }
        $quote['exchange_rate'] = $rate ? (float) $rate->sell : null;
        $quote['exchange_rate_date'] = $rate?->date->toDateString();
        $quote['pricing_key'] = hash_hmac('sha256', json_encode([$plan->id, $user?->id, $mode, $quote], JSON_THROW_ON_ERROR), config('app.key'));
        return $quote;
    }

    public function publicQuote(Subscription $plan): array
    {
        try {
            return $this->purchaseQuote($plan, null, 1) + ['pricing_available' => true];
        } catch (ValidationException $exception) {
            $errors = $exception->errors();
            if (isset($errors['processing'])) {
                return $this->quote($plan) + ['pricing_available' => false, 'pricing_error' => $errors['processing'][0]];
            }
            // Plan calculado desde otro (anual o por período) cuyo plan mensual de referencia no está activo.
            if (isset($errors['billing_cycle'])) {
                return ['pricing_available' => false, 'pricing_error' => $errors['billing_cycle'][0]];
            }
            throw $exception;
        }
    }
}
