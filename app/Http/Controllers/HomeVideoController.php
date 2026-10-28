<?php

namespace App\Http\Controllers;

use App\Models\ShowcaseVideo;

class HomeVideoController extends Controller
{
    public function __invoke(string $variant, string $format)
    {
        abort_unless(in_array($variant, ['desktop', 'mobile'], true) && in_array($format, ['mp4', 'webm'], true), 404);
        $published = ShowcaseVideo::with('media')->where('slot', 'home')->where('is_published', true)->where('status', 'ready')->latest('id')->get()->first(fn ($video) => $video->isReady());
        $path = null;
        if ($published?->source_type !== 'youtube' && $published?->isReady() && $format === 'mp4') {
            $path = $published->getFirstMediaPath($variant);
        } elseif (!$published || $published->source_type === 'youtube') {
            $path = public_path('assets/marketing/system-background'.($variant === 'mobile' ? '-mobile' : '').'.'.$format);
        }
        abort_unless($path && is_file($path), 404);
        // BinaryFileResponse handles Range requests, including with artisan serve.
        return response()->file($path, ['Content-Type' => 'video/'.$format, 'Cache-Control' => 'public, max-age=0, must-revalidate',
            'X-Content-Type-Options' => 'nosniff'])->setAutoEtag()->setAutoLastModified();
    }
}
