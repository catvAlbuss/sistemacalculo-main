// El agente no es un menú de comandos: con el motor de IA del servidor, después de cada acción
// analiza los hechos (riesgos y siguiente paso) y lo que razona se muestra, separado de los hechos.
import test from 'node:test';
import assert from 'node:assert/strict';
import {runAgent, analizarResultado, AGENTE_SERVIDOR} from '../../resources/js/ingenieria/agente/agentRunner.js';

const respuesta = (message) => ({ok: true, json: async () => ({choices: [{message}], usage: {prompt_tokens: 10, completion_tokens: 5}})});
const skillEstado = {name: 'estado_proyecto', description: 'estado', parameters: {type: 'object', properties: {}}, run: async () => ({ok: true, mensaje: 'Leí 8 columnas. Falta la zona sísmica.'})};
const skillPlano = {name: 'plano_estructuras', description: 'plano', parameters: {type: 'object', properties: {}}, run: async () => ({ok: true, mensaje: 'Listo: láminas E-01 y E-02.', avisos: ['Sin estudio de suelos: usé Hz 0.70']})};

test('with the server engine, a direct action ends with an engineer analysis from the model', async () => {
  const pedidos = [];
  const fetchImpl = async (_u, init) => { pedidos.push(JSON.parse(init.body)); return respuesta({role: 'assistant', content: 'Revisa la zona: falta. Siguiente: pide el distrito.'}); };
  const out = await runAgent({text: '¿en qué vamos?', settings: {...AGENTE_SERVIDOR, rutaDirecta: true, analizarResultados: true}, context: {memoria: {}}, skills: [skillEstado], fetchImpl});
  assert.equal(out.directa, true);
  assert.equal(pedidos.length, 1, 'one short analysis call');
  assert.equal(pedidos[0].tools, undefined, 'the analysis call has no tools');
  assert.match(out.reply, /Leí 8 columnas/);
  assert.match(out.reply, /Análisis: Revisa la zona/);
});

test('without analysis enabled (or local engine) direct actions spend no tokens', async () => {
  let llamadas = 0;
  const fetchImpl = async () => { llamadas++; return respuesta({role: 'assistant', content: 'x'}); };
  const out = await runAgent({text: '¿en qué vamos?', settings: {...AGENTE_SERVIDOR, rutaDirecta: true}, context: {memoria: {}}, skills: [skillEstado], fetchImpl});
  assert.equal(llamadas, 0);
  assert.doesNotMatch(out.reply, /Análisis/);
  assert.equal(await analizarResultado({text: 'x', steps: [{tool: 'estado_proyecto', result: {ok: true}}], settings: {baseUrl: 'http://127.0.0.1:11434/v1', model: 'qwen3-cad', analizarResultados: true}}), null);
});

test('after creating sheets the model reasons internally and the client receives tool evidence', async () => {
  let ronda = 0;
  const fetchImpl = async () => {
    ronda++;
    if (ronda === 1) return respuesta({role: 'assistant', content: '', tool_calls: [{id: 'c1', type: 'function', function: {name: 'plano_estructuras', arguments: '{}'}}]});
    return respuesta({role: 'assistant', content: 'Las láminas usan Hz por defecto: confirma el EMS antes de entregarlas.'});
  };
  const out = await runAgent({text: 'estructura este módulo y dime qué riesgos ves', settings: {...AGENTE_SERVIDOR, rutaDirecta: false}, context: {memoria: {}}, skills: [skillPlano], fetchImpl});
  assert.match(out.reply, /Listo: láminas E-01 y E-02/, 'facts from the tool');
  assert.doesNotMatch(out.reply, /Análisis:/, 'the internal analysis drives actions without becoming an unsupported delivery claim');
  assert.equal(ronda, 2, 'the motor still receives and analyses the executed result');
});
