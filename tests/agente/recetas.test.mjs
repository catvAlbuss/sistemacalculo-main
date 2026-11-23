// Las recetas de dibujo se aprenden midiendo los planos del ingeniero y tienen respaldo por defecto.
import test from 'node:test';
import assert from 'node:assert/strict';
import {receta} from '../../resources/js/ingenieria/aprendizaje/recetas.js';
import {RECETAS} from '../../resources/js/ingenieria/aprendizaje/recetasAprendidas.js';

test('a learned recipe is used when it is inside a sane range, otherwise the default', () => {
  const largo = RECETAS.vigueta?.largo;
  assert.equal(receta('vigueta.largo', 0.32, [0.2, 0.8]), typeof largo === 'number' && largo >= 0.2 && largo <= 0.8 ? largo : 0.32);
  assert.equal(receta('vigueta.largo', 0.32, [5, 6]), 0.32, 'out of range: default');
  assert.equal(receta('no.existe', 0.25), 0.25, 'missing: default');
});

test('recipes carry only numbers and their sample size (no client data)', () => {
  const texto = JSON.stringify(RECETAS);
  assert.doesNotMatch(texto, /vinchos|modulo|\.dwg/i);
  assert.ok(RECETAS.vigueta.muestras >= 0);
});
