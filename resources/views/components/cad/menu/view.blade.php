{{-- resources/views/components/cad/menu/view.blade.php
     Menú "Vista" — extraído de menu-bar.blade.php (Fase 1 de la
     reestructuración). Se incluye vía @include, hereda el scope del menu-bar. --}}
        {{-- ============================================================
                                MENÚ VIEW / VISTA
        ============================================================ --}}
        <x-cad.ui.menu-dropdown-item label="Vista">

            {{-- ÍCONO DEL MENÚ --}}
            <x-slot name="slot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            </x-slot>

            {{-- CONTENIDO DEL MENÚ --}}
            <x-slot name="dropdown">
                <div class="cad-menu-panel py-1" style="min-width: 320px;">

                    {{-- ================= CONFIGURAR VISTA ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Configurar Vista
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateViewMenuAction('set-3d-view')">
                        <span>🎥</span>
                        Set 3D View...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateViewMenuAction('set-plan-view')">
                        <span>🗺️</span>
                        Set Plan View...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateViewMenuAction('set-elevation-view')">
                        <span>📐</span>
                        Set Elevation View...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= VISTA EXTRUIDA (Extrude View) ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Vista Extruida (3D)
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateViewMenuAction('toggle-extrude-frames')">
                        <span x-text="cadSystem.options?.extrudeFrames3D ? '☑' : '☐'"></span>
                        <span class="flex-1 min-w-0 truncate">Extruir Frames (Vigas / Columnas)</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateViewMenuAction('toggle-extrude-shells')">
                        <span x-text="cadSystem.options?.extrudeShells3D ? '☑' : '☐'"></span>
                        <span class="flex-1 min-w-0 truncate">Extruir Shells (Losas)</span>
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= ZOOM ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Zoom
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateViewMenuAction('rubber-band-zoom')">
                        <span>🔍</span>
                        Rubber Band Zoom
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateViewMenuAction('restore-full-view')">
                        <span>🖼️</span>
                        Restore Full View
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateViewMenuAction('previous-zoom')">
                        <span>⏪</span>
                        Previous Zoom
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateViewMenuAction('zoom-in-one-step')">
                        <span>🔍+</span>
                        Zoom In One Step
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateViewMenuAction('zoom-out-one-step')">
                        <span>🔍-</span>
                        Zoom Out One Step
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= NAVEGACIÓN ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Navegación
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.activateViewMenuAction('pan')">
                        <span>✋</span>
                        Pan
                    </button>

                </div>
            </x-slot>
        </x-cad.ui.menu-dropdown-item>
