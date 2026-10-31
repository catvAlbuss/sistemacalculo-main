import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeRetainingWall, buildAnalysisInput, coulombCoefficients, cutoffDesign, designDemands, internalForceSeries } from '../../resources/js/muros-contencion/structuralAnalysis.js';
import { Desing } from '../../resources/js/muros-contencion/desingConcretoArmado.js';

// Datos y valores esperados: hoja CALCULO de "MURO DE CONTENCIÓN H=4.xlsx".
const ka = 0.3279914751227952;
const workbook = {
    predim: { B6: 2.4, B11: 2.03, B20: 0, B25: 0.4 },
    dimensions: { F86: 0.7, E79: 4, A89: 3.5, D89: 1, B90: 4.9, G94: 0, C74: 0.2, A83: 0.2, F91: 0.4 },
    results: { B99: ka, C160: 1.37498, C163: 3.2999 },
    pressures: [
        { id: 'filaS1', comb4: 0.9602, comb5: 1.7849 },
        { id: 'filaS2', comb4: 7.0528, comb5: 6.2282 },
    ],
    options: { mode: 'MAXIMO', stemShearAt: 0.3, stemCutoff: 0, heelCutoff: 0, pedestal: 0 },
};

function assertCells(actual, expected) {
    for (const [cell, value] of Object.entries(expected)) {
        assert.ok(Math.abs(actual[cell] - value) < 0.006, `${cell}: ${actual[cell]} != ${value}`);
    }
}

test('analysis keeps the workbook where it is correct and applies the agreed engineering criteria', () => {
    const { pantalla, punta, talon, key } = analyzeRetainingWall(buildAnalysisInput(workbook));
    assertCells(pantalla, {
        B277: 0.1312, B278: 2.7945, B279: 4, B281: 0.3, E280: 2.6633, E286: 1.375,
        B287: 1.0496, C287: 7.1021, D287: 8.1517, E287: 3.2999,
        B290: 17.158, B291: 9.948,
    });
    assertCells(punta, {
        H277: 1.68, H278: 5.3121, H279: 1.7849, H280: 3.5, H282: 0.6, K280: -3.5272,
        H287: -15.4051, I287: 5.991, K287: 4.872,
        H288: 32.5366, I288: -14.4029, J288: -18.1337, K288: 10.29,
        H290: 21.566, H291: 11.619,
    });
    assertCells(talon, {
        N277: 1.68, N278: 8.52, N279: 6.2282, N280: 5.3214, N281: 1, N283: 0.6, Q280: -0.9068,
        N287: -2.4913, O287: 0.0725, Q287: 0.672, R287: 3.408,
        N288: 3.1141, O288: -0.1511, Q288: 0.84, R288: 4.26,
        N290: 3.381, N291: 2.622,
    });
    assertCells(key, { U277: 3.2606, U278: 3.2606, U279: 0, U287: 0, U288: 0 });
});

test('design case selects the governing reaction for each element', () => {
    const analyze = mode => analyzeRetainingWall(buildAnalysisInput({ ...workbook, options: { ...workbook.options, mode } }));
    const without = analyze('SIN SISMO'), seismic = analyze('CON SISMO'), envelope = analyze('MAXIMO');
    assert.equal(without.pantalla.E286, 0);
    assert.equal(seismic.pantalla.E286, 1.37498);
    assert.equal(without.pantalla.B277, seismic.pantalla.B277);
    assert.ok(Math.abs(without.talon.N280 - (1.2434 * 3.9 + 0.9602)) < 0.001);
    assert.equal(envelope.talon.N280, Math.min(without.talon.N280, seismic.talon.N280));
    assert.ok(Math.abs(without.punta.H279 - 0.9602) < 1e-9);
});

test('section shear uses the exact trapezoidal integral at any station', () => {
    const input = buildAnalysisInput({ ...workbook, options: { ...workbook.options, pedestal: 0.5, stemShearAt: 1 } });
    const { pantalla, talon } = analyzeRetainingWall(input);
    assert.ok(Math.abs(pantalla.C286 + 2.6633 * 9 / 8) < 1e-3);
    assert.ok(Math.abs(talon.O286 - 0.9068 * 0.25 / 2) < 1e-3);
});

