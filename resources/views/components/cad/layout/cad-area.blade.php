{{-- resources/views/components/cad/layout/cad-area.blade.php --}}
<!-- Canvas - Vista dividida 2D + 3D -->
<main class="relative flex flex-1 flex-col bg-white">
  <input class="absolute w-28 -translate-x-1/2 -translate-y-1/2 z-10" id="distance" name="distance" type="number"
    x-show="(currentState === trussDrawingState && currentState.shape.node1) || (currentState === zapataDrawingState && currentState.points.length > 0)"
    x-ref="distanceInput"
    @keyup.enter="currentState === trussDrawingState ? trussDrawingState.createBeam($data) : zapataDrawingState.commitZapataLengthInput($data)">

<<<<<<< HEAD
  {{-- Barra de nivel actual Y VISTA --}}
  <div class="bg-gray-800 text-white px-4 py-2 flex items-center gap-4 border-b border-gray-600 flex-wrap">

    {{-- Selector de Nivel (Story) --}}
    <div class="flex items-center gap-2">
      <span class="text-sm font-semibold">Nivel:</span>
      <select x-model="currentStory"
        @change="changeStory()"
        class="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm">
        <option value="none" disabled>Planta</option>
        <template x-for="(story, idx) in stories">
          <option :value="story.name" x-text="`${story.name} (Z = ${story.z} m)`"></option>
        </template>
      </select>
    </div>

    {{-- Selector de Vista en ELEVACIÓN (Ejes X) --}}
    <div class="flex items-center gap-2 ml-4">
      <span class="text-sm font-semibold">Vista Eje X:</span>
      <select x-model="currentElevationX"
        @change="changeElevationX()"
        class="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm">
        <option value="none">🗺️ PLANTA (X-Y)</option>
        <template x-for="(elev, idx) in xElevations">
          <option :value="elev.name" x-text="`${elev.name} (Y = ${elev.y} m)`"></option>
        </template>
      </select>
    </div>

    {{-- Selector de Vista en ELEVACIÓN (Ejes Z: A,B,C...) --}}
    <div class="flex items-center gap-2 ml-4">
      <span class="text-sm font-semibold">Vista Eje Z:</span>
      <select x-model="currentElevationZ"
        @change="changeElevationZ()"
        class="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm">
        <option value="none">🗺️ PLANTA (X-Y)</option>
        <template x-for="elev in zElevations" :key="elev.name">
          <option :value="elev.name" x-text="`${elev.name} (X = ${elev.x} m)`"></option>
        </template>
      </select>
    </div>
    
    {{-- Indicador de filtro actual --}}
    <span class="text-xs text-blue-400 ml-4" x-text="getFilterInfo()"></span>
  </div>
  {{-- Contenedor dividido: 2D a la izquierda, 3D a la derecha --}}
  <div class="flex flex-1 w-full overflow-hidden">
=======
  {{-- Contenedor de vistas: controlado desde Options > Windows --}}
  <div id="cad-workspace"
    data-layout="two-vertical"
    class="grid flex-1 h-full w-full min-h-0 min-w-0 grid-cols-2 grid-rows-1 overflow-hidden bg-gray-950">
