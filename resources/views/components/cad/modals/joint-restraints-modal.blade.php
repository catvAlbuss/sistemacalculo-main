{{-- resources/views/components/cad/modals/joint-restraints-modal.blade.php
     Assign ▸ Joint ▸ Restraints, estilo ETABS "Joint Assignment - Restraints":
     checkboxes por dirección global + Fast Restraints con los soportes SVG.
     PILOTO de la migración Swal→Blade (fase JS parte b): el mixin solo valida
     la selección y dispara 'open-joint-restraints-modal'; el HTML vive aquí. --}}
<div x-data="jointRestraintsModal()"
     x-show="open"
     x-cloak
     @keydown.esc.window="close()"
     style="position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5)">

    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700" style="width:340px; max-width:95vw">

        {{-- Cabecera --}}
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">Joint Assignment - Restraints</h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="p-4 text-sm text-gray-200">
            {{-- Restraints in Global Directions --}}
            <fieldset class="border border-gray-600 rounded px-3 pb-3 pt-1 mb-4">
                <legend class="px-1 text-xs text-gray-400">Restraints in Global Directions</legend>
                <div class="grid grid-cols-2 gap-x-4 gap-y-2 mt-1">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" x-model="r.ux" class="accent-blue-500"> Translation X
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" x-model="r.rx" class="accent-blue-500"> Rotation about X
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" x-model="r.uy" class="accent-blue-500"> Translation Y
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" x-model="r.ry" class="accent-blue-500"> Rotation about Y
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" x-model="r.uz" class="accent-blue-500"> Translation Z
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" x-model="r.rz" class="accent-blue-500"> Rotation about Z
                    </label>
                </div>
            </fieldset>

            {{-- Fast Restraints (soportes del proyecto) --}}
            <fieldset class="border border-gray-600 rounded px-3 pb-3 pt-1">
                <legend class="px-1 text-xs text-gray-400">Fast Restraints</legend>
                <div class="flex items-center justify-center gap-3 mt-1">
                    <button @click="setFast('fixed')" title="Empotrado (todo restringido)"
                            class="bg-gray-200 hover:bg-white rounded p-1 border"
                            :class="fastActive('fixed') ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-500'">
                        <x-cad.svg.soporte1 />
                    </button>
                    <button @click="setFast('pinned')" title="Articulado (UX, UY, UZ)"
                            class="bg-gray-200 hover:bg-white rounded p-1 border"
                            :class="fastActive('pinned') ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-500'">
                        <x-cad.svg.soporte2 />
                    </button>
                    <button @click="setFast('roller')" title="Rodillo (UZ)"
                            class="bg-gray-200 hover:bg-white rounded p-1 border"
                            :class="fastActive('roller') ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-500'">
                        <x-cad.svg.soporte3 />
                    </button>
                    <button @click="setFast('free')" title="Libre (sin restricciones)"
                            class="bg-gray-200 hover:bg-white rounded p-1 border"
                            :class="fastActive('free') ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-500'">
                        <x-cad.svg.sinsoporte />
                    </button>
                </div>
            </fieldset>

            <div class="mt-2 text-[11px] text-gray-400 text-right" x-text="count + ' nodo(s) seleccionado(s)'"></div>
        </div>

        {{-- OK / Close / Apply, como ETABS --}}
        <div class="flex justify-center gap-2 px-4 py-3 border-t border-gray-700">
            <button @click="okAndClose()" class="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm">OK</button>
            <button @click="close()" class="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">Close</button>
            <button @click="apply()" class="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">Apply</button>
        </div>
    </div>
</div>

<script>
    function jointRestraintsModal() {
        return {
            open: false,
            count: 0,
            r: { ux: false, uy: false, uz: false, rx: false, ry: false, rz: false },

            presets: {
                fixed:  { ux: true,  uy: true,  uz: true,  rx: true,  ry: true,  rz: true  },
                pinned: { ux: true,  uy: true,  uz: true,  rx: false, ry: false, rz: false },
                roller: { ux: false, uy: false, uz: true,  rx: false, ry: false, rz: false },
                free:   { ux: false, uy: false, uz: false, rx: false, ry: false, rz: false },
            },

            init() {
                window.addEventListener('open-joint-restraints-modal', (e) => {
                    const cur = e.detail?.current || {};
                    ['ux', 'uy', 'uz', 'rx', 'ry', 'rz'].forEach((k) => { this.r[k] = !!cur[k]; });
                    this.count = e.detail?.count || 0;
                    this.open = true;
                });
            },

            close() { this.open = false; },

            setFast(name) {
                Object.assign(this.r, this.presets[name]);
            },

            fastActive(name) {
                const p = this.presets[name];
                return ['ux', 'uy', 'uz', 'rx', 'ry', 'rz'].every((k) => this.r[k] === p[k]);
            },

            apply() {
                window.cadSystem?.applyJointRestraintsFromModal?.({ ...this.r });
            },

            okAndClose() {
                this.apply();
                this.close();
            },
        };
    }
</script>
