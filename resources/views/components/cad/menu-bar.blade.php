{{-- resources/views/components/cad/layout/menu-bar.blade.php --}}
<div class="bg-gray-800 border-b border-gray-700 shadow-lg">
    {{-- Segunda fila: ETABS v9.7.1 y menú Define --}}
    <div class="flex items-center px-2 py-1 gap-4 border-t border-gray-700">
        {{-- Logo ETABS --}}
        <div class="text-blue-400 font-bold text-sm px-2 whitespace-nowrap border-r border-gray-600">
            ETABS v9.7.1
        </div>

        {{-- Menú DEFINE (estilo ETABS) --}}
        <x-cad.menu-dropdown-item label="Define">
            <x-slot name="slot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16v12H4z M8 6v12 M16 6v12" />
                </svg>
            </x-slot>
            <x-slot name="dropdown">
                <div class="py-1" style="min-width: 260px;">
                    {{-- Propiedades de Material --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">Propiedades de Material</div>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.openMaterialProperties()">
                        <span>📐</span> Material Properties...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- Secciones --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">Secciones</div>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.openFrameSections()">
                        <span>📐</span> Frame Sections...
                    </button>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.openWallSlabSections()">
                        <span>🧱</span> Wall/Slab/Deck Sections...
                    </button>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.openLinkProperties()">
                        <span>🔗</span> Link Properties...
                    </button>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.openHingeProperties()">
                        <span>🌀</span> Frame Nonlinear Hinge Properties...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- Elementos Estructurales --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">Elementos Estructurales</div>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.openDiaphragms()">
                        <span>🏢</span> Diaphragms...
                    </button>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.openGroups()">
                        <span>👥</span> Groups...
                    </button>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.openSectionCuts()">
                        <span>✂️</span> Section Cuts...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- Funciones de Carga --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">Funciones de Carga</div>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.openResponseSpectrumFunctions()">
                        <span>📊</span> Response Spectrum Functions...
                    </button>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.openTimeHistoryFunctions()">
                        <span>⏱️</span> Time History Functions...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- Casos de Carga --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">Casos de Carga</div>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.openLoadCases()">
                        <span>⚖️</span> Static Load Cases...
                    </button>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.openResponseSpectrumCases()">
                        <span>🌊</span> Response Spectrum Cases...
                    </button>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.openTimeHistoryCases()">
                        <span>📈</span> Time History Cases...
                    </button>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.openPushoverCases()">
                        <span>📉</span> Static Nonlinear/Pushover Cases...
                    </button>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.openSequentialConstruction()">
                        <span>🏗️</span> Add Sequential Construction Case
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- Combinaciones --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">Combinaciones</div>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.openLoadCombinations()">
                        <span>🔢</span> Load Combinations...
                    </button>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.addDefaultDesignCombos()">
                        <span>📋</span> Add Default Design Combos...
                    </button>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.convertCombosToNonlinear()">
                        <span>🔄</span> Convert Combos to Nonlinear Cases...
                    </button>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.openSeismicEffects()">
                        <span>🌍</span> Special Seismic Load Effects...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- Masa --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">Masa</div>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.openMassSource()">
                        <span>⚖️</span> Mass Source...
                    </button>
                </div>
            </x-slot>
        </x-cad.menu-dropdown-item>

        <x-cad.menu-dropdown-item label="Dibujar">
            <x-slot name="slot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 20l4-1 9-9-3-3-9 9-1 4z" />
                </svg>
            </x-slot>

            <x-slot name="dropdown">
                <div class="py-1" style="min-width: 320px;">
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">Selección y edición</div>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('select-object')">
                        <span>🖱️</span> Seleccionar objeto
                    </button>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('reshape-object')">
                        <span>✏️</span> Modificar objeto
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">Objetos puntuales</div>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('draw-point')">
                        <span>📍</span> Dibujar objetos de puntos
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Draw Line Objects
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('draw-lines')">
                        <span>📏</span> Draw Lines (Plan, Elev, 3D)
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('create-lines-region-clicks')">
                        <span>▦</span> Create Lines in Region or at Clicks (Plan, Elev, 3D)
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('create-columns-region-clicks')">
                        <span>│</span> Create Columns in Region or at Clicks (Plan)
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('create-secondary-beams-region-clicks')">
                        <span>═</span> Create Secondary Beams in Region or at Clicks (Plan)
                    </button>

                    <!-- <div class="border-t border-gray-700 my-1"></div> -->

                    <!-- <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">Objetos de área</div>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('draw-area-slab')">
                        <span>▭</span> Dibujar losa / área
                    </button>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('draw-area-wall')">
                        <span>▌</span> Dibujar muro / panel
                    </button>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('draw-area-opening')">
                        <span>◫</span> Dibujar abertura
                    </button> -->

                    <!-- <div class="border-t border-gray-700 my-1"></div> -->

                    <!-- <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">Otros</div>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('draw-developed-elevation')">
                        <span>↕</span> Dibujar definición de elevación desarrollada...
                    </button>
                    <div class="w-full text-left px-3 py-1.5 text-sm text-gray-500 flex items-center gap-2 opacity-60 cursor-not-allowed">
                        <span>✂</span> Dibujar corte de sección...
                    </div>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('draw-dimension-line')">
                        <span>📐</span> Dibujar línea de dimensión
                    </button>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('draw-reference-point')">
                        <span>✳</span> Dibujar punto de referencia
                    </button> -->

                    <div class="border-t border-gray-700 my-1"></div>

                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">Snap</div>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('snap-on')">
                        <span>🧲</span> Ajustar a la cuadrícula ON
                    </button>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('snap-off')">
                        <span>🚫</span> Ajustar a la cuadrícula OFF
                    </button>
                </div>
            </x-slot>
        </x-cad.menu-dropdown-item>

        <x-cad.menu-dropdown-item label="Options">
            <x-slot name="slot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.607 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                </svg>
            </x-slot>

            <x-slot name="dropdown">
                <div class="py-1" style="min-width: 340px;">

                    {{-- Preferences --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Preferences
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateOptionsMenuAction('dimensions-tolerances')">
                        <span>📏</span> Dimensions / Tolerances...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateOptionsMenuAction('output-decimals')">
                        <span>🔢</span> Output Decimals...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateOptionsMenuAction('steel-frame-design')">
                        <span>🏗️</span> Steel Frame Design...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateOptionsMenuAction('reinforcement-bar-sizes')">
                        <span>🔩</span> Reinforcement Bar Sizes...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- Colors --}}
                    {{-- Colors --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Colors
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateOptionsMenuAction('theme-dark')">
                        <span>🌙</span> Dark Canvas
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateOptionsMenuAction('theme-light')">
                        <span>☀️</span> Light Canvas
                    </button>

                    <!-- <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateOptionsMenuAction('display-colors')">
                        <span>🖥️</span> Display...
                    </button> -->

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- Windows --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Windows
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateOptionsMenuAction('window-one')">
                        <span>▣</span> One
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateOptionsMenuAction('window-two-vertical')">
                        <span>▥</span> Two Tiled Vertically
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateOptionsMenuAction('window-two-horizontal')">
                        <span>▤</span> Two Tiled Horizontally
                    </button>

                    <!-- <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateOptionsMenuAction('window-three')">
                        <span>▦</span> Three
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateOptionsMenuAction('window-four')">
                        <span>▦</span> Four
                    </button> -->

                </div>
            </x-slot>
        </x-cad.menu-dropdown-item>

        {{-- Otros menús ETABS pueden ir aquí --}}
        <button class="text-gray-300 hover:text-white text-sm px-2 py-1 whitespace-nowrap">Analyze</button>
        <button class="text-gray-300 hover:text-white text-sm px-2 py-1 whitespace-nowrap">Display</button>
        <button class="text-gray-300 hover:text-white text-sm px-2 py-1 whitespace-nowrap">Design</button>
    </div>
</div>

<!-- <style>
    .dropdown-item {
        transition: all 0.15s ease;
    }

    .dropdown-item:hover {
        background-color: #1e40af !important;
        padding-left: 12px;
    }
</style> -->

<style>
    .options-menu {
        overflow: visible !important;
        max-height: none !important;
        position: relative;
    }

    .options-menu .submenu {
        position: relative;
    }

    .options-menu .submenu-panel {
        display: none;
        position: absolute;
        top: 0;
        left: 100%;
        min-width: 260px;
        background-color: #1f2937;
        border: 1px solid #374151;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
        z-index: 99999;
        padding-top: 4px;
        padding-bottom: 4px;
        overflow: visible !important;
        max-height: none !important;
    }

    .options-menu .submenu:hover>.submenu-panel {
        display: block;
    }
</style>