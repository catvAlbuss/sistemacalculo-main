<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSubscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'subscription_plan_id',
        'status',
        'starts_at',
        'ends_at',
        'amount_paid',
        'payment_method',
        'transaction_id',
        'notes',
        'cancelled_at',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'amount_paid' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        // Actualizar current_subscription_id cuando se crea una suscripción activa
        static::created(function ($subscription) {
            if ($subscription->status === 'active') {
                $subscription->user->update([
                    'current_subscription_id' => $subscription->id,
                    'subscription_ends_at' => $subscription->ends_at,
                    'is_active' => true,
                ]);
            }
        });

        // Actualizar cuando se cambia el estado a activo
        static::updated(function ($subscription) {
            if ($subscription->isDirty('status') && $subscription->status === 'active') {
                $subscription->user->update([
                    'current_subscription_id' => $subscription->id,
                    'subscription_ends_at' => $subscription->ends_at,
                    'is_active' => true,
                ]);
            }

            // Si se cancela o suspende, buscar la siguiente activa
            if ($subscription->isDirty('status') && in_array($subscription->status, ['cancelled', 'suspended'])) {
                $nextActive = $subscription->user->subscriptions()
                    ->where('status', 'active')
                    ->orderBy('starts_at', 'desc')
                    ->first();

                if ($nextActive) {
                    $subscription->user->update([
                        'current_subscription_id' => $nextActive->id,
                        'subscription_ends_at' => $nextActive->ends_at,
                    ]);
                } else {
                    $subscription->user->update([
                        'current_subscription_id' => null,
                        'subscription_ends_at' => null,
                        'is_active' => false,
                    ]);
                }
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Subscription::class, 'subscription_plan_id');
    }

    public function isActive(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        // Lifetime siempre es activo
        if (!$this->ends_at) {
            return true;
        }

        return $this->ends_at->isFuture();
    }

    public function isExpired(): bool
    {
        if (!$this->ends_at) {
            return false; // Lifetime nunca expira
        }

        return $this->ends_at->isPast();
    }

    public function daysRemaining(): int
    {
        if (!$this->ends_at) {
            return PHP_INT_MAX; // Lifetime
        }

        $days = now()->diffInDays($this->ends_at, false);
        return max(0, (int) ceil($days));
    }

    public function isExpiringSoon(int $days = 7): bool
    {
        if (!$this->ends_at) {
            return false;
        }

        return $this->daysRemaining() <= $days && $this->daysRemaining() > 0;
    }

    public function cancel(): void
    {
        $this->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);

        // Buscar la siguiente suscripción activa del usuario
        $nextSubscription = $this->user->subscriptions()
            ->where('status', 'active')
            ->where('id', '!=', $this->id)
            ->orderBy('starts_at', 'desc')
            ->first();

        if ($nextSubscription) {
            $this->user->update([
                'current_subscription_id' => $nextSubscription->id,
                'subscription_ends_at' => $nextSubscription->ends_at,
            ]);
        } else {
            $this->user->update([
                'current_subscription_id' => null,
                'subscription_ends_at' => null,
                'is_active' => false,
            ]);
        }
    }

    public function suspend(): void
    {
        $this->update(['status' => 'suspended']);

        if ($this->user->current_subscription_id === $this->id) {
            $this->user->update(['is_active' => false]);
        }
    }

    public function reactivate(): void
    {
        $this->update(['status' => 'active']);

        if ($this->user->current_subscription_id === $this->id) {
            $this->user->update(['is_active' => true]);
        }
    }

    public function extend(int $days): void
    {
        if (!$this->ends_at) {
            return; // No se puede extender lifetime
        }

        $newEndDate = $this->ends_at->addDays($days);

        $this->update(['ends_at' => $newEndDate]);

        if ($this->user->current_subscription_id === $this->id) {
            $this->user->update(['subscription_ends_at' => $newEndDate]);
        }
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'active')
            ->whereNotNull('ends_at')
            ->where('ends_at', '<', now());
    }

    public function scopeExpiringSoon($query, int $days = 7)
    {
        return $query->where('status', 'active')
            ->whereNotNull('ends_at')
            ->whereBetween('ends_at', [now(), now()->addDays($days)]);
    }
}
