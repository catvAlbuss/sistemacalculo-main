<!-- Toolbar -->
<div>
  <x-cad.menu-bar />
  <div class="cad-border flex h-[64px] items-stretch overflow-x-auto overflow-y-hidden border-b px-1">
    <!-- -------------------------APARTADO DE DISEÑAR-------------------------- -->
    <x-cad.ui.ribbon-group title="Diseñar">
      <x-cad.ui.ribbon-button clickHandler="openNewModelDialog()" toggle="false" label="Nuevo Modelo">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </x-cad.ui.ribbon-button>
      <x-cad.ui.ribbon-button clickHandler="setState(trussDrawingState)" toggle="currentState === trussDrawingState"
        label="Barra">
        <x-cad.svg.beam></x-cad.svg.beam>
      </x-cad.ui.ribbon-button>
      <x-cad.ui.ribbon-button clickHandler="snap_enabled = !snap_enabled" toggle="snap_enabled" label="Snap">
        <x-cad.svg.grid-snap></x-cad.svg.grid-snap>
      </x-cad.ui.ribbon-button>
      <x-cad.ui.ribbon-button clickHandler="options.showGrid = !options.showGrid" toggle="options.showGrid" label="Grid">
        <x-cad.svg.grid></x-cad.svg.grid>
      </x-cad.ui.ribbon-button>
      <x-cad.ui.ribbon-button clickHandler="fitContentToScreen" toggle="false" label="Centrar">
        <x-cad.svg.center></x-cad.svg.center>
      </x-cad.ui.ribbon-button>
      {{-- <x-cad.ui.ribbon-button-subitem clickHandler="options.showDeflection = !options.showDeflection" label="Escala"
            toggle="options.showDeflection">
            <x-slot name="slot1"></x-slot>
            <x-slot name="slot2">
                <input type="range" name="dEscala" id="dEscala" min="1" max="1000" step="1"
                    x-model="options.deflectionScale" x-on:input="calcularDeflecciones()">
            </x-slot>
        </x-cad.ui.ribbon-button-subitem> --}}
    </x-cad.ui.ribbon-group>
    <!-- -------------------------APARTADO DE TAREAS -------------------------- -->
    <x-cad.ui.ribbon-group title="Tareas">
      <form class="flex flex-row" x-on:submit.prevent="calcularFuerzas" id="run-analysis-form">
        @csrf
        <x-cad.ui.ribbon-button clickHandler="" toggle="false" label="Correr">
          <x-cad.svg.run></x-cad.svg.run>
        </x-cad.ui.ribbon-button>
      </form>
      <x-cad.ui.ribbon-button clickHandler="generarReporte" toggle="false" label="Reporte">
        <x-cad.svg.pdf></x-cad.svg.pdf>
      </x-cad.ui.ribbon-button>
    </x-cad.ui.ribbon-group>
    <!-- -------------------------APARTADO DE ESTRUCTURA ----------------------- -->
    <x-cad.ui.ribbon-group title="Estructura">
      <x-cad.ui.ribbon-button clickHandler="options.showWireframe = !options.showWireframe" toggle="options.showWireframe"
        label="Wireframe">
        <x-cad.svg.wireframe></x-cad.svg.wireframe>
      </x-cad.ui.ribbon-button>
      <!-- SECCION DE FUERZAZ -->
      <x-cad.ui.ribbon-button-subitem clickHandler="showForces()" label="Fuerzas"
        toggle="options.showForces">
        <x-slot name="slot1"><x-cad.svg.force></x-cad.svg.force></x-slot>
        <x-slot name="slot2">
          <div class="flex flex-row justify-between gap-1">
            <label for="fCM">CM</label>
            <input id="fCM" name="fCM" type="radio" value="CM" x-model="options.currentLoad" @change="sync3D()">
            <label for="fCV">CV</label>
            <input id="fCV" name="fCV" type="radio" value="CV" x-model="options.currentLoad" @change="sync3D()">
            <label for="fCVVM">CVV-</label>
            <input id="fCVVM" name="fCVVM" type="radio" value="CVVM" x-model="options.currentLoad" @change="sync3D()">
            <label for="fCVVP">CVV+</label>
            <input id="fCVVP" name="fCVVP" type="radio" value="CVVP" x-model="options.currentLoad" @change="sync3D()">
            <label for="fCN">CN</label>
            <input id="fCN" name="fCN" type="radio" value="CN" x-model="options.currentLoad" @change="sync3D()">
            <label for="fCLL">CLL</label>
            <input id="fCLL" name="fCLL" type="radio" value="CLL" x-model="options.currentLoad" @change="sync3D()">
          </div>
        </x-slot>
      </x-cad.ui.ribbon-button-subitem>
      <!-- SECCION DE MATERIALES -->
      <x-cad.ui.ribbon-button clickHandler="options.showMaterials = !options.showMaterials" toggle="options.showMaterials"
        label="Materiales">
        <x-cad.svg.material></x-cad.svg.material>
      </x-cad.ui.ribbon-button>
      <!-- SECCION ID -->
      <x-cad.ui.ribbon-button clickHandler="options.showIDs = !options.showIDs" toggle="options.showIDs" label="ID">
        <x-cad.svg.id></x-cad.svg.id>
      </x-cad.ui.ribbon-button>
    </x-cad.ui.ribbon-group>
    <!-- -------------------------APARTADO DE LOS RESULTADOS------------------------ -->
    <x-cad.ui.ribbon-group title="Resultados">
      <x-cad.ui.ribbon-button-subitem clickHandler="showDeflections()" label="Deflección"
        toggle="options.showDeflection">
        <x-slot name="slot1">
          <x-cad.svg.deflection></x-cad.svg.deflection>
        </x-slot>
        <x-slot name="slot2">
          <input id="dEscala" name="dEscala" type="range" min="1" max="1000" step="1"
            x-model="options.deflectionScale" @input="updateDeflectionScale()">
        </x-slot>
      </x-cad.ui.ribbon-button-subitem>
      <x-cad.ui.ribbon-button clickHandler="showReactions()" toggle="options.showReactions"
        label="Reacción">
        <x-cad.svg.reaction></x-cad.svg.reaction>
      </x-cad.ui.ribbon-button>
      <x-cad.ui.ribbon-button clickHandler="openReactionsDisplay()" toggle="reactionsDisplay?.enabled"
        label="Reacciones por Caso...">
        <x-cad.svg.reaction></x-cad.svg.reaction>
      </x-cad.ui.ribbon-button>
      <x-cad.ui.ribbon-button-subitem clickHandler="options.showFAxiales = !options.showFAxiales" label="Axial"
        toggle="options.showFAxiales">
        <x-slot name="slot1"><x-cad.svg.axial></x-cad.svg.axial></x-slot>
        <x-slot name="slot2">
          <div class="flex flex-row justify-between gap-1">
            <label for="fAxialesValues">Fuerzas</label>
            <input id="fAxialesValues" name="fAxialesValues" type="checkbox" x-model="options.showFAxialesValues">
          </div>
        </x-slot>
      </x-cad.ui.ribbon-button-subitem>
    </x-cad.ui.ribbon-group>
    <!-- -------------------------APARTADO DE PARAMETRIZADO ----------------------- -->
    <x-cad.ui.ribbon-group title="Parametrizado">
      <x-cad.ui.ribbon-button clickHandler="creaArco()" toggle="false" label="Arco">
        <x-cad.svg.arco></x-cad.svg.arco>
      </x-cad.ui.ribbon-button>
      <x-cad.ui.ribbon-button clickHandler="creaTriangulo()" toggle="false" label="Triangulo">
        <x-cad.svg.triangle></x-cad.svg.triangle>
      </x-cad.ui.ribbon-button>
      <x-cad.ui.ribbon-button clickHandler="creaElipse()" toggle="false" label="Elipse">
        <x-cad.svg.ellipse></x-cad.svg.ellipse>
      </x-cad.ui.ribbon-button>
    </x-cad.ui.ribbon-group>
    <!-- -------------------------APARTADO DE 3D ----------------------- -->

    <x-cad.ui.ribbon-group title="Grillas">
      <button
        id="btn-open-grid-editor"
        type="button"
        class="flex h-full flex-col items-center justify-center rounded px-1.5 py-1 text-center cad-ribbon-button-hover-bg cad-text-logo-color">
        <div class="flex h-6 w-6 self-center"><x-cad.svg.grid></x-cad.svg.grid></div>
        <span class="text-[10px] leading-tight">Editar</span>
      </button>
    </x-cad.ui.ribbon-group>

    <x-cad.ui.ribbon-group title="Vistas">
      <div class="flex flex-col justify-center gap-0.5 px-1.5 text-xs text-white">
        <select
          class="rounded border border-gray-600 bg-gray-800 px-1.5 py-1 text-xs text-white"
          @change="setViewFromSet($event.target.value)">
          <template x-for="(view, index) in viewSet" :key="index">
            <option :value="index" x-text="view.name"></option>
          </template>
        </select>
      </div>
    </x-cad.ui.ribbon-group>

    <!-- Dentro del grupo "3D", añade: -->
    <x-cad.ui.ribbon-group title="Edificio">
      <!-- <x-cad.ui.ribbon-button clickHandler="showTestFrame()" toggle="false" label="Pórtico Prueba">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v18" />
        </svg>
      </x-cad.ui.ribbon-button> -->

      <!-- Elevar selección -->
      <x-cad.ui.ribbon-button clickHandler="elevateSelectedNodes()" toggle="false" label="Elevar +1m">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
      </x-cad.ui.ribbon-button>

      <!-- Show Deformed Shape (estilo ETABS): deformada estática/animada por caso sísmico -->
      <x-cad.ui.ribbon-button clickHandler="openDeformedShapeDialog()" toggle="false" label="Deformada">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21h18" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M6 21c0-6 4-8 4-14M14 21c0-6 4-8 4-14M10 7h8" />
        </svg>
      </x-cad.ui.ribbon-button>

      <!-- Bajar selección -->
      <x-cad.ui.ribbon-button clickHandler="lowerSelectedNodes()" toggle="false" label="Bajar -1m">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </x-cad.ui.ribbon-button>

      <!-- Extruir a nuevo piso -->
      <x-cad.ui.ribbon-button clickHandler="extrudeToNewFloor()" toggle="false" label="+ Nuevo Piso">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v18" />
        </svg>
      </x-cad.ui.ribbon-button>
    </x-cad.ui.ribbon-group>

    <x-cad.ui.ribbon-group title="Cimentación">

      <x-cad.ui.ribbon-button clickHandler="calculateZapatas()" toggle="false" label="Calcular Zapatas">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <!-- Base de concreto de la zapata combinada (Rectángulo inferior) -->
          <path d="M2 17h20v4H2z" />

          <!-- Columna Izquierda (Tronco y líneas de carga vertical) -->
          <path d="M6 17V7h4v10" />
          <path d="M8 3v4" />

          <!-- Columna Derecha (Tronco y líneas de carga vertical) -->
          <path d="M14 17V7h4v10" />
          <path d="M16 3v4" />
        </svg>

      </x-cad.ui.ribbon-button>

      {{-- Mueve la zapata seleccionada para que su centroide geométrico
           coincida con su(s) columna(s) — réplica manual de la herramienta
           "Mover" del editor original del cliente (adm_safecito.js), que
           evita que quede una excentricidad artificial por dibujo
           descuadrado (ver conversación sobre calcularZapatas2EnPhp /
           zapatas2.m, ninguno de los dos corrige esto en la fórmula). --}}
      <x-cad.ui.ribbon-button clickHandler="centerZapataOnColumn()" toggle="false" label="Centrar en Columna">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      </x-cad.ui.ribbon-button>

      {{-- Pinta σ (presión de contacto) directamente sobre la zapata en el
           2D, reutilizando el point cloud que ya calcula "Calcular
           Zapatas" (ver canvas2d/zapataPressureLayer.js) — pedido del
           cliente, sin backend. --}}
      <x-cad.ui.ribbon-button clickHandler="showZapataPressureLayer = !showZapataPressureLayer"
        toggle="showZapataPressureLayer" label="Presión 2D">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
        </svg>
      </x-cad.ui.ribbon-button>

      <div class="flex h-full flex-col items-center justify-center self-center gap-0.5 px-1" x-show="showZapataPressureLayer" x-cloak>
        <select x-model.number="zapataPressureComboIndex"
          class="w-[70px] rounded border border-gray-700 bg-gray-900 px-1 py-0.5 text-[10px] text-gray-200 outline-none focus:border-blue-500">
          <template x-for="n in 11" :key="n">
            <option :value="n - 1" x-text="'Comb ' + n"></option>
          </template>
        </select>
        <label class="text-[9px] leading-tight text-gray-500">Combo</label>
      </div>
    </x-cad.ui.ribbon-group>
    <x-cad.ui.ribbon-group title="Otros">
      <x-cad.ui.ribbon-button clickHandler="cadSystem.activateEditMenuAction('divide-lines')" toggle="false" label="Dividir lineas">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <!-- Segmento de línea Izquierdo -->
          <path d="M3 12h6" />

          <!-- Segmento de línea Derecho -->
          <path d="M15 12h6" />

          <!-- Marca de corte / Cuchilla de división central (Inclinada) -->
          <path d="M14 6l-4 12" />

          <!-- Puntos indicadores de los nuevos extremos creados -->
          <circle cx="9" cy="12" r="1" fill="currentColor" />
          <circle cx="15" cy="12" r="1" fill="currentColor" />
        </svg>


      </x-cad.ui.ribbon-button>
      <x-cad.ui.ribbon-button clickHandler="cadSystem.activateEditMenuAction('replicate')" toggle="false" label="Replicar">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <!-- Fila Superior de Nodos (Círculos) -->
          <circle cx="6" cy="6" r="1.5" />
          <circle cx="12" cy="6" r="1.5" />
          <circle cx="18" cy="6" r="1.5" />

          <!-- Líneas de Conexión Verticales (Ejes de Replicación) -->
          <path d="M6 10v4" />
          <path d="M12 10v4" />
          <path d="M18 10v4" />

          <!-- Fila Inferior de Nodos (Círculos Replicados) -->
          <circle cx="6" cy="18" r="1.5" />
          <circle cx="12" cy="18" r="1.5" />
          <circle cx="18" cy="18" r="1.5" />
        </svg>

      </x-cad.ui.ribbon-button>
      <x-cad.ui.ribbon-button clickHandler="cadSystem.activateEditMenuAction('merge-points')" toggle="false" label="Unir puntos">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <!-- Conexiones o líneas estructurales internas -->
          <path d="M6 14l6-6 6 6" />
          <path d="M12 8v8" />

          <!-- Nodo Superior Central -->
          <circle cx="12" cy="6" r="1.5" />

          <!-- Nodo Inferior Izquierdo -->
          <circle cx="5" cy="15" r="1.5" />

          <!-- Nodo Inferior Derecho -->
          <circle cx="19" cy="15" r="1.5" />

          <!-- Detalles base o líneas de apoyo inclinadas -->
          <path d="M4 18l2-2" />
          <path d="M20 18l-2-2" />
        </svg>


      </x-cad.ui.ribbon-button>
      <x-cad.ui.ribbon-button clickHandler="cadSystem.toggleFrameSectionLabels()" toggle="false" label="Ocultar etiquetas">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <!-- Etiqueta -->
          <path d="M3 8l6-4h9a2 2 0 0 1 2 2v3" />
          <path d="M3 8v6a2 2 0 0 0 2 2h6" />
          <!-- Ojo tachado (ocultar) -->
          <path d="M14 15.5a3 3 0 0 0 4 2.5" />
          <path d="M20.5 12.5A8 8 0 0 1 13 18" />
          <line x1="3" y1="3" x2="21" y2="21" />
        </svg>
      </x-cad.ui.ribbon-button>
      <x-cad.ui.ribbon-button clickHandler="cadSystem.toggleAreaSectionLabels()" toggle="false" label="Ocultar etiq. losas">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <!-- Losa (paralelogramo en perspectiva) -->
          <path d="M2 9l7-4 13 4-7 4z" />
          <path d="M2 9v3l13 5v-3" />
          <!-- Ojo tachado (ocultar) -->
          <path d="M14 17.5a3 3 0 0 0 4 2.5" />
          <path d="M21 15a8 8 0 0 1-6 5" />
          <line x1="3" y1="3" x2="21" y2="21" />
        </svg>
      </x-cad.ui.ribbon-button>
    </x-cad.ui.ribbon-group>
  </div>
  <!-- Modal para File > New Model -->
  <x-cad.modals.new-model />

  <!-- Modal para el apartado de las vistas -->
  <x-cad.modals.view-modal />


  <x-cad.modals.material-properties-modal />
  <x-cad.modals.frame-sections-modal />
  <x-cad.modals.diaphragms-modal />
  <x-cad.modals.section-cuts-modal />
  <x-cad.modals.groups-modal />
  <x-cad.modals.response-spectrum-functions-modal />
  <x-cad.modals.static-load-cases-modal />
  <x-cad.modals.load-combinations-modal />
  <x-cad.modals.mass-source-modal />
  <x-cad.modals.slab-sections-modal />
  <x-cad.modals.reactions-display-modal />
  <x-cad.modals.edit.divide-areas-modal />

  <x-cad.modals.wall-sections-modal />
 
  <!-- Seccion de analisis -->
  <x-cad.modals.analysis-options-modal />
  <x-cad.modals.check-model-modal />
  <!-- Seccion del modal de diseño -->
  <x-cad.modals.select-design-combinations-modal />
  <x-cad.modals.display-design-info-modal />
  <x-cad.modals.design-overwrites-modal />
</div>