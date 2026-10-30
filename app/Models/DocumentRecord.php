<?php

namespace App\Models;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;

class DocumentRecord extends Model
{
    use Prunable;

    /** Also published in the privacy policy. */
    public const RETENTION_DAYS = 365;

    protected $fillable = ['lookup_key', 'data', 'looked_up_at'];

    protected $casts = ['data' => 'encrypted:array', 'looked_up_at' => 'datetime'];

    public function prunable()
    {
        return static::where('looked_up_at', '<', now()->subDays(self::RETENTION_DAYS));
    }

    /** Null after an APP_KEY change: the document is simply queried again. */
    public function readable(): ?array
    {
        try {
            return $this->data;
        } catch (DecryptException) {
            return null;
        }
    }
}
