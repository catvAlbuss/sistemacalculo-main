import test from 'node:test';
import assert from 'node:assert/strict';
import {runAgent, AGENTE_SERVIDOR} from '../../resources/js/ingenieria/agente/agentRunner.js';

const call = (name, args = {}, id = name) => ({id, type: 'function', function: {name, arguments: JSON.stringify(args)}});
const response = (message) => ({ok: true, json: async () => ({choices: [{message}], usage: {prompt_tokens: 10, completion_tokens: 5}})});
const skill = (name, run) => ({name, parameters: {type: 'object', properties: {}}, run});

test('a completed CAD generation is verified and its evidence returns to OpenAI before finishing', async () => {
  const executed = [], requests = [], progress = [];
  const replies = [{tool_calls: [call('plano_estructuras')]}, {content: 'Las láminas incluyen un despiece completo y están aprobadas para obra.'}];
  const out = await runAgent({text: 'Estructura el módulo 8', context: {memoria: {}}, onProgress: (p) => progress.push(p),
    skills: [skill('plano_estructuras', async () => { executed.push('dibujar'); return {ok: true, terminal: true, mensaje: 'Dibujé E-01.'}; }),
      skill('revisar_laminas', async () => { executed.push('verificar'); return {ok: true, mensaje: 'Sin textos encimados.', encimados: 0}; })],
    fetchImpl: async (_url, init) => { requests.push(JSON.parse(init.body)); return response(replies.shift()); }});
  assert.deepEqual(executed, ['dibujar', 'verificar']);
  assert.equal(requests.length, 2);
  assert.ok(requests[1].messages.some((m) => m.role === 'tool' && m.content.includes('Sin textos encimados')));
  assert.equal(out.usage.prompt, 20);
  assert.doesNotMatch(out.reply, /despiece completo|aprobadas para obra/);
  assert.ok(progress.some((p) => p.fase === 'verificando'));
});

test('the agent can correct and regenerate, with a fresh verification after each drawing', async () => {
  const executed = [];
  const replies = [{tool_calls: [call('plano_estructuras')]}, {tool_calls: [call('corregir_estructura')]}, {tool_calls: [call('plano_estructuras')]}, {content: 'Queda pendiente comprobar los armados.'}];
  const out = await runAgent({text: 'Crea y corrige las láminas', context: {memoria: {}},
    skills: [skill('plano_estructuras', async () => { executed.push('dibujar'); return {ok: true, terminal: true, mensaje: 'Dibujo generado.'}; }),
      skill('corregir_estructura', async () => { executed.push('corregir'); return {ok: true, mensaje: 'Decisión corregida.'}; }),
      skill('revisar_laminas', async () => { executed.push('verificar'); return {ok: true, mensaje: 'Controles aplicados.'}; })],
    fetchImpl: async () => response(replies.shift())});
  assert.deepEqual(executed, ['dibujar', 'verificar', 'corregir', 'dibujar', 'verificar']);
  assert.match(out.reply, /Decisión corregida/);
});

test('the same write is not repeated within a request without an intervening correction', async () => {
  let writes = 0, requests = 0;
  const out = await runAgent({text: 'Termina las láminas', context: {memoria: {}},
    skills: [skill('plano_estructuras', async () => { writes++; return {ok: true, mensaje: 'Dibujé las láminas.'}; }),
      skill('revisar_laminas', async () => ({ok: true, mensaje: 'Revisión registrada.'}))],
    fetchImpl: async () => { requests++; return response({tool_calls: [call('plano_estructuras')]}); }});
  assert.equal(writes, 1);
  assert.ok(requests <= 3);
  assert.match(out.reply, /repet|sin cambios/i);
});

test('button actions go through the model and preserve their selected arguments', async () => {
  const requests = [];
  let received;
  const replies = [{tool_calls: [call('revisar_laminas')]}, {content: 'Revisa el rótulo pendiente.'}];
  await runAgent({text: 'Corregir los textos', accionSolicitada: {herramienta: 'revisar_laminas', args: {corregir: true}}, settings: AGENTE_SERVIDOR,
    context: {memoria: {}}, skills: [skill('revisar_laminas', async (args) => { received = args; return {ok: true, mensaje: 'Revisión aplicada.'}; })],
    fetchImpl: async (_u, init) => { requests.push(JSON.parse(init.body)); return response(replies.shift()); }});
  assert.equal(received.corregir, true);
  assert.ok(requests[0].messages.some((m) => String(m.content).includes('revisar_laminas') && String(m.content).includes('corregir')));
});

test('missing technical data stops the cycle without automatic verification or another model call', async () => {
  let requests = 0;
  const out = await runAgent({text: 'Genera las láminas', context: {memoria: {}},
    skills: [skill('plano_estructuras', async () => ({ok: false, terminal: true, error: 'Falta el suelo.'})),
      skill('revisar_laminas', async () => assert.fail('no revisar un dibujo que no se generó'))],
    fetchImpl: async () => { requests++; return response({tool_calls: [call('plano_estructuras')]}); }});
  assert.equal(requests, 1);
  assert.match(out.reply, /Falta el suelo/);
});

test('a batch completes all tool outputs before automatic checks are sent back to OpenAI', async () => {
  const replies = [{tool_calls: [call('plano_estructuras'), call('estado_proyecto')]}, {content: 'Controles realizados.'}];
  let requests = 0;
  let sent;
  await runAgent({text: 'Genera y comprueba el estado', context: {memoria: {}}, skills: [
    skill('plano_estructuras', async () => ({ok: true, terminal: true, mensaje: 'Dibujo creado.'})),
    skill('estado_proyecto', async () => ({ok: true, mensaje: 'Estado leído.'})),
    skill('revisar_laminas', async () => ({ok: true, mensaje: 'Revisado.'})),
  ], fetchImpl: async (_u, init) => {
    if (++requests === 2) {
      sent = JSON.parse(init.body).messages;
    }
    return response(replies.shift());
  }});
  assert.equal(requests, 2);
  const first = sent.findIndex((m) => m.tool_calls?.length === 2);
  assert.deepEqual(sent.slice(first + 1, first + 3).map((m) => m.role), ['tool', 'tool']);
  assert.deepEqual(sent.slice(first + 1, first + 3).map((m) => m.tool_call_id), ['plano_estructuras', 'estado_proyecto']);
});

test('an unsupported detail is investigated with OpenAI and references without enabling CAD writes', async () => {
  let requests = 0, reads = 0, writes = 0;
  const bodies = [];
  const replies = [{tool_calls: [call('proponer_estructura')]}, {content: 'Hace falta un detalle verificado.'}];
  const out = await runAgent({text: 'Agrega barras superiores con longitudes', context: {memoria: {}}, skills: [
    skill('proponer_estructura', async () => { reads++; return {ok: true, mensaje: 'Consulté las referencias del módulo abierto.'}; }),
    skill('plano_estructuras', async () => { writes++; return {ok: true}; }),
  ], fetchImpl: async (_u, init) => { requests++; bodies.push(JSON.parse(init.body)); return response(replies.shift()); }});
  assert.equal(requests, 2);
  assert.equal(reads, 1);
  assert.equal(writes, 0);
  assert.deepEqual(bodies[0].tools.map((t) => t.function.name), ['proponer_estructura']);
  assert.match(out.reply, /no implementa/);
  assert.match(out.reply, /referencias del módulo/);
});

test('a failed verification preserves the actual drawing result and reports an incomplete delivery', async () => {
  const out = await runAgent({text: 'Crea las láminas', context: {memoria: {}}, skills: [
    skill('plano_estructuras', async () => ({ok: true, terminal: true, mensaje: 'Dibujé las láminas.'})),
    skill('revisar_laminas', async () => { throw new Error('No pude leer un texto.'); }),
  ], fetchImpl: async () => response({tool_calls: [call('plano_estructuras')]})});
  assert.match(out.reply, /Dibujé las láminas/);
  assert.match(out.reply, /comprobación quedó pendiente/);
  assert.doesNotMatch(out.reply, /No se cambió el plano/);
});
