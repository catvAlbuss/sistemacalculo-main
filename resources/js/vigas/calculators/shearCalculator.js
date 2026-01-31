import { StructuralUtils, CONCRETE_CONSTANTS } from "./SharedCalculatorUtils.js";

export class ShearCalculator {
    constructor(data) {
        this.parametros = data.parametros;
        this.datos = data.datos;
    }

    calculate() {
        const { fc, fy, numTramos } = this.parametros;
        const baseData = this.datos?.base || this.parametros.base;
        const alturaData = this.datos?.altura || this.parametros.altura;
        const fuerzas = this.datos?.fuerzas || {};

        // Estructura de columnas dinámicas
        const columnGroups = [];
        for (let i = 1; i <= numTramos; i++) {
            columnGroups.push({
                title: `TRAMO ${i}`,
                columns: ["START", "MIDDLE", "END"]
            });
        }

        const getValue = (source, tramoIdx, positionIdx) => {
            let val = source;
            const tramoKey = `tramo${tramoIdx}`;

            if (source && typeof source === 'object' && tramoKey in source) {
                val = source[tramoKey];
            }

            if (val && typeof val === 'object' && !Array.isArray(val)) {
                if (positionIdx === 0) return val.a || 0;
                if (positionIdx === 1) return val.b || 0;
                if (positionIdx === 2) return val.c || 0;
            }

            if (Array.isArray(val)) return val[positionIdx] || 0;
            return Number(val) || 0;
        };

        const results = {
            acws: [],
            Vcs: [],
            tetaVcs: [],
            Vss: [],
            Espacios: [],
            Sd4s: [],
            Lconfigs: [],
            Usars: [],
            EstribosCounts: [],
            Estribados: []
        };

        const envMaxPos = fuerzas.positivo?.['ENV max']?.['V3'] || {};
        const envMinPos = fuerzas.positivo?.['ENV min']?.['V3'] || {};
        const envMaxNeg = fuerzas.negativo?.['ENV max']?.['V3'] || {};
        const envMinNeg = fuerzas.negativo?.['ENV min']?.['V3'] || {};

        for (let i = 1; i <= numTramos; i++) {
            for (let pos = 0; pos < 3; pos++) {
                const b = getValue(baseData, i, pos);
                const h = getValue(alturaData, i, pos);

                // Calculate Vu as absolute max of all envelopes
                const val1 = Math.abs(getValue(envMaxPos, i, pos));
                const val2 = Math.abs(getValue(envMinPos, i, pos));
                const val3 = Math.abs(getValue(envMaxNeg, i, pos));
                const val4 = Math.abs(getValue(envMinNeg, i, pos));

                const Vu_tonf = Math.max(val1, val2, val3, val4);

                const d = StructuralUtils.calculateEffectiveDepth(h);
                const acw = b * d;

                // Vc in Tonnes
                // Vc = 0.53 * sqrt(fc) * acw (kg) / 1000 -> Tonne
                // User formula: 0.53 * Math.sqrt(fcN) * (acw / 1000)
                const Vc = 0.53 * Math.sqrt(fc) * (acw / 1000);

                const phiVc = 0.85 * Vc;

                // Vs in Tonnes
                // Vs = Vu / 0.85 - Vc
                let Vs = Math.abs((Vu_tonf / 0.85) - Vc);

                // Spacing calculation
                // Espacios = Math.ceil((0.713 * fy * d / (Math.max(Vs, 1) * 1000)) * 2);
                // Ensure Vs used in formula is effectively > 0 for division if intended, or minimal. 
                // User used Math.max(Vs, 1) * 1000. 1 Tonne?
                const Espacios = Math.ceil((0.713 * fy * d / (Math.max(Vs, 1) * 1000)) * 2);

                const ped = d / 4;
                const laconfigcorte = 2 * h;

                // 🔒 ESPACIADO FINAL: mínimo 10
                // usarS = Math.min(Espacios, ped, 10);
                const usarS = Math.min(Espacios, ped, 10);

                // Estribos count
                // Dynamic calculation based on confinement zone length: (Lconfig - 5) / usarS
                // Using floor as it fits fully inside? Or ceil? User hardcode was 16. (180-5)/10 = 17.5.
                // If they used 16, maybe they did something else. I will use round or floor.
                // Assuming standard practice: number of spaces + 1 = bars?
                // Number of spaces = Length / Spacing.
                // Lconf = 180. 1@5cm. Remaining = 175.
                // spaces = 175/10 = 17.5.
                // bars = 1 (at 5) + floor(17.5)?
                // Usually 1st bar at 5cm. Then bars at S.
                // Distance covered by N bars at S: N*S.
                // 5 + N*S <= Lconf.
                // N*S <= Lconf - 5.
                // N <= (Lconf - 5)/S.
                const estribosCount = Math.floor((laconfigcorte - 5) / usarS);

                const estribadoOriginal = `1@5cm; ${estribosCount}@${StructuralUtils.round(usarS, 2)} cm; resto@20cm`;

                results.acws.push(acw);
                results.Vcs.push(Vc);
                results.tetaVcs.push(phiVc);
                results.Vss.push(Vs);
                results.Espacios.push(Espacios);
                results.Sd4s.push(ped);
                results.Lconfigs.push(laconfigcorte);
                results.Usars.push(usarS);
                results.EstribosCounts.push(estribosCount);
                results.Estribados.push(estribadoOriginal);
            }
        }

        const generateResultRow = (name, symbol, dataArray, unit, decimals = 2) => {
            const values = [];
            let k = 0;
            for (let i = 1; i <= numTramos; i++) {
                values.push(
                    { value: typeof dataArray[k] === 'string' ? dataArray[k] : StructuralUtils.round(dataArray[k], decimals), unit: unit },
                    { value: typeof dataArray[k + 1] === 'string' ? dataArray[k + 1] : StructuralUtils.round(dataArray[k + 1], decimals), unit: unit },
                    { value: typeof dataArray[k + 2] === 'string' ? dataArray[k + 2] : StructuralUtils.round(dataArray[k + 2], decimals), unit: unit }
                );
                k += 3;
            }
            return { name, symbol, values };
        };

        const rows = [
            generateResultRow("Area de corte", "𝐴𝑐𝑤", results.acws, "cm²", 2),
            generateResultRow("Cortante nominal proporcionada por el concreto", "𝑉𝑐", results.Vcs, "Tonf", 2),
            generateResultRow("", "Ø 𝑉𝑐", results.tetaVcs, "Tonf", 2),
            generateResultRow("Cortante nominal proporcionada por el refuerzo", "𝑉𝑠", results.Vss, "Tonf", 2),
            generateResultRow("Espaciamiento requerido", "S", results.Espacios, "cm", 2),
            generateResultRow("Peralte efectivo dividido entre 4", "S=d/4", results.Sd4s, "cm", 2),
            generateResultRow("Lconfig", "Lconfig", results.Lconfigs, "cm", 0),
            generateResultRow("Usar", "Usar", results.Usars, "cm", 2),
            generateResultRow("# estribos zona conf.", "#", results.EstribosCounts, "", 0),
            generateResultRow("Estribado", "", results.Estribados, "", 0)
        ];

        return {
            title: "3.- Diseño de cortante",
            columnGroups: columnGroups,
            rows: rows
        };
    }
}
