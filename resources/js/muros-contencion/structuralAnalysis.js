// Análisis estructural del muro basado en la hoja CALCULO del libro "MURO DE CONTENCIÓN H=4", filas 94-120.
// Las claves de salida conservan las celdas que usa la vista: fila del libro + 171 (B277 es B106).
// Se aparta del libro por criterio de ingeniería en tres puntos:
// - q1 de la pantalla es siempre presión (q·Ka); el efecto sísmico entra solo por ΔEae y MAE.
// - q2 del talón se evalúa en su raíz (B - L), y el caso MAXIMO toma la menor reacción en ambos extremos.
// - Cortes y momentos usan la integral exacta de la carga trapezoidal en cualquier sección.
// - El peso propio de punta y talón es carga distribuida (hz·γc, Tn/m²), no la fuerza total del elemento.
// - En la punta el peso propio se opone a la reacción del terreno: Mu = 1.7R - 0.9PP.
export const DESIGN_CASES = ['SIN SISMO', 'CON SISMO', 'MAXIMO'];

const select = (mode, without, withSeismic, max = Math.max(without, withSeismic)) =>
    ({ 'SIN SISMO': without, 'CON SISMO': withSeismic, MAXIMO: max }[mode]);

const number = value => {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

function pressureRow(rows, id, comb) {
    return number(rows?.find(row => row.id === id)?.[comb]);
}

// comb4 (D+L+H) y comb5 (D+L+H+E) tienen coeficientes unitarios: son las columnas SIN y CON sismo del libro.
export function buildAnalysisInput({ predim = {}, dimensions = {}, results = {}, pressures = [], options = {} }) {
    const hz = number(dimensions.F86);
    const tipThickness = hz * 100;
    return {
        mode: options.mode || 'MAXIMO',
        gammaSoil: number(predim.B11),
        gammaConcrete: number(predim.B6),
        surcharge: number(predim.B25),
        slopeRad: number(predim.B20) * Math.PI / 180,
        ka: number(results.B99),
        seismicForce: number(results.C160),
        seismicMoment: number(results.C163),
        stem: number(dimensions.E79),
        hz,
        tip: number(dimensions.A89),
        heel: number(dimensions.D89),
        base: number(dimensions.B90),
        keyDepth: number(dimensions.G94),
        stressStatic: { s1: pressureRow(pressures, 'filaS1', 'comb4'), s2: pressureRow(pressures, 'filaS2', 'comb4') },
        stressSeismic: { s1: pressureRow(pressures, 'filaS1', 'comb5'), s2: pressureRow(pressures, 'filaS2', 'comb5') },
        stemShearAt: options.stemShearAt ?? .3,
        stemCutoff: options.stemCutoff ?? 0,
        heelCutoff: options.heelCutoff ?? 0,
        pedestal: options.pedestal ?? 0,
        tipShearAt: (tipThickness - 10) / 100,
        heelShearAt: (tipThickness - 10) / 100,
    };
}

// Carga trapezoidal con x medido desde la raíz. nearEnd: el exceso w está en la raíz; farEnd: en el extremo libre.
const nearEnd = (q, w, L, x) => ({ V: q * (L - x) + w * (L - x) ** 2 / (2 * L), M: q * (L - x) ** 2 / 2 + w * (L - x) ** 3 / (6 * L) });
const farEnd = (q, w, L, x) => ({ V: q * (L - x) + w * (L * L - x * x) / (2 * L), M: q * (L - x) ** 2 / 2 + w * (L - x) ** 2 * (2 * L + x) / (6 * L) });
const uniformShear = (q, L, x) => q * (L - x);
const uniformMoment = (q, L, x) => q * (L - x) ** 2 / 2;

function stemLoads(input) {
    const { gammaSoil, ka, slopeRad, stem: L, surcharge } = input;
    const q1 = surcharge * ka;
    const q2 = gammaSoil * ka * L * Math.cos(slopeRad) + q1;
    return { q1, q2, w: q2 - q1, L };
}

function seismicAction({ mode, seismicForce, seismicMoment }) {
    const force = mode === 'SIN SISMO' ? 0 : seismicForce;
    return { force, moment: x => mode === 'SIN SISMO' ? 0 : seismicMoment - force * x };
}

function analyzeStem(input) {
    const { q1, q2, w, L } = stemLoads(input);
    const { stemShearAt: X2, stemCutoff: X3 } = input;
    const X1 = 0;
    const seismic = seismicAction(input);
    const shear = { pressure: -uniformShear(q1, L, X2), linear: -(w * (L - X2) ** 2) / (2 * L) };
    const momentAt = x => [uniformMoment(q1, L, x), w * (L - x) ** 3 / (6 * L)];
    const [moment1, moment2] = momentAt(X1);
    const [cutoff1, cutoff2] = momentAt(X3);
    const shearTotal = Math.abs(shear.pressure + shear.linear);
    const momentTotal = moment1 + moment2;
    return {
        B277: q1, B278: q2, B279: L, B280: X1, B281: X2, B282: X3, E280: w, E281: X2 * w / L, E282: w - X2 * w / L,
        B286: shear.pressure, C286: shear.linear, D286: shearTotal, E286: seismic.force,
        B287: moment1, C287: moment2, D287: momentTotal, E287: seismic.moment(X1),
        B288: cutoff1, C288: cutoff2, D288: cutoff1 + cutoff2, E288: seismic.moment(X3),
        B290: 1.7 * momentTotal + seismic.moment(X1),
        B291: 1.7 * shearTotal + seismic.force,
        cutoffMu: 1.7 * (cutoff1 + cutoff2) + seismic.moment(X3),
    };
}

const stressAt = ({ s1, s2 }, x, base) => (s2 - s1) / base * x + s1;

function toeLoads({ mode, tip: L, hz, gammaConcrete, base, stressStatic, stressSeismic }) {
    const q1 = select(mode, stressAt(stressStatic, L, base), stressAt(stressSeismic, L, base));
    const q2 = select(mode, stressStatic.s1, stressSeismic.s1);
    return { selfWeight: hz * gammaConcrete, q1, q2, w: q2 - q1, L };
}

function analyzeToe(input) {
    const { selfWeight, q1, q2, w, L } = toeLoads(input);
    const { tipShearAt: X2 } = input;
    const X1 = 0;
    const shearWeight = uniformShear(selfWeight, L, X2);
    const shear = { pressure: -uniformShear(q1, L, X2), linear: -(w * (L * L - X2 * X2)) / (2 * L) };
    const moment1 = uniformMoment(q1, L, X1);
    const moment2 = w * L * L / 3;
    const momentTotal = -(moment1 + moment2);
    const momentWeight = uniformMoment(selfWeight, L, X1);
    return {
        H277: selfWeight, H278: q1, H279: q2, H280: L, H281: X1, H282: X2, K280: w, K281: w * X2 / L,
        H287: shear.pressure, I287: shear.linear, J287: shear.pressure + shear.linear, K287: shearWeight,
        H288: moment1, I288: moment2, J288: momentTotal, K288: momentWeight,
        H290: Math.abs(1.7 * momentTotal + 0.9 * momentWeight),
        H291: Math.abs(1.7 * (shear.pressure + shear.linear) + 0.9 * shearWeight),
    };
}

function heelLoads({ mode, heel: L, hz, gammaConcrete, gammaSoil, stem, slopeRad, surcharge, stressStatic, stressSeismic, base }) {
    const slopeArea = L * L * .5 * Math.tan(slopeRad);
    const surchargeArea = (surcharge / gammaSoil) * L / Math.cos(slopeRad);
    const root = base - L;
    const smallest = (a, b) => select(mode, a, b, Math.min(a, b));
    const q1 = smallest(stressStatic.s2, stressSeismic.s2);
    const q2 = smallest(stressAt(stressStatic, root, base), stressAt(stressSeismic, root, base));
    return { selfWeight: hz * gammaConcrete, soilWeight: (slopeArea + L * stem + surchargeArea) * gammaSoil / L, q1, q2, w: q2 - q1, L };
}

function analyzeHeel(input) {
    const { selfWeight, soilWeight, q1, q2, w, L } = heelLoads(input);
    const { heelShearAt: X2, heelCutoff: X3, pedestal: X4 } = input;
    const X1 = 0;
    const shearAt = x => {
        const pressure = -uniformShear(q1, L, x);
        const linear = -(w * (L - x) ** 2) / (2 * L);
        return [pressure, linear, pressure + linear, uniformShear(selfWeight, L, x), uniformShear(soilWeight, L, x)];
    };
    const momentAt = x => {
        const pressure = uniformMoment(q1, L, x);
        const linear = w * (L - x) ** 3 / (6 * L);
        return [pressure, linear, -(pressure + linear), uniformMoment(selfWeight, L, x), uniformMoment(soilWeight, L, x)];
    };
    const [N286, O286, P286, Q286, R286] = shearAt(X4);
    const [N287, O287, P287, Q287, R287] = shearAt(X2);
    const [N288, O288, P288, Q288, R288] = momentAt(X1);
    const [N289, O289, P289, Q289, R289] = momentAt(X3);
    return {
        N277: selfWeight, N278: soilWeight, N279: q1, N280: q2, N281: L, N282: X1, N283: X2, N284: X3,
        Q280: w, Q281: X2 * w / L, Q282: w - X2 * w / L, Q284: X4,
        N286, O286, P286, Q286, R286, N287, O287, P287, Q287, R287,
        N288, O288, P288, Q288, R288, N289, O289, P289, Q289, R289,
        N290: 1.7 * P288 + 1.4 * Q288 + 1.7 * R288,
        N291: 1.7 * P287 + 1.4 * Q287 + 1.7 * R287,
        cutoffMu: 1.7 * P289 + 1.4 * Q289 + 1.7 * R289,
        pedestalVu: 1.7 * P286 + 1.4 * Q286 + 1.7 * R286,
    };
}

function keyLoads({ gammaSoil, ka, stem, hz, slopeRad, surcharge, keyDepth: L }) {
    const staticTop = surcharge * ka;
    return {
        q1: gammaSoil * ka * (stem + hz) * Math.cos(slopeRad) + staticTop,
        q2: gammaSoil * ka * (stem + hz + L) * Math.cos(slopeRad) + staticTop,
        L,
    };
}

function analyzeKey(input) {
    const { q1, q2, L } = keyLoads(input);
    const shear1 = q1 * L;
    const shear2 = (q2 - q1) * L / 2;
    const moment1 = shear1 * L / 2;
    const moment2 = shear2 * 2 * L / 3;
    return {
        U277: q1, U278: q2, U279: L,
        U284: shear1, V284: shear2, W284: shear1 + shear2,
        U285: moment1, V285: moment2, W285: moment1 + moment2,
        U287: 1.7 * (moment1 + moment2),
        U288: 1.7 * (shear1 + shear2),
    };
}

export function analyzeRetainingWall(input) {
    return { pantalla: analyzeStem(input), punta: analyzeToe(input), talon: analyzeHeel(input), key: analyzeKey(input) };
}

// Mu y Vu de cada sección para los diagramas. x se mide desde la raíz del elemento.
export function internalForceSeries(input, divisions = 24) {
    const points = (L, at) => L > 0 ? Array.from({ length: divisions + 1 }, (_, i) => at(L * i / divisions)) : [];
    const seismic = seismicAction(input);
    const arm = seismic.force ? input.seismicMoment / seismic.force : 0;
    const stem = stemLoads(input), toe = toeLoads(input), heel = heelLoads(input);
    const key = keyLoads(input);
    return {
        pantalla: points(stem.L, x => {
            const load = nearEnd(stem.q1, stem.w, stem.L, x);
            return { x, Vu: 1.7 * load.V + (x < arm ? seismic.force : 0), Mu: 1.7 * load.M + Math.max(seismic.moment(x), 0) };
        }),
        punta: points(toe.L, x => {
            const load = farEnd(toe.q1, toe.w, toe.L, x);
            return { x, Vu: Math.abs(1.7 * load.V - 0.9 * uniformShear(toe.selfWeight, toe.L, x)), Mu: Math.abs(1.7 * load.M - 0.9 * uniformMoment(toe.selfWeight, toe.L, x)) };
        }),
        talon: points(heel.L, x => {
            const load = nearEnd(heel.q1, heel.w, heel.L, x);
            return {
                x,
                Vu: 1.4 * uniformShear(heel.selfWeight, heel.L, x) + 1.7 * uniformShear(heel.soilWeight, heel.L, x) - 1.7 * load.V,
                Mu: 1.4 * uniformMoment(heel.selfWeight, heel.L, x) + 1.7 * uniformMoment(heel.soilWeight, heel.L, x) - 1.7 * load.M,
            };
        }),
        key: points(key.L, x => {
            const load = farEnd(key.q1, key.q2 - key.q1, key.L, x);
            return { x, Vu: 1.7 * load.V, Mu: 1.7 * load.M };
        }),
    };
}

function flexure(Mu, d, fy, fc, b = 100) {
    const moment = Math.abs(Mu) * 100000;
    const a = d - Math.sqrt(Math.max(d * d - 2 * moment / (.85 * .9 * fc * b), 0));
    return { a, As: moment / (.9 * fy * (d - a / 2)) };
}

const barSpacing = (area, As) => Math.min(As > 0 ? Math.round(area * 100 / As) : 20, 20);

// Recortes y pedestal: filas 184-220 del libro. `bars` trae el área de la barra principal y su cantidad.
export function cutoffDesign(input, analysis, { fy, fc, crown, batter, bars = {} }) {
    const { pantalla, talon } = analysis;
    const stemT = (batter * (input.stem - input.stemCutoff) / input.stem + crown) * 100;
    const stemD = stemT - 4;
    const stemAsMin = .002 * stemT * 100;
    const stemFlexure = flexure(pantalla.cutoffMu, stemD, fy, fc);
    const stemAs = Math.max(stemFlexure.As, stemAsMin);

    const heelT = input.hz * 100;
    const heelD = heelT - 4;
    const heelFlexure = flexure(talon.cutoffMu, heelD, fy, fc);
    const heelAs = Math.max(heelFlexure.As, .0018 * 100 * heelD);

    const pedestalD = heelT - 10;
    const phiVc = .85 * .53 * pedestalD * 100 * Math.sqrt(fc) / 1000;
    const pedestalH = Math.max(Math.abs(talon.N291) * 1000 / (.85 * .53 * 100 * Math.sqrt(fc)) - pedestalD, 0);
    const bar = (element, As) => {
        const steel = bars[element];
        const count = steel?.cantidad > 1 ? 1 : 0;
        return steel && count ? { label: `${count} Ø ${steel.diametro}`, spacing: barSpacing(steel.area, As) } : null;
    };
    return {
        pantalla: {
            L: input.stemCutoff, Mu: pantalla.cutoffMu, limit: pantalla.B290 / 2, ok: pantalla.cutoffMu <= pantalla.B290 / 2,
            t: stemT, d: stemD, ...stemFlexure, AsUsar: stemAs, barra: bar('pantalla', stemAs),
        },
        talon: {
            L: input.heelCutoff, Mu: talon.cutoffMu, limit: talon.N290 / 2, ok: talon.cutoffMu <= talon.N290 / 2,
            t: heelT, d: heelD, ...heelFlexure, AsUsar: heelAs, barra: bar('talon', heelAs),
        },
        pedestal: { L: input.pedestal, Vu: talon.pedestalVu, phiVc, ok: talon.pedestalVu <= phiVc, h: pedestalH },
    };
}

// Coeficientes de Coulomb de Hoja1 (M29:N37). Solo cálculo: la hoja aún no ofrece este método.
export function coulombCoefficients({ phi, beta, delta = 0, alpha = 90 }) {
    const sin = degrees => Math.sin(degrees * Math.PI / 180);
    const activeRoot = Math.sqrt(sin(phi + delta) * sin(phi - beta) / (sin(alpha - delta) * sin(alpha - beta)));
    const passiveRoot = Math.sqrt(sin(phi + delta) * sin(phi + beta) / (sin(alpha + delta) * sin(alpha - beta)));
    return {
        Ka: sin(alpha + phi) ** 2 / ((1 + activeRoot) ** 2 * sin(alpha - delta) * sin(alpha) ** 2),
        Kp: sin(alpha - phi) ** 2 / ((1 - passiveRoot) ** 2 * sin(alpha + delta) * sin(alpha) ** 2),
    };
}

// Datos que el diseño de concreto toma del análisis: filas 124-130 del libro.
export function designDemands(analysis, dimensions = {}) {
    const hz = number(dimensions.F86) * 100;
    const section = (Mu, Vu, t, cover) => ({ Mu: Math.abs(Mu), Vu: Math.abs(Vu), t, d: t - cover });
    return {
        pantalla: section(analysis.pantalla.B290, analysis.pantalla.B291, (number(dimensions.C74) + number(dimensions.A83)) * 100, 4),
        punta: section(analysis.punta.H290, analysis.punta.H291, hz, 10),
        talon: section(analysis.talon.N290, analysis.talon.N291, hz, 10),
        key: section(analysis.key.U287, analysis.key.U288, number(dimensions.F91) * 100, 10),
    };
}
