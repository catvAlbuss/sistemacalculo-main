// Cuadro de vigas como el del despacho: una columna por sección, peraltadas con el corrido de vigas
// y chatas/borde con 4Ø1/2" (lo que el ingeniero dibuja en sus "CUADRO DE VIGA (30x40cm)").
import test from 'node:test';
import assert from 'node:assert/strict';
import {cuadroVigas} from '../../resources/js/ingenieria/laminas/cuadroColumnas.js';

const textos = (r) => r.contenido.primitivas.filter((p) => p.type === 'text').map((p) => p.value);

test('cuadro de vigas: una columna por sección, de la más peraltada a la chata', () => {
  const r = cuadroVigas([
    {tipo: 'V-101', b: 0.3, h: 0.4}, {tipo: 'V-101', b: 0.3, h: 0.4}, {tipo: 'V-102', b: 0.3, h: 0.6},
    {tipo: 'VCH', b: 0.2, h: 0.2}, {tipo: 'VB', b: 0.25, h: 0.2},
  ], {armado: {barras: 6, barra: '5/8"'}});
  assert.deepEqual(r.filas.map((f) => f.seccion), ['30x60', '30x40', '25x20', '20x20']);
  assert.equal(r.filas[1].cantidad, 2);
  assert.equal(r.filas[0].refuerzo, '6Ø5/8"');
  assert.equal(r.filas[3].refuerzo, '4Ø1/2"');
  const t = textos(r);
  assert.ok(t.includes('CUADRO DE VIGAS'));
  assert.ok(t.some((x) => /VIGA CHATA \(20x20cm\)/.test(x)));
  assert.ok(t.some((x) => /VIGA BORDE \(25x20cm\)/.test(x)));
  assert.ok(t.some((x) => /^VIGA \(30x60cm\)$/.test(x)));
});

test('cuadro de vigas: medidas al módulo de 5 cm y sin vigas no hay cuadro', () => {
  const r = cuadroVigas([{tipo: 'V-101', b: 0.31, h: 0.41}, {tipo: 'V-101', b: 0.3, h: 0.4}]);
  assert.equal(r.filas.length, 1);
  assert.equal(r.filas[0].seccion, '30x40');
  assert.equal(cuadroVigas([]), null);
  assert.equal(cuadroVigas([{tipo: 'V', b: 0, h: 0.4}]), null);
});
