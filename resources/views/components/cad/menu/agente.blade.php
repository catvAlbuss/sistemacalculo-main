{{-- resources/views/components/cad/menu/agente.blade.php
     Menú "🤖 Agente": el puente con el agente NovaCad (Predim) en un solo lugar y a la vista.
     Flujo: abrir el modelo que armó el agente → Analizar ▸ Análisis Sísmico → Revisión del agente
     (E.030) → Diseñar todas las columnas → Enviar el diseño al agente → en NovaCad «aplica el diseño».
     Los métodos viven en mixins/analysis/revisionAgente.js y mixins/io/file-io/e2k-import.js. --}}
        <x-cad.ui.menu-dropdown-item label="Agente">

            <x-slot name="slot">
                <span class="text-base leading-none" aria-hidden="true">🤖</span>
            </x-slot>

            <x-slot name="dropdown">
                <div class="cad-menu-panel py-1" style="min-width: 320px;">
                    <div class="px-3 py-1 text-xs font-semibold text-emerald-400 uppercase bg-gray-800">
                        Agente NovaCad
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 font-semibold"
                        @click.stop="cadSystem.openAgenteCadChat()">
                        <span>💬</span>
                        <span class="flex-1 truncate">Conversar con el agente</span>
                        <span class="text-xs text-emerald-400 italic">Chat</span>
                    </button>
                    <div class="border-t border-gray-700 my-1"></div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.importarModeloDelAgente({desdeMenu: true})">
                        <span>📥</span>
                        <span class="flex-1 truncate">1. Abrir el modelo del agente</span>
                        <span class="text-xs text-gray-500 italic">.e2k</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.openSeismicAnalysisDialog()">
                        <span>🏗️</span>
                        <span class="flex-1 truncate">2. Análisis sísmico espectral...</span>
                        <span class="text-xs text-cyan-400 italic">RSA</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.openRevisionAgente()">
                        <span>🔎</span>
                        <span class="flex-1 truncate">3. Revisión del agente (E.030)...</span>
                        <span class="text-xs text-emerald-400 italic">Revisar</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.disenarTodasLasColumnas()">
                        <span>🧱</span>
                        <span class="flex-1 truncate">4. Diseñar todas las columnas</span>
                        <span class="text-xs text-gray-500 italic">E.060</span>
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click.stop="cadSystem.enviarDisenoAlAgente()">
                        <span>📤</span>
                        <span class="flex-1 truncate">5. Enviar el diseño al agente</span>
                        <span class="text-xs text-emerald-400 italic">Láminas</span>
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>
                    <a href="{{ route('software.etabs2') }}" target="_blank" rel="noopener"
                       class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2">
                        <span>↩️</span>
                        <span class="flex-1 truncate">Volver a NovaCad (láminas)</span>
                        <span class="text-xs text-gray-500 italic">Predim</span>
                    </a>
                </div>
            </x-slot>
        </x-cad.ui.menu-dropdown-item>
