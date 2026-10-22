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
        if ($plan->type === 'yearly' && ($slug = config('payments.annual_bases.'.$plan->slug))) {
            $base = Subscription::active()->where('type', 'monthly')->where('slug', $slug)->first();
            if (!$base || $base->isFree()) {
                throw ValidationException::withMessages(['billing_cycle' => 'El precio mensual de referencia no está disponible.']);
            }
        }
        $annualDiscount = $cycle === 'yearly' && $base->type === 'monthly';
        $cents = (int) round((float) $base->price * 100);
        $list = $annualDiscount ? $cents * 12 : $cents * $months;
        $discount = $annualDiscount ? (int) round($list * 5 / 100) : 0;
        $total = $list - $discount;

        return array_merge(app(Billing::class)->breakdown($total / 100), [
            'billing_cycle' => $cycle, 'list_total' => $list / 100,
            'discount' => $discount / 100, 'discount_percent' => $annualDiscount ? 5 : 0,
            'duration_days' => $cycle === 'yearly' ? 365 : ($plan->duration_days === null ? null : $plan->duration_days * $months),
            'duration_months' => $cycle === 'yearly' ? 12 : null,
            'duration_text' => $cycle === 'yearly' ? '1 año' : ($months > 1 ? $months.' meses' : $plan->duration_text),
            'months' => $cycle === 'yearly' ? 12 : $months,
            'features' => $plan->features ?? [], 'max_users' => $plan->max_users, 'max_projects' => $plan->max_projects,
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
}
