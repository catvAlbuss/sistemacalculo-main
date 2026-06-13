<x-calc-layout title="ETABS - Análisis Estructural">
    {{-- CONTENEDOR PRINCIPAL CON CAPAS SUPERPUESTAS --}}
    <div class="relative h-screen w-full overflow-hidden bg-gray-900">

        {{-- CAPA 1: VISOR CAD DE FONDO (Vue) --}}
        <div id="cad-reference-layer"
            class="absolute inset-0 z-0"
            style="opacity: 0.6; pointer-events: none;">
            <div id="cad-viewer-app" class="h-full w-full"></div>
        </div>

        {{-- CAPA 2: SISTEMA DE DIBUJO EXISTENTE (Alpine) --}}
        <div id="drawing-layer" class="absolute inset-0 z-10">
            <div class="cad-text-color cad-bg cad-border flex h-screen flex-col"
                x-data="cadSys"
                x-init="initSys($refs.cad, $refs.distanceInput)">
                <input id="_token" name="_token" type="hidden" value="{{ csrf_token() }}" />

                {{-- TOOLBAR MODIFICADA CON CONTROLES DE FONDO --}}
                <div class="cad-border flex items-center overflow-x-auto overflow-y-hidden border-b px-2">
                    <span class="cad-text-logo-color w-48 text-sm font-bold italic">Análisis Estructural De Armaduras</span>

                    {{-- Tus grupos de herramientas existentes --}}
                    <x-cad.ribbon-group title="Diseñar">
                        <x-cad.ribbon-button clickHandler="setState(trussDrawingState)" toggle="currentState === trussDrawingState" label="Barra">
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
                    </x-cad.ribbon-group>

                    {{-- NUEVO GRUPO: FONDO CAD --}}
                    <x-cad.ribbon-group title="Fondo CAD">
                        <x-cad.ribbon-button clickHandler="loadCadFile()" toggle="false" label="Cargar Plano">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                            </svg>
                        </x-cad.ribbon-button>
                        <x-cad.ribbon-button clickHandler="toggleCadVisibility()" toggle="cadBackground.visible" label="Mostrar/Ocultar">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                        </x-cad.ribbon-button>
                        <x-cad.ribbon-button clickHandler="calibrateCad()" toggle="false" label="Calibrar">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                        </x-cad.ribbon-button>
                    </x-cad.ribbon-group>

                    {{-- Tus otros grupos existentes --}}
                    <x-cad.ribbon-group title="Tareas">
                        <form class="flex flex-row" x-on:submit="calcularFuerzas">
                            @csrf
                            <x-cad.ribbon-button clickHandler="" toggle="false" label="Correr">
                                <x-cad.svg.run></x-cad.svg.run>
                            </x-cad.ribbon-button>
                        </form>
                        <x-cad.ribbon-button clickHandler="generarReporte" toggle="false" label="Reporte">
                            <x-cad.svg.pdf></x-cad.svg.pdf>
                        </x-cad.ribbon-button>
                    </x-cad.ribbon-group>

                    <x-cad.ribbon-group title="Estructura">
                        <x-cad.ribbon-button clickHandler="options.showWireframe = !options.showWireframe" toggle="options.showWireframe" label="Wireframe">
                            <x-cad.svg.wireframe></x-cad.svg.wireframe>
                        </x-cad.ribbon-button>
                        <x-cad.ribbon-button-subitem clickHandler="options.showForces = !options.showForces" label="Fuerzas" toggle="options.showForces">
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
                        <x-cad.ribbon-button clickHandler="options.showMaterials = !options.showMaterials" toggle="options.showMaterials" label="Materiales">
                            <x-cad.svg.material></x-cad.svg.material>
                        </x-cad.ribbon-button>
                        <x-cad.ribbon-button clickHandler="options.showIDs = !options.showIDs" toggle="options.showIDs" label="ID">
                            <x-cad.svg.id></x-cad.svg.id>
                        </x-cad.ribbon-button>
                    </x-cad.ribbon-group>

                    <x-cad.ribbon-group title="Resultados">
                        <x-cad.ribbon-button-subitem clickHandler="options.showDeflection = !options.showDeflection" label="Deflección" toggle="options.showDeflection">
                            <x-slot name="slot1"><x-cad.svg.deflection></x-cad.svg.deflection></x-slot>
                            <x-slot name="slot2">
                                <input id="dEscala" name="dEscala" type="range" min="1" max="1000" step="1" x-model="options.deflectionScale" x-on:input="calcularDeflecciones()">
                            </x-slot>
                        </x-cad.ribbon-button-subitem>
                        <x-cad.ribbon-button clickHandler="options.showReactions = !options.showReactions" toggle="options.showReactions" label="Reacción">
                            <x-cad.svg.reaction></x-cad.svg.reaction>
                        </x-cad.ribbon-button>
                        <x-cad.ribbon-button-subitem clickHandler="options.showFAxiales = !options.showFAxiales" label="Axial" toggle="options.showFAxiales">
                            <x-slot name="slot1"><x-cad.svg.axial></x-cad.svg.axial></x-slot>
                            <x-slot name="slot2">
                                <div class="flex flex-row justify-between gap-1">
                                    <label for="fAxialesValues">Fuerzas</label>
                                    <input id="fAxialesValues" name="fAxialesValues" type="checkbox" x-model="options.showFAxialesValues">
                                </div>
                            </x-slot>
                        </x-cad.ribbon-button-subitem>
                    </x-cad.ribbon-group>

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
                </div>

                {{-- ÁREA PRINCIPAL --}}
                <div class="flex flex-1 overflow-hidden">
                    {{-- SIDE PANEL (sin cambios) --}}
                    <x-cad.layout.side-panel></x-cad.layout.side-panel>

                    {{-- CANVAS DE DIBUJO --}}
                    <main class="relative flex basis-3/4 flex-col bg-transparent">
                        <input class="absolute w-28 -translate-x-1/2 -translate-y-1/2" id="distance" name="distance" type="number"
                            x-show="currentState === trussDrawingState && currentState.shape.node1"
                            x-ref="distanceInput"
                            @keyup.enter="trussDrawingState.createBeam($data)">
                        <canvas class="w-full flex-1" x-ref="cad" style="background: transparent;"></canvas>

                        {{-- RENDERER SELECTOR --}}
                        <div class="cad-bg cad-border flex flex-row border-r-4 text-xs">
                            <button class="p-1" :class="currentRenderer === diseñoRenderer ? 'bg-gray-100' : ''"
                                @click="currentRenderer = diseñoRenderer;setState(idleState)">Diseño</button>
                            <button class="p-1" :class="currentRenderer === deflexionRenderer ? 'bg-gray-100' : ''"
                                @click="currentRenderer = deflexionRenderer;setState(idleState)">Deflexion</button>
                            <button class="p-1" :class="currentRenderer === axialRenderer ? 'bg-gray-100' : ''"
                                @click="currentRenderer = axialRenderer;setState(idleState)">Axial</button>
                        </div>
                    </main>
                </div>

                {{-- FOOTER --}}
                <x-cad.layout.footer></x-cad.layout.footer>
            </div>
        </div>

        {{-- INPUT OCULTO PARA SELECCIONAR ARCHIVO --}}
        <input type="file" id="cad-file-input" accept=".dwg,.dxf" class="hidden" @change="handleCadFileSelect($event)">
    </div>

    {{-- SCRIPTS --}}
    @vite(['resources/js/etabs/main.js'])
</x-calc-layout>

<script>
    // Funciones globales para Alpine
    function loadCadFile() {
        document.getElementById('cad-file-input').click()
    }

    function handleCadFileSelect(event) {
        const file = event.target.files[0]
        if (file && window.cadReference) {
            window.cadReference.loadFile(file)
        }
    }

    function toggleCadVisibility() {
        const cadSys = document.querySelector('[x-data="cadSys"]')?.__x
        if (cadSys && cadSys.toggleCadVisibility) {
            cadSys.toggleCadVisibility()
        }
    }

    function calibrateCad() {
        const cadSys = document.querySelector('[x-data="cadSys"]')?.__x
        if (cadSys && cadSys.startCalibration) {
            cadSys.startCalibration()
        }
    }
</script>