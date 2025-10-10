<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class blog extends Model
{
    use HasFactory;
    protected $table = "blogs";
    protected $fillable = [
        'titulo',
        'descripcion',
        'fecha_publicacion',
        'fecha_modificacion',
        'ubicacion',
        'imagenref',
        'descripciondetall',
    ];
}
