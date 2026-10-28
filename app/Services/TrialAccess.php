<?php

namespace App\Services;

use App\Models\Subscription;
use App\Models\User;
use App\Models\UserSubscription;
use Illuminate\Validation\ValidationException;

class TrialAccess
{
    public const DAYS = 5;

    public function ensureEligible(User $user): void
    {
        if ($user->subscriptions()->exists()) {
            throw ValidationException::withMessages(['subscription_plan_id' => 'La prueba gratuita se ofrece una sola vez por cuenta durante 5 días. Para continuar, elige un plan pagado.']);
        }
    }

    /** Caller holds the user row lock, preventing concurrent trial activations. */
    public function activate(User $user, Subscription $plan): UserSubscription
    {
        $this->ensureEligible($user);
        return $user->subscriptions()->create([
            'subscription_plan_id' => $plan->id, 'status' => 'active', 'starts_at' => now(),
            'ends_at' => now()->addDays(self::DAYS), 'amount_paid' => 0, 'payment_method' => 'trial',
            'notes' => 'Prueba gratuita única de 5 días. Requiere un plan pagado al vencer.',
        ]);
    }
}
