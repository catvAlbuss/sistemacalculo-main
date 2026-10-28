<?php

namespace App\Services;

use App\Models\ShowcaseVideo;
use App\Models\Subscription;

class ProductShowcase
{
    public function products(): array { return config('showcase.products'); }

    public function videos(): \Illuminate\Support\Collection
    {
        return ShowcaseVideo::with('media')->where('is_published', true)->where('status', 'ready')->get()
            ->filter(fn ($video) => $video->isReady())->keyBy('slot');
    }

    public function trialUrl(): string
    {
        return route('showcase.trial');
    }

    public function trialPlan(): ?Subscription
    {
        return Subscription::active()->where('price', 0)->orderBy('sort_order')->first();
    }
}
