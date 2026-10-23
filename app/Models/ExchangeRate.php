<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExchangeRate extends Model
{
    protected $guarded = ['id'];

    protected $casts = ['date' => 'date', 'sell' => 'decimal:4'];

    public function setDateAttribute($value): void
    {
        $this->attributes['date'] = \Illuminate\Support\Carbon::parse($value)->toDateString();
    }

    public static function current(): ?self
    {
        return static::whereBetween('date', [today('America/Lima')->subDays(7)->toDateString(), today('America/Lima')->toDateString()])
            ->orderByDesc('date')->first();
    }
}
