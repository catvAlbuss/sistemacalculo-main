import test from 'node:test';
import assert from 'node:assert/strict';
import * as dm from '@mlightcad/data-model';
import {planCasaPrimerNivel} from '../../resources/js/ingenieria/agente/skills/casaPrimerNivel.js';
import {drawPrimitives} from '../../resources/js/ingenieria/cad/cadExecutor.js';
import {createDrawingContext} from '../../resources/js/ingenieria/cad/drawingContext.js';
import {runAgent, stripThinking} from '../../resources/js/ingenieria/agente/agentRunner.js';
import {L} from '../../resources/js/ingenieria/cad/primitives.js';

const newDb = (insunits) => {const db = new dm.AcDbDatabase(); db.createDefaultData(); if (insunits) db.insunits = insunits; return db;};
const overlap = (a, b) => a.x0 < b.x1 - 1e-6 && b.x0 < a.x1 - 1e-6 && a.y0 < b.y1 - 1e-6 && b.y0 < a.y1 - 1e-6;

test('house plan fills the lot without overlapping rooms and gives every room an exit', () => {
  for (const args of [{}, {frente: 6, fondo: 15, dormitorios: 2, banos: 1, cochera: false}, {frente: 12, fondo: 30, dormitorios: 4, banos: 3}]) {
    const plan = planCasaPrimerNivel(args);
    const {frente, fondo} = plan.parametros;
    const rooms = plan.rectangulos;
    rooms.forEach((a, i) => {
      assert.ok(a.x0 >= -1e-6 && a.y0 >= -1e-6 && a.x1 <= frente + 1e-6 && a.y1 <= fondo + 1e-6, `${a.nombre} inside lot`);
      rooms.slice(i + 1).forEach((b) => assert.equal(overlap(a, b), false, `${a.nombre} / ${b.nombre}`));
    });
    const area = rooms.reduce((sum, r) => sum + (r.x1 - r.x0) * (r.y1 - r.y0), 0);
    assert.ok(Math.abs(area - frente * fondo) < 1e-3, 'rooms tile the whole lot');
    assert.equal(plan.ambientes.filter((a) => /DORM/.test(a.nombre)).length, plan.parametros.dormitorios);
    assert.ok(plan.ambientes.some((a) => a.nombre === 'BAÑO'));
    assert.ok(plan.vanos >= rooms.length - 2, 'doors and openings for the rooms');
    assert.ok(plan.columnas >= 4 && plan.primitivas.every((p) => Object.values(L).includes(p.layer)));
  }
});

test('narrow lots drop the garage and report what did not fit', () => {
  const plan = planCasaPrimerNivel({frente: 6, fondo: 12, dormitorios: 4, banos: 3, cochera: true});
  assert.equal(plan.parametros.cochera, false);
  assert.ok(plan.warnings.length > 0);
});

test('executor creates colored layers, scales to drawing units and records one edit', () => {
  const plan = planCasaPrimerNivel({frente: 8, fondo: 20});
  for (const [units, k] of [[6, 1], [4, 1000]]) {
    const db = newDb(units);
    const edits = [];
    const result = drawPrimitives(db, plan.primitivas, {dm, edit: (d, label, fn) => {edits.push(label); fn();}});
    assert.equal(edits.length, 1);
    assert.equal(result.escala, k);
    const entities = db.tables.blockTable.modelSpace.newIterator().toArray();
    assert.equal(entities.length, plan.primitivas.length);
    assert.equal(db.tables.layerTable.getAt(L.COLUMNAS).color.colorIndex, 5);
    const xs = entities.filter((e) => e instanceof dm.AcDbLine).flatMap((e) => [e.startPoint.x, e.endPoint.x]);
    const maxX = Math.max(...plan.primitivas.filter((p) => p.type === 'line').flatMap((p) => [p.a[0], p.b[0]]));
    assert.ok(Math.abs(Math.max(...xs) - maxX * k) < 1e-6, 'drawing extents follow the units');
  }
});

test('reading skills summarize the drawing and find texts in meters', () => {
  const db = newDb(4);
  const ctx = createDrawingContext({getDatabase: () => db, dm});
  ctx.draw(planCasaPrimerNivel({}).primitivas, 'casa');
  const summary = ctx.summarize();
  assert.equal(summary.unidades, 'milímetros');
  assert.match(summary.capas, /A-MUROS:\d+/);
  assert.match(summary.tipos, /LINE:\d+/);
  assert.equal(planCasaPrimerNivel({'baños': 3, frente: 10}).parametros.banos, 3);
  const found = ctx.findTexts('cocina', 5);
  assert.equal(found.total, 1);
  assert.equal(found.items[0].texto.startsWith('COCINA'), true);
  assert.ok(found.items[0].x > 0 && found.items[0].x < 8, 'position reported in meters');
});

