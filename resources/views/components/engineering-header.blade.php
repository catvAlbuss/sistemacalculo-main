@props(['eyebrow', 'title', 'description'])
<header class="pr-header en-page-header">
    <div>
        <p class="pr-eyebrow">{{ $eyebrow }}</p>
        <h1>{{ $title }}</h1>
        <p class="pr-description">{{ $description }}</p>
    </div>
    <div class="pr-blueprint" aria-hidden="true">
        <svg viewBox="0 0 112 72" fill="none" stroke="currentColor" stroke-width="1.1">
            <path d="M18 56h76M26 56V30l30-17 30 17v26M26 30h60M41 22v34M71 22v34M26 43h60M41 30l15 13 15-13M41 43l15 13 15-13"/>
            <path d="M18 66h76M18 63v6M94 63v6M8 56V13M5 56h6M5 13h6" stroke-dasharray="2 2"/>
            <circle cx="26" cy="56" r="2" fill="currentColor"/><circle cx="86" cy="56" r="2" fill="currentColor"/>
        </svg>
    </div>
</header>
