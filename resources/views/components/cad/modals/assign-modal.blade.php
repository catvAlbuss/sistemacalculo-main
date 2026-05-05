{{-- resources/views/components/cad/modals/assign-modal.blade.php --}}
<div x-data="assignModal()"
    x-init="init()"
    x-show="open"
    x-cloak
    class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70"
    @keydown.esc.window="close()">

    <div class="bg-[#1e1e1e] text-gray-200 rounded-lg border border-gray-700 shadow-2xl overflow-hidden font-sans" :class="getModalWidth()">

        {{-- Título del Modal (dinámico según el tipo) --}}
        <div class="bg-[#2d2d2d] px-3 py-1.5 text-xs flex justify-between items-center border-b border-gray-700 text-gray-400">
            <span x-text="title"></span>
            <button @click="close()" class="w-4 h-4 hover:bg-red-600 flex items-center justify-center rounded cursor-pointer text-[10px] text-gray-400 hover:text-white">×</button>
        </div>

        <div class="p-4">

            {{-- ==================== DIAFRAGMAS ==================== --}}
            <div x-show="activeType === 'diaphragm'" x-cloak>
                <div class="grid grid-cols-[1fr,220px] gap-4">
                    {{-- Columna Izquierda: Lista de Diafragmas --}}
                    <fieldset class="border border-gray-700 rounded-md p-3">
                        <legend class="text-[11px] text-gray-500 px-2 ml-1 italic">Diafragmas</legend>
                        <div class="bg-[#0c0c0c] border border-gray-800 rounded h-40 overflow-y-auto">
                            <template x-for="(diaphragm, idx) in diaphragms" :key="idx">
                                <div @click="selectedDiaphragm = idx"
                                    class="px-3 py-1 text-sm cursor-pointer transition-colors"
                                    :class="{'bg-[#094771] text-white font-medium': selectedDiaphragm === idx, 'hover:bg-gray-800 text-gray-300': selectedDiaphragm !== idx}">
                                    <span x-text="diaphragm.name"></span>
                                </div>
                            </template>
                            <div x-show="diaphragms.length === 0" class="px-3 py-4 text-center text-gray-500 text-sm">
                                No hay diafragmas definidos
                            </div>
                        </div>
                    </fieldset>

                    {{-- Columna Derecha: Acciones --}}
                    <div class="flex flex-col gap-4">
                        <fieldset class="border border-gray-700 rounded-md p-3">
                            <legend class="text-[11px] text-gray-500 px-2 ml-1 italic">Click para:</legend>
                            <div class="flex flex-col gap-2">
                                <button @click="openDiaphragmForm(true)" class="w-full text-center px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded transition-colors">
                                    Añadir Nuevo Diafragma...
                                </button>
                                <button @click="openDiaphragmForm(false)" class="w-full text-center px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded transition-colors" :class="{'opacity-50 cursor-not-allowed': selectedDiaphragm === null}" :disabled="selectedDiaphragm === null">
                                    Modificar/Mostrar Diafragma...
                                </button>
                                <button @click="deleteDiaphragm()" class="w-full text-center px-3 py-1.5 text-xs bg-gray-800/50 text-gray-500 border border-gray-700 rounded cursor-not-allowed italic" disabled>
                                    Borrar Diafragma
                                </button>
                            </div>
                        </fieldset>

                        {{-- Botones de Confirmación --}}
                        <div class="flex flex-col gap-2 px-4">
                            <button @click="applyDiaphragm()" class="w-full py-1 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded shadow-md transition-colors">OK</button>
                            <button @click="close()" class="w-full py-1 text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 rounded transition-colors">Cancelar</button>
                        </div>
                    </div>
                </div>

                {{-- Opción Inferior --}}
                <div class="mt-4 px-1">
                    <label class="flex items-center gap-2 text-xs text-gray-400 cursor-pointer hover:text-white transition-colors">
                        <input type="checkbox" x-model="disconnectFromAll" class="accent-blue-600 bg-gray-800 border-gray-600 rounded">
                        Desconectar de todos los diafragmas
                    </label>
                </div>
            </div>

            {{-- ==================== RESTRICCIONES (SOPORTES 3D) ==================== --}}
            <div x-show="activeType === 'restraint'" x-cloak>
                <div class="flex flex-col gap-4">
                    {{-- Grados de Libertad (3D: UX, UY, UZ, RX, RY, RZ) --}}
                    <fieldset class="border border-gray-700 rounded-md p-4">
                        <legend class="text-[11px] text-gray-500 px-2 ml-2 italic">Restricciones en Direcciones Globales (3D)</legend>

                        <div class="grid grid-cols-2 gap-x-8 gap-y-3">
                            <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white transition-colors">
                                <input type="checkbox" x-model="restraints.ux" class="w-4 h-4 accent-blue-600 bg-gray-800 border-gray-600 rounded">
                                Traslación X (UX)
                            </label>
                            <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white transition-colors">
                                <input type="checkbox" x-model="restraints.rx" class="w-4 h-4 accent-blue-600 bg-gray-800 border-gray-600 rounded">
                                Rotación sobre X (RX)
                            </label>
                            <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white transition-colors">
                                <input type="checkbox" x-model="restraints.uy" class="w-4 h-4 accent-blue-600 bg-gray-800 border-gray-600 rounded">
                                Traslación Y (UY)
                            </label>
                            <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white transition-colors">
                                <input type="checkbox" x-model="restraints.ry" class="w-4 h-4 accent-blue-600 bg-gray-800 border-gray-600 rounded">
                                Rotación sobre Y (RY)
                            </label>
                            <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white transition-colors">
                                <input type="checkbox" x-model="restraints.uz" class="w-4 h-4 accent-blue-600 bg-gray-800 border-gray-600 rounded">
                                Traslación Z (UZ)
                            </label>
                            <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white transition-colors">
                                <input type="checkbox" x-model="restraints.rz" class="w-4 h-4 accent-blue-600 bg-gray-800 border-gray-600 rounded">
                                Rotación sobre Z (RZ)
                            </label>
                        </div>
                    </fieldset>

                    {{-- Restricciones Rápidas (Iconos 3D) --}}
                    <fieldset class="border border-gray-700 rounded-md p-4">
                        <legend class="text-[11px] text-gray-500 px-2 ml-2 italic">Restricciones Rápidas</legend>

                        <div class="grid grid-cols-4 gap-2">
                            <!-- Empotrado (Fixed) - Todos los grados restringidos -->
                            <button @click="setQuickRestraint('fixed')"
                                class="flex flex-col items-center p-2 rounded transition-all"
                                :class="{'bg-[#094771] border border-blue-400': quickRestraint === 'fixed', 'bg-gray-800 border border-gray-600 hover:bg-gray-700': quickRestraint !== 'fixed'}">
                                <span class="text-2xl">🧱</span>
                                <span class="text-[10px] mt-1">Empotrado</span>
                            </button>

                            <!-- Articulado (Pinned) - Solo traslaciones restringidas -->
                            <button @click="setQuickRestraint('pinned')"
                                class="flex flex-col items-center p-2 rounded transition-all"
                                :class="{'bg-[#094771] border border-blue-400': quickRestraint === 'pinned', 'bg-gray-800 border border-gray-600 hover:bg-gray-700': quickRestraint !== 'pinned'}">
                                <span class="text-2xl">🔺</span>
                                <span class="text-[10px] mt-1">Articulado</span>
                            </button>

                            <!-- Apoyo Simple (Roller) - Solo traslación vertical -->
                            <button @click="setQuickRestraint('roller')"
                                class="flex flex-col items-center p-2 rounded transition-all"
                                :class="{'bg-[#094771] border border-blue-400': quickRestraint === 'roller', 'bg-gray-800 border border-gray-600 hover:bg-gray-700': quickRestraint !== 'roller'}">
                                <span class="text-2xl">⏏️</span>
                                <span class="text-[10px] mt-1">Apoyo Simple</span>
                            </button>

                            <!-- Libre (Free) - Sin restricciones -->
                            <button @click="setQuickRestraint('free')"
                                class="flex flex-col items-center p-2 rounded transition-all"
                                :class="{'bg-[#094771] border border-blue-400': quickRestraint === 'free', 'bg-gray-800 border border-gray-600 hover:bg-gray-700': quickRestraint !== 'free'}">
                                <span class="text-2xl">⚫</span>
                                <span class="text-[10px] mt-1">Libre</span>
                            </button>
                        </div>
                    </fieldset>

                    {{-- Botones de Acción --}}
                    <div class="flex justify-center gap-4 pt-2">
                        <button @click="applyRestraints3D()" class="px-10 py-1.5 text-sm font-bold bg-[#2d2d3d] hover:bg-blue-600 text-white border border-gray-600 rounded transition-all shadow-lg active:scale-95">
                            OK
                        </button>
                        <button @click="close()" class="px-10 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-400 border border-gray-700 rounded transition-all active:scale-95">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>

            {{-- ==================== RESORTES PUNTUALES ==================== --}}
            <div x-show="activeType === 'spring'" x-cloak>
                <div class="flex flex-col gap-4">
                    <div class="text-center text-gray-500 py-8">
                        Configuración de Resortes Puntuales - Próximamente
                    </div>
                    <div class="flex justify-center gap-4 pt-2">
                        <button @click="close()" class="px-10 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-400 border border-gray-700 rounded transition-all">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- Modal para Agregar/Modificar Diafragma --}}
    <div x-show="showDiaphragmForm" x-cloak class="fixed inset-0 z-[300] flex items-center justify-center bg-black/80" @click.away="showDiaphragmForm = false">
        <div class="bg-[#1e1e1e] text-gray-200 w-[380px] rounded-lg border border-gray-700 shadow-2xl overflow-hidden font-sans">
            <div class="bg-[#2d2d2d] px-3 py-1.5 text-xs flex justify-between items-center border-b border-gray-700 text-gray-400">
                <span x-text="isNewDiaphragm ? 'Datos de Diafragma' : 'Modificar Diafragma'"></span>
                <button @click="showDiaphragmForm = false" class="w-4 h-4 hover:bg-red-600 flex items-center justify-center rounded cursor-pointer text-[10px] text-gray-400 hover:text-white">×</button>
            </div>

            <div class="p-4 flex flex-col gap-4">
                {{-- Nombre del Diafragma --}}
                <div class="flex items-center justify-between bg-[#1a1a1a] border border-gray-800 p-4 rounded-md">
                    <label class="text-sm font-bold">Diafragma</label>
                    <input type="text" x-model="diaphragmForm.name" class="w-32 bg-black border border-gray-700 rounded px-2 py-1 text-sm text-center text-blue-400 font-mono focus:border-blue-500 outline-none shadow-inner">
                </div>

                {{-- Rigidez --}}
                <fieldset class="border border-gray-800 rounded-md p-4 bg-[#1a1a1a]">
                    <legend class="text-[11px] text-gray-500 px-2 ml-2 italic">Rigidez</legend>
                    <div class="flex justify-around">
                        <label class="flex items-center gap-3 text-sm cursor-pointer group">
                            <input type="radio" value="Rigid" x-model="diaphragmForm.rigidity" class="w-4 h-4 accent-blue-500">
                            <span class="group-hover:text-white transition-colors font-medium">Rígido</span>
                        </label>
                        <label class="flex items-center gap-3 text-sm cursor-pointer group">
                            <input type="radio" value="Semi Rigid" x-model="diaphragmForm.rigidity" class="w-4 h-4 accent-blue-500">
                            <span class="group-hover:text-white transition-colors font-medium">Semi Rígido</span>
                        </label>
                    </div>
                </fieldset>

                {{-- Botones de Acción --}}
                <div class="flex justify-center gap-4 pt-2">
                    <button @click="saveDiaphragm()" class="px-10 py-1.5 text-sm font-bold bg-[#2d2d3d] hover:bg-blue-600 text-white border border-gray-600 rounded transition-all shadow-lg active:scale-95">
                        OK
                    </button>
                    <button @click="showDiaphragmForm = false" class="px-10 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-400 border border-gray-700 rounded transition-all active:scale-95">
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
    function assignModal() {
        return {
            open: false,
            activeType: 'diaphragm', // 'diaphragm', 'restraint', 'spring'

            // Diafragmas
            diaphragms: [],
            selectedDiaphragm: null,
            disconnectFromAll: false,
            showDiaphragmForm: false,
            isNewDiaphragm: true,
            diaphragmForm: {
                name: 'D1',
                rigidity: 'Rigid'
            },

            // Restricciones (Soportes)
            restraints: {
                ux: true,
                uy: true,
                uz: true,
                rx: true,
                ry: true,
                rz: true
            },
            quickRestraint: 'fixed',

            // Título dinámico
            get title() {
                const titles = {
                    'diaphragm': 'Asignar Diafragma',
                    'restraint': 'Asignar Restricciones',
                    'spring': 'Asignar Resortes Puntuales'
                };
                return titles[this.activeType] || 'Asignar';
            },

            init() {
                this.loadData();
                window.addEventListener('open-assign-modal', (event) => {
                    this.openModal(event.detail?.type || 'diaphragm');
                });
            },

            getModalWidth() {
                const widths = {
                    'diaphragm': 'w-[500px]',
                    'restraint': 'w-[420px]',
                    'spring': 'w-[400px]'
                };
                return widths[this.activeType] || 'w-[450px]';
            },

            loadData() {
                // Cargar diafragmas desde cadSystem
                if (window.cadSystem && window.cadSystem.diaphragms && window.cadSystem.diaphragms.items) {
                    this.diaphragms = window.cadSystem.diaphragms.items;
                } else {
                    this.diaphragms = [{
                            name: 'D1',
                            rigidity: 'Rigid'
                        },
                        {
                            name: 'NONE',
                            rigidity: 'Semi Rigid'
                        }
                    ];
                }
            },

            openModal(type = 'diaphragm') {
                this.loadData();
                this.activeType = type;
                this.resetSelections();
                this.open = true;
            },

            resetSelections() {
                this.selectedDiaphragm = null;
                this.disconnectFromAll = false;
                // Resetear restricciones
                this.restraints = {
                    ux: true,
                    uy: true,
                    uz: true,
                    rx: true,
                    ry: true,
                    rz: true
                };
                this.quickRestraint = 'fixed';
            },

            close() {
                this.open = false;
                this.showDiaphragmForm = false;
            },

            // ==================== DIAFRAGMAS ====================
            openDiaphragmForm(isNew) {
                this.isNewDiaphragm = isNew;
                if (!isNew && this.selectedDiaphragm !== null) {
                    const dia = this.diaphragms[this.selectedDiaphragm];
                    this.diaphragmForm = {
                        ...dia
                    };
                } else {
                    this.diaphragmForm = {
                        name: 'D' + (this.diaphragms.length + 1),
                        rigidity: 'Rigid'
                    };
                }
                this.showDiaphragmForm = true;
            },

            saveDiaphragm() {
                if (!this.diaphragmForm.name) {
                    this.showToastMessage('El nombre del diafragma es requerido', 'warning');
                    return;
                }

                if (this.isNewDiaphragm) {
                    // Verificar si ya existe
                    const exists = this.diaphragms.some(d => d.name === this.diaphragmForm.name);
                    if (exists) {
                        this.showToastMessage('El diafragma ya existe', 'warning');
                        return;
                    }
                    this.diaphragms.push({
                        ...this.diaphragmForm
                    });
                    this.showToastMessage('Diafragma agregado', 'success');
                } else if (this.selectedDiaphragm !== null) {
                    this.diaphragms[this.selectedDiaphragm] = {
                        ...this.diaphragmForm
                    };
                    this.showToastMessage('Diafragma modificado', 'success');
                }

                // Guardar en cadSystem
                if (window.cadSystem) {
                    if (!window.cadSystem.diaphragms) window.cadSystem.diaphragms = {};
                    window.cadSystem.diaphragms.items = this.diaphragms;
                }

                this.showDiaphragmForm = false;
            },

            deleteDiaphragm() {
                if (this.selectedDiaphragm !== null) {
                    Swal.fire({
                        title: 'Eliminar Diafragma',
                        text: `¿Está seguro de eliminar "${this.diaphragms[this.selectedDiaphragm].name}"?`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Sí, Eliminar',
                        cancelButtonText: 'Cancelar'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            this.diaphragms.splice(this.selectedDiaphragm, 1);
                            this.selectedDiaphragm = null;
                            if (window.cadSystem && window.cadSystem.diaphragms) {
                                window.cadSystem.diaphragms.items = this.diaphragms;
                            }
                            this.showToastMessage('Diafragma eliminado', 'success');
                        }
                    });
                }
            },

            applyDiaphragm() {
                if (this.selectedDiaphragm !== null) {
                    const selected = this.diaphragms[this.selectedDiaphragm];
                    if (window.cadSystem && window.cadSystem.selectedNodesState) {
                        const selectedNodes = window.cadSystem.selectedNodesState.selectedObjects;
                        if (selectedNodes.length > 0) {
                            // Asignar diafragma a los nodos seleccionados
                            selectedNodes.forEach(node => {
                                node.diaphragm = selected.name;
                                node.diaphragmRigidity = selected.rigidity;
                            });
                            window.cadSystem.redraw();
                            window.cadSystem.sync3D();
                            this.showToastMessage(`Diafragma "${selected.name}" asignado a ${selectedNodes.length} nodos`, 'success');
                        } else {
                            this.showToastMessage('No hay nodos seleccionados', 'warning');
                        }
                    }
                } else {
                    this.showToastMessage('Seleccione un diafragma', 'warning');
                }
                this.close();
            },

            // ==================== RESTRICCIONES ====================
            // ==================== RESTRICCIONES 3D ====================

            setQuickRestraint(type) {
                this.quickRestraint = type;
                switch (type) {
                    case 'fixed': // Empotrado - todos restringidos
                        this.restraints = {
                            ux: true,
                            uy: true,
                            uz: true,
                            rx: true,
                            ry: true,
                            rz: true
                        };
                        break;
                    case 'pinned': // Articulado - solo traslaciones
                        this.restraints = {
                            ux: true,
                            uy: true,
                            uz: true,
                            rx: false,
                            ry: false,
                            rz: false
                        };
                        break;
                    case 'roller': // Apoyo simple - solo traslación vertical (UZ)
                        this.restraints = {
                            ux: false,
                            uy: false,
                            uz: true,
                            rx: false,
                            ry: false,
                            rz: false
                        };
                        break;
                    case 'free': // Libre - nada restringido
                        this.restraints = {
                            ux: false,
                            uy: false,
                            uz: false,
                            rx: false,
                            ry: false,
                            rz: false
                        };
                        break;
                }
            },

            applyRestraints3D() {
                if (window.cadSystem && window.cadSystem.selectedNodesState) {
                    const selectedNodes = window.cadSystem.selectedNodesState.selectedObjects;
                    if (selectedNodes.length > 0) {
                        // Asignar restricciones a los nodos seleccionados
                        selectedNodes.forEach(node => {
                            // Guardar las restricciones como objeto
                            node.restraints = {
                                ...this.restraints
                            };

                            // Convertir a formato de soporte para compatibilidad con el sistema 2D existente
                            // Esto mantiene la compatibilidad con tu código actual
                            if (this.restraints.ux && this.restraints.uy && this.restraints.uz &&
                                this.restraints.rx && this.restraints.ry && this.restraints.rz) {
                                node.soporte = 'soporteUno'; // Empotrado
                            } else if (this.restraints.ux && this.restraints.uy && this.restraints.uz &&
                                !this.restraints.rx && !this.restraints.ry && !this.restraints.rz) {
                                node.soporte = 'soporteDos'; // Articulado
                            } else if (!this.restraints.ux && !this.restraints.uy && this.restraints.uz &&
                                !this.restraints.rx && !this.restraints.ry && !this.restraints.rz) {
                                node.soporte = 'soporteTres'; // Apoyo simple
                            } else if (!this.restraints.ux && !this.restraints.uy && !this.restraints.uz &&
                                !this.restraints.rx && !this.restraints.ry && !this.restraints.rz) {
                                node.soporte = ''; // Libre
                            } else {
                                node.soporte = 'custom'; // Restricción personalizada
                            }
                        });

                        window.cadSystem.redraw();
                        window.cadSystem.sync3D();

                        const count = Object.values(this.restraints).filter(v => v === true).length;
                        this.showToastMessage(`${count} grado(s) de libertad restringido(s) en ${selectedNodes.length} nodo(s)`, 'success');
                    } else {
                        this.showToastMessage('No hay nodos seleccionados', 'warning');
                    }
                }
                this.close();
            },

            // Método para leer restricciones de un nodo existente (para edición)
            loadRestraintsFromNode(node) {
                if (node.restraints) {
                    this.restraints = {
                        ...node.restraints
                    };
                } else if (node.soporte) {
                    // Convertir soporte 2D a restricciones 3D
                    switch (node.soporte) {
                        case 'soporteUno':
                            this.restraints = {
                                ux: true,
                                uy: true,
                                uz: true,
                                rx: true,
                                ry: true,
                                rz: true
                            };
                            this.quickRestraint = 'fixed';
                            break;
                        case 'soporteDos':
                            this.restraints = {
                                ux: true,
                                uy: true,
                                uz: true,
                                rx: false,
                                ry: false,
                                rz: false
                            };
                            this.quickRestraint = 'pinned';
                            break;
                        case 'soporteTres':
                            this.restraints = {
                                ux: false,
                                uy: false,
                                uz: true,
                                rx: false,
                                ry: false,
                                rz: false
                            };
                            this.quickRestraint = 'roller';
                            break;
                        default:
                            this.restraints = {
                                ux: false,
                                uy: false,
                                uz: false,
                                rx: false,
                                ry: false,
                                rz: false
                            };
                            this.quickRestraint = 'free';
                    }
                }
            },

            applyRestraints() {
                if (window.cadSystem && window.cadSystem.selectedNodesState) {
                    const selectedNodes = window.cadSystem.selectedNodesState.selectedObjects;
                    if (selectedNodes.length > 0) {
                        // Asignar restricciones a los nodos seleccionados
                        selectedNodes.forEach(node => {
                            node.restraints = {
                                ...this.restraints
                            };
                        });
                        window.cadSystem.redraw();
                        window.cadSystem.sync3D();
                        const count = Object.values(this.restraints).filter(v => v === true).length;
                        this.showToastMessage(`${count} grado(s) de libertad restringido(s) en ${selectedNodes.length} nodo(s)`, 'success');
                    } else {
                        this.showToastMessage('No hay nodos seleccionados', 'warning');
                    }
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