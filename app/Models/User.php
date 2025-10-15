<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'current_subscription_id',
        'is_active',
        'subscription_ends_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'subscription_ends_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(UserSubscription::class);
    }

    public function currentSubscription()
    {
        return $this->hasOne(UserSubscription::class)
            ->where('status', 'active')
            ->latest('starts_at');
    }

    public function activeSubscription()
    {
        return $this->hasOne(UserSubscription::class)
            ->where('status', 'active')
            ->latest('starts_at');
    }

    public function hasActiveSubscription(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $subscription = $this->currentSubscription;

        if (!$subscription) {
            return false;
        }

        return $subscription->isActive();
    }

    public function isOnTrial(): bool
    {
        $subscription = $this->currentSubscription;
        return $subscription && $subscription->plan->isTrial();
    }

    public function hasLifetimeSubscription(): bool
    {
        $subscription = $this->currentSubscription;
        return $subscription && $subscription->plan->isLifetime();
    }

    public function daysRemaining(): int
    {
        $subscription = $this->currentSubscription;
        return $subscription ? $subscription->daysRemaining() : 0;
    }

    public function canAccess(string $section): bool
    {
        if (!$this->is_active || !$this->hasActiveSubscription()) {
            return false;
        }

        // Root y Gerencia tienen acceso a todo
        if ($this->hasRole(['root', 'gerencia'])) {
            return true;
        }

        // Verificar acceso por sección según rol
        switch ($section) {
            case 'users':
            case 'plans':
                return $this->hasRole(['root', 'gerencia']);

            case 'assistant':
                return $this->hasRole(['root', 'gerencia', 'asistente']);

            case 'software':
            case 'student':
                return true; // Todos los usuarios autenticados con suscripción activa

            default:
                return false;
        }
    }

    public function canManageUsers(): bool
    {
        return $this->hasRole(['root', 'gerencia']);
    }

    public function canManagePlans(): bool
    {
        return $this->hasRole(['root', 'gerencia']);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeWithExpiredSubscription($query)
    {
        return $query->whereHas('currentSubscription', function ($q) {
            $q->where('status', 'active')
                ->whereNotNull('ends_at')
                ->where('ends_at', '<', now());
        });
    }

    public function setNameAttribute($value)
    {
        $this->attributes['name'] = strtoupper($value);
    }
    public function activeSessions()
    {
        return $this->hasMany(Session::class)
            ->where('last_activity', '>=', now()->subMinutes(30)->timestamp);
    }
}

//php artisan make:livewire SubscriptionPlansManagement 
