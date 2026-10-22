<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentTask extends Model
{
    protected $guarded = ['id'];

    protected $hidden = ['payload'];

    protected $casts = [
        'payload' => 'encrypted:array', 'available_at' => 'datetime', 'locked_at' => 'datetime',
        'dispatched_at' => 'datetime', 'completed_at' => 'datetime',
    ];

    public function payment()
    {
        return $this->belongsTo(PaymentRequest::class, 'payment_request_id');
    }
}
