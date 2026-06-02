<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MemoriaDescriptiva extends Model
{
    protected $table = 'memorias_descriptivas';

    protected $fillable = [
        'user_id',
        'project_name',
        'uei',
        'codigo_unificado',
        'nombre_ie',
        'codigo_local',
        'codigo_modular',
        'centro_poblado',
        'region',
        'provincia',
        'distrito',
        'data',
        'file_path',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}