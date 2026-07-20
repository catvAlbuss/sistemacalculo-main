{{-- resources/views/components/cad/menu/design.blade.php
     Menú "Diseñar" — extraído de menu-bar.blade.php (Fase 1 de la
     reestructuración). Se incluye vía @include, hereda el scope del menu-bar. --}}
        {{-- ============================================================
                                MENÚ DESIGN / DISEÑAR
        ============================================================ --}}
        <x-cad.ui.menu-dropdown-item label="Diseñar">

            {{-- ÍCONO DEL MENÚ --}}
            <x-slot name="slot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 7h6m-6 4h6m-6 4h3m-7 4h14a2 2 0 002-2V7.828a2 2 0 00-.586-1.414l-3.828-3.828A2 2 0 0015.172 2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            </x-slot>

            {{-- CONTENIDO DEL MENÚ --}}
            <x-slot name="dropdown">
                <div class="cad-menu-panel py-1" style="min-width: 320px;">

                    {{-- ================= DISEÑO DE MARCOS DE ACERO ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Diseño de Marcos de Acero
                    </div>

                    {{-- ================= STEEL FRAME DESIGN ================= --}}
                    <x-cad.ui.menu-subitem label="Steel Frame Design">
                        <span>Ⅰ</span>

                        <x-slot name="submenu">

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDesignMenuAction ? cadSystem.activateDesignMenuAction('steel-frame-select-combo') : cadSystem.showMessage?.('Design pendiente: Select Design Combo', 'warning')">
                                <span>📋</span>
                                Select Design Combo...
                            </button>

                            <div class="border-t border-gray-700 my-1"></div>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDesignMenuAction ? cadSystem.activateDesignMenuAction('steel-frame-overwrites') : cadSystem.showMessage?.('Design pendiente: View/Revise Overwrites', 'warning')">
                                <span>📝</span>
                                View/Revise Overwrites...
                            </button>

                            <div class="border-t border-gray-700 my-1"></div>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDesignMenuAction ? cadSystem.activateDesignMenuAction('steel-frame-start-check') : cadSystem.showMessage?.('Design pendiente: Start Design/Check', 'warning')">
                                <span>▶️</span>
                                Start Design/Check of Structure
                            </button>

                            <div class="border-t border-gray-700 my-1"></div>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDesignMenuAction ? cadSystem.activateDesignMenuAction('steel-frame-display-info') : cadSystem.showMessage?.('Design pendiente: Display Design Info', 'warning')">
                                <span>📊</span>
                                Display Design Info...
                            </button>

                        </x-slot>
                    </x-cad.ui.menu-subitem>

                    <div class="border-t border-gray-700 my-1"></div>

                    {{-- ================= DISEÑO DE JOIST DE ACERO ================= --}}
                    <div class="px-3 py-1 text-xs font-semibold text-blue-400 uppercase bg-gray-800">
                        Diseño de Joist de Acero
                    </div>

                    {{-- ================= STEEL JOIST DESIGN ================= --}}
                    <x-cad.ui.menu-subitem label="Steel Joist Design">
                        <span>▰</span>

                        <x-slot name="submenu">

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDesignMenuAction ? cadSystem.activateDesignMenuAction('steel-joist-select-combo') : cadSystem.showMessage?.('Steel Joist Design pendiente: Select Design Combo', 'warning')">
                                <span>📋</span>
                                Select Design Combo...
                            </button>

                            <div class="border-t border-gray-700 my-1"></div>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDesignMenuAction ? cadSystem.activateDesignMenuAction('steel-joist-overwrites') : cadSystem.showMessage?.('Steel Joist Design pendiente: View/Revise Overwrites', 'warning')">
                                <span>📝</span>
                                View/Revise Overwrites...
                            </button>

                            <div class="border-t border-gray-700 my-1"></div>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDesignMenuAction ? cadSystem.activateDesignMenuAction('steel-joist-start-using-similarity') : cadSystem.showMessage?.('Steel Joist Design pendiente: Start Design Using Similarity', 'warning')">
                                <span>▶️</span>
                                Start Design Using Similarity
                            </button>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDesignMenuAction ? cadSystem.activateDesignMenuAction('steel-joist-start-without-similarity') : cadSystem.showMessage?.('Steel Joist Design pendiente: Start Design Without Similarity', 'warning')">
                                <span>▶️</span>
                                Start Design Without Similarity
                            </button>

                            <div class="border-t border-gray-700 my-1"></div>

                            <button class="dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center gap-2 whitespace-nowrap"
                                @click.stop="cadSystem.activateDesignMenuAction ? cadSystem.activateDesignMenuAction('steel-joist-display-info') : cadSystem.showMessage?.('Steel Joist Design pendiente: Display Design Info', 'warning')">
                                <span>📊</span>
                                Display Design Info...
                            </button>

                        </x-slot>
                    </x-cad.ui.menu-subitem>

                </div>
            </x-slot>
        </x-cad.ui.menu-dropdown-item>
