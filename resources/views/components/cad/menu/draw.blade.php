{{-- resources/views/components/cad/menu/draw.blade.php
     Menú "Dibujar" — extraído de menu-bar.blade.php (Fase 1 de la
     reestructuración). Se incluye vía @include, hereda el scope del menu-bar. --}}
        {{-- ============================================================
                                MENÚ DRAW / DIBUJAR
        ============================================================ --}}
        <x-cad.ui.menu-dropdown-item label="Dibujar">

            {{-- ÍCONO DEL MENÚ --}}
            <x-slot name="slot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 20l4-1 9-9-3-3-9 9-1 4z" />
                </svg>
            </x-slot>

            {{-- CONTENIDO DEL MENÚ --}}
            <x-slot name="dropdown">
                <div class="cad-menu-panel py-1" style="min-width: 360px;">

                    {{-- ================= PLANO DE REFERENCIA (DXF) ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Plano de referencia
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openImportPlanDialog()">
                        <span>📄</span> Importar Plano (DXF / DWG)...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.toggleImportedPlanVisibility()">
                        <span>👁️</span> Mostrar / Ocultar Plano
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('draw-grid-axis-x')">
                        <span>│</span> Dibujar Eje X (vertical)
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('draw-grid-axis-y')">
                        <span>─</span> Dibujar Eje Y (horizontal)
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.openGenerateStoriesDialog()">
                        <span>🏢</span> Generar Pisos desde la Grilla...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= SELECCIÓN Y EDICIÓN ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Selección y edición
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('select-object')">
                        <span>🖱️</span> Seleccionar objeto
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('reshape-object')">
                        <span>✏️</span> Modificar objeto
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= OBJETOS PUNTUALES ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Objetos puntuales
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('draw-point')">
                        <span>📍</span> Dibujar objetos de puntos
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= OBJETOS LINEALES ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Dibujar objetos lineales
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawFrameTool()">
                        <span>📏</span> Dibujar Líneas (Planta, Elevación, 3D)
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('create-lines-region-clicks')">
                        <span>▦</span> Crear Líneas en Región(Planta, Elevación)
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('create-columns-region-clicks')">
                        <span>│</span> Crear Columnas por Clics (Planta)
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('create-secondary-beams-region-clicks')">
                        <span>═</span> Crear Vigas Secundarias en Región (Planta)
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= ÁREAS / LOSAS ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Áreas
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('draw-area-slab')">
                        <span>🧱</span> Dibujar Losa / Área (Slab)
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('draw-area-slab-rectangle')">
                        <span>▭</span> Dibujar Losa Rectangular (2 clics)
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('draw-area-wall')">
                        <span>▥</span> Dibujar Muro / Panel (Wall)
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateDrawMenuAction('draw-area-opening')">
                        <span>⬚</span> Dibujar Abertura (Opening)
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= SNAP ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Snap
                    </div>

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
        </x-cad.ui.menu-dropdown-item>
