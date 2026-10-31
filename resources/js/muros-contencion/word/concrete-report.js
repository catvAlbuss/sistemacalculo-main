// Tablas nativas de Word con el diseño de concreto armado de cada elemento del muro.
const fixed = (value, decimals = 2) => {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed.toFixed(decimals) : '-';
};

const STEEL_ROWS = [
    { key: 'principal', label: 'Longitudinal principal', required: 'As', calculated: 'espaciamientoPrincipal', adopted: 'espaciamientoalgPrin' },
    { key: 'secundario', label: 'Longitudinal secundario', required: 'As', calculated: 'espaciamientoSecundario', adopted: 'espaciamientoalgoSecs' },
    { key: 'transversal', label: 'Transversal cara del terreno', required: 'as1', calculated: 'espaciamientoCT', adopted: 'espaciamientoalgoritmoCT' },
    { key: 'transversal2', label: 'Transversal cara libre', required: 'as1Clibre', calculated: 'espaciamientoC', adopted: 'espaciamientoalgoritmoC' },
];

export function readConcreteElement(tipo) {
    const element = document.getElementById(`content-${tipo}`);
    if (!element) return null;
    const vm = Alpine.$data(element);
    return {
        titulo: vm.titulo,
        datos: { ...vm.datosVisuales, d: vm.datos.d },
        corte: vm.datoscorte,
        flexion: vm.datosflexion,
        aceros: Object.fromEntries(STEEL_ROWS.map(row => {
            const steel = vm.aceros[row.key];
            return [row.key, {
                cantidad: row.key.startsWith('transversal') ? 1 : Math.ceil(steel.cantidad), diametro: steel.diametro, area: steel[row.required],
                calculado: steel[row.calculated], adoptado: steel[row.adopted],
            }];
        })),
    };
}

export function concreteDesignTables({ titulo, datos, corte, flexion, aceros }) {
    const parameters = [{ header: 'Parámetro', width: 46 }, { header: 'Símbolo', width: 18 }, { header: 'Valor', width: 18 }, { header: 'Unidad', width: 18 }];
    return [
        {
            title: `${titulo}: DATOS DE ENTRADA`,
            columns: parameters,
            rows: [
                ['Momento último', 'Mu', fixed(datos.Mu), 'tn-m'],
                ['Fuerza cortante', 'Vu', fixed(datos.Vu), 'tn'],
                ['Ancho de diseño', 'b', fixed(datos.b), 'cm'],
                ['Espesor', 't', fixed(datos.t), 'cm'],
                ['Peralte efectivo', 'd', fixed(datos.d), 'cm'],
                ['Fluencia del acero', 'Fy', fixed(datos.Fy), 'kg/cm²'],
                ['Resistencia del concreto', "f'c", fixed(datos.Fc), 'kg/cm²'],
            ],
        },
        {
            title: `${titulo}: DISEÑO POR CORTE`,
            columns: parameters,
            rows: [
                ['Peralte efectivo', 'd', fixed(corte.d), 'cm'],
                ['Fuerza cortante', 'Vu', fixed(corte.Vu), 'tn'],
                ['Resistencia nominal', 'Vc', fixed(corte.Vc), 'tn'],
                ['Resistencia de diseño', 'ΦVc', fixed(corte.phi_Vc), 'tn'],
                ['Ratio de uso', 'Vu/ΦVc', fixed(corte.ratio), '%'],
                ['Verificación', 'ΦVc ≥ Vu', corte.verificacion || '-', '-'],
            ],
        },
        {
            title: `${titulo}: DISEÑO POR FLEXIÓN`,
            columns: parameters,
            rows: [
                ['Cuantía mínima', 'ρ mín', fixed(flexion.rmincuan, 4), '-'],
                ['Área mínima por cuantía', 'As mín', fixed(flexion.rmincuans), 'cm²'],
                ['Cuantía mínima por área', 'ρ mín', fixed(flexion.rminarea, 4), '-'],
                ['Área mínima por área', 'As mín', fixed(flexion.rminareas), 'cm²'],
                ['Profundidad del bloque', 'a', fixed(flexion.a), 'cm'],
                ['Acero requerido', 'As req', fixed(flexion.as), 'cm²'],
                ['Acero a usar', 'As', fixed(flexion.As), 'cm²'],
            ],
        },
        {
            title: `${titulo}: DISTRIBUCIÓN DEL ACERO`,
            columns: [{ header: 'Refuerzo', width: 34 }, { header: 'As (cm²)', width: 14 }, { header: 's calc. (cm)', width: 16 }, { header: 'Disposición', width: 36 }],
            rows: STEEL_ROWS.map(({ key, label }) => {
                const steel = aceros[key];
                return [label, fixed(steel.area), fixed(steel.calculado, 0), `${steel.cantidad} Ø ${steel.diametro} @ ${steel.adoptado} cm`];
            }),
        },
    ];
}

