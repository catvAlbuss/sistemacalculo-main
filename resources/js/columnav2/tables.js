import { 
    colIngresoFuerzas, datosFijosB_Ingreso, 
    colSalidaFuerzas, datosFijosB_Salida,
    colIngresoFlector, flectorDataState, 
    colSalidaFlector, dataSalidaFlectorNominal, dataSalidaFlectorReducido,
    datosFijosSismo_Ingreso,
    sharedState
} from './config.js';
import { calcularFuerzasSalida } from './logicB.js';
import { calcularFlectorSalida } from './logicC.js';
import { calcularSeccionD } from './logicD.js';
import { renderInteractionSurface, clearInteractionSurface, render2DChart, clear2DChart } from './charts.js';

let tablaIngresoB, tablaSalidaB;
let tablaIngresoSismo;
let tablaIngresoC, tablaSalidaNominalC, tablaSalidaReducidaC;

const pendingButtonClass = "rounded border border-gray-300 bg-white px-4 py-1.5 text-[9px] font-semibold uppercase tracking-wide text-gray-700 transition-all hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600";
const savedButtonClass = "rounded border border-blue-500 bg-blue-600 px-4 py-1.5 text-[9px] font-semibold uppercase tracking-wide text-white transition-all hover:bg-blue-500";

function isDarkMode() {
    return document.documentElement.classList.contains('dark');
}

function getTabulatorTheme() {
    return isDarkMode() ? 'dark' : 'light';
}

const commonTableOptions = {
    layout: 'fitColumns',
    headerFilter: false,
    movableColumns: false,
};

