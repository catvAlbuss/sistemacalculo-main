import test from 'node:test';
import assert from 'node:assert/strict';
import {separarTextos, cajaTexto} from '../../resources/js/ingenieria/laminas/separarTextos.js';
import {L, text} from '../../resources/js/ingenieria/cad/primitives.js';

test('element labels that overlap another text are moved to the nearest free spot; axes and dimensions stay put', () => {
  const eje = text(L.EJES, [0, 0], '8', 0.2);
  const canaleta = text(L.LETRAS, [0, 0.05], 'CANALETA', 0.12);
  const viga = text(L.VIGAS, [0.1, 0.05], 'V(0.25x0.40)', 0.07);
  const {movidos} = separarTextos([eje, canaleta, viga]);
  assert.deepEqual(eje.at, [0, 0], 'fixed texts do not move');
  assert.equal(movidos, 2);
  const cajas = [eje, canaleta, viga].map(cajaTexto);
  for (let i = 0; i < cajas.length; i++) for (let j = i + 1; j < cajas.length; j++) {
    const a = cajas[i], b = cajas[j];
    assert.ok(!(a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0), `texts ${i} and ${j} still overlap`);
  }
});
