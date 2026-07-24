{{-- resources/views/components/cad/menu/assign.blade.php
     Menú "Asignar" — extraído de menu-bar.blade.php (Fase 1 de la
     reestructuración). Se incluye vía @include, hereda el scope del menu-bar. --}}
        {{-- ============================================================
                                MENÚ ASSIGN / ASIGNAR
        ============================================================ --}}
        <x-cad.ui.menu-dropdown-item label="Asignar">

            {{-- ÍCONO DEL MENÚ --}}
            <x-slot name="slot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
            </x-slot>

            {{-- CONTENIDO DEL MENÚ --}}
            <x-slot name="dropdown">
                <div class="cad-menu-panel py-1" style="min-width: 320px;">

                    {{-- ================= ASIGNACIONES A OBJETOS ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Asignaciones a Objetos
                    </div>

                    {{-- ================= JOINT / POINT ================= --}}
                    <x-cad.ui.menu-subitem label="Nudo / Punto">
                        <span>⚫</span>

                        <x-slot name="submenu">
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('joint-diaphragms')">
                                <span>🏢</span>
                                Diafragmas...
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('joint-restraints')">
                                <span>⚓</span>
                                Restricciones / Apoyos...
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('auto-base-restraints')">
                                <span>🏗️</span>
                                Empotrar Base (Automático)
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('joint-springs')">
                                <span>➿</span>
                                Resortes de Punto...
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('joint-mass')">
                                <span>⚖️</span>
                                Masas...
                            </button>
                        </x-slot>
                    </x-cad.ui.menu-subitem>

                    {{-- ================= FRAME / LINE ================= --}}
                    <x-cad.ui.menu-subitem label="Barra / Línea">
                        <span>━━</span>

                        <x-slot name="submenu">
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('frame-section')">
                                <span>📐</span>
                                Sección de Barra...
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('frame-releases')">
                                <span>🔓</span>
                                Liberaciones de Barra / Fijación Parcial...
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('frame-end-offsets')">
                                <span>📏</span>
                                Desplazamientos de Extremo (Longitud)...
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('frame-local-axes')">
                                <span>🧭</span>
                                Ejes Locales (Rotación)...
                            </button>
                        </x-slot>
                    </x-cad.ui.menu-subitem>

                    <x-cad.ui.menu-subitem label="Losa / Muro">
                        <x-slot name="submenu">
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('area-slab-section')">
                                <span>▦</span>
                                Sección de Losa...
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('area-wall-section')">
                                <span>▮</span>
                                Sección de Muro...
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('area-diaphragms')">
                                <span>🏢</span>
                                Diafragmas...
                            </button>
                        </x-slot>
                    </x-cad.ui.menu-subitem>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= CARGAS ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Cargas
                    </div>

                    {{-- ================= JOINT / POINT LOADS ================= --}}
                    <x-cad.ui.menu-subitem label="Cargas en Nudo / Punto">
                        <span>🔴</span>

                        <x-slot name="submenu">
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('joint-load-force')">
                                <span>🎯</span>
                                Fuerza...
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('joint-load-ground-displacement')">
                                <span>🌍</span>
                                Desplazamiento de Terreno...
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('joint-load-temperature')">
                                <span>🌡️</span>
                                Temperatura...
                            </button>
                        </x-slot>
                    </x-cad.ui.menu-subitem>

                    {{-- ================= FRAME / LINE LOADS ================= --}}
                    <x-cad.ui.menu-subitem label="Cargas en Barra / Línea">
                        <span>📊</span>

                        <x-slot name="submenu">
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('frame-load-point')">
                                <span>📍</span>
                                Puntual...
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('frame-load-distributed')">
                                <span>📊</span>
                                Distribuida...
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('frame-load-temperature')">
                                <span>🌡️</span>
                                Temperatura...
                            </button>
                        </x-slot>
                    </x-cad.ui.menu-subitem>

                    {{-- ================= AREA / SHELL ================= --}}
                    <x-cad.ui.menu-subitem label="Carga de Losa">
                        <span>🧱</span>
                        <x-slot name="submenu">
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('area-load-uniform')">
                                <span>🟦</span>
                                Carga Uniforme de Losa (Gravedad)...
                            </button>
                        </x-slot>
                    </x-cad.ui.menu-subitem>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= GRUPOS Y REVISIÓN ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Grupos y Revisión
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                        @click.stop="cadSystem.activateAssignMenuAction('group-names')">
                        <span>🧩</span>
                        Nombres de Grupos...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                        @click.stop="cadSystem.activateAssignMenuAction('show-selected-assignments')">
                        <span>📋</span>
                        Mostrar Asignaciones Seleccionadas...
                    </button>

                </div>
            </x-slot>
        </x-cad.ui.menu-dropdown-item>
