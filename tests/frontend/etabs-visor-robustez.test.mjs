// Capa de robustez del visor y apertura por peso del plano (chico / mediano / grande).
import test from 'node:test';
import assert from 'node:assert/strict';
import {blindarPrototipoVista, vistaLista, perfilPorPeso, opcionesPorPeso, instalarAperturaPorPeso} from '../../resources/js/etabs/visor/robustezVisor.js';

// Vista simulada con la forma de AcTrView2d: activeLayoutView no existe mientras carga.
class VistaFalsa {
  constructor() { this.capa = null; this.llamadas = []; this._centro = null; }
  get activeLayoutView() { return this.capa; }
  pick() { return this.activeLayoutView.pointToBox(); } // falla si no hay capa, como el visor
  zoomTo(caja, f) { this.activeLayoutView.zoomTo(caja, f); this.llamadas.push(['zoomTo', caja]); }
  flyTo(caja) { this.activeLayoutView.flyTo(caja); this.llamadas.push(['flyTo', caja]); }
  get center() { return this._centro; }
  set center(v) { this.activeLayoutView.center = v; this._centro = v; }
}
const capaLista = () => ({pointToBox: () => 'caja', zoomTo() {}, flyTo() {}, center: null});

test('while a heavy drawing loads, mouse moves and zoom requests no longer crash the viewer', () => {
  const programados = [];
  assert.equal(blindarPrototipoVista(VistaFalsa.prototype, {programar: (f) => programados.push(f), ahora: () => 0}), true);
  assert.equal(blindarPrototipoVista(VistaFalsa.prototype), false, 'installed once');
  const v = new VistaFalsa();
  assert.equal(vistaLista(v), false);
  // Sin capa: "pointToBox" y "zoomTo" de undefined ya no se lanzan.
  assert.deepEqual(v.pick(), []);
  v.zoomTo('A', 1.1);
  v.zoomTo('B', 1.1); // dos encuadres durante la carga: vale el último
  v.center = {x: 1, y: 2};
  assert.deepEqual(v.llamadas, []);
  // La vista queda lista: se aplica el encuadre pendiente (solo el último) y el centro.
  v.capa = capaLista();
  while (programados.length) programados.shift()();
  assert.deepEqual(v.llamadas, [['zoomTo', 'B']]);
  assert.deepEqual(v.center, {x: 1, y: 2});
  assert.equal(v.pick(), 'caja', 'normal behavior once ready');
});

test('opening options by drawing weight: small as is, medium and large drawn in batches', () => {
  const MB = 1048576;
  assert.equal(perfilPorPeso(1.6 * MB), 'chico');
  assert.equal(perfilPorPeso(22 * MB), 'mediano');
  assert.equal(perfilPorPeso(68 * MB), 'grande');
  assert.deepEqual(opcionesPorPeso(1.6 * MB, {mode: 8}).opciones, {mode: 8});
  const mediano = opcionesPorPeso(22 * MB, {progressiveRendering: false});
  assert.equal(mediano.opciones.progressiveRendering, false, 'medium: what the caller asked wins');
  const grande = opcionesPorPeso(68 * MB, {progressiveRendering: false, mode: 8});
  assert.equal(grande.opciones.progressiveRendering, true, 'large: performance options win');
  assert.equal(grande.opciones.mode, 8);
  assert.ok(grande.opciones.timeout >= 600000 && grande.opciones.minimumChunkSize < 1000);
  assert.equal(grande.mb, 68);
});

test('every open (file content or URL) goes through the weight profile and tells the app', async () => {
  const recibidas = [], avisos = [];
  class Gestor {
    async openDocument(nombre, contenido, opciones) { recibidas.push(['doc', nombre, opciones]); return true; }
    async openUrl(url, opciones) { recibidas.push(['url', url, opciones]); return true; }
  }
  assert.equal(instalarAperturaPorPeso(Gestor, (i) => avisos.push(i), async () => 40 * 1048576), true);
  const g = new Gestor();
  await g.openDocument('chico.dwg', new ArrayBuffer(1024), {mode: 8});
  await g.openUrl('https://x/planos/UNIA.dwg?v=1', {});
  assert.deepEqual(recibidas[0], ['doc', 'chico.dwg', {mode: 8}]);
  assert.equal(recibidas[1][2].progressiveRendering, true);
  assert.deepEqual(avisos.map((a) => [a.nombre, a.perfil]), [['chico.dwg', 'chico'], ['UNIA.dwg', 'grande']]);
});
