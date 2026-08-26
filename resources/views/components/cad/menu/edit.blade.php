{{-- resources/views/components/cad/menu/edit.blade.php
     Menú "Editar" — extraído de menu-bar.blade.php (Fase 1 de la
     reestructuración). Se incluye vía @include, hereda el scope del menu-bar. --}}
        {{-- ============================================================
                                MENÚ EDIT / EDITAR
        ============================================================ --}}
        <x-cad.ui.menu-dropdown-item label="Editar">

            {{-- ÍCONO DEL MENÚ --}}
            <x-slot name="slot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            </x-slot>

            {{-- CONTENIDO DEL MENÚ --}}
            <x-slot name="dropdown">
                <div class="cad-menu-panel py-1" style="min-width: 360px;">

                    {{-- ================= HISTORIAL ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Historial
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('undo')">
                        <span>↩️</span>
                        <span class="flex-1 min-w-0 truncate">Deshacer</span>
                        <span class="text-xs text-gray-500 italic">Ctrl+Z</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('redo')">
                        <span>↪️</span>
                        <span class="flex-1 min-w-0 truncate">Rehacer</span>
                        <span class="text-xs text-gray-500 italic">Ctrl+Y</span>
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= PORTAPAPELES ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Portapapeles
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('cut')">
                        <span>✂️</span>
                        <span class="flex-1 min-w-0 truncate">Cortar</span>
                        <span class="text-xs text-gray-500 italic">Ctrl+X</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('copy')">
                        <span>📋</span>
                        <span class="flex-1 min-w-0 truncate">Copiar</span>
                        <span class="text-xs text-gray-500 italic">Ctrl+C</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('paste')">
                        <span>📌</span>
                        <span class="flex-1 min-w-0 truncate">Pegar</span>
                        <span class="text-xs text-gray-500 italic">Ctrl+V</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('delete')">
                        <span>🗑️</span>
                        <span class="flex-1 min-w-0 truncate">Eliminar</span>
                        <span class="text-xs text-gray-500 italic">Supr</span>
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= EDICIÓN DEL MODELO ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Edición del Modelo
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('replicate')">
                        <span>🔄</span>
                        <span class="flex-1 min-w-0 truncate">Replicar...</span>
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= DATOS DEL MODELO ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Datos del Modelo
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('edit-grid-data')">
                        <span>📏</span>
                        <span class="flex-1 min-w-0 truncate">Editar Datos de Grilla</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('edit-story-data')">
                        <span>🏢</span>
                        <span class="flex-1 min-w-0 truncate">Pisos y Alturas (Story Data)...</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('edit-reference-planes')">
                        <span>📐</span>
                        <span class="flex-1 min-w-0 truncate">Editar Planos de Referencia...</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('edit-reference-lines')">
                        <span>━━</span>
                        <span class="flex-1 min-w-0 truncate">Editar Líneas de Referencia...</span>
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= HERRAMIENTAS GEOMÉTRICAS ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Herramientas Geométricas
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('merge-points')">
                        <span>🔗</span>
                        <span class="flex-1 min-w-0 truncate">Fusionar Puntos...</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('align-points-lines-edges')">
                        <span>📍</span>
                        <span class="flex-1 min-w-0 truncate">Alinear Puntos/Líneas/Bordes...</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('move-points-lines-areas')">
                        <span>↔️</span>
                        <span class="flex-1 min-w-0 truncate">Mover Puntos/Líneas/Áreas...</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('join-lines')">
                        <span>⛓️</span>
                        <span class="flex-1 min-w-0 truncate">Unir Líneas</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('divide-lines')">
                        <span>✂️</span>
                        <span class="flex-1 min-w-0 truncate">Dividir Líneas...</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('divide-areas')">
                        <span>▦</span>
                        <span class="flex-1 min-w-0 truncate">Dividir Áreas...</span>
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= EXTRUSIÓN ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Extrusión
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('extrude-points-to-lines')">
                        <span>📍</span>
                        <span class="flex-1 min-w-0 truncate">Extruir Puntos a Líneas...</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateEditMenuAction('extrude-lines-to-areas')">
                        <span>▭</span>
                        <span class="flex-1 min-w-0 truncate">Extruir Líneas a Áreas...</span>
                    </button>

                </div>
            </x-slot>
        </x-cad.ui.menu-dropdown-item>
