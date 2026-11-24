import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parse} from '@vue/compiler-sfc';
import {compile} from '@vue/compiler-dom';
import * as Vue from 'vue';
import {renderToString} from '@vue/server-renderer';

// Render the actual panel template, without invoking the CAD viewer or network.
const source = readFileSync(new URL('../../resources/js/etabs/components/AgentePredimPanel.vue', import.meta.url), 'utf8');
const {descriptor} = parse(source);
const render = new Function('Vue', compile(descriptor.template.content, {mode: 'function', prefixIdentifiers: true}).code)(Vue);
const noop = () => {};
const eventos = Array.from({length: 19}, (_, i) => ({evento_id: i, clave: 'cimentacion', valor: 'platea', propuesto: 'zapatas', rasgos: {niveles: 0, placas: false}}));
async function panel(overrides = {}) {
  const state = {
    busy: false, controller: null, estadoTono: 'ok', estadoTexto: 'Disponible', ICON: {}, runs: [],
    vistaAgente: 'asistente', revision: {activa: true, sinPermiso: false, cargando: false, error: '', eventos, revisando: {}, errores: {}},
    lectura: {estado: 'vacio'}, verLectura: false, ESTADO_LECTURA: {},
    verMenu: false, CAPACIDADES: [], adjuntos: [], draftText: '', motorListo: true,
    modal: {abierto: false}, met: {abierto: false},
    emit: noop, irAlMenu: noop, abrirDatos: noop, reset: noop, cargarPendientes: noop,
    revisarEvento: noop, ejecutar: noop, send: noop, adjuntar: noop, autoAlto: noop,
    pegar: noop, cancel: noop, ...overrides,
  };
  return renderToString(Vue.createSSRApp({render, setup: () => state}));
}

test('19 pending corrections do not appear ahead of the assistant actions', async () => {
  const html = await panel();
  assert.match(html, /Revisiones/);
  assert.match(html, /19/);
  assert.doesNotMatch(html, /Propuesta anterior|zapatas|ag-review-context/);
});

test('reviews preserve zero and false context, individual actions and request errors', async () => {
  const html = await panel({vistaAgente: 'revisiones', revision: {activa: true, eventos: eventos.slice(0, 1), revisando: {}, errores: {0: 'No se pudo guardar'}, error: '', sinPermiso: false}});
  assert.match(html, /platea/);
  assert.match(html, /zapatas/);
  assert.match(html, /<dt>niveles<\/dt><dd>0<\/dd>/);
  assert.match(html, /<dt>placas<\/dt><dd>false<\/dd>/);
  assert.match(html, /Aprobar/);
  assert.match(html, /Rechazar/);
  assert.match(html, /No se pudo guardar/);
});

test('empty reviews and loading failures provide a clear next action', async () => {
  const revision = {activa: true, eventos: [], revisando: {}, errores: {}, error: '', sinPermiso: false};
  assert.match(await panel({vistaAgente: 'revisiones', revision}), /No hay correcciones pendientes/);
  assert.match(await panel({vistaAgente: 'revisiones', revision: {...revision, error: 'Sin conexión'}}), /Sin conexión[\s\S]*Reintentar/);
});

test('users without review permission do not receive the review navigation', async () => {
  const html = await panel({revision: {activa: true, sinPermiso: true, eventos: [], error: ''}});
  assert.doesNotMatch(html.match(/<nav[\s\S]*?<\/nav>/)[0], /Revisiones/);
});

test('no open file hides the review navigation, count and old corrections', async () => {
  const html = await panel({vistaAgente: 'revisiones', revision: {activa: false, sinPermiso: false, eventos, error: ''}});
  assert.doesNotMatch(html.match(/<nav[\s\S]*?<\/nav>/)[0], /Revisiones|ag-count/);
  assert.doesNotMatch(html, /Correcciones pendientes|zapatas|ag-review-context/);
});

test('switching to reviews keeps conversation and draft mounted', async () => {
  const run = {pedido: 'Analiza este plano', respuesta: 'Estructura lista', fotos: [], pasos: [], avisos: [], opciones: [], siguientes: []};
  const html = await panel({vistaAgente: 'revisiones', runs: [run], draftText: 'Continúa con las láminas'});
  assert.match(html, /aria-label="Conversación con NovaCad" style="display:none;"/);
  assert.match(html, /Analiza este plano/);
  assert.match(html, /Estructura lista/);
  assert.match(html, /Continúa con las láminas/);
  assert.match(html, /class="ag-compose" style="display:none;"/);
});

test('collapsed plan keeps status and problem count visible without listing every view', async () => {
  const lectura = {estado: 'parcial', nombre: 'Arquitectura.dwg', problemas: [{codigo: 'ejes', texto: 'Faltan ejes'}]};
  const html = await panel({lectura, ESTADO_LECTURA: {parcial: 'Revisar'}});
  assert.match(html, /Arquitectura.dwg/);
  assert.match(html, /1 por resolver/);
  assert.match(html, /Ver detalles del plano/);
  assert.doesNotMatch(html, /ag-views/);
});

test('the client sees creating progress while internal tool activity stays collapsed', async () => {
  const run = {pedido: 'Crear módulo VIII', respuesta: '', fotos: [], pasos: [{titulo: 'Consulta interna de referencias', estado: 'ok', icono: 'chispa', seg: '1 s'}], avisos: [], opciones: [], siguientes: [], vivo: 'Creando tu proyecto…'};
  const creating = await panel({busy: true, runs: [run]});
  assert.match(creating, /role="status"/);
  assert.match(creating, /Creando tu proyecto/);
  assert.doesNotMatch(creating, /Consulta interna de referencias/);
  const done = await panel({busy: false, runs: [{...run, vivo: '', respuesta: 'Proyecto comprobado.'}]});
  assert.match(done, /<details[^>]*class="ag-activity"[^>]*>/);
  assert.doesNotMatch(done, /<details[^>]*class="ag-activity"[^>]*open/);
});
