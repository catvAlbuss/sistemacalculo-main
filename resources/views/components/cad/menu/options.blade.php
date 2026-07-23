{{-- resources/views/components/cad/menu/options.blade.php
     Menú "Opciones" — extraído de menu-bar.blade.php (Fase 1 de la
     reestructuración). Se incluye vía @include, hereda el scope del menu-bar. --}}
        {{-- ============================================================
                                MENÚ OPTIONS / OPCIONES
        ============================================================ --}}
        <x-cad.ui.menu-dropdown-item label="Opciones">

            {{-- ÍCONO DEL MENÚ --}}
            <x-slot name="slot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.607 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                </svg>
            </x-slot>

            {{-- CONTENIDO DEL MENÚ --}}
            <x-slot name="dropdown">
                <div class="cad-menu-panel py-1" style="min-width: 340px;">

                    {{-- ================= PREFERENCIAS ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Preferencias
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateOptionsMenuAction('dimensions-tolerances')">
                        <span>📏</span>
                        Dimensiones / Tolerancias...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateOptionsMenuAction('output-decimals')">
                        <span>🔢</span>
                        Decimales de Salida...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateOptionsMenuAction('steel-frame-design')">
                        <span>🏗️</span>
                        Diseño de Marcos de Acero...
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateOptionsMenuAction('reinforcement-bar-sizes')">
                        <span>🔩</span>
                        Tamaños de Varillas de Refuerzo...
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= COLORES ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Colores
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateOptionsMenuAction('theme-dark')">
                        <span>🌙</span>
                        Lienzo Oscuro
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateOptionsMenuAction('theme-light')">
                        <span>☀️</span>
                        Lienzo Claro
                    </button>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= VENTANAS ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Ventanas
                    </div>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateOptionsMenuAction('window-one')">
                        <span>▣</span>
                        Una
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateOptionsMenuAction('window-two-vertical')">
                        <span>▥</span>
                        Dos en Mosaico Vertical
                    </button>

                    <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2"
                        @click="cadSystem.activateOptionsMenuAction('window-two-horizontal')">
                        <span>▤</span>
                        Dos en Mosaico Horizontal
                    </button>

                </div>
            </x-slot>
        </x-cad.ui.menu-dropdown-item>
