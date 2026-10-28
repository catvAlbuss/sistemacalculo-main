@php($groups = collect(config('showcase.products'))->groupBy('category', preserveKeys: true))
<li class="en-programs" x-data="{ programsOpen: false }" @click.outside="programsOpen = false"
    @keydown.escape.stop.prevent="programsOpen = false; $refs.programTrigger.focus()">
    <button type="button" class="en-nav-link en-program-trigger {{ request()->routeIs('showcase.*') ? 'en-program-current' : '' }}"
        id="programs-button" x-ref="programTrigger" @click="programsOpen = !programsOpen"
        :aria-expanded="programsOpen.toString()" aria-expanded="false" aria-controls="programs-panel"
        @keydown.arrow-down.prevent="programsOpen = true; setTimeout(() => $refs.programPanel.querySelector('a').focus(), 50)">
        Programas <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true"><path d="m1 1 4 4 4-4" stroke="currentColor" stroke-width="1.5" /></svg>
    </button>
    <div class="en-mega-panel" id="programs-panel" x-ref="programPanel" x-show="programsOpen" style="display:none" aria-labelledby="programs-button">
        <div class="en-mega-head"><div><strong>Encuentra tu herramienta</strong><p>Análisis, diseño y verificación estructural.</p></div><a href="{{ route('showcase.index') }}" @if(request()->routeIs('showcase.index')) aria-current="page" @endif>Ver todos los programas ↗</a></div>
        <div class="en-mega-grid">@foreach($groups as $category => $programs)<section aria-labelledby="program-category-{{ $loop->index }}"><h2 id="program-category-{{ $loop->index }}">{{ $category }}</h2><ul>@foreach($programs as $slug => $program)<li><a href="{{ route('showcase.show', $slug) }}" @if(request()->routeIs('showcase.show') && request()->route('slug') === $slug) aria-current="page" @endif>{{ $program['name'] }}</a></li>@endforeach</ul></section>@endforeach</div>
        <div class="en-mega-foot"><span>Conoce cada programa y mira sus tráileres antes de empezar.</span><a href="{{ route('showcase.trial') }}">Probar gratis 5 días ↗</a></div>
    </div>
</li>