test('diagrams start at the design demand of every element', () => {
    const input = buildAnalysisInput(workbook);
    const analysis = analyzeRetainingWall(input);
    const series = internalForceSeries(input);
    assert.ok(Math.abs(series.pantalla[0].Mu - analysis.pantalla.B290) < 1e-6);
    assert.ok(Math.abs(series.punta[0].Mu - analysis.punta.H290) < 1e-6);
    assert.ok(Math.abs(series.talon[0].Mu - analysis.talon.N290) < 1e-6);
    assert.equal(series.key.length, 0);
    assert.ok(series.pantalla.at(-1).Mu < 1e-6);
});

test('cutoffs and pedestal follow the workbook checks', () => {
    const input = buildAnalysisInput({ ...workbook, options: { ...workbook.options, stemCutoff: 2, heelCutoff: 0.5 } });
    const analysis = analyzeRetainingWall(input);
    const design = cutoffDesign(input, analysis, { fy: 4200, fc: 210, crown: 0.2, batter: 0.2, bars: { pantalla: { cantidad: 2, diametro: '1', area: 5.07 } } });
    assert.ok(Math.abs(design.pantalla.t - 30) < 1e-9);
    assert.ok(Math.abs(design.pantalla.d - 26) < 1e-9);
    assert.equal(design.pantalla.ok, design.pantalla.Mu <= analysis.pantalla.B290 / 2);
    assert.equal(design.pantalla.barra.label, '1 Ø 1');
    assert.ok(design.pantalla.barra.spacing <= 20);
    assert.ok(Math.abs(design.pedestal.phiVc - 39.1702) < 0.001);
    assert.equal(design.pedestal.h, 0);
    assert.equal(design.talon.barra, null);
});

test('coulomb coefficients match Hoja1', () => {
    const { Ka, Kp } = coulombCoefficients({ phi: 23.8, beta: 21.4 });
    assert.ok(Math.abs(Ka - 0.65) < 0.005);
    assert.ok(Math.abs(Kp - 4.219) < 0.005);
});

test('demands feed the design section and reproduce its workbook results', () => {
    const fromAnalysis = designDemands(analyzeRetainingWall(buildAnalysisInput(workbook)), workbook.dimensions);
    assert.deepEqual([fromAnalysis.pantalla.t, fromAnalysis.pantalla.d], [40, 36]);
    assert.deepEqual([Math.round(fromAnalysis.punta.t), Math.round(fromAnalysis.punta.d)], [70, 60]);

    // Filas 124-130 del libro: la sección se valida con la demanda que el libro le entrega.
    const demands = {
        pantalla: { Mu: 20.7263, Vu: 11.2353, t: 40, d: 36 },
        punta: { Mu: 81.2483, Vu: 39.5679, t: 70, d: 60 },
        talon: { Mu: 4.126, Vu: 2.9802, t: 70, d: 60 },
    };

    const components = {};
    let stored = { analisisEstructural: demands };
    globalThis.Alpine = { data: (name, factory) => { components[name] = factory; }, store: () => stored };
    globalThis.document = new EventTarget();
    const container = { innerHTML: '' };
    document.getElementById = () => container;
    const vm = Desing(); vm.$nextTick = () => {}; vm.init();
    document.dispatchEvent(new CustomEvent('predimensionamiento-calculated', { detail: { inputValues: { B7: 210, B8: 4200 }, resultados: {} } }));

    const module = name => {
        const element = components[`${name}Module`]();
        element.$watch = () => {};
        element.init();
        element.calcular();
        return element;
    };
    const pantalla = module('pantalla');
    assert.ok(Math.abs(pantalla.resultados.flexion.B320 - 3.7825) < 0.001);
    assert.ok(Math.abs(pantalla.resultados.flexion.B322 - 16.0755) < 0.002);
    assert.ok(Math.abs(pantalla.resultados.corte.C308 - 23.5021) < 0.001);

    const punta = module('punta');
    assert.ok(Math.abs(punta.resultados.flexion.B320 - 9.1226) < 0.002);
    assert.ok(Math.abs(punta.resultados.flexion.B321 - 38.7712) < 0.01);
    assert.equal(punta.resultados.corte.C310, 'ESTA MAL');

    const talon = module('talon');
    assert.ok(Math.abs(talon.resultados.flexion.B322 - 12) < 1e-9, 'el talón usa el mínimo de 0.002');
    vm.destroy();
});
