{{-- resources/views/components/cad/menu/define.blade.php
     Menú "Define" — extraído de menu-bar.blade.php (Fase 1 de la
     reestructuración). Se incluye vía @include, hereda el scope del menu-bar. --}}
        {{-- ============================================================
                                MENÚ DEFINE / DEFINIR
        ============================================================ --}}
        <x-cad.ui.menu-dropdown-item label="Definir">

            {{-- ÍCONO DEL MENÚ --}}
            <x-slot name="slot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 6h16v12H4z M8 6v12 M16 6v12" />
                </svg>
            </x-slot>

            {{-- CONTENIDO DEL MENÚ --}}
            <x-slot name="dropdown">
                <div class="cad-menu-panel py-1" style="min-width: 360px;">

                    {{-- ================= PROPIEDADES DE MATERIAL ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Propiedades de Material
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openMaterialProperties()">
                        <span>📐</span>
                        Propiedades de Material...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= SECCIONES ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Secciones
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openFrameSections()">
                        <span>📐</span>
                        Secciones de Barra...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openSlabSectionsDefine()">
                        <span>🧱</span>
                        Secciones de Losa (Slab)...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openWallSectionsDefine()">
                        <span>▮</span>
                        Secciones de Muro (Wall)...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openLinkProperties()">
                        <span>🔗</span>
                        Propiedades de Link...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openHingeProperties()">
                        <span>🌀</span>
                        Propiedades de Rótula No Lineal de Barra...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>
                    {{-- ================= ELEMENTOS ESTRUCTURALES ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Elementos Estructurales
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openDiaphragms()">
                        <span>🏢</span>
                        Diafragmas...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openGroups()">
                        <span>👥</span>
                        Grupos...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openSectionCuts()">
                        <span>✂️</span>
                        Cortes de Sección...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>
                    {{-- ================= FUNCIONES DE CARGA ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Funciones de Carga
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openResponseSpectrumFunctions()">
                        <span>📊</span>
                        Funciones de Espectro de Respuesta...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openTimeHistoryFunctions()">
                        <span>⏱️</span>
                        Funciones de Historia en el Tiempo...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>
                    {{-- ================= CASOS DE CARGA ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Casos de Carga
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openLoadCases()">
                        <span>⚖️</span>
                        Patrones de Carga...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openResponseSpectrumCases()">
                        <span>🌊</span>
                        Casos de Espectro de Respuesta...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openTimeHistoryCases()">
                        <span>📈</span>
                        Casos de Historia en el Tiempo...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openPushoverCases()">
                        <span>📉</span>
                        Casos Estáticos No Lineales/Pushover...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openSequentialConstruction()">
                        <span>🏗️</span>
                        Agregar Caso de Construcción Secuencial
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= COMBINACIONES ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Combinaciones
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openLoadCombinations()">
                        <span>🔢</span>
                        Combinaciones de Carga...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.addDefaultDesignCombos()">
                        <span>📋</span>
                        Agregar Combos de Diseño por Defecto...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.convertCombosToNonlinear()">
                        <span>🔄</span>
                        Convertir Combos a Casos No Lineales...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openSeismicEffects()">
                        <span>🌍</span>
                        Efectos Especiales de Carga Sísmica...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= MASA ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Masa
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openMassSource()">
                        <span>⚖️</span>
                        Fuente de Masa...
                    </button>

                </div>
            </x-slot>
        </x-cad.ui.menu-dropdown-item>
