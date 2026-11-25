// Peralte de vigas aprendido de las plantas del ingeniero (vinchos e ilo): una sección principal
// por planta con la mayor luz entre ejes que carga losa, la secundaria para lo demás y un
// incremento por pisos.
import test from 'node:test';
import assert from 'node:assert/strict';
import {seccionVigaDespacho} from '../../resources/js/ingenieria/diseno/estructura.js';

const h = (o) => seccionVigaDespacho(o).h;

test('principal: max(secundaria + Δ pisos, L/12 a 0.05) como el ingeniero', () => {
  assert.equal(h({luzMayor: 7.43, principal: true, pisos: 3, secundaria: 0.4}), 0.6);   // vinchos 1: V(30x60)
  assert.equal(h({luzMayor: 10.49, principal: true, pisos: 2, secundaria: 0.5}), 0.85); // ilo 4: 0.85
  assert.equal(h({luzMayor: 7.9, principal: true, pisos: 2, secundaria: 0.5}), 0.65);
  assert.equal(h({luzMayor: 4.49, principal: true, pisos: 1, secundaria: 0.4}), 0.4);   // 1 piso, luz corta
  assert.equal(h({luzMayor: 4.49, principal: true, pisos: 2, secundaria: 0.4}), 0.5);   // +0.10 por 2 pisos
});

test('las que no cargan o no son principales van con la secundaria; ancho 0.30 por defecto', () => {
  assert.equal(h({luzMayor: 10.49, principal: false, pisos: 2, secundaria: 0.5}), 0.5);
  assert.equal(seccionVigaDespacho({luzMayor: 6, principal: true}).b, 0.3);
});
