// Arquitectura → modelo de análisis (.e2k): lo que arma el agente lo lee completo el MISMO lector de
// Análisis Estructural (e2k-import.js), con sus supuestos a la vista.
import test from 'node:test';
import assert from 'node:assert/strict';
import {modeloE2k, espectroE030, armadoColumnaE2k} from '../../resources/js/ingenieria/analisis/modeloE2k.js';
import {leerE2k} from '../../scripts/agente/lectorE2k.mjs';
import {rutaDirecta} from '../../resources/js/ingenieria/agente/agentRunner.js';
import {SKILLS} from '../../resources/js/ingenieria/agente/skills/index.js';

// Planta de 2 x 2 paños (ejes A–C y 1–3 cada 4 m) con columnas en 8 cruces: falta la del centro
// (B-2), donde las vigas se cruzan sin columna. Una columna en L en A-1.
const col = (x, y, extra = {}) => ({nodo: {x, y}, x, y, b: 0.3, h: 0.3, tipo: 'C1', ...extra});
const estructura = {
  escala: 1,
  columnas: [col(0, 0, {tipo: 'C2', b: 0.5, h: 0.5, forma: 'L', espesor: 0.25}), col(4, 0), col(8, 0), col(0, 4), col(8, 4), col(0, 8), col(4, 8), col(8, 8)],
  ejesNombrados: [
    {nombre: 'A', p: {x: 0, y: -1}, q: {x: 0, y: 9}}, {nombre: 'B', p: {x: 4, y: -1}, q: {x: 4, y: 9}}, {nombre: 'C', p: {x: 8, y: -1}, q: {x: 8, y: 9}},
    {nombre: '1', p: {x: -1, y: 0}, q: {x: 9, y: 0}}, {nombre: '2', p: {x: -1, y: 4}, q: {x: 9, y: 4}}, {nombre: '3', p: {x: -1, y: 8}, q: {x: 9, y: 8}},
  ],
};
const modelo = {niveles: 2, entrepisos: [3.2], techo: 6.2, losaTecho: true, losa: {espesor: 0.2}, vigas: [{eje: 'A', b: 0.3, h: 0.5}, {eje: '1', b: 0.25, h: 0.4}]};
const datos = {zona: '3', suelo: 'S2', categoria: 'A2'};

test('el modelo de dos pisos se lee completo en Análisis Estructural', async () => {
  const g = modeloE2k({estructura, modelo, datos, nombre: 'prueba'});
  assert.equal(g.resumen.pisos, 2);
  assert.equal(g.resumen.nudos, 9);        // 8 columnas + el cruce B-2 sin columna
  assert.equal(g.resumen.apoyos, 8);
  assert.equal(g.resumen.vigas, 24);       // 12 tramos por piso
  assert.equal(g.resumen.losas, 8);        // 4 paños por piso
  assert.ok(g.resumen.secciones.includes('C2-50X50X25'));
  assert.equal(g.resumen.combinaciones.length, 9);
  assert.ok(g.supuestos.some((s) => /R = 8/.test(s)) && g.supuestos.some((s) => /L\/T/.test(s)));
  const m = await leerE2k(g.texto);
  const barras = m.model.frames ?? m.model.beams;
  assert.equal(barras.filter((f) => f.type === 'column').length, 16);
  assert.equal(barras.filter((f) => f.type === 'beam').length, 24);
  assert.equal(m.model.areas.length, 8);
  assert.equal(m.model.stories.length, 3);
  assert.equal(m.definitions.responseSpectrumCases.length, 2);
  assert.equal(m.definitions.loadCombinations.length, 9);
  assert.equal(m.definitions.frameSections.find((s) => s.name === 'C2-50X50X25')?.type, 'L');
  assert.equal(m.definitions.frameSections.find((s) => s.name === 'V-30X50')?.h, 50);
});

test('espectro E.030 y avisos sin datos sísmicos', () => {
  const sa = espectroE030({Z: 0.35, U: 1.5, S: 1.15, Tp: 0.6, TL: 2.0}, 8);
  assert.equal(sa[0].Sa, 0.1887);                      // 0.35·1.5·2.5·1.15/8 en la meseta
  assert.equal(sa.find((q) => q.T === 1.2).Sa, 0.0943); // C = 2.5·0.6/1.2
  const g = modeloE2k({estructura, modelo, datos: {}, nombre: 'x'});
  assert.equal(g.resumen.sismo, null);
  assert.ok(g.avisos.some((a) => /Faltan datos sísmicos/.test(a)));
  assert.ok(g.supuestos.some((s) => /Categoría C/.test(s)));
});

test('el pedido lleva a la herramienta y sin láminas la herramienta lo dice', async () => {
  assert.deepEqual(rutaDirecta('envía esto a análisis estructural'), {tool: 'modelo_analisis', args: {}});
  assert.deepEqual(rutaDirecta('exporta el e2k'), {tool: 'modelo_analisis', args: {}});
  assert.deepEqual(rutaDirecta('abre análisis'), {tool: 'abrir_analisis', args: {}});
  const r = await SKILLS.find((s) => s.name === 'modelo_analisis').run({}, {memoria: {}});
  assert.equal(r.ok, false);
  assert.equal(r.opciones[0].herramienta, 'plano_estructuras');
});

test('las columnas llevan al .e2k el mismo refuerzo del cuadro de columnas', async () => {
  // 0.25 x 0.50: 1 % = 12.25 cm² → 8Ø5/8" (2 por cara corta, 4 por cara larga).
  const r = armadoColumnaE2k({b: 0.25, h: 0.5});
  assert.deepEqual([r.n, r.texto, r.patron], [8, '8Ø5/8"', 'R-2-4']);
  // L 0.50 x 0.50 x 0.25 (0.1875 m²): el cuadro pide 10; el patrón de ETABS en L da 11.
  const l = armadoColumnaE2k({b: 0.5, h: 0.5, forma: 'L', espesor: 0.25});
  assert.deepEqual([l.nCuadro, l.n], [10, 11]);
  const g = modeloE2k({estructura, modelo, datos, nombre: 'prueba'});
  assert.ok(g.supuestos.some((s) => /refuerzo del cuadro de columnas/.test(s)));
  assert.ok(g.avisos.some((s) => /C2-50X50X25 11 en vez de 10/.test(s)));
  const m = await leerE2k(g.texto);
  const c1 = m.definitions.frameSections.find((s) => s.name === 'C1-30X30');
  assert.deepEqual(c1.rebarPattern, {type: 'rectangular', n2: 3, n3: 2}); // 6Ø5/8": 3 + 2 por cara
  assert.equal(c1.designCheck, 'CHECK');
  assert.ok(Math.abs(c1.longBarDiameter - 0.015875) < 1e-5);
  assert.equal(c1.cover, 4);
});
