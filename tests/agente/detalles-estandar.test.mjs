// Detalles estándar del despacho (biblioteca "estandar") y composición como la del ingeniero:
// plantas a 1/50 y los detalles llenando el hueco libre, sin abrir láminas solos.
import test from 'node:test';
import assert from 'node:assert/strict';
import {elegirEstandar, contenidoEstandar, detallesEstandar} from '../../resources/js/ingenieria/laminas/detallesEstandar.js';
import {componerPaqueteLaminas} from '../../resources/js/ingenieria/laminas/componerPaquete.js';

const linea = (x0, y0, x1, y1) => ({tipo: 'linea', capa: '.N1 Acero', puntos: [{x: x0, y: y0}, {x: x1, y: y1}]});
const pieza = (clave, {w = 1, h = 1, factor = 2, n = 10, textos = []} = {}) => ({
  tipo: 'estandar', titulo: clave.toUpperCase(),
  parametros: {clave, factor, caja: {x0: 0, y0: 0, x1: w, y1: h}},
  entidades: [...Array.from({length: n}, (_, i) => linea(0, (i * h) / n, w, (i * h) / n)), ...textos],
});

test('elige una pieza por detalle: la versión más repetida y, entre ellas, la más completa', () => {
  const r = elegirEstandar([
    pieza('estribos', {w: 1, n: 10}), pieza('estribos', {w: 1, n: 20}), pieza('estribos', {w: 3, n: 50}),
    pieza('refuerzo', {w: 2}), pieza('leyenda', {w: 100}), // la leyenda no entra en un cuarto de lámina
  ]);
  assert.deepEqual(r.map((x) => x.clave), ['refuerzo', 'estribos']);
  assert.equal(r[1].pieza.entidades.length, 20);
});

test('contenido en unidades de lámina, con el espesor de este proyecto y sin letras sueltas', () => {
  const p = pieza('isometrico', {w: 2, h: 1, factor: 5, textos: [
    {tipo: 'texto', capa: 'T', centro: {x: 1, y: 0.5}, alto: 0.05, texto: 'DETALLE ISOMETRICO DE LOSA ALIGERADA H=0.20', ancla: 1},
    {tipo: 'texto', capa: 'T', centro: {x: 50, y: 50}, alto: 0.05, texto: 'J'},
  ]});
  const c = contenidoEstandar(p, {espesor: 0.25});
  assert.deepEqual(c.marco, {x0: 0, y0: 0, x1: 10, y1: 5});
  const t = c.primitivas.filter((x) => x.type === 'text');
  assert.equal(t.length, 1);
  assert.match(t[0].value, /H=0\.25/);
  assert.equal(t[0].ancla, 1);
  assert.equal(t[0].h, 0.25);
  assert.equal(detallesEstandar([p], {}, {conLosa: false}).length, 0);
});

test('composición: plantas a 1/50 y el relleno no abre láminas', () => {
  const planta = (id, tipo, w, h) => ({id, tipo, titulado: true, contenido: {titulo: id.toUpperCase(), primitivas: []}, caja: {x0: 0, y0: 0, x1: w, y1: h}});
  const relleno = (i, w) => ({id: `estandar-${i}`, tipo: 'estandar', familia: 'cimentacion', relleno: true, nominal: 1, contenido: {primitivas: []}, caja: {x0: 0, y0: 0, x1: w, y1: w}});
  const r = componerPaqueteLaminas({contenidos: [planta('cimentacion', 'cimentacion', 8, 10), relleno(1, 5), relleno(2, 5), relleno(3, 40)]});
  assert.equal(r.hojas.length, 1);
  const espacios = r.hojas[0].lamina.espacios;
  assert.equal(espacios.find((e) => e.id === 'cimentacion').escala, 1); // 1/50, como el ingeniero
  assert.deepEqual(espacios.filter((e) => e.tipo === 'estandar').map((e) => e.id), ['estandar-1', 'estandar-2']);
});
