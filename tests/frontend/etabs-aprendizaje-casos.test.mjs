// Aprendizaje por casos (pares arquitectura + estructuras): el agente decide lo que los
// proyectos estudiados respaldan y deja al ingeniero lo que cambia de un proyecto a otro.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import * as dm from '@mlightcad/data-model';
import {decisionesDeEstructura, nivelDeTitulo, escalaEntrePlanos, compararColumnas, proponer, evaluar, reglasValidas, MIN_CASOS_COSTUMBRE} from '../../resources/js/ingenieria/aprendizaje/casos.js';
import {CASOS} from '../../resources/js/ingenieria/aprendizaje/casosAprendidos.js';
import {createDrawingContext} from '../../resources/js/ingenieria/cad/drawingContext.js';
import {SKILLS} from '../../resources/js/ingenieria/agente/skills/index.js';
import {plano} from '../../scripts/agente/planos.mjs';

const eje = (nombre, x0, y0, x1, y1) => ({nombre, p: {x: x0, y: y0}, q: {x: x1, y: y1}});

test('reads what the engineer decided from the structural sheet texts, not from general notes', () => {
  const d = decisionesDeEstructura(['PLANO DE PLATEA CIMENTACION', 'Hz=0.70m', 'Df = -2.00 m', 'LOSA ALIGERADA E=20CM', 'PLANO DE ALIGERADO',
    'En vigas chatas, losas aligeradas y losas macizas será de 2 cm.', 'PLANO DE CIMIENTO CORRIDO']);
  assert.equal(d.cimentacion, 'platea');
  assert.equal(d.cimientoCorrido, true);
  assert.equal(d.hz, 0.7);
  assert.equal(d.df, 2);
  assert.equal(d.losa, 'aligerada', 'a slab named in the notes is not a slab drawn');
  assert.equal(d.espesorLosa, 0.2);
  assert.equal(nivelDeTitulo('MÓDULO IX: PLANTA DE DISTRIBUCIÓN 2DO NIVEL'), 2);
  assert.equal(nivelDeTitulo('Modulo XIV-Techo'), null);
});

test('architecture and structure are aligned by their named axes, also when drawn at another scale', () => {
  const arq = {ejes: [eje('1', 0, 0, 0, 6), eje('2', 4, 0, 4, 6), eje('A', 0, 0, 4, 0), eje('B', 0, 5, 4, 5)],
    columnas: [{eje: '1/A', tipo: 'C1', b: 0.4, h: 0.4}, {eje: '2/B', tipo: 'C2', b: 0.25, h: 0.5}]};
  const est = {ejes: [eje('1', 10, 0, 10, 12), eje('2', 18, 0, 18, 12), eje('A', 10, 0, 18, 0), eje('B', 10, 10, 18, 10)],
    columnas: [{eje: 'A/1', tipo: 'C1', b: 0.8, h: 0.8}, {eje: 'B/2', tipo: 'PL1', b: 0.6, h: 2}]};
  assert.equal(escalaEntrePlanos(arq.ejes, est.ejes), 2);
  const r = compararColumnas(arq, est);
  assert.equal(r.escala, 2);
  assert.deepEqual(r.filas.map((f) => f.igual), [true, false], 'C1 kept (at x2), C2 changed to a wall');
  assert.equal(r.coincidencia, 0.5);
});

test('the agent decides alone only what a validated rule or at least 3 matching projects back', () => {
  const caso = (nombre, luz, niveles, estribos) => ({nombre, rasgos: {niveles, luzLosa: luz, area: 60, columnas: 6, techoLiviano: true, placas: false, columnetas: 10},
    decisiones: {cimentacion: 'platea', espesorLosa: luz > 5 ? 0.25 : 0.2, cimientoCorrido: true, losaDeTecho: niveles === 1, estribos}});
  const casos = [caso('a', 4, 1, '3/8": 1@.05, 12@.10'), caso('b', 5.8, 2, '3/8": 1@.05, 12@.10'), caso('c', 3, 1, '3/8": 1@.05, 9@.10')];
  assert.ok(reglasValidas(casos).find((r) => r.clave === 'espesorLosa').valida);
  const p = proponer({niveles: 2, luzLosa: 6.2, area: 70, columnas: 8, techoLiviano: true, placas: false, columnetas: 12}, casos);
  assert.equal(p.decisiones.espesorLosa.valor, 0.25, 'rule L/25 generalizes to a span no case had');
  assert.equal(p.decisiones.losasDeEntrepiso.valor, 1);
  assert.equal(p.decisiones.losaDeTecho.valor, false);
  assert.ok(p.decide.includes('cimentacion'), `${MIN_CASOS_COSTUMBRE} projects agree on the raft`);
  assert.ok(p.ingeniero.includes('estribos'), 'stirrups change between projects: for the engineer');
  assert.match(p.decisiones.estribos.ingeniero, /Cambia entre proyectos/);
});

test('learned cases: when the agent decides alone it is right (leave one out)', () => {
  assert.ok(CASOS.length >= 3);
  for (const c of CASOS) assert.ok(!JSON.stringify(c).match(/BARDALES|101402|2166247|CIP/i), `${c.nombre} has no personal data`);
  const ev = evaluar(CASOS);
  assert.equal(ev.aciertoAgente, 1, JSON.stringify(ev.filas));
});

const m09 = plano('estructuras', 'Modulo 09 Vilcabamba arquitectura.dwg');
test('module 9 (two levels) through the chat tool: reads 2 levels and proposes the floor slab', {skip: !existsSync(m09)}, async () => {
  const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
  dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
  const db = new dm.AcDbDatabase();
  const b = readFileSync(m09);
  await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, dm.AcDbFileType.DWG);
  const ctx = createDrawingContext({getDatabase: () => db, dm});
  ctx.memoria ??= {};
  const r = await SKILLS.find((s) => s.name === 'proponer_estructura').run({}, ctx);
  assert.equal(r.ok, true);
  assert.match(r.mensaje, /^Leí 2 nivel\(es\)/);
  assert.match(r.mensaje, /Losas de entrepiso: 1/);
  assert.match(r.mensaje, /Espesor de losa \(m\): 0\.25/);
  assert.match(r.mensaje, /Para el ingeniero:[\s\S]*Profundidad de desplante/);
});
