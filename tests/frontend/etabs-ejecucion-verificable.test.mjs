import test from 'node:test';
import assert from 'node:assert/strict';
import {runAgent} from '../../resources/js/ingenieria/agente/agentRunner.js';

const answer = (message) => ({ok: true, json: async () => ({choices: [{message}]})});
const call = (name, id = 'a') => ({id, type: 'function', function: {name, arguments: '{}'}});

test('a summary tool cannot become a false confirmation of drawings or engineering decisions', async () => {
  let requests = 0;
  const replies = [{tool_calls: [call('estado_proyecto')]}, {content: 'He agregado las barras superiores con longitudes. Hz 0.70 m confirmado por el ingeniero.'}];
  const out = await runAgent({text: 'Revisa lo que hiciste', context: {memoria: {}}, skills: [{name: 'estado_proyecto', parameters: {type: 'object', properties: {}}, run: async () => ({ok: true, mensaje: 'Hz propuesto, pendiente de confirmacion.'})}], fetchImpl: async () => { requests++; return answer(replies.shift()); }});
  assert.match(out.reply, /pendiente de confirmacion/);
  assert.doesNotMatch(out.reply, /He agregado|confirmado por el ingeniero/);
});

test('unsupported bar-length detailing does not spend tokens or mutate the drawing', async () => {
  let requests = 0, writes = 0;
  const out = await runAgent({text: 'Agrega aceros y barras superiores mediante longitudes', context: {memoria: {}}, skills: [{name: 'plano_estructuras', parameters: {type: 'object', properties: {}}, run: async () => { writes++; return {ok: true, mensaje: 'Generado'}; }}], fetchImpl: async () => { requests++; return answer({tool_calls: [call('plano_estructuras')]}); }});
  assert.equal(requests, 0);
  assert.equal(writes, 0);
  assert.match(out.reply, /no implementa|no dispone/i);
});

test('confirming an unsupported request remains explicit, without trapping unrelated requests', async () => {
  const context = {memoria: {}};
  const fetchImpl = async () => { throw new Error('no llamar al modelo para una capacidad ausente'); };
  await runAgent({text: 'Agrega barras superiores con longitudes', context, fetchImpl});
  const confirmacion = await runAgent({text: 'si, necesito ello', context, fetchImpl});
  assert.match(confirmacion.reply, /no implementa/);
  const independiente = await runAgent({text: 'Que datos faltan del proyecto', context, fetchImpl: async () => answer({content: 'Necesito los datos del proyecto.'})});
  assert.doesNotMatch(independiente.reply, /no implementa/);
  assert.equal(context.memoria.pedidoNoImplementado, undefined);
});

test('explicit deletion is preserved and a terminal result avoids a final paid narration', async () => {
  let requests = 0, deletes = 0;
  const out = await runAgent({text: 'Borra las láminas', context: {memoria: {}}, settings: {baseUrl: '/llm', rutaDirecta: false},
    skills: [{name: 'quitar_laminas', parameters: {type: 'object', properties: {}}, run: async () => { deletes++; return {ok: true, terminal: true, mensaje: 'Quité las láminas.'}; }}],
    fetchImpl: async () => { requests++; return answer({tool_calls: [call('quitar_laminas')]}); }});
  assert.equal(deletes, 1);
  assert.equal(requests, 1);
  assert.equal(out.reply, 'Quité las láminas.');
});

test('rehacer does not authorize a separate delete before validating generation', async () => {
  let deletes = 0, draws = 0;
  const replies = [{tool_calls: [call('quitar_laminas'), call('plano_estructuras', 'b')]}, {content: 'He agregado detalles nuevos.'}];
  const out = await runAgent({text: 'Si, rehazlo', context: {memoria: {}}, skills: [
    {name: 'quitar_laminas', parameters: {type: 'object', properties: {}}, run: async () => { deletes++; return {ok: true, mensaje: 'Borrado'}; }},
    {name: 'plano_estructuras', parameters: {type: 'object', properties: {}}, run: async () => { draws++; return {ok: true, mensaje: 'No hubo cambios en las entradas.', sinCambios: true, terminal: true}; }},
  ], fetchImpl: async () => answer(replies.shift())});
  assert.equal(deletes, 0);
  assert.equal(draws, 1);
  assert.doesNotMatch(out.reply, /He agregado/);
});

