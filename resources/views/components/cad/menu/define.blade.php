{{-- resources/views/components/cad/menu/define.blade.php
     Menú "Define" — extraído de menu-bar.blade.php (Fase 1 de la
     reestructuración). Se incluye vía @include, hereda el scope del menu-bar. --}}
        {{-- ============================================================
                                MENÚ DEFINE / DEFINIR
        ============================================================ --}}
        <x-cad.ui.menu-dropdown-item label="Define">

            {{-- ÍCONO DEL MENÚ --}}
            <x-slot name="slot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 6h16v12H4z M8 6v12 M16 6v12" />
                </svg>
            </x-slot>

            {{-- CONTENIDO DEL MENÚ --}}
            <x-slot name="dropdown">
                <div class="cad-menu-panel py-1" style="min-width: 350px;">

                    {{-- ================= PROPIEDADES DE MATERIAL ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Propiedades de Material
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openMaterialProperties()">
                        <span>📐</span>
                        Material Properties...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= SECCIONES ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Secciones
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openFrameSections()">
                        <span>📐</span>
                        Frame Sections...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openWallSlabSections()">
                        <span>🧱</span>
                        Wall/Slab/Deck Sections...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openLinkProperties()">
                        <span>🔗</span>
                        Link Properties...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openHingeProperties()">
                        <span>🌀</span>
                        Frame Nonlinear Hinge Properties...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>
                    {{-- ================= ELEMENTOS ESTRUCTURALES ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Elementos Estructurales
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openDiaphragms()">
                        <span>🏢</span>
                        Diaphragms...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openGroups()">
                        <span>👥</span>
                        Groups...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openSectionCuts()">
                        <span>✂️</span>
                        Section Cuts...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>
                    {{-- ================= FUNCIONES DE CARGA ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Funciones de Carga
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openResponseSpectrumFunctions()">
                        <span>📊</span>
                        Response Spectrum Functions...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openTimeHistoryFunctions()">
                        <span>⏱️</span>
                        Time History Functions...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>
                    {{-- ================= CASOS DE CARGA ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Casos de Carga
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openLoadCases()">
                        <span>⚖️</span>
                        Load Patterns...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openResponseSpectrumCases()">
                        <span>🌊</span>
                        Response Spectrum Cases...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openTimeHistoryCases()">
                        <span>📈</span>
                        Time History Cases...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openPushoverCases()">
                        <span>📉</span>
                        Static Nonlinear/Pushover Cases...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openSequentialConstruction()">
                        <span>🏗️</span>
                        Add Sequential Construction Case
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= COMBINACIONES ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Combinaciones
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openLoadCombinations()">
                        <span>🔢</span>
                        Load Combinations...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.addDefaultDesignCombos()">
                        <span>📋</span>
                        Add Default Design Combos...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.convertCombosToNonlinear()">
                        <span>🔄</span>
                        Convert Combos to Nonlinear Cases...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openSeismicEffects()">
                        <span>🌍</span>
                        Special Seismic Load Effects...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= MASA ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Masa
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openMassSource()">
                        <span>⚖️</span>
                        Mass Source...
                    </button>

                </div>
            </x-slot>
        </x-cad.ui.menu-dropdown-item>
