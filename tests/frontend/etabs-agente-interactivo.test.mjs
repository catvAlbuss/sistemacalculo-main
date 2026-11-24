// El agente es interactivo: el modelo recibe el estado de la sesión en cada turno, puede
// preguntar con opciones (botones) y registra las decisiones del ingeniero.
import test from 'node:test';
import assert from 'node:assert/strict';
import {runAgent, rutaDirecta, SYSTEM_PROMPT} from '../../resources/js/ingenieria/agente/agentRunner.js';
import {estadoDeSesion, siguientePaso, resumenDelAprendizaje} from '../../resources/js/ingenieria/agente/estadoAgente.js';
import {INTERACCION_SKILLS} from '../../resources/js/ingenieria/agente/skills/interaccion.js';
import {SKILLS} from '../../resources/js/ingenieria/agente/skills/index.js';
import {CASOS} from '../../resources/js/ingenieria/aprendizaje/casosAprendidos.js';

const respuesta = (message) => ({ok: true, json: async () => ({choices: [{message}], usage: {prompt_tokens: 10, completion_tokens: 5}})});

test('the model receives the session state on every request, after the fixed prompt (cache-friendly)', async () => {
  const enviados = [];
  const fetchImpl = async (_url, init) => { enviados.push(JSON.parse(init.body)); return respuesta({role: 'assistant', content: 'Hola'}); };
  const context = {memoria: {consultas: {respondidas: false, consultas: [{clave: 'cimentacion', pregunta: '¿Qué cimentación uso?', opciones: [{valor: 'platea'}, {valor: 'zapatas'}], recomendado: 'platea'}]}}};
  await runAgent({text: 'hola, ayúdame con esto', settings: {baseUrl: 'http://x/v1', model: 'gpt-4.1-mini', memoria: 'corta'}, context, fetchImpl});
  const [sistema, estado] = enviados[0].messages;
  assert.equal(sistema.role, 'system');
  assert.match(sistema.content, /preguntar_ingeniero/);
  assert.equal(estado.role, 'system');
  assert.match(estado.content, /Estado actual/);
  assert.match(estado.content, /Pendiente del ingeniero: \[cimentacion\]/);
  assert.match(estado.content, /Siguiente paso sugerido: esperar la decisión del ingeniero/);
});

test('the state follows the workflow and never carries the plan file name', () => {
  assert.match(siguientePaso({}), /leer la arquitectura/);
  assert.match(siguientePaso({estructura: {}}), /dibujar las láminas/);
  assert.match(siguientePaso({estructura: {}, modeloEstructural: {}}), /metrado/);
  const texto = estadoDeSesion({resumenPlano: () => '2 vista(s) con ejes, 18 columnas leídas', memoria: {estructura: {titulo: 'PLANTA', columnas: [1, 2, 3], ejesNombrados: {x: [1, 2], y: [1, 2, 3]}}, decisionesSesion: [{clave: 'cimentacion', valor: 'zapatas', porque: 'suelo bueno'}]}});
  assert.match(texto, /Plano abierto: 2 vista\(s\)/);
  assert.match(texto, /5 ejes, 3 columnas/);
  assert.match(texto, /cimentacion=zapatas \(suelo bueno\)/);
});

test('preguntar_ingeniero returns the options as buttons and remembers the open question', async () => {
  const skill = INTERACCION_SKILLS.find((s) => s.name === 'preguntar_ingeniero');
  const ctx = {memoria: {}};
  const r = await skill.run({pregunta: '¿El techo lleva losa?', opciones: ['Sí, losa aligerada', 'No, solo cobertura'], recomendada: 'sí, losa aligerada', porque: 'tiene cisterna'}, ctx);
  assert.equal(r.ok, true);
  assert.deepEqual(r.opciones.map((o) => o.recomendada), [true, false]);
  assert.match(r.mensaje, /Recomiendo: Sí, losa aligerada — tiene cisterna/);
  assert.equal(ctx.memoria.preguntaAbierta.opciones.length, 2);
  assert.match(estadoDeSesion(ctx), /Le preguntaste: "¿El techo lleva losa\?"/);
  assert.equal((await skill.run({pregunta: 'x', opciones: ['solo una']}, ctx)).ok, false);
});

test('"¿en qué vamos?" answers from the state without spending tokens', () => {
  assert.deepEqual(rutaDirecta('¿En qué vamos?'), {tool: 'estado_proyecto', args: {}});
  assert.ok(SKILLS.some((s) => s.name === 'estado_proyecto') && SKILLS.some((s) => s.name === 'preguntar_ingeniero'));
});

test('the memory summarizes what was learned, without client names', () => {
  const texto = resumenDelAprendizaje(CASOS);
  assert.match(texto, /Lo que aprendí de los proyectos estudiados/);
  assert.doesNotMatch(texto, /vinchos|ilo\b/i);
  assert.match(SYSTEM_PROMPT, /Estado actual/);
});

// Construcción guiada con un plano real (si están los planos de entrenamiento en esta máquina):
// pregunta por etapas antes de dibujar y termina con las láminas.
test('guided construction asks stage by stage before drawing, then draws', {timeout: 600000}, async (t) => {
  const {existsSync, readFileSync} = await import('node:fs');
  const {join} = await import('node:path');
  const {spawnSync} = await import('node:child_process');
  const {PLANOS} = await import('../../scripts/agente/planos.mjs');
  const pares = join(PLANOS, 'estructuras', 'pares.json');
  if (!existsSync(pares) || !JSON.parse(readFileSync(pares, 'utf8')).vinchos) return t.skip('sin los planos de entrenamiento');
  const r = spawnSync(process.execPath, ['scripts/agente/probar-construccion.mjs', 'vinchos', 'modulo-08'], {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, env: {...process.env, NODE_OPTIONS: '--max-old-space-size=8000'}});
  const out = r.stdout ?? '';
  assert.match(out, /Paso 1\/4 · Lectura/);
  // La cimentación se pregunta si es dudosa o se decide con proyectos parecidos (y se dice), antes de dibujar.
  const cim = out.search(/¿Qué cimentación uso\?|Cimentación: (platea|zapatas)/);
  assert.ok(cim >= 0 && cim < out.indexOf('Paso 4/4 · Dibujo'), 'decides or asks the foundation before drawing');
  assert.match(out, /Listo: láminas E-01/);
});

test('guided construction is routed without tokens and its buttons run the tool directly', () => {
  assert.deepEqual(rutaDirecta('Construye la estructura paso a paso'), {tool: 'construir_estructura', args: {accion: 'iniciar'}});
  assert.equal(rutaDirecta('dibuja una casa paso a paso'), null);
  assert.ok(SKILLS.some((s) => s.name === 'construir_estructura'));
  const k = {pendiente: {clave: 'cimentacion', pregunta: '¿Qué cimentación uso?', opciones: [{valor: 'platea'}, {valor: 'zapatas'}]}};
  assert.match(estadoDeSesion({memoria: {construccion: k}}), /Construcción guiada en curso, pregunta pendiente \[cimentacion\]/);
  assert.match(siguientePaso({construccion: k}), /construir_estructura accion=responder/);
});
