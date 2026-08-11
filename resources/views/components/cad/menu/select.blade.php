{{-- resources/views/components/cad/menu/select.blade.php
     Menú "Seleccionar" — extraído de menu-bar.blade.php (Fase 1 de la
     reestructuración). Se incluye vía @include, hereda el scope del menu-bar. --}}
        {{-- ============================================================
                                MENÚ SELECT / SELECCIONAR
        ============================================================ --}}
        <x-cad.ui.menu-dropdown-item label="Seleccionar">

            {{-- ÍCONO DEL MENÚ --}}
            <x-slot name="slot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
            </x-slot>

            {{-- CONTENIDO DEL MENÚ --}}
            <x-slot name="dropdown">
                <div class="cad-menu-panel py-1" style="min-width: 320px;">

                    {{-- ================= SELECCIÓN POR UBICACIÓN ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Por Ubicación
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateSelectMenuAction('select-pointer-window')">
                        <span>🖱️</span>
                        En Puntero/En Ventana
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.selectByXYPlane()">
                        <span>📐</span>
                        en Plano XY
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.selectByXZPlane()">
                        <span>📐</span>
                        en Plano XZ
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.selectByYZPlane()">
                        <span>📐</span>
                        en Plano YZ
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= SELECCIÓN POR PROPIEDADES ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Por Propiedades
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.selectByGroups()">
                        <span>👥</span>
                        por Grupos...
                    </button>

                    {{-- ================= PROPIEDADES (estilo ETABS) ================= --}}
                    <x-cad.ui.menu-subitem label="Propiedades">
                        <span>📋</span>

                        <x-slot name="submenu">
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click="cadSystem.activateSelectMenuAction('select-prop-frame-sections')">
                                <span>📐</span>
                                Secciones de Barra...
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click="cadSystem.activateSelectMenuAction('select-prop-slab-sections')">
                                <span>▭</span>
                                Secciones de Losa...
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click="cadSystem.activateSelectMenuAction('select-prop-deck-sections')">
                                <span>▤</span>
                                Secciones de Deck...
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click="cadSystem.activateSelectMenuAction('select-prop-wall-sections')">
                                <span>▮</span>
                                Secciones de Muro...
                            </button>
                        </x-slot>
                    </x-cad.ui.menu-subitem>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= SELECCIÓN GENERAL ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        General
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateSelectMenuAction('select-invert')">
                        <span>🔄</span>
                        Invertir
                    </button>

                    {{-- ================= DESELECCIONAR ================= --}}
                    <x-cad.ui.menu-subitem label="Deseleccionar">
                        <span>❌</span>

                        <x-slot name="submenu">

                            {{-- ================= DESELECCIONAR POR UBICACIÓN ================= --}}
                            <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                                Por Ubicación
                            </div>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click="cadSystem.deselectByPointer()">
                                <span>🖱️</span>
                                En Puntero/En Ventana
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click="cadSystem.deselectByXYPlane()">
                                <span>📐</span>
                                en Plano XY
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click="cadSystem.deselectByXZPlane()">
                                <span>📐</span>
                                en Plano XZ
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click="cadSystem.deselectByYZPlane()">
                                <span>📐</span>
                                en Plano YZ
                            </button>

                            <div class="border-t border-gray-700 my-1"></div>

                            {{-- ================= DESELECCIONAR POR PROPIEDADES ================= --}}
                            <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                                Por Propiedades
                            </div>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click="cadSystem.deselectByGroups()">
                                <span>👥</span>
                                por Grupos...
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click="cadSystem.deselectByFrameSections()">
                                <span>📐</span>
                                por Secciones de Pórtico...
                            </button>

                            <div class="border-t border-gray-700 my-1"></div>

                            {{-- ================= DESELECCIONAR TODO ================= --}}
                            <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                                General
                            </div>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click="cadSystem.activateSelectMenuAction('select-none')">
                                <span>✅</span>
                                Todo
                            </button>

                        </x-slot>
                    </x-cad.ui.menu-subitem>

                </div>
            </x-slot>
        </x-cad.ui.menu-dropdown-item>