const FORCE_COLUMNS = [{ header: 'Elemento', width: 22 }, { header: 'q1 (Tn/m²)', width: 13 }, { header: 'q2 (Tn/m²)', width: 13 }, { header: 'L (m)', width: 12 }, { header: 'Mu (Tn·m)', width: 20 }, { header: 'Vu (Tn)', width: 20 }];

export function readAnalysis() {
    const element = document.querySelector('[x-data^="analisisestructural"]');
    return element ? Alpine.$data(element).reporteAnalisis : null;
}

export function analysisReportTables({ modo, pantalla, punta, talon, key, recortes }) {
    const row = (label, q1, q2, L, Mu, Vu) => [label, fixed(q1), fixed(q2), fixed(L), fixed(Mu), fixed(Vu)];
    const tables = [{
        title: `ESFUERZOS DE DISEÑO (caso ${modo})`,
        columns: FORCE_COLUMNS,
        rows: [
            row('Pantalla', pantalla.B277, pantalla.B278, pantalla.B279, pantalla.B290, pantalla.B291),
            row('Punta', punta.H278, punta.H279, punta.H280, punta.H290, punta.H291),
            row('Talón', talon.N279, talon.N280, talon.N281, talon.N290, talon.N291),
            row('Dentellón', key.U277, key.U278, key.U279, key.U287, key.U288),
        ],
    }];
    if (recortes) {
        const { pantalla: stem, talon: heel, pedestal } = recortes;
        const disposition = item => item.barra ? `${item.barra.label} @ ${item.barra.spacing} cm` : '-';
        tables.push({
            title: 'RECORTE DE REFUERZO',
            columns: [{ header: 'Elemento', width: 16 }, { header: 'L (m)', width: 10 }, { header: 'Mu (Tn·m)', width: 14 }, { header: 'Mu máx/2', width: 14 }, { header: 'As (cm²)', width: 12 }, { header: 'Disposición', width: 22 }, { header: 'Estado', width: 12 }],
            rows: [
                ['Pantalla', fixed(stem.L), fixed(stem.Mu), fixed(stem.limit), fixed(stem.AsUsar), disposition(stem), stem.ok ? 'OK' : 'Aumentar L'],
                ['Talón', fixed(heel.L), fixed(heel.Mu), fixed(heel.limit), fixed(heel.AsUsar), disposition(heel), heel.ok ? 'OK' : 'Aumentar L'],
            ],
        }, {
            title: 'PEDESTAL DEL TALÓN',
            columns: [{ header: 'L (m)', width: 20 }, { header: 'Vu (Tn)', width: 20 }, { header: 'ΦVc (Tn)', width: 20 }, { header: "h' (cm)", width: 20 }, { header: 'Estado', width: 20 }],
            rows: [[fixed(pedestal.L), fixed(pedestal.Vu), fixed(pedestal.phiVc), fixed(pedestal.h), pedestal.ok ? 'OK' : 'Aumentar longitud']],
        });
    }
    return tables;
}

export const steelDetail = (detalle, rowKey) => {
    const row = STEEL_ROWS.find(item => item.key === rowKey);
    const steel = detalle?.find(item => item.tipoAcero === rowKey)?.configuracion;
    if (!steel) return null;
    const spacing = steel[row.adopted];
    return { spacing, label: `${rowKey.startsWith('transversal') ? 1 : steel.cantidad} Ø ${steel.diametro} @ ${spacing} cm` };
};

export const steelLabel = (detalle, rowKey) => steelDetail(detalle, rowKey)?.label || '';
