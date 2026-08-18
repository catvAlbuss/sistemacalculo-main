{{-- resources/views/components/cad/modals/frame-sections-modal.blade.php --}}
<div x-data="frameSectionsModal()"
    x-init="init()"
    x-show="open"
    x-cloak
    class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70"
    @keydown.esc.window="if(view === 'list') close()">

    <div class="bg-gray-800 rounded-lg shadow-2xl w-[850px] max-h-[90vh] overflow-hidden border border-gray-700">
        {{-- Cabecera --}}
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-900">
            <h3 class="text-lg font-semibold text-white" x-text="view === 'list' ? 'Definir Secciones de Pórtico' : (isNew ? 'Agregar Nueva Sección' : 'Modificar Sección')"></h3>
            <button @click="close()" class="text-gray-400 hover:text-white transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        {{-- Contenido --}}
        <div class="overflow-y-auto max-h-[70vh] p-4">
            {{-- VISTA LISTA DE SECCIONES --}}
            <div x-show="view === 'list'" x-cloak>
                <div class="mb-4">
                    <input type="text"
                        x-model="searchText"
                        placeholder="Escriba la propiedad a buscar..."
                        class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                </div>

                <div class="border border-gray-700 rounded-md bg-gray-900 max-h-96 overflow-y-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-gray-800 sticky top-0">
                            <tr>
                                <th class="px-4 py-2 text-left text-gray-400">Propiedad</th>
                                <th class="px-4 py-2 text-left text-gray-400">Descripción</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template x-for="section in filteredSections" :key="section.name">
                                <tr
                                    @click="selectSection(section.name)"
                                    class="border-t border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors"
                                    :class="{'bg-blue-900': selectedSectionName === section.name}">
                                    <td class="px-4 py-2 text-gray-300 font-mono" x-text="section.name"></td>
                                    <td class="px-4 py-2 text-gray-400 text-sm" x-text="section.description"></td>
                                </tr>
                            </template>
                            <tr x-show="filteredSections.length === 0">
                                <td colspan="2" class="px-4 py-8 text-center text-gray-500">
                                    No hay secciones definidas. Haga clic en "Agregar Nueva Sección"
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="mt-4 text-xs text-gray-400">Haga clic para:</div>
                <div class="mt-2 space-y-1">
                    <button @click="openImportDialog()" class="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-gray-700 rounded transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Importar Perfil W...
                    </button>
                    <button @click="openForm(true)" class="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-gray-700 rounded transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Agregar Nueva Sección...
                    </button>
                    <button @click="if(selectedSectionName) openForm(false)" class="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-gray-700 rounded transition-colors flex items-center gap-2" :class="{'opacity-50 cursor-not-allowed': !selectedSectionName}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Modificar/Mostrar Sección...
                    </button>
                    <button @click="if(selectedSectionObj?.type === 'rect') defineRebar()"
                            class="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-gray-700 rounded transition-colors flex items-center gap-2"
                            :class="{'opacity-50 cursor-not-allowed': selectedSectionObj?.type !== 'rect'}"
                            :title="selectedSectionObj && selectedSectionObj.type !== 'rect' ? 'Solo disponible para secciones rectangulares' : ''">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4h16v16H4z" />
                            <circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none" />
                            <circle cx="16" cy="8" r="1.2" fill="currentColor" stroke="none" />
                            <circle cx="8" cy="16" r="1.2" fill="currentColor" stroke="none" />
                            <circle cx="16" cy="16" r="1.2" fill="currentColor" stroke="none" />
                        </svg>
                        Definir Armado de Columna...
                    </button>
                    <button @click="if(selectedSectionName) confirmDelete()" class="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded transition-colors flex items-center gap-2" :class="{'opacity-50 cursor-not-allowed': !selectedSectionName}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar Sección
                    </button>
                </div>
            </div>

            {{-- VISTA FORMULARIO DE SECCIÓN --}}
            <div x-show="view === 'form'" x-cloak>
                <div class="flex items-center justify-between mb-4 pb-2 border-b border-gray-700">
                    <button @click="backToList()" class="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver
                    </button>
                    <span class="text-sm font-semibold text-gray-300" x-text="isNew ? 'Nueva Sección' : 'Editar Sección: ' + (editingSection?.name || '')"></span>
                    <div class="w-8"></div>
                </div>

                {{-- Nombre de la Sección --}}
                <div class="mb-4">
                    <label class="block text-xs font-semibold text-gray-400">Nombre de la Sección</label>
                    <input x-model="form.name" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                </div>

                {{-- Tipo de Sección --}}
                <div class="mb-4">
                    <label class="block text-xs font-semibold text-gray-400 mb-2">Tipo de Sección</label>
                    <div class="flex gap-4 flex-wrap">
                        <label class="flex items-center gap-2">
                            <input type="radio" value="rect" x-model="form.sectionType">
                            <span class="text-sm">Rectangular (Concreto)</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="radio" value="tee" x-model="form.sectionType">
                            <span class="text-sm">T (Concreto Tee)</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="radio" value="wf" x-model="form.sectionType">
                            <span class="text-sm">Perfil W (Ala Ancha)</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="radio" value="channel" x-model="form.sectionType">
                            <span class="text-sm">Canal (C)</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="radio" value="angle" x-model="form.sectionType">
                            <span class="text-sm">Angular (L)</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="radio" value="tube" x-model="form.sectionType">
                            <span class="text-sm">Tubo (HSS)</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="radio" value="auto" x-model="form.sectionType">
                            <span class="text-sm">Selección Automática</span>
                        </label>
                    </div>
                </div>

                {{-- Formulario para Auto Selection (estilo ETABS) --}}
                <div x-show="form.sectionType === 'auto'">
                    <div class="border-t border-gray-700 pt-3 mb-4">
                        <label class="block text-xs font-semibold text-blue-400 mb-2">Nombre de Sección Auto</label>
                        <input x-model="form.autoSectionName" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm" placeholder="A-CompBm">
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        {{-- Lista de Secciones Disponibles --}}
                        <div class="border border-gray-700 rounded-md p-2">
                            <label class="block text-xs font-semibold text-gray-400 mb-2">Seleccionar Secciones:</label>
                            <div class="border border-gray-700 rounded bg-gray-900 h-64 overflow-y-auto">
                                <div class="p-2">
                                    <template x-for="sec in availableSections" :key="sec">
                                        <div
                                            @click="toggleAvailableSection(sec)"
                                            class="px-2 py-1 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer rounded"
                                            :class="{'bg-blue-900': selectedAvailableSections.includes(sec)}">
                                            <span x-text="sec"></span>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>

                        {{-- Botones de transferencia --}}
                        <div class="flex flex-col justify-center items-center gap-4">
                            <button @click="addToAutoSelection()" class="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white text-sm">
                                Agregar →
                            </button>
                            <button @click="removeFromAutoSelection()" class="px-3 py-2 bg-red-600 hover:bg-red-500 rounded text-white text-sm">
                                ← Remover
                            </button>
                        </div>

                        {{-- Lista de Secciones Automáticas --}}
                        <div class="border border-gray-700 rounded-md p-2">
                            <label class="block text-xs font-semibold text-gray-400 mb-2">Selecciones Automáticas:</label>
                            <div class="border border-gray-700 rounded bg-gray-900 h-64 overflow-y-auto">
                                <div class="p-2">
                                    <template x-for="sec in autoSelections" :key="sec">
                                        <div
                                            @click="toggleAutoSelection(sec)"
                                            class="px-2 py-1 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer rounded"
                                            :class="{'bg-blue-900': selectedAutoSelections.includes(sec)}">
                                            <span x-text="sec"></span>
                                        </div>
                                    </template>
                                    <div x-show="autoSelections.length === 0" class="text-center text-gray-500 py-4">
                                        No hay secciones seleccionadas
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-4 grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-gray-400">Sección Inicial</label>
                            <input x-model="form.startingSection" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-400">Sección Mediana</label>
                            <select x-model="form.medianSection" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                                <option value="">Ninguna</option>
                                <template x-for="sec in autoSelections" :key="sec">
                                    <option :value="sec" x-text="sec"></option>
                                </template>
                            </select>
                        </div>
                    </div>

                    <div class="mt-4">
                        <label class="flex items-center gap-2">
                            <input type="checkbox" x-model="form.overwrite">
                            <span class="text-sm">Sobrescribir secciones existentes</span>
                        </label>
                    </div>
                </div>

                {{-- Formulario para Sección Rectangular de Concreto --}}
                <div x-show="form.sectionType === 'rect'">
                    <div class="border-t border-gray-700 pt-3 mb-4">
                        <label class="block text-xs font-semibold text-blue-400 mb-2">Sección Rectangular de Concreto</label>

                        {{-- Material --}}
                        <div class="mb-3">
                            <label class="block text-xs text-gray-400">Material</label>
                            <select x-model="form.rectMaterial" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                                <option value="">-- Seleccionar material --</option>
                                <template x-for="mat in materialsList" :key="mat.name">
                                    <option :value="mat.name" x-text="mat.name + (mat.descripcion ? ' (' + mat.descripcion + ')' : '')"></option>
                                </template>
                            </select>
                        </div>

                        {{-- Dimensiones (en la unidad de longitud activa del footer) --}}
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs text-gray-400" x-text="'Ancho, b (' + unitLabels.length + ')'"></label>
                                <input type="number" step="any" x-model.number="dispRectB" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400" x-text="'Peralte, h (' + unitLabels.length + ')'"></label>
                                <input type="number" step="any" x-model.number="dispRectH" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                            </div>
                        </div>

                        {{-- Gráfico de la sección con ejes locales 2 (peralte) y 3 (ancho), como ETABS --}}
                        <div class="mt-3 p-2 bg-gray-900 rounded border border-gray-700 flex items-center justify-center">
                            <svg viewBox="0 0 230 190" class="w-full" style="max-height:190px">
                                <defs>
                                    <marker id="fs-arr2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                                        <path d="M0,0 L6,3 L0,6 Z" fill="#22c55e"/>
                                    </marker>
                                    <marker id="fs-arr3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                                        <path d="M0,0 L6,3 L0,6 Z" fill="#3b82f6"/>
                                    </marker>
                                </defs>
                                {{-- Sección (peralte h = vertical, ancho b = horizontal) --}}
                                <rect :x="secBox.x" :y="secBox.y" :width="secBox.W" :height="secBox.H"
                                    fill="#374151" stroke="#9ca3af" stroke-width="1.5" rx="2"/>
                                {{-- Barras de refuerzo (decorativas). x-for no sirve en SVG → x-html. --}}
                                <g x-html="barsSvg"></g>
                                {{-- Eje 2 (verde, vertical = peralte) --}}
                                <line :x1="secBox.cx" :y1="secBox.cy" :x2="secBox.cx" y2="16"
                                    stroke="#22c55e" stroke-width="2" marker-end="url(#fs-arr2)"/>
                                <text :x="secBox.cx + 6" y="24" fill="#22c55e" font-size="13" font-weight="bold">2</text>
                                {{-- Eje 3 (azul, horizontal = ancho) --}}
                                <line :x1="secBox.cx" :y1="secBox.cy" x2="16" :y2="secBox.cy"
                                    stroke="#3b82f6" stroke-width="2" marker-end="url(#fs-arr3)"/>
                                <text x="22" :y="secBox.cy - 6" fill="#3b82f6" font-size="13" font-weight="bold">3</text>
                                {{-- Cotas --}}
                                <text :x="secBox.cx" :y="secBox.y + secBox.H + 14" fill="#94a3b8" font-size="9" text-anchor="middle"
                                    x-text="'b = ' + dispRectB + ' ' + unitLabels.length + ' (eje 3)'"></text>
                                <text x="6" :y="secBox.cy + 30" fill="#94a3b8" font-size="9"
                                    x-text="'h = ' + dispRectH + ' ' + unitLabels.length + ' (eje 2)'"></text>
                            </svg>
                        </div>

                        {{-- Propiedades calculadas (solo lectura, en la unidad activa) --}}
                        <div class="mt-3 p-2 bg-gray-900 rounded border border-gray-700">
                            <div class="text-xs text-gray-400 mb-1">Propiedades calculadas:</div>
                            <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-300 font-mono">
                                <span>A = <span x-text="rectPropsDisp.A"></span> <span x-text="unitLabels.area"></span></span>
                                <span>J ≈ <span x-text="rectPropsDisp.J"></span> <span x-text="unitLabels.inertia"></span></span>
                                <span>I33 (<span x-text="ejeMayorMenor(rectPropsDisp, 'Iz')"></span>, eje 3) = <span x-text="rectPropsDisp.Iz"></span> <span x-text="unitLabels.inertia"></span></span>
                                <span>I22 (<span x-text="ejeMayorMenor(rectPropsDisp, 'Iy')"></span>, eje 2) = <span x-text="rectPropsDisp.Iy"></span> <span x-text="unitLabels.inertia"></span></span>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- Formulario para T (Concrete Tee) estilo ETABS --}}
                <div x-show="form.sectionType === 'tee'">
                    <div class="border-t border-gray-700 pt-3 mb-4">
                        <label class="block text-xs font-semibold text-blue-400 mb-2">T (Concreto Tee) — dimensiones en cm</label>

                        {{-- Material --}}
                        <div class="mb-3">
                            <label class="block text-xs text-gray-400">Material</label>
                            <select x-model="form.teeMaterial" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                                <option value="">-- Seleccionar material --</option>
                                <template x-for="mat in materialsList" :key="mat.name">
                                    <option :value="mat.name" x-text="mat.name + (mat.descripcion ? ' (' + mat.descripcion + ')' : '')"></option>
                                </template>
                            </select>
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs text-gray-400">Peralte total, D (cm)</label>
                                <input type="number" step="0.1" x-model.number="form.teeDepth" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400">Ancho de ala, B (cm)</label>
                                <input type="number" step="0.1" x-model.number="form.teeWidth" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400">Espesor de ala, TF (cm)</label>
                                <input type="number" step="0.1" x-model.number="form.teeFlangeThick" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400">Espesor de alma en ala, TW (cm)</label>
                                <input type="number" step="0.1" x-model.number="form.teeWebThick" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400">Espesor de alma en punta, TWB (cm)</label>
                                <input type="number" step="0.1" x-model.number="form.teeWebTipThick" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                            </div>
                        </div>

                        {{-- Gráfico de la T (ala arriba, alma abajo; ejes 2=peralte, 3=ancho) --}}
                        <div class="mt-3 p-2 bg-gray-900 rounded border border-gray-700 flex items-center justify-center">
                            <svg viewBox="0 0 230 190" class="w-full" style="max-height:170px">
                                <rect :x="teeBox.flangeX" :y="teeBox.flangeY" :width="teeBox.flangeW" :height="teeBox.flangeH"
                                    fill="#374151" stroke="#9ca3af" stroke-width="1.5"/>
                                <rect :x="teeBox.webX" :y="teeBox.webY" :width="teeBox.webW" :height="teeBox.webH"
                                    fill="#374151" stroke="#9ca3af" stroke-width="1.5"/>
                                <line :x1="teeBox.cx" :y1="teeBox.cy" :x2="teeBox.cx" y2="16"
                                    stroke="#22c55e" stroke-width="2"/>
                                <text :x="teeBox.cx + 6" y="24" fill="#22c55e" font-size="13" font-weight="bold">2</text>
                                <line :x1="teeBox.cx" :y1="teeBox.cy" x2="16" :y2="teeBox.cy"
                                    stroke="#3b82f6" stroke-width="2"/>
                                <text x="22" :y="teeBox.cy - 6" fill="#3b82f6" font-size="13" font-weight="bold">3</text>
                            </svg>
                        </div>

                        {{-- Propiedades calculadas (solo lectura, unidad activa) --}}
                        <div class="mt-3 p-2 bg-gray-900 rounded border border-gray-700">
                            <div class="text-xs text-gray-400 mb-1">Propiedades calculadas:</div>
                            <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-300 font-mono">
                                <span>A = <span x-text="teePropsDisp.A"></span> <span x-text="unitLabels.area"></span></span>
                                <span>J ≈ <span x-text="teePropsDisp.J"></span> <span x-text="unitLabels.inertia"></span></span>
                                <span>I33 (<span x-text="ejeMayorMenor(teePropsDisp, 'Iz')"></span>, eje 3) = <span x-text="teePropsDisp.Iz"></span> <span x-text="unitLabels.inertia"></span></span>
                                <span>I22 (<span x-text="ejeMayorMenor(teePropsDisp, 'Iy')"></span>, eje 2) = <span x-text="teePropsDisp.Iy"></span> <span x-text="unitLabels.inertia"></span></span>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- Formulario para Perfil W (Ala Ancha) --}}
                <div x-show="form.sectionType === 'wf'">
                    <div class="border-t border-gray-700 pt-3 mb-4">
                        <label class="block text-xs font-semibold text-blue-400 mb-2">Perfil W (Ala Ancha) — dimensiones en cm</label>

                        {{-- Material --}}
                        <div class="mb-3">
                            <label class="block text-xs text-gray-400">Material</label>
                            <select x-model="form.wfMaterial" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                                <option value="">-- Seleccionar material --</option>
                                <template x-for="mat in materialsList" :key="mat.name">
                                    <option :value="mat.name" x-text="mat.name + (mat.descripcion ? ' (' + mat.descripcion + ')' : '')"></option>
                                </template>
                            </select>
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs text-gray-400">Altura, d (cm)</label>
                                <input type="number" step="0.01" x-model.number="form.wfDepth" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400">Ancho de Ala, bf (cm)</label>
                                <input type="number" step="0.01" x-model.number="form.wfFlangeWidth" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400">Espesor de Ala, tf (cm)</label>
                                <input type="number" step="0.01" x-model.number="form.wfFlangeThick" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400">Espesor de Alma, tw (cm)</label>
                                <input type="number" step="0.01" x-model.number="form.wfWebThick" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400">Peso (kg/m)</label>
                                <input type="number" step="0.1" x-model.number="form.wfWeight" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                            </div>
                        </div>

                        {{-- Propiedades calculadas (solo lectura) --}}
                        <div class="mt-3 p-2 bg-gray-900 rounded border border-gray-700">
                            <div class="text-xs text-gray-400 mb-1">Propiedades calculadas (SI):</div>
                            <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-300 font-mono">
                                <span>A = <span x-text="wfProps.A.toFixed(6)"></span> m²</span>
                                <span>J ≈ <span x-text="wfProps.J.toFixed(8)"></span> m⁴</span>
                                <span>Iz (fuerte) = <span x-text="wfProps.Iz.toFixed(8)"></span> m⁴</span>
                                <span>Iy (débil) = <span x-text="wfProps.Iy.toFixed(8)"></span> m⁴</span>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- Formulario para Tubo (HSS) — Steel Tube estilo ETABS --}}
                <div x-show="form.sectionType === 'tube'">
                    <div class="border-t border-gray-700 pt-3 mb-4">
                        <label class="block text-xs font-semibold text-blue-400 mb-2">Tubo (HSS) — dimensiones en cm</label>

                        {{-- Material (típicamente acero) --}}
                        <div class="mb-3">
                            <label class="block text-xs text-gray-400">Material</label>
                            <select x-model="form.tubeMaterial" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                                <option value="">-- Seleccionar material --</option>
                                <template x-for="mat in materialsList" :key="mat.name">
                                    <option :value="mat.name" x-text="mat.name + (mat.descripcion ? ' (' + mat.descripcion + ')' : '')"></option>
                                </template>
                            </select>
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs text-gray-400">Peralte total, D (cm)</label>
                                <input type="number" step="0.01" x-model.number="form.tubeDepth" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400">Ancho total, B (cm)</label>
                                <input type="number" step="0.01" x-model.number="form.tubeWidth" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400">Espesor de ala, tf (cm)</label>
                                <input type="number" step="0.001" x-model.number="form.tubeFlangeThick" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400">Espesor de alma, tw (cm)</label>
                                <input type="number" step="0.001" x-model.number="form.tubeWebThick" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                            </div>
                        </div>

                        {{-- Gráfico del tubo hueco (ejes locales 2=peralte, 3=ancho) --}}
                        <div class="mt-3 p-2 bg-gray-900 rounded border border-gray-700 flex items-center justify-center">
                            <svg viewBox="0 0 230 190" class="w-full" style="max-height:170px">
                                <rect :x="tubeBox.x" :y="tubeBox.y" :width="tubeBox.W" :height="tubeBox.H"
                                    fill="#374151" stroke="#9ca3af" stroke-width="1.5"/>
                                <rect :x="tubeBox.ix" :y="tubeBox.iy" :width="tubeBox.iW" :height="tubeBox.iH"
                                    fill="#0b1220" stroke="#6b7280" stroke-width="1"/>
                                <line :x1="tubeBox.cx" :y1="tubeBox.cy" :x2="tubeBox.cx" y2="16"
                                    stroke="#22c55e" stroke-width="2"/>
                                <text :x="tubeBox.cx + 6" y="24" fill="#22c55e" font-size="13" font-weight="bold">2</text>
                                <line :x1="tubeBox.cx" :y1="tubeBox.cy" x2="16" :y2="tubeBox.cy"
                                    stroke="#3b82f6" stroke-width="2"/>
                                <text x="22" :y="tubeBox.cy - 6" fill="#3b82f6" font-size="13" font-weight="bold">3</text>
                            </svg>
                        </div>

                        {{-- Propiedades calculadas (solo lectura, unidad activa) --}}
                        <div class="mt-3 p-2 bg-gray-900 rounded border border-gray-700">
                            <div class="text-xs text-gray-400 mb-1">Propiedades calculadas:</div>
                            <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-300 font-mono">
                                <span>A = <span x-text="tubePropsDisp.A"></span> <span x-text="unitLabels.area"></span></span>
                                <span>J ≈ <span x-text="tubePropsDisp.J"></span> <span x-text="unitLabels.inertia"></span></span>
                                <span>I33 (<span x-text="ejeMayorMenor(tubePropsDisp, 'Iz')"></span>, eje 3) = <span x-text="tubePropsDisp.Iz"></span> <span x-text="unitLabels.inertia"></span></span>
                                <span>I22 (<span x-text="ejeMayorMenor(tubePropsDisp, 'Iy')"></span>, eje 2) = <span x-text="tubePropsDisp.Iy"></span> <span x-text="unitLabels.inertia"></span></span>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- Color --}}
                <div class="mt-4">
                    <label class="block text-xs font-semibold text-gray-400">Color de Visualización</label>
                    <div class="flex items-center gap-2">
                        <input type="color" x-model="form.color" class="w-10 h-8 rounded border border-gray-600">
                        <span class="text-xs text-gray-400">Color</span>
                    </div>
                </div>
            </div>
        </div>

        {{-- Pie --}}
        <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-gray-900">
            <button @click="handleCancel()" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition text-sm">
                Cancelar
            </button>
            <button @click="save()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition text-sm">
                OK
            </button>
        </div>
    </div>

    {{-- Modal de confirmación --}}
    <div x-show="showConfirmModal" x-cloak class="fixed inset-0 z-[300] flex items-center justify-center bg-black/80" @click.away="showConfirmModal = false">
        <div class="bg-gray-800 rounded-lg shadow-2xl w-96 border border-gray-700">
            <div class="px-4 py-3 border-b border-gray-700 bg-gray-900">
                <h3 class="text-lg font-semibold text-white">Confirmar Eliminación</h3>
            </div>
            <div class="p-4">
                <p class="text-gray-300" x-text="'¿Está seguro de eliminar la sección ' + sectionToDelete + '?'"></p>
                <p class="text-xs text-red-400 mt-2">Esta acción no se puede deshacer.</p>
            </div>
            <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-gray-900">
                <button @click="showConfirmModal = false" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">Cancelar</button>
                <button @click="performDelete" class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded text-sm">Eliminar</button>
            </div>
        </div>
    </div>

    {{-- Modal de importación --}}
    <div x-show="showImportModal" x-cloak class="fixed inset-0 z-[300] flex items-center justify-center bg-black/80" @click.away="showImportModal = false">
        <div class="bg-gray-800 rounded-lg shadow-2xl w-96 border border-gray-700">
            <div class="px-4 py-3 border-b border-gray-700 bg-gray-900">
                <h3 class="text-lg font-semibold text-white">Importar Perfil W</h3>
            </div>
            <div class="p-4 max-h-96 overflow-y-auto">
                <p class="text-gray-300 text-sm mb-3">Seleccione el perfil a importar:</p>
                <div class="space-y-2">
                    <template x-for="wf in wideFlangeList" :key="wf.name">
                        <button @click="importWideFlange(wf)" class="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm">
                            <span x-text="wf.name"></span>
                            <span class="text-xs text-gray-400 ml-2" x-text="wf.weight + ' kg/m'"></span>
                        </button>
                    </template>
                </div>
            </div>
            <div class="flex justify-end px-4 py-3 border-t border-gray-700 bg-gray-900">
                <button @click="showImportModal = false" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">Cancelar</button>
            </div>
        </div>
    </div>

    {{-- Toast --}}
    <div x-show="showToast" x-cloak class="fixed bottom-5 right-5 z-[300]" x-transition.duration.300ms>
        <div class="px-4 py-3 rounded-lg shadow-lg text-white text-sm" :class="toastType === 'error' ? 'bg-red-600' : (toastType === 'warning' ? 'bg-yellow-600' : 'bg-green-600')">
            <span x-text="toastMessage"></span>
        </div>
    </div>

    <style>
        [x-cloak] {
            display: none !important;
        }
    </style>
