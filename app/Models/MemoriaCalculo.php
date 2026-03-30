<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MemoriaCalculo extends Model
{
    //
    protected $table = 'memoria_calculos';

    protected $fillable = [
        'user_id',
        'project_name',
        'project_code',
        'cover_data',
        'generalidades',
        'analisis_cargas',
        'analisis_sismico',
        'diseno_elementos',
        'estructura_metalica',
        'conclusiones',
        'recomendaciones',
        'completion_percentage',
        'status',
        'last_saved_at',
        'metadata'
    ];

    protected $casts = [
         'cover_data' => 'array',
        'generalidades' => 'array',
        'analisis_cargas' => 'array',
        'analisis_sismico' => 'array',
        'diseno_elementos' => 'array',
        'estructura_metalica' => 'array',
        'conclusiones' => 'array',
        'recomendaciones' => 'array',
        'metadata' => 'array',
        'last_saved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function user(): BelongsTo{
        return $this->belongsTo(User::class);
    }

    // relacion con imagenes
    public function images(): HasMany
    {
        return $this->hasMany(MemoriaImagen::class);
    }

      /**
     * Guardar una imagen (versión simplificada para tu estructura)
     */
    public function saveImage(string $groupKey, int $index, string $base64, ?int $subIndex = null, ?string $subKey = null): self
    {
        $sizeKb = round(strlen($base64) / 1024);
        
        // Construir clave única
        $uniqueKey = $groupKey;
        if ($subKey !== null) {
            $uniqueKey .= '_' . $subKey;
        } elseif ($subIndex !== null) {
            $uniqueKey .= '_' . $subIndex;
        } else {
            $uniqueKey .= '_' . $index;
        }
        
        $this->images()->updateOrCreate(
            [
                'group_key' => $groupKey,
                'sub_key' => $subKey,
                'index' => $index,
                'sub_index' => $subIndex
            ],
            [
                'image_base64' => $base64,
                'image_type' => 'jpeg',
                'size_kb' => $sizeKb,
                'metadata' => [
                    'unique_key' => $uniqueKey,
                    'saved_at' => now()->toISOString()
                ]
            ]
        );
        
        return $this;
    }

    public function getImage(string $groupKey, int $index, ?int $subIndex = null, ?string $subKey = null): ?array
    {
        $query = $this->images()
            ->where('group_key', $groupKey)
            ->where('index', $index);
        
        if ($subIndex !== null) {
            $query->where('sub_index', $subIndex);
        }
        
        if ($subKey !== null) {
            $query->where('sub_key', $subKey);
        }
        
        $imagen = $query->first();
        
        return $imagen ? [
            'base64' => $imagen->image_base64,
            'type' => $imagen->image_type,
            'size_kb' => $imagen->size_kb
        ] : null;
    }

    public function getImageToGropu(string $groupKey): array
    {
        $imagenes = $this->images()
            ->where('group_key', $groupKey)
            ->orderBy('index')
            ->orderBy('subIndex')
            ->get();

        $result = [];
        foreach ($imagenes as $img) {
            if ($img->sub_index !== null) {
                $result[$img->index][$img->sub_index] = $img->image_base64;
            } else {
                $result[$img->index] = $img->image_base64;
            }
        }
        return $result;
    }

    /**
     * Calcular porcentaje de completado (adaptado a tu estructura)
     */
    public function calcularPorcentajeCompletado(): int
    {
        $puntaje = 0;
        $total = 0;
        
        // 1. Datos de portada
        $total += 4;
        if ($this->cover_data) {
            if (!empty($this->cover_data['project'])) $puntaje++;
            if (!empty($this->cover_data['seismicZone'])) $puntaje++;
            if (!empty($this->cover_data['ubigeo']['district'])) $puntaje++;
            if (!empty($this->cover_data['buildingCategory'])) $puntaje++;
        }
        
        // 2. Generalidades
        $total += 3;
        if ($this->generalidades && !empty($this->generalidades['floors'])) $puntaje++;
        if ($this->generalidades && !empty($this->generalidades['structuralDetails']['usage'])) $puntaje++;
        if ($this->generalidades && !empty($this->generalidades['structuralDetails']['materialDesign'])) $puntaje++;
        
        // 3. Análisis de cargas
        $total += 1;
        if ($this->analisis_cargas && !empty($this->analisis_cargas['casoscarga'])) $puntaje++;
        
        // 4. Imágenes importantes
        $imagenesImportantes = [
            ['group_key' => 'coverImage', 'index' => 0],
            ['group_key' => 'materialImages', 'index' => 0],
            ['group_key' => 'disenoSimientoCorridoImages', 'index' => 0],
            ['group_key' => 'disenoLosaMacizaImages', 'index' => 0],
            ['group_key' => 'modeloMatematico3DImages', 'index' => 0],
        ];
        
        foreach ($imagenesImportantes as $img) {
            $total++;
            if ($this->imagenes()
                ->where('group_key', $img['group_key'])
                ->where('index', $img['index'])
                ->exists()) {
                $puntaje++;
            }
        }
        
        // 5. Análisis sísmico
        $total += 1;
        if ($this->analisis_sismico && !empty($this->analisis_sismico)) $puntaje++;
        
        // 6. Diseño de elementos
        $total += 1;
        if ($this->diseno_elementos && !empty($this->diseno_elementos)) $puntaje++;
        
        $porcentaje = $total > 0 ? round(($puntaje / $total) * 100) : 0;
        
        // Actualizar en base de datos
        $this->update(['completion_percentage' => $porcentaje]);
        
        return $porcentaje;
    }
}
