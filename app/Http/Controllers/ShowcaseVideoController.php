<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessShowcaseVideo;
use App\Models\ShowcaseVideo;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ShowcaseVideoController extends Controller
{
    public function index()
    {
        return view('showcase.admin', ['videos' => ShowcaseVideo::with('media')->latest()->paginate(12),
            'slots' => ['home' => 'Portada · Resumen del sistema en bucle'] + collect(config('showcase.products'))->mapWithKeys(fn ($p, $slug) => [$slug => $p['name']])->all()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'slot' => ['required', Rule::in(['home', ...array_keys(config('showcase.products'))])],
            'title' => ['required', 'string', 'max:160'],
            'transcript' => ['nullable', 'string', 'max:20000'],
            'publish_when_ready' => ['sometimes', 'boolean'],
            'source_type' => ['sometimes', Rule::in(['file', 'youtube'])],
            'youtube_url' => ['exclude_unless:source_type,youtube', 'required', 'string', 'max:2048', function ($attribute, $value, $fail) {
                if (!\App\Services\YouTubeVideo::id($value)) $fail('Ingresa un enlace válido de un video de YouTube (watch, youtu.be, shorts o live).');
            }],
            'video' => ['exclude_if:source_type,youtube', 'required', 'file', 'mimes:mp4,mov,webm', 'max:'.(config('showcase.max_upload_mb') * 1024)],
        ]);
        $video = ShowcaseVideo::create(collect($data)->except(['video', 'youtube_url'])->all() + ['uploaded_by' => $request->user()->id, 'publish_when_ready' => $request->boolean('publish_when_ready')]);
        if (($data['source_type'] ?? 'file') === 'youtube') {
            $video->update(['youtube_id' => \App\Services\YouTubeVideo::id($data['youtube_url']), 'status' => 'ready']);
            if ($video->publish_when_ready) $video->publish(automatic: true);
            return back()->with('success', $video->publish_when_ready ? 'Enlace de YouTube publicado. Comprueba que el video permita su inserción.' : 'Enlace guardado para revisión. Comprueba el reproductor antes de publicarlo.');
        }
        try {
            $video->addMediaFromRequest('video')->usingFileName('original.'.$request->file('video')->guessExtension())->toMediaCollection('original');
            ProcessShowcaseVideo::dispatch($video->id);
        } catch (\Throwable $exception) {
            report($exception);
            $video->update(['status' => 'failed', 'error' => 'La carga o la cola no terminó. Revisa el almacenamiento y los registros antes de reintentar.']);
            return back()->withErrors(['video' => 'No se pudo iniciar el procesamiento. Los videos publicados siguen disponibles.']);
        }
        return back()->with('success', $video->publish_when_ready ? 'Video recibido. Se publicará automáticamente cuando termine correctamente el procesamiento.' : 'Video recibido. Se procesará en segundo plano y quedará listo para revisión.');
    }

    public function update(Request $request, ShowcaseVideo $video)
    {
        $data = $request->validate([
            'slot' => ['required', Rule::in(['home', ...array_keys(config('showcase.products'))])],
            'title' => ['required', 'string', 'max:160'],
            'transcript' => ['nullable', 'string', 'max:20000'],
        ]);
        $moved = $data['slot'] !== $video->slot;
        $video->update($data + ($moved ? ['is_published' => false] : []));
        return back()->with('success', $moved ? 'Video actualizado. Al cambiar de ubicación quedó sin publicar; publícalo cuando lo revises.' : 'Video actualizado.');
    }

    public function destroy(ShowcaseVideo $video)
    {
        if ($video->status === 'processing') return back()->withErrors(['video' => 'Este video se está procesando. Podrás eliminarlo cuando termine.']);
        $video->delete();
        return back()->with('success', 'Video eliminado junto con sus archivos.');
    }

    public function publish(ShowcaseVideo $video)
    {
        $video->publish();
        return back()->with('success', 'Video publicado. La versión anterior se conserva en la biblioteca.');
    }

    public function unpublish(ShowcaseVideo $video)
    {
        $video->update(['is_published' => false]);
        return back()->with('success', 'Video retirado de la web. El archivo se conserva en la biblioteca.');
    }

    public function retry(ShowcaseVideo $video)
    {
        abort_unless($video->status === 'failed' && $video->hasMedia('original'), 422);
        $video->update(['status' => 'queued', 'error' => null]);
        ProcessShowcaseVideo::dispatch($video->id);
        return back()->with('success', 'Procesamiento solicitado nuevamente.');
    }
}
