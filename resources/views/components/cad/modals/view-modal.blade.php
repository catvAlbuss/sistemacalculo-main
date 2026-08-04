{{-- resources/views/components/cad/modals/view-modal.blade.php --}}
<div x-data="viewModal()"
    x-init="init()"
    x-show="open"
    x-cloak
    class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70"
    @keydown.esc.window="close()">

    <div class="bg-[#1e1e1e] text-gray-200 w-[480px] rounded-lg border border-gray-700 shadow-2xl overflow-hidden font-sans">
        {{-- Título del Modal (dinámico según la vista activa) --}}
        <div class="bg-[#2d2d2d] px-3 py-1.5 text-xs flex justify-between items-center border-b border-gray-700 text-gray-400">
            <span x-text="title"></span>
            <button @click="close()" class="w-4 h-4 hover:bg-red-600 flex items-center justify-center rounded cursor-pointer text-[10px] text-gray-400 hover:text-white">×</button>
        </div>

        <div class="p-4">
            {{-- ==================== VISTA PLANTA ==================== --}}
            <div x-show="activeView === 'plan'" x-cloak class="flex gap-4 items-start">
                <fieldset class="flex-1 border border-gray-700 rounded-md p-3">
                    <legend class="text-[11px] text-gray-500 px-2 ml-1 italic">Seleccionar</legend>

                    <div class="bg-[#0c0c0c] border border-gray-800 rounded h-40 overflow-y-auto">
                        <template x-for="(story, idx) in stories" :key="story.id">
                            <div @click="selectedPlanStory = idx"
                                class="px-3 py-1 text-sm hover:bg-gray-800 cursor-pointer transition-colors"
                                :class="{'bg-[#094771] text-white font-medium': selectedPlanStory === idx, 'text-gray-300': selectedPlanStory !== idx}">
                                <span x-text="story.name + ' (Elevación: ' + story.elevation + ' m)'"></span>
                            </div>
                        </template>
                        <div x-show="stories.length === 0" class="px-3 py-4 text-center text-gray-500 text-sm">
                            No hay pisos definidos
                        </div>
                    </div>
                </fieldset>

                <div class="flex flex-col gap-2 pt-4">
                    <button @click="applyPlanView()" class="w-24 py-1 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded shadow-md transition-colors">OK</button>
                    <button @click="close()" class="w-24 py-1 text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 rounded transition-colors">Cancelar</button>
                </div>
            </div>

            {{-- ==================== VISTA ELEVACIÓN (Principal) ==================== --}}
            <div x-show="activeView === 'elevation'" x-cloak>
                <div class="grid grid-cols-[1fr,200px] gap-4">

                    {{-- Columna Izquierda: Lista de Elevaciones --}}
                    <fieldset class="border border-gray-700 rounded-md p-3">
                        <legend class="text-[11px] text-gray-500 px-2 ml-1 italic">Elevaciones</legend>
                        <div class="bg-[#0c0c0c] border border-gray-800 rounded h-48 overflow-y-auto">
                            <template x-for="(elev, idx) in elevationList" :key="idx">
                                <div @click="selectedElevation = idx"
                                    class="px-3 py-0.5 text-sm hover:bg-gray-800 cursor-pointer transition-colors"
                                    :class="{'bg-[#094771] text-white': selectedElevation === idx, 'text-gray-300': selectedElevation !== idx}">
                                    <span x-text="elev.label"></span>
                                </div>
                            </template>
                            <div x-show="elevationList.length === 0" class="px-3 py-4 text-center text-gray-500 text-sm">
                                No hay elevaciones definidas
                            </div>
                        </div>
                    </fieldset>

                    {{-- Columna Derecha: Acciones --}}
                    <fieldset class="border border-gray-700 rounded-md p-3">
                        <legend class="text-[11px] text-gray-500 px-2 ml-1 italic">Click para:</legend>
                        <div class="flex flex-col gap-2">
                            <button @click="openAddElevationDialog()" class="w-full text-center px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded shadow-sm transition-colors">
                                Añadir Nueva Elevación...
                            </button>

                            <button class="w-full text-center px-3 py-1.5 text-xs bg-gray-800/50 text-gray-500 border border-gray-700 rounded cursor-not-allowed italic" disabled>
                                Añadir Nueva Elevación en Línea Seleccionada
                            </button>

                            <button @click="openModifyElevationDialog()" class="w-full text-center px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded shadow-sm transition-colors" :class="{'opacity-50 cursor-not-allowed': selectedElevation === null}" :disabled="selectedElevation === null">
                                Modificar/Mostrar Elevación...
                            </button>

                            <button @click="deleteElevation()" class="w-full text-center px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded shadow-sm transition-colors" :class="{'opacity-50 cursor-not-allowed': selectedElevation === null}" :disabled="selectedElevation === null">
                                Borrar Nombre de Elevación
                            </button>
                        </div>
                    </fieldset>
                </div>

                {{-- Botones Inferiores --}}
                <div class="flex justify-end gap-3 mt-6">
                    <button @click="applyElevationView()" class="px-8 py-1 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded shadow-md transition-colors">OK</button>
                    <button @click="close()" class="px-8 py-1 text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 rounded transition-colors">Cancelar</button>
                </div>
            </div>

            {{-- ==================== VISTA 3D ==================== --}}
            <div x-show="activeView === '3d'" x-cloak class="flex flex-col gap-4">
                <fieldset class="border border-gray-700 rounded-md p-3">
                    <legend class="text-[11px] text-gray-500 px-2 ml-1 italic">Configurar Vista 3D</legend>

                    <div class="space-y-3">
                        <div>
                            <label class="block text-xs text-gray-400 mb-1">Tipo de Vista</label>
                            <select x-model="view3DType" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                                <option value="iso">Isométrica</option>
                                <option value="front">Frontal</option>
                                <option value="side">Lateral</option>
                                <option value="top">Superior</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs text-gray-400 mb-1">Ángulo de Rotación (grados)</label>
                            <input type="number" step="1" x-model="view3DAngle" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                        </div>
                        <div>
                            <label class="block text-xs text-gray-400 mb-1">Elevación de Cámara</label>
                            <input type="number" step="1" x-model="view3DElevation" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                        </div>
                    </div>
                </fieldset>

                <div class="flex flex-col gap-2">
                    <button @click="apply3DView()" class="w-full py-1 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded shadow-md transition-colors">OK</button>
                    <button @click="close()" class="w-full py-1 text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 rounded transition-colors">Cancelar</button>
                </div>
            </div>
        </div>
    </div>

    {{-- Modal para Agregar/Modificar Elevación --}}
    <div x-show="showElevationDialog" x-cloak class="fixed inset-0 z-[300] flex items-center justify-center bg-black/80" @click.away="showElevationDialog = false">
        <div class="bg-[#1e1e1e] text-gray-200 w-[380px] rounded-lg border border-gray-700 shadow-2xl overflow-hidden font-sans">
            <div class="bg-[#2d2d2d] px-3 py-1.5 text-xs flex justify-between items-center border-b border-gray-700 text-gray-400">
                <span x-text="isNewElevation ? 'Datos de Elevación' : 'Modificar Elevación'"></span>
                <button @click="showElevationDialog = false" class="w-4 h-4 hover:bg-red-600 flex items-center justify-center rounded cursor-pointer text-[10px] text-gray-400 hover:text-white">×</button>
            </div>

            <div class="p-4 flex flex-col gap-3">
                {{-- Nombre de la Elevación --}}
                <div class="border border-gray-800 rounded-md p-3 flex items-center justify-between bg-[#1a1a1a]">
                    <label class="text-sm font-bold">Elevación</label>
                    <input type="text" x-model="elevationForm.label" class="w-40 bg-black border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none text-center">
                </div>

                {{-- Sistema de Coordenadas --}}
                <div class="border border-gray-800 rounded-md p-3 flex items-center justify-between bg-[#1a1a1a]">
                    <label class="text-sm">Sistema de Coordenadas</label>
                    <div class="relative w-40">
                        <select x-model="elevationForm.coordSystem" class="w-full bg-black border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none appearance-none cursor-pointer">
                            <option value="GLOBAL">GLOBAL</option>
                            <option value="LOCAL">LOCAL</option>
                        </select>
                        <div class="absolute inset-y-0 right-2 flex items-center pointer-events-none text-blue-500 text-[10px]">▼</div>
                    </div>
                </div>

                {{-- Ubicación (Location) --}}
                <fieldset class="border border-gray-800 rounded-md p-4 bg-[#1a1a1a]">
                    <legend class="text-[11px] text-gray-500 px-2 ml-2 italic">Ubicación</legend>

                    <div class="flex flex-col gap-4">
                        {{-- Ordenada X --}}
                        <div class="flex items-center justify-between">
                            <label class="flex items-center gap-2 text-sm cursor-pointer group" @click="elevationForm.locationType = 'X'">
                                <input type="radio" name="location" value="X" x-model="elevationForm.locationType" class="w-4 h-4 accent-blue-500">
                                <span class="group-hover:text-white transition-colors">Ordenada X</span>
                            </label>
                            <input type="text" x-model="elevationForm.xValue" class="w-32 bg-black border border-gray-700 rounded px-2 py-1 text-sm text-right text-gray-300 focus:border-blue-500 outline-none">
                        </div>

                        {{-- Ordenada Y --}}
                        <div class="flex items-center justify-between">
                            <label class="flex items-center gap-2 text-sm cursor-pointer group" @click="elevationForm.locationType = 'Y'">
                                <input type="radio" name="location" value="Y" x-model="elevationForm.locationType" class="w-4 h-4 accent-blue-500">
                                <span class="group-hover:text-white transition-colors">Ordenada Y</span>
                            </label>
                            <input type="text" x-model="elevationForm.yValue" class="w-32 bg-black border border-gray-700 rounded px-2 py-1 text-sm text-right text-gray-300 focus:border-blue-500 outline-none">
                        </div>
                    </div>
                </fieldset>

                {{-- Botones de Acción --}}
                <div class="flex justify-center gap-4 pt-2">
                    <button @click="saveElevation()" class="px-10 py-1.5 text-sm font-bold bg-[#2d2d3d] hover:bg-blue-600 text-white border border-gray-600 rounded transition-all shadow-lg active:scale-95">
                        OK
                    </button>
                    <button @click="showElevationDialog = false" class="px-10 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-400 border border-gray-700 rounded transition-all active:scale-95">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    </div>

    <style>
        [x-cloak] {
            display: none !important;
        }
    </style>
