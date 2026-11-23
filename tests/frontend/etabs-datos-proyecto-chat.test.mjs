// Datos del proyecto dichos en el chat: se guardan sin IA (Hz y Df no son "correcciones"),
// la ubicación da la zona sísmica por la tabla de la E.030 y, si se contradice, se pregunta.
import test from 'node:test';
import assert from 'node:assert/strict';
import {rutaDirecta} from '../../resources/js/ingenieria/agente/agentRunner.js';
import {SKILLS} from '../../resources/js/ingenieria/agente/skills/index.js';
import {buscarUbicacion, categoriaPorUso, datosDelTexto} from '../../resources/js/ingenieria/criterios/ubicacion.js';

const MENSAJE = 'hz es de 0.6, mi df es 2.50, mi zona si esta configurado, estamos ubicados en huanuco, por la localidad de vinchos.';

function contexto(texto) {
  let datos = {};
  return {
    memoria: {ultimoPedido: texto},
    datosProyecto: () => datos,
    guardarDatosProyecto: (d) => { datos = {...datos, ...d}; },
    readPlan: () => { throw new Error('sin plano'); },
    leer: () => datos,
  };
}
const correr = async (args, ctx) => SKILLS.find((s) => s.name === 'datos_proyecto').run(args, ctx);

test('the engineer message saves Hz and Df directly (no AI, not as a correction)', async () => {
  const ruta = rutaDirecta(MENSAJE);
  assert.equal(ruta.tool, 'datos_proyecto');
  assert.deepEqual([ruta.args.hz, ruta.args.df], ['0.6', '2.50']);
  const ctx = contexto(MENSAJE);
  const r = await correr(ruta.args, ctx);
  assert.equal(r.ok, true);
  assert.equal(ctx.leer().hz, '0.6');
  assert.equal(ctx.leer().df, '2.5');
  assert.match(r.mensaje, /Guardé Hz, Df/);
});

test('a contradictory location is not accepted: the agent asks with buttons', async () => {
  const ctx = contexto(MENSAJE);
  const r = await correr(datosDelTexto(MENSAJE), ctx);
  assert.match(r.mensaje, /no cuadra/);
  assert.equal(r.opciones.length, 2);
  assert.ok(r.opciones.every((o) => o.herramienta === 'datos_proyecto' && o.args.distrito));
  assert.equal(ctx.leer().zona, undefined, 'no zone saved until the engineer chooses');
  // Elige Vinchos de Ayacucho: zona 3 y el ubigeo del rótulo.
  const vinchos = r.opciones.find((o) => /Vinchos/.test(o.texto));
  ctx.memoria.ultimoPedido = vinchos.texto;
  const r2 = await correr(vinchos.args, ctx);
  assert.match(r2.mensaje, /zona 3/);
  assert.deepEqual([ctx.leer().zona, ctx.leer().region, ctx.leer().distrito], ['3', 'AYACUCHO', 'VINCHOS']);
});

test('an unambiguous district gives its E.030 zone; category is proposed from the building use', async () => {
  const r = await buscarUbicacion('distrito de Amarilis, Huánuco');
  assert.equal(r.unico?.zona, 2);
  assert.equal(categoriaPorUso(['AULA 01', 'AULA 02', 'SS.HH.', 'DIRECCION'])?.categoria, 'A2');
  assert.equal(categoriaPorUso(['DORMITORIO 1', 'SALA COMEDOR', 'COCINA'])?.categoria, 'C');
  assert.equal(categoriaPorUso(['PATIO']), null);
});

test('Hz or Df sent as a correction are stored as project data, not as a learning event', async () => {
  let eventos = 0;
  const ctx = {...contexto('el hz es 0.6'), registrarAprendizaje: async () => { eventos++; }};
  const r = await SKILLS.find((s) => s.name === 'corregir_estructura').run({decision: 'hz', valor: '0.6'}, ctx);
  assert.match(r.mensaje, /Datos del proyecto/);
  assert.equal(ctx.leer().hz, '0.6');
  assert.equal(eventos, 0);
});
