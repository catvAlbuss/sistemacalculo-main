// El agente aprende patrones de los casos (no reglas fijas), se mide con casos que no vio,
// incorpora proyectos nuevos solo, responde corto y no muestra nombres de clientes.
import test from 'node:test';
import assert from 'node:assert/strict';
import {aprenderPatron, predecir, patronUtil} from '../../resources/js/ingenieria/aprendizaje/patrones.js';
import {proponer, nombreVisible} from '../../resources/js/ingenieria/aprendizaje/casos.js';
import {proponerManifiesto, numeroDeModulo, descubrirPares} from '../../scripts/agente/pares-entrenamiento.mjs';
import {respuestaHonesta} from '../../resources/js/ingenieria/agente/agentRunner.js';

// Casos sintéticos de un despacho: zapatas cuando la planta pasa de ~100 m² (umbral que nadie escribió).
const caso = (i, area, cim, extra = {}) => ({nombre: `p:modulo-${i}`, grupo: `p${i % 3}`, id: `modulo-${i}`,
  rasgos: {niveles: 1, area, luzLosa: 4, columnas: 6, placas: false, cubierta: true, falsoCielo: false, deportivo: false, agua: false, banos: true, ...extra},
  decisiones: {cimentacion: cim}});
const casos = [[30, 'platea'], [45, 'platea'], [60, 'platea'], [75, 'platea'], [90, 'platea'], [120, 'zapatas'], [150, 'zapatas'], [200, 'zapatas'], [260, 'zapatas'], [400, 'zapatas']].map(([a, c], i) => caso(i, a, c));

test('a threshold is learned from the cases, with its accuracy on cases it did not see', () => {
  const pat = aprenderPatron(casos, 'cimentacion');
  assert.equal(pat.arbol.pregunta.k, 'area');
  assert.ok(pat.arbol.pregunta.umbral > 90 && pat.arbol.pregunta.umbral <= 120, `umbral ${pat.arbol.pregunta.umbral}`);
  assert.equal(predecir(pat.arbol, {area: 300}), 'zapatas');
  assert.equal(predecir(pat.arbol, {area: 50}), 'platea');
  assert.ok(pat.aciertoNoVisto >= 0.9 && patronUtil(pat));
  assert.match(pat.texto, /área en planta \(m²\) ≥ \d+/);
});

test('few or contradictory cases give no pattern (the agent keeps asking)', () => {
  assert.equal(aprenderPatron(casos.slice(0, 4), 'cimentacion'), null, 'fewer than 8 cases');
  const ruido = casos.map((c, i) => ({...c, decisiones: {cimentacion: i % 2 ? 'zapatas' : 'platea'}}));
  assert.equal(patronUtil(aprenderPatron(ruido, 'cimentacion')), false);
});

test('a learned pattern drives the proposal, and with one project it still asks the specialist', () => {
  const unProyecto = casos.map((c) => ({...c, grupo: 'p1'}));
  const d = proponer({niveles: 1, area: 300, luzLosa: 4, columnas: 6}, unProyecto).decisiones;
  // La regla de cimentación del despacho (60 m²) no explica estos casos: decide el patrón.
  assert.equal(d.cimentacion.valor, 'zapatas');
  assert.ok(d.cimentacion.ingeniero, 'one project: confirmation required');
});

test('onboarding pairs a new project by module number, whatever the naming', () => {
  for (const [n, esperado] of [['M-04 ARQ.dwg', 4], ['Módulo IV - Est.dwg', 4], ['12.COLEGIO MODULO 12 - ESTRUCTURAS.dwg', 12], ['m07_arquitectura.dwg', 7], ['planta general.dwg', null]]) assert.equal(numeroDeModulo(n), esperado, n);
  const {entradas, dudas} = proponerManifiesto(['M-04 ARQ.dwg', 'Modulo 4 - Est.dwg', 'METRADO MODULO 4.xlsx', 'M-05 ARQ.dwg', 'M-05 ARQ v2.dwg', 'M-05 EST.dwg', 'M-06 ARQ.dwg']);
  assert.deepEqual(entradas, [{id: 'modulo-04', arquitectura: 'M-04 ARQ.dwg', estructura: 'Modulo 4 - Est.dwg', metrado: 'METRADO MODULO 4.xlsx'}]);
  assert.deepEqual(dudas.map((d) => `${d.id}:${d.motivo}`), ['modulo-05:hay más de un candidato', 'modulo-06:falta la estructura']);
  const {pares} = descubrirPares(['M-04 ARQ.dwg', 'Modulo 4 - Est.dwg'], {nuevo: [{id: 'modulo-04', arquitectura: 'M-04 ARQ.dwg', estructura: 'Modulo 4 - Est.dwg'}]});
  assert.equal(pares.length, 1, 'different names, same module: accepted');
});

test('the chat answer is short and never shows the client project of a learned case', () => {
  assert.equal(nombreVisible('vinchos:modulo-01'), 'módulo 01 estudiado');
  const r = {ok: true, mensaje: 'texto técnico largo '.repeat(30), resumen: 'Listo: láminas E-01 y E-02 de P.\n• Cimentación: platea.', paraElIngeniero: 'Confírmame:\n• ¿Qué cimentación uso?',
    avisos: ['a1', 'a2', 'a3', 'a4', 'a5']};
  const texto = respuestaHonesta('', [{tool: 'plano_estructuras', result: r}]);
  assert.doesNotMatch(texto, /texto técnico largo/);
  assert.match(texto, /^Listo: láminas/);
  assert.equal(texto.match(/^Aviso:/gm).length, 3);
  assert.match(texto, /2 aviso\(s\) más/);
});
