<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\URL;

class Complaint extends Model
{
    protected $guarded = ['id'];

    protected $casts = ['minor' => 'boolean', 'amount' => 'decimal:2', 'provider' => 'array',
        'due_on' => 'date', 'answered_at' => 'datetime'];

    public function copyUrl(): string
    {
        return URL::signedRoute('complaints.copy', $this);
    }
}