</div>

<script>
    function frameSectionsModal() {
        return {
            open: false,
            view: 'list',
            isNew: true,
            searchText: '',

            sections: [],
            selectedSectionName: null,
            editingSection: null,

            showConfirmModal: false,
            sectionToDelete: null,
            showImportModal: false,

            showToast: false,
            toastMessage: '',
            toastType: 'success',
            toastTimeout: null,

            // Auto selection
            availableSections: [
                'HSS4X.237', 'HSS4X.250', 'HSS5X.250', 'HSS5X.258', 'HSS5X.312',
                'HSS5X.375', 'HSS5X.500', 'HSS6X.250', 'HSS6X.280', 'HSS6X.312',
                'W10X12', 'W10X15', 'W10X17', 'W10X19', 'W12X14',
                'W12X16', 'W12X19', 'W12X22', 'W12X26', 'W14X22'
            ],
            autoSelections: [],
            selectedAvailableSections: [],
            selectedAutoSelections: [],

            // Materiales disponibles (para secciones de concreto)
            materialsList: [],

            wideFlangeList: [{
                    name: 'W10X12',
                    weight: 12,
                    depth: 9.87,
                    flangeWidth: 3.96,
                    flangeThick: 0.19,
                    webThick: 0.19,
                    area: 3.54
                },
                {
                    name: 'W10X15',
                    weight: 15,
                    depth: 9.99,
                    flangeWidth: 4.00,
                    flangeThick: 0.23,
                    webThick: 0.23,
                    area: 4.41
                },
                {
                    name: 'W10X17',
                    weight: 17,
                    depth: 10.11,
                    flangeWidth: 4.01,
                    flangeThick: 0.27,
                    webThick: 0.24,
                    area: 5.01
                },
                {
                    name: 'W10X19',
                    weight: 19,
                    depth: 10.24,
                    flangeWidth: 4.02,
                    flangeThick: 0.31,
                    webThick: 0.25,
                    area: 5.62
                },
                {
                    name: 'W12X14',
                    weight: 14,
                    depth: 11.91,
                    flangeWidth: 3.97,
                    flangeThick: 0.20,
                    webThick: 0.20,
                    area: 4.16
                },
                {
                    name: 'W12X16',
                    weight: 16,
                    depth: 11.99,
                    flangeWidth: 3.99,
                    flangeThick: 0.22,
                    webThick: 0.22,
                    area: 4.71
                },
                {
                    name: 'W12X19',
                    weight: 19,
                    depth: 12.16,
                    flangeWidth: 4.01,
                    flangeThick: 0.26,
                    webThick: 0.24,
                    area: 5.57
                },
                {
                    name: 'W12X22',
                    weight: 22,
                    depth: 12.31,
                    flangeWidth: 4.03,
                    flangeThick: 0.30,
                    webThick: 0.26,
                    area: 6.48
                },
                {
                    name: 'W12X26',
                    weight: 26,
                    depth: 12.50,
                    flangeWidth: 4.05,
                    flangeThick: 0.35,
                    webThick: 0.23,
                    area: 7.68
                },
                {
                    name: 'W14X22',
                    weight: 22,
                    depth: 13.74,
                    flangeWidth: 5.00,
                    flangeThick: 0.34,
                    webThick: 0.24,
                    area: 6.49
                }
            ],

            form: {
                name: 'W10X12',
                sectionType: 'wf',
                autoSectionName: 'A-CompBm',
                startingSection: '',
                medianSection: '',
                overwrite: false,
                wfDepth: 9.87,
                wfFlangeWidth: 3.96,
                wfFlangeThick: 0.19,
                wfWebThick: 0.19,
                wfWeight: 12,
                wfArea: 3.54,
                wfMaterial: '',
                // Sección rectangular de concreto (b, h en cm)
                rectB: 30,
                rectH: 40,
                rectMaterial: '',
                // Sección tubo (HSS) — dimensiones en cm; el tubo típico de acero
                // (ETABS Steel Tube): peralte × ancho × espesor de pared.
                tubeDepth: 10,        // cm (Total Depth)
                tubeWidth: 10,        // cm (Total Width)
                tubeFlangeThick: 0.3, // cm (espesor pared arriba/abajo)
                tubeWebThick: 0.3,    // cm (espesor pared lados)
                tubeMaterial: '',
                // Sección T (Concrete Tee) — dimensiones en cm. Ala superior
                // (ancho × espesor) + alma debajo. Estilo ETABS Concrete Tee.
                teeDepth: 50,          // cm (Total Depth)
                teeWidth: 70,          // cm (Total Width = ancho del ala)
                teeFlangeThick: 30,    // cm (Flange Thickness)
                teeWebThick: 30,       // cm (Web Thickness At Flange)
                teeWebTipThick: 30,    // cm (Web Thickness At Tip)
                teeMaterial: '',
                color: '#88ffaa'
            },

            // =====================================================
            // UNIDADES DE VISUALIZACIÓN (window.cadUnits, selector del footer)
            // b/h se ALMACENAN siempre en cm (convención interna); los inputs
            // muestran/leen en la unidad de longitud elegida (m o cm).
            // =====================================================
            unitsVersion: 0,

            get unitLabels() {
                this.unitsVersion;
                return window.cadUnits?.labels?.() || { length: 'cm', area: 'cm²', inertia: 'cm⁴' };
            },

            get dispRectB() { this.unitsVersion; return window.cadUnits ? window.cadUnits.lenCmToDisp(this.form.rectB) : Number(this.form.rectB) || 0; },
            set dispRectB(v) { this.form.rectB = window.cadUnits ? window.cadUnits.lenDispToCm(v) : Number(v) || 0; },

            get dispRectH() { this.unitsVersion; return window.cadUnits ? window.cadUnits.lenCmToDisp(this.form.rectH) : Number(this.form.rectH) || 0; },
            set dispRectH(v) { this.form.rectH = window.cadUnits ? window.cadUnits.lenDispToCm(v) : Number(v) || 0; },

            // Propiedades calculadas convertidas a la unidad de longitud activa.
            /**
             * Rotulo "mayor"/"menor" para una inercia, comparando los VALORES
             * reales en vez de asumir que I33 siempre es la mayor. Con una
             * seccion mas ancha que alta (b > h) la mayor es I22, y el rotulo
             * fijo anterior decia lo contrario. Los valores nunca estuvieron
             * mal; solo el rotulo.
             */
            ejeMayorMenor(props, clave) {
                const iz = parseFloat(props?.Iz);
                const iy = parseFloat(props?.Iy);
                if (!Number.isFinite(iz) || !Number.isFinite(iy)) return '';
                if (Math.abs(iz - iy) < 1e-12) return 'iguales';
                const mayorEsIz = iz > iy;
                return (clave === 'Iz') === mayorEsIz ? 'mayor' : 'menor';
            },

            get rectPropsDisp() {
                this.unitsVersion;
                const p = this.rectProps;
                const u = window.cadUnits;
                if (!u) return { A: p.A, Iz: p.Iz, Iy: p.Iy, J: p.J };
                return {
                    A: u.areaM2ToDisp(p.A),
                    Iz: u.inertiaM4ToDisp(p.Iz),
                    Iy: u.inertiaM4ToDisp(p.Iy),
                    J: u.inertiaM4ToDisp(p.J),
                };
            },

            // Propiedades geométricas de la sección rectangular, calculadas en vivo (en SI).
            // b, h se ingresan en cm → se convierten a m. A=b·h, Iz=b·h³/12 (eje mayor),
            // Iy=h·b³/12 (eje menor), J = constante de torsión de Saint-Venant para rectángulo.
            get rectProps() {
                const b = (Number(this.form.rectB) || 0) / 100; // m
                const h = (Number(this.form.rectH) || 0) / 100; // m
                if (b <= 0 || h <= 0) return { A: 0, Iz: 0, Iy: 0, J: 0 };
                const A = b * h;
                const Iz = (b * Math.pow(h, 3)) / 12; // flexión con h como peralte
                const Iy = (h * Math.pow(b, 3)) / 12; // flexión con b como peralte
                // Torsión: J = lng·crt³·[1/3 − 0.21·(crt/lng)·(1 − crt⁴/(12·lng⁴))], lng≥crt
                const lng = Math.max(b, h);
                const crt = Math.min(b, h);
                const r = crt / lng;
                const J = lng * Math.pow(crt, 3) * (1 / 3 - 0.21 * r * (1 - Math.pow(r, 4) / 12));
                return { A, Iz, Iy, J };
            },

            // Propiedades de un TUBO rectangular hueco (HSS/Steel Tube), en SI.
            // Dimensiones en cm → m. D=peralte, B=ancho, tf=espesor arriba/abajo,
            // tw=espesor lados. Sección hueca = exterior D×B menos interior.
            // Iz (eje 3, mayor) usa D³; Iy (eje 2) usa B³. J: fórmula de sección
            // cerrada de pared delgada J = 4·Am²·t / perímetro medio (aprox.).
            get tubeProps() {
                const D = (Number(this.form.tubeDepth) || 0) / 100;
                const B = (Number(this.form.tubeWidth) || 0) / 100;
                const tf = (Number(this.form.tubeFlangeThick) || 0) / 100;
                const tw = (Number(this.form.tubeWebThick) || 0) / 100;
                if (D <= 0 || B <= 0 || tf <= 0 || tw <= 0) return { A: 0, Iz: 0, Iy: 0, J: 0 };
                const Di = Math.max(0, D - 2 * tf);
                const Bi = Math.max(0, B - 2 * tw);
                const A = B * D - Bi * Di;
                const Iz = (B * Math.pow(D, 3)) / 12 - (Bi * Math.pow(Di, 3)) / 12;
                const Iy = (D * Math.pow(B, 3)) / 12 - (Di * Math.pow(Bi, 3)) / 12;
                // Torsión (Bredt, pared delgada cerrada): Am = área encerrada por la
                // línea media; t medio; perímetro medio. Cae con precisión razonable
                // para paredes delgadas típicas de HSS.
                const t = (tf + tw) / 2;
                const Am = (D - tf) * (B - tw);
                const pm = 2 * ((D - tf) + (B - tw));
                const J = pm > 0 ? (4 * Am * Am * t) / pm : 0;
                return { A, Iz, Iy, J };
            },

            get tubePropsDisp() {
                this.unitsVersion;
                const p = this.tubeProps;
                const u = window.cadUnits;
                if (!u) return { A: p.A, Iz: p.Iz, Iy: p.Iy, J: p.J };
                return {
                    A: u.areaM2ToDisp(p.A),
                    Iz: u.inertiaM4ToDisp(p.Iz),
                    Iy: u.inertiaM4ToDisp(p.Iy),
                    J: u.inertiaM4ToDisp(p.J),
                };
            },

            // Propiedades de una sección T (Tee) de concreto, en SI. Dimensiones
            // en cm → m. Ala superior (ancho B × espesor TF) + alma debajo
            // (altura D−TF, ancho promedio de TW y TWB). Iz=eje fuerte (usa D),
            // Iy=eje débil (usa B). J por suma de rectángulos (sección abierta).
            get teeProps() {
                const D = (Number(this.form.teeDepth) || 0) / 100;
                const B = (Number(this.form.teeWidth) || 0) / 100;
                const TF = (Number(this.form.teeFlangeThick) || 0) / 100;
                const TW = (Number(this.form.teeWebThick) || 0) / 100;
                const TWB = (Number(this.form.teeWebTipThick) || 0) / 100 || TW;
                const tw = (TW + TWB) / 2;
                if (D <= 0 || B <= 0 || TF <= 0 || tw <= 0 || TF >= D || tw > B) return { A: 0, Iz: 0, Iy: 0, J: 0 };
                const hw = D - TF;
                const Af = B * TF, Aw = tw * hw;
                const A = Af + Aw;
                const yf = TF / 2, yw = TF + hw / 2;
                const yc = (Af * yf + Aw * yw) / A;
                const Iz = (B * Math.pow(TF, 3)) / 12 + Af * Math.pow(yc - yf, 2)
                    + (tw * Math.pow(hw, 3)) / 12 + Aw * Math.pow(yc - yw, 2);
                const Iy = (TF * Math.pow(B, 3)) / 12 + (hw * Math.pow(tw, 3)) / 12;
                const J = (B * Math.pow(TF, 3) + hw * Math.pow(tw, 3)) / 3;
                return { A, Iz, Iy, J };
            },

            get teePropsDisp() {
                this.unitsVersion;
                const p = this.teeProps;
                const u = window.cadUnits;
                if (!u) return { A: p.A, Iz: p.Iz, Iy: p.Iy, J: p.J };
                return {
                    A: u.areaM2ToDisp(p.A),
                    Iz: u.inertiaM4ToDisp(p.Iz),
                    Iy: u.inertiaM4ToDisp(p.Iy),
                    J: u.inertiaM4ToDisp(p.J),
                };
            },

            // Geometría del gráfico de la T (ala arriba + alma abajo), como ETABS.
            get teeBox() {
                const D = Number(this.form.teeDepth) || 1;      // peralte total (vertical)
                const B = Number(this.form.teeWidth) || 1;      // ancho ala (horizontal)
                const TF = Number(this.form.teeFlangeThick) || 0;
                const tw = ((Number(this.form.teeWebThick) || 0) + (Number(this.form.teeWebTipThick) || 0)) / 2 || 1;
                const m = Math.max(B, D) || 1;
                const W = 120 * B / m, H = 120 * D / m;
                const cx = 120, cy = 100;
                const x = cx - W / 2, yTop = cy - H / 2;
                const fH = H * TF / D;                 // altura del ala (px)
                const wW = W * tw / B;                 // ancho del alma (px)
                return { cx, cy, flangeX: x, flangeY: yTop, flangeW: W, flangeH: fH,
                         webX: cx - wW / 2, webY: yTop + fH, webW: wW, webH: H - fH };
            },

            // Geometría del gráfico del tubo (exterior D×B + hueco interior).
            get tubeBox() {
                const D = Number(this.form.tubeDepth) || 1; // peralte (vertical)
                const B = Number(this.form.tubeWidth) || 1; // ancho (horizontal)
                const tf = Number(this.form.tubeFlangeThick) || 0;
                const tw = Number(this.form.tubeWebThick) || 0;
                const m = Math.max(B, D) || 1;
                const W = 120 * B / m, H = 120 * D / m;
                const cx = 120, cy = 100;
                const x = cx - W / 2, y = cy - H / 2;
                const iW = Math.max(0, W * (B - 2 * tw) / B);
                const iH = Math.max(0, H * (D - 2 * tf) / D);
                const ix = cx - iW / 2, iy = cy - iH / 2;
                return { W, H, x, y, cx, cy, iW, iH, ix, iy };
            },

            // Posiciones de armado REAL (cm, centroide en 0,0) para la sección que
            // se está EDITANDO — nunca para una nueva sección sin guardar (isNew).
            // Dos fuentes posibles, mismo orden de prioridad que rcColumnDesign.js:
            // (1) armado real parseado del .e2k (CONCRETESECTION/PATTERN), (2)
            // armado definido a mano (Definir Armado de Columna...). Si no hay
            // ninguno (p.ej. una VIGA, o una columna aún sin armar), no se dibuja
            // nada — ETABS tampoco dibuja armado ahí hasta que existe uno real;
            // antes esto mostraba 8 puntos fijos como decoración para CUALQUIER
            // sección rectangular, incluidas vigas, lo cual era engañoso.
            get sectionRebarPoints() {
                if (this.isNew || !this.editingSection?.name || !window.cadSystem) return [];
                const sec = this.editingSection;
                const b = Number(this.form.rectB) || 0;
                const h = Number(this.form.rectH) || 0;

                if (sec.rebarPattern?.type === 'rectangular' && sec.longBarDiameter > 0) {
                    return window.cadSystem._columnRebarBarPositions?.({
                        b, h, cover: sec.cover || 0,
                        n2: sec.rebarPattern.n2, n3: sec.rebarPattern.n3,
                        longBarDiameterCm: sec.longBarDiameter * 100, // m -> cm
                        confineBarDiameterCm: (sec.confineBarDiameter || 0) * 100,
                    }) || [];
                }

                const manual = window.cadSystem.manualColumnRebar?.[sec.name];
                if (manual) {
                    return window.cadSystem.columnRebarPreviewPoints?.(manual) || [];
                }

                return [];
            },

            // Geometría del gráfico de la sección (ejes locales 2=peralte, 3=ancho).
            // El centro de la sección está en (cx, cy); el peralte h va en vertical
            // (eje 2 ↑) y el ancho b en horizontal (eje 3 ←), como en ETABS.
            get secBox() {
                const b = Number(this.form.rectB) || 1; // ancho (horizontal)
                const h = Number(this.form.rectH) || 1; // peralte (vertical)
                const m = Math.max(b, h) || 1;
                const W = 120 * b / m;   // px
                const H = 120 * h / m;   // px
                const cx = 120, cy = 100;
                const x = cx - W / 2, y = cy - H / 2;
                const pxPerUnit = 120 / m;
                const bars = this.sectionRebarPoints.map((p, id) => ({
                    id,
                    x: cx + p.x * pxPerUnit,
                    y: cy - p.y * pxPerUnit,
                }));
                return { W, H, x, y, cx, cy, bars };
            },

            // Barras de refuerzo como string SVG (x-for no funciona dentro de <svg>).
            get barsSvg() {
                return this.secBox.bars
                    .map((d) => `<circle cx="${d.x}" cy="${d.y}" r="2.2" fill="#cbd5e1"/>`)
                    .join("");
            },

            // Propiedades de un perfil W (doble T) a partir de d, bf, tf, tw en cm.
            // Devuelve A (m²), Iz/Iy (m⁴, ejes fuerte/débil) y J (m⁴). J usa la
            // aproximación de pared delgada para secciones abiertas: J ≈ Σ b·t³ / 3.
            wfPropsFrom(dCm, bfCm, tfCm, twCm) {
                const d = (Number(dCm) || 0) / 100;   // m
                const bf = (Number(bfCm) || 0) / 100; // m
                const tf = (Number(tfCm) || 0) / 100; // m
                const tw = (Number(twCm) || 0) / 100; // m
                const hw = d - 2 * tf;                // altura libre del alma
                if (d <= 0 || bf <= 0 || tf <= 0 || tw <= 0 || hw <= 0) {
                    return { A: 0, Iz: 0, Iy: 0, J: 0 };
                }
                const A = 2 * (bf * tf) + hw * tw;
                // Iz (eje fuerte): I de la sección llena menos los dos huecos del alma.
                const Iz = (bf * Math.pow(d, 3) - (bf - tw) * Math.pow(hw, 3)) / 12;
                // Iy (eje débil): inercia de las dos alas + el alma.
                const Iy = (2 * tf * Math.pow(bf, 3) + hw * Math.pow(tw, 3)) / 12;
                // J (torsión, sección abierta de pared delgada).
                const J = (2 * bf * Math.pow(tf, 3) + hw * Math.pow(tw, 3)) / 3;
                return { A, Iz, Iy, J };
            },

            get wfProps() {
                return this.wfPropsFrom(this.form.wfDepth, this.form.wfFlangeWidth, this.form.wfFlangeThick, this.form.wfWebThick);
            },

            defaultSections: [{
                    // Columna de concreto 30x40 cm (material CONC). Props en SI (m, m⁴),
                    // calculadas con las mismas fórmulas de rectProps del modal.
                    name: "C30X40",
                    type: "rect",
                    color: "#88ffaa",
                    b: 30,
                    h: 40,
                    material: "CONC",
                    area: 0.12,
                    A: 0.12,
                    Iz: 0.0016,
                    Iy: 0.0009,
                    J: 0.0019438505859375,
                    description: "Concreto 30x40 cm (CONC)"
                },
                {
                    // Viga de concreto 30x50 cm (material CONC).
                    name: "V30X50",
                    type: "rect",
                    color: "#88aaff",
                    b: 30,
                    h: 50,
                    material: "CONC",
                    area: 0.15,
                    A: 0.15,
                    Iz: 0.003125,
                    Iy: 0.001125,
                    J: 0.0028173707999999994,
                    description: "Concreto 30x50 cm (CONC)"
                },
                {
                    name: "W10X12",
                    type: "wf",
                    weight: 12,
                    depth: 9.87,
                    flangeWidth: 3.96,
                    flangeThick: 0.19,
                    webThick: 0.19,
                    area: 3.54,
                    description: "Perfil W10X12 - 12 kg/m",
                    color: "#88ffaa"
                },
                {
                    name: "W10X15",
                    type: "wf",
                    weight: 15,
                    depth: 9.99,
                    flangeWidth: 4.00,
                    flangeThick: 0.23,
                    webThick: 0.23,
                    area: 4.41,
                    description: "Perfil W10X15 - 15 kg/m",
                    color: "#88ffaa"
                },
                {
                    name: "W10X17",
                    type: "wf",
                    weight: 17,
                    depth: 10.11,
                    flangeWidth: 4.01,
                    flangeThick: 0.27,
                    webThick: 0.24,
                    area: 5.01,
                    description: "Perfil W10X17 - 17 kg/m",
                    color: "#88ffaa"
                },
                {
                    name: "W12X14",
                    type: "wf",
                    weight: 14,
                    depth: 11.91,
                    flangeWidth: 3.97,
                    flangeThick: 0.20,
                    webThick: 0.20,
                    area: 4.16,
                    description: "Perfil W12X14 - 14 kg/m",
                    color: "#88ffaa"
                },
                {
                    name: "W12X16",
                    type: "wf",
                    weight: 16,
                    depth: 11.99,
                    flangeWidth: 3.99,
                    flangeThick: 0.22,
                    webThick: 0.22,
                    area: 4.71,
                    description: "Perfil W12X16 - 16 kg/m",
                    color: "#88ffaa"
                },
                {
                    name: "A-CompBm",
                    type: "auto",
                    autoSectionName: "A-CompBm",
                    autoSelections: ["W10X12", "W10X15", "W12X14"],
                    description: "Selección automática - Vigas de Compuesto",
                    color: "#ffaa88"
                },
                {
                    name: "A-GravBm",
                    type: "auto",
                    autoSectionName: "A-GravBm",
                    autoSelections: ["W12X16", "W12X19", "W14X22"],
                    description: "Selección automática - Vigas de Gravedad",
                    color: "#ffaa88"
                }
            ],

            init() {
                this.loadSections();
                window.addEventListener('open-frame-sections-modal', () => {
                    this.openModal();
                });

                // Refrescar inputs/etiquetas al cambiar unidades en el footer.
                window.addEventListener('cad-units-changed', () => {
                    this.unitsVersion++;
                });
            },

            loadSections() {
                if (window.cadSystem && window.cadSystem.frameSections && window.cadSystem.frameSections.sections && window.cadSystem.frameSections.sections.length > 0) {
                    this.sections = window.cadSystem.frameSections.sections;
                } else {
                    this.sections = JSON.parse(JSON.stringify(this.defaultSections));
                    if (window.cadSystem) {
                        if (!window.cadSystem.frameSections) window.cadSystem.frameSections = {};
                        window.cadSystem.frameSections.sections = this.sections;
                    }
                }
            },

            get filteredSections() {
                let filtered = this.sections;
                if (this.searchText) {
                    let search = this.searchText.toLowerCase();
                    filtered = filtered.filter(function(s) {
                        return (s.name && s.name.toLowerCase().indexOf(search) !== -1) ||
                            (s.description && s.description.toLowerCase().indexOf(search) !== -1);
                    });
                }
                return filtered;
            },

            get selectedSectionObj() {
                return this.sections.find((s) => s.name === this.selectedSectionName) || null;
            },

            /** Abre el diseñador de armado a mano (ver column-rebar-designer-modal.blade.php), keyed por NOMBRE de sección — aplica a toda columna que use esta propiedad, igual que el Section Designer de ETABS. */
            defineRebar: function() {
                const sec = this.selectedSectionObj;
                if (!sec) return;
                window.cadSystem?.openColumnRebarDesigner?.(sec.name, { b: sec.b, h: sec.h, label: sec.name });
            },

            showToastMessage: function(message, type) {
                if (this.toastTimeout) clearTimeout(this.toastTimeout);
                this.toastMessage = message;
                this.toastType = type || 'success';
                this.showToast = true;
                var self = this;
                this.toastTimeout = setTimeout(function() {
                    self.showToast = false;
                }, 2500);
            },

            openModal: function() {
                this.loadSections();
                this.loadMaterials();
                this.open = true;
                this.view = 'list';
                this.selectedSectionName = null;
                this.searchText = '';
            },

            // Trae los materiales definidos para poder asignarlos a secciones de concreto.
            loadMaterials: function() {
                if (window.cadSystem && window.cadSystem.materialProperties && Array.isArray(window.cadSystem.materialProperties.materials)) {
                    this.materialsList = window.cadSystem.materialProperties.materials;
                } else {
                    this.materialsList = [];
                }
            },

            close: function() {
                this.open = false;
                this.view = 'list';
                this.selectedSectionName = null;
                this.showConfirmModal = false;
                this.showImportModal = false;
            },

            handleCancel: function() {
                if (this.view === 'list') {
                    this.close();
                } else {
                    this.backToList();
                }
            },

            selectSection: function(name) {
                this.selectedSectionName = name;
            },

            // openForm: function(isNew) {
            //     // Si no es nuevo y no hay selección, no hacer nada
            //     if (!isNew && !this.selectedSectionName) {
            //         this.showToastMessage('Por favor seleccione una sección primero', 'warning');
            //         return;
            //     }

            //     this.isNew = isNew;
            //     this.view = 'form';

            //     if (!isNew && this.selectedSectionName) {
            //         var section = null;
            //         for (var i = 0; i < this.sections.length; i++) {
            //             if (this.sections[i].name === this.selectedSectionName) {
            //                 section = this.sections[i];
            //                 break;
            //             }
            //         }
            //         if (section) {
            //             this.editingSection = JSON.parse(JSON.stringify(section));
            //             this.form = this.sectionToForm(section);
            //             if (section.type === 'auto' && section.autoSelections) {
            //                 this.autoSelections = JSON.parse(JSON.stringify(section.autoSelections));
            //             } else {
            //                 this.autoSelections = [];
            //             }
            //         } else {
            //             this.showToastMessage('Error: No se encontró la sección seleccionada', 'error');
            //             this.backToList();
            //             return;
            //         }
            //     } else {
            //         this.editingSection = null;
            //         this.resetForm();
            //         this.autoSelections = [];
            //         this.selectedAvailableSections = [];
            //         this.selectedAutoSelections = [];
            //     }
            // },

            openForm: function(isNew) {
                // Si no es nuevo y no hay selección, no hacer nada
                if (!isNew && !this.selectedSectionName) {
                    this.showToastMessage('Por favor seleccione una sección primero', 'warning');
                    return;
                }

                this.isNew = isNew;
                this.view = 'form';

                if (!isNew && this.selectedSectionName) {
                    var section = null;
                    for (var i = 0; i < this.sections.length; i++) {
                        if (this.sections[i].name === this.selectedSectionName) {
                            section = this.sections[i];
                            break;
                        }
                    }
                    if (section) {
                        this.editingSection = JSON.parse(JSON.stringify(section));
                        this.form = this.sectionToForm(section);
                        if (section.type === 'auto' && section.autoSelections) {
                            this.autoSelections = JSON.parse(JSON.stringify(section.autoSelections));
                        } else {
                            this.autoSelections = [];
                        }
                    } else {
                        this.showToastMessage('Error: No se encontró la sección seleccionada', 'error');
                        this.backToList();
                        return;
                    }
                } else {
                    this.editingSection = null;
                    this.resetForm();
                    this.autoSelections = [];
                    this.selectedAvailableSections = [];
                    this.selectedAutoSelections = [];
                }
            },

            sectionToForm: function(section) {
                return {
                    name: section.name,
                    sectionType: section.type || 'wf',
                    autoSectionName: section.autoSectionName || 'A-CompBm',
                    startingSection: section.startingSection || '',
                    medianSection: section.medianSection || '',
                    overwrite: section.overwrite || false,
                    wfDepth: section.depth || 9.87,
                    wfFlangeWidth: section.flangeWidth || 3.96,
                    wfFlangeThick: section.flangeThick || 0.19,
                    wfWebThick: section.webThick || 0.19,
                    wfWeight: section.weight || 12,
                    wfArea: section.area || 3.54,
                    wfMaterial: section.type === 'wf' ? (section.material || '') : '',
                    rectB: section.b != null ? section.b : 30,
                    rectH: section.h != null ? section.h : 40,
                    rectMaterial: section.type === 'rect' ? (section.material || '') : '',
                    tubeDepth: section.tubeDepth != null ? section.tubeDepth : 10,
                    tubeWidth: section.tubeWidth != null ? section.tubeWidth : 10,
                    tubeFlangeThick: section.tubeFlangeThick != null ? section.tubeFlangeThick : 0.3,
                    tubeWebThick: section.tubeWebThick != null ? section.tubeWebThick : 0.3,
                    tubeMaterial: section.type === 'tube' ? (section.material || '') : '',
                    teeDepth: section.teeDepth != null ? section.teeDepth : 50,
                    teeWidth: section.teeWidth != null ? section.teeWidth : 70,
                    teeFlangeThick: section.teeFlangeThick != null ? section.teeFlangeThick : 30,
                    teeWebThick: section.teeWebThick != null ? section.teeWebThick : 30,
                    teeWebTipThick: section.teeWebTipThick != null ? section.teeWebTipThick : 30,
                    teeMaterial: section.type === 'tee' ? (section.material || '') : '',
                    color: section.color || '#88ffaa'
                };
            },

            backToList: function() {
                this.view = 'list';
                this.resetForm();
                this.autoSelections = [];
                this.selectedAvailableSections = [];
                this.selectedAutoSelections = [];
            },

            resetForm: function() {
                this.form = {
                    name: 'W10X12',
                    sectionType: 'wf',
                    autoSectionName: 'A-CompBm',
                    startingSection: '',
                    medianSection: '',
                    overwrite: false,
                    wfDepth: 9.87,
                    wfFlangeWidth: 3.96,
                    wfFlangeThick: 0.19,
                    wfWebThick: 0.19,
                    wfWeight: 12,
                    wfArea: 3.54,
                    wfMaterial: '',
                    rectB: 30,
                    rectH: 40,
                    rectMaterial: '',
                    color: '#88ffaa'
                };
            },

            toggleAvailableSection: function(sec) {
                var index = this.selectedAvailableSections.indexOf(sec);
                if (index === -1) {
                    this.selectedAvailableSections.push(sec);
                } else {
                    this.selectedAvailableSections.splice(index, 1);
                }
            },

            toggleAutoSelection: function(sec) {
                var index = this.selectedAutoSelections.indexOf(sec);
                if (index === -1) {
                    this.selectedAutoSelections.push(sec);
                } else {
                    this.selectedAutoSelections.splice(index, 1);
                }
            },

            addToAutoSelection: function() {
                for (var i = 0; i < this.selectedAvailableSections.length; i++) {
                    var sec = this.selectedAvailableSections[i];
                    if (this.autoSelections.indexOf(sec) === -1) {
                        this.autoSelections.push(sec);
                    }
                }
                this.selectedAvailableSections = [];
            },

            removeFromAutoSelection: function() {
                var newAutoSelections = [];
                for (var i = 0; i < this.autoSelections.length; i++) {
                    if (this.selectedAutoSelections.indexOf(this.autoSelections[i]) === -1) {
                        newAutoSelections.push(this.autoSelections[i]);
                    }
                }
                this.autoSelections = newAutoSelections;
                this.selectedAutoSelections = [];
            },

            save: function() {
                if (!this.form.name) {
                    this.showToastMessage('El nombre de la sección es requerido', 'error');
                    return;
                }

                var sectionToSave = {
                    name: this.form.name,
                    type: this.form.sectionType,
                    color: this.form.color,
                    description: ''
                };

                if (this.form.sectionType === 'rect') {
                    var b = Number(this.form.rectB) || 0;
                    var h = Number(this.form.rectH) || 0;
                    if (b <= 0 || h <= 0) {
                        this.showToastMessage('Ingrese ancho y peralte válidos (cm)', 'error');
                        return;
                    }
                    var p = this.rectProps; // {A, Iz, Iy, J} en SI
                    sectionToSave.b = b;            // cm (para mostrar/editar)
                    sectionToSave.h = h;            // cm
                    sectionToSave.material = this.form.rectMaterial || null;
                    sectionToSave.area = p.A;       // m²  (clave usada por el motor)
                    sectionToSave.A = p.A;          // m²
                    sectionToSave.Iz = p.Iz;        // m⁴ (eje mayor, I33)
                    sectionToSave.Iy = p.Iy;        // m⁴ (eje menor, I22)
                    sectionToSave.J = p.J;          // m⁴ (torsión)
                    sectionToSave.description = 'Concreto ' + b + 'x' + h + ' cm' +
                        (this.form.rectMaterial ? ' (' + this.form.rectMaterial + ')' : '');
                } else if (this.form.sectionType === 'tee') {
                    var tD = Number(this.form.teeDepth) || 0;
                    var tB = Number(this.form.teeWidth) || 0;
                    var tTF = Number(this.form.teeFlangeThick) || 0;
                    var tTW = Number(this.form.teeWebThick) || 0;
                    var tTWB = Number(this.form.teeWebTipThick) || tTW;
                    if (tD <= 0 || tB <= 0 || tTF <= 0 || tTW <= 0 || tTF >= tD) {
                        this.showToastMessage('Ingrese peralte, ancho y espesores válidos (TF < D)', 'error');
                        return;
                    }
                    var tp = this.teeProps; // {A, Iz, Iy, J} en SI
                    sectionToSave.teeDepth = tD;         // cm (para mostrar/editar)
                    sectionToSave.teeWidth = tB;
                    sectionToSave.teeFlangeThick = tTF;
                    sectionToSave.teeWebThick = tTW;
                    sectionToSave.teeWebTipThick = tTWB;
                    sectionToSave.material = this.form.teeMaterial || null;
                    sectionToSave.area = tp.A;           // m²
                    sectionToSave.A = tp.A;              // m²
                    sectionToSave.Iz = tp.Iz;            // m⁴ (eje mayor, I33)
                    sectionToSave.Iy = tp.Iy;            // m⁴ (eje menor, I22)
                    sectionToSave.J = tp.J;              // m⁴ (torsión)
                    sectionToSave.description = 'Concreto T ' + tD + 'x' + tB + ' cm' +
                        (this.form.teeMaterial ? ' (' + this.form.teeMaterial + ')' : '');
                } else if (this.form.sectionType === 'auto') {
                    sectionToSave.autoSectionName = this.form.autoSectionName;
                    sectionToSave.autoSelections = JSON.parse(JSON.stringify(this.autoSelections));
                    sectionToSave.startingSection = this.form.startingSection;
                    sectionToSave.medianSection = this.form.medianSection;
                    sectionToSave.overwrite = this.form.overwrite;
                    sectionToSave.description = 'Selección automática - ' + this.autoSelections.length + ' secciones';
                } else if (this.form.sectionType === 'wf') {
                    var wp = this.wfProps; // {A, Iz, Iy, J} en SI, desde d/bf/tf/tw (cm)
                    sectionToSave.depth = this.form.wfDepth;
                    sectionToSave.flangeWidth = this.form.wfFlangeWidth;
                    sectionToSave.flangeThick = this.form.wfFlangeThick;
                    sectionToSave.webThick = this.form.wfWebThick;
                    sectionToSave.weight = this.form.wfWeight;
                    sectionToSave.material = this.form.wfMaterial || null;
                    sectionToSave.area = wp.A;      // m²  (clave usada por el motor)
                    sectionToSave.A = wp.A;         // m²
                    sectionToSave.Iz = wp.Iz;       // m⁴ (eje fuerte, I33)
                    sectionToSave.Iy = wp.Iy;       // m⁴ (eje débil, I22)
                    sectionToSave.J = wp.J;         // m⁴ (torsión)
                    sectionToSave.description = 'Perfil W ' + this.form.wfDepth + 'x' + this.form.wfFlangeWidth + ' cm - ' + this.form.wfWeight + ' kg/m' +
                        (this.form.wfMaterial ? ' (' + this.form.wfMaterial + ')' : '');
                } else if (this.form.sectionType === 'tube') {
                    var td = Number(this.form.tubeDepth) || 0;
                    var tbw = Number(this.form.tubeWidth) || 0;
                    var ttf = Number(this.form.tubeFlangeThick) || 0;
                    var ttw = Number(this.form.tubeWebThick) || 0;
                    if (td <= 0 || tbw <= 0 || ttf <= 0 || ttw <= 0) {
                        this.showToastMessage('Ingrese peralte, ancho y espesores válidos (cm)', 'error');
                        return;
                    }
                    var tp = this.tubeProps; // {A, Iz, Iy, J} en SI
                    sectionToSave.tubeDepth = td;           // cm (para mostrar/editar)
                    sectionToSave.tubeWidth = tbw;          // cm
                    sectionToSave.tubeFlangeThick = ttf;    // cm
                    sectionToSave.tubeWebThick = ttw;       // cm
                    sectionToSave.material = this.form.tubeMaterial || null;
                    sectionToSave.area = tp.A;              // m²  (clave usada por el motor)
                    sectionToSave.A = tp.A;                 // m²
                    sectionToSave.Iz = tp.Iz;               // m⁴ (eje mayor, I33)
                    sectionToSave.Iy = tp.Iy;               // m⁴ (eje menor, I22)
                    sectionToSave.J = tp.J;                 // m⁴ (torsión)
                    sectionToSave.description = 'Tubo ' + td + 'x' + tbw + 'x' + ttf + ' cm' +
                        (this.form.tubeMaterial ? ' (' + this.form.tubeMaterial + ')' : '');
                } else {
                    sectionToSave.description = 'Sección tipo ' + this.form.sectionType;
                }

                if (this.isNew) {
                    // Verificar si ya existe
                    var exists = false;
                    for (var i = 0; i < this.sections.length; i++) {
                        if (this.sections[i].name === sectionToSave.name) {
                            exists = true;
                            break;
                        }
                    }
                    if (exists) {
                        this.showToastMessage('La sección "' + sectionToSave.name + '" ya existe', 'error');
                        return;
                    }
                    this.sections.push(sectionToSave);
                    this.showToastMessage('Sección "' + sectionToSave.name + '" agregada', 'success');
                } else {
                    // Verificar que editingSection existe
                    if (!this.editingSection || !this.editingSection.name) {
                        this.showToastMessage('Error: No hay sección seleccionada para modificar', 'error');
                        this.backToList();
                        return;
                    }
                    var found = false;
                    for (var j = 0; j < this.sections.length; j++) {
                        if (this.sections[j].name === this.editingSection.name) {
                            this.sections[j] = sectionToSave;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        this.showToastMessage('Error: No se encontró la sección original', 'error');
                        this.backToList();
                        return;
                    }
                    this.showToastMessage('Sección "' + sectionToSave.name + '" modificada', 'success');
                }

                if (window.cadSystem) {
                    if (!window.cadSystem.frameSections) window.cadSystem.frameSections = {};
                    window.cadSystem.frameSections.sections = this.sections;
                    // Propaga la sección editada a TODOS los frames que la usan
                    // (geometría A/Iz/Iy/J + E del material), sin re-asignar.
                    const n = window.cadSystem.refreshFramesForSection?.(sectionToSave) || 0;
                    if (n > 0) this.showToastMessage('Sección actualizada en ' + n + ' elemento(s).', 'success');
                    if (window.cadSystem.sync3D) window.cadSystem.sync3D();
                }

                this.view = 'list';
                this.selectedSectionName = sectionToSave.name;
                this.editingSection = null;
            },

            confirmDelete: function() {
                if (!this.selectedSectionName) {
                    this.showToastMessage('Por favor seleccione una sección para eliminar', 'warning');
                    return;
                }
                this.sectionToDelete = this.selectedSectionName;
                this.showConfirmModal = true;
            },

            performDelete: function() {
                var deletedName = this.sectionToDelete;
                var newSections = [];
                for (var i = 0; i < this.sections.length; i++) {
                    if (this.sections[i].name !== deletedName) {
                        newSections.push(this.sections[i]);
                    }
                }
                this.sections = newSections;
                this.selectedSectionName = null;
                this.showConfirmModal = false;

                if (window.cadSystem) {
                    if (!window.cadSystem.frameSections) window.cadSystem.frameSections = {};
                    window.cadSystem.frameSections.sections = this.sections;
                    if (window.cadSystem.sync3D) window.cadSystem.sync3D();
                }

                this.showToastMessage('Sección "' + deletedName + '" eliminada', 'success');
            },

            openImportDialog: function() {
                this.showImportModal = true;
            },

            importWideFlange: function(wf) {
                // Las tablas AISC vienen en pulgadas → convertir a cm (×2.54) para
                // mantener todo el modal en cm, y calcular A/Iz/Iy/J en SI.
                var IN_TO_CM = 2.54;
                var dCm = wf.depth * IN_TO_CM;
                var bfCm = wf.flangeWidth * IN_TO_CM;
                var tfCm = wf.flangeThick * IN_TO_CM;
                var twCm = wf.webThick * IN_TO_CM;
                var wp = this.wfPropsFrom(dCm, bfCm, tfCm, twCm); // SI

                var newSection = {
                    name: wf.name,
                    type: 'wf',
                    depth: dCm,
                    flangeWidth: bfCm,
                    flangeThick: tfCm,
                    webThick: twCm,
                    weight: wf.weight,
                    material: null,
                    area: wp.A,
                    A: wp.A,
                    Iz: wp.Iz,
                    Iy: wp.Iy,
                    J: wp.J,
                    color: '#88ffaa',
                    description: 'Perfil W ' + wf.name + ' - ' + wf.weight + ' kg/m'
                };

                // Verificar si ya existe
                var exists = false;
                for (var i = 0; i < this.sections.length; i++) {
                    if (this.sections[i].name === newSection.name) {
                        exists = true;
                        break;
                    }
                }

                if (exists) {
                    this.showToastMessage('El perfil ' + wf.name + ' ya existe en la lista', 'warning');
                } else {
                    this.sections.push(newSection);
                    this.showToastMessage('Perfil ' + wf.name + ' importado correctamente', 'success');

                    // Actualizar cadSystem
                    if (window.cadSystem) {
                        if (!window.cadSystem.frameSections) window.cadSystem.frameSections = {};
                        window.cadSystem.frameSections.sections = this.sections;
                        if (window.cadSystem.sync3D) window.cadSystem.sync3D();
                    }
                }

                // Cerrar el modal de importación
                this.showImportModal = false;

                // Opcional: seleccionar automáticamente el nuevo perfil
                this.selectedSectionName = newSection.name;
            },
        }
    }
</script>