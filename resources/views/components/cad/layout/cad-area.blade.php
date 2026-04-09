<!-- Canvas -->
<main class="relative flex basis-3/4 flex-col bg-white">
  <input class="absolute w-28 -translate-x-1/2 -translate-y-1/2" id="distance" name="distance" type="number"
    x-show="currentState === trussDrawingState && currentState.shape.node1" x-ref="distanceInput"
    @keyup.enter="trussDrawingState.createBeam($data)">
    
  <!-- Contenedor de vistas -->
  <div class="flex flex-1 overflow-hidden">
    <!-- 2D -->
    <div class="w-1/2 h-full">
      <canvas class="w-full h-full" x-ref="cad"></canvas>
    </div>

    <!-- 3D -->
    <div class="w-1/2 h-full">
      <canvas class="w-full h-full" x-ref="cad3d"></canvas>
    </div>
  </div>

  <div class="cad-bg cad-border flex flex-row border-r-4 text-xs">
    <button class="p-1" :class="currentRenderer === diseñoRenderer ? 'bg-gray-100' : ''"
      @click="currentRenderer = diseñoRenderer;setState(idleState)">Diseño</button>
    <button class="p-1" :class="currentRenderer === deflexionRenderer ? 'bg-gray-100' : ''"
      @click="currentRenderer = deflexionRenderer;setState(idleState)">Deflexion</button>
    <button class="p-1" :class="currentRenderer === axialRenderer ? 'bg-gray-100' : ''"
      @click="currentRenderer = axialRenderer;setState(idleState)">Axial</button>
  </div>
</main>