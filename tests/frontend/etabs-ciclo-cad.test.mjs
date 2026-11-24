import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {join, basename} from 'node:path';
import {PLANOS} from '../../scripts/agente/planos.mjs';
import {paresDelManifiesto} from '../../scripts/agente/pares-entrenamiento.mjs';

test('module VIII runs generation and automatic verification on a real CAD database before model completion', async (t) => {
  const manifest = join(PLANOS, 'estructuras', 'pares.json');
  if (!existsSync(manifest)) return t.skip('sin CAD local');
  const pair = paresDelManifiesto(join(PLANOS, 'estructuras'), JSON.parse(readFileSync(manifest)), existsSync)
    .find((p) => p.grupo === 'vinchos' && p.id === 'modulo-08');
  if (!pair) return t.skip('sin arquitectura del módulo VIII');
  const dm = await import('@mlightcad/data-model');
  const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
  dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
  const {createDrawingContext} = await import('../../resources/js/ingenieria/cad/drawingContext.js');
  const {runAgent} = await import('../../resources/js/ingenieria/agente/agentRunner.js');
  const db = new dm.AcDbDatabase();
  const bytes = readFileSync(pair.rutaArquitectura);
  await db.read(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), {readOnly: true}, dm.AcDbFileType.DWG);
  const data = {hz: .7, df: 2, zona: 3, suelo: 'S2', categoria: 'A2', niveles: 1, proyecto: 'Prueba', entidad: 'Prueba', especialista: 'Prueba', cip: 'Prueba'};
  const ctx = createDrawingContext({getDatabase: () => db, dm, getProjectData: () => data,
    loadTemplate: async () => ({db: null, config: {modo: 'adaptativa', escalaPlanos: 2}})});
  ctx.nombreDocumento = () => `vinchos ${basename(pair.rutaArquitectura)}`;
  ctx.eventosDeUso = async () => [];
  ctx.registrarAprendizaje = async () => ({ok: true});
  ctx.pedirDatos = async ({consultas}) => ({...data, decisiones: Object.fromEntries(consultas.map((q) => [q.clave, q.recomendado ?? q.opciones[0].valor]))});
  const requests = [];
  const out = await runAgent({text: 'Genera las láminas del módulo VIII y comprueba el resultado', context: ctx,
    fetchImpl: async (_url, init) => {
      requests.push(JSON.parse(init.body));
      return {ok: true, json: async () => ({choices: [{message: requests.length === 1
        ? {tool_calls: [{id: 'crear', type: 'function', function: {name: 'plano_estructuras', arguments: '{}'}}]}
        : {content: 'La comprobación de presentación no valida el cálculo estructural.'}}]})};
    }});
  assert.equal(requests.length, 2);
  assert.deepEqual(out.steps.map((s) => s.tool), ['plano_estructuras', 'revisar_laminas']);
  assert.ok(out.steps.every((s) => s.result.ok), out.reply);
  assert.equal(out.steps[1].automatica, true);
  assert.equal(out.steps[1].result.validacionEstructural, false);
  assert.ok(ctx.entidadesDelAgente().length > 100);
  assert.ok(ctx.memoria.paqueteLaminas.cantidad > 0);
  assert.ok(requests[1].messages.some((m) => m.role === 'tool' && String(m.content).includes('validacionEstructural')));
});
