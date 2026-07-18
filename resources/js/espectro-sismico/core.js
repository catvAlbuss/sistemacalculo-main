/**
 * core.js — Matemática PURA del espectro de diseño (sin DOM, sin ubigeo).
 *
 * Compartido entre:
 *  - la vista Espectro Sísmico (index.js, que agrega UI/ubigeo/exportadores)
 *  - el generador del CAD (Define ▸ Response Spectrum Functions ▸ Generar
 *    Espectro, en resources/js/cad/analysis/7_responseSpectrumDefinitions.js)
 *
 * Mantener aquí SOLO tablas normativas y funciones puras: este módulo entra
 * al bundle del CAD y no debe arrastrar dependencias de página.
 */

export const zoneZ = {
    "1977": { 1: 0.4,  2: 0.7,  3: 1    },
    "1997": { 1: 0.15, 2: 0.3,  3: 0.4  },
    "2003": { 1: 0.15, 2: 0.3,  3: 0.4  },
    "2016": { 1: 0.1,  2: 0.25, 3: 0.35, 4: 0.45 },
    "2018": { 1: 0.1,  2: 0.25, 3: 0.35, 4: 0.45 },
    "2026": { 1: 0.1,  2: 0.25, 3: 0.35, 4: 0.45 },
    "e031": { 1: 0.1,  2: 0.25, 3: 0.35, 4: 0.45 },
};

export const sueloOld = {
    "1977": { S1: { S: 1, Tp: 0.4 }, S2: { S: 1.2, Tp: 0.6 }, S3: { S: 1.5, Tp: 0.9 } },
    "1997": { S1: { S: 1, Tp: 0.4 }, S2: { S: 1.2, Tp: 0.6 }, S3: { S: 1.4, Tp: 0.9 }, S4: { S: 1.4, Tp: 0.9 } },
    "2003": { S1: { S: 1, Tp: 0.4 }, S2: { S: 1.2, Tp: 0.6 }, S3: { S: 1.4, Tp: 0.9 }, S4: { S: 1.4, Tp: 0.9 } },
};

export const factorS2016 = {
    Z4_S0: 0.8, Z4_S1: 1, Z4_S2: 1.05, Z4_S3: 1.1,
    Z3_S0: 0.8, Z3_S1: 1, Z3_S2: 1.15, Z3_S3: 1.2,
    Z2_S0: 0.8, Z2_S1: 1, Z2_S2: 1.2,  Z2_S3: 1.4,
    Z1_S0: 0.8, Z1_S1: 1, Z1_S2: 1.6,  Z1_S3: 2,
};

export const factorS2026 = {
    ...factorS2016,
    Z4_S4: 1.1, Z4_S5: 1.1,
    Z3_S4: 1.2, Z3_S5: 1.2,
    Z2_S4: 1.4, Z2_S5: 1.4,
    Z1_S4: 2,   Z1_S5: 2,
};

export const sueloModern = {
    S0: { Tp: 0.3, Tl: 3 }, S1: { Tp: 0.4, Tl: 2.5 }, S2: { Tp: 0.6, Tl: 2 },
    S3: { Tp: 1, Tl: 1.6 }, S4: { Tp: 1, Tl: 1.6 },   S5: { Tp: 1, Tl: 1.6 },
};

// Puentes MTC/AASHTO: factor de sitio por clase
export const sueloPuentes = { I: { S: 1.0 }, II: { S: 1.2 }, III: { S: 1.5 }, IV: { S: 2.0 } };

export function resolveParams(version, zonaVal, sueloVal) {
    if (version === "puentes") {
        const soil = sueloPuentes[sueloVal];
        return soil ? { Z: Number(zonaVal), S: soil.S, Tp: null, Tl: null } : null;
    }
    if (version === "1977" || version === "1997" || version === "2003") {
        const soil = sueloOld[version][sueloVal];
        return soil ? { Z: zoneZ[version][zonaVal], S: soil.S, Tp: soil.Tp, Tl: null } : null;
    }
    if (version === "e031") {
        const S    = factorS2016[`Z${zonaVal}_${sueloVal}`];
        const soil = sueloModern[sueloVal];
        return S && soil ? { Z: zoneZ.e031[zonaVal], S, Tp: soil.Tp, Tl: soil.Tl } : null;
    }
    const factors = version === "2026" ? factorS2026 : factorS2016;
    const S    = factors[`Z${zonaVal}_${sueloVal}`];
    const soil = sueloModern[sueloVal];
    return S && soil ? { Z: zoneZ[version][zonaVal], S, Tp: soil.Tp, Tl: soil.Tl } : null;
}

