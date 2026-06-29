@pushOnce('initscripts')
@vite('resources/js/etabs/main.js')
@endPushOnce

<x-app-layout>
    {{-- Visor CAD (Vue) con barra de herramientas nativa completa.
         La altura la maneja App.vue: calc(100vh - 4rem) para dejar visible la barra de navegación. --}}
    <div id="cad-viewer-app"></div>
</x-app-layout>
