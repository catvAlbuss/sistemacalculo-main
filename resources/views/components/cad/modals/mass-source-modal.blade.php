{{-- resources/views/components/cad/modals/mass-source-modal.blade.php --}}
<div x-data="massSourceModal()"
    x-init="init()"
    x-show="open"
    x-cloak
    class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70"
    @keydown.esc.window="close()">

    <div class="bg-gray-800 rounded-lg shadow-2xl w-[550px] max-h-[90vh] overflow-hidden border border-gray-700">
        {{-- Cabecera --}}
        <div class="px-4 py-3 border-b border-gray-700 bg-gray-900">
            <h3 class="text-lg font-semibold text-white">Definir Fuente de Masa</h3>
            <button @click="close()" class="float-right text-gray-400 hover:text-white">✕</button>
        </div>

        <div class="p-4 overflow-y-auto max-h-[75vh]">
            {{-- Mass Definition --}}
            <div class="mb-4 pb-3 border-b border-gray-700">
                <label class="block text-xs font-semibold text-blue-400 mb-2">Definición de Masa</label>
                <div class="space-y-2">
                    <label class="flex items-center gap-2">
                        <input type="radio" value="self" x-model="massSource.massDefinition" @change="toggleLoadMultipliers()">
                        <span class="text-sm text-gray-300">Desde Peso Propio y Masa Especificada</span>
                    </label>
                    <label class="flex items-center gap-2">
                        <input type="radio" value="loads" x-model="massSource.massDefinition" @change="toggleLoadMultipliers()">
                        <span class="text-sm text-gray-300">Desde Cargas</span>
                    </label>
                    <label class="flex items-center gap-2">
                        <input type="radio" value="both" x-model="massSource.massDefinition" @change="toggleLoadMultipliers()">
                        <span class="text-sm text-gray-300">Desde Peso Propio, Masa Especificada y Cargas</span>
                    </label>
                </div>
            </div>

            {{-- Define Mass Multiplier for Loads (se habilita solo cuando no está seleccionada la opción "self") --}}
            <div x-show="massSource.massDefinition !== 'self'" x-cloak class="mb-4 pb-3 border-b border-gray-700">
                <label class="block text-xs font-semibold text-blue-400 mb-2">Definir Multiplicador de Masa para Cargas</label>

                <div class="overflow-x-auto">
                    <table class="w-full text-sm mb-2">
                        <thead class="bg-gray-800">
                            <tr>
                                <th class="px-3 py-2 text-left text-gray-300">Carga</th>
                                <th class="px-3 py-2 text-left text-gray-300">Multiplicador</th>
                                <th class="px-3 py-2 w-8"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <template x-for="(loadItem, idx) in massSource.loadMultipliers" :key="idx">
                                <tr
                                    @click="selectLoadMultiplierRow(idx)"
                                    class="border-t border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors"
                                    :class="{'bg-blue-900': selectedLoadMultiplierRow === idx}">
                                    <td class="px-3 py-1"><span x-text="loadItem.load" class="text-gray-300"></span></td>
                                    <td class="px-3 py-1"><span x-text="loadItem.multiplier" class="text-gray-300"></span></td>
                                    <td class="px-3 py-1">
                                        <button @click.stop="deleteLoadMultiplierRow(idx)" class="text-red-400 hover:text-red-300">✕</button>
                                    </td>
                                    </td>
                            </template>
                            <tr x-show="massSource.loadMultipliers.length === 0">
                                <td colspan="3" class="px-3 py-4 text-center text-gray-500">No hay multiplicadores de carga definidos</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="flex gap-2 mt-2">
                    <div class="flex-1">
                        <select x-model="massSource.selectedLoad" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                            <option value="DEAD">DEAD</option>
                            <option value="LIVE">LIVE</option>
                            <option value="WIND">WIND</option>
                            <option value="SNOW">SNOW</option>
                            <option value="EARTHQUAKE">EARTHQUAKE</option>
                            <option value="ROOF LIVE">ROOF LIVE</option>
                        </select>
                    </div>
                    <div class="flex-1">
                        <input type="number" step="0.1" x-model="massSource.selectedMultiplier" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm" placeholder="Multiplicador">
                    </div>
                    <button @click="addLoadMultiplier()" class="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-white text-sm">Agregar</button>
                    <button @click="modifyLoadMultiplier()" class="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white text-sm" :class="{'opacity-50 cursor-not-allowed': selectedLoadMultiplierRow === null}">Modificar</button>
                    <button @click="deleteLoadMultiplier()" class="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-white text-sm" :class="{'opacity-50 cursor-not-allowed': selectedLoadMultiplierRow === null}">Eliminar</button>
                </div>
            </div>

            {{-- Opciones adicionales --}}
            <div class="mb-4">
                <div class="space-y-2">
                    <label class="flex items-center gap-2">
                        <input type="checkbox" x-model="massSource.includeLateralMassOnly">
                        <span class="text-sm text-gray-300">Incluir Solo Masa Lateral</span>
                    </label>
                    <label class="flex items-center gap-2">
                        <input type="checkbox" x-model="massSource.lumpLateralMassAtStoryLevels">
                        <span class="text-sm text-gray-300">Concentrar Masa Lateral en Niveles de Piso</span>
                    </label>
                </div>
            </div>
        </div>

        <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-gray-900">
            <button @click="close()" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded">Cancelar</button>
            <button @click="saveMassSource()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded">OK</button>
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

        input[type="number"] {
            -moz-appearance: textfield;
        }

        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
    </style>
</div>

