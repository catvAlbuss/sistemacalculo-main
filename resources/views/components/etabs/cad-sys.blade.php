@pushOnce('initscripts')
@vite('resources/js/etabs/main.js')
@vite('resources/js/etabs/etabs_entry.js')
@endPushOnce

<x-calc-layout title="Etabs">

    <div>
        {{-- Visor CAD (Vue) --}}
        <div id="cad-viewer-app" class="h-screen w-full"></div>

        {{-- Elemento Alpine para el sistema de dibujo (oculto pero necesario) --}}
        <div
            x-data="cadSys"
            style="display: none;"
            id="alpine-cadsys-container">
            <canvas x-ref="drawingCanvas" style="display: none;"></canvas>
        </div>
    </div>
</x-calc-layout>