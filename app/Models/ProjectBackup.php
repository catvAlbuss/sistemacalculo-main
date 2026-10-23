<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectBackup extends Model
{
    protected $guarded = ['id'];

    protected $casts = ['counts' => 'array', 'safety' => 'boolean'];

    protected $hidden = ['path', 'checksum'];
}
