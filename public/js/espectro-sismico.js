/**
 * ESPECTRO SÍSMICO - NORMA E.030 (1977-2026)
 * Adaptado para Livewire & Laravel
 */

// ════════════════════════════════════════════════════════
// PARÁMETROS POR VERSIÓN DE NORMA
// ════════════════════════════════════════════════════════

const ZONA_Z_1977 = { 1: 0.40, 2: 0.70, 3: 1.00 };
const SUELO_PARAMS_1977 = {
    S1: { S: 1.0, Tp: 0.40 },
    S2: { S: 1.2, Tp: 0.60 },
    S3: { S: 1.5, Tp: 0.90 },
};

const ZONA_Z_1997 = { 1: 0.15, 2: 0.30, 3: 0.40 };
const SUELO_PARAMS_1997 = {
    S1: { S: 1.0, Tp: 0.4 },
    S2: { S: 1.2, Tp: 0.6 },
    S3: { S: 1.4, Tp: 0.9 },
    S4: { S: 1.4, Tp: 0.9 },
};

const ZONA_Z_2003 = { 1: 0.15, 2: 0.30, 3: 0.40 };
const SUELO_PARAMS_2003 = {
    S1: { S: 1.0, Tp: 0.4 },
    S2: { S: 1.2, Tp: 0.6 },
    S3: { S: 1.4, Tp: 0.9 },
    S4: { S: 1.4, Tp: 0.9 },
};

const ZONA_Z_2016 = { 1: 0.10, 2: 0.25, 3: 0.35, 4: 0.45 };
const FACTOR_S_2016 = {
    Z4_S0: 0.80, Z4_S1: 1.00, Z4_S2: 1.05, Z4_S3: 1.10,
    Z3_S0: 0.80, Z3_S1: 1.00, Z3_S2: 1.15, Z3_S3: 1.20,
    Z2_S0: 0.80, Z2_S1: 1.00, Z2_S2: 1.20, Z2_S3: 1.40,
    Z1_S0: 0.80, Z1_S1: 1.00, Z1_S2: 1.60, Z1_S3: 2.00,
};
const SUELO_PARAMS_2016 = {
    S0: { Tp: 0.3, Tl: 3.0 },
    S1: { Tp: 0.4, Tl: 2.5 },
    S2: { Tp: 0.6, Tl: 2.0 },
    S3: { Tp: 1.0, Tl: 1.6 },
};

const ZONA_Z_2026 = { 1: 0.10, 2: 0.25, 3: 0.35, 4: 0.45 };
const FACTOR_S_2026 = {
    Z4_S0: 0.80, Z4_S1: 1.00, Z4_S2: 1.05, Z4_S3: 1.10, Z4_S4: 1.10, Z4_S5: 1.10,
    Z3_S0: 0.80, Z3_S1: 1.00, Z3_S2: 1.15, Z3_S3: 1.20, Z3_S4: 1.20, Z3_S5: 1.20,
    Z2_S0: 0.80, Z2_S1: 1.00, Z2_S2: 1.20, Z2_S3: 1.40, Z2_S4: 1.40, Z2_S5: 1.40,
    Z1_S0: 0.80, Z1_S1: 1.00, Z1_S2: 1.60, Z1_S3: 2.00, Z1_S4: 2.00, Z1_S5: 2.00,
};
const SUELO_PARAMS_2026 = {
    S0: { Tp: 0.3, Tl: 3.0 },
    S1: { Tp: 0.4, Tl: 2.5 },
    S2: { Tp: 0.6, Tl: 2.0 },
    S3: { Tp: 1.0, Tl: 1.6 },
    S4: { Tp: 1.0, Tl: 1.6 },
    S5: { Tp: 1.0, Tl: 1.6 },
};

// ════════════════════════════════════════════════════════
// VARIABLES GLOBALES
// ════════════════════════════════════════════════════════

let datosEspectro = [];
let chartInstance = null;

// ════════════════════════════════════════════════════════
// FACTOR C - Amplificación sísmica
// ════════════════════════════════════════════════════════

function factorC(T, Tp, Tl, version) {
    if (version === '1977') {
        return T <= Tp ? 1 + 1.5 * (T / Tp) : Tp / T;
    }
    if (version === '1997' || version === '2003') {
        return T <= Tp ? 1 + 1.5 * (T / Tp) : Tp / T;
    }
    if (version === '2016' || version === '2018') {
        return T <= Tp ? 1 + 1.5 * (T / Tp) : (Tp / T);
    }
    // 2026: rampa inicial Art. 18
    if (T < 0.2 * Tp) return 1 + 7.5 * (T / Tp);
    if (T <= Tp) return 2.5;
    if (T <= Tl) return 2.5 * (Tp / T);
    return 2.5 * (Tp * Tl) / (T * T);
}

