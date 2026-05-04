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

        {{-- Menú EDIT (estilo ETABS) --}}
        <x-cad.menu-dropdown-item label="Editar">
            <x-slot name="slot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            </x-slot>
            <x-slot name="dropdown">
                <div class="py-1" style="min-width: 260px; overflow-x: visible;">

                    {{-- Undo --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex justify-between items-center gap-2" @click="cadSystem.undo()">
                        <div class="flex items-center gap-2">
                            <span>↩️</span> Deshacer
                        </div>
                        <span class="text-xs text-gray-500 italic">Ctrl+Z</span>
                    </button>

                    {{-- Redo --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex justify-between items-center gap-2" @click="cadSystem.redo()">
                        <div class="flex items-center gap-2">
                            <span>↪️</span> Rehacer
                        </div>
                        <span class="text-xs text-gray-500 italic">Ctrl+Y</span>
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- Cut --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex justify-between items-center gap-2" @click="cadSystem.cut()">
                        <div class="flex items-center gap-2">
                            <span>✂️</span> Cortar
                        </div>
                        <span class="text-xs text-gray-500 italic">Ctrl+X</span>
                    </button>

                    {{-- Copy --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex justify-between items-center gap-2" @click="cadSystem.copy()">
                        <div class="flex items-center gap-2">
                            <span>📋</span> Copiar
                        </div>
                        <span class="text-xs text-gray-500 italic">Ctrl+C</span>
                    </button>

                    {{-- Paste --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex justify-between items-center gap-2" @click="cadSystem.paste()">
                        <div class="flex items-center gap-2">
                            <span>📌</span> Pegar...
                        </div>
                        <span class="text-xs text-gray-500 italic">Ctrl+V</span>
                    </button>

                    {{-- Delete --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex justify-between items-center gap-2" @click="cadSystem.deleteSelected()">
                        <div class="flex items-center gap-2">
                            <span>🗑️</span> Eliminar
                        </div>
                        <span class="text-xs text-gray-500 italic">SUPR</span>
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- Replicate --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.replicate()">
                        <span>🔄</span> Replicar...
                    </button>

                    {{-- Edit Grid Data --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.editGridData()">
                        <span>📏</span> Editar Datos de Grilla...
                    </button>

                    {{-- Edit Story Data --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.editStoryData()">
                        <span>🏢</span> Editar Datos de Pisos...
                    </button>

                    {{-- Edit Reference Planes --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.editReferencePlanes()">
                        <span>📐</span> Editar Planos de Referencia...
                    </button>

                    {{-- Edit Reference Lines --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.editReferenceLines()">
                        <span>━━</span> Editar Líneas de Referencia...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- Edit Reference Lines --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="">
                        <span></span> Puntos de Fusion ...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="">
                        <span></span> Alinear Puntos/Lineas/Bordes
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="">
                        <span></span> Mover puntos/líneas/áreas
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="">
                        <span></span> Unir lineas
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="">
                        <span></span> Lineas Divisoras
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="">
                        <span></span> Extruir puntos a líneas
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="">
                        <span></span> Extruir líneas hacia áreas
                    </button>
                </div>
            </x-slot>
        </x-cad.menu-dropdown-item>

        {{-- Menú VIEW (estilo ETABS) --}}
        <x-cad.menu-dropdown-item label="Vista">
            <x-slot name="slot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            </x-slot>
            <x-slot name="dropdown">
                <div class="py-1" style="min-width: 260px; overflow-x: visible;">

                    {{-- Set 3D View --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.set3DView()">
                        <span>🎥</span> Configurar Vista 3D...
                    </button>

                    {{-- Set Plan View --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.setPlanView()">
                        <span>🗺️</span> Configurar Vista en Planta...
                    </button>

                    {{-- Set Elevation View --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.setElevationView()">
                        <span>📐</span> Configurar Vista en Elevación...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- Rubber Band Zoom --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.rubberBandZoom()">
                        <span>🔍</span> Zoom con Recuadro
                    </button>

                    {{-- Restore Full View --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.restoreFullView()">
                        <span>🖼️</span> Restaurar Vista Completa
                    </button>

                    {{-- Previous Zoom --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.previousZoom()">
                        <span>⏪</span> Zoom Anterior
                    </button>

                    {{-- Zoom In One Step --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.zoomInOneStep()">
                        <span>🔍+</span> Zoom +1
                    </button>

                    {{-- Zoom Out One Step --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.zoomOutOneStep()">
                        <span>🔍-</span> Zoom -1
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- Pan --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.panView()">
                        <span>✋</span> Panorámica
                    </button>
                </div>
            </x-slot>
        </x-cad.menu-dropdown-item>
        {{-- Otros menús ETABS pueden ir aquí --}}

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
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.selectByPointer()">
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

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2" @click="cadSystem.invertSelection()">
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
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.deselectAll()">
                                <span>✅</span> Todo
                            </button>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.invertSelection()">
                                <span>All</span> Invertir
                            </button>
                        </x-slot>
                    </x-cad.menu-subitem>

                </div>
            </x-slot>
        </x-cad.menu-dropdown-item>

        {{-- Menú ASSIGN (estilo ETABS con submenús) --}}
        <x-cad.menu-dropdown-item label="Asignar">
            <x-slot name="slot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
            </x-slot>
            <x-slot name="dropdown">
                <div class="py-1" style="min-width: 220px; overflow-x: visible;">

                    {{-- ========== TIPO DE OBJETO ========== --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">Tipo de Objeto</div>

                    {{-- Joint/Point --}}
                    <x-cad.menu-subitem label="Nudo/Punto">
                        <span>⚫</span>
                        <x-slot name="submenu">
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap">
                                🏢 Diafragmas...
                            </button>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap">
                                ⚓ Restricciones (Soportes)...
                            </button>
                            <div class="my-1 border-t border-gray-200"></div>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap">
                                ➿ Resortes Puntuales...
                            </button>
                        </x-slot>
                    </x-cad.menu-subitem>

                    {{-- Frame/Line --}}
                    <x-cad.menu-subitem label="Elemento Frame/Línea">
                        <span>━━</span>
                        <x-slot name="submenu">
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap">
                                📐 Sección de Elemento Frame...
                            </button>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap">
                                🔓 Liberaciones de Extremo / Fijación Parcial...
                            </button>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap">
                                📏 Desplazamiento de la longi...
                            </button>
                        </x-slot>
                    </x-cad.menu-subitem>

                    {{-- Shell/Area --}}

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ========== CARGAS EN NUDOS/PUNTOS ========== --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">Cargas en Nudos/Puntos</div>

                    <x-cad.menu-subitem label="Cargas en Nudos/Puntos">
                        <span>🔴</span>
                        <x-slot name="submenu">
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap">
                                🎯 Fuerza (Force)...
                            </button>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap">
                                🌍 Desplazamiento del Terreno...
                            </button>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap">
                                🌡️ Temperatura...
                            </button>
                        </x-slot>
                    </x-cad.menu-subitem>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ========== CARGAS EN ELEMENTOS FRAME/LÍNEA ========== --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">Cargas en Elementos Frame/Línea</div>

                    <x-cad.menu-subitem label="Cargas en Frame/Línea">
                        <span>📊</span>
                        <x-slot name="submenu">
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap">
                                📍 Puntual (Point)...
                            </button>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap">
                                📊 Distribuida (Distributed)...
                            </button>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap">
                                🌡️ Temperatura...
                            </button>
                        </x-slot>
                    </x-cad.menu-subitem>
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

        {{-- Menú MOSTRAR --}}
        <x-cad.menu-dropdown-item label="Mostrar">
            <x-slot name="slot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            </x-slot>
            <x-slot name="dropdown">
                <div class="py-1" style="min-width: 220px; overflow-x: visible;">

                    {{-- Mostrar Forma No Deformada --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.showUndeformedShape()">
                        <span>📐</span> Mostrar Forma No Deformada
                    </button>

                    {{-- Mostrar Cargas (con submenús) --}}
                    <x-cad.menu-subitem label="Mostrar Cargas">
                        <span>📊</span>
                        <x-slot name="submenu">
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.showLoadsOnJoints()">
                                <span>⚫</span> Nudos/Puntos...
                            </button>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.showLoadsOnFrames()">
                                <span>━━</span> Elementos Frame/Línea...
                            </button>
                            <!-- <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.showLoadsOnShells()">
                                <span>◻️</span> Elementos Shell/Área...
                            </button> -->
                        </x-slot>
                    </x-cad.menu-subitem>

                    {{-- Mostrar Forma Deformada --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.showDeformedShape()">
                        <span>📈</span> Mostrar Forma Deformada...
                    </button>

                    {{-- Mostrar Forma Modal --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.showModeShape()">
                        <span>🎵</span> Mostrar Forma Modal...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- Mostrar Diagramas de Fuerzas/Esfuerzos --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.showMemberForces()">
                        <span>📉</span> Mostrar Diagramas de Fuerzas/Esfuerzos de Elementos
                    </button>
                </div>
            </x-slot>
        </x-cad.menu-dropdown-item>
        {{-- Menú DESIGN --}}
        <x-cad.menu-dropdown-item label="Desiño">
            <x-slot name="slot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
            </x-slot>
            <x-slot name="dropdown">
                <div class="py-1" style="min-width: 200px;">

                    {{-- Mostrar Cargas (con submenús) --}}
                    <x-cad.menu-subitem label="Diseño de Estructura de Acero">
                        <span>🏗️</span>
                        <x-slot name="submenu">
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.selectDesignCombos()">
                                <span>🔢</span> Seleccionar Combos de Diseño...
                            </button>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.openDesignOverwrites()">
                                <span>📝</span> Ver/Revisar Sobrescrituras (Overwrites)...
                            </button>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem">
                                <span>🏗️</span> Iniciar Diseño/Chequeo de la Estructura
                            </button>
                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.displayDesignInfo()">
                                <span>📊</span> Mostrar Información de Diseño...
                            </button>
                        </x-slot>
                    </x-cad.menu-subitem>
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap" @click="cadSystem.showMemberForces()">
                        <span>📉</span> Diseño de Viguetas de Acero (Joist)
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

        <!-- {{-- Otros menús ETABS pueden ir aquí --}}
        <button class="text-gray-300 hover:text-white text-sm px-2 py-1 whitespace-nowrap">Analyze</button>
        <button class="text-gray-300 hover:text-white text-sm px-2 py-1 whitespace-nowrap">Display</button>
        <button class="text-gray-300 hover:text-white text-sm px-2 py-1 whitespace-nowrap">Design</button> -->
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