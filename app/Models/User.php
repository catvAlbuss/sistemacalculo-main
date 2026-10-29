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

    protected $attributes = ['account_status' => 'enabled', 'session_version' => 0];

    protected static function booted(): void
    {
        static::saving(function (User $user) {
            if ($user->account_status !== 'enabled') { $user->is_active = false; }
        });
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'phone',
        'profession',
        'company',
        'city',
        'bio',
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
        'payment_in_progress_id',
        'project_restore_version',
        'session_version',
        'account_status_reason',
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
            'payment_in_progress_id' => 'integer',
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
            ->where('starts_at', '<=', now())
            ->where(fn ($query) => $query->whereNull('payment_method')->orWhere('payment_method', '!=', 'trial')
                ->orWhere('starts_at', '>', now()->subDays(\App\Services\TrialAccess::DAYS)))
            ->where(fn ($query) => $query->whereNull('ends_at')->orWhere('ends_at', '>', now()))
            ->latest('starts_at');
    }

    public function activeSubscription()
    {
        return $this->hasOne(UserSubscription::class)
            ->where('status', 'active')
            ->where('starts_at', '<=', now())
            ->where(fn ($query) => $query->whereNull('payment_method')->orWhere('payment_method', '!=', 'trial')
                ->orWhere('starts_at', '>', now()->subDays(\App\Services\TrialAccess::DAYS)))
            ->where(fn ($query) => $query->whereNull('ends_at')->orWhere('ends_at', '>', now()))
            ->latest('starts_at');
    }

    public function hasActiveSubscription(): bool
    {
        if (!$this->is_active || $this->account_status !== 'enabled') {
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

    public function hasPermanentCoverage(): bool
    {
        return $this->subscriptions()->where('status', 'active')
            ->where(fn ($query) => $query->whereNull('payment_method')->orWhere('payment_method', '!=', 'trial'))
            ->whereNull('ends_at')->exists();
    }

    public function daysRemaining(): int
    {
        $subscription = $this->currentSubscription;
        return $subscription ? $subscription->daysRemaining() : 0;
    }

    public function canAccess(string $section): bool
    {
        if ($this->account_status !== 'enabled') {
            return false;
        }

        // Root y Gerencia tienen acceso a todo
        if ($this->hasRole(['root', 'gerencia'])) {
            return true;
        }
        if (!$this->hasActiveSubscription()) {
            return false;
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
        return $this->account_status === 'enabled' && $this->hasRole(['root', 'gerencia']);
    }

    public function canManagePlans(): bool
    {
        return $this->canManageUsers();
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
        return $this->hasMany(session::class)
            ->where('last_activity', '>=', now()->subMinutes(30)->timestamp);
    }

    public function accountSessions()
    {
        return $this->hasMany(AccountSession::class)->where('last_seen_at', '>=', now()->subMinutes(config('session.lifetime', 120)));
    }

    public function securityEvents()
    {
        return $this->hasMany(AccountSecurityEvent::class)->latest('id');
    }
}

//php artisan make:livewire SubscriptionPlansManagement 