// ════════════════════════════════════════════════════════
// RESOLVER PARÁMETROS Z, S, Tp, Tl
// ════════════════════════════════════════════════════════

function resolveParams(version, zonaVal, sueloVal) {
    if (version === '1977') {
        const Z = ZONA_Z_1977[zonaVal];
        const params = SUELO_PARAMS_1977[sueloVal];
        return { Z, S: params.S, Tp: params.Tp, Tl: null };
    }
    if (version === '1997') {
        const Z = ZONA_Z_1997[zonaVal];
        const params = SUELO_PARAMS_1997[sueloVal];
        return { Z, S: params.S, Tp: params.Tp, Tl: null };
    }
    if (version === '2003') {
        const Z = ZONA_Z_2003[zonaVal];
        const params = SUELO_PARAMS_2003[sueloVal];
        return { Z, S: params.S, Tp: params.Tp, Tl: null };
    }
    if (version === '2016' || version === '2018') {
        const Z = ZONA_Z_2016[zonaVal];
        const sKey = `Z${zonaVal}_${sueloVal}`;
        const S = FACTOR_S_2016[sKey] || 1.0;
        const params = SUELO_PARAMS_2016[sueloVal];
        return { Z, S, Tp: params.Tp, Tl: params.Tl };
    }
    if (version === '2026') {
        const Z = ZONA_Z_2026[zonaVal];
        const sKey = `Z${zonaVal}_${sueloVal}`;
        const S = FACTOR_S_2026[sKey] || 1.0;
        const params = SUELO_PARAMS_2026[sueloVal];
        return { Z, S, Tp: params.Tp, Tl: params.Tl };
    }
    return null;
}

// ════════════════════════════════════════════════════════
// CALCULAR ESPECTRO SÍSMICO
// ════════════════════════════════════════════════════════

function calcularEspectro(config) {
    const { normaVersion, zonaVal, sueloVal, U, R_base, Ip, Ia, Tmax, paso, Ts } = config;

    const params = resolveParams(normaVersion, parseInt(zonaVal), sueloVal);
    if (!params) {
        console.error('Parámetros inválidos');
        return [];
    }

    const { Z, S, Tp, Tl } = params;
    const IaEf = ['2016', '2018', '2026'].includes(normaVersion) ? Ia : 1.0;
    const IpEf = ['2016', '2018', '2026'].includes(normaVersion) ? Ip : 1.0;
    const R = R_base * IaEf * IpEf;

    datosEspectro = [];
    for (let T = 0; T <= Tmax; T += paso) {
        const C = factorC(T, Tp, Tl, normaVersion);
        const Sa = (Z * U * C * S) / R;
        datosEspectro.push({
            T: parseFloat(T.toFixed(3)),
            C: parseFloat(C.toFixed(4)),
            Sa: parseFloat(Sa.toFixed(5)),
            Sa_cms: parseFloat((Sa * 9.81 * 100).toFixed(2)),
        });
    }

    return datosEspectro;
}

// ════════════════════════════════════════════════════════
// RENDERIZAR GRÁFICO CON CHART.JS
// ════════════════════════════════════════════════════════

function renderChart(datos, Tp, Tl) {
    const ctx = document.getElementById('espectroChart');
    if (!ctx) return;

    // Destruir gráfico anterior si existe
    if (chartInstance) {
        chartInstance.destroy();
    }

    const T_values = datos.map(d => d.T);
    const Sa_values = datos.map(d => d.Sa);

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: T_values,
            datasets: [
                {
                    label: 'Sa (g)',
                    data: Sa_values,
                    borderColor: '#00e5ff',
                    backgroundColor: 'rgba(0, 229, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointBackgroundColor: '#00e5ff',
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#c8d8f0',
                        font: { family: "'Share Tech Mono', monospace" },
                    },
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 21, 40, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#c8d8f0',
                    borderColor: '#00e5ff',
                    borderWidth: 1,
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Período T (s)',
                        color: '#c8d8f0',
                        font: { family: "'Share Tech Mono', monospace", weight: '600' },
                    },
                    grid: {
                        color: 'rgba(30, 45, 74, 0.3)',
                    },
                    ticks: {
                        color: '#5a7090',
                        font: { family: "'Share Tech Mono', monospace" },
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: 'Aceleración Espectral Sa (g)',
                        color: '#c8d8f0',
                        font: { family: "'Share Tech Mono', monospace", weight: '600' },
                    },
                    grid: {
                        color: 'rgba(30, 45, 74, 0.3)',
                    },
                    ticks: {
                        color: '#5a7090',
                        font: { family: "'Share Tech Mono', monospace" },
                    },
                },
            },
        },
    });
}

