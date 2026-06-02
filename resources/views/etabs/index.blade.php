<x-calc-layout title="Etabs">
    <!-- <div id="cad-viewer-app" class="h-screen w-full"></div> -->

    <x-etabs.cad-sys />
    <!-- {{-- Sistema de dibujo (Alpine) - Oculto pero inicializado --}}
    <div x-data="cadSys" x-init="initSys($refs.drawingCanvas, null)" style="display: none;">
        {{-- Canvas oculto que Alpine usará como referencia --}}
        <canvas x-ref="drawingCanvas" style="display: none;"></canvas>
    </div> -->
</x-calc-layout>

<!-- @vite(['resources/js/etabs/main.js', 'resources/js/etabs/etabs_entry.js']) -->