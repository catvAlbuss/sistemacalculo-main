<?php

namespace App\Jobs;

use App\Models\ShowcaseVideo;
use App\Services\VideoProcessor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Throwable;

class ProcessShowcaseVideo implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;
    public int $timeout = 900;
    public bool $failOnTimeout = true;

    public function __construct(public int $videoId)
    {
        $this->onConnection(config('showcase.queue_connection'));
        $this->onQueue(config('showcase.queue'));
    }

    public function middleware(): array { return [(new WithoutOverlapping('showcase-'.$this->videoId))->expireAfter(950)]; }

    public function handle(VideoProcessor $processor): void
    {
        $video = ShowcaseVideo::findOrFail($this->videoId);
        if ($video->isReady()) {
            if ($video->publish_when_ready) $video->publish(automatic: true);
            return;
        }
        $video->update(['status' => 'processing', 'error' => null]);
        $root = storage_path('app/video-processing');
        File::ensureDirectoryExists($root);
        $directory = $root.'/'.Str::uuid();
        File::makeDirectory($directory);
        try {
            $original = $video->getFirstMediaPath('original');
            if (!$original || !is_file($original)) throw new \RuntimeException('No se encuentra el video original.');
            $metadata = $processor->encode($original, $directory, $video->slot === 'home');
            foreach (['desktop' => 'mp4', 'mobile' => 'mp4', 'poster' => 'jpg'] as $collection => $extension) {
                $video->addMedia($directory.'/'.$collection.'.'.$extension)->toMediaCollection($collection);
            }
            $video->update(['status' => 'ready', 'metadata' => $metadata, 'error' => null]);
            if ($video->fresh()->publish_when_ready) $video->publish(automatic: true);
        } catch (Throwable $error) {
            $video->update(['status' => 'failed', 'error' => 'No se pudo procesar. El original se conserva. Revisa FFmpeg, el archivo y los registros del servidor.']);
            throw $error;
        } finally {
            // Only this job's UUID directory, verified inside the processing root.
            if (is_dir($directory) && str_starts_with(realpath($directory), realpath($root).DIRECTORY_SEPARATOR)) File::deleteDirectory($directory);
        }
    }

    public function failed(?Throwable $exception): void
    {
        ShowcaseVideo::whereKey($this->videoId)->where('status', '!=', 'ready')
            ->update(['status' => 'failed', 'error' => 'El procesamiento no terminó. El original se conserva; puedes reintentarlo desde Administración.']);
    }
}