export function initTables() {
    const theme = getTabulatorTheme();
    tablaIngresoB = new Tabulator("#tabulator-ingreso", { ...commonTableOptions, theme, data: datosFijosB_Ingreso, columns: colIngresoFuerzas });
    tablaSalidaB = new Tabulator("#tabulator-salida", { ...commonTableOptions, theme, data: datosFijosB_Salida, columns: colSalidaFuerzas });

    tablaIngresoSismo = new Tabulator("#tabulator-sismo-ingreso", { ...commonTableOptions, theme, data: datosFijosSismo_Ingreso, columns: colIngresoFuerzas });

    tablaIngresoC = new Tabulator("#tabulator-flector-ingreso", { ...commonTableOptions, theme, data: flectorDataState['Nominal'][0], columns: colIngresoFlector });
    tablaSalidaNominalC = new Tabulator("#tabulator-salida-nominal", { ...commonTableOptions, theme, data: dataSalidaFlectorNominal, columns: colSalidaFlector });
    tablaSalidaReducidaC = new Tabulator("#tabulator-salida-reducida", { ...commonTableOptions, theme, data: dataSalidaFlectorReducido, columns: colSalidaFlector });

    setupExcelPasteInterceptor();
    setupSismoPasteInterceptor();
    setupFlectorPasteInterceptor();

    const allTables = [tablaIngresoB, tablaSalidaB, tablaIngresoSismo, tablaIngresoC, tablaSalidaNominalC, tablaSalidaReducidaC];
    const themeObserver = new MutationObserver(() => {
        const theme = getTabulatorTheme();
        allTables.forEach(t => { if (t && t.setTheme) t.setTheme(theme); });
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
}

function setupExcelPasteInterceptor() {
    const modal = document.getElementById('modal-fuerzas');
    if (modal) {
        modal.addEventListener('paste', function(e) {
            let pasteText = (e.clipboardData || window.clipboardData).getData('text');
            
            if (pasteText.includes('\t')) {
                e.preventDefault();
                e.stopPropagation();
                
                if(document.activeElement) document.activeElement.blur();

                let rows = pasteText.trim().split('\n');
                let currentData = tablaIngresoB.getData();

                for(let i = 0; i < rows.length; i++) {
                    if(i < currentData.length) {
                        let cells = rows[i].split('\t');
                        let offset = cells.length >= 8 ? 2 : 0; 
                        
                        currentData[i].p  = cells[offset]   ? cells[offset].trim()   : currentData[i].p;
                        currentData[i].v2 = cells[offset+1] ? cells[offset+1].trim() : currentData[i].v2;
                        currentData[i].v3 = cells[offset+2] ? cells[offset+2].trim() : currentData[i].v3;
                        currentData[i].t  = cells[offset+3] ? cells[offset+3].trim() : currentData[i].t;
                        currentData[i].m2 = cells[offset+4] ? cells[offset+4].trim() : currentData[i].m2;
                        currentData[i].m3 = cells[offset+5] ? cells[offset+5].trim() : currentData[i].m3;
                    }
                }
                tablaIngresoB.replaceData(currentData);
            }
        }, true);
    }
}

function setupSismoPasteInterceptor() {
    const modal = document.getElementById('modal-sismo');
    if (modal) {
        modal.addEventListener('paste', function(e) {
            let pasteText = (e.clipboardData || window.clipboardData).getData('text');
            
            if (pasteText.includes('\t')) {
                e.preventDefault();
                e.stopPropagation();
                
                if(document.activeElement) document.activeElement.blur();

                let rows = pasteText.trim().split('\n');
                let currentData = tablaIngresoSismo.getData();

                for(let i = 0; i < rows.length; i++) {
                    if(i < currentData.length) {
                        let cells = rows[i].split('\t');
                        let offset = cells.length >= 8 ? 2 : 0; 
                        
                        currentData[i].p  = cells[offset]   ? cells[offset].trim()   : currentData[i].p;
                        currentData[i].v2 = cells[offset+1] ? cells[offset+1].trim() : currentData[i].v2;
                        currentData[i].v3 = cells[offset+2] ? cells[offset+2].trim() : currentData[i].v3;
                        currentData[i].t  = cells[offset+3] ? cells[offset+3].trim() : currentData[i].t;
                        currentData[i].m2 = cells[offset+4] ? cells[offset+4].trim() : currentData[i].m2;
                        currentData[i].m3 = cells[offset+5] ? cells[offset+5].trim() : currentData[i].m3;
                    }
                }
                tablaIngresoSismo.replaceData(currentData);
            }
        }, true);
    }
}

function setupFlectorPasteInterceptor() {
    const modal = document.getElementById('modal-flector');
    if (modal) {
        modal.addEventListener('paste', function(e) {
            let pasteText = (e.clipboardData || window.clipboardData).getData('text');
            
            if (pasteText.includes('\t')) {
                e.preventDefault();
                e.stopPropagation();
                
                if(document.activeElement) document.activeElement.blur();

                let rows = pasteText.trim().split('\n');
                let curvasActuales = flectorDataState[currentFlectorTipo];

                for(let r = 0; r < rows.length && r < 11; r++) { 
                    let cells = rows[r].split('\t');
                    let offset = cells.length >= 73 ? 1 : 0;

                    for(let c = 0; c < 24; c++) {
                        let baseIndex = offset + (c * 3);
                        if (baseIndex + 2 < cells.length) {
                            curvasActuales[c][r].p = cells[baseIndex].trim();
                            curvasActuales[c][r].m2 = cells[baseIndex + 1].trim();
                            curvasActuales[c][r].m3 = cells[baseIndex + 2].trim();
                        }
                    }
                }
                tablaIngresoC.replaceData(curvasActuales[currentCurveIndex]);
            }
        }, true);
    }
}

window.abrirModalFuerzas = function() { 
    const modal = document.getElementById('modal-fuerzas');
    if (modal) {
        modal.classList.remove('hidden'); 
        setTimeout(() => tablaIngresoB.redraw(), 100);
    }
};

window.cerrarModalFuerzas = function() { 
    const modal = document.getElementById('modal-fuerzas');
    if (modal) modal.classList.add('hidden'); 
};

window.limpiarTabla = function() {
    const btn = document.getElementById('btn-fuerzas');
    if (btn) btn.className = pendingButtonClass;
    let dataLimpia = datosFijosB_Ingreso.map(row => ({...row, p: "", v2: "", v3: "", t: "", m2: "", m3: ""}));
    tablaIngresoB.replaceData(dataLimpia);
    sharedState.vu2 = 0;
    sharedState.station0V2 = [];
    sharedState.station0V3 = [];
    calcularSeccionD();
};

window.guardarFuerzas = function() { 
    cerrarModalFuerzas(); 
    const btn = document.getElementById('btn-fuerzas');
    if (btn) btn.className = savedButtonClass; 
    
    const datosIngreso = tablaIngresoB.getData();
    const datosSalida = calcularFuerzasSalida(datosIngreso);
    tablaSalidaB.replaceData(datosSalida);

    const filasEstacionCero = datosIngreso.filter(fila => String(fila.station).trim() === "0");
    let maxAbsVu = 0;
    const v2s = [];
    const v3s = [];
    filasEstacionCero.forEach(fila => {
        const v2 = Math.abs(parseFloat(String(fila.v2).replace(',', '.')) || 0);
        const v3 = Math.abs(parseFloat(String(fila.v3).replace(',', '.')) || 0);
        v2s.push(parseFloat(String(fila.v2).replace(',', '.')) || 0);
        v3s.push(parseFloat(String(fila.v3).replace(',', '.')) || 0);
        maxAbsVu = Math.max(maxAbsVu, v2, v3);
    });
    sharedState.vu2 = maxAbsVu;
    sharedState.station0V2 = v2s;
    sharedState.station0V3 = v3s;

    calcularSeccionD();
};

window.abrirModalSismo = function() { 
    const modal = document.getElementById('modal-sismo');
    if (modal) {
        modal.classList.remove('hidden'); 
        setTimeout(() => tablaIngresoSismo.redraw(), 100);
    }
};

window.cerrarModalSismo = function() { 
    const modal = document.getElementById('modal-sismo');
    if (modal) modal.classList.add('hidden'); 
};

window.limpiarSismo = function() {
    const btn = document.getElementById('btn-sismo');
    if (btn) btn.className = pendingButtonClass;
    let dataLimpia = datosFijosSismo_Ingreso.map(row => ({...row, p: "", v2: "", v3: "", t: "", m2: "", m3: ""}));
    tablaIngresoSismo.replaceData(dataLimpia);
    sharedState.maxV2Sismo = 0;
    sharedState.maxV3Sismo = 0;
    calcularSeccionD();
};

window.guardarSismo = function() { 
    cerrarModalSismo(); 
    const btn = document.getElementById('btn-sismo');
    if (btn) btn.className = savedButtonClass; 
    
    const datosIngreso = tablaIngresoSismo.getData();

    let maxV2 = sharedState.maxV2Sismo;
    let maxV3 = sharedState.maxV3Sismo;
    datosIngreso.forEach(fila => {
        const v2 = parseFloat(String(fila.v2).replace(',', '.')) || 0;
        const v3 = parseFloat(String(fila.v3).replace(',', '.')) || 0;
        maxV2 = Math.max(maxV2, v2);
        maxV3 = Math.max(maxV3, v3);
    });
    sharedState.maxV2Sismo = maxV2;
    sharedState.maxV3Sismo = maxV3;

    calcularSeccionD();
};

let currentFlectorTipo = 'Nominal';
let currentCurveIndex = 0; 

window.abrirModalC = function(tipo) { 
    currentFlectorTipo = tipo;
    currentCurveIndex = 0; 
    const titulo = document.getElementById('titulo-modal-flector');
    if (titulo) titulo.innerHTML = `<i class="fas fa-layer-group text-gray-400 mr-2"></i> Matriz Flector: ${tipo}`;
    actualizarPaginacionUI();
    const modal = document.getElementById('modal-flector');
    if (modal) {
        modal.classList.remove('hidden'); 
        setTimeout(() => tablaIngresoC.redraw(), 100);
    }
};

window.cerrarModalC = function() { 
    const modal = document.getElementById('modal-flector');
    if (modal) modal.classList.add('hidden'); 
};

window.cambiarCurva = function(direccion) {
    flectorDataState[currentFlectorTipo][currentCurveIndex] = tablaIngresoC.getData();
    let nuevaCurva = currentCurveIndex + direccion;
    if(nuevaCurva >= 0 && nuevaCurva < 24) {
        currentCurveIndex = nuevaCurva;
        actualizarPaginacionUI();
    }
};

function actualizarPaginacionUI() {
    const texto = document.getElementById('texto-curva-actual');
    if (texto) texto.innerText = `CURVA ${currentCurveIndex + 1} DE 24`;
    tablaIngresoC.replaceData(flectorDataState[currentFlectorTipo][currentCurveIndex]);
}

window.limpiarFlector = function() {
    const btn = document.getElementById('btn-flector-' + currentFlectorTipo);
    if (btn) btn.className = pendingButtonClass;

    flectorDataState[currentFlectorTipo] = Array.from({length: 24}, () => 
        Array.from({length: 11}, (_, i) => ({ point: i + 1, p: "", m2: "", m3: "" }))
    );
    actualizarPaginacionUI();
    clearInteractionSurface(currentFlectorTipo);
    clear2DChart(currentFlectorTipo);
};

window.guardarFlector = function() {
    flectorDataState[currentFlectorTipo][currentCurveIndex] = tablaIngresoC.getData();

    const btn = document.getElementById('btn-flector-' + currentFlectorTipo);
    if (btn) btn.className = savedButtonClass;

    const curvas = flectorDataState[currentFlectorTipo];
    const datosSalida = calcularFlectorSalida(curvas);

    if (currentFlectorTipo === 'Nominal') {
        tablaSalidaNominalC.replaceData(datosSalida);
    } else {
        tablaSalidaReducidaC.replaceData(datosSalida);
    }

    renderInteractionSurface(currentFlectorTipo);

    const chart3dId = currentFlectorTipo === 'Nominal' ? 'chart-nom-1' : 'chart-red-1';
    const planInput = document.getElementById('angle-plan-' + chart3dId);
    const planDeg = planInput ? (parseFloat(planInput.value) || 0) : 0;
    render2DChart(currentFlectorTipo, planDeg);

    cerrarModalC();
};
