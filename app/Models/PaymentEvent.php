<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentEvent extends Model
{
    protected $guarded = ['id'];
    protected $casts = ['details' => 'array', 'reviewed_at' => 'datetime'];

    public function payment()
    {
        return $this->belongsTo(PaymentRequest::class, 'payment_request_id');
    }

    public static function record(PaymentRequest $payment, string $kind, string $identity = '', array $details = [], string $severity = 'info'): self
    {
        // Only explicitly selected operational data: never persist tokens, documents or raw gateway responses.
        return self::firstOrCreate(['event_key' => hash('sha256', $payment->id.':'.$kind.':'.$identity)], [
            'payment_request_id' => $payment->id, 'kind' => $kind, 'severity' => $severity,
            'details' => array_intersect_key($details, array_flip(['charge_id', 'amount', 'currency', 'starts_at', 'ends_at'])),
        ]);
    }
}
