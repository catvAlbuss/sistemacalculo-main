{{-- resources/views/components/cad/layout/menu-bar.blade.php --}}
<div class="bg-gray-800 border-b border-gray-700 shadow-lg">
    {{-- Segunda fila: ETABS v9.7.1 y menú Define --}}
    <div class="flex items-center px-2 py-1 gap-4 border-t border-gray-700">
        {{-- Logo ETABS --}}
        <div class="text-blue-400 font-bold text-sm px-2 whitespace-nowrap border-r border-gray-600">
            ETABS v9.7.1
        </div>

        {{-- Menú FILE (estilo ETABS) --}}
        <x-cad.menu-dropdown-item label="Archivo">
            <x-slot name="slot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16v12H4z M4 6h2 M18 6h2 M4 10h16" />
                </svg>
            </x-slot>
            <x-slot name="dropdown">
                <div class="py-1" style="min-width: 260px; overflow-x: visible;">

                    {{-- New Model --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.openNewModelDialog()">
                        <span>📄</span> Nuevo Modelo...
                    </button>

                    {{-- Open --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.openModel()">
                        <span>📂</span> Abrir...
                    </button>

                    {{-- Save As --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.saveAsModel()">
                        <span>💾</span> Guardar Como...
                    </button>

                    {{-- Import (con submenú) --}}
                    <x-cad.menu-subitem label="Importar">
                        <span>📥</span>
                        <x-slot name="submenu">
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.importETABS_E2K()">
                                <span>📄</span> ETABS .e2k Text File...
                            </button>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.importETABS6()">
                                <span>📄</span> ETABS6 Text File...
                            </button>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.importETABS_EDB()">
                                <span>🗄️</span> ETABS .edb File...
                            </button>
                            <div class="border-t border-gray-700 my-1"></div>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.importDXFGrid()">
                                <span>📐</span> DXF File of Architectural Grid...
                            </button>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.importDXFFloorPlan()">
                                <span>🏢</span> DXF Floor Plan...
                            </button>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.importDXF3D()">
                                <span>📦</span> DXF File of 3D Model...
                            </button>
                            <div class="border-t border-gray-700 my-1"></div>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.importIFC()">
                                <span>🏗️</span> IFC .ifc File...
                            </button>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.importIGES()">
                                <span>🔧</span> IGES .igs File...
                            </button>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.importCIS2()">
                                <span>🔩</span> CIS/2 .stp File...
                            </button>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.importRevit()">
                                <span>🏛️</span> Revit Structure .exr File...
                            </button>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.importProSteel()">
                                <span>⚙️</span> ProSteel .mdb File...
                            </button>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.importFrameworks()">
                                <span>📐</span> Frameworks Plus .sfc File...
                            </button>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.importSTRUDL()">
                                <span>📊</span> STRUDL/STAAD .gti/.std File...
                            </button>
                        </x-slot>
                    </x-cad.menu-subitem>

                    {{-- Export (con submenú) --}}
                    <x-cad.menu-subitem label="Exportar">
                        <span>📤</span>
                        <x-slot name="submenu">
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.exportETABS_E2K()">
                                <span>📄</span> Save Model as ETABS .e2k Text File...
                            </button>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.exportSAFE_V8()">
                                <span>📄</span> Save Story as SAFE V8 .f2k Text File...
                            </button>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.exportSAFE_V12()">
                                <span>📄</span> Save Story as SAFE V12 .f2k Text File...
                            </button>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.exportETABS_EDB()">
                                <span>🗄️</span> Save Story as ETABS .edb File...
                            </button>
                            <div class="border-t border-gray-700 my-1"></div>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.exportProSteelMDB()">
                                <span>⚙️</span> ProSteel .mdb File...
                            </button>
                        </x-slot>
                    </x-cad.menu-subitem>

                    {{-- Create Video --}}
                    <!-- <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.createVideo()">
                        <span>🎥</span> Crear Video...
                    </button> -->

                    <!-- {{-- Print Setup --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.printSetup()">
                        <span>🖨️</span> Configurar Impresión...
                    </button>

                    {{-- Print Preview for Graphics --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.printPreviewGraphics()">
                        <span>👁️</span> Vista Previa de Gráficos...
                    </button> -->

                    {{-- Print Graphics --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.printGraphics()">
                        <span>🖨️</span> Imprimir Gráficos
                        <span class="text-xs text-gray-500 italic ml-auto">Ctrl+P</span>
                    </button>
                </div>
            </x-slot>
        </x-cad.menu-dropdown-item>

        {{-- Menú EDIT / EDITAR (estilo ETABS) --}}
        <x-cad.menu-dropdown-item label="Editar">
            <x-slot name="slot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            </x-slot>

            <x-slot name="dropdown">
                <div class="py-1" style="width: 360px; max-width: 360px; overflow-x: hidden;">

                    {{-- ================= HISTORIAL ================= --}}
                    <div class="px-3 py-1 text-xs font-bold text-blue-400 uppercase bg-gray-800 border-l-4 border-blue-500">
                        Historial
                    </div>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 grid grid-cols-[24px_1fr_auto] items-center gap-2 overflow-hidden"
                        @click.stop="cadSystem.activateEditMenuAction('undo')">
                        <span class="shrink-0">↩️</span>
                        <span class="truncate">Undo</span>
                        <span class="text-xs text-gray-500 italic">Ctrl+Z</span>
                    </button>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 grid grid-cols-[24px_1fr_auto] items-center gap-2 overflow-hidden"
                        @click.stop="cadSystem.activateEditMenuAction('redo')">
                        <span class="shrink-0">↪️</span>
                        <span class="truncate">Redo</span>
                        <span class="text-xs text-gray-500 italic">Ctrl+Y</span>
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= PORTAPAPELES ================= --}}
                    <div class="px-3 py-1 text-xs font-bold text-blue-400 uppercase bg-gray-800 border-l-4 border-blue-500">
                        Portapapeles
                    </div>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 grid grid-cols-[24px_1fr_auto] items-center gap-2 overflow-hidden"
                        @click.stop="cadSystem.activateEditMenuAction('cut')">
                        <span>✂️</span>
                        <span class="truncate">Cut</span>
                        <span class="text-xs text-gray-500 italic">Ctrl+X</span>
                    </button>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 grid grid-cols-[24px_1fr_auto] items-center gap-2 overflow-hidden"
                        @click.stop="cadSystem.activateEditMenuAction('copy')">
                        <span>📋</span>
                        <span class="truncate">Copy</span>
                        <span class="text-xs text-gray-500 italic">Ctrl+C</span>
                    </button>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 grid grid-cols-[24px_1fr_auto] items-center gap-2 overflow-hidden"
                        @click.stop="cadSystem.activateEditMenuAction('paste')">
                        <span>📌</span>
                        <span class="truncate">Paste</span>
                        <span class="text-xs text-gray-500 italic">Ctrl+V</span>
                    </button>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 grid grid-cols-[24px_1fr_auto] items-center gap-2 overflow-hidden"
                        @click.stop="cadSystem.activateEditMenuAction('delete')">
                        <span>🗑️</span>
                        <span class="truncate">Delete</span>
                        <span class="text-xs text-gray-500 italic">Del</span>
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= EDICIÓN DEL MODELO ================= --}}
                    <div class="px-3 py-1 text-xs font-bold text-blue-400 uppercase bg-gray-800 border-l-4 border-blue-500">
                        Edición del Modelo
                    </div>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 grid grid-cols-[24px_1fr] items-center gap-2 overflow-hidden"
                        @click.stop="cadSystem.activateEditMenuAction('replicate')">
                        <span>🔄</span>
                        <span class="truncate">Replicate...</span>
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= DATOS DEL MODELO ================= --}}
                    <div class="px-3 py-1 text-xs font-bold text-blue-400 uppercase bg-gray-800 border-l-4 border-blue-500">
                        Datos del Modelo
                    </div>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 grid grid-cols-[24px_1fr] items-center gap-2 overflow-hidden"
                        @click.stop="cadSystem.activateEditMenuAction('edit-grid-data')">
                        <span>📏</span>
                        <span class="truncate">Edit Grid Data</span>
                    </button>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 grid grid-cols-[24px_1fr] items-center gap-2 overflow-hidden"
                        @click.stop="cadSystem.activateEditMenuAction('edit-story-data')">
                        <span>🏢</span>
                        <span class="truncate">Edit Story Data</span>
                    </button>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 grid grid-cols-[24px_1fr] items-center gap-2 overflow-hidden"
                        @click.stop="cadSystem.activateEditMenuAction('edit-reference-planes')">
                        <span>📐</span>
                        <span class="truncate">Edit Reference Planes...</span>
                    </button>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 grid grid-cols-[24px_1fr] items-center gap-2 overflow-hidden"
                        @click.stop="cadSystem.activateEditMenuAction('edit-reference-lines')">
                        <span>━━</span>
                        <span class="truncate">Edit Reference Lines...</span>
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= HERRAMIENTAS GEOMÉTRICAS ================= --}}
                    <div class="px-3 py-1 text-xs font-bold text-blue-400 uppercase bg-gray-800 border-l-4 border-blue-500">
                        Herramientas Geométricas
                    </div>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 grid grid-cols-[24px_1fr] items-center gap-2 overflow-hidden"
                        @click.stop="cadSystem.activateEditMenuAction('merge-points')">
                        <span>🔗</span>
                        <span class="truncate">Merge Points...</span>
                    </button>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 grid grid-cols-[24px_1fr] items-center gap-2 overflow-hidden"
                        @click.stop="cadSystem.activateEditMenuAction('align-points-lines-edges')">
                        <span>📍</span>
                        <span class="truncate">Align Points/Lines/Edges...</span>
                    </button>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 grid grid-cols-[24px_1fr] items-center gap-2 overflow-hidden"
                        @click.stop="cadSystem.activateEditMenuAction('move-points-lines-areas')">
                        <span>↔️</span>
                        <span class="truncate">Move Points/Lines/Areas...</span>
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 grid grid-cols-[24px_1fr] items-center gap-2 overflow-hidden"
                        @click.stop="cadSystem.activateEditMenuAction('join-lines')">
                        <span>⛓️</span>
                        <span class="truncate">Join Lines</span>
                    </button>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 grid grid-cols-[24px_1fr] items-center gap-2 overflow-hidden"
                        @click.stop="cadSystem.activateEditMenuAction('divide-lines')">
                        <span>✂️</span>
                        <span class="truncate">Divide Lines...</span>
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= EXTRUSIÓN ================= --}}
                    <div class="px-3 py-1 text-xs font-bold text-blue-400 uppercase bg-gray-800 border-l-4 border-blue-500">
                        Extrusión
                    </div>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 grid grid-cols-[24px_1fr] items-center gap-2 overflow-hidden"
                        @click.stop="cadSystem.activateEditMenuAction('extrude-points-to-lines')">
                        <span>📍</span>
                        <span class="truncate">Extrude Points to Lines...</span>
                    </button>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 grid grid-cols-[24px_1fr] items-center gap-2 overflow-hidden"
                        @click.stop="cadSystem.activateEditMenuAction('extrude-lines-to-areas')">
                        <span>▭</span>
                        <span class="truncate">Extrude Lines to Areas...</span>
                    </button>

                </div>
            </x-slot>
        </x-cad.menu-dropdown-item>

        {{-- Menú VIEW / VISTA (estilo ETABS) --}}
        <x-cad.menu-dropdown-item label="Vista">
            <x-slot name="slot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            </x-slot>

            <x-slot name="dropdown">
                <div class="py-1" style="min-width: 280px; overflow-x: visible;">

                    {{-- ================= CAMBIO DE VISTA ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Configurar Vista
                    </div>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                        @click.stop="cadSystem.activateViewMenuAction('set-3d-view')">
                        <span>🎥</span>
                        Set 3D View...
                    </button>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                        @click.stop="cadSystem.activateViewMenuAction('set-plan-view')">
                        <span>🗺️</span>
                        Set Plan View...
                    </button>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                        @click.stop="cadSystem.activateViewMenuAction('set-elevation-view')">
                        <span>📐</span>
                        Set Elevation View...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= ZOOM ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Zoom
                    </div>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                        @click.stop="cadSystem.activateViewMenuAction('rubber-band-zoom')">
                        <span>🔍</span>
                        Rubber Band Zoom
                    </button>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                        @click.stop="cadSystem.activateViewMenuAction('restore-full-view')">
                        <span>🖼️</span>
                        Restore Full View
                    </button>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                        @click.stop="cadSystem.activateViewMenuAction('previous-zoom')">
                        <span>⏪</span>
                        Previous Zoom
                    </button>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                        @click.stop="cadSystem.activateViewMenuAction('zoom-in-one-step')">
                        <span>🔍+</span>
                        Zoom In One Step
                    </button>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                        @click.stop="cadSystem.activateViewMenuAction('zoom-out-one-step')">
                        <span>🔍-</span>
                        Zoom Out One Step
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= NAVEGACIÓN ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Navegación
                    </div>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                        @click.stop="cadSystem.activateViewMenuAction('pan')">
                        <span>✋</span>
                        Pan
                    </button>

                </div>
            </x-slot>
        </x-cad.menu-dropdown-item>

        {{-- Menú DEFINE (estilo ETABS) --}}
        <x-cad.menu-dropdown-item label="Define">
            <x-slot name="slot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16v12H4z M8 6v12 M16 6v12" />
                </svg>
            </x-slot>
            <x-slot name="dropdown">
                <div class="py-1" style="width: 350px; max-width: 350px; overflow-x: hidden;">
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

        {{-- Menú SELECT (estilo ETABS) --}}
        <x-cad.menu-dropdown-item label="Seleccionar">
            <x-slot name="slot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
            </x-slot>
            <x-slot name="dropdown">
                <div class="py-1" style="min-width: 260px;">
                    {{-- Selección por Ubicación --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">Por Ubicación</div>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.activateSelectMenuAction('select-pointer-window')">
                        <span>🖱️</span> En Puntero/En Ventana
                    </button>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.selectByXYPlane()">
                        <span>📐</span> en Plano XY
                    </button>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.selectByXZPlane()">
                        <span>📐</span> en Plano XZ
                    </button>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.selectByYZPlane()">
                        <span>📐</span> en Plano YZ
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- Selección por Propiedades --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">Por Propiedades</div>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.selectByGroups()">
                        <span>👥</span> por Grupos...
                    </button>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.selectByFrameSections()">
                        <span>📐</span> por Secciones de Marco
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- Selección General --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">General</div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.activateSelectMenuAction('select-invert')">
                        <span>🔄</span> Invertir
                    </button>

                    <x-cad.menu-subitem label="Deseleccionar">
                        <span>❌</span>
                        <x-slot name="submenu">
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.deselectByPointer()">
                                <span>🖱️</span> En Puntero/En Ventana
                            </button>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.deselectByXYPlane()">
                                <span>📐</span> en Plano XY
                            </button>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.deselectByXZPlane()">
                                <span>📐</span> en Plano XZ
                            </button>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.deselectByYZPlane()">
                                <span>📐</span> en Plano YZ
                            </button>
                            <div class="border-t border-gray-700 my-1"></div>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.deselectByGroups()">
                                <span>👥</span> por Grupos...
                            </button>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.deselectByFrameSections()">
                                <span>📐</span> por Secciones de Pórtico...
                            </button>
                            <div class="border-t border-gray-700 my-1"></div>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.activateSelectMenuAction('select-none')">
                                <span>✅</span> Todo
                            </button>
                            <!-- <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.activateSelectMenuAction('select-none')">
                                <span>All</span> Invertir
                            </button> -->
                        </x-slot>
                    </x-cad.menu-subitem>

                </div>
            </x-slot>
        </x-cad.menu-dropdown-item>

        {{-- Menú ASSIGN / ASIGNAR (estilo ETABS) --}}
        <x-cad.menu-dropdown-item label="Assign">
            <x-slot name="slot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
            </x-slot>

            <x-slot name="dropdown">
                <div class="py-1" style="min-width: 300px; overflow-x: visible;">

                    {{-- ================= ASIGNACIONES A OBJETOS ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Asignaciones a Objetos
                    </div>

                    {{-- Joint / Point --}}
                    <x-cad.menu-subitem label="Joint / Point">
                        <span>⚫</span>

                        <x-slot name="submenu">
                            <button
                                class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('joint-diaphragms')">
                                <span>🏢</span>
                                Diaphragms...
                            </button>

                            <button
                                class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('joint-restraints')">
                                <span>⚓</span>
                                Restraints / Supports...
                            </button>

                            <button
                                class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('joint-springs')">
                                <span>➿</span>
                                Point Springs...
                            </button>
                        </x-slot>
                    </x-cad.menu-subitem>

                    {{-- Frame / Line --}}
                    <x-cad.menu-subitem label="Frame / Line">
                        <span>━━</span>

                        <x-slot name="submenu">
                            <button
                                class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('frame-section')">
                                <span>📐</span>
                                Frame Section...
                            </button>

                            {{-- Activa este botón solo si ya tienes implementado frame-material --}}
                            {{--
                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                        @click.stop="cadSystem.activateAssignMenuAction('frame-material')">
                        <span>🧱</span>
                        Material...
                    </button>
                    --}}

                            <button
                                class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('frame-releases')">
                                <span>🔓</span>
                                Frame Releases / Partial Fixity...
                            </button>

                            <button
                                class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('frame-end-offsets')">
                                <span>📏</span>
                                End (Length) Offsets...
                            </button>
                        </x-slot>
                    </x-cad.menu-subitem>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= CARGAS ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Cargas
                    </div>

                    {{-- Joint / Point Loads --}}
                    <x-cad.menu-subitem label="Joint / Point Loads">
                        <span>🔴</span>

                        <x-slot name="submenu">
                            <button
                                class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('joint-load-force')">
                                <span>🎯</span>
                                Force...
                            </button>

                            <button
                                class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('joint-load-ground-displacement')">
                                <span>🌍</span>
                                Ground Displacement...
                            </button>

                            <button
                                class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('joint-load-temperature')">
                                <span>🌡️</span>
                                Temperature...
                            </button>
                        </x-slot>
                    </x-cad.menu-subitem>

                    {{-- Frame / Line Loads --}}
                    <x-cad.menu-subitem label="Frame / Line Loads">
                        <span>📊</span>

                        <x-slot name="submenu">
                            <button
                                class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('frame-load-point')">
                                <span>📍</span>
                                Point...
                            </button>

                            <button
                                class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('frame-load-distributed')">
                                <span>📊</span>
                                Distributed...
                            </button>

                            <button
                                class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateAssignMenuAction('frame-load-temperature')">
                                <span>🌡️</span>
                                Temperature...
                            </button>
                        </x-slot>
                    </x-cad.menu-subitem>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= GRUPOS Y REVISIÓN ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Grupos y Revisión
                    </div>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                        @click.stop="cadSystem.activateAssignMenuAction('group-names')">
                        <span>🧩</span>
                        Group Names...
                    </button>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                        @click.stop="cadSystem.activateAssignMenuAction('show-selected-assignments')">
                        <span>📋</span>
                        Show Selected Assignments...
                    </button>

                </div>
            </x-slot>
        </x-cad.menu-dropdown-item>

        {{-- Menú ANALISAR (estilo ETABS con submenús) --}}
        <x-cad.menu-dropdown-item label="Analisar">
            <x-slot name="slot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            </x-slot>
            <x-slot name="dropdown">
                <div class="py-1" style="min-width: 260px;">
                    {{-- Selección por Ubicación --}}
                    {{-- Grupo: Configuración de Análisis --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.setAnalysisOptions()">
                        <span>⚙️</span> Establecer Opciones de Análisis...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.checkModel()">
                        <span>🔍</span> Revisar Modelo...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex justify-between items-center gap-2 whitespace-nowrap" @click="cadSystem.runAnalysis()">
                        <div class="flex items-center gap-2">
                            <span>▶️</span> Ejecutar Análisis
                        </div>
                        <span class="text-xs text-gray-500 italic">F5</span>
                    </button>
                </div>
            </x-slot>
        </x-cad.menu-dropdown-item>

        {{-- Menú DISPLAY / MOSTRAR (estilo ETABS) --}}
        <x-cad.menu-dropdown-item label="Mostrar">
            <x-slot name="slot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            </x-slot>

            <x-slot name="dropdown">
                <div class="py-1" style="min-width: 310px; overflow-x: visible;">

                    {{-- ================= MODELO ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Modelo
                    </div>

                    {{-- Show Undeformed Shape --}}
                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                        @click.stop="cadSystem.activateDisplayMenuAction('show-undeformed-shape')">
                        <span>📐</span>
                        Show Undeformed Shape
                    </button>

                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                        @click.stop="cadSystem.activateDisplayMenuAction('show-reference-planes')">
                        <span>🟨</span>
                        Show Reference Planes
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= CARGAS ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Cargas
                    </div>

                    {{-- Show Loads --}}
                    <x-cad.menu-subitem label="Show Loads">
                        <span>📊</span>

                        <x-slot name="submenu">
                            <button
                                class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDisplayMenuAction('show-joint-loads')">
                                <span>⚫</span>
                                Joint / Point...
                            </button>

                            <button
                                class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDisplayMenuAction('show-frame-loads')">
                                <span>━━</span>
                                Frame / Line...
                            </button>
                        </x-slot>
                    </x-cad.menu-subitem>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= DEFORMADAS Y MODOS ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Deformadas y Modos
                    </div>

                    {{-- Show Deformed Shape --}}
                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                        @click.stop="cadSystem.activateDisplayMenuAction('show-deformed-shape')">
                        <span>📈</span>
                        Show Deformed Shape...
                    </button>

                    {{-- Show Mode Shape --}}
                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                        @click.stop="cadSystem.activateDisplayMenuAction('show-mode-shape')">
                        <span>🎵</span>
                        Show Mode Shape...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= FUERZAS Y DIAGRAMAS ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Fuerzas y Diagramas
                    </div>

                    {{-- Show Member Forces / Stress Diagram --}}
                    <button
                        class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                        @click.stop="cadSystem.activateDisplayMenuAction('show-member-forces')">
                        <span>📉</span>
                        Show Member Forces / Stress Diagram
                    </button>

                </div>
            </x-slot>
        </x-cad.menu-dropdown-item>

        {{-- Menú DESIGN / DISEÑO (estilo ETABS) --}}
        <x-cad.menu-dropdown-item label="Design">
            <x-slot name="slot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 7h6m-6 4h6m-6 4h3m-7 4h14a2 2 0 002-2V7.828a2 2 0 00-.586-1.414l-3.828-3.828A2 2 0 0015.172 2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            </x-slot>

            <x-slot name="dropdown">
                <div class="py-1" style="min-width: 320px; overflow-x: visible;">

                    {{-- ================= STEEL FRAME DESIGN ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Diseño de Marcos de Acero
                    </div>

                    <x-cad.menu-subitem label="Steel Frame Design">
                        <span>Ⅰ</span>

                        <x-slot name="submenu">
                            <button
                                class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDesignMenuAction ? cadSystem.activateDesignMenuAction('steel-frame-select-combo') : cadSystem.showMessage?.('Design pendiente: Select Design Combo', 'warning')">
                                <span>📋</span>
                                Select Design Combo...
                            </button>

                            <div class="border-t border-gray-700 my-1"></div>

                            <button
                                class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDesignMenuAction ? cadSystem.activateDesignMenuAction('steel-frame-overwrites') : cadSystem.showMessage?.('Design pendiente: View/Revise Overwrites', 'warning')">
                                <span>📝</span>
                                View/Revise Overwrites...
                            </button>

                            <div class="border-t border-gray-700 my-1"></div>

                            <button
                                class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDesignMenuAction ? cadSystem.activateDesignMenuAction('steel-frame-start-check') : cadSystem.showMessage?.('Design pendiente: Start Design/Check', 'warning')">
                                <span>▶️</span>
                                Start Design/Check of Structure
                            </button>

                            <div class="border-t border-gray-700 my-1"></div>

                            <button
                                class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDesignMenuAction ? cadSystem.activateDesignMenuAction('steel-frame-display-info') : cadSystem.showMessage?.('Design pendiente: Display Design Info', 'warning')">
                                <span>📊</span>
                                Display Design Info...
                            </button>
                        </x-slot>
                    </x-cad.menu-subitem>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= STEEL JOIST DESIGN ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Diseño de Joist de Acero
                    </div>

                    <x-cad.menu-subitem label="Steel Joist Design">
                        <span>▰</span>

                        <x-slot name="submenu">

                            <button
                                class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDesignMenuAction ? cadSystem.activateDesignMenuAction('steel-joist-select-combo') : cadSystem.showMessage?.('Steel Joist Design pendiente: Select Design Combo', 'warning')">
                                <span>📋</span>
                                Select Design Combo...
                            </button>

                            <div class="border-t border-gray-700 my-1"></div>

                            <button
                                class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDesignMenuAction ? cadSystem.activateDesignMenuAction('steel-joist-overwrites') : cadSystem.showMessage?.('Steel Joist Design pendiente: View/Revise Overwrites', 'warning')">
                                <span>📝</span>
                                View/Revise Overwrites...
                            </button>

                            <div class="border-t border-gray-700 my-1"></div>

                            <button
                                class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDesignMenuAction ? cadSystem.activateDesignMenuAction('steel-joist-start-using-similarity') : cadSystem.showMessage?.('Steel Joist Design pendiente: Start Design Using Similarity', 'warning')">
                                <span>▶️</span>
                                Start Design Using Similarity
                            </button>

                            <button
                                class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDesignMenuAction ? cadSystem.activateDesignMenuAction('steel-joist-start-without-similarity') : cadSystem.showMessage?.('Steel Joist Design pendiente: Start Design Without Similarity', 'warning')">
                                <span>▶️</span>
                                Start Design Without Similarity
                            </button>

                            <div class="border-t border-gray-700 my-1"></div>

                            <button
                                class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDesignMenuAction ? cadSystem.activateDesignMenuAction('steel-joist-display-info') : cadSystem.showMessage?.('Steel Joist Design pendiente: Display Design Info', 'warning')">
                                <span>📊</span>
                                Display Design Info...
                            </button>
                        </x-slot>
                    </x-cad.menu-subitem>

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