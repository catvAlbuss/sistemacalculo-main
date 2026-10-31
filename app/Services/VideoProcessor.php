<?php

namespace App\Services;

use RuntimeException;
use Symfony\Component\Process\Process;

class VideoProcessor
{
    public function inspect(string $path): array
    {
        $result = $this->run([config('showcase.ffprobe'), '-v', 'error', '-show_streams', '-show_format', '-of', 'json', $path], 30);
        $data = json_decode($result, true, flags: JSON_THROW_ON_ERROR);
        $stream = collect($data['streams'] ?? [])->firstWhere('codec_type', 'video');
        $duration = (float) ($data['format']['duration'] ?? 0);
        if (!$stream || $duration <= 0 || $duration > config('showcase.max_duration_seconds') || ($stream['width'] ?? 0) > 7680 || ($stream['height'] ?? 0) > 7680) {
            throw new RuntimeException('Video no válido: revisa la duración (máximo 5 minutos) y la resolución (máximo 8K).');
        }
        return ['duration' => $duration, 'width' => $stream['width'], 'height' => $stream['height']];
    }

    public function encode(string $original, string $directory, bool $hero): array
    {
        $metadata = $this->inspect($original);
        // La portada es fondo sin sonido: se prioriza el peso de carga sobre la nitidez de una demostración.
        $variants = $hero ? ['desktop' => [1920, 1080, 28], 'mobile' => [960, 540, 30]] : ['desktop' => [1920, 1080, 20], 'mobile' => [1280, 720, 22]];
        foreach ($variants as $name => [$width, $height, $quality]) {
            // Fit without cropping or upscaling. Originals are never modified.
            $scale = "scale=w='min($width,iw)':h='min($height,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2,setsar=1";
            $audio = $hero ? ['-an'] : ['-map', '0:a:0?', '-c:a', 'aac', '-b:a', '128k'];
            $this->run([config('showcase.ffmpeg'), '-nostdin', '-y', '-v', 'error', '-i', $original,
                '-map', '0:v:0', ...$audio, '-vf', $scale, '-c:v', 'libx264', '-preset', 'medium',
                '-crf', (string) $quality, '-pix_fmt', 'yuv420p', '-threads', '2', '-movflags', '+faststart',
                '-map_metadata', '-1', $directory.'/'.$name.'.mp4'], 380);
        }
        $this->run([config('showcase.ffmpeg'), '-nostdin', '-y', '-v', 'error', '-i', $directory.'/desktop.mp4',
            '-frames:v', '1', '-update', '1', '-pix_fmt', 'yuvj420p', '-strict', 'unofficial', '-q:v', '2', $directory.'/poster.jpg'], 30);
        return $metadata;
    }

    private function run(array $command, int $timeout): string
    {
        $process = new Process($command, timeout: $timeout);
        $process->mustRun();
        return $process->getOutput();
    }
}
