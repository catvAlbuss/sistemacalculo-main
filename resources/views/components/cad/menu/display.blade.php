{{-- resources/views/components/cad/menu/display.blade.php
     Menú "Mostrar" — extraído de menu-bar.blade.php (Fase 1 de la
     reestructuración). Se incluye vía @include, hereda el scope del menu-bar. --}}
        {{-- ============================================================
                                MENÚ DISPLAY / MOSTRAR
        ============================================================ --}}
        <x-cad.ui.menu-dropdown-item label="Mostrar">

            {{-- ÍCONO DEL MENÚ --}}
            <x-slot name="slot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            </x-slot>

            {{-- CONTENIDO DEL MENÚ --}}
            <x-slot name="dropdown">
                <div class="cad-menu-panel py-1" style="min-width: 320px;">

                    {{-- ================= MODELO ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Modelo
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateDisplayMenuAction('show-undeformed-shape')">
                        <span>📐</span>
                        Mostrar Forma No Deformada
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateDisplayMenuAction('show-reference-planes')">
                        <span>🟨</span>
                        Mostrar Planos de Referencia
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= CARGAS ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Cargas
                    </div>

                    {{-- ================= SHOW LOADS ================= --}}
                    <x-cad.ui.menu-subitem label="Mostrar Cargas">
                        <span>📊</span>

                        <x-slot name="submenu">
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDisplayMenuAction('show-joint-loads')">
                                <span>⚫</span>
                                Nudo / Punto...
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDisplayMenuAction('show-frame-loads')">
                                <span>━━</span>
                                Barra / Línea...
                            </button>
                        </x-slot>
                    </x-cad.ui.menu-subitem>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= DEFORMADAS Y MODOS ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Deformadas y Modos
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateDisplayMenuAction('show-deformed-shape')">
                        <span>📈</span>
                        Mostrar Forma Deformada...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateDisplayMenuAction('show-mode-shape')">
                        <span>🎵</span>
                        Mostrar Forma Modal...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= FUERZAS Y DIAGRAMAS ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Fuerzas y Diagramas
                    </div>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateDisplayMenuAction('show-frame-force-diagrams')">
                        <span>📉</span>
                        <span class="flex-1 truncate">Mostrar Fuerzas/Diagramas de Barra...</span>
                        <span class="text-xs text-cyan-400 italic">P, V2, V3, T, M2, M3</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateDisplayMenuAction('show-modal-spectral-results')">
                        <span>🌊</span>
                        <span class="flex-1 truncate">Resultados Modal Espectral...</span>
                        <span class="text-xs text-yellow-400 italic">Prueba</span>
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= RESPUESTA SÍSMICA (Story Response) ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Respuesta Sísmica
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.openEtabsSeismicResultsDialog()">
                        <span>📋</span>
                        <span class="flex-1 truncate">Resultados Sísmicos tipo ETABS...</span>
                        <span class="text-xs text-cyan-400 italic">Reporte</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateDisplayMenuAction('show-story-drifts')">
                        <span>📐</span>
                        <span class="flex-1 truncate">Derivas de Piso...</span>
                        <span class="text-xs text-cyan-400 italic">Deriva</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateDisplayMenuAction('show-story-shears')">
                        <span>📊</span>
                        <span class="flex-1 truncate">Cortante por Piso...</span>
                        <span class="text-xs text-cyan-400 italic">Cortante</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateDisplayMenuAction('seismic-animation')">
                        <span>🎬</span>
                        <span class="flex-1 truncate">Animar Sísmico...</span>
                        <span class="text-xs text-cyan-400 italic">3D</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateDisplayMenuAction('seismic-displacement-labels')">
                        <span>🔢</span>
                        <span class="flex-1 truncate">Mostrar Desplazamientos 3D</span>
                        <span class="text-xs text-cyan-400 italic">mm</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateDisplayMenuAction('seismic-drift-labels')">
                        <span>📐</span>
                        <span class="flex-1 truncate">Mostrar Derivas 3D</span>
                        <span class="text-xs text-emerald-400 italic">‰</span>
                    </button>

                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Tablas
                    </div>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateDisplayMenuAction('show-tables')">
                        <span>📋</span>
                        <span class="flex-1 truncate">Mostrar Tablas...</span>
                        <span class="text-xs text-cyan-400 italic">Modelo</span>
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>
                </div>
            </x-slot>
        </x-cad.ui.menu-dropdown-item>