test('technical validation preserves sheets; repeated valid generation preserves entities and records real sections', async (t) => {
  const {PLANOS} = await import('../../scripts/agente/planos.mjs');
  const {join} = await import('node:path');
  const {readFileSync, existsSync} = await import('node:fs');
  const manifest = join(PLANOS, 'estructuras', 'pares.json');
  if (!existsSync(manifest)) return t.skip('sin inventarios CAD locales');
  const {paresDelManifiesto} = await import('../../scripts/agente/pares-entrenamiento.mjs');
  const {leerCache} = await import('../../scripts/agente/volcar-planos.mjs');
  const {detectarVistas} = await import('../../resources/js/ingenieria/lectura/lectorPlano.js');
  const {SKILLS} = await import('../../resources/js/ingenieria/agente/skills/index.js');
  const pair = paresDelManifiesto(join(PLANOS, 'estructuras'), JSON.parse(readFileSync(manifest)), existsSync).find((p) => p.grupo === 'vinchos' && p.id === 'modulo-14');
  const cache = pair && leerCache(pair.rutaArquitectura);
  if (!cache) return t.skip('sin arquitectura del módulo XIV');
  const vistas = detectarVistas(cache.items);
  let datos = {}, deletes = 0, draws = 0, form = 0, primitives = [];
  const generations = {};
  let clave;
  const ctx = {memoria: {formularioConfirmado: true}, nombreDocumento: () => 'VINCHOS MODULO XIV.dwg',
    readPlan: () => ({items: cache.items, itemsArquitectura: cache.items, vistas}),
    datosProyecto: () => datos, guardarDatosProyecto: (d) => Object.assign(datos, d),
    eventosDeUso: async () => [], registrarAprendizaje: async () => ({ok: true}),
    pedirDatos: async (pedido) => { form++; return {decisiones: Object.fromEntries(pedido.consultas.map((q) => [q.clave, q.opciones[0].valor]))}; },
    loadTemplate: async () => ({db: null, config: {modo: 'adaptativa', escalaPlanos: 2}}),
    generaciones: () => generations,
    borrarGeneracion: (k) => { deletes++; delete generations[k]; return 10; },
    iniciarGeneracion: (k) => { clave = k; }, cerrarGeneracion: () => {},
    draw: (p) => { draws++; primitives = p; generations[clave] = p.length; },
  };
  const skill = SKILLS.find((s) => s.name === 'plano_estructuras');
  const incomplete = await skill.run({}, ctx);
  assert.equal(incomplete.ok, false);
  assert.match(incomplete.error, /zona.*suelo.*categoria/);
  assert.equal(form, 1, 'previous form confirmation cannot hide missing technical inputs');
  assert.equal(deletes, 0);
  assert.equal(draws, 0);
  ctx.pedirDatos = async (pedido) => { form++; return {hz: .7, df: 2, zona: 3, suelo: 'S2', categoria: 'A2', decisiones: Object.fromEntries(pedido.consultas.map((q) => [q.clave, q.opciones[0].valor]))}; };
  assert.equal((await skill.run({}, ctx)).ok, true);
  assert.equal(draws, 1);
  const sections = ctx.memoria.paqueteLaminas.secciones;
  assert.ok(sections.some((s) => s.tipo === 'notas' && s.entidades > 0 && /^E-/.test(s.lamina)));
  assert.ok(primitives.some((p) => p.type === 'text' && /RESUMEN DE PAR/.test(p.value)));
  assert.ok(sections.some((s) => s.tipo === 'cuadroColumnas' && s.entidades > 0));
  const repeated = await skill.run({}, ctx);
  assert.equal(repeated.sinCambios, true);
  assert.equal(draws, 1);
  assert.equal(deletes, 1);
  assert.equal(form, 2, 'complete unchanged data must not reopen the form');
  ctx.memoria.metrado = {partidas: ['cantidades anteriores']};
  datos.hz = .8;
  assert.equal((await skill.run({}, ctx)).ok, true);
  assert.equal(draws, 2, 'changed dimensions must regenerate');
  assert.equal(deletes, 2);
  assert.equal(ctx.memoria.metrado, undefined, 'new dimensions invalidate previously calculated quantities');
});
