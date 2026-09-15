<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MemoriaImagen extends Model
{
    protected $table = 'memoria_imagenes';

    protected $fillable = [
        'memoria_calculo_id',
        'group_key',
        'sub_key',
        'index',
        'sub_index',
        'image_base64',
        'image_type',
        'size_kb',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function memoriaCalculo()
    {
        return $this->belongsTo(MemoriaCalculo::class);
    }
}
