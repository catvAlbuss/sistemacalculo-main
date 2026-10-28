@props(['video' => null])
@php($fallback = asset('assets/marketing/system-background-poster.jpg'))
<div class="lh-hero-background" data-home-background>
    @if($video?->source_type === 'youtube')
        <div class="sc-youtube lh-youtube-background" data-youtube="{{ $video->youtube_id }}" data-youtube-title="{{ $video->title }}" data-youtube-hero>
            <img class="lh-background-poster" src="{{ $fallback }}" alt="" aria-hidden="true" data-youtube-fallback>
            <iframe data-youtube-frame src="https://www.youtube-nocookie.com/embed/{{ $video->youtube_id }}?{{ http_build_query(['enablejsapi' => 1, 'playsinline' => 1, 'mute' => 1, 'loop' => 1, 'playlist' => $video->youtube_id, 'rel' => 0, 'origin' => request()->getSchemeAndHttpHost()]) }}"
                title="{{ $video->title }}" width="1920" height="1080" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
            <p class="lh-video-message" data-youtube-error hidden>No se pudo reproducir el video de YouTube. <a href="https://www.youtube.com/watch?v={{ $video->youtube_id }}" target="_blank" rel="noopener noreferrer">Abrir video ↗</a></p>
        </div>
    @else
        @php($poster = ($video ? $video->getFirstMediaUrl('poster') : '') ?: $fallback)
        <div class="lh-file-background" data-media>
            <img class="lh-background-poster" src="{{ $poster }}" alt="" aria-hidden="true">
            <video class="lh-background-video" playsinline muted loop preload="none" data-ambient poster="{{ $poster }}" aria-label="{{ $video?->title ?? 'Resumen de los programas de Rizabal' }}">
                <source data-src="{{ route('showcase.home-video', ['variant' => 'mobile', 'format' => 'mp4']) }}" media="(max-width: 767px)" type="video/mp4">
                @unless($video)<source data-src="{{ route('showcase.home-video', ['variant' => 'mobile', 'format' => 'webm']) }}" media="(max-width: 767px)" type="video/webm">@endunless
                <source data-src="{{ route('showcase.home-video', ['variant' => 'desktop', 'format' => 'mp4']) }}" type="video/mp4">
                @unless($video)<source data-src="{{ route('showcase.home-video', ['variant' => 'desktop', 'format' => 'webm']) }}" type="video/webm">@endunless
            </video>
            <button class="lh-video-toggle" type="button" data-video-toggle aria-label="Reproducir video de portada"><span aria-hidden="true">▷</span><span data-video-label>Reproducir video</span></button>
            <p class="lh-video-message" data-video-error hidden>No se pudo iniciar el video. <button type="button" data-video-retry>Volver a intentar</button></p>
        </div>
    @endif
</div>
