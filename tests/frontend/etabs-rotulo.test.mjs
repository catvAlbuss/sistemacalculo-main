import test from 'node:test';
import assert from 'node:assert/strict';
import {textoEnCasilla, datosDesdeArquitectura, anchoTexto} from '../../resources/js/etabs/agente/rotulo.js';

test('a title block value never leaves its box: it wraps and shrinks to fit', () => {
  const campo = {campo: 'plano', x: 10, y: 5, alto: 0.06, ancho: 1.49, lineas: 3, interlineado: 0.094};
  const prims = textoEnCasilla(campo, 'PLANO DE CIMENTACIÓN, CIMIENTO CORRIDO Y LOSA ALIGERADA - MÓDULO XIV', {max: 3});
  assert.ok(prims.length >= 2 && prims.length <= 3, 'wrapped in up to 3 lines');
  for (const p of prims) {
    assert.ok(anchoTexto(p.value, p.h) <= campo.ancho + 1e-9, `"${p.value}" overflows the box`);
    assert.equal(p.align, 'izq');
  }
  assert.ok(prims[1].at[1] < prims[0].at[1], 'lines go down');
  assert.deepEqual(textoEnCasilla(campo, ''), [], 'empty data leaves the box empty');
});

test('project data are read from an architecture title block when it has one', () => {
  const t = (texto, x, y) => ({tipo: 'texto', texto, centro: {x, y}, alto: 0.1});
  const datos = datosDesdeArquitectura([
    t('PROYECTO: CONSTRUCCIÓN DEL AULA 3', 0, 5), t('REGIÓN :', 0, 4), t('Cusco', 1.2, 4.02), t('PROVINCIA:', 0, 3.8), t('Urubamba', 1.2, 3.8),
    t('DISTRITO', 0, 3.6), t(':  Ollantaytambo', 1.2, 3.6), t('CÓDIGO LOCAL :', 0, 3.4), t('123456', 1.5, 3.4),
  ]);
  assert.deepEqual(datos, {proyecto: 'CONSTRUCCIÓN DEL AULA 3', region: 'Cusco', provincia: 'Urubamba', distrito: 'Ollantaytambo', codigoLocal: '123456'});
});
