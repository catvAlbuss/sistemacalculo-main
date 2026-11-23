// Ejes de otro arquitecto: burbujas en una capa cualquiera ("proyeccion"), rótulos con cero a la
// izquierda ("05") y marcas de corte que parecen burbujas (círculo + letra + línea) pero no lo son.
import test from 'node:test';
import assert from 'node:assert/strict';
import {detectarVistas, textoPlano} from '../../resources/js/ingenieria/lectura/lectorPlano.js';

const r = 0.25;
function eje(items, nombre, p, q, capaBurbuja) {
  const ux = Math.sign(q.x - p.x), uy = Math.sign(q.y - p.y);
  for (const [c, s] of [[p, -1], [q, 1]]) {
    const centro = {x: c.x + s * ux * r * 1.2, y: c.y + s * uy * r * 1.2};
    items.push({tipo: 'circulo', capa: capaBurbuja, centro, radio: r, bloque: ''});
    items.push({tipo: 'texto', capa: capaBurbuja, centro: {x: centro.x - 0.05, y: centro.y - 0.08}, texto: nombre, alto: 0.3, bloque: ''});
  }
  // Eje punteado: tramos cortos que nacen en la burbuja.
  items.push({tipo: 'linea', capa: 'EJES GENERLES', puntos: [{x: p.x - ux * r * 0.2, y: p.y - uy * r * 0.2}, {x: p.x + ux * 1.2, y: p.y + uy * 1.2}], bloque: ''});
  items.push({tipo: 'linea', capa: 'EJES GENERLES', puntos: [{x: q.x - ux * 1.2, y: q.y - uy * 1.2}, {x: q.x + ux * r * 0.2, y: q.y + uy * r * 0.2}], bloque: ''});
}
function planta({cortes = false} = {}) {
  const items = [];
  for (const [n, x] of [['A', 0], ['B', 4], ['C', 8]]) eje(items, n, {x, y: -1}, {x, y: 7}, 'proyeccion');
  for (const [n, y] of [['01', 0], ['03', 3], ['05', 6]]) eje(items, n, {x: -1, y}, {x: 9, y}, 'proyeccion');
  items.push({tipo: 'texto', capa: 'TEXTOS', centro: {x: 4, y: -3}, texto: String.raw`\LPRIMER NIVEL MODULO V\l`, alto: 0.4, bloque: ''});
  if (cortes) {
    // Corte A-A: dos marcas en la capa CORTES con la línea de corte entre ellas.
    items.push({tipo: 'circulo', capa: 'CORTES', centro: {x: 2, y: -2}, radio: r, bloque: ''}, {tipo: 'texto', capa: 'CORTES', centro: {x: 2, y: -2}, texto: 'A', alto: 0.3, bloque: ''});
    items.push({tipo: 'circulo', capa: 'CORTES', centro: {x: 2, y: 8}, radio: r, bloque: ''}, {tipo: 'texto', capa: 'CORTES', centro: {x: 2, y: 8}, texto: 'A', alto: 0.3, bloque: ''});
    items.push({tipo: 'linea', capa: 'CORTES', puntos: [{x: 2, y: -2 + r}, {x: 2, y: 8 - r}], bloque: ''});
  }
  return items;
}

test('axis bubbles are recognized by shape on any layer, and "05" is axis 5', () => {
  const [vista] = detectarVistas(planta());
  assert.ok(vista, 'one view');
  assert.deepEqual(vista.ejes.map((e) => e.nombre).sort(), ['1', '3', '5', 'A', 'B', 'C']);
  assert.equal(vista.intersecciones.length, 9);
  assert.equal(vista.titulo, 'PRIMER NIVEL MODULO V', 'MTEXT underline codes are removed from titles');
});

test('section marks (circle + letter + cut line) on a CORTES layer are not axes', () => {
  const [vista] = detectarVistas(planta({cortes: true}));
  assert.equal(vista.ejes.filter((e) => e.nombre === 'A').length, 1);
  assert.equal(textoPlano(String.raw`\LTECHO\l`), 'TECHO');
});
