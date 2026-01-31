import { StructuralUtils, CONCRETE_CONSTANTS } from "./SharedCalculatorUtils.js";

export class CapacidadCalculator {
    constructor(data, flexionResultsOrLiveUpdate) {
        this.parametros = data.parametros;
        this.datos = data.datos;
        this.flexionInput = flexionResultsOrLiveUpdate;
    }

    calculate() {
        try {
            //console.log('CapacidadCalculator.calculate() - START');
            const { fc, fy, numTramos } = this.parametros;
            const beta1 = StructuralUtils.calculateBeta1(fc);
            const baseData = this.datos?.base || this.parametros.base;
            const alturaData = this.datos?.altura || this.parametros.altura;
            const shearData = this.datos?.fuerzas?.ENV?.V2 || {};

            const findForceValues = (conceptName, forceType = 'V2') => {
                let values = {};
                // Helper to safely access nested properties
                const safeGet = (obj, key) => obj && obj[key] ? obj[key] : {};

                const containers = [this.datos?.fuerzas?.positivo, this.datos?.fuerzas?.negativo];
                for (const container of containers) {
                    if (!container) continue;
                    const groupKey = Object.keys(container).find(k => k && k.toUpperCase().includes(conceptName.toUpperCase()) || k.toUpperCase() === conceptName.toUpperCase());
                    if (groupKey && container[groupKey] && container[groupKey][forceType]) {
                        return container[groupKey][forceType];
                    }
                }
                return {};
            };

            const cmShearData = findForceValues("CM", "V2") || findForceValues("D", "V2") || {};
            const cvShearData = findForceValues("CV", "V2") || findForceValues("L", "V2") || {};

            const getVal = (source, tramoIdx, positionIdx) => {
                const tramoKey = `tramo${tramoIdx}`;
                let val = 0;
                if (source && source[tramoKey]) {
                    const tVal = source[tramoKey];
                    if (typeof tVal === 'object' && !Array.isArray(tVal)) {
                        if (positionIdx === 0) val = tVal.a;
                        else if (positionIdx === 1) val = tVal.b;
                        else if (positionIdx === 2) val = tVal.c;
                    } else if (Array.isArray(tVal)) {
                        val = tVal[positionIdx];
                    } else {
                        val = Number(tVal);
                    }
                }
                return Number(val) || 0;
            };

            // Estructura de columnas dinámicas
            const columnGroups = [];
            for (let i = 1; i <= numTramos; i++) {
                columnGroups.push({
                    title: `TRAMO ${i}`,
                    columns: ["START", "MIDDLE", "END"]
                });
            }

            const results = {
                Mn_izq: [],
                Mn_der: [],
                CapacidadCortante: [],
                Vu: [],
                Acws: [],
                Vc: [],
                Vs: [],
                es: [],
                peralteefectivo: [],
                lconfig: [],
                usar: [],
                estribos: [],
                estribadoscapacidad: []
            };

            let Mn_neg_data = [];
            let Mn_pos_data = [];

            //console.log('CapacidadCalculator - flexionInput:', this.flexionInput);

            // Check if input is the new state structure (Object with phiMn)
            const isLiveUpdate = this.flexionInput && (this.flexionInput.negativo?.phiMn || this.flexionInput.positivo?.phiMn);

            //console.log('CapacidadCalculator - isLiveUpdate:', !!isLiveUpdate);

            if (isLiveUpdate) {
                // Live data is already in Ton-m (from flexionResultRenderer logic we added)
                // Now accessing nested .phiMn property
                Mn_neg_data = this.flexionInput.negativo?.phiMn || [];
                Mn_pos_data = this.flexionInput.positivo?.phiMn || [];
                //console.log('Using live update data');
            } else if (this.flexionInput) {
                // Original Source (Calculated initially)
                // Md is in kg-cm. We must convert to Ton-m.
                const neg_raw = this.flexionInput?.negativo?.data?.Md || [];
                const pos_raw = this.flexionInput?.positivo?.data?.Md || [];

                ////console.log('Using initial flexion data - neg_raw length:', neg_raw.length, 'pos_raw length:', pos_raw.length);

                Mn_neg_data = neg_raw.map(val => val / 100000); // kg-cm -> ton-m
                Mn_pos_data = pos_raw.map(val => val / 100000);
            } else {
                //console.warn('CapacidadCalculator - No flexion data available!');
            }

            //console.log('Mn_neg_data:', Mn_neg_data);
            //console.log('Mn_pos_data:', Mn_pos_data);

            for (let i = 1; i <= numTramos; i++) {
                const p1 = (i - 1) * 3 + 0; // Start
                const p2 = (i - 1) * 3 + 1; // Middle
                const p3 = (i - 1) * 3 + 2; // End

                // --- Mn Calculations ---
                // Mn_izq: max(col1, col3) from Negativo (Abs value) / 0.9
                const phiMn_neg_start = Mn_neg_data[p1] || 0;
                const phiMn_neg_end = Mn_neg_data[p3] || 0;

                //console.log(`Tramo ${i} - PhiMn Neg Start: ${phiMn_neg_start}, End: ${phiMn_neg_end}`);

                // Max Design Strength (PhiMn)
                const max_phiMn_neg = Math.max(Math.abs(phiMn_neg_start), Math.abs(phiMn_neg_end));

                // Convert to Nominal Strength (Mn) -> Mn = PhiMn / Phi
                // User Formula: "resultado dividimos 0.9". 
                // If the input IS PhiMn, then Mn = PhiMn / 0.9.
                const Mn_izq_val = max_phiMn_neg / 0.9;

                // Mn_der: Middle Positivo
                const phiMn_pos_mid = Mn_pos_data[p2] || 0;
                const Mn_der_val = Math.abs(phiMn_pos_mid) / 0.9;

                //console.log(`Tramo ${i} - Mn_izq: ${Mn_izq_val} ton-m, Mn_der: ${Mn_der_val} ton-m`);

                results.Mn_izq.push(Mn_izq_val);
                results.Mn_der.push(Mn_der_val);

                const cm_v_vals = [getVal(cmShearData, i, 0), getVal(cmShearData, i, 1), getVal(cmShearData, i, 2)];
                const cv_v_vals = [getVal(cvShearData, i, 0), getVal(cvShearData, i, 1), getVal(cvShearData, i, 2)];

                const max_cm = Math.max(...cm_v_vals.map(Math.abs));
                const max_cv = Math.max(...cv_v_vals.map(Math.abs)); // These are Ton per raw data convention usually

                const cargascapacidadcmcv = 1.25 * (max_cm + max_cv);

                const luzLibre = getVal(this.datos.luz, i, 0) || 1;
                const term1 = (Mn_izq_val + Mn_der_val) / Number(luzLibre || 1);
                const vucortante_ton = term1 + cargascapacidadcmcv;
                const vucortante_kg = vucortante_ton;

                results.CapacidadCortante.push(vucortante_kg);

                // 1. Identify critical dimensions (Start of span is typically critical for capacity design check)
                const b_start = getVal(baseData, i, 0);
                const h_start = getVal(alturaData, i, 0);

                // 2. Constants
                // Effective Depth 'd'
                const d = StructuralUtils.calculateEffectiveDepth(h_start || 0);
                const Acw = (b_start || 0) * d; // cm2

                // Materials
                const validFc = Number(fc) || 210;
                const validFy = Number(fy) || 4200;

                // Phi factors
                const fr = 0.75;

                const Vc_kg = 0.53 * Math.sqrt(validFc) * Acw;
                const Vc_ton = Vc_kg / 1000;
                const PhiVc_ton = Vc_ton * fr;

                const Vu_capacity_ton = vucortante_ton;
                let Vs_ton = (Vu_capacity_ton / fr) - Vc_ton;
                if (Vs_ton < 0) Vs_ton = 0;

                const Av_one_leg = 0.713; // cm2
                const Av_total = Av_one_leg * 2; // 2 legs

                const Vs_for_calc_ton = Math.max(Vs_ton, 1);
                const Vs_for_calc_kg = Vs_for_calc_ton * 1000;

                const s_calc = Math.ceil((Av_total * validFy * d) / Vs_for_calc_kg);

                const Espaciamientocortante = s_calc > 0 ? s_calc : 0;

                // 7. Usar / Config / Estribado string
                const peralteEfectivocapacidad = d / 4;
                const lconfig = 2 * (h_start || 0);

                // User snippet: "const usarScapa = Math.min(Espaciocapacidad, peralteEfectivocapacidad, 10);"
                let usar = 10;
                if (Espaciamientocortante > 0 && peralteEfectivocapacidad > 0) {
                    usar = Math.min(Espaciamientocortante, peralteEfectivocapacidad, 10);
                } else {
                    usar = 10;
                }

                // Ensure integer and min limit (practical)
                usar = Math.floor(usar);
                if (usar < 5) usar = 5;

                const estribos = usar;

                // estribosCount: Length of confinement zone / spacing
                const estribosCount = Math.max(0, Math.floor((lconfig - 5) / usar));

                // String construction
                const estribadoscapacidad = `Estribado<br>1@5cm<br>${estribosCount}@${usar} cm<br>resto@20cm`;
                // --- Store Results (Pushing 1 value per TRAMO) ---
                results.Vu.push(Vu_capacity_ton * 1000);
                results.Acws.push(Acw);
                results.Vc.push(PhiVc_ton);
                results.Vs.push(Vs_ton);

                results.es.push(Espaciamientocortante);
                results.peralteefectivo.push(peralteEfectivocapacidad);
                results.lconfig.push(lconfig);
                results.usar.push(usar);
                results.estribos.push(estribosCount);
                results.estribadoscapacidad.push(estribadoscapacidad);
            }

            // Output formatting helpers
            const generateRow = (name, symbol, dataArray, unit, decimals = 2) => {
                const values = [];
                let k = 0;
                for (let i = 1; i <= numTramos; i++) {
                    values.push(
                        { value: StructuralUtils.round(dataArray[k++], decimals), unit: unit },
                        { value: StructuralUtils.round(dataArray[k++], decimals), unit: unit },
                        { value: StructuralUtils.round(dataArray[k++], decimals), unit: unit }
                    );
                }
                return { name, symbol, values };
            };

            const generateColspanRow = (name, symbol, dataArray, unit, decimals = 2) => {
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
                title: "4.- Diseño por capacidad",
                columnGroups: columnGroups,
                rows: [
                    generateColspanRow("Mn: izq", "Mn⁻", results.Mn_izq, "ton-m", 2), // Changed unit to ton-m for display clarity? Or keep kg-cm but use small value? User said "result... 63.29". That is Ton-m.
                    generateColspanRow("Mn: der", "Mn⁺", results.Mn_der, "ton-m", 2),
                    generateColspanRow("Capacidad cortante", "Vu(cap)", results.CapacidadCortante, "tonf", 2),
                    generateColspanRow("Area de corte", "Acws", results.Acws, "tonf", 2),
                    generateColspanRow("Cortante nominal proporcionada por el concreto", "Vc", results.Vc, "tonf", 0),
                    generateColspanRow("Cortante nominal proporcionada por el refuerzo", "Vs", results.Vs, "tonf", 0),
                    generateColspanRow("Espaciamiento requerido", "𝑆(cm)", results.es, "cm", 2),
                    generateColspanRow("𝐿𝑐𝑜𝑛𝑓𝑖𝑔", "𝐿𝑐𝑜𝑛𝑓𝑖𝑔", results.lconfig, "cm", 2),
                    generateColspanRow("𝑈𝑠𝑎𝑟", "𝑈𝑠𝑎𝑟", results.usar, "cm", 2),
                    generateColspanRow("# estribos zona conf.", "#", results.estribos, "cm", 2),
                    generateColspanRow("Estribado", "-", results.estribadoscapacidad, "", 0),

                    // generateRow("Fuerza cortante última", "Vu", results.Vu, "kg", 0),
                ]
            };
        } catch (error) {
            //console.error('CapacidadCalculator.calculate() - ERROR:', error);
            //console.error('Error stack:', error.stack);
            return {
                title: "4.- Diseño por capacidad (ERROR)",
                columnGroups: [],
                rows: []
            };
        }
    }
}
