export const configA_Inputs = [
    { label: 'Diámetro', unit: 'cm', type: 'number' },
    { label: 'Recubrimiento', unit: 'cm', type: 'number' },
    { label: 'Luz Libre', unit: 'm', type: 'number' },
    { label: 'EFA', unit: 'Kg/cm²', type: 'number' },
    { label: 'ECC', unit: 'Kg/cm²', type: 'number' },
    { label: 'Carga Axial', unit: 'Tn', type: 'number' },
    { label: 'MDBL', unit: 'pulg', type: 'select', options: ['3/8"', '1/2"', '5/8"', '3/4"', '1"'] },
    { label: 'D. Estribo', unit: 'pulg', type: 'select', options: ['3/8"', '1/2"', '5/8"', '3/4"', '1"'] }
];

export const configA_Outputs = [
    { label: 'Máx. Diámetro Barra Long.', simbolo: 'db', unit: 'cm' },
    { label: 'Diámetro del Estribo', simbolo: 'de', unit: 'cm' },
    { label: 'Área del Estribo', simbolo: 'Av', unit: 'cm²' },
    { label: 'Máx. Peralte Efectivo', simbolo: 'd', unit: 'cm' },
    { label: 'Área Bruta de la Sección', simbolo: 'Ag', unit: 'cm²' },
    { label: 'Área Confinada de la Sección', simbolo: 'Ach', unit: 'cm²' }
];

export const colIngresoFuerzas = [
    {title:"Load Case/Combo", field:"combo", editor:false, width:130, cssClass:"font-bold text-gray-900 dark:text-white"},
    {title:"Station (m)", field:"station", editor:false, width:90, cssClass:"font-bold text-center text-gray-900 dark:text-white", hozAlign:"center"},
    {title:"P (tonf)", field:"p", editor:"input", headerHozAlign:"right", hozAlign:"right"},
    {title:"V2 (tonf)", field:"v2", editor:"input", headerHozAlign:"right", hozAlign:"right"},
    {title:"V3 (tonf)", field:"v3", editor:"input", headerHozAlign:"right", hozAlign:"right"},
    {title:"T (tonf-m)", field:"t", editor:"input", headerHozAlign:"right", hozAlign:"right"},
    {title:"M2 (tonf-m)", field:"m2", editor:"input", headerHozAlign:"right", hozAlign:"right"},
    {title:"M3 (tonf-m)", field:"m3", editor:"input", headerHozAlign:"right", hozAlign:"right"}
];

const combosBase = ["Comb1", "Comb2 Max", "Comb2 Min", "Comb3 Max", "Comb3 Min", "Comb4 Max", "Comb4 Min", "Comb5 Max", "Comb5 Min"];
const estacionesBase = ["0", "1.375", "2.75"];
export const datosFijosB_Ingreso = [];
combosBase.forEach(combo => {
    estacionesBase.forEach(estacion => {
        datosFijosB_Ingreso.push({ combo: combo, station: estacion, p: "", v2: "", v3: "", t: "", m2: "", m3: "" });
    });
});

export const colSalidaFuerzas = [
    {title:"", field:"combo", width:80, cssClass:"font-bold text-center text-gray-900 dark:text-white", hozAlign:"center"},
    {title:"M33", field:"m33", headerHozAlign:"right", hozAlign:"right"},
    {title:"Pu", field:"pu1", headerHozAlign:"right", hozAlign:"right"}, 
    {title:"M22", field:"m22", headerHozAlign:"right", hozAlign:"right"},
    {title:"Pu", field:"pu2", headerHozAlign:"right", hozAlign:"right"}  
];

export const datosFijosB_Salida = Array.from({length: 9}, (_, i) => ({
    combo: `Comb${i + 1}`, m33: "0.00", pu1: "0.00", m22: "0.00", pu2: "0.00"
}));

export const colIngresoFlector = [
    {title:"Point", field:"point", editor:false, width:80, cssClass:"font-bold text-center text-gray-900 dark:text-white", hozAlign:"center"},
    {title:"P (tonf)", field:"p", editor:"input", headerHozAlign:"right", hozAlign:"right"},
    {title:"M2 (tonf-m)", field:"m2", editor:"input", headerHozAlign:"right", hozAlign:"right"},
    {title:"M3 (tonf-m)", field:"m3", editor:"input", headerHozAlign:"right", hozAlign:"right"}
];

