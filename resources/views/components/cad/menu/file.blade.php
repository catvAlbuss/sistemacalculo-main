{{-- resources/views/components/cad/menu/file.blade.php
     Menú "Archivo" — extraído de menu-bar.blade.php (Fase 1 de la
     reestructuración). Se incluye vía @include, hereda el scope del menu-bar. --}}
        {{-- ============================================================
                                MENÚ FILE / ARCHIVO
        ============================================================ --}}
        <x-cad.ui.menu-dropdown-item label="Archivo">

            {{-- ÍCONO DEL MENÚ --}}
            <x-slot name="slot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 6h16v12H4z M4 6h2 M18 6h2 M4 10h16" />
                </svg>
            </x-slot>

            {{-- CONTENIDO DEL MENÚ --}}
            <x-slot name="dropdown">
                <div class="cad-menu-panel py-1" style="min-width: 360px;">

                    {{-- ================= MODELO ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Modelo
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.openNewModelDialog()">
                        <span>📄</span>
                        <span class="flex-1 truncate">Nuevo Modelo...</span>
                        <span class="text-xs text-gray-500 italic">Grid</span>
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= ARCHIVO INTERNO ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Archivo interno del sistema
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.openModel()">
                        <span>📂</span>
                        <span class="flex-1 truncate">Abrir modelo JSON...</span>
                        <span class="text-xs text-green-400 italic">Estable</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.saveAsModel()">
                        <span>💾</span>
                        <span class="flex-1 truncate">Guardar como JSON...</span>
                        <span class="text-xs text-green-400 italic">Estable</span>
                    </button>

                    <div class="px-3 py-1 text-[11px] text-gray-400 bg-gray-900">
                        Formato recomendado para guardar y recuperar completamente el modelo.
                    </div>

                    {{-- ================= NUBE (BD por usuario) ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Nube (mi cuenta)
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.saveNow()">
                        <span>💾</span>
                        <span class="flex-1 truncate">Guardar ahora</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.openMyModels()">
                        <span>☁️</span>
                        <span class="flex-1 truncate">Mis modelos...</span>
                        <span class="text-xs text-green-400 italic">Autoguardado</span>
                    </button>

                    <div class="px-3 py-1 text-[11px] text-gray-400 bg-gray-900">
                        Tus modelos guardados en tu cuenta
                        "Guardar ahora" fuerza el guardado inmediato en la nube.
                    </div>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= IMPORTACIÓN ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Intercambio / Importación
                    </div>

                    <x-cad.ui.menu-subitem label="Importar">
                        <span>📥</span>

                        <x-slot name="submenu">

                            {{-- ================= ETABS ================= --}}
                            <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                                ETABS
                            </div>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.importETABS_E2K()">
                                <span>📄</span>
                                <span class="flex-1 truncate">Importar .e2k</span>
                                <span class="text-xs text-green-400 italic">Estable</span>
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.importETABS6()">
                                <span>📄</span>
                                <span class="flex-1 truncate">ETABS6 Text File...</span>
                                <span class="text-xs text-gray-500 italic">Pendiente</span>
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.importETABS_EDB()">
                                <span>🗄️</span>
                                <span class="flex-1 truncate">ETABS .edb File...</span>
                                <span class="text-xs text-gray-500 italic">Pendiente</span>
                            </button>

                            <div class="border-t border-gray-700 my-1"></div>

                            {{-- ================= CAD / BIM ================= --}}
                            <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                                CAD / BIM
                            </div>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.importDXFGrid()">
                                <span>📐</span>
                                <span class="flex-1 truncate">DXF Architectural Grid...</span>
                                <span class="text-xs text-gray-500 italic">Pendiente</span>
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.importDXFFloorPlan()">
                                <span>🏢</span>
                                <span class="flex-1 truncate">DXF Floor Plan...</span>
                                <span class="text-xs text-gray-500 italic">Pendiente</span>
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.importDXF3D()">
                                <span>📦</span>
                                <span class="flex-1 truncate">DXF 3D Model...</span>
                                <span class="text-xs text-gray-500 italic">Pendiente</span>
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.importIFC()">
                                <span>🏗️</span>
                                <span class="flex-1 truncate">IFC .ifc File...</span>
                                <span class="text-xs text-gray-500 italic">Pendiente</span>
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.importRevit()">
                                <span>🏛️</span>
                                <span class="flex-1 truncate">Revit Structure .exr...</span>
                                <span class="text-xs text-gray-500 italic">Pendiente</span>
                            </button>

                        </x-slot>
                    </x-cad.ui.menu-subitem>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= EXPORTACIÓN ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Intercambio / Exportación
                    </div>

                    <x-cad.ui.menu-subitem label="Exportar">
                        <span>📤</span>

                        <x-slot name="submenu">

                            {{-- ================= ETABS / SAFE ================= --}}
                            <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                                ETABS / SAFE
                            </div>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.exportETABS_E2K()">
                                <span>📄</span>
                                <span class="flex-1 truncate">Exportar .e2k</span>
                                <span class="text-xs text-green-400 italic">Estable</span>
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.exportSAFE_V8()">
                                <span>📄</span>
                                <span class="flex-1 truncate">SAFE V8 .f2k Text File...</span>
                                <span class="text-xs text-gray-500 italic">Pendiente</span>
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.exportSAFE_V12()">
                                <span>📄</span>
                                <span class="flex-1 truncate">SAFE V12 .f2k Text File...</span>
                                <span class="text-xs text-gray-500 italic">Pendiente</span>
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.exportETABS_EDB()">
                                <span>🗄️</span>
                                <span class="flex-1 truncate">ETABS .edb File...</span>
                                <span class="text-xs text-gray-500 italic">No disponible</span>
                            </button>

                            <div class="border-t border-gray-700 my-1"></div>

                            {{-- ================= OTROS FORMATOS ================= --}}
                            <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                                Otros formatos
                            </div>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.exportProSteelMDB()">
                                <span>⚙️</span>
                                <span class="flex-1 truncate">ProSteel .mdb File...</span>
                                <span class="text-xs text-gray-500 italic">Pendiente</span>
                            </button>

                        </x-slot>
                    </x-cad.ui.menu-subitem>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= SALIDA ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Salida
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.printGraphics()">
                        <span>🖨️</span>
                        <span class="flex-1 truncate">Imprimir Gráficos</span>
                        <span class="text-xs text-gray-500 italic">Ctrl+P</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.generarReporteSismico()">
                        <span>📑</span>
                        <span class="flex-1 truncate">Reporte Sísmico (PDF)...</span>
                        <span class="text-xs text-cyan-400 italic">RSA</span>
                    </button>

                </div>
            </x-slot>
        </x-cad.ui.menu-dropdown-item>