>>>>>>> 4a4f0e8713f895dfa286e9eeb2011a59afccb857

    {{-- Selector de vista cuando Windows = One --}}
    <div
      x-show="windowLayout === 'one'"
      x-cloak
      class="absolute right-4 top-3 z-40 flex overflow-hidden rounded-lg border border-gray-600 bg-gray-900 shadow-lg">

      <button
        class="px-3 py-1 text-xs"
        :class="singleWindowView === '2d'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'"
        @click="setSingleWindowView('2d')">
        2D
      </button>

      <button
        class="px-3 py-1 text-xs"
        :class="singleWindowView === '3d'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'"
        @click="setSingleWindowView('3d')">
        3D
      </button>
    </div>

    {{-- Panel 2D --}}
    <section id="cad-panel-2d"
      class="relative min-h-0 min-w-0 overflow-hidden border-r border-gray-700 bg-gray-800">

      <canvas class="h-full w-full" x-ref="cad"></canvas>

      {{-- Etiqueta 2D --}}
      <div
        class="absolute right-3 top-3 z-20 rounded px-3 py-1 text-sm font-medium shadow"
        :class="getActiveViewBadgeClass()"
        x-text="getActiveViewLabel()">
      </div>
    </section>

    {{-- Panel 3D --}}
    <section id="cad-panel-3d"
      class="relative min-h-0 min-w-0 overflow-hidden bg-gray-900">

      <div id="viewer3d-container" class="h-full w-full"></div>

      {{-- Etiqueta 3D --}}
      <div
        class="absolute top-3 left-3 z-20 rounded bg-gray-900 px-3 py-1 text-sm font-medium text-white shadow"
        x-text="getActive3DViewLabel()">
      </div>

      {{-- Indicador de plano 3D --}}
      <div x-show="currentState === trussDrawingState3D"
        x-cloak
        class="absolute bottom-4 right-4 z-20 rounded-lg bg-black/80 px-3 py-1.5 font-mono text-xs text-white shadow-lg">
        <span class="text-blue-400">✏️ Dibujando en:</span>
        <span x-text="currentState.currentPlane" class="ml-1 font-bold"></span>
        <span class="ml-2 text-[10px] text-gray-400">(1:XY 2:XZ 3:YZ)</span>
      </div>

    </section>

  </div>

  {{-- Barra inferior --}}
  <div class="cad-bg cad-border flex h-9 flex-row items-center justify-between border-t px-1 text-xs">
    <div class="flex flex-row items-center gap-2">
      {{-- Selector de renderer: control segmentado compacto --}}
      <div class="flex items-center overflow-hidden rounded border border-gray-600">
        <button class="px-2 py-1 text-xs transition-colors"
          :class="currentRenderer === diseñoRenderer ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'"
          @click="currentRenderer = diseñoRenderer;setState(idleState)">Diseño</button>
        <button class="border-l border-gray-600 px-2 py-1 text-xs transition-colors"
          :class="currentRenderer === deflexionRenderer ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'"
          @click="currentRenderer = deflexionRenderer;setState(idleState)">Deflexión</button>
        <button class="border-l border-gray-600 px-2 py-1 text-xs transition-colors"
          :class="currentRenderer === axialRenderer ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'"
          @click="currentRenderer = axialRenderer;setState(idleState)">Axial</button>
      </div>

<<<<<<< HEAD
      <!-- para probar la sincronizacion -->
=======
      <div class="h-5 w-px bg-gray-700"></div>

      <!-- Botón para iniciar/detener animación -->
      <x-cad.ui.ribbon-button clickHandler="toggleDeflectionAnimation()" toggle="false" label="Animar">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </x-cad.ui.ribbon-button>

      <!-- Botón para cambiar velocidad -->
      <x-cad.ui.ribbon-button clickHandler="toggleDeflectionAnimationSpeed()" toggle="false" label="Velocidad">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </x-cad.ui.ribbon-button>

      <!-- Botón para cambiar modo de animación -->
      <x-cad.ui.ribbon-button clickHandler="toggleDeflectionAnimationMode()" toggle="false" label="Modo">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </x-cad.ui.ribbon-button>

      <div class="h-5 w-px bg-gray-700"></div>

      <!-- Sincronizar 2D/3D -->
