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
      <div
        class="absolute top-3 left-3 rounded px-3 py-1 text-sm font-medium shadow"
        :class="getActiveViewBadgeClass()"
        x-text="getActiveViewLabel()"></div>
    </div>

    {{-- Vista 3D (mitad derecha) --}}
    <div class="w-1/2 h-full relative bg-gray-900">
      <div id="viewer3d-container" class="w-full h-full"></div>
      <!-- Etiqueta 3D -->
      <div
        class="absolute top-3 left-3 rounded bg-gray-900 px-3 py-1 text-sm font-medium text-white shadow"
        x-text="getActive3DViewLabel()"></div>
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

  {{-- Modal editor de grillas --}}
  <div id="grid-editor-modal" hidden style="
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.35);
    z-index: 9999;
    display: none;
    align-items: center;
    justify-content: center;
  ">
    <div style="
      width: 1200px;
      max-width: 96vw;
      max-height: 90vh;
      overflow: auto;
      background: #ffffff;
      border-radius: 10px;
      padding: 18px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.25);
    ">
      <h2 style="margin-top: 0; color: #111827;">Grid System Data</h2>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
        <section>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <h3 style="color: #111827;">X Grid Data</h3>
            <button id="btn-add-x-grid" type="button">Agregar X</button>
          </div>

          <table class="w-full border-collapse text-sm" border="1" width="100%" cellspacing="0" cellpadding="6" style="color:#111827;">
            <thead style="background:#f3f4f6;">
              <tr>
                <th>Grid ID</th>
                <th>X Ordinate</th>
                <th>Visible</th>
                <th>Bubble Loc</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="x-grid-body"></tbody>
          </table>
        </section>

        <section>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <h3 style="color: #111827;">Y Grid Data</h3>
            <button id="btn-add-y-grid" type="button">Agregar Y</button>
          </div>

          <table class="w-full border-collapse text-sm" border="1" width="100%" cellspacing="0" cellpadding="6" style="color:#111827;">
            <thead style="background:#f3f4f6;">
              <tr>
                <th>Grid ID</th>
                <th>Y Ordinate</th>
                <th>Visible</th>
                <th>Bubble Loc</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="y-grid-body"></tbody>
          </table>
        </section>
      </div>

      <section>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3 style="color: #111827;">General Grids</h3>
          <button id="btn-add-general-grid" type="button">Agregar línea general</button>
        </div>

        <table class="w-full border-collapse text-sm" border="1" width="100%" cellspacing="0" cellpadding="6" style="color:#111827;">
          <thead style="background:#f3f4f6;">
            <tr>
              <th>Grid ID</th>
              <th>X1</th>
              <th>Y1</th>
              <th>X2</th>
              <th>Y2</th>
              <th>Visible</th>
              <th>Bubble Loc</th>
              <th>Source</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="general-grid-body"></tbody>
        </table>

        <p style="margin-top:10px; color:#555;">
          Las líneas con source <strong>x</strong> y <strong>y</strong> se editan desde X Grid Data y Y Grid Data.
          Las líneas con source <strong>custom</strong> sirven para grillas inclinadas o no ortogonales.
        </p>
      </section>

      <div style="margin-top:18px; display:flex; justify-content:flex-end; gap:10px;">
        <button id="btn-grid-editor-cancel" type="button">Cancelar</button>
        <button id="btn-grid-editor-apply" type="button">Aplicar</button>
      </div>
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