@pushOnce('initscripts')
@vite('resources/js/etabs/main.js')
@endPushOnce

<x-app-layout>
    {{-- El espacio CAD ocupa el alto disponible bajo la navegación compartida. --}}
    <div id="cad-viewer-app" aria-label="NovaCad" data-provider="{{ config('legal.provider.name') }}" data-provider-ruc="{{ config('legal.provider.ruc') }}" data-support-email="{{ config('legal.provider.email') }}" data-support-phone="{{ config('legal.provider.phone') }}"></div>
</x-app-layout>
