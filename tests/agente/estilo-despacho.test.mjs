import test from 'node:test';
import assert from 'node:assert/strict';
import {reglasDeEstilo, preferenciaDeEstilo, textoEstilo, medirEstiloDePlano} from '../../resources/js/ingenieria/aprendizaje/estiloDespacho.js';
import {aplicarPreferencias} from '../../resources/js/ingenieria/agente/preferenciasCliente.js';
import {ESTILO_SKILLS} from '../../resources/js/ingenieria/agente/skills/estiloDespacho.js';
import {L} from '../../resources/js/ingenieria/cad/primitives.js';

const plano = (cim, losa) => ({tipos: {cimentacion: {vistas: 1, clases: cim}, losa: {vistas: 1, clases: losa}}});
const dos = [
  plano({muro: {fraccion: 0.12, capa: '.N1 Muros Altos'}, columna: {fraccion: 0.1, capa: '0'}, viga: {fraccion: 0}},
    {columneta: {fraccion: 0}, vigueta: {fraccion: 0.25, capa: 'viguetas'}, viga: {fraccion: 0}}),
  plano({muro: {fraccion: 0.3, capa: '.N1 Muros Altos'}, columna: {fraccion: 0.1, capa: '0'}, viga: {fraccion: 0}},
    {columneta: {fraccion: 0.001}, vigueta: {fraccion: 0.3, capa: 'viguetas'}, viga: {fraccion: 0}}),
];

test('a style learned from two plans of the office: removes what it never draws, adds walls to the foundation and uses its layers', () => {
  const r = reglasDeEstilo(dos);
  assert.equal(r.planos, 2);
  assert.ok(r.ocultar.some((o) => o.capas.includes(L.COLUMNETAS) && o.en.includes('losa') && o.en.includes('losaTecho')));
  assert.equal(r.opciones.murosCimentacion, true);
  assert.ok(r.renombrar.some((x) => x.capa === L.MUROS_E && x.destino === '.N1 Muros Altos'));
  assert.ok(r.renombrar.some((x) => x.capa === L.VIGUETAS && x.destino === 'viguetas'));
  // La capa "0" no nombra nada: las columnas siguen en la del despacho.
  assert.ok(!r.renombrar.some((x) => x.capa === L.COLUMNAS));
  // Vigas, columnas, zapatas y losas nunca se quitan (E.060 1.2.4 e), aunque no aparezcan.
  assert.ok(!r.ocultar.some((o) => o.capas.some((c) => [L.VIGAS, L.VIGAS_CIM, L.COLUMNAS, L.ZAPATAS].includes(c))));
  assert.match(textoEstilo(r), /no dibujas las columnetas.*\n.*dibujas los muros.*\n.*\.N1 Muros Altos/s);
});

test('one plan is not enough to change the drawing', () => {
  const r = reglasDeEstilo(dos.slice(0, 1));
  assert.deepEqual([r.ocultar.length, r.renombrar.length, Object.keys(r.opciones).length], [0, 0, 0]);
  assert.match(textoEstilo(r), /con 2 o más/);
  assert.match(textoEstilo(null), /aprende mi estilo/);
});

test('the learned style is applied on the sheet blocks: hidden layers go away and drawings take the office layer, texts stay', () => {
  const pref = preferenciaDeEstilo(reglasDeEstilo(dos));
  const bloques = [{id: 'aligerado', tipo: 'losa', contenido: {primitivas: [
    {type: 'polyline', layer: L.COLUMNETAS}, {type: 'line', layer: L.VIGUETAS}, {type: 'text', layer: L.VIGUETAS, h: 1}]}}];
  const [b] = aplicarPreferencias(bloques, [pref]);
  assert.deepEqual(b.contenido.primitivas.map((p) => `${p.type}:${p.layer}`), ['line:viguetas', `text:${L.VIGUETAS}`]);
  assert.equal(preferenciaDeEstilo(reglasDeEstilo([])), null);
});

test('a plan without structural plan views is not learned, and without a server the style stays in the session', async () => {
  assert.deepEqual(medirEstiloDePlano([]), {tipos: {}});
  const aprender = ESTILO_SKILLS.find((s) => s.name === 'aprender_estilo');
  const ctx = {memoria: {}, readPlan: () => ({items: []})};
  const r = await aprender.run({}, ctx);
  assert.equal(r.ok, false);
  assert.match(r.error, /plano de estructuras terminado/);
  const olvidar = ESTILO_SKILLS.find((s) => s.name === 'olvidar_estilo');
  assert.equal((await olvidar.run({}, {memoria: {estiloDespacho: {}}})).ok, true);
});