export function factorC(T, Tp, Tl, version) {
    if (version === "1977") return T === 0 ? 2.5 : Math.min(2.5, (Tp / T) ** (2 / 3));
    if (version === "1997" || version === "2003") return T < Tp ? 2.5 : 2.5 * (Tp / T);
    if (version === "2016" || version === "2018" || version === "e031") {
        if (T <= Tp) return 2.5;
        if (T <= Tl) return 2.5 * (Tp / T);
        return (2.5 * Tp * Tl) / (T * T);
    }
    // 2026
    if (T < 0.2 * Tp) return 1 + 7.5 * (T / Tp);
    if (T <= Tp)      return 2.5;
    if (T <= Tl)      return 2.5 * (Tp / T);
    return (2.5 * Tp * Tl) / (T * T);
}

export function csPuentes(T, A, S) {
    if (T === 0) return 2.5 * A;
    return Math.min(2.5 * A, (1.2 * A * S) / (T ** (2 / 3)));
}

const round = (v, d) => Number(v.toFixed(d));

/**
 * Calcula el espectro completo (port puro de calcular() de index.js).
 *
 * @param {object} opts
 *   version  "1977"|"1997"|"2003"|"2016"|"2018"|"2026"|"e031"|"puentes"
 *   zona     número de zona (o A para puentes)
 *   suelo    "S0".."S5" (o "I".."IV" para puentes)
 *   U, Rbase, Ia, Ip, B, Ts, Tmax, paso
 * @returns {{points:[{T,C,Sa,SaMS2}], meta:object}} o {error:string}
 */
export function computeSpectrum({
    version = "2026", zona, suelo, U = 1, Rbase = 8,
    Ia = 1, Ip = 1, B = 1, Ts = 0, Tmax = 10, paso = 0.05,
} = {}) {
    const bridge = version === "puentes";
    const isE031 = version === "e031";

    if (!Number.isFinite(Tmax) || !Number.isFinite(paso) || Tmax <= 0 || paso <= 0) {
        return { error: "Verifique Tmax y paso." };
    }
    if (!zona || !suelo) return { error: "Selecciona zona y suelo." };
    if (!(Rbase > 0)) return { error: "R debe ser mayor que 0." };

    let params = resolveParams(version, zona, suelo);
    if (!params) return { error: "No hay parámetros para la combinación zona/suelo seleccionada." };

    // E.030-2026: degradación del perfil si Ts > 0.65·Tp (Art. del suelo).
    let sueloEfectivo = suelo, sueloModificado = false;
    if (version === "2026" && Ts > 0 && params.Tp && Ts > 0.65 * params.Tp && suelo !== "S5") {
        const deg = { S0: "S1", S1: "S2", S2: "S3", S3: "S4", S4: "S5" };
        sueloEfectivo = deg[suelo] || suelo;
        sueloModificado = sueloEfectivo !== suelo;
        params = resolveParams(version, zona, sueloEfectivo) || params;
    }

    const applyIrr = ["2016", "2018", "2026"].includes(version);
    const IaEf = applyIrr ? Ia : 1;
    const IpEf = applyIrr ? Ip : 1;
    const R    = isE031 ? Rbase : Rbase * IaEf * IpEf;
    const { Z, S, Tp, Tl } = params;

    const puntos = new Set();
    for (let t = 0; t <= Tmax + 1e-9; t = Math.round((t + paso) * 1000) / 1000) puntos.add(t);
    if (Tp && Tp <= Tmax) puntos.add(Number(Tp.toFixed(3)));
    if (Tl && Tl <= Tmax) puntos.add(Number(Tl.toFixed(3)));
    if (version === "2026" && Tp) puntos.add(Number((0.2 * Tp).toFixed(3)));

    const points = Array.from(puntos).sort((a, b) => a - b).map((T) => {
        let C, Sa;
        if (bridge) {
            C  = csPuentes(T, Z, S);
            Sa = C / R;
        } else {
            C  = factorC(T, Tp, Tl, version);
            Sa = (Z * U * C * S) / (R * B);
        }
        return { T, C: round(C, 4), Sa: round(Sa, 5), SaMS2: round(Sa * 9.81, 4) };
    });

    const SaMax = bridge ? (Z * 2.5) / R : (Z * U * 2.5 * S) / (R * B);

    return {
        points,
        meta: {
            version, zona, suelo, sueloEfectivo, sueloModificado,
            Z, S, Tp, Tl, U, Rbase, R, Ia: IaEf, Ip: IpEf, B, Ts,
            SaMax: round(SaMax, 5),
        },
    };
}
