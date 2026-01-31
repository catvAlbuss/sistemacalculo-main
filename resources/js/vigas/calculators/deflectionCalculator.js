import { StructuralUtils, CONCRETE_CONSTANTS } from "./SharedCalculatorUtils.js";

export class DeflectionCalculator {
    constructor(data, flexionState) {
        this.parametros = data.parametros;
        this.datos = data.datos;
        this.flexionState = flexionState;
    }

    calculate() {
        // --- 1. Inicialización y Constantes ---
        const { fc, numTramos } = this.parametros;
        const fcNum = parseFloat(fc) || 210;

        const baseData = this.datos?.base || this.parametros.base;
        const alturaData = this.datos?.altura || this.parametros.altura;
        const luzData = this.datos?.luz || {};

        // Estructura de Columnas: 1 Sola respuesta por Tramo (Visualmente fusionada)
        const columnGroups = [];
        for (let i = 1; i <= numTramos; i++) {
            columnGroups.push({
                title: `TRAMO ${i}`,
                columns: ["RESULTADO"] // Una sola columna efectiva
            });
        }

        // Estructura interna de resultados (Arrays para almacenar valor por tramo)
        const results = {
            // A) Momento Crítico e Inercia Agrietada
            Mcr: [],
            Icr: [],

            // B) Inercia Efectiva
            Ief: [],

            // C) Deflexiones Inmediatas
            Delta_CM: [],
            Delta_CV: [],

            // D) Deflexiones Diferidas
            Delta_Diferida: [],

            // E) Deflexiones Totales
            Delta_Total: [],

            // F) Verificaciones
            Check_360: [],
            Check_480: [],
            Es: [],
            Ec: [],
            n: [],
            E41: [],
            E46: [],
            E60: [],
            F77: [],
            F92: [],
            F96: [],
            E102: [],
            E103: [],
            E104: [],
            F109: [],
            F113: [],
            G118: [],
            G119: [],
            G128: [],
            G129: [],
            G134: [],
            G135: [],
            E134: [],
            F147: [],
            H118: [],
            H128: [],
            H134: [],
        };

        // Helpers de extracción
        const getVal = (measure, tramoIdx, posIdx, def = 0) => {
            const tKey = `tramo${tramoIdx}`;
            if (!measure) return def;
            const tVal = measure[tKey];
            if (tVal === undefined) return def;
            if (typeof tVal === 'object' && !Array.isArray(tVal)) {
                // posIdx 0=a (izq), 1=b (cen), 2=c (der)
                const keys = ['a', 'b', 'c'];
                return parseFloat(tVal[keys[posIdx]]) || def;
            }
            if (Array.isArray(tVal)) return parseFloat(tVal[posIdx]) || def;
            return parseFloat(tVal) || def;
        };

        const getMoment = (type, tramoIdx, posIdx) => {
            let group = null;

            // Search in 'negativo' first (common for loads)
            if (this.datos?.fuerzas?.negativo?.[type]?.M3) {
                group = this.datos.fuerzas.negativo[type].M3;
            }
            // Then in 'positivo'
            else if (this.datos?.fuerzas?.positivo?.[type]?.M3) {
                group = this.datos.fuerzas.positivo[type].M3;
            }
            // Fallback to root (legacy support)
            else if (this.datos?.fuerzas?.[type]?.M3) {
                group = this.datos.fuerzas[type].M3;
            }

            return getVal(group, tramoIdx, posIdx, 0);
        };

        const getFlexionVal = (type, tramoIdx, posIdx) => {
            // type: 'phiMn', 'asReal', 'dReal'
            const sectionKey = (posIdx === 1) ? 'positivo' : 'negativo';
            const flatIdx = (tramoIdx - 1) * 3 + posIdx;
            if (this.flexionState && this.flexionState[sectionKey] && this.flexionState[sectionKey][type]) {
                const val = this.flexionState[sectionKey][type][flatIdx];
                return parseFloat(val) || 0;
            }
            return 0;
        };

        // --- Loop Principal por Tramo ---
        for (let i = 1; i <= numTramos; i++) {

            // -------------------------------------------------------------------------
            // 1. OBTENCIÓN DE DATOS (INGREDIENTES PARA LAS FÓRMULAS)
            // -------------------------------------------------------------------------

            // Geometría General del Tramo (Luz)
            const L_m = parseFloat(luzData[`tramo${i}`]) || 0;
            const L_cm = L_m * 100;

            // Datos Base y Altura (Posiciones: 0=Izq, 1=Centro, 2=Der)
            const b_izq = getVal(baseData, i, 0);
            const b_cen = getVal(baseData, i, 1);
            const b_der = getVal(baseData, i, 2);

            const h_izq = getVal(alturaData, i, 0);
            const h_cen = getVal(alturaData, i, 1);
            const h_der = getVal(alturaData, i, 2);

            // Acero Real (Traído de Flexión)
            const As_izq = getFlexionVal('asReal', i, 0); // Negativo
            const As_cen = getFlexionVal('asReal', i, 1); // Positivo
            const As_der = getFlexionVal('asReal', i, 2); // Negativo

            // Grupo Acero Positivo y Negativo
            const As_pos = As_cen;
            const As_neg = Math.max(As_izq, As_der); // Maximo de los negativos

            // Peraltes Efectivos
            const d_izq = getFlexionVal('dReal', i, 0) || StructuralUtils.calculateEffectiveDepth(h_izq);
            const d_cen = getFlexionVal('dReal', i, 1) || StructuralUtils.calculateEffectiveDepth(h_cen);
            const d_der = getFlexionVal('dReal', i, 2) || StructuralUtils.calculateEffectiveDepth(h_der);

            // Grupo Peralte Positivo y Negativo
            const d_pos = d_cen;
            const d_neg = (As_izq >= As_der) ? d_izq : d_der; // Asociado al mayor acero negativo

            // Momentos Actuantes (Sin factorizar, Servicio)
            // Carga Muerta
            const M_cm_izq = Math.abs(parseFloat(getMoment('CM', i, 0)) || 0);
            const M_cm_cen = Math.abs(parseFloat(getMoment('CM', i, 1)) || 0);
            const M_cm_der = Math.abs(parseFloat(getMoment('CM', i, 2)) || 0);
            // console.log(M_cm_izq, M_cm_cen, M_cm_der);

            // Grupo Positivo y Negativo (CM)
            const M_cm_pos = M_cm_cen;
            const M_cm_neg = Math.max(M_cm_izq, M_cm_der);
            // console.log(M_cm_pos, M_cm_neg);

            // Carga Viva
            const M_cv_izq = Math.abs(parseFloat(getMoment('CV', i, 0)) || 0);
            const M_cv_cen = Math.abs(parseFloat(getMoment('CV', i, 1)) || 0);
            const M_cv_der = Math.abs(parseFloat(getMoment('CV', i, 2)) || 0);
            // console.log(M_cv_izq, M_cv_cen, M_cv_der);

            // Grupo Positivo y Negativo (CV)
            const M_cv_pos = M_cv_cen;
            const M_cv_neg = Math.max(M_cv_izq, M_cv_der);
            // console.log(M_cv_pos, M_cv_neg);

            // Constantes de Materiales
            const Ec = 15000 * Math.sqrt(fcNum > 0 ? fcNum : 210); // Modulo Concreto
            const Es = 2000000;                  // Modulo Acero
            const n = Es / Ec;                   // Relación Modular
            const fr = 2 * Math.sqrt(fcNum > 0 ? fcNum : 210);     // Modulo de Rotura

            results.Es.push(Es);
            results.Ec.push(Ec);
            results.n.push(n);


            // -------------------------------------------------------------------------
            // 2. CÁLCULOS (ESPACIO PARA POSTERIOR EDICIÓN POR EL USUARIO)
            // -------------------------------------------------------------------------

            // a) Calculo de Momento de Inercia Crítico (Icr)
            // Tip: Calcular Icr positivo y negativo o usar max/min según fórmula deseada
            //momento positivo
            const D37 = (b_izq > 0) ? b_izq : 25; // Safe base
            const F37 = 2 * n * (As_izq + As_der);
            const H37 = -2 * n * As_cen * d_cen;

            const discr_pos = Math.pow(F37, 2) - (4 * D37 * H37);
            const sqrt_pos = (discr_pos >= 0) ? Math.sqrt(discr_pos) : 0;

            const F38 = (-F37 + sqrt_pos) / (2 * D37);
            const F39 = (-F37 - sqrt_pos) / (2 * D37);
            const D40 = Math.abs(Math.max(F38, F39));
            const E41 = ((D37 * Math.pow(D40, 3)) / (3)) + (n * As_izq * Math.pow(d_izq - D40, 2)) + ((n - 1) * As_izq * Math.pow(D40 - d_izq, 2));

            //momento negativo
            const D43 = (b_izq > 0) ? b_izq : 25;
            const F43 = 2 * n * (As_izq + As_der);
            const H43 = -2 * n * As_neg * d_neg;

            const discr_neg = Math.pow(F43, 2) - (4 * D43 * H43);
            const sqrt_neg = (discr_neg >= 0) ? Math.sqrt(discr_neg) : 0;

            const F44 = (-F43 + sqrt_neg) / (2 * D43);
            const F45 = (-F43 - sqrt_neg) / (2 * D43);
            const D46 = Math.abs(Math.max(F44, F45));
            const E46 = ((D43 * Math.pow(D46, 3)) / (3)) + (n * As_izq * Math.pow(d_izq - D46, 2)) + ((n - 1) * As_izq * Math.pow(D46 - d_izq, 2));

            results.E41.push(E41);
            results.E46.push(E46);


            // b) Cálculo de Momento de Inercia Efectiva (Ief)
            // Formula tipica ACI: Ie = (Mcr/Ma)^3 * Ig + [1 - (Mcr/Ma)^3] * Icr

            const E60 = (E46 + E46 + 2 * E41) / 4;
            results.E60.push(E60);

            const E60_safe = (E60 > 0) ? E60 : 1; // Prevent Div0 in next steps

            // c) Deflexiones Inmediatas (CM y CV)
            // Formula tipica: K * (M * L^2) / (Ec * Ie)
            const F77 = (((5 * Math.pow(L_m * 100, 2)) / (48 * Ec * E60_safe)) * (((M_cm_pos * 1000) - 0.1 * ((M_cm_izq * 1000) + (M_cm_der * 1000))) * 100));
            const F92 = (((5 * Math.pow(L_m * 100, 2)) / (48 * Ec * E60_safe)) * (((M_cv_pos * 1000) - 0.1 * ((M_cv_izq * 1000) + (M_cv_der * 1000))) * 100));
            const F96 = 0.3 * F92;
            results.F77.push(F77);
            results.F92.push(F92);
            results.F96.push(F96);

            // d) Deflexiones Diferidas
            // Lambda = ? 
            // Delta_Dif = Lambda * (Delta_Sostenida)0
            const E102 = As_izq / (b_izq * d_izq); // If d_izq is 0 -> Infinity
            const E103 = 2;
            // E102 (Rho) can be small. Infinity * 50 = Infinity. 1/(1+inf) = 0. Safe.
            const E104 = E103 / (1 + (50 * E102));

            results.E102.push(E102);
            results.E103.push(E103);
            results.E104.push(E104);

            // e) Deflexiones Totales
            // Delta_Total = Delta_Diferida + Delta_Instantanea_CV
            const F109 = F77 * (1 + E104) + F96 * (1 + E104);
            const F113 = F77 + F92 + E104 * F77 + E104 * F96;
            results.F109.push(F109);
            results.F113.push(F113);

            // f) Verificaciones RNE
            // Limite L/360, L/480  
            const E118 = F92;
            const G118 = L_m * 100 / 360;
            const H118 = (E118 < G118) ? "CUMPLE!" : "NO CUMPLE!";
            results.G118.push(G118);
            results.H118.push(H118);

            const F126 = E104 * F77 + E104 * F96 + F92;
            const E128 = F126;
            const G128 = L_m * 100 / 480;
            const H128 = (E128 < G128) ? "CUMPLE!" : "NO CUMPLE!";
            results.G128.push(G128);
            results.H128.push(H128);

            const E134 = +E104 * F77 + F92;
            const G134 = L_m * 100 / 240;
            const H134 = (E134 < G134) ? "CUMPLE!" : "NO CUMPLE!";
            results.E134.push(E134);
            results.G134.push(G134);
            results.H134.push(H134);

            const F147 = F77 + F92;
            results.F147.push(F147);
        } // Fin Loop Tramos

        // --- 3. Retorno para Renderizado ---
        const generateOneColRow = (name, symbol, dataArray, unit, decimals = 2) => {
            const values = [];
            for (let i = 0; i < numTramos; i++) {
                values.push({
                    value: typeof dataArray[i] === 'string' ? dataArray[i] : StructuralUtils.round(dataArray[i], decimals),
                    unit: unit,
                    colSpan: 3
                });
            }
            return { name, symbol, values };
        };


        return {
            title: "5.- Diseño por deflexión",
            columnGroups: columnGroups,
            rows: [
                generateOneColRow("Modulo de elasticidad del acero", "Es", results.Es, "Kg/cm²", 2),
                generateOneColRow("Modulo de elasticidad del concreto", "Ec", results.Ec, "Kg/cm²", 2),
                generateOneColRow("Relacion acero/concreto", "n", results.n, "", 3),
                generateOneColRow("Momento Crítico", "Icr(+)", results.E41, "cm⁴", 2),
                generateOneColRow("Momento Crítico", "Icr(-)", results.E46, "cm⁴", 2),
                //b) Cálculo de Momento de Inercia Efectiva ( Ief)
                generateOneColRow("Momento de Inercia Efectiva ( Ief)", "Ief", results.E60, "cm⁴", 2),

                //c) Deflexiones Inmediatas:
                generateOneColRow("Deflexiones inmediatas debido a la carga muerta", "Δzm", results.F77, "cm", 4),
                generateOneColRow("Deflexiones inmediatas debido a la carga viva", "ΔzL", results.F92, "cm", 4),
                generateOneColRow("Deflexiones inmediatas debido al 30% de la carga viva", "Δz30%", results.F96, "cm", 4),

                //d) Momento de Inercia Agrietada
                generateOneColRow("Cuantia de acero en comprensión", "ρ´", results.E102, "", 4),
                generateOneColRow("Factor de duracion de cargas /coeficiente de fluencia", "ε", results.E103, "", 4),
                generateOneColRow("Factor de ampliacion de delfexion diferida", "λΔ", results.E104, "", 4),

                //e) Deflexiones Totales
                generateOneColRow("Deflexion media total", "Δmedia", results.F109, "cm", 4),
                generateOneColRow("Deflexion maxima total", "Δmáx", results.F113, "cm", 4),

                //f) Verificaciones
                generateOneColRow("Relacion Luz/Deflexion inmediata por CV", "L/ΔZL", results.G118, "", 4),
                generateOneColRow("VERIFICACION", "", results.H118, "", 0),

                generateOneColRow("Deflexion inmediata debida al 100% de la CV", "ΔZT", results.G128, "", 4),
                generateOneColRow("VERIFICACION", "", results.H128, "", 0),

                generateOneColRow("Deflexion total diferencia asociada a elementos no estructurales", "ΔzT", results.G134, "", 4),
                generateOneColRow("VERIFICACION", "", results.H134, "", 0),

                generateOneColRow("Contraflecha", "Cf", results.F147, "c", 4),
            ]
        };
    }
}
