@props(['video' => null, 'image', 'title', 'hero' => false])
<div class="sc-media {{ $hero ? 'sc-media-hero' : '' }}" data-media>
    @if($video?->source_type === 'youtube')
        <div class="sc-youtube" data-youtube="{{ $video->youtube_id }}" data-youtube-title="{{ $video->title }}" @if($hero) data-youtube-hero @endif>
            @php($playerParams = ['enablejsapi' => 1, 'playsinline' => 1, 'rel' => 0, 'origin' => request()->getSchemeAndHttpHost()] + ($hero ? ['mute' => 1, 'loop' => 1, 'playlist' => $video->youtube_id] : []))
            <iframe data-youtube-frame src="https://www.youtube-nocookie.com/embed/{{ $video->youtube_id }}?{{ http_build_query($playerParams) }}"
                title="{{ $video->title }}" width="1280" height="720" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
            <p class="sc-media-error" data-youtube-error hidden>No se pudo reproducir aquí. Revisa si el video sigue disponible y permite su inserción.</p>
        </div>
    @elseif($video)
        <video class="sc-video" playsinline preload="none" poster="{{ $video->getFirstMediaUrl('poster') }}"
            aria-label="{{ $video->title }}" @if($hero) muted loop data-ambient @else controls @endif>
            <source data-src="{{ $video->getFirstMediaUrl('mobile') }}" media="(max-width: 767px)" type="video/mp4">
            <source data-src="{{ $video->getFirstMediaUrl('desktop') }}" type="video/mp4">
            Tu navegador no puede reproducir este video.
        </video>
        <button class="sc-play" type="button" data-video-toggle aria-label="Reproducir {{ $video->title }}"><span aria-hidden="true">▶</span> <span data-video-label>Reproducir {{ $hero ? 'portada' : 'tráiler' }}</span></button>
        <p class="sc-media-error" data-video-error hidden>No se pudo reproducir el video. Puedes revisar la información del programa o volver a intentarlo.</p>
    @else
        <img src="{{ Vite::asset($image) }}" alt="{{ $title }}" width="1600" height="900" {{ $hero ? 'fetchpriority=high' : 'loading=lazy' }}>
        <span class="sc-media-caption">{{ $hero ? 'RIZABAL / INGENIERÍA ESTRUCTURAL' : 'VISTA DEL PROGRAMA' }}</span>
    @endif
</div>
@if($video?->source_type === 'youtube')<p class="sc-note sc-video-secondary">Reproduce el video aquí. <a class="en-inline-link" href="https://www.youtube.com/watch?v={{ $video->youtube_id }}" target="_blank" rel="noopener noreferrer">Ver en YouTube ↗</a></p>@endif
@if($video?->transcript)<details class="sc-transcript"><summary>Leer descripción del video</summary><p>{{ $video->transcript }}</p></details>@endif
