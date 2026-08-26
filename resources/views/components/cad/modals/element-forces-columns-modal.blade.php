{{--
    Tabla "Element Forces - Columns" con las mismas columnas que la de ETABS,
    y filtrado MÚLTIPLE por Story / Column / Output Case / Step Type.

    Los filtros son <select multiple>: sin nada marcado = todos (igual que el
    diálogo de ETABS). Se pueden combinar, p. ej. Story1+Story2 × C1+C4.

    OJO con el signo de P: acá sale la convención de ANÁLISIS de ETABS
    (compresión NEGATIVA), opuesta a la del modal de diseño. No la convierte
    nadie — el motor ya entrega P así, y es la capa de diseño la que lo invierte.
    La nota completa está en el encabezado de elementForcesTable.js.
--}}
<div x-data="elementForcesColumnsModal()" x-show="open" x-cloak
     class="fixed inset-0 z-[70] flex items-center justify-center bg-black/60"
     @keydown.escape.window="close()">
    <div class="bg-gray-800 rounded-lg shadow-2xl w-[95vw] max-w-[1400px] max-h-[92vh] flex flex-col"
         @click.outside="close()">

        <div class="flex items-center justify-between px-4 py-2 bg-gray-900 rounded-t-lg">
            <h3 class="text-white font-bold text-sm">Element Forces - Columns</h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-xl leading-none">&times;</button>
        </div>

        {{-- Filtros --}}
        <div class="px-4 py-3 grid grid-cols-2 lg:grid-cols-4 gap-3 border-b border-gray-700">
            <template x-for="f in campos" :key="f.key">
                <div>
                    <div class="flex items-center justify-between mb-1">
                        <label class="text-[11px] text-gray-300 font-semibold" x-text="f.label"></label>
                        <button @click="filtros[f.key] = []"
                                class="text-[10px] text-blue-400 hover:text-blue-300"
                                x-show="filtros[f.key].length">limpiar</button>
                    </div>
                    <select multiple x-model="filtros[f.key]" @change="repaginar()"
                            class="w-full bg-gray-900 border border-gray-600 rounded text-[11px] text-white px-1 py-1"
                            :size="Math.min(6, Math.max(3, opciones[f.key].length))">
                        <template x-for="o in opciones[f.key]" :key="o">
                            <option :value="o" x-text="o"></option>
                        </template>
                    </select>
                    <div class="text-[10px] text-gray-500 mt-0.5"
                         x-text="filtros[f.key].length ? filtros[f.key].length + ' de ' + opciones[f.key].length : 'todos (' + opciones[f.key].length + ')'"></div>
                </div>
            </template>
        </div>

        <div class="px-4 py-2 flex items-center gap-3 text-[11px] text-gray-400 border-b border-gray-700 flex-wrap">
            {{-- Nuestro analisis usa 21 estaciones por barra (mejor resolucion del
                 maximo); ETABS reporta 3. Con 21 la tabla tiene 7x mas filas y no se
                 puede cruzar de a una. Esto NO cambia el calculo, solo que filas se
                 muestran. --}}
            <label class="flex items-center gap-1 cursor-pointer shrink-0">
                <input type="checkbox" x-model="soloEtabs" @change="repaginar()" class="accent-blue-600">
                Estaciones como ETABS (extremos + centro)
            </label>
            <span class="text-gray-600">·</span>
            <span><b x-text="filtradas.length.toLocaleString('es')"></b> filas
                <span class="text-gray-600">de <span x-text="rows.length.toLocaleString('es')"></span></span></span>
            <span x-show="filtradas.length > porPagina" class="flex items-center gap-1">
                · página
                <button @click="pagina = Math.max(0, pagina - 1)" :disabled="pagina === 0"
                        class="px-1.5 bg-gray-700 rounded disabled:opacity-40">‹</button>
                <span x-text="(pagina + 1) + ' / ' + totalPaginas"></span>
                <button @click="pagina = Math.min(totalPaginas - 1, pagina + 1)" :disabled="pagina >= totalPaginas - 1"
                        class="px-1.5 bg-gray-700 rounded disabled:opacity-40">›</button>
            </span>
            <button @click="copiarCsv('etabs')" class="ml-auto px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px]">
                <span x-text="copiado === 'etabs' ? '¡Copiado!' : 'Copiar CSV (formato ETABS)'"></span>
            </button>
            {{-- La hoja INPUT FORCE del Excel usa columnas B..M, sin Story ni
                 Case Type ni Step Type. Pegar el CSV de arriba ahí correría todo. --}}
            <button @click="copiarCsv('excel')" class="px-2 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[11px]"
                    title="Layout B..M de la hoja INPUT FORCE (la rama Max/Min va pegada al nombre del caso)">
                <span x-text="copiado === 'excel' ? '¡Copiado!' : 'Copiar para el Excel'"></span>
            </button>
        </div>

        {{-- Tabla --}}
        <div class="flex-1 overflow-auto px-4 pb-4">
            <table class="min-w-full text-[11px] whitespace-nowrap">
                <thead class="bg-gray-700 text-white sticky top-0">
                    <tr>
                        <template x-for="c in columnas" :key="c">
                            <th class="px-2 py-1 text-left font-semibold">
                                <span x-text="c"></span>
                                <span class="block text-[9px] font-normal text-gray-400" x-text="unidades[c] || ''"></span>
                            </th>
                        </template>
                    </tr>
                </thead>
                <tbody>
                    <template x-for="(r, i) in pagina_filas" :key="i">
                        <tr class="border-t border-gray-700 hover:bg-gray-700/40">
                            <template x-for="c in columnas" :key="c">
                                <td class="px-2 py-0.5"
                                    :class="numericas.has(c) ? 'text-right tabular-nums' : ''"
                                    x-text="numericas.has(c) ? Number(r[c] ?? 0).toFixed(4) : (r[c] ?? '')"></td>
                            </template>
                        </tr>
                    </template>
                </tbody>
            </table>
            <div x-show="!filtradas.length" class="text-center text-gray-500 py-8 text-xs">
                Ninguna fila pasa los filtros actuales.
            </div>
        </div>
    </div>
