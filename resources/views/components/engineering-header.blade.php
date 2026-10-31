@props(['eyebrow', 'title', 'description', 'art' => null])
<header class="pr-header en-page-header">
    <div>
        <p class="pr-eyebrow">{{ $eyebrow }}</p>
        <h1>{{ $title }}</h1>
        <p class="pr-description">{{ $description }}</p>
    </div>
    <div class="pr-blueprint" aria-hidden="true">
        @if($art === 'retaining-wall')
            <svg viewBox="0 0 112 72" fill="none" stroke="currentColor" stroke-width="1.1">
                <path d="M22 50h54v7H52l-1 6h-5l-1-6H22zM41 50l4-38h7v38" stroke-width="1.5" stroke-linejoin="round"/>
                <path d="M52 12l34-7M8 42h31M56 12l-3 3M64 10l-3 3M72 9l-3 3M80 7l-3 3M14 42l-3 3M22 42l-3 3M30 42l-3 3"/>
                <path d="M58 24v26M58 50h20L58 24M66 42h-7" stroke-dasharray="2 2"/>
                <path d="M22 68h54M22 65v6M76 65v6M96 50V12M93 50h6M93 12h6" stroke-dasharray="2 2"/>
            </svg>
        @else
            <svg viewBox="0 0 112 72" fill="none" stroke="currentColor" stroke-width="1.1">
                <path d="M18 56h76M26 56V30l30-17 30 17v26M26 30h60M41 22v34M71 22v34M26 43h60M41 30l15 13 15-13M41 43l15 13 15-13"/>
                <path d="M18 66h76M18 63v6M94 63v6M8 56V13M5 56h6M5 13h6" stroke-dasharray="2 2"/>
                <circle cx="26" cy="56" r="2" fill="currentColor"/><circle cx="86" cy="56" r="2" fill="currentColor"/>
            </svg>
        @endif
    </div>
</header>
