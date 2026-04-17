<!-- Toolbar -->
<div class="cad-border flex items-center overflow-x-auto overflow-y-hidden border-b px-2">
  <!-- Add more toolbar buttons as needed -->
  <span class="cad-text-logo-color w-48 text-sm font-bold italic">Analisis Estructural De Armaduras</span>
  <!-- -------------------------APARTADO DE DISEÑAR-------------------------- -->
  <x-cad.ribbon-group title="Diseñar">
    <x-cad.ribbon-button clickHandler="openNewModelDialog()" toggle="false" label="Nuevo Modelo">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
    </x-cad.ribbon-button>
    <x-cad.ribbon-button clickHandler="setState(trussDrawingState)" toggle="currentState === trussDrawingState"
      label="Barra">
      <x-cad.svg.beam></x-cad.svg.beam>
    </x-cad.ribbon-button>
    <x-cad.ribbon-button clickHandler="snap_enabled = !snap_enabled" toggle="snap_enabled" label="Snap">
      <x-cad.svg.grid-snap></x-cad.svg.grid-snap>
    </x-cad.ribbon-button>
    <x-cad.ribbon-button clickHandler="options.showGrid = !options.showGrid" toggle="options.showGrid" label="Grid">
      <x-cad.svg.grid></x-cad.svg.grid>
    </x-cad.ribbon-button>
    <x-cad.ribbon-button clickHandler="fitContentToScreen" toggle="false" label="Centrar">
      <x-cad.svg.center></x-cad.svg.center>
    </x-cad.ribbon-button>
    {{-- <x-cad.ribbon-button-subitem clickHandler="options.showDeflection = !options.showDeflection" label="Escala"
            toggle="options.showDeflection">
            <x-slot name="slot1"></x-slot>
            <x-slot name="slot2">
                <input type="range" name="dEscala" id="dEscala" min="1" max="1000" step="1"
                    x-model="options.deflectionScale" x-on:input="calcularDeflecciones()">
            </x-slot>
        </x-cad.ribbon-button-subitem> --}}
  </x-cad.ribbon-group>
  <!-- -------------------------APARTADO DE TAREAS -------------------------- -->
  <x-cad.ribbon-group title="Tareas">
    <form class="flex flex-row" x-on:submit="calcularFuerzasHybrid">
      @csrf
      <x-cad.ribbon-button clickHandler="" toggle="false" label="Correr">
        <x-cad.svg.run></x-cad.svg.run>
      </x-cad.ribbon-button>
    </form>
    <x-cad.ribbon-button clickHandler="generarReporte" toggle="false" label="Reporte">
      <x-cad.svg.pdf></x-cad.svg.pdf>
    </x-cad.ribbon-button>
  </x-cad.ribbon-group>
  <!-- -------------------------APARTADO DE ESTRUCTURA ----------------------- -->
  <x-cad.ribbon-group title="Estructura">
    <x-cad.ribbon-button clickHandler="options.showWireframe = !options.showWireframe" toggle="options.showWireframe"
      label="Wireframe">
      <x-cad.svg.wireframe></x-cad.svg.wireframe>
    </x-cad.ribbon-button>
    <!-- SECCION DE FUERZAZ -->
    <x-cad.ribbon-button-subitem clickHandler="options.showForces = !options.showForces" label="Fuerzas"
      toggle="options.showForces">
      <x-slot name="slot1"><x-cad.svg.force></x-cad.svg.force></x-slot>
      <x-slot name="slot2">
        <div class="flex flex-row justify-between gap-1">
          <label for="fCM">CM</label>
          <input id="fCM" name="fCM" type="radio" value="CM" x-model="options.currentLoad">
          <label for="fCV">CV</label>
          <input id="fCV" name="fCV" type="radio" value="CV" x-model="options.currentLoad">
          <label for="fCVVM">CVV-</label>
          <input id="fCVVM" name="fCVVM" type="radio" value="CVVM" x-model="options.currentLoad">
          <label for="fCVVP">CVV+</label>
          <input id="fCVVP" name="fCVVP" type="radio" value="CVVP" x-model="options.currentLoad">
          <label for="fCN">CN</label>
          <input id="fCN" name="fCN" type="radio" value="CN" x-model="options.currentLoad">
          <label for="fCLL">CLL</label>
          <input id="fCLL" name="fCLL" type="radio" value="CLL" x-model="options.currentLoad">
        </div>
      </x-slot>
    </x-cad.ribbon-button-subitem>
    <!-- SECCION DE MATERIALES -->
    <x-cad.ribbon-button clickHandler="options.showMaterials = !options.showMaterials" toggle="options.showMaterials"
      label="Materiales">
      <x-cad.svg.material></x-cad.svg.material>
    </x-cad.ribbon-button>
    <!-- SECCION ID -->
    <x-cad.ribbon-button clickHandler="options.showIDs = !options.showIDs" toggle="options.showIDs" label="ID">
      <x-cad.svg.id></x-cad.svg.id>
    </x-cad.ribbon-button>
  </x-cad.ribbon-group>
  <!-- -------------------------APARTADO DE LOS RESULTADOS------------------------ -->
  <x-cad.ribbon-group title="Resultados">
    <x-cad.ribbon-button-subitem clickHandler="options.showDeflection = !options.showDeflection" label="Deflección"
      toggle="options.showDeflection">
      <x-slot name="slot1">
        <x-cad.svg.deflection></x-cad.svg.deflection>
      </x-slot>
      <x-slot name="slot2">
        <input id="dEscala" name="dEscala" type="range" min="1" max="1000" step="1"
          x-model="options.deflectionScale" x-on:input="calcularDeflecciones()">
      </x-slot>
    </x-cad.ribbon-button-subitem>
    <x-cad.ribbon-button clickHandler="options.showReactions = !options.showReactions" toggle="options.showReactions"
      label="Reacción">
      <x-cad.svg.reaction></x-cad.svg.reaction>
    </x-cad.ribbon-button>
    <x-cad.ribbon-button-subitem clickHandler="options.showFAxiales = !options.showFAxiales" label="Axial"
      toggle="options.showFAxiales">
      <x-slot name="slot1"><x-cad.svg.axial></x-cad.svg.axial></x-slot>
      <x-slot name="slot2">
        <div class="flex flex-row justify-between gap-1">
          <label for="fAxialesValues">Fuerzas</label>
          <input id="fAxialesValues" name="fAxialesValues" type="checkbox" x-model="options.showFAxialesValues">
        </div>
      </x-slot>
    </x-cad.ribbon-button-subitem>
  </x-cad.ribbon-group>
  <!-- -------------------------APARTADO DE PARAMETRIZADO ----------------------- -->
  <x-cad.ribbon-group title="Parametrizado">
    <x-cad.ribbon-button clickHandler="creaArco()" toggle="false" label="Arco">
      <x-cad.svg.arco></x-cad.svg.arco>
    </x-cad.ribbon-button>
    <x-cad.ribbon-button clickHandler="creaTriangulo()" toggle="false" label="Triangulo">
      <x-cad.svg.triangle></x-cad.svg.triangle>
    </x-cad.ribbon-button>
    <x-cad.ribbon-button clickHandler="creaElipse()" toggle="false" label="Elipse">
      <x-cad.svg.ellipse></x-cad.svg.ellipse>
    </x-cad.ribbon-button>
  </x-cad.ribbon-group>
  <!-- -------------------------APARTADO DE 3D ----------------------- -->
  <!-- Controles de cámara estilo ETABS -->
  <x-cad.ribbon-group title="Vista 2D">
    <!-- Vista en planta (desde arriba) -->
    <x-cad.ribbon-button clickHandler="openElevationModal()" toggle="false" label="S|ev">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12h18M3 6h18M3 18h18" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 3v18M16 3v18" />
      </svg>
    </x-cad.ribbon-button>
  </x-cad.ribbon-group>

  <!-- <x-cad.ribbon-group title="Edificio">
  <x-cad.ribbon-button clickHandler="extrudeTo3D(3, 1)" toggle="false" label="+1 Piso">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </x-cad.ribbon-button>
  
  <x-cad.ribbon-button clickHandler="extrudeTo3D(3, 5)" toggle="false" label="5 Pisos">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11l7-7 7 7M5 19l7-7 7 7" />
    </svg>
  </x-cad.ribbon-button>
</x-cad.ribbon-group> -->

  <!-- Dentro del grupo "3D", añadir: -->
  <!-- <x-cad.ribbon-button clickHandler="run3DAnalysisWithDeformation()" toggle="false" label="Analizar 3D">
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
</x-cad.ribbon-button> -->

  <!-- Dentro del grupo "3D", añade: -->
  <x-cad.ribbon-group title="Edificio">
    <x-cad.ribbon-button clickHandler="showTestFrame()" toggle="false" label="Pórtico Prueba">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v18" />
      </svg>
    </x-cad.ribbon-button>

    <!-- Elevar selección -->
    <x-cad.ribbon-button clickHandler="elevateSelectedNodes()" toggle="false" label="Elevar +1m">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
      </svg>
    </x-cad.ribbon-button>

    <!-- Bajar selección -->
    <x-cad.ribbon-button clickHandler="lowerSelectedNodes()" toggle="false" label="Bajar -1m">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </x-cad.ribbon-button>

    <!-- Extruir a nuevo piso -->
    <x-cad.ribbon-button clickHandler="extrudeToNewFloor()" toggle="false" label="+ Nuevo Piso">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v18" />
      </svg>
    </x-cad.ribbon-button>
  </x-cad.ribbon-group>
</div>