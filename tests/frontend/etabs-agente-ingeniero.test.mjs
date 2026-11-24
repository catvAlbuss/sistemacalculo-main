// El agente no es un chatbot: investiga (revisión de ingeniería con normas), mira el plano como
// imagen cuando el motor tiene visión, y su análisis llega al ingeniero.
import test from 'node:test';
import assert from 'node:assert/strict';
import {runAgent, AGENTE_SERVIDOR} from '../../resources/js/ingenieria/agente/agentRunner.js';
import {analizarProyecto, lucesEntreColumnas, peralteViga, areaColumnaRequerida} from '../../resources/js/ingenieria/agente/analisisIngenieria.js';
import {INTERACCION_SKILLS} from '../../resources/js/ingenieria/agente/skills/interaccion.js';
import {svgDeCaja} from '../../resources/js/ingenieria/agente/vistaImagen.js';

const respuesta = (message) => ({ok: true, json: async () => ({choices: [{message}], usage: {prompt_tokens: 10, completion_tokens: 5}})});
const call = (name, args = {}, id = name) => ({id, type: 'function', function: {name, arguments: JSON.stringify(args)}});
const col = (x, y, b = 0.25, h = 0.25) => ({x, y, b, h, tipo: 'C1', eje: `${x}/${y}`});
const malla = (xs, ys, b, h) => xs.flatMap((x) => ys.map((y) => col(x, y, b, h)));

test('engineering review computes spans, beam depth, column demand and missing data', () => {
  const columnas = malla([0, 4, 12], [0, 5], 0.25, 0.25).map((c) => ({...c, at: 30, aislada: false}));
  assert.deepEqual(lucesEntreColumnas(columnas, 'x'), [4, 8]);
  assert.equal(peralteViga(5.5), 0.5);
  assert.ok(areaColumnaRequerida({at: 20, pisos: 3}) > 600);
  const r = analizarProyecto({memoria: {estructura: {columnas}}, datosProyecto: () => ({niveles: 3})});
  const temas = r.hallazgos.map((h) => `${h.nivel}:${h.tema}`);
  assert.ok(temas.includes('alto:datos'), 'missing zone/soil/category is high priority');
  assert.ok(temas.includes('alto:luces'), '8 m span is flagged');
  assert.ok(temas.includes('alto:columnas'), '0.25x0.25 columns are small for 3 levels');
  assert.ok(temas.includes('alto:sismo'), '3 levels without shear walls');
  assert.match(r.mensaje, /Revisión de ingeniería/);
});

test('after reading the structure the executor runs the engineering review and the model reasons on it', async () => {
  const pedidos = [];
  const replies = [{role: 'assistant', content: '', tool_calls: [call('leer_estructura')]}, {role: 'assistant', content: 'La luz de 8 m pide una columna intermedia o viga de 0.75 m; te recomiendo la columna.'}];
  const skills = [
    {name: 'leer_estructura', parameters: {type: 'object', properties: {}}, run: async (_a, ctx) => { ctx.memoria.estructura = {columnas: malla([0, 8], [0, 4]).map((c) => ({...c, at: 16}))}; return {ok: true, mensaje: 'Leí 4 columnas.'}; }},
    ...INTERACCION_SKILLS,
  ];
  const out = await runAgent({text: 'revisa la estructura', settings: {...AGENTE_SERVIDOR}, context: {memoria: {}, datosProyecto: () => ({})}, skills,
    fetchImpl: async (_u, init) => { pedidos.push(JSON.parse(init.body)); return respuesta(replies.shift()); }});
  assert.equal(pedidos.length, 2);
  assert.ok(pedidos[1].messages.some((m) => m.role === 'tool' && /Revisión de ingeniería/.test(m.content)), 'the model receives the review');
  assert.match(out.reply, /Leí 4 columnas[\s\S]*Análisis: La luz de 8 m/);
  assert.doesNotMatch(out.reply, /Revisión de ingeniería/, 'the automatic review is input for the model, not repeated text');
});

test('mirar_plano sends the drawing as an image to a vision engine, outside the tool message', async () => {
  const items = [{tipo: 'linea', puntos: [{x: 0, y: 0}, {x: 10, y: 0}]}, {tipo: 'texto', texto: 'C1 <&>', centro: {x: 5, y: 5}, alto: 0.2}];
  const ctx = {memoria: {}, readPlan: () => ({items, vistas: [{titulo: 'PRIMER NIVEL', caja: {x0: -1, y0: -1, x1: 11, y1: 11}}]}), rasterizar: async (svg) => { assert.match(svg, /C1 &lt;&amp;&gt;/); return 'data:image/jpeg;base64,QUJD'; }};
  const pedidos = [];
  const replies = [{role: 'assistant', content: '', tool_calls: [call('mirar_plano', {que: 'primer'})]}, {role: 'assistant', content: 'Veo una sola línea: falta la planta.'}];
  const out = await runAgent({text: 'mira la planta', settings: {...AGENTE_SERVIDOR, vision: true}, context: ctx, skills: INTERACCION_SKILLS,
    fetchImpl: async (_u, init) => { pedidos.push(JSON.parse(init.body)); return respuesta(replies.shift()); }});
  const msgs = pedidos[1].messages;
  const tool = msgs.find((m) => m.role === 'tool');
  assert.doesNotMatch(tool.content, /base64/, 'no image inside the tool message');
  const img = msgs.at(-1);
  assert.equal(img.role, 'user');
  assert.equal(img.content.find((p) => p.type === 'image_url').image_url.url, 'data:image/jpeg;base64,QUJD');
  assert.match(out.reply, /falta la planta/);
  assert.ok(!JSON.stringify(out.steps).includes('QUJD'), 'the image is not kept in the visible steps');
});

test('mirar_plano respects the per-project switch and engines without vision', async () => {
  const skill = INTERACCION_SKILLS.find((s) => s.name === 'mirar_plano');
  assert.equal((await skill.run({}, {permitirImagenes: false})).ok, false);
  assert.equal((await skill.run({}, {})).ok, false);
  assert.equal(svgDeCaja([], {x0: 0, y0: 0, x1: 1, y1: 1}).objetos, 0);
});
