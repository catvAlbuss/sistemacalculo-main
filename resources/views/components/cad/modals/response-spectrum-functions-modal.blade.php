{{-- resources/views/components/cad/modals/response-spectrum-functions-modal.blade.php --}}
<div x-data="responseSpectrumFunctionsModal()"
    x-init="init()"
    x-show="open"
    x-cloak
    class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70"
    @keydown.esc.window="close()">

    {{-- Modal Principal - Lista de Funciones --}}
    <div x-show="view === 'list'" x-cloak class="bg-gray-800 rounded-lg shadow-2xl w-[550px] border border-gray-700">
        <div class="px-4 py-3 border-b border-gray-700 bg-gray-900">
            <h3 class="text-lg font-semibold text-white">Definir Funciones de Espectro de Respuesta</h3>
            <button @click="close()" class="float-right text-gray-400 hover:text-white">✕</button>
        </div>

        <div class="p-4">
            <div class="mb-2 text-xs text-gray-400">Funciones de Espectro de Respuesta</div>
            <div class="border border-gray-700 rounded-md bg-gray-900 max-h-64 overflow-y-auto">
                <table class="w-full text-sm">
                    <tbody>
                        <template x-for="func in functions" :key="func.name">
                            <tr
                                @click="selectFunction(func.name)"
                                class="border-t border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors"
                                :class="{'bg-blue-900': selectedFunctionName === func.name}">
                                <td class="px-4 py-2 text-gray-300 font-mono" x-text="func.name"></td>
                            </tr>
                        </template>
                        <tr x-show="functions.length === 0">
                            <td class="px-4 py-8 text-center text-gray-500">No hay funciones definidas</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="mt-3 text-xs text-gray-400">Haga clic para:</div>
            <div class="mt-2 space-y-1">
                <button @click="openAddFunctionDialog()" class="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-gray-700 rounded flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar Nueva Función...
                </button>
                <button @click="if(selectedFunctionName) openModifyFunctionDialog()" class="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-gray-700 rounded flex items-center gap-2" :class="{'opacity-50 cursor-not-allowed': !selectedFunctionName}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modificar/Mostrar Espectro...
                </button>
                <button @click="if(selectedFunctionName) confirmDeleteFunction()" class="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded flex items-center gap-2" :class="{'opacity-50 cursor-not-allowed': !selectedFunctionName}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar Espectro
                </button>
            </div>
        </div>

        <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-gray-900">
            <button @click="close()" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded">Cancelar</button>
            <button @click="close()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded">OK</button>
        </div>
    </div>

    {{-- Modal para agregar nuevo tipo de función --}}
    <div x-show="showAddFunctionTypeDialog" x-cloak class="fixed inset-0 z-[300] flex items-center justify-center bg-black/80" @click.away="showAddFunctionTypeDialog = false">
        <div class="bg-gray-800 rounded-lg shadow-2xl w-[400px] border border-gray-700">
            <div class="px-4 py-3 border-b border-gray-700 bg-gray-900">
                <h3 class="text-lg font-semibold text-white">Definir Funciones de Espectro de Respuesta</h3>
                <button @click="showAddFunctionTypeDialog = false" class="float-right text-gray-400 hover:text-white">✕</button>
            </div>
            <div class="p-4">
                <p class="text-sm text-gray-300 mb-3">Elija el tipo de función para agregar</p>
                <div class="space-y-2">
                    <button @click="openUBC97FunctionForm()" class="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm">
                        UBC 97
                    </button>
                    <button @click="showToastMessage('Función definida por usuario - Próximamente', 'info')" class="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm">
                        Definida por Usuario
                    </button>
                    <button @click="showToastMessage('Función de espectro italiano - Próximamente', 'info')" class="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm">
                        Italian Spectrum
                    </button>
                    <button @click="showToastMessage('Función de espectro de México - Próximamente', 'info')" class="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm">
                        Mexican Spectrum
                    </button>
                </div>
            </div>
            <div class="flex justify-end px-4 py-3 border-t border-gray-700 bg-gray-900">
                <button @click="showAddFunctionTypeDialog = false" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded">Cancelar</button>
            </div>
        </div>
    </div>

    {{-- Modal de Función UBC 97 (similar a la imagen) --}}
    <div x-show="view === 'ubc97Form'" x-cloak class="bg-gray-800 rounded-lg shadow-2xl w-[750px] max-h-[85vh] overflow-hidden border border-gray-700">
        <div class="px-4 py-3 border-b border-gray-700 bg-gray-900">
            <h3 class="text-lg font-semibold text-white">Función de Espectro de Respuesta UBC 97</h3>
            <button @click="backToList()" class="float-right text-gray-400 hover:text-white">✕</button>
        </div>

        <div class="p-4 overflow-y-auto max-h-[70vh]">
            {{-- Fila de Function Name y Damping Ratio --}}
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-xs font-semibold text-gray-400">Nombre de la Función</label>
                    <input x-model="ubc97Form.name" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-gray-400">Relación de Amortiguamiento</label>
                    <input type="number" step="0.01" x-model="ubc97Form.dampingRatio" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                </div>
            </div>

            {{-- Parámetros --}}
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-xs font-semibold text-gray-400">Parámetros</label>
                    <div class="space-y-2 mt-1">
                        <div>
                            <label class="text-xs text-gray-400">Coeficiente Sísmico, Ca</label>
                            <input type="number" step="0.01" x-model="ubc97Form.coefficientCa" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                        </div>
                        <div>
                            <label class="text-xs text-gray-400">Coeficiente Sísmico, Cv</label>
                            <input type="number" step="0.01" x-model="ubc97Form.coefficientCv" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                        </div>
                    </div>
                </div>

                {{-- Tabla de Periodo vs Aceleración --}}
                <div>
                    <label class="block text-xs font-semibold text-gray-400 mb-2">Definir Función</label>
                    <div class="border border-gray-700 rounded-md bg-gray-900">
                        <table class="w-full text-sm">
                            <thead class="bg-gray-800">
                                <tr>
                                    <th class="px-3 py-2 text-left text-gray-300">Periodo</th>
                                    <th class="px-3 py-2 text-left text-gray-300">Aceleración</th>
                                    <th class="px-3 py-2 w-8"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <template x-for="(point, idx) in ubc97Form.spectrumPoints" :key="idx">
                                    <tr class="border-t border-gray-700">
                                        <td class="px-3 py-1"><input type="number" step="any" x-model="point.period" class="w-24 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"></td>
                                        <td class="px-3 py-1"><input type="number" step="any" x-model="point.acceleration" class="w-24 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"></td>
                                        <td class="px-3 py-1"><button @click="removeSpectrumPoint(idx)" class="text-red-400 hover:text-red-300">✕</button></td>
                                    </tr>
                                </template>
                                <tr x-show="ubc97Form.spectrumPoints.length === 0">
                                    <td colspan="3" class="px-4 py-4 text-center text-gray-500">Sin puntos definidos</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="flex gap-2 mt-2">
                        <button @click="addSpectrumPoint()" class="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white text-sm">Agregar</button>
                        <button @click="modifySpectrumPoint()" class="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-white text-sm">Modificar</button>
                        <button @click="deleteSpectrumPoint()" class="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-white text-sm">Eliminar</button>
                        <button @click="convertToUserDefined()" class="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 rounded text-white text-sm">Convertir a Definido por Usuario</button>
                    </div>
                </div>
            </div>

            {{-- Gráfico de la función (en vivo, con hover de coordenadas) --}}
            <div class="border border-gray-700 rounded-md bg-gray-900 p-4 mb-4">
                <div class="text-center text-gray-400 text-sm mb-2">Gráfico de la Función — pasa el cursor para ver T y Sa</div>
                <div x-html="graphSvg" @mousemove="onGraphHover($event)" @mouseleave="hover = null"></div>
            </div>
        </div>

        <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-gray-900">
            <button @click="backToList()" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded">Cancelar</button>
            <button @click="saveUBC97Function()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded">OK</button>
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
    function responseSpectrumFunctionsModal() {
        return {
            open: false,
            view: 'list', // list, ubc97Form
            functions: [],
            selectedFunctionName: null,
            editingFunction: null,

            showAddFunctionTypeDialog: false,

            showToast: false,
            toastMessage: '',
            toastType: 'success',
            toastTimeout: null,

            hover: null, // {T, Sa} bajo el cursor del gráfico

            ubc97Form: {
                name: 'FUNC2',
                dampingRatio: 0.05,
                coefficientCa: 0.4,
                coefficientCv: 0.4,
                spectrumPoints: [{
                        period: 0,
                        acceleration: 0.4
                    },
                    {
                        period: 0.08,
                        acceleration: 1
                    },
                    {
                        period: 0.4,
                        acceleration: 0.6
                    },
                    {
                        period: 0.6667,
                        acceleration: 0.5
                    },
                    {
                        period: 0.8,
                        acceleration: 0.5
                    },
                    {
                        period: 1.2,
                        acceleration: 0.3333
                    },
                    {
                        period: 1.4,
                        acceleration: 0.2857
                    },
                    {
                        period: 1.6,
                        acceleration: 0.25
                    }
                ]
            },

            defaultFunctions: [{
                name: "ORY4-Elevation576",
                type: "UBC97",
                description: "Espectro UBC 97"
            }],

            init() {
                this.loadFunctions();
                window.addEventListener('open-response-spectrum-functions-modal', () => {
                    this.openModal();
                });
            },

            loadFunctions() {
                if (window.cadSystem && window.cadSystem.responseSpectrumFunctions && window.cadSystem.responseSpectrumFunctions.items && window.cadSystem.responseSpectrumFunctions.items.length > 0) {
                    this.functions = window.cadSystem.responseSpectrumFunctions.items;
                } else {
                    this.functions = JSON.parse(JSON.stringify(this.defaultFunctions));
                    if (window.cadSystem) {
                        if (!window.cadSystem.responseSpectrumFunctions) window.cadSystem.responseSpectrumFunctions = {};
                        window.cadSystem.responseSpectrumFunctions.items = this.functions;
                    }
                }
            },

            showToastMessage(message, type) {
                if (this.toastTimeout) clearTimeout(this.toastTimeout);
                this.toastMessage = message;
                this.toastType = type || 'success';
                this.showToast = true;
                setTimeout(() => {
                    this.showToast = false;
                }, 2500);
            },

            openModal() {
                this.loadFunctions();
                this.open = true;
                this.view = 'list';
                this.selectedFunctionName = null;
            },

            close() {
                this.open = false;
                this.view = 'list';
                this.selectedFunctionName = null;
                this.showAddFunctionTypeDialog = false;
            },

            selectFunction(name) {
                this.selectedFunctionName = name;
            },

            openAddFunctionDialog() {
                this.showAddFunctionTypeDialog = true;
            },

            openUBC97FunctionForm() {
                this.showAddFunctionTypeDialog = false;
                this.view = 'ubc97Form';
                this.ubc97Form = {
                    name: 'FUNC' + (this.functions.length + 1),
                    dampingRatio: 0.05,
                    coefficientCa: 0.4,
                    coefficientCv: 0.4,
                    spectrumPoints: [{
                            period: 0,
                            acceleration: 0.4
                        },
                        {
                            period: 0.08,
                            acceleration: 1
                        },
                        {
                            period: 0.4,
                            acceleration: 0.6
                        },
                        {
                            period: 0.6667,
                            acceleration: 0.5
                        },
                        {
                            period: 0.8,
                            acceleration: 0.5
                        },
                        {
                            period: 1.2,
                            acceleration: 0.3333
                        },
                        {
                            period: 1.4,
                            acceleration: 0.2857
                        },
                        {
                            period: 1.6,
                            acceleration: 0.25
                        }
                    ]
                };
            },

            openModifyFunctionDialog() {
                var func = null;
                for (var i = 0; i < this.functions.length; i++) {
                    if (this.functions[i].name === this.selectedFunctionName) {
                        func = this.functions[i];
                        break;
                    }
                }
                if (func) {
                    if (func.type === 'UBC97' || !func.type) {
                        this.editingFunction = func;
                        this.ubc97Form = {
                            name: func.name,
                            dampingRatio: func.dampingRatio || 0.05,
                            coefficientCa: func.coefficientCa || 0.4,
                            coefficientCv: func.coefficientCv || 0.4,
                            spectrumPoints: func.spectrumPoints || [{
                                    period: 0,
                                    acceleration: 0.4
                                },
                                {
                                    period: 0.08,
                                    acceleration: 1
                                },
                                {
                                    period: 0.4,
                                    acceleration: 0.6
                                },
                                {
                                    period: 0.6667,
                                    acceleration: 0.5
                                }
                            ]
                        };
                        this.view = 'ubc97Form';
                    }
                }
            },

            backToList() {
                this.view = 'list';
                this.editingFunction = null;
            },

            addSpectrumPoint() {
                this.ubc97Form.spectrumPoints.push({
                    period: 0,
                    acceleration: 0
                });
            },

            removeSpectrumPoint(idx) {
                this.ubc97Form.spectrumPoints.splice(idx, 1);
            },

            modifySpectrumPoint() {
                this.showToastMessage('Seleccione un punto de la tabla para modificar', 'info');
            },

            deleteSpectrumPoint() {
                this.showToastMessage('Seleccione un punto de la tabla para eliminar', 'info');
            },

            convertToUserDefined() {
                this.showToastMessage('Conversión a función definida por usuario - Próximamente', 'info');
            },

            // Geometría del gráfico (escalas + puntos ordenados).
            _graphGeom() {
                const pts = (this.ubc97Form.spectrumPoints || [])
                    .map((p) => ({ T: Number(p.period) || 0, Sa: Number(p.acceleration) || 0 }))
                    .filter((p) => Number.isFinite(p.T) && Number.isFinite(p.Sa))
                    .sort((a, b) => a.T - b.T);
                const W = 440, H = 200, ML = 46, MR = 12, MT = 10, MB = 28;
                const plotW = W - ML - MR, plotH = H - MT - MB;
                const maxT = Math.max(0.1, ...pts.map((p) => p.T));
                const maxSa = Math.max(0.01, ...pts.map((p) => p.Sa)) * 1.1;
                const sx = (t) => ML + (t / maxT) * plotW;
                const sy = (s) => MT + plotH - (s / maxSa) * plotH;
                return { pts, W, H, ML, MR, MT, MB, plotW, plotH, maxT, maxSa, sx, sy };
            },

            // SVG del espectro (reactivo: se redibuja al cambiar puntos o hover).
            get graphSvg() {
                const g = this._graphGeom();
                if (!g.pts.length) {
                    return '<div style="color:#64748b;text-align:center;padding:30px;font-size:12px">Sin puntos para graficar</div>';
                }
                const line = g.pts.map((p) => `${g.sx(p.T).toFixed(1)},${g.sy(p.Sa).toFixed(1)}`).join(' ');
                const xt = [0, g.maxT / 2, g.maxT].map((t) =>
                    `<line x1="${g.sx(t)}" y1="${g.MT + g.plotH}" x2="${g.sx(t)}" y2="${g.MT + g.plotH + 4}" stroke="#475569"/>` +
                    `<text x="${g.sx(t)}" y="${g.MT + g.plotH + 15}" text-anchor="middle" fill="#94a3b8" font-size="9">${t.toFixed(2)}</text>`).join('');
                const yt = [0, g.maxSa / 2, g.maxSa].map((s) =>
                    `<line x1="${g.ML - 4}" y1="${g.sy(s)}" x2="${g.ML}" y2="${g.sy(s)}" stroke="#475569"/>` +
                    `<text x="${g.ML - 7}" y="${g.sy(s) + 3}" text-anchor="end" fill="#94a3b8" font-size="9">${s.toFixed(3)}</text>`).join('');
                let cur = '';
                if (this.hover) {
                    const cx = g.sx(this.hover.T), cy = g.sy(this.hover.Sa);
                    const tx = Math.min(cx + 6, g.ML + g.plotW - 92);
                    cur = `<line x1="${cx}" y1="${g.MT}" x2="${cx}" y2="${g.MT + g.plotH}" stroke="#64748b" stroke-dasharray="3"/>` +
                        `<circle cx="${cx}" cy="${cy}" r="3" fill="#ffffff"/>` +
                        `<rect x="${tx}" y="${cy - 22}" width="90" height="16" fill="#1e293b" stroke="#475569" rx="3"/>` +
                        `<text x="${tx + 4}" y="${cy - 10}" fill="#e2e8f0" font-size="9">T=${this.hover.T.toFixed(2)}  Sa=${this.hover.Sa.toFixed(4)}</text>`;
                }
                return `<svg width="${g.W}" height="${g.H}" style="background:#0f172a;border-radius:4px;cursor:crosshair;width:100%;height:auto">` +
                    `<rect x="${g.ML}" y="${g.MT}" width="${g.plotW}" height="${g.plotH}" fill="none" stroke="#334155"/>` +
                    `${xt}${yt}<polyline points="${line}" fill="none" stroke="#a78bfa" stroke-width="2"/>${cur}` +
                    `<text x="${g.ML + g.plotW / 2}" y="${g.H - 3}" text-anchor="middle" fill="#cbd5e1" font-size="9">Periodo T (s)</text>` +
                    `<text x="11" y="${g.MT + g.plotH / 2}" text-anchor="middle" fill="#cbd5e1" font-size="9" transform="rotate(-90 11 ${g.MT + g.plotH / 2})">Sa</text>` +
                    `</svg>`;
            },

            // Cursor sobre el gráfico → calcula T y Sa (interpolando la curva).
            onGraphHover(e) {
                const g = this._graphGeom();
                const svg = e.currentTarget.querySelector('svg');
                if (!g.pts.length || !svg) { this.hover = null; return; }
                const rect = svg.getBoundingClientRect();
                const px = (e.clientX - rect.left) * (g.W / (rect.width || g.W));
                if (px < g.ML || px > g.ML + g.plotW) { this.hover = null; return; }
                let T = Math.max(0, Math.min(g.maxT, (px - g.ML) / g.plotW * g.maxT));
                const pts = g.pts;
                let Sa = pts[pts.length - 1].Sa;
                if (T <= pts[0].T) Sa = pts[0].Sa;
                else for (let i = 1; i < pts.length; i++) {
                    if (T <= pts[i].T) {
                        const a = pts[i - 1], b = pts[i];
                        Sa = a.Sa + (T - a.T) / ((b.T - a.T) || 1) * (b.Sa - a.Sa);
                        break;
                    }
                }
                this.hover = { T, Sa };
            },

            saveUBC97Function() {
                if (!this.ubc97Form.name) {
                    this.showToastMessage('El nombre de la función es requerido', 'error');
                    return;
                }

                var functionToSave = {
                    name: this.ubc97Form.name,
                    type: 'UBC97',
                    dampingRatio: this.ubc97Form.dampingRatio,
                    coefficientCa: this.ubc97Form.coefficientCa,
                    coefficientCv: this.ubc97Form.coefficientCv,
                    spectrumPoints: JSON.parse(JSON.stringify(this.ubc97Form.spectrumPoints)),
                    description: 'Espectro UBC 97 - ' + this.ubc97Form.name
                };

                if (this.editingFunction) {
                    for (var j = 0; j < this.functions.length; j++) {
                        if (this.functions[j].name === this.editingFunction.name) {
                            this.functions[j] = functionToSave;
                            break;
                        }
                    }
                    this.showToastMessage('Función "' + functionToSave.name + '" modificada', 'success');
                } else {
                    var exists = false;
                    for (var i = 0; i < this.functions.length; i++) {
                        if (this.functions[i].name === functionToSave.name) {
                            exists = true;
                            break;
                        }
                    }
                    if (exists) {
                        this.showToastMessage('La función "' + functionToSave.name + '" ya existe', 'error');
                        return;
                    }
                    this.functions.push(functionToSave);
                    this.showToastMessage('Función "' + functionToSave.name + '" agregada', 'success');
                }

                if (window.cadSystem) {
                    if (!window.cadSystem.responseSpectrumFunctions) window.cadSystem.responseSpectrumFunctions = {};
                    window.cadSystem.responseSpectrumFunctions.items = this.functions;
                }

                this.view = 'list';
                this.selectedFunctionName = functionToSave.name;
                this.editingFunction = null;
            },

            confirmDeleteFunction: function() {
                if (!this.selectedFunctionName) {
                    this.showToastMessage('Por favor seleccione una función para eliminar', 'warning');
                    return;
                }

                if (confirm('¿Está seguro de eliminar la función "' + this.selectedFunctionName + '"?')) {
                    var newFunctions = [];
                    for (var i = 0; i < this.functions.length; i++) {
                        if (this.functions[i].name !== this.selectedFunctionName) {
                            newFunctions.push(this.functions[i]);
                        }
                    }
                    this.functions = newFunctions;
                    this.selectedFunctionName = null;

                    if (window.cadSystem) {
                        if (!window.cadSystem.responseSpectrumFunctions) window.cadSystem.responseSpectrumFunctions = {};
                        window.cadSystem.responseSpectrumFunctions.items = this.functions;
                    }
                    this.showToastMessage('Función eliminada', 'success');
                }
            }
        }
    }
</script>