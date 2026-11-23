import test from 'node:test';
import assert from 'node:assert/strict';
import {crearRevisionDePlano} from '../../resources/js/etabs/agente/revisionesPlano.js';

const plano = (nombre = 'Arquitectura.dwg') => ({fileName: nombre, database: {}});
const pendiente = () => { let resolve; const promise = new Promise((r) => { resolve = r; }); return {promise, resolve}; };
const evento = {evento_id: 'a', clave: 'cimentacion', valor: 'platea'};

test('no file, including the SDK initial Untitled document, never loads reviews', async () => {
  let llamadas = 0;
  const estado = {};
  const cola = crearRevisionDePlano({estado, cargar: async () => { llamadas++; return {ok: true, eventos: [evento]}; }});
  await cola.activar(null);
  await cola.cargarPendientes();
  await cola.activar({docTitle: 'Untitled', fileName: '', database: {}});
  assert.equal(llamadas, 0);
  assert.equal(estado.activa, false);
  assert.deepEqual(estado.eventos, []);
});

test('opening a file loads reviews once; re-reading the same document does not reload', async () => {
  let llamadas = 0;
  const estado = {};
  const cola = crearRevisionDePlano({estado, cargar: async () => { llamadas++; return {ok: true, eventos: [evento]}; }});
  const doc = plano();
  await cola.activar(doc);
  await cola.activar(doc);
  assert.equal(llamadas, 1);
  assert.equal(estado.activa, true);
  assert.deepEqual(estado.eventos, [evento]);
});

test('closing a file clears reviews and ignores its late response', async () => {
  const request = pendiente(), estado = {};
  const cola = crearRevisionDePlano({estado, cargar: () => request.promise});
  const carga = cola.activar(plano());
  assert.equal(estado.cargando, true);
  await cola.activar(null);
  request.resolve({ok: true, eventos: [evento]});
  await carga;
  assert.equal(estado.activa, false);
  assert.equal(estado.cargando, false);
  assert.deepEqual(estado.eventos, []);
});

test('switching documents, even with the same filename, discards older responses', async () => {
  const first = pendiente(), second = pendiente(), estado = {};
  let llamadas = 0;
  const cola = crearRevisionDePlano({estado, cargar: () => (++llamadas === 1 ? first.promise : second.promise)});
  const a = cola.activar(plano()), b = cola.activar(plano());
  second.resolve({ok: true, eventos: [{...evento, evento_id: 'b'}]}); await b;
  first.resolve({ok: true, eventos: [evento]}); await a;
  assert.deepEqual(estado.eventos.map((e) => e.evento_id), ['b']);
});

test('an approval completing after close never restores reviews or fetches again', async () => {
  const request = pendiente(), estado = {}; let llamadas = 0;
  const cola = crearRevisionDePlano({estado, cargar: async () => { llamadas++; return {ok: true, eventos: [evento]}; }, resolver: () => request.promise});
  await cola.activar(plano());
  const accion = cola.revisarEvento('a', 'aprobar');
  await cola.activar(null);
  request.resolve({ok: true}); await accion;
  assert.equal(llamadas, 1);
  assert.deepEqual(estado.eventos, []);
  assert.deepEqual(estado.revisando, {});
});

test('loading errors can retry, while denied permission leaves no reviews', async () => {
  const estado = {}; let llamadas = 0;
  const cola = crearRevisionDePlano({estado, cargar: async () => ++llamadas === 1 ? {ok: false, error: 'Sin conexion'} : {ok: true, eventos: [], sinPermiso: true}});
  await cola.activar(plano());
  assert.equal(estado.error, 'Sin conexion');
  await cola.cargarPendientes();
  assert.equal(estado.error, '');
  assert.equal(estado.sinPermiso, true);
  assert.deepEqual(estado.eventos, []);
});