test('agent runs the requested skill, returns a short Spanish reply and strips reasoning', async () => {
  const db = newDb(6);
  const context = createDrawingContext({getDatabase: () => db, dm});
  const bodies = [];
  const replies = [
    {choices: [{message: {role: 'assistant', content: '<think>plan</think>', tool_calls: [{id: 'c1', type: 'function', function: {name: 'casa_primer_nivel', arguments: '{"frente":9,"fondo":22,"dormitorios":3}'}}]}}], usage: {prompt_tokens: 900, completion_tokens: 40}},
    {choices: [{message: {role: 'assistant', content: '<think>ok</think>Listo: casa de 9 x 22 m dibujada.'}}], usage: {prompt_tokens: 1100, completion_tokens: 20}},
  ];
  const fetchImpl = async (url, init) => {bodies.push(JSON.parse(init.body)); return {ok: true, json: async () => replies.shift()};};
  const steps = [];
  const out = await runAgent({text: 'Construye el primer nivel de una casa', context, fetchImpl, onStep: (s) => steps.push(s), settings: {baseUrl: 'http://x/v1/', model: 'm'}});
  // La respuesta es el mensaje real de la herramienta, no la paráfrasis del modelo.
  assert.match(out.reply, /^Dibujé el primer nivel de una casa de 9 x 22 m con 3 dormitorio/);
  assert.equal(steps[0].result.ok, true);
  assert.ok(db.tables.blockTable.modelSpace.newIterator().toArray().length > 100);
  assert.equal(bodies[0].tools.length, 12);
  assert.ok(JSON.stringify(steps[0].result).length < 1200, 'tool results stay compact');
  assert.deepEqual(out.usage, {prompt: 2000, completion: 60});
  assert.equal(stripThinking('a</think> b'), 'b');
});

test('the agent never claims what did not happen: failed tool, malformed tool call, no tool at all', async () => {
  const db = newDb(6);
  const context = createDrawingContext({getDatabase: () => db, dm});
  const respuesta = (r) => ({ok: true, json: async () => r});
  // 1) La herramienta falla y el modelo igual dice que generó las láminas (qwen3-cad, "eje Z-Z").
  let replies = [
    {choices: [{message: {role: 'assistant', content: '', tool_calls: [{id: 'c1', type: 'function', function: {name: 'leer_estructura', arguments: '{}'}}]}}]},
    {choices: [{message: {role: 'assistant', content: 'Se han generado las láminas E-01 y E-02 con platea.'}}]},
  ];
  let out = await runAgent({text: 'mejora los detalles', context, fetchImpl: async () => respuesta(replies.shift()), settings: {baseUrl: 'http://x/v1', model: 'm'}});
  assert.match(out.reply, /^No pude hacer las columnas y ejes: .+No se cambió el plano\.$/s);
  assert.doesNotMatch(out.reply, /Se han generado/);
  // 2) Ollama 500 "XML syntax error" (qwen3.5:4b escribió mal la llamada): un reintento.
  let llamadas = 0;
  replies = [{choices: [{message: {role: 'assistant', content: 'Hola, ¿qué plano reviso?'}}]}];
  out = await runAgent({text: 'hola', context, settings: {baseUrl: 'http://x/v1', model: 'qwen3.5:4b'}, fetchImpl: async () => {
    llamadas++;
    if (llamadas === 1) return {ok: false, status: 500, text: async () => '{"error":{"message":"XML syntax error on line 3: element <function> closed by </parameter>"}}'};
    return respuesta(replies.shift());
  }});
  assert.equal(llamadas, 2, 'retried once');
  assert.equal(out.reply, 'Hola, ¿qué plano reviso?');
  // Dos veces mal escrita: mensaje claro, sin el JSON crudo de Ollama.
  await assert.rejects(runAgent({text: 'x', context, settings: {baseUrl: 'http://x/v1', model: 'qwen3.5:4b'}, fetchImpl: async () => ({ok: false, status: 500, text: async () => 'XML syntax error on line 3'})}),
    /no escribió bien la llamada a la herramienta \(dos veces\)\. No se hizo ningún cambio en el plano/);
  // 3) Sin herramientas, el modelo dice "Listo": no se afirma un cambio.
  replies = [{choices: [{message: {role: 'assistant', content: 'Listo, mejoré los detalles.'}}]}];
  out = await runAgent({text: 'mejora los detalles', context, fetchImpl: async () => respuesta(replies.shift()), settings: {baseUrl: 'http://x/v1', model: 'm'}});
  assert.match(out.reply, /^No hice cambios en el plano: no se ejecutó ninguna herramienta\./);
});

test('paid cloud models and tool errors are reported clearly', async () => {
  const context = createDrawingContext({getDatabase: () => newDb(6), dm});
  await assert.rejects(runAgent({text: 'x', context, fetchImpl: async () => ({ok: false, status: 402, text: async () => ''})}), /de pago/);
  const replies = [
    {choices: [{message: {tool_calls: [{id: 'a', function: {name: 'dibujar_ejes', arguments: '{"x":[],"y":[]}'}}]}}]},
    {choices: [{message: {content: 'Faltan separaciones.'}}]},
  ];
  const out = await runAgent({text: 'ejes', context, fetchImpl: async () => ({ok: true, json: async () => replies.shift()})});
  assert.equal(out.steps[0].result.ok, false);
  assert.match(out.steps[0].result.error, /separación/);
});
