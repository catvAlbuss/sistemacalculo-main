<!-- Side Panel -->
<aside class="cad-bg cad-border relative flex h-full w-20 shrink-0 flex-col border-r-4" x-data="{ itemsPanelCollapsed: true }">
    {{-- ============================================================
         BARRA DE HERRAMIENTAS RÁPIDAS
         Accesos directos a las acciones más usadas. Cada botón llama al
         MISMO handler que su ítem de menú (así comparten la lógica y los
         modales Blade migrados). Los de dibujo resaltan cuando su modo
         está activo (:class por currentState). El aside queda angosto
         (solo lo que necesita esta barra) para que el canvas (flex-1 en
         cad-area.blade.php) siempre tenga el máximo espacio disponible;
         el panel de Items/Propiedades ya NO comparte ese ancho — flota
         encima del canvas (ver más abajo). --}}
    @php
    $qt = 'flex flex-col items-center justify-center gap-0.5 rounded p-1.5 text-[9px] leading-tight text-center hover:bg-blue-600 hover:text-white transition-colors';
    @endphp

    {{-- Flecha para mostrar/ocultar el panel flotante de Items/Propiedades. --}}
    <button @click="itemsPanelCollapsed = !itemsPanelCollapsed"
        title="Mostrar / ocultar panel de Items y Propiedades"
        class="flex items-center justify-center gap-1 border-b py-1.5 text-[9px] font-semibold uppercase tracking-wide text-gray-400 transition-colors hover:bg-gray-700 hover:text-white cad-border">
        <svg class="h-3.5 w-3.5 transition-transform duration-200" :class="itemsPanelCollapsed ? '' : 'rotate-180'"
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span>Panel</span>
    </button>

    <div class="flex min-h-0 flex-1 flex-col overflow-y-auto">

        {{-- Dibujar --}}
        <div class="border-b border-gray-700/70 bg-gray-900/30 py-1 text-center text-[9px] font-semibold uppercase tracking-wide text-gray-400">Dibujar</div>

        <div class="flex flex-col gap-1">
            <button title="Columnas: clic en un vértice de grilla para una sola, o arrastra un rectángulo para varias (solo en planta)"
                @click="cadSystem.activateDrawMenuAction('create-columns-region-clicks')"
                :class="currentState === columnsRegionState ? 'bg-blue-600 text-white' : 'text-gray-200'"
                class="{{ $qt }}">
                <span class="text-base leading-none"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M6 5h12a1 1 0 0 1 1 1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1a1 1 0 0 1 1-1m15-3v2H3V2zm-6 6h2v14h-2zM7 8h2v14H7zm4 0h2v14h-2z" />
                    </svg></span><span>Columna</span>
            </button>
            <button title="Dibujar frame / barra (funciona en 2D y 3D)"
                @click="cadSystem.activateDrawFrameTool()"
                :class="cadSystem?.activeDrawTool === 'frame' ? 'bg-blue-600 text-white' : 'text-gray-200'"
                class="{{ $qt }}">
                <span class="text-base leading-none"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14" />
                    </svg></span><span>Frame</span>
            </button>
            <button title="Vigas por región: clic cerca de un lado de grilla para una sola, o arrastra un rectángulo para varias (planta o elevación)"
                @click="cadSystem.activateDrawMenuAction('create-lines-region-clicks')"
                :class="currentState === createLinesRegionClicksState ? 'bg-blue-600 text-white' : 'text-gray-200'"
                class="{{ $qt }}">
                <span class="text-base leading-none"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="1" stroke-dasharray="3 2" />
                            <path d="M8 8h8M8 16h8" />
                        </g>
                    </svg></span><span>Vigas Reg.</span>
            </button>
            <button title="Dibujar losa / área (clic por clic, formas irregulares)"
                @click="cadSystem.activateDrawMenuAction('draw-area-slab')"
                :class="currentState === slabDrawingState ? 'bg-blue-600 text-white' : 'text-gray-200'"
                class="{{ $qt }}">
                <span class="text-base leading-none"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                            <rect fill="currentColor" width="7" height="7" x="3" y="3" rx="1" />
                            <rect fill="currentColor" width="7" height="7" x="14" y="3" rx="1" />
                            <rect fill="currentColor" width="7" height="7" x="14" y="14" rx="1" />
                            <rect fill="currentColor" width="7" height="7" x="3" y="14" rx="1" />
                        </g>
                    </svg></span><span>Losa</span>
            </button>
            <button title="Losa rectangular: 2 clics (esquinas opuestas)"
                @click="cadSystem.activateDrawMenuAction('draw-area-slab-rectangle')"
                :class="currentState === slabRegionState ? 'bg-blue-600 text-white' : 'text-gray-200'"
                class="{{ $qt }}">
                <span class="text-base leading-none"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <rect fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" width="16" height="16" x="4" y="4" rx="1" />
                    </svg></span><span>Losa Rect.</span>
            </button>
            <button title="Muro: clic sobre una viga o un lado de grilla = muro completo en 1 clic. O 2 clics en vértices/nodos para un largo custom (solo desde un piso, no la Base)"
                @click="cadSystem.activateDrawMenuAction('draw-wall-segment')"
                :disabled="cadSystem.isBasePlanViewActive?.()"
                :class="currentState === wallSegmentDrawingState
                    ? 'bg-blue-600 text-white'
                    : (cadSystem.isBasePlanViewActive?.() ? 'text-gray-500 opacity-40 cursor-not-allowed' : 'text-gray-200')"
                class="{{ $qt }}">
                <span class="text-base leading-none"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                            <rect x="3" y="4" width="18" height="16" rx="1" />
                            <path d="M3 10h18M3 16h18M9 4v6M15 10v6M9 16v4" />
                        </g>
                    </svg></span><span>Muro</span>
            </button>
            <button title="Zapata a mano alzada (dibuja el polígono alrededor de columnas)"
                @click="cadSystem.activateDrawMenuAction('draw-area-zapata')"
                :class="currentState === zapataDrawingState ? 'bg-blue-600 text-white' : 'text-gray-200'"
                class="{{ $qt }}">
                <span class="text-base leading-none">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                        <!-- Base de concreto de la zapata aislada (Cimiento) -->
                        <path d="M4 17h16v4H4z" />

                        <!-- Columna única central -->
                        <path d="M10 17V7h4v10" />

                        <!-- Línea de carga / Eje vertical central -->
                        <path d="M12 3v4" />
                    </svg>
                </span><span>Zapata a mano alzada</span>
            </button>
            <button title="Ortho (F8): fuerza los lados a salir horizontal o vertical, tanto al dibujar una Zapata a mano alzada como al arrastrar un vértice para editarla."
                @click="cadSystem.options.orthoMode = !cadSystem.options.orthoMode"
                :class="cadSystem.options.orthoMode ? 'bg-blue-600 text-white' : 'text-gray-200'"
                class="{{ $qt }}">
                <span class="text-base leading-none">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                        <path d="M4 4v16h16" />
                        <path d="M4 12h16M12 4v16" stroke-dasharray="2 2" />
                    </svg>
                </span><span>Ortho (F8)</span>
            </button>
        </div>

        {{-- soportes --}}
        <div class="border-y border-gray-700/70 bg-gray-900/30 py-1 text-center text-[9px] font-semibold uppercase tracking-wide text-gray-400">Apoyos</div>
        <div class="flex flex-col gap-1">
            <!-- <button title="Seleccionar objetos (frames / shells)"
                    @click="cadSystem.activateDrawMenuAction('select-object')"
                    :class="currentState === reshapeObjectState ? '' : ''"
                    class="{{ $qt }} text-gray-200">
                    <span class="text-base leading-none"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 4.1L12 6M5.1 8l-2.9-.8M6 12l-1.9 2M7.2 2.2L8 5.1m1.037 4.59a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z"/></svg></span><span>Seleccionar</span>
                </button> -->
            <button title="Asignar soportes / restraints a los nodos seleccionados"
                @click="cadSystem.activateAssignMenuAction('joint-restraints')"
                class="{{ $qt }} text-gray-200">
                <span class="scale-90 cad-text-logo-color">
                    <x-cad.svg.soporte1 />
                </span><span>Soporte</span>
            </button>
        </div>

        {{-- Cargas --}}
        <div class="border-y border-gray-700/70 bg-gray-900/30 py-1 text-center text-[9px] font-semibold uppercase tracking-wide text-gray-400">Cargas</div>
        <div class="flex flex-col gap-1">
            <button title="Carga distribuida en vigas / frames seleccionados"
                @click="cadSystem.activateAssignMenuAction('frame-load-distributed')"
                class="{{ $qt }} text-gray-200">
                <span class="text-base leading-none"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m7 6l5 5l5-5M7 13l5 5l5-5" />
                    </svg></span><span>Viga</span>
            </button>
            <button title="Carga puntual (fuerza) en nodos seleccionados"
                @click="cadSystem.activateAssignMenuAction('joint-load-force')"
                class="{{ $qt }} text-gray-200">
                <span class="text-base leading-none"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" />
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M22 12h-4M6 12H2m10-6V2m0 20v-4" />
                    </svg></span><span>Nodo</span>
            </button>
            <button title="Carga uniforme de área en losas seleccionadas"
                @click="cadSystem.activateAssignMenuAction('area-load-uniform')"
                class="{{ $qt }} text-gray-200">
                <span class="text-base leading-none"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <rect width="18" height="18" x="3" y="3" rx="2" fill="none" stroke="currentColor" stroke-width="2" />
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v8m-4-4l4 4l4-4" />
                    </svg></span><span>Losa</span>
            </button>
        </div>

        {{-- Secciones --}}
        <div class="border-y border-gray-700/70 bg-gray-900/30 py-1 text-center text-[9px] font-semibold uppercase tracking-wide text-gray-400">Secciones</div>
        <div class="flex flex-col gap-1">
            <button title="Asignar sección de frame a los frames seleccionados"
                @click="cadSystem.activateAssignMenuAction('frame-section')"
                class="{{ $qt }} text-gray-200">
                <span class="text-base leading-none"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <rect width="20" height="12" x="2" y="6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" rx="2" />
                    </svg></span><span>Frame Sec.</span>
            </button>
            <button title="Asignar sección de losa a las losas seleccionadas"
                @click="cadSystem.activateAssignMenuAction('area-slab-section')"
                class="{{ $qt }} text-gray-200">
                <span class="text-base leading-none"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                            <path d="M4 10c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2m0 12c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2" />
                            <rect width="8" height="8" x="14" y="14" rx="2" />
                        </g>
                    </svg></span><span>Slab Sec.</span>
            </button>
        </div>
    </div>

    {{-- ============================================================
         PANEL DE ITEMS / PROPIEDADES — OVERLAY FLOTANTE
         Ya no comparte ancho con la barra rápida ni con el canvas: se
         posiciona "position:absolute" pegado al borde derecho del aside
         (left-full, aside es "relative") y se SUPERPONE sobre el canvas
         2D cuando está abierto. Así el canvas siempre tiene su ancho
         completo (flex-1 en cad-area.blade.php); el panel solo "flota"
         encima mientras el usuario lo necesita. --}}
    <div x-show="!itemsPanelCollapsed" x-cloak x-transition class="cad-bg cad-border absolute left-full top-0 z-20 flex h-full w-80 flex-col overflow-y-auto rounded-r-md border-r-4 shadow-2xl">

        <!-- Panel de Grillas Diagonales -->
        <x-cad.ui.panel title="Items" init="isOpen = false">
            <ul>
                <li x-data="{ open: false }">
                    <div class="collapsible m-1 flex items-center rounded-sm p-2 text-xs hover:bg-gray-300">
                        <svg class="collapse-icon h-4 w-4 transition-transform duration-200" @click="open = ! open"
                            :class="open ? '' : '-rotate-90'" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 9l6 6 6-6" />
                        </svg>
                        <span>Materiales</span>
                        <button>+</button>
                    </div>
                    <ul class="ml-4 mr-1 mt-2 text-xs" x-show="open" x-transition>
                        <template x-for="material in materiales">
                            <li class="rounded-md px-2 py-1 hover:bg-gray-300"
                                x-text="`Material ${material.id} E: ${material.E} A: ${material.A}`">
                            </li>
                        </template>
                    </ul>
                </li>
            </ul>
            <ul>
                <li x-data="{ open: false }">
                    <div class="collapsible m-1 flex items-center rounded-sm p-2 text-xs hover:bg-gray-300"
                        @click="open = ! open">
                        <svg class="collapse-icon h-4 w-4 transition-transform duration-200"
                            :class="open ? '' : '-rotate-90'" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 9l6 6 6-6" />
                        </svg>
                        <span>Nodos</span>
                    </div>
                    <ul class="ml-4 mr-1 mt-2 text-xs" x-show="open" x-transition>
                        <template x-for="node in nodes">
                            <li class="rounded-md px-2 py-1 hover:bg-gray-300" x-text="`NODO ${node.id}`"
                                @mouseover="node.style.hover()" @mouseout="node.style.default()"></li>
                        </template>
                    </ul>
                </li>
            </ul>
            <ul>
                <li x-data="{ open: false }">
                    <div class="collapsible m-1 flex items-center rounded-sm p-2 text-xs hover:bg-gray-300"
                        @click="open = ! open">
                        <svg class="collapse-icon h-4 w-4 transition-transform duration-200"
                            :class="open ? '' : '-rotate-90'" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 9l6 6 6-6" />
                        </svg>
                        <span>Barras</span>
                    </div>
                    <ul class="ml-4 mr-1 mt-2 text-xs" x-show="open" x-transition>
                        <template x-for="barra in shapes">
                            <li class="rounded-md px-2 py-1 hover:bg-gray-300" x-text="`BARRA ${barra.id}`"
                                @mouseover="barra.style.hover()" @mouseout="barra.style.default()"></li>
                        </template>
                    </ul>
                </li>
            </ul>
        </x-cad.ui.panel>

        <x-cad.ui.panel title="Propiedades" init="isOpen = true">
            <!-- Se cambio el currentstate === moveObjectState -->
            <template x-if="currentState === moveObjectState">
                <div x-show="moveObjectState.selectedObject">
                    <div class="flex flex-col gap-2 p-2">
                        <template x-if="moveObjectState.selectedObject">
                            <x-cad.ui.input-properties label="ID" bind="moveObjectState.selectedObject.id" handleInput=""
                                disabled="true"></x-cad.ui.input-properties>
                        </template>
                        <x-cad.ui.panel-properties title="Posición">
                            <template x-if="moveObjectState.selectedObject">
                                <x-cad.ui.input-properties label="X" bind="moveObjectState.selectedObject.position.x"
                                    handleInput=""></x-cad.ui.input-properties>
                            </template>
                            <template x-if="moveObjectState.selectedObject">
                                <x-cad.ui.input-properties label="Y" bind="moveObjectState.selectedObject.position.y"
                                    handleInput=""></x-cad.ui.input-properties>
                            </template>
                            <!-- NUEVO: Campo Z -->
                            <template x-if="moveObjectState.selectedObject">
                                <x-cad.ui.input-properties label="Z" bind="moveObjectState.selectedObject.position.z" handleInput=""></x-cad.ui.input-properties>
                            </template>
                        </x-cad.ui.panel-properties>
                        <!-- SECCION DE FUERZA -->
                        <x-cad.ui.panel-properties title="Fuerza">
                            <x-cad.ui.load-select bind="moveObjectState.currentLoad"></x-cad.ui.load-select>
                            <template x-if="moveObjectState.selectedObject">
                                <x-cad.ui.input-properties label="Multiplicador"
                                    bind="moveObjectState.selectedObject.force.loads[moveObjectState.currentLoad].multiplier"
                                    handleInput=""></x-cad.ui.input-properties>
                            </template>
                            <x-cad.ui.input-properties label="Fx" bind="moveObjectState.nodeX"
                                handleInput=""></x-cad.ui.input-properties>
                            <x-cad.ui.input-properties label="Fy" bind="moveObjectState.nodeY"
                                handleInput=""></x-cad.ui.input-properties>
                            <x-cad.ui.input-properties label="Fz" bind="moveObjectState.nodeZ"
                                handleInput=""></x-cad.ui.input-properties>
                        </x-cad.ui.panel-properties>
                        <!-- SECCION DE SOPORTE -->
                        <x-cad.ui.panel-properties title="Soporte">
                            <div class="flex flex-row justify-between">
                                <x-cad.ui.ribbon-button
                                    clickHandler="cadSystem.clearJointSupportAssignments(moveObjectState.selectedObject)"
                                    toggle="moveObjectState.selectedObject?.soporte === ''"
                                    label=""
                                    class="cad-ribbon-button-hover-bg transition-colors duration-200 p-2 rounded">
                                    <div class="flex flex-col items-center">
                                        <x-cad.svg.sinsoporte></x-cad.svg.sinsoporte>
                                    </div>
                                </x-cad.ui.ribbon-button>
                                <x-cad.ui.ribbon-button
                                    clickHandler="setNodeSoporte(moveObjectState.selectedObject, 'soporteUno')"
                                    toggle="moveObjectState.selectedObject?.soporte === 'soporteUno'"
                                    label=""
                                    class="cad-ribbon-button-hover-bg transition-colors duration-200 p-2 rounded">
                                    <div class="flex flex-col items-center">
                                        <x-cad.svg.soporte1></x-cad.svg.soporte1>
                                    </div>
                                </x-cad.ui.ribbon-button>
                                <x-cad.ui.ribbon-button
                                    clickHandler="setNodeSoporte(moveObjectState.selectedObject, 'soporteDos')"
                                    toggle="moveObjectState.selectedObject?.soporte === 'soporteDos'"
                                    label=""
                                    class="cad-ribbon-button-hover-bg transition-colors duration-200 p-2 rounded">
                                    <div class="flex flex-col items-center">
                                        <x-cad.svg.soporte2></x-cad.svg.soporte2>
                                    </div>
                                </x-cad.ui.ribbon-button>
                                <x-cad.ui.ribbon-button
                                    clickHandler="setNodeSoporte(moveObjectState.selectedObject, 'soporteTres')"
                                    toggle="moveObjectState.selectedObject?.soporte === 'soporteTres'"
                                    label=""
                                    class="cad-ribbon-button-hover-bg transition-colors duration-200 p-2 rounded">
                                    <div class="flex flex-col items-center">
                                        <x-cad.svg.soporte3></x-cad.svg.soporte3>
                                    </div>
                                </x-cad.ui.ribbon-button>
                            </div>
                        </x-cad.ui.panel-properties>
                    </div>
                </div>
            </template>
            <template x-if="currentState === selectedNodesState">
                <div class="flex flex-col gap-2 p-2" x-data="{ fx: undefined, fy: undefined, fz: undefined, selected: null }">
                    <x-cad.ui.panel-properties title="Fuerza">
                        <x-cad.ui.input-properties label="Fx" bind="fx"
                            handleInput="currentState.selectedObjects.forEach((n) => {
                                      n.force.x = fx;
                                  })"></x-cad.ui.input-properties>
                        <x-cad.ui.input-properties label="Fy" bind="fy"
                            handleInput="currentState.selectedObjects.forEach((n) => {
                                  n.force.y = fy;
                              })"></x-cad.ui.input-properties>
                        <!-- NUEVO: Fz -->
                        <x-cad.ui.input-properties label="Fz" bind="fz"
                            handleInput="currentState.selectedObjects.forEach((n) => { 
                                  n.force.z = fz;
                              })"></x-cad.ui.input-properties>

                    </x-cad.ui.panel-properties>
                    <x-cad.ui.panel-properties title="Soporte">
                        <div class="row flex">
                            <x-cad.ui.ribbon-button
                                clickHandler="cadSystem.clearJointSupportAssignments(
        Array.from(currentState.selectedObjects || [])
    ); selected = ''"
                                toggle="selected === ''"
                                label="">
                                <x-cad.svg.sinsoporte></x-cad.svg.sinsoporte>
                            </x-cad.ui.ribbon-button>
                            <x-cad.ui.ribbon-button
                                clickHandler="currentState.selectedObjects.forEach((n) => {
                                      n.soporte = 'soporteUno';
                                  });selected = 'soporteUno'"
                                toggle="selected === 'soporteUno'"
                                label=""><x-cad.svg.soporte1></x-cad.svg.soporte1></x-cad.ui.ribbon-button>
                            <x-cad.ui.ribbon-button
                                clickHandler="currentState.selectedObjects.forEach((n) => {
                                      n.soporte = 'soporteDos';
                                  });selected = 'soporteDos'"
                                toggle="selected === 'soporteDos'"
                                label=""><x-cad.svg.soporte2></x-cad.svg.soporte2></x-cad.ui.ribbon-button>
                            <x-cad.ui.ribbon-button
                                clickHandler="currentState.selectedObjects.forEach((n) => {
                                      n.soporte = 'soporteTres';
                                  });selected = 'soporteTres'"
                                toggle="selected === 'soporteTres'"
                                label=""><x-cad.svg.soporte3></x-cad.svg.soporte3></x-cad.ui.ribbon-button>
                        </div>
                    </x-cad.ui.panel-properties>
                </div>
            </template>
            <template x-if="currentState === selectedBeamsState && selectedBeamsState.selectedObjects.length > 1">
                <div class="p-2" x-data="{
                E: undefined,
                A: undefined
            }">
                    <x-cad.ui.panel-properties title="Material">
                        <x-cad.ui.input-properties label="Modulo Elástico" bind="E"
                            handleInput="currentState.selectedObjects.forEach((b) => {
                          b.E = E;
                      })"></x-cad.ui.input-properties>
                        <x-cad.ui.seccion-select bind="A"
                            handleInput="currentState.selectedObjects.forEach((b) => {
                        b.A = A;
                    })"></x-cad.ui.seccion-select>
                        <x-cad.ui.input-properties label="Área de la sección" bind="currentState.selectedObjects[0].A"
                            handleInput="" disabled="true"></x-cad.ui.input-properties>
                    </x-cad.ui.panel-properties>
                </div>
            </template>
            <template x-if="currentState === selectedBeamsState && selectedBeamsState.selectedObjects.length === 1">
                <div class="p-2">
                    <x-cad.ui.input-properties label="ID" bind="selectedBeamsState.selectedObjects[0].id" handleInput=""
                        disabled="true"></x-cad.ui.input-properties>
                    <x-cad.ui.panel-properties title="Material">
                        <x-cad.ui.input-properties label="Modulo Elástico" bind="selectedBeamsState.selectedObjects[0].E"
                            handleInput=""></x-cad.ui.input-properties>
                        <x-cad.ui.seccion-select bind="selectedBeamsState.selectedObjects[0].A"
                            handleInput=""></x-cad.ui.seccion-select>
                        <x-cad.ui.input-properties label="Área de la sección" bind="selectedBeamsState.selectedObjects[0].A"
                            handleInput="" disabled="true"></x-cad.ui.input-properties>
                    </x-cad.ui.panel-properties>
                </div>
            </template>
            <template
                x-if="currentState === selectedParametricState && selectedParametricState.selectedObjects.length > 0 && selectedParametricState.selectedObjects[0] instanceof Arco">
                <div class="p-2">
                    <x-cad.ui.panel-properties title="Parametros">
                        <x-cad.ui.input-properties label="Longitud"
                            bind="selectedParametricState.selectedObjects[0].longitud"
                            handleInput="selectedParametricState.selectedObjects[0].build(); _ajustarModeloElevacion(selectedParametricState.selectedObjects[0])"></x-cad.ui.input-properties>
                        <x-cad.ui.input-properties label="Flecha" bind="selectedParametricState.selectedObjects[0].flecha"
                            handleInput="selectedParametricState.selectedObjects[0].build(); _ajustarModeloElevacion(selectedParametricState.selectedObjects[0])"></x-cad.ui.input-properties>
                        <x-cad.ui.input-properties label="Dovela" bind="selectedParametricState.selectedObjects[0].dovela"
                            handleInput="selectedParametricState.selectedObjects[0].build(); _ajustarModeloElevacion(selectedParametricState.selectedObjects[0])" minimun="0.001"
                            step="0.1"></x-cad.ui.input-properties>
                        <x-cad.ui.input-properties label="Peralte" step="0.1"
                            bind="selectedParametricState.selectedObjects[0].peralte"
                            handleInput="selectedParametricState.selectedObjects[0].build(); _ajustarModeloElevacion(selectedParametricState.selectedObjects[0])"></x-cad.ui.input-properties>
                        <x-cad.ui.load-select bind="selectedParametricState.currentLoad"></x-cad.ui.load-select>
                        <x-cad.ui.input-properties label="Multiplicador"
                            bind="selectedParametricState.selectedObjects[0].loads[selectedParametricState.currentLoad].multiplier"
                            handleInput="selectedParametricState.selectedObjects[0].changeMultiplier(selectedParametricState.currentLoad)"></x-cad.ui.input-properties>
                        <x-cad.ui.input-properties label="#Fuerzas"
                            bind="selectedParametricState.selectedObjects[0].forceAmount"
                            handleInput="selectedParametricState.selectedObjects[0].changeForces(selectedParametricState.currentLoad)"
                            minimun="0"></x-cad.ui.input-properties>
                        <x-cad.ui.input-properties label="Fx"
                            bind="selectedParametricState.selectedObjects[0].loads[selectedParametricState.currentLoad].fx"
                            handleInput="selectedParametricState.selectedObjects[0].changeForces(selectedParametricState.currentLoad)"></x-cad.ui.input-properties>
                        <x-cad.ui.input-properties label="Fy"
                            bind="selectedParametricState.selectedObjects[0].loads[selectedParametricState.currentLoad].fy"
                            handleInput="selectedParametricState.selectedObjects[0].changeForces(selectedParametricState.currentLoad)"></x-cad.ui.input-properties>
                        <div class="flex-row">
                            <x-primary-button
                                @click="addToScene(selectedParametricState.selectedObjects[0])">Añadir</x-primary-button>
                            <x-secondary-button
                                @click="setState(editParametricState,{editingParametric: selectedParametricState.selectedObjects[0]})">Editar</x-secondary-button>
                        </div>
                    </x-cad.ui.panel-properties>
                </div>
            </template>
            <template
                x-if="currentState === selectedParametricState && selectedParametricState.selectedObjects.length > 0 && selectedParametricState.selectedObjects[0] instanceof Puente">
                <div class="p-2">
                    <x-cad.ui.panel-properties title="Parametros">
                        <x-cad.ui.input-properties label="Alto" bind="selectedParametricState.selectedObjects[0].width"
                            handleInput="selectedParametricState.selectedObjects[0].build(); _ajustarModeloElevacion(selectedParametricState.selectedObjects[0])"></x-cad.ui.input-properties>
                        <x-cad.ui.input-properties label="Anchó" bind="selectedParametricState.selectedObjects[0].height"
                            handleInput="selectedParametricState.selectedObjects[0].build(); _ajustarModeloElevacion(selectedParametricState.selectedObjects[0])"></x-cad.ui.input-properties>
                        <x-cad.ui.input-properties label="Peralte" bind="selectedParametricState.selectedObjects[0].peralte"
                            handleInput="selectedParametricState.selectedObjects[0].build(); _ajustarModeloElevacion(selectedParametricState.selectedObjects[0])"></x-cad.ui.input-properties>
                        <x-cad.ui.input-properties label="Dovela" bind="selectedParametricState.selectedObjects[0].dovela"
                            handleInput="selectedParametricState.selectedObjects[0].build(); _ajustarModeloElevacion(selectedParametricState.selectedObjects[0])"></x-cad.ui.input-properties>
                        <x-primary-button
                            @click="addToScene(selectedParametricState.selectedObjects[0])">Añadir</x-primary-button>
                    </x-cad.ui.panel-properties>
                </div>
            </template>
            <template
                x-if="currentState === selectedParametricState && selectedParametricState.selectedObjects.length > 0 && selectedParametricState.selectedObjects[0] instanceof Triangle">
                <div class="p-2">
                    <x-cad.ui.panel-properties title="Parametros">
                        <x-cad.ui.input-properties label="Altura" bind="selectedParametricState.selectedObjects[0].altura"
                            handleInput="selectedParametricState.selectedObjects[0].build(); _ajustarModeloElevacion(selectedParametricState.selectedObjects[0])"></x-cad.ui.input-properties>
                        <x-cad.ui.input-properties label="Base" bind="selectedParametricState.selectedObjects[0].base"
                            handleInput="selectedParametricState.selectedObjects[0].build(); _ajustarModeloElevacion(selectedParametricState.selectedObjects[0])"></x-cad.ui.input-properties>
                        <x-primary-button
                            @click="addToScene(selectedParametricState.selectedObjects[0])">Añadir</x-primary-button>
                    </x-cad.ui.panel-properties>
                </div>
            </template>
            <template x-if="currentState === editParametricState && currentState.editing">
                <div class="p-2">
                    <x-cad.ui.panel-properties title="Material">
                        <x-cad.ui.input-properties label="Modulo Elástico" bind="currentState.editing[0].E"
                            handleInput="currentState.editing.forEach((b) => {
                          b.E = currentState.editing[0].E;
                      })"></x-cad.ui.input-properties>
                        {{-- <x-cad.ui.input-properties label="Área de la sección" bind="currentState.editing[0].A"
              handleInput="currentState.editing.forEach((b) => {
                          b.A = A;
                      })"></x-cad.ui.input-properties> --}}
                        <x-cad.ui.seccion-select bind="currentState.editing[0].A"
                            handleInput="currentState.editing.forEach(function (b) {b.A = currentState.editing[0].A;})"></x-cad.ui.seccion-select>
                        <x-cad.ui.input-properties label="Área de la Sección" bind="currentState.editing[0].A"
                            handleInput="" disabled="true"></x-cad.ui.input-properties>
                    </x-cad.ui.panel-properties>
                </div>
            </template>
        </x-cad.ui.panel>
    </div>
</aside>