const crearDataCurvas = () => Array.from({length: 24}, () => 
    Array.from({length: 11}, (_, i) => ({ point: i + 1, p: "", m2: "", m3: "" }))
);

export const flectorDataState = {
    Nominal: crearDataCurvas(),
    Reducido: crearDataCurvas()
};

export const colSalidaFlector = [
    {title:"M33", field:"m33", headerHozAlign:"right", hozAlign:"right"},
    {title:"Pu", field:"pu1", headerHozAlign:"right", hozAlign:"right"},
    {title:"M22", field:"m22", headerHozAlign:"right", hozAlign:"right"},
    {title:"Pu", field:"pu2", headerHozAlign:"right", hozAlign:"right"}
];

const crearDataSalidaFlector = () => Array.from({length: 21}, () => ({
    m33: "0.0000", pu1: "0.0000", m22: "0.0000", pu2: "0.0000"
}));
export const dataSalidaFlectorNominal = crearDataSalidaFlector();
export const dataSalidaFlectorReducido = crearDataSalidaFlector();

export const configD_Inputs = [
    { label: 'S3(100mm)', unit: 'cm', type: 'number', default: 10 },
    { label: 'S2(300mm)', unit: 'cm', type: 'number', default: 30 },
    { label: 'Lo3(500mm)', unit: 'cm', type: 'number', default: 50 },
    { label: 'Mns', unit: 'Tn-m', type: 'number' },
    { label: 'Mni', unit: 'Tn-m', type: 'number' },
    { label: 'Nr', unit: 'u', type: 'number' }
];

export const configD_Outputs = [
    { label: '8db', simbolo: 'S₁', unit: 'cm' },
    { label: '16db', simbolo: 'S₁', unit: 'cm' },
    { label: '48db', simbolo: 'S₁', unit: 'cm' },
    { label: '{br ó hr}Min/2', simbolo: 'S₁', unit: 'cm' }, 
    { label: '{b ó h}Min/2', simbolo: 'S₂', unit: 'cm' },
    { label: 'Separación Mín. (Conf.)', simbolo: 'Smin', unit: 'cm' },
    { label: 'Separación Máx. (No Conf.)', simbolo: 'Smax', unit: 'cm' },
    { label: 'Ln/6', simbolo: 'Lo₁', unit: 'cm' },
    { label: '{b ó h}Max', simbolo: 'Lo₂', unit: 'cm' },
    { label: 'Long. Zona Confinada', simbolo: 'Lo', unit: 'cm' },
    { label: 'Long. Zona No Confinada', simbolo: 'Lc', unit: 'cm' },
    { label: 'Momento Prob. Superior', simbolo: 'Mprs', unit: 'Tn-m' },
    { label: 'Momento Prob. Inferior', simbolo: 'Mpri', unit: 'Tn-m' },
    { label: 'Cortante Último Nominal', simbolo: 'Vu₁', unit: 'Tn' },
    { label: 'Cortante Último', simbolo: 'Vu₂', unit: 'Tn' },
    { label: 'Cortante + 2.5Cs', simbolo: 'Vu₃', unit: 'Tn' },
    { label: 'Máx. Cortante Último', simbolo: 'Vu,max', unit: 'Tn' },
    { label: 'Cortante Acero', simbolo: 'Vs', unit: 'Tn' },
    { label: "0.53*f'c^0.5*(1+Un/140Ag)Ach", simbolo: 'Paralelo A B', unit: 'Tn' },
    { label: 'Separación mínima calculada', simbolo: 'S', unit: 'cm' },
    { label: 'S', simbolo: 'S', unit: 'cm' }
];

const combosSismo = ["SISMO Max", "SISMO Min"];
export const datosFijosSismo_Ingreso = [];
combosSismo.forEach(combo => {
    estacionesBase.forEach(estacion => {
        datosFijosSismo_Ingreso.push({ combo: combo, station: estacion, p: "", v2: "", v3: "", t: "", m2: "", m3: "" });
    });
});

export const sharedState = {
    vu2: 0,
    station0V2: [],
    station0V3: [],
    maxV2Sismo: 0,
    maxV3Sismo: 0
};