</div>

<script>
    function viewModal() {
        return {
            open: false,
            activeView: 'plan',

            // Datos para vista Planta
            stories: [],
            selectedPlanStory: null,

            // Datos para vista Elevación
            elevationList: [],
            selectedElevation: null,
            showElevationDialog: false,
            isNewElevation: true,
            elevationForm: {
                label: 'ELEV1',
                coordSystem: 'GLOBAL',
                locationType: 'X',
                xValue: '0.',
                yValue: '0.'
            },

            // Datos para vista 3D
            view3DType: 'iso',
            view3DAngle: 45,
            view3DElevation: 10,

            // Título dinámico
            get title() {
                const titles = {
                    'plan': 'Seleccionar Nivel de Planta',
                    'elevation': 'Establecer Vista de Elevación',
                    '3d': 'Configurar Vista 3D'
                };
                return titles[this.activeView] || 'Configurar Vista';
            },

            init() {
                this.loadData();
                window.addEventListener('open-view-modal', (event) => {
                    this.openModal(event.detail?.view || 'plan');
                });
            },

            loadData() {
                // Cargar pisos
                if (window.cadSystem && window.cadSystem.stories) {
                    this.stories = window.cadSystem.stories;
                    const currentStory = window.cadSystem.currentStory;
                    if (currentStory) {
                        const idx = this.stories.findIndex(s => s.name === currentStory);
                        if (idx !== -1) this.selectedPlanStory = idx;
                    }
                }

                // Cargar elevaciones (ejes de grilla)
                this.loadElevations();
            },

            loadElevations() {
                this.elevationList = [];
                if (window.cadSystem && window.cadSystem.referenceGrid) {
                    const ref = window.cadSystem.referenceGrid;
                    // Ejes X (Letras)
                    if (ref.xGrids) {
                        ref.xGrids.forEach(g => {
                            this.elevationList.push({
                                label: g.id,
                                type: 'X',
                                value: g.ordinate
                            });
                        });
                    }
                    // Ejes Y (Números)
                    if (ref.yGrids) {
                        ref.yGrids.forEach(g => {
                            this.elevationList.push({
                                label: g.id,
                                type: 'Y',
                                value: g.ordinate
                            });
                        });
                    }
                }
            },

            openModal(viewType = 'plan') {
                this.loadData();
                this.activeView = viewType;
                this.resetSelections();
                this.open = true;
            },

            resetSelections() {
                this.selectedPlanStory = null;
                this.selectedElevation = null;
            },

            close() {
                this.open = false;
                this.showElevationDialog = false;
            },

            // ==================== VISTA PLANTA ====================
            applyPlanView() {
                if (this.selectedPlanStory !== null && this.stories[this.selectedPlanStory]) {
                    const selectedStory = this.stories[this.selectedPlanStory];

                    if (window.cadSystem) {
                        // Buscar el índice de la vista en viewSet
                        const viewIndex = window.cadSystem.viewSet?.findIndex(v =>
                            v.type === "plan" && v.elevation === selectedStory.elevation
                        );

                        if (viewIndex !== undefined && viewIndex !== -1) {
                            // Usar el método existente para cambiar la vista
                            window.cadSystem.setViewFromSet(viewIndex);
                            window.cadSystem.showMessage(`🗺️ Vista en planta: ${selectedStory.name} (Elevación: ${selectedStory.elevation}m)`);
                        } else {
                            // Si no existe la vista en viewSet, crearla
                            const newView = {
                                type: "plan",
                                storyId: selectedStory.id,
                                name: `Planta - ${selectedStory.name}`,
                                elevation: selectedStory.elevation
                            };
                            window.cadSystem.viewSet.push(newView);
                            const newIndex = window.cadSystem.viewSet.length - 1;
                            window.cadSystem.setViewFromSet(newIndex);
                            window.cadSystem.showMessage(`🗺️ Vista en planta: ${selectedStory.name} (Elevación: ${selectedStory.elevation}m)`);
                        }
                    }
                    this.close();
                } else {
                    this.showToastMessage('Seleccione un nivel de planta', 'warning');
                }
            },

            // ==================== VISTA ELEVACIÓN ====================
            openAddElevationDialog() {
                this.isNewElevation = true;
                this.elevationForm = {
                    label: 'ELEV' + (this.elevationList.length + 1),
                    coordSystem: 'GLOBAL',
                    locationType: 'X',
                    xValue: '0.',
                    yValue: '0.'
                };
                this.showElevationDialog = true;
            },

            openModifyElevationDialog() {
                if (this.selectedElevation !== null && this.elevationList[this.selectedElevation]) {
                    const elev = this.elevationList[this.selectedElevation];
                    this.isNewElevation = false;
                    this.elevationForm = {
                        label: elev.label,
                        coordSystem: 'GLOBAL',
                        locationType: elev.type === 'X' ? 'X' : 'Y',
                        xValue: elev.type === 'X' ? elev.value.toString() : '0.',
                        yValue: elev.type === 'Y' ? elev.value.toString() : '0.'
                    };
                    this.showElevationDialog = true;
                }
            },

            saveElevation() {
                if (!this.elevationForm.label) {
                    this.showToastMessage('El nombre de la elevación es requerido', 'warning');
                    return;
                }

                if (this.isNewElevation) {
                    // Agregar nueva elevación al sistema
                    if (window.cadSystem && window.cadSystem.referenceGrid) {
                        const ref = window.cadSystem.referenceGrid;
                        const value = parseFloat(this.elevationForm.locationType === 'X' ? this.elevationForm.xValue : this.elevationForm.yValue);

                        if (this.elevationForm.locationType === 'X') {
                            if (!ref.xGrids) ref.xGrids = [];
                            ref.xGrids.push({
                                id: this.elevationForm.label,
                                ordinate: value,
                                visible: true,
                                bubbleLoc: 'End'
                            });
                        } else {
                            if (!ref.yGrids) ref.yGrids = [];
                            ref.yGrids.push({
                                id: this.elevationForm.label,
                                ordinate: value,
                                visible: true,
                                bubbleLoc: 'Start'
                            });
                        }

                        window.cadSystem.rebuildGeneralGrids();
                        window.cadSystem.rebuildViewSetFromReferenceGrid();
                        window.cadSystem.redraw();
                        window.cadSystem.sync3D();

                        this.loadElevations();
                        this.showToastMessage(`✅ Elevación ${this.elevationForm.label} agregada`, 'success');
                    }
                } else if (this.selectedElevation !== null) {
                    // Modificar elevación existente
                    const oldElev = this.elevationList[this.selectedElevation];
                    if (window.cadSystem && window.cadSystem.referenceGrid) {
                        const ref = window.cadSystem.referenceGrid;
                        const value = parseFloat(this.elevationForm.locationType === 'X' ? this.elevationForm.xValue : this.elevationForm.yValue);

                        if (oldElev.type === 'X') {
                            const idx = ref.xGrids.findIndex(g => g.id === oldElev.label);
                            if (idx !== -1) {
                                ref.xGrids[idx].id = this.elevationForm.label;
                                ref.xGrids[idx].ordinate = value;
                            }
                        } else {
                            const idx = ref.yGrids.findIndex(g => g.id === oldElev.label);
                            if (idx !== -1) {
                                ref.yGrids[idx].id = this.elevationForm.label;
                                ref.yGrids[idx].ordinate = value;
                            }
                        }

                        window.cadSystem.rebuildGeneralGrids();
                        window.cadSystem.rebuildViewSetFromReferenceGrid();
                        window.cadSystem.redraw();
                        window.cadSystem.sync3D();

                        this.loadElevations();
                        this.showToastMessage(`✅ Elevación ${this.elevationForm.label} modificada`, 'success');
                    }
                }

                this.showElevationDialog = false;
            },

            deleteElevation() {
                if (this.selectedElevation !== null && this.elevationList[this.selectedElevation]) {
                    const elev = this.elevationList[this.selectedElevation];

                    Swal.fire({
                        title: 'Eliminar Elevación',
                        text: `¿Está seguro de eliminar la elevación "${elev.label}"?`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Sí, Eliminar',
                        cancelButtonText: 'Cancelar',
                        confirmButtonColor: '#ef4444'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            if (window.cadSystem && window.cadSystem.referenceGrid) {
                                const ref = window.cadSystem.referenceGrid;

                                if (elev.type === 'X') {
                                    const idx = ref.xGrids.findIndex(g => g.id === elev.label);
                                    if (idx !== -1) ref.xGrids.splice(idx, 1);
                                } else {
                                    const idx = ref.yGrids.findIndex(g => g.id === elev.label);
                                    if (idx !== -1) ref.yGrids.splice(idx, 1);
                                }

                                window.cadSystem.rebuildGeneralGrids();
                                window.cadSystem.rebuildViewSetFromReferenceGrid();
                                window.cadSystem.redraw();
                                window.cadSystem.sync3D();

                                this.loadElevations();
                                this.selectedElevation = null;
                                this.showToastMessage(`🗑️ Elevación ${elev.label} eliminada`, 'success');
                            }
                        }
                    });
                }
            },

            applyElevationView() {
                if (this.selectedElevation !== null && this.elevationList[this.selectedElevation]) {
                    const selectedElev = this.elevationList[this.selectedElevation];

                    if (window.cadSystem) {
                        // Buscar el índice de la vista en viewSet
                        let viewIndex = -1;

                        if (selectedElev.type === 'X') {
                            // Buscar vista de elevación para eje X
                            viewIndex = window.cadSystem.viewSet?.findIndex(v =>
                                v.type === "elevation" &&
                                v.axis === "X" &&
                                v.label === selectedElev.label
                            );
                        } else {
                            // Buscar vista de elevación para eje Y
                            viewIndex = window.cadSystem.viewSet?.findIndex(v =>
                                v.type === "elevation" &&
                                v.axis === "Y" &&
                                v.label === selectedElev.label
                            );
                        }

                        if (viewIndex !== undefined && viewIndex !== -1) {
                            // Usar el método existente para cambiar la vista
                            window.cadSystem.setViewFromSet(viewIndex);
                            window.cadSystem.showMessage(`📐 Vista en elevación: Eje ${selectedElev.label} (${selectedElev.type === 'X' ? 'X' : 'Y'} = ${selectedElev.value}m)`);
                        } else {
                            // Si no existe la vista en viewSet, actualizarla primero
                            window.cadSystem.rebuildViewSetFromReferenceGrid();
                            this.showToastMessage('Actualice la lista de vistas e intente nuevamente', 'warning');
                            return;
                        }
                    }
                    this.close();
                } else {
                    this.showToastMessage('Seleccione una elevación', 'warning');
                }
            },

            // ==================== VISTA 3D ====================
            apply3DView() {
                if (window.cadSystem) {
                    switch (this.view3DType) {
                        case 'iso':
                            window.cadSystem.setViewIso();
                            break;
                        case 'front':
                            window.cadSystem.setViewFront();
                            break;
                        case 'side':
                            window.cadSystem.setViewSide();
                            break;
                        case 'top':
                            window.cadSystem.setViewPlan();
                            break;
                    }
                    window.cadSystem.showMessage(`🎥 Vista 3D configurada (${this.view3DType})`);
                }
                this.close();
            },

            showToastMessage(message, type) {
                const toast = document.createElement("div");
                toast.textContent = message;
                const bgColor = type === "warning" ? "#ef4444" : "#3b82f6";
                toast.style.cssText = `
                position: fixed;
                bottom: 100px;
                right: 20px;
                background: ${bgColor};
                color: white;
                padding: 10px 16px;
                border-radius: 8px;
                font-size: 13px;
                font-family: monospace;
                z-index: 10000;
                animation: fadeOut 2s ease forwards;
            `;
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 2000);
            }
        }
    }
</script>