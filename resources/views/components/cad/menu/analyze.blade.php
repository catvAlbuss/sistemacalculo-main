{{-- resources/views/components/cad/menu/analyze.blade.php
     Menú "Analizar" — extraído de menu-bar.blade.php (Fase 1 de la
     reestructuración). Se incluye vía @include, hereda el scope del menu-bar. --}}
        {{-- ============================================================
                                MENÚ ANALYZE / ANALIZAR
        ============================================================ --}}
        <x-cad.ui.menu-dropdown-item label="Analizar">

            {{-- ÍCONO DEL MENÚ --}}
            <x-slot name="slot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            </x-slot>

            {{-- CONTENIDO DEL MENÚ --}}
            <x-slot name="dropdown">
                <div class="cad-menu-panel py-1" style="min-width: 320px;">

                    {{-- ================= CONFIGURACIÓN DEL ANÁLISIS ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Configuración del Análisis
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.setAnalysisOptions()">
                        <span>⚙️</span>
                        <span class="flex-1 truncate">Definir Opciones de Análisis...</span>
                        <span class="text-xs text-gray-500 italic">Opciones</span>
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= VALIDACIÓN DEL MODELO ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Validación del Modelo
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.checkModel()">
                        <span>🔍</span>
                        <span class="flex-1 truncate">Verificar Modelo...</span>
                        <span class="text-xs text-gray-500 italic">Previo</span>
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= EJECUCIÓN DEL ANÁLISIS ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Ejecución del Análisis
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.runAnalysis()">
                        <span>▶️</span>
                        <span class="flex-1 truncate">Ejecutar Análisis</span>
                        <span class="text-xs text-gray-500 italic">F5</span>
                    </button>

                    {{-- Análisis Sísmico Dinámico (RSA) — espectro de respuesta --}}
                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.openSeismicAnalysisDialog()">
                        <span>🏗️</span>
                        <span class="flex-1 truncate">Análisis Sísmico Espectral...</span>
                        <span class="text-xs text-cyan-400 italic">RSA</span>
                    </button>

                </div>
            </x-slot>
        </x-cad.ui.menu-dropdown-item>
