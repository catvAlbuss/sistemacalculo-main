<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'duration_days',
        'type',
        'is_active',
        'features',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'duration_days' => 'integer',
        'is_active' => 'boolean',
        'features' => 'array',
        'sort_order' => 'integer',
    ];

    // Devuelve todas las suscripciones de usuario relacionadas con este plan
    public function userSubscriptions(): HasMany
    {
        return $this->hasMany(UserSubscription::class, 'subscription_plan_id', 'id');
    }

    // Devuelve solo las suscripciones activas
    public function activeSubscriptions(): HasMany
    {
        return $this->hasMany(UserSubscription::class, 'subscription_plan_id', 'id')
            ->where('status', 'active');
    }


    public function isLifetime(): bool
    {
        return $this->type === 'lifetime';
    }

    public function isTrial(): bool
    {
        return $this->type === 'trial';
    }

    public function isFree(): bool
    {
        return $this->price == 0;
    }

    public function getFormattedPriceAttribute(): string
    {
        if ($this->price == 0) {
            return 'Gratis';
        }
        return 'S/ ' . number_format($this->price, 2);
    }

    public function getDurationTextAttribute(): string
    {
        if ($this->isLifetime()) {
            return 'De por vida';
        }

        if ($this->duration_days >= 365) {
            $years = floor($this->duration_days / 365);
            return $years . ' ' . ($years > 1 ? 'años' : 'año');
        }

        if ($this->duration_days >= 30) {
            $months = floor($this->duration_days / 30);
            return $months . ' ' . ($months > 1 ? 'meses' : 'mes');
        }

        return $this->duration_days . ' días';
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('price');
    }
}
