@pushOnce('initscripts')
@vite('resources/js/etabs/main.js')
@endPushOnce

<x-app-layout>
    {{-- El espacio CAD ocupa el alto disponible bajo la navegación compartida. --}}
    <div id="cad-viewer-app"></div>
</x-app-layout>