</div>

<script>
    function elementForcesColumnsModal() {
        return {
            open: false,
            rows: [],
            opciones: { story: [], column: [], outputCase: [], stepType: [] },
            filtros: { story: [], column: [], outputCase: [], stepType: [] },
            campos: [
                { key: 'story', label: 'Story' },
                { key: 'column', label: 'Column' },
                { key: 'outputCase', label: 'Output Case' },
                { key: 'stepType', label: 'Step Type' },
            ],
            columnas: [
                'Story', 'Column', 'Unique Name', 'Output Case', 'Case Type', 'Step Type',
                'Step Number', 'Station', 'P', 'V2', 'V3', 'T', 'M2', 'M3',
                'Element', 'Elem Station', 'Location',
            ],
            unidades: {
                Station: 'm', P: 'tonf', V2: 'tonf', V3: 'tonf',
                T: 'tonf-m', M2: 'tonf-m', M3: 'tonf-m', 'Elem Station': 'm',
            },
            numericas: new Set(['Station', 'P', 'V2', 'V3', 'T', 'M2', 'M3', 'Elem Station']),
            // Se pagina porque la tabla completa son decenas de miles de filas
            // (columnas x casos x ramas x estaciones) y el DOM no lo aguanta.
            porPagina: 300,
            pagina: 0,
            // Arranca en true: el uso principal de esta tabla es cruzarla contra
            // ETABS fila por fila.
            soloEtabs: true,
            copiado: null,   // null | 'etabs' | 'excel'

            init() {
                window.addEventListener('open-element-forces-columns', (e) => {
                    this.rows = e.detail?.rows || [];
                    this.opciones = e.detail?.options || this.opciones;
                    this.filtros = { story: [], column: [], outputCase: [], stepType: [] };
                    this.pagina = 0;
                    this.open = true;
                });
            },

            get filtradas() {
                const base = window.cadSystem?.filterElementForces?.(this.rows, this.filtros) || this.rows;
                return this.soloEtabs
                    ? (window.cadSystem?.elementForcesOnlyEtabsStations?.(base) || base)
                    : base;
            },
            get totalPaginas() {
                return Math.max(1, Math.ceil(this.filtradas.length / this.porPagina));
            },
            get pagina_filas() {
                const ini = this.pagina * this.porPagina;
                return this.filtradas.slice(ini, ini + this.porPagina);
            },

            repaginar() { this.pagina = 0; },

            async copiarCsv(formato) {
                const cs = window.cadSystem;
                const csv = formato === 'excel'
                    ? (cs?.elementForcesToExcelCsv?.(this.filtradas) || '')
                    : (cs?.elementForcesToCsv?.(this.filtradas) || '');
                try {
                    await navigator.clipboard.writeText(csv);
                    this.copiado = formato;
                    setTimeout(() => { this.copiado = null; }, 1800);
                } catch (err) {
                    console.warn('No se pudo copiar al portapapeles:', err);
                }
            },

            close() { this.open = false; },
        };
    }
</script>
