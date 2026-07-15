<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CadModel extends Model
{
    protected $table = 'cad_models';

    protected $fillable = [
        'user_id',
        'name',
        'data',
        'is_compressed',
        'node_count',
        'version',
        'last_saved_at',
    ];

    protected $casts = [
        'is_compressed' => 'boolean',
        'node_count' => 'integer',
        'version' => 'integer',
        'last_saved_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
