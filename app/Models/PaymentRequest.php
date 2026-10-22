<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'subscription_plan_id',
        'name',
        'email',
        'phone',
        'amount',
        'payment_proof',
        'message',
        'status',
        'token',
        'confirmed_at',
        'rejected_at',
        'rejection_reason',
        'payment_method',
        'gateway_charge_id',
        'gateway_state',
        'gateway_context',
        'receipt_type',
        'document_type',
        'document_number',
        'billing_name',
        'billing_address',
        'billing_email',
        'subtotal', 'tax_rate', 'tax_amount',
        'checkout_key', 'checkout_payload_hash', 'plan_snapshot',
        'billing_ubigeo', 'billing_location',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'confirmed_at' => 'datetime',
        'rejected_at' => 'datetime',
        'gateway_context' => 'array',
        'subtotal' => 'decimal:2', 'tax_rate' => 'decimal:2', 'tax_amount' => 'decimal:2',
        'plan_snapshot' => 'array',
        'billing_location' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function events(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(PaymentEvent::class);
    }

    public function receipt(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(BillingReceipt::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Subscription::class, 'subscription_plan_id');
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /** Read-only view of what was purchased, including old requests without snapshots. */
    public function purchasedPlan(): Subscription
    {
        $plan = clone $this->plan;
        $snapshot = $this->plan_snapshot ?? [];
        foreach (['name', 'type', 'duration_days', 'features', 'max_users', 'max_projects'] as $field) {
            if (array_key_exists($field, $snapshot)) {
                $plan->setAttribute($field, $snapshot[$field]);
            }
        }
        $plan->setAttribute('price', $this->amount);

        return $plan;
    }

    public function purchaseDescription(int $limit = 80): string
    {
        $snapshot = $this->plan_snapshot ?? [];
        $text = ($snapshot['name'] ?? $this->plan->name).' · '.($snapshot['duration_text'] ?? $this->plan->duration_text);

        return mb_substr($text, 0, $limit);
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }
}
