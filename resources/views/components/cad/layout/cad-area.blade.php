{{-- resources/views/components/cad/layout/cad-area.blade.php --}}
<!-- Canvas - Vista dividida 2D + 3D -->
<main class="relative flex basis-3/4 flex-col bg-white">
  <input class="absolute w-28 -translate-x-1/2 -translate-y-1/2 z-10" id="distance" name="distance" type="number"
    x-show="currentState === trussDrawingState && currentState.shape.node1" x-ref="distanceInput"
    @keyup.enter="trussDrawingState.createBeam($data)">

  {{-- Contenedor dividido: 2D a la izquierda, 3D a la derecha --}}
  <div class="flex flex-1 w-full overflow-hidden">

    {{-- Canvas 2D (mitad izquierda) --}}
    <div class="w-1/2 h-full border-r border-gray-600 relative bg-gray-800">
      <canvas class="w-full h-full" x-ref="cad"></canvas>
      <!-- Etiqueta 2D -->
      <div class="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
        📐 Vista 2D (Planta)
      </div>
    </div>

    {{-- Vista 3D (mitad derecha) --}}
    <div class="w-1/2 h-full relative bg-gray-900">
      <div id="viewer3d-container" class="w-full h-full"></div>
      <!-- Etiqueta 3D -->
      <div class="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded z-10">
        🧊 Vista 3D (Isométrica)
      </div>
      {{-- Indicador de plano 3D --}}
      <div x-show="currentState === trussDrawingState3D"
        x-cloak
        class="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-1.5 rounded-lg text-xs font-mono z-20 shadow-lg">
        <span class="text-blue-400">✏️ Dibujando en:</span>
        <span x-text="currentState.currentPlane" class="font-bold ml-1"></span>
        <span class="text-gray-400 text-[10px] ml-2">(1:XY 2:XZ 3:YZ)</span>
      </div>
    </div>
  </div>

  {{-- Barra inferior --}}
  <div class="cad-bg cad-border flex flex-row border-r-4 text-xs items-center justify-between">
    <div class="flex flex-row">
      <button class="p-1" :class="currentRenderer === diseñoRenderer ? 'bg-gray-100' : ''"
        @click="currentRenderer = diseñoRenderer;setState(idleState)">Diseño</button>
      <button class="p-1" :class="currentRenderer === deflexionRenderer ? 'bg-gray-100' : ''"
        @click="currentRenderer = deflexionRenderer;setState(idleState)">Deflexion</button>
      <button class="p-1" :class="currentRenderer === axialRenderer ? 'bg-gray-100' : ''"
        @click="currentRenderer = axialRenderer;setState(idleState)">Axial</button>

        <!-- para probar la sincronizacion -->
      <button @click="sync3D()"
        class="p-1 px-2 bg-yellow-600 text-white rounded text-xs ml-2">
        Sincronizar
      </button>
    </div>
  </div>
</main>

@push('styles')
<style>
  [x-cloak] {
    display: none !important;
  }
</style>
@endpush