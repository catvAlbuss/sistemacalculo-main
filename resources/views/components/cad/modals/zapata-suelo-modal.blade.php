{{-- resources/views/components/cad/modals/zapata-suelo-modal.blade.php
     Agrupa en un solo modal los datos del estudio de suelos (K de balasto,
     capacidad portante AASHTO LRFD/Vesic — ver conversación, Categoría D
     puntos 1-2, y soilCapacity.js) más la malla del solver de elementos
     finitos (Bloque 3b/6b) — antes eran 3 grupos de inputs sueltos siempre
     visibles en el ribbon "Cimentación"; se agrupan acá para no saturarlo,
     mismo patrón de mass-source-modal.blade.php (lee de window.cadSystem al
     abrir, escribe de vuelta al presionar "Guardar").

     No usa saveUndoState/markAnalysisResultsOutdated como los diálogos de
     asignación -- estos valores solo se leen la próxima vez que se presione
     "Calcular Zapatas" (mismo comportamiento que ya tenían Df/γe en el
     ribbon), no hay nada "desactualizado" por cambiarlos. --}}
<div x-data="zapataSueloModal()"
    x-init="init()"
    x-show="open"
    x-cloak
    class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70"
    @keydown.esc.window="close()">

    <div class="bg-gray-800 rounded-lg shadow-2xl w-[420px] border border-gray-700">
        <div class="px-4 py-3 border-b border-gray-700 bg-gray-900">
            <h3 class="text-lg font-semibold text-white">Datos del estudio de suelos</h3>
            <button @click="close()" class="float-right text-gray-400 hover:text-white">✕</button>
        </div>

        <div class="p-4 space-y-4">
            <div>
                <label class="block text-xs font-semibold text-blue-400 mb-2">Estudio de suelos</label>
                <div class="space-y-2">
                    <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-300 flex-1">Tipo de suelo</span>
                        <select x-model="form.soilType"
                            class="w-32 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                            <option value="cohesivo">Cohesivo</option>
                            <option value="arenoso">Arenoso</option>
                        </select>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-300 flex-1" title="Módulo de balasto del ensayo de placa — vacío = no calcular K">K30 (Tonf/m³)</span>
                        <input type="number" step="any" x-model.number="form.k30"
                            class="w-32 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-300 flex-1" title="Cohesión del suelo">c' (Tonf/m²)</span>
                        <input type="number" step="any" x-model.number="form.cPrime"
                            class="w-32 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-300 flex-1" title="Ángulo de fricción interna — vacío = no calcular capacidad portante">φ' (grados)</span>
                        <input type="number" step="any" x-model.number="form.phiPrime"
                            class="w-32 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-300 flex-1" title="Profundidad del nivel freático desde la superficie — vacío = no afecta la capacidad portante">Dw (m)</span>
                        <input type="number" step="any" x-model.number="form.dw"
                            class="w-32 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                    </div>
                </div>
                <p class="text-[11px] text-gray-500 mt-2">K30, φ' y Dw son opcionales — si quedan vacíos, esos cálculos (K de balasto / capacidad portante AASHTO) simplemente no se hacen.</p>
            </div>

            <div class="pt-3 border-t border-gray-700">
                <label class="block text-xs font-semibold text-blue-400 mb-2">Avanzado</label>
                <p class="text-[11px] text-gray-500 mb-2">Malla del solver de elementos finitos (Bloque 3b/6b, momento y cortante) — igual que "Mesh Object into N by M Elements" de ETABS: N va al lado LARGO de la zapata y M al lado CORTO (no fijo a X/Y, ya que cada zapata puede tener cualquier orientación).</p>
                <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-300 flex-1" title="Elementos en el lado LARGO de la zapata">N (lado largo)</span>
                    <input type="number" step="1" min="4" max="200" x-model.number="form.meshN"
                        class="w-32 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                </div>
                <div class="flex items-center gap-2 mt-2">
                    <span class="text-sm text-gray-300 flex-1" title="Elementos en el lado CORTO de la zapata">M (lado corto)</span>
                    <input type="number" step="1" min="4" max="200" x-model.number="form.meshM"
                        class="w-32 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                </div>
                <p class="text-[11px] text-gray-500 mt-2">Por defecto 50 y 50 — en uso normal no hace falta tocarlas. Si N y M no quedan proporcionales al largo/ancho real, los elementos pueden salir alargados y dar resultados menos confiables (mismo motivo por el que conviene declarar una malla razonable en ETABS).</p>
            </div>
        </div>

        <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-gray-900">
            <button @click="close()" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded">Cancelar</button>
            <button @click="save()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded">Guardar</button>
        </div>
    </div>
</div>

<script>
    function zapataSueloModal() {
        return {
            open: false,
            form: { soilType: 'cohesivo', k30: null, cPrime: 0, phiPrime: null, dw: null, meshN: 50, meshM: 50 },

            init() {
                window.addEventListener('open-zapata-suelo-modal', () => this.openModal());
            },

            openModal() {
                const cs = window.cadSystem || {};
                this.form = {
                    soilType: cs.zapataSoilType ?? 'cohesivo',
                    k30: cs.zapataK30 ?? null,
                    cPrime: cs.zapataCPrime ?? 0,
                    phiPrime: cs.zapataPhiPrime ?? null,
                    dw: cs.zapataDw ?? null,
                    meshN: cs.zapataShellMeshN ?? 50,
                    meshM: cs.zapataShellMeshM ?? 50,
                };
                this.open = true;
            },

            close() {
                this.open = false;
            },

            save() {
                if (window.cadSystem) {
                    window.cadSystem.zapataSoilType = this.form.soilType;
                    window.cadSystem.zapataK30 = this.form.k30;
                    window.cadSystem.zapataCPrime = this.form.cPrime;
                    window.cadSystem.zapataPhiPrime = this.form.phiPrime;
                    window.cadSystem.zapataDw = this.form.dw;
                    window.cadSystem.zapataShellMeshN = this.form.meshN;
                    window.cadSystem.zapataShellMeshM = this.form.meshM;
                }
                this.close();
            },
        };
    }
</script>
