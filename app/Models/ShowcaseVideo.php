<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class ShowcaseVideo extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $fillable = ['slot', 'title', 'transcript', 'status', 'is_published', 'publish_when_ready', 'metadata', 'error', 'uploaded_by', 'source_type', 'youtube_id'];
    protected $casts = ['is_published' => 'boolean', 'publish_when_ready' => 'boolean', 'metadata' => 'array'];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('original')->useDisk('local')->singleFile();
        foreach (['desktop', 'mobile', 'poster'] as $collection) {
            $this->addMediaCollection($collection)->useDisk('showcase_public')->singleFile();
        }
    }

    public function isReady(): bool
    {
        if ($this->source_type === 'youtube') return $this->status === 'ready' && (bool) preg_match('/^[A-Za-z0-9_-]{11}$/D', $this->youtube_id ?? '');
        return $this->status === 'ready' && $this->hasMedia('desktop') && $this->hasMedia('mobile') && $this->hasMedia('poster');
    }

    public function publish(bool $automatic = false): void
    {
        \Illuminate\Support\Facades\DB::transaction(function () use ($automatic) {
            $versions = self::where('slot', $this->slot)->orderBy('id')->lockForUpdate()->get();
            if ($automatic && $versions->contains(fn ($version) => $version->is_published && $version->id > $this->id)) return;
            $selected = $versions->firstWhere('id', $this->id);
            abort_unless($selected?->isReady(), 422, 'Espera a que termine correctamente el procesamiento.');
            self::where('slot', $this->slot)->update(['is_published' => false]);
            $selected->update(['is_published' => true]);
        });
    }
}