>>>>>>> 4a4f0e8713f895dfa286e9eeb2011a59afccb857
      <button @click="sync3D()"
        class="rounded border border-gray-600 px-2 py-1 text-xs text-gray-300 transition-colors hover:bg-gray-700 hover:text-white">
        Sincronizar
      </button>
    </div>

    {{-- Estado de selección (estilo ETABS), alineado a la derecha --}}
    <div class="flex flex-row items-center pr-3">
      <span
        x-show="getSelectionStatusLabel() !== ''"
        x-text="getSelectionStatusLabel()"
        :title="getSelectionStatusLabel()"
        class="text-xs text-white font-mono truncate max-w-[520px]"></span>
    </div>
  </div>

  {{-- Modal editor de grillas --}}
  <div id="grid-editor-modal" hidden
    style="position:fixed; inset:0; z-index:9999; display:none; align-items:center; justify-content:center; background:rgba(0,0,0,0.5)">

    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700 flex flex-col" style="width:1280px; max-width:96vw; max-height:92vh">
      <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
        <h3 class="text-sm font-semibold text-white">Sistema de Grillas (Grid System Data)</h3>
      </div>

      <div class="p-4 text-sm text-gray-200 overflow-auto">

        @php
          $pendingBadge = '<span class="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[9px] font-bold uppercase tracking-wide align-middle">Pendiente</span>';
        @endphp

        {{-- Fila superior, estructura de ETABS: Nombre+Origen apilados en una
             columna, Rango de pisos, Referencias (compacto), Vista previa.
             items-start: cada bloque toma solo el alto que necesita. --}}
        <div class="grid gap-4 mb-4 items-start" style="grid-template-columns: minmax(0,0.85fr) minmax(0,0.9fr) minmax(0,0.7fr) minmax(220px,300px)">

          {{-- Columna 1: Nombre + Origen apilados (como en ETABS) --}}
          <div class="flex flex-col gap-2.5">
            <div class="bg-gray-900 border border-gray-700 rounded p-2.5">
              <label class="block text-[11px] uppercase text-gray-400 mb-1">Nombre del sistema</label>
              <input id="grid-system-name" type="text"
                class="w-full rounded border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-white" value="G1">
            </div>

            <div class="bg-gray-900 border border-gray-700 rounded p-2.5">
              <p class="text-[11px] uppercase text-gray-400 mb-1.5">Origen del sistema</p>
              <div class="space-y-1.5">
                <div class="flex items-center gap-2">
                  <label for="grid-origin-x" class="text-xs text-gray-300 w-14 shrink-0">Global X</label>
                  <input id="grid-origin-x" type="number" step="any"
                    class="min-w-0 flex-1 rounded border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-white" value="0">
                  <span class="text-[10px] text-gray-500 w-3 shrink-0">m</span>
                </div>
                <div class="flex items-center gap-2">
                  <label for="grid-origin-y" class="text-xs text-gray-300 w-14 shrink-0">Global Y</label>
                  <input id="grid-origin-y" type="number" step="any"
                    class="min-w-0 flex-1 rounded border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-white" value="0">
                  <span class="text-[10px] text-gray-500 w-3 shrink-0">m</span>
                </div>
                <div class="flex items-center gap-2">
                  <label class="text-xs text-gray-500 w-14 shrink-0">Rotación</label>
                  <input type="number" disabled title="Requiere rediseñar el motor de grilla para grillas no alineadas a los ejes."
                    class="min-w-0 flex-1 rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-500 cursor-not-allowed" value="0">
                  <span class="text-[10px] text-gray-500 w-3 shrink-0">°</span>
                </div>
              </div>
              <div class="mt-1.5">{!! $pendingBadge !!}</div>
            </div>
          </div>

          {{-- Columna 2: Rango de pisos --}}
          <div class="bg-gray-900 border border-gray-700 rounded p-2.5">
            <p class="text-[11px] uppercase text-gray-400 mb-1">Pisos donde aplica {!! $pendingBadge !!}</p>
            <label class="flex items-center gap-1.5 text-xs text-gray-300 mb-1">
              <input class="accent-blue-600" type="radio" name="grid-story-range" id="grid-story-range-all" value="all" checked>
              Todos los pisos (por defecto)
            </label>
            <label class="flex items-center gap-1.5 text-xs text-gray-300 mb-1.5">
              <input class="accent-blue-600" type="radio" name="grid-story-range" id="grid-story-range-custom" value="custom">
              Solo entre estos pisos
            </label>
            <div class="grid grid-cols-2 gap-2">
              <label class="text-[11px] text-gray-400">Piso superior
                <select id="grid-top-story" disabled
                  class="mt-0.5 w-full rounded border border-gray-600 bg-gray-700 px-1.5 py-1 text-xs text-white"></select>
              </label>
              <label class="text-[11px] text-gray-400">Piso inferior
                <select id="grid-bottom-story" disabled
                  class="mt-0.5 w-full rounded border border-gray-600 bg-gray-700 px-1.5 py-1 text-xs text-white"></select>
              </label>
            </div>
            <p class="text-[10px] text-gray-500 mt-1.5">Se guarda, aún no oculta la grilla fuera de este rango.</p>
          </div>

          {{-- Columna 3: Referencias, compacto como "Click to Modify/Show" --}}
          <div class="bg-gray-900 border border-gray-700 rounded p-2.5">
            <p class="text-[11px] uppercase text-gray-400 mb-1.5">Referencias {!! $pendingBadge !!}</p>
            <div class="flex flex-col gap-1.5">
              <button id="btn-grid-reference-points" type="button"
                class="px-2 py-1.5 rounded text-xs bg-gray-700 border border-gray-600 text-gray-200 hover:bg-gray-600">Puntos de referencia...</button>
              <button id="btn-grid-reference-planes" type="button"
                class="px-2 py-1.5 rounded text-xs bg-gray-700 border border-gray-600 text-gray-200 hover:bg-gray-600">Planos de referencia...</button>
            </div>
          </div>

          {{-- Columna 4: Vista previa --}}
          <div class="bg-gray-900 border border-gray-700 rounded p-2.5 flex flex-col">
            <svg id="grid-preview-svg" class="flex-1 w-full rounded border border-gray-700" style="background:#0f172a; min-height:150px"></svg>
            <p class="text-center text-[10px] text-gray-500 mt-1">Vista previa</p>
          </div>
        </div>

        <div class="flex gap-5 items-center mb-4">
          <label class="flex items-center gap-1.5 text-gray-200">
            <input class="accent-blue-600" type="radio" name="grid-display-mode" id="grid-mode-ordinates" value="ordinates" checked>
            Ver como posición desde el origen
          </label>

          <label class="flex items-center gap-1.5 text-gray-200">
            <input class="accent-blue-600" type="radio" name="grid-display-mode" id="grid-mode-spacing" value="spacing">
            Ver como distancia entre ejes
          </label>
        </div>

        <div class="grid grid-cols-2 gap-5 mb-5">
          <section>
            <div class="flex justify-between items-center mb-1">
              <h4 class="text-xs font-semibold text-gray-300 uppercase">Ejes en X (verticales)</h4>
              <button id="btn-add-x-grid" type="button"
                class="px-2 py-1 rounded text-xs bg-gray-700 border border-gray-600 text-gray-200 hover:bg-gray-600">Agregar eje X</button>
            </div>

            <table class="w-full border-collapse text-xs text-gray-200">
              <thead class="bg-gray-900">
                <tr>
                  <th class="p-2 text-left font-medium text-gray-400">Nombre</th>
                  <th class="p-2 text-left font-medium text-gray-400">Posición X (m)</th>
                  <th class="p-2 text-left font-medium text-gray-400">Visible</th>
                  <th class="p-2 text-left font-medium text-gray-400">Etiqueta</th>
                  <th class="p-2"></th>
                </tr>
              </thead>
              <tbody id="x-grid-body"></tbody>
            </table>
          </section>

          <section>
            <div class="flex justify-between items-center mb-1">
              <h4 class="text-xs font-semibold text-gray-300 uppercase">Ejes en Y (horizontales)</h4>
              <button id="btn-add-y-grid" type="button"
                class="px-2 py-1 rounded text-xs bg-gray-700 border border-gray-600 text-gray-200 hover:bg-gray-600">Agregar eje Y</button>
            </div>

            <table class="w-full border-collapse text-xs text-gray-200">
              <thead class="bg-gray-900">
                <tr>
                  <th class="p-2 text-left font-medium text-gray-400">Nombre</th>
                  <th class="p-2 text-left font-medium text-gray-400">Posición Y (m)</th>
                  <th class="p-2 text-left font-medium text-gray-400">Visible</th>
                  <th class="p-2 text-left font-medium text-gray-400">Etiqueta</th>
                  <th class="p-2"></th>
                </tr>
              </thead>
              <tbody id="y-grid-body"></tbody>
            </table>
          </section>
        </div>

        <section>
          <div class="flex justify-between items-center mb-1">
            <h4 class="text-xs font-semibold text-gray-300 uppercase">Grillas diagonales / no ortogonales</h4>
            <button id="btn-add-general-grid" type="button"
              class="px-2 py-1 rounded text-xs bg-gray-700 border border-gray-600 text-gray-200 hover:bg-gray-600">Agregar grilla diagonal</button>
          </div>

          <table class="w-full border-collapse text-xs text-gray-200">
            <thead class="bg-gray-900">
              <tr>
                <th class="p-2 text-left font-medium text-gray-400">Nombre</th>
                <th class="p-2 text-left font-medium text-gray-400">X1</th>
                <th class="p-2 text-left font-medium text-gray-400">Y1</th>
                <th class="p-2 text-left font-medium text-gray-400">X2</th>
                <th class="p-2 text-left font-medium text-gray-400">Y2</th>
                <th class="p-2 text-left font-medium text-gray-400">Visible</th>
                <th class="p-2 text-left font-medium text-gray-400">Etiqueta</th>
                <th class="p-2"></th>
              </tr>
            </thead>
            <tbody id="general-grid-body"></tbody>
          </table>

          <p class="mt-2 text-[11px] text-gray-400">
            Las filas marcadas "Desde grilla X/Y" se editan arriba, en Ejes en X / Ejes en Y — acá solo se agregan
            grillas inclinadas que no son ni verticales ni horizontales.
          </p>
        </section>
      </div>

      <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700">
        <button id="btn-grid-editor-cancel" type="button"
          class="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">Cancelar</button>
        <button id="btn-grid-editor-apply" type="button"
          class="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm">Aplicar</button>
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