// ════════════════════════════════════════════════════════
// ESCUCHAR EVENTOS DE LIVEWIRE
// ════════════════════════════════════════════════════════

document.addEventListener('livewire:init', () => {
    // Escuchar evento de cálculo desde Livewire
    Livewire.on('calcularEspectro', (config) => {
        const datos = calcularEspectro(config[0]);
        
        const params = resolveParams(config[0].normaVersion, parseInt(config[0].zonaVal), config[0].sueloVal);
        renderChart(datos, params.Tp, params.Tl);
        mostrarParametrosCalculados(params, config[0]);
    });
});

// ════════════════════════════════════════════════════════
// MOSTRAR PARÁMETROS CALCULADOS
// ════════════════════════════════════════════════════════

function mostrarParametrosCalculados(params, config) {
    const container = document.querySelector('.params-grid');
    if (!container) return;

    const IaEf = ['2016', '2018', '2026'].includes(config.normaVersion) ? config.Ia : 1.0;
    const IpEf = ['2016', '2018', '2026'].includes(config.normaVersion) ? config.Ip : 1.0;
    const R = config.R_base * IaEf * IpEf;
    const SaMax = params.Z * config.U * 2.5 * params.S / R;

    const html = `
        <div class="param-item">
            <div class="param-label">Zona (Z)</div>
            <div class="param-value">${params.Z.toFixed(3)}</div>
        </div>
        <div class="param-item">
            <div class="param-label">Factor Suelo (S)</div>
            <div class="param-value">${params.S.toFixed(3)}</div>
        </div>
        <div class="param-item">
            <div class="param-label">Tp (s)</div>
            <div class="param-value">${params.Tp.toFixed(2)}</div>
        </div>
        ${params.Tl ? `
        <div class="param-item">
            <div class="param-label">Tl (s)</div>
            <div class="param-value">${params.Tl.toFixed(2)}</div>
        </div>
        ` : ''}
        <div class="param-item">
            <div class="param-label">R Efectivo</div>
            <div class="param-value">${R.toFixed(2)}</div>
        </div>
        <div class="param-item">
            <div class="param-label">Sa Máximo (g)</div>
            <div class="param-value">${SaMax.toFixed(4)}</div>
            <div class="param-unit">${(SaMax * 9.81).toFixed(2)} m/s²</div>
        </div>
    `;

    container.innerHTML = html;
}

// ════════════════════════════════════════════════════════
// EXPORTAR A TXT
// ════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    const btnExportTXT = document.getElementById('exportTXT');
    if (btnExportTXT) {
        btnExportTXT.addEventListener('click', () => {
            if (datosEspectro.length === 0) {
                alert('Debe generar el espectro primero');
                return;
            }

            const txt = datosEspectro
                .map(d => `${d.T.toFixed(3)} ${d.Sa.toFixed(4)}`)
                .join('\r\n');

            const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Espectro_Sismico.txt';
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    const btnExportXLSX = document.getElementById('exportXLSX');
    if (btnExportXLSX) {
        btnExportXLSX.addEventListener('click', () => {
            if (datosEspectro.length === 0) {
                alert('Debe generar el espectro primero');
                return;
            }
            exportToExcel(datosEspectro);
        });
    }
});

// ════════════════════════════════════════════════════════
// EXPORTAR A EXCEL
// ════════════════════════════════════════════════════════

async function exportToExcel(datos) {
    if (typeof ExcelJS === 'undefined') {
        console.error('ExcelJS no está cargado');
        return;
    }

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Espectro');

    // Header
    ws.columns = [
        { header: 'T (s)', key: 'T', width: 12 },
        { header: 'Sa (g)', key: 'Sa', width: 12 },
        { header: 'C', key: 'C', width: 12 },
        { header: 'Sa (m/s²)', key: 'Sa_cms', width: 14 },
    ];

    // Estilo header
    ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00E5FF' } };
    ws.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };

    // Datos
    datos.forEach((d, idx) => {
        ws.addRow(d);
        const row = ws.getRow(idx + 2);
        row.alignment = { horizontal: 'center' };
    });

    // Guardar
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Espectro_Sismico_${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
}
