import { StructuralUtils, CONCRETE_CONSTANTS } from "./SharedCalculatorUtils.js";

export class FlexionCalculator {
    constructor(data) {
        this.parametros = data.parametros;
        this.datos = data.datos;
    }

    calculate() {
        const { fc, fy, numTramos } = this.parametros;
        const fcNum = Number(fc);
        const fyNum = Number(fy);

        const baseData = this.datos?.base || this.parametros.base;
        const alturaData = this.datos?.altura || this.parametros.altura;

        // Datos de capas para secciones negativo y positivo
        const capasNegativo = this.datos?.capas?.negativo || {};
        const capasPositivo = this.datos?.capas?.positivo || {};

        // Momentos de diseño (M3 de los grupos de fuerzas)
        // Buscar M3 en la sección negativo y positivo
        let momentDataNegativo = {};
        let momentDataPositivo = {};

        // Extraer M3 de los grupos disponibles en fuerzas
        if (this.datos?.fuerzas?.negativo) {
            for (const [grupo, conceptos] of Object.entries(this.datos.fuerzas.negativo)) {
                if (conceptos?.M3) {
                    momentDataNegativo = conceptos.M3;
                    break;
                }
            }
        }

        if (this.datos?.fuerzas?.positivo) {
            for (const [grupo, conceptos] of Object.entries(this.datos.fuerzas.positivo)) {
                if (conceptos?.M3) {
                    momentDataPositivo = conceptos.M3;
                    break;
                }
            }
        }

        const columnGroups = [];
        for (let i = 1; i <= numTramos; i++) {
            columnGroups.push({
                title: `TRAMO ${i}`,
                columns: ["START", "MIDDLE", "END"]
            });
        }

        // Función auxiliar para obtener valor según tramo y posición
        const getValue = (source, tramoIdx, positionIdx) => {
            let val = source;
            const tramoKey = `tramo${tramoIdx}`;

            if (source && typeof source === 'object') {
                if (tramoKey in source) {
                    val = source[tramoKey];
                }
            }

            if (val && typeof val === 'object' && !Array.isArray(val)) {
                if (positionIdx === 0) return Number(val.a) || 0;
                if (positionIdx === 1) return Number(val.b) || 0;
                if (positionIdx === 2) return Number(val.c) || 0;   
            }

            if (Array.isArray(val)) {
                return Number(val[positionIdx]) || 0;
            }

            return Number(val) || 0;
        };

        // Función para calcular resultados de flexión para una sección
        const calculateFlexionResults = (momentData, type, comparisonMomentData = null) => {
            const results = {
                d: [],
                a: [],
                As: [],
                As_min: [],
                As_bal: [],
                As_max: [],
                As_usar: [],
                Mu: [],
                Mu_derived: [],
                Mu_final: [],
                rho: [],
                Md: [], // Will be recalculated in UI based on real steel
                meta: [] // Store input params for each cell for potential recalculation
            };

            for (let i = 1; i <= numTramos; i++) {
                for (let pos = 0; pos < 3; pos++) {
                    const b = getValue(baseData, i, pos);
                    const h = getValue(alturaData, i, pos);
                    const initialNumCapas = 1;

                    const Mu_tonfm_raw = getValue(momentData, i, pos);
                    let Mu_derived_tonfm = 0;
                    let Mu_final_tonfm = Mu_tonfm_raw;

                    if (type === 'positivo' && comparisonMomentData) {
                        const Mu_comp_tonfm = getValue(comparisonMomentData, i, pos);
                        // User Formula: (-momentosUltimos[i] / 3) where comparison is negative moments
                        Mu_derived_tonfm = (-Mu_comp_tonfm) / 3;

                        if (Mu_tonfm_raw > Mu_derived_tonfm) {
                            Mu_final_tonfm = Mu_tonfm_raw;
                        } else {
                            Mu_final_tonfm = Mu_derived_tonfm;
                        }
                    }

                    const Mu_kgcm = StructuralUtils.tonf_m_to_kg_cm(Mu_final_tonfm);

                    // Initial d estimation
                    const d = StructuralUtils.calculateEffectiveDepth(h, initialNumCapas);
                    const beta1 = StructuralUtils.calculateBeta1(fcNum);
                    const phi = CONCRETE_CONSTANTS.PHI_FLEXION;

                    let a = 0;
                    let As = 0;

                    if (b > 0 && d > 0 && fcNum > 0) {
                        const term = (2 * Math.abs(Mu_kgcm)) / (phi * 0.85 * fcNum * b);
                        const discrimination = Math.pow(d, 2) - term;

                        if (discrimination >= 0) {
                            a = d - Math.sqrt(discrimination);
                            As = (0.85 * fcNum * b * a) / fyNum;
                        } else {
                            a = 0;
                            As = 0;
                        }
                    }

                    const As_min = Math.max(((0.7 * Math.sqrt(fcNum)) / fyNum) * b * d, (14 * b * d) / fyNum);

                    const As_bal = (((0.85 * beta1 * fcNum) / fyNum) * (0.003 / (0.003 + 0.0021))) * b * d;
                    const As_max = 0.75 * As_bal;

                    let As_usar = 0;
                    if (As < As_min) {
                        As_usar = As_min;
                    } else if (As > As_min && As < As_max) {
                        As_usar = As;
                    } else {
                        As_usar = As_max;
                    }

                    let rho = 0;
                    if (b > 0 && d > 0) {
                        rho = As / (b * d);
                    }

                    let Md = 0;
                    if (b > 0 && fcNum > 0 && d > 0) {
                        const a_theor = (As_usar * fyNum) / (0.85 * fcNum * b);
                        Md = phi * As_usar * fyNum * (d - a_theor / 2);
                    }

                    results.d.push(d);
                    results.a.push(a);
                    results.As.push(As);
                    results.As_min.push(As_min);
                    results.As_bal.push(As_bal);
                    results.As_max.push(As_max);
                    results.As_usar.push(As_usar);
                    // results.Mu.push(Mu_kgcm);
                    results.Mu_derived.push(Mu_derived_tonfm);
                    results.Mu_final.push(Mu_final_tonfm);
                    results.rho.push(rho * 100);
                    // results.Md.push(Md);

                    results.meta.push({
                        b,
                        h,
                        fc: fcNum,
                        fy: fyNum,
                        Mu: Mu_kgcm,
                        tramo: i,
                        pos: pos, // 0=start, 1=mid, 2=end
                        As_max,
                        As_min,
                        As_usar
                    });
                }
            }
            return results;
        };
        const resultsNegativo = calculateFlexionResults(momentDataNegativo, 'negativo');
        const resultsPositivo = calculateFlexionResults(momentDataPositivo, 'positivo', momentDataNegativo);

        // Instead of returning formatted rows, return the raw data structure
        // The Renderer will handle formatting and interactivity
        return {
            type: 'FLEXION_INTERACTIVE',
            numTramos: numTramos,
            columnGroups: columnGroups,
            negativo: {
                title: "2.- Diseño a Flexión (Sección Negativa)",
                data: resultsNegativo,
                capas: capasNegativo // Pass raw layers data
            },
            positivo: {
                title: "2.- Diseño a Flexión (Sección Positiva)",
                data: resultsPositivo,
                capas: capasPositivo // Pass raw layers data
            }
        };
    }
}
