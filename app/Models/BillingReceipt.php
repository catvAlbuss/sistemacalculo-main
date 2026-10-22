<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\URL;

class BillingReceipt extends Model
{
    protected $fillable = [
        'payment_request_id', 'number', 'receipt_type', 'document_type', 'document_number',
        'customer_name', 'customer_address', 'customer_email', 'issuer', 'description', 'customer_location',
        'currency', 'total', 'charge_id', 'issued_at', 'electronic_status', 'external_id',
        'subtotal', 'tax_rate', 'tax_amount',
    ];

    protected $casts = ['issuer' => 'array', 'customer_location' => 'array', 'total' => 'decimal:2', 'issued_at' => 'datetime',
        'subtotal' => 'decimal:2', 'tax_rate' => 'decimal:2', 'tax_amount' => 'decimal:2'];

    public function paymentRequest(): BelongsTo
    {
        return $this->belongsTo(PaymentRequest::class);
    }

    public function ticketUrl(): string
    {
        return URL::temporarySignedRoute('billing.ticket', now()->addDays(7), ['receipt' => $this->id]);
    }
}
