import test from 'node:test';
import assert from 'node:assert/strict';
import { computeSpectrum, resolveParams } from '../../resources/js/espectro-sismico/core.js';

test('E.030-2026 Z2/S2 usa el extremo superior sin Vs30 y corrige las aceleraciones', () => {
    const { meta, points } = computeSpectrum({
        version: '2026', zona: 2, suelo: 'S2', U: 1.5, Rbase: 8,
        Ia: 1, Ip: 1, Tmax: 3, paso: 0.1,
    });

    assert.deepEqual(resolveParams('2026', 2, 'S2'), { Z: 0.25, S: 1.3, Tp: 0.6, Tl: 2 });
    assert.equal(meta.S, 1.3);
    assert.equal(meta.R, 8);
    assert.equal(meta.SaMax, 0.15234);
    for (const [T, Sa, SaMS2] of [
        [0, 0.06094, 0.5978],
        [0.12, 0.15234, 1.4945],
        [0.6, 0.15234, 1.4945],
        [2, 0.0457, 0.4483],
        [3, 0.02031, 0.1993],
    ]) {
        const point = points.find(point => point.T === T);
        assert.equal(point?.Sa, Sa, `Sa en T=${T}`);
        assert.equal(point?.SaMS2, SaMS2, `Sa en m/s² en T=${T}`);
    }
});

test('Z2/S2 conserva sus resultados para normas anteriores y E.031', () => {
    for (const version of ['1977', '1997', '2003', '2016', '2018', 'e031']) {
        const { meta } = computeSpectrum({ version, zona: 2, suelo: 'S2', U: 1.5 });
        assert.equal(meta.S, 1.2, version);
        assert.equal(meta.Tp, 0.6, version);
        assert.equal(meta.SaMax, version === '1977' ? 0.39375
            : ['1997', '2003'].includes(version) ? 0.16875 : 0.14063, version);
    }
});

test('la corrección no cambia S0/S1 de 2026 ni los factores de puentes', () => {
    for (const zona of [1, 2, 3, 4]) {
        assert.equal(resolveParams('2026', zona, 'S0').S, 0.8);
        assert.equal(resolveParams('2026', zona, 'S1').S, 1);
    }
    assert.equal(computeSpectrum({ version: 'puentes', zona: 0.25, suelo: 'II' }).meta.SaMax, 0.07813);
});