<script>
    function massSourceModal() {
        return {
            open: false,

            selectedLoadMultiplierRow: null,

            massSource: {
                massDefinition: 'self', // 'self', 'loads', 'both'
                loadMultipliers: [{
                    load: 'DEAD',
                    multiplier: 1
                }],
                selectedLoad: 'DEAD',
                selectedMultiplier: 1,
                includeLateralMassOnly: false,
                lumpLateralMassAtStoryLevels: false
            },

            showToast: false,
            toastMessage: '',
            toastType: 'success',
            toastTimeout: null,

            init() {
                this.loadMassSource();
                window.addEventListener('open-mass-source-modal', () => {
                    this.openModal();
                });
            },

            loadMassSource() {
                if (window.cadSystem && window.cadSystem.massSource) {
                    this.massSource = window.cadSystem.massSource;
                }
            },

            showToastMessage(message, type) {
                if (this.toastTimeout) clearTimeout(this.toastTimeout);
                this.toastMessage = message;
                this.toastType = type || 'success';
                this.showToast = true;
                setTimeout(() => {
                    this.showToast = false;
                }, 3000);
            },

            openModal() {
                this.loadMassSource();
                this.selectedLoadMultiplierRow = null;
                this.open = true;
            },

            close() {
                this.open = false;
                this.selectedLoadMultiplierRow = null;
            },

            toggleLoadMultipliers() {
                // Cuando cambia la selección, reseteamos la selección de fila
                this.selectedLoadMultiplierRow = null;
            },

            selectLoadMultiplierRow(idx) {
                this.selectedLoadMultiplierRow = idx;
                if (idx !== null && idx < this.massSource.loadMultipliers.length) {
                    this.massSource.selectedLoad = this.massSource.loadMultipliers[idx].load;
                    this.massSource.selectedMultiplier = this.massSource.loadMultipliers[idx].multiplier;
                }
            },

            addLoadMultiplier() {
                if (this.massSource.selectedLoad && this.massSource.selectedMultiplier !== undefined) {
                    var exists = false;
                    for (var i = 0; i < this.massSource.loadMultipliers.length; i++) {
                        if (this.massSource.loadMultipliers[i].load === this.massSource.selectedLoad) {
                            exists = true;
                            break;
                        }
                    }
                    if (!exists) {
                        this.massSource.loadMultipliers.push({
                            load: this.massSource.selectedLoad,
                            multiplier: this.massSource.selectedMultiplier
                        });
                        this.showToastMessage('Multiplicador de carga agregado', 'success');
                    } else {
                        this.showToastMessage('La carga ya tiene un multiplicador definido', 'warning');
                    }
                }
            },

            modifyLoadMultiplier() {
                if (this.selectedLoadMultiplierRow !== null && this.selectedLoadMultiplierRow < this.massSource.loadMultipliers.length) {
                    var oldLoad = this.massSource.loadMultipliers[this.selectedLoadMultiplierRow].load;
                    this.massSource.loadMultipliers[this.selectedLoadMultiplierRow] = {
                        load: this.massSource.selectedLoad,
                        multiplier: this.massSource.selectedMultiplier
                    };
                    this.showToastMessage('Multiplicador modificado de "' + oldLoad + '" a "' + this.massSource.selectedLoad + '"', 'success');
                } else {
                    this.showToastMessage('Seleccione un multiplicador de la tabla para modificar', 'warning');
                }
            },

            deleteLoadMultiplier() {
                if (this.selectedLoadMultiplierRow !== null && this.selectedLoadMultiplierRow < this.massSource.loadMultipliers.length) {
                    var deletedLoad = this.massSource.loadMultipliers[this.selectedLoadMultiplierRow].load;
                    this.massSource.loadMultipliers.splice(this.selectedLoadMultiplierRow, 1);
                    this.selectedLoadMultiplierRow = null;
                    this.showToastMessage('Multiplicador de carga "' + deletedLoad + '" eliminado', 'success');
                } else {
                    this.showToastMessage('Seleccione un multiplicador de la tabla para eliminar', 'warning');
                }
            },

            deleteLoadMultiplierRow(idx) {
                var deletedLoad = this.massSource.loadMultipliers[idx].load;
                this.massSource.loadMultipliers.splice(idx, 1);
                if (this.selectedLoadMultiplierRow === idx) {
                    this.selectedLoadMultiplierRow = null;
                } else if (this.selectedLoadMultiplierRow > idx) {
                    this.selectedLoadMultiplierRow--;
                }
                this.showToastMessage('Multiplicador de carga "' + deletedLoad + '" eliminado', 'success');
            },

            saveMassSource() {
                var massSourceToSave = {
                    massDefinition: this.massSource.massDefinition,
                    loadMultipliers: JSON.parse(JSON.stringify(this.massSource.loadMultipliers)),
                    includeLateralMassOnly: this.massSource.includeLateralMassOnly,
                    lumpLateralMassAtStoryLevels: this.massSource.lumpLateralMassAtStoryLevels
                };

                if (window.cadSystem) {
                    window.cadSystem.massSource = massSourceToSave;

                    var message = '✅ Fuente de masa guardada: ';
                    if (massSourceToSave.massDefinition === 'self') {
                        message += 'Desde peso propio y masa especificada';
                    } else if (massSourceToSave.massDefinition === 'loads') {
                        message += 'Desde cargas';
                    } else {
                        message += 'Desde peso propio, masa especificada y cargas';
                    }
                    this.showToastMessage(message, 'success');

                    if (window.cadSystem.showMessage) {
                        window.cadSystem.showMessage(message);
                    }
                }

                this.close();
            }
        }
    }
</script>