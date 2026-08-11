{{-- resources/views/components/cad/modals/reactions-display-modal.blade.php
     Calco simplificado del diálogo "Reactions" de ETABS: elegir un Load
     Case (CM/CVE/SDX/SDY) y qué componentes tabular (Fx..Mz). Al confirmar,
     superpone cajas de texto con esos valores junto a cada nodo con apoyo
     (renderer.js::drawJointReactionLabels). Sin Combo/Modal Case, sin
     Arrows, sin Contour Values — fuera de alcance por ahora.
     Lee/escribe cadSystem.reactionsDisplay vía
     mixins/analysis/seismic/reactions-display.js. --}}
<div x-data="reactionsDisplayModal()"
     x-show="open" x-cloak @keydown.esc.window="close()"
     style="position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5)">

    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700" style="width:380px; max-width:95vw">
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">Reactions</h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="p-4 text-sm text-gray-200 space-y-3">
            <fieldset class="border border-gray-600 rounded px-2 pb-2 pt-1">
                <legend class="px-1 text-xs text-gray-400">Load Case</legend>
                <div class="grid grid-cols-2 gap-1">
                    <template x-for="c in cases" :key="c">
                        <label class="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-700"
                               :class="[caseId === c ? 'bg-blue-900/50' : '', !available[c] ? 'opacity-40 cursor-not-allowed' : '']">
                            <input type="radio" name="rx-case" :value="c" x-model="caseId" :disabled="!available[c]" class="accent-blue-500">
                            <span x-text="c"></span>
                        </label>
                    </template>
                </div>
                <p class="text-[11px] text-gray-500 mt-1" x-show="!allAvailable">
                    Los casos en gris no tienen datos todavía — corre el análisis sísmico con ese caso definido.
                </p>
            </fieldset>

            <fieldset class="border border-gray-600 rounded px-2 pb-2 pt-1">
                <legend class="px-1 text-xs text-gray-400">Display Results for These Components</legend>
                <div class="grid grid-cols-2 gap-1">
                    <template x-for="comp in components" :key="comp">
                        <label class="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-700">
                            <input type="checkbox" x-model="selected[comp]" class="accent-blue-500">
                            <span x-text="comp"></span>
                        </label>
                    </template>
                </div>
            </fieldset>

            <div class="text-[11px] text-gray-400">
                Valores en Tonf / Tonf·m, junto a cada columna con soporte asignado.
            </div>
        </div>

        <div class="flex justify-between items-center gap-2 px-4 py-3 border-t border-gray-700">
            <button @click="turnOff()" class="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs">Apagar</button>
            <div class="flex gap-2">
                <button @click="okAndClose()" class="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm">OK</button>
                <button @click="apply()" class="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">Apply</button>
                <button @click="close()" class="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">Close</button>
            </div>
        </div>
    </div>
</div>

<script>
    function reactionsDisplayModal() {
        return {
            open: false,
            cases: ['CM', 'CVE', 'SDX', 'SDY'],
            components: ['Fx', 'Fy', 'Fz', 'Mx', 'My', 'Mz'],
            available: { CM: true, CVE: true, SDX: true, SDY: true },
            caseId: 'CM',
            selected: { Fx: true, Fy: true, Fz: true, Mx: true, My: true, Mz: true },

            get allAvailable() {
                return this.cases.every((c) => this.available[c]);
            },

            init() {
                window.addEventListener('open-reactions-display-modal', (e) => {
                    this.available = e.detail?.available || this.available;

                    const current = window.cadSystem?.reactionsDisplay;
                    if (current?.caseId) this.caseId = current.caseId;
                    if (current?.components) this.selected = { ...this.selected, ...current.components };

                    if (!this.available[this.caseId]) {
                        this.caseId = this.cases.find((c) => this.available[c]) || 'CM';
                    }

                    this.open = true;
                });
            },

            close() { this.open = false; },

            apply() {
                window.cadSystem?.applyReactionsDisplay?.(this.caseId, { ...this.selected });
            },

            okAndClose() { this.apply(); this.close(); },

            turnOff() {
                window.cadSystem?.toggleReactionsDisplay?.(false);
                this.close();
            },
        };
    }
</script>
