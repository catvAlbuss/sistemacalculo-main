<!-- Toolbar -->
<div class="cad-border flex items-center overflow-x-auto overflow-y-hidden border-b px-2">
    <!-- Add more toolbar buttons as needed -->
    <span class="cad-text-logo-color w-48 text-sm font-bold italic">Analisis Estructural De Armaduras</span>
    <!-- -------------------------APARTADO DE DISEÑAR-------------------------- -->
    <x-cad.ui.ribbon-group title="Diseñar">
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
        <form class="flex flex-row" x-on:submit="calcularFuerzas">
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
        <x-cad.ui.ribbon-button-subitem clickHandler="options.showForces = !options.showForces" label="Fuerzas"
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
        <x-cad.ui.ribbon-button-subitem clickHandler="options.showDeflection = !options.showDeflection" label="Deflección"
            toggle="options.showDeflection">
            <x-slot name="slot1">
                <x-cad.svg.deflection></x-cad.svg.deflection>
            </x-slot>
            <x-slot name="slot2">
                <input id="dEscala" name="dEscala" type="range" min="1" max="1000" step="1"
                    x-model="options.deflectionScale" x-on:input="calcularDeflecciones()">
            </x-slot>
        </x-cad.ui.ribbon-button-subitem>
        <x-cad.ui.ribbon-button clickHandler="options.showReactions = !options.showReactions" toggle="options.showReactions"
            label="Reacción">
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
    <!-- Agrega esto en tu toolbar para permitir la importación -->
    <x-cad.ui.ribbon-group title="CAD">
        <label class="cursor-pointer block px-4 py-2 text-sm hover:bg-gray-700">
            Importar DXF/DWG
            <input type="file" id="cad-file-input" accept=".dwg,.dxf" class="hidden" />
        </label>
    </x-cad.ui.ribbon-group>
</div>