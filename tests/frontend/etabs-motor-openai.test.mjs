import test from 'node:test';
import assert from 'node:assert/strict';
import {AGENTE_SERVIDOR, runAgent} from '../../resources/js/ingenieria/agente/agentRunner.js';

const llamada = (name, id) => ({role: 'assistant', content: '', tool_calls: [{id, type: 'function', function: {name, arguments: '{}'}}]});
const respuesta = (message) => ({ok: true, json: async () => ({choices: [{message}], usage: {prompt_tokens: 10, completion_tokens: 5}})});

test('server chat uses its model and learned memory, then continues from review to correction and analysis', async () => {
  const bodies = [], executed = [];
  const skills = ['revisar_laminas', 'corregir_estructura'].map((name) => ({name, description: name, parameters: {type: 'object', properties: {}}, run: async () => { executed.push(name); return {ok: true, mensaje: name === 'revisar_laminas' ? 'Faltan detalles de dibujo.' : 'Correccion registrada.'}; }}));
  const replies = [llamada('revisar_laminas', 'a'), llamada('corregir_estructura', 'b'), {role: 'assistant', content: 'Compara el detalle con la referencia y confirma las medidas que no se leen.'}];
  const out = await runAgent({text: 'Revisa las láminas', skills, context: {memoria: {}}, fetchImpl: async (url, init) => { bodies.push(JSON.parse(init.body)); return respuesta(replies.shift()); }});
  assert.equal(bodies.length, 3);
  assert.deepEqual(executed, ['revisar_laminas', 'corregir_estructura']);
  assert.match(bodies[0].messages[0].content, /Memoria del Agente NovaCad/);
  assert.match(bodies[0].messages[0].content, /Lo que aprendí de los proyectos estudiados/);
  assert.match(out.reply, /Correccion registrada/);
  // La recomendación del modelo se muestra como análisis, después de los hechos de las herramientas
  // (pedido del usuario: que el agente razone a la vista); las afirmaciones de acciones no hechas se filtran.
  assert.match(out.reply, /Correccion registrada\.[\s\S]*Análisis: Compara el detalle/);
  assert.equal(out.usage.prompt, 30);
});

test('the follow-up sends the previous screenshot to the vision model', async () => {
  const image = 'data:image/png;base64,aW1hZ2Vu';
  let body;
  await runAgent({text: 'Revisalo, necesito la solucion urgente', settings: {...AGENTE_SERVIDOR, vision: true}, history: [{role: 'user', content: 'Asi debe salir', imagenes: [image]}, {role: 'assistant', content: 'No pude conectar.'}], context: {memoria: {}}, fetchImpl: async (url, init) => { body = JSON.parse(init.body); return respuesta({role: 'assistant', content: 'Necesito un acercamiento de la referencia.'}); }});
  const previous = body.messages.find((m) => m.role === 'user');
  assert.ok(Array.isArray(previous.content));
  assert.equal(previous.content.find((p) => p.type === 'image_url').image_url.url, image);
  assert.equal(body.messages.at(-1).content, 'Revisalo, necesito la solucion urgente');
});

test('a pending engineering decision stops execution without answering for the user', async () => {
  let requests = 0;
  const out = await runAgent({text: 'Ayudame con este plano', skills: [{name: 'preguntar_ingeniero', parameters: {type: 'object', properties: {}}, run: async () => ({ok: true, mensaje: 'Confirma la cimentacion.', opciones: [{texto: 'Platea'}]})}], context: {memoria: {}}, fetchImpl: async () => { requests++; return respuesta(llamada('preguntar_ingeniero', 'a')); }});
  assert.equal(requests, 1);
  assert.match(out.reply, /Confirma la cimentacion/);
});

test('a model cannot draw in the same batch after asking the engineer to decide', async () => {
  const executed = [];
  const skills = [
    {name: 'preguntar_ingeniero', parameters: {type: 'object', properties: {}}, run: async () => { executed.push('pregunta'); return {ok: true, mensaje: 'Confirma la cimentacion.', opciones: [{texto: 'Platea'}]}; }},
    {name: 'plano_estructuras', parameters: {type: 'object', properties: {}}, run: async () => { executed.push('dibujo'); return {ok: true, mensaje: 'Laminas dibujadas.'}; }},
  ];
  const message = llamada('preguntar_ingeniero', 'a');
  message.tool_calls.push(...llamada('plano_estructuras', 'b').tool_calls);
  await runAgent({text: 'Ayudame con este plano', skills, context: {memoria: {}}, fetchImpl: async () => respuesta(message)});
  assert.deepEqual(executed, ['pregunta']);
});

test('only the latest image-bearing turn is retained and obsolete photos are omitted', async () => {
  const old = 'data:image/png;base64,b2xk', recent = 'data:image/png;base64,bmV3';
  let body;
  await runAgent({text: 'Compara esa referencia', settings: {...AGENTE_SERVIDOR, vision: true}, history: [{role: 'user', content: 'Imagen antigua', imagenes: [old]}, {role: 'assistant', content: 'Recibida'}, {role: 'user', content: 'Referencia actual', imagenes: [recent]}], fetchImpl: async (url, init) => { body = JSON.parse(init.body); return respuesta({role: 'assistant', content: 'Necesito una medida legible.'}); }});
  assert.ok(!JSON.stringify(body).includes(old));
  assert.ok(JSON.stringify(body).includes(recent));
});

test('the latest reference remains available after it leaves the short text history', async () => {
  const image = 'data:image/png;base64,cmVmZXJlbmNl';
  const history = [{role: 'user', content: 'Referencia a comparar', imagenes: [image]}, ...Array.from({length: 10}, (_, i) => ({role: i % 2 ? 'assistant' : 'user', content: 'Turno ' + i}))];
  let body;
  await runAgent({text: 'Sigue usando esa captura', history, settings: {...AGENTE_SERVIDOR, vision: true}, fetchImpl: async (url, init) => { body = JSON.parse(init.body); return respuesta({role: 'assistant', content: 'Necesito confirmar las medidas.'}); }});
  assert.ok(JSON.stringify(body).includes(image));
  assert.ok(body.messages.length < history.length);
});

test('a failure during final analysis retains the tools that already succeeded', async () => {
  let requests = 0;
  const skills = [{name: 'revisar_laminas', parameters: {type: 'object', properties: {}}, run: async () => ({ok: true, mensaje: 'Hay dos textos encimados.'})}];
  const out = await runAgent({text: 'Revisa las láminas', skills, fetchImpl: async () => ++requests === 1 ? respuesta(llamada('revisar_laminas', 'a')) : {ok: false, status: 502, text: async () => JSON.stringify({error: {message: 'El motor no respondio.'}})}});
  assert.equal(out.steps.length, 1);
  assert.match(out.reply, /Hay dos textos encimados/);
  assert.match(out.reply, /El motor no respondio/);
});
