// Modelos de aprendizaje (árbol, bosque, logística, red neuronal): aprenden lo que deben y son
// reproducibles (misma semilla, mismo modelo) y serializables (JSON → misma predicción).
import test from 'node:test';
import assert from 'node:assert/strict';
import {ENTRENADORES, predecirModelo, metricas, aleatorio, textoArbolModelo} from '../../resources/js/ingenieria/aprendizaje/modelos.js';

const rnd = aleatorio(11);
const datos = (n, f) => Array.from({length: n}, () => { const x = [rnd() * 2 - 1, rnd() * 2 - 1, rnd()]; return {x, y: f(x) ? 1 : 0}; });
const exactitud = (modelo, muestras) => metricas(muestras.map((m) => m.y), muestras.map((m) => predecirModelo(modelo, m.x) >= 0.5)).exactitud;
const R = ['a', 'b', 'ruido'];

test('un umbral lo aprenden todos; el árbol lo dice en palabras', () => {
  const umbral = (x) => x[0] > 0.2;
  const ent = datos(600, umbral), prueba = datos(300, umbral);
  for (const [tipo, entrenar] of Object.entries(ENTRENADORES)) {
    const m = entrenar(ent.map((d) => d.x), ent.map((d) => d.y), R);
    assert.ok(exactitud(m, prueba) > 0.93, `${tipo}: ${exactitud(m, prueba)}`);
  }
  const arbol = ENTRENADORES.arbol(ent.map((d) => d.x), ent.map((d) => d.y), R, {profundidad: 2});
  assert.match(textoArbolModelo(arbol).join('\n'), /a ≤ 0.2/);
});

test('XOR: la red neuronal y el bosque lo aprenden, la logística (lineal) no', () => {
  const xor = (x) => (x[0] > 0) !== (x[1] > 0);
  const ent = datos(1200, xor), prueba = datos(400, xor);
  const X = ent.map((d) => d.x), y = ent.map((d) => d.y);
  assert.ok(exactitud(ENTRENADORES.red(X, y, R, {epocas: 80}), prueba) > 0.9);
  assert.ok(exactitud(ENTRENADORES.bosque(X, y, R), prueba) > 0.9);
  assert.ok(exactitud(ENTRENADORES.logistica(X, y, R), prueba) < 0.7);
});

test('misma semilla, mismo modelo; el JSON predice igual', () => {
  const ent = datos(300, (x) => x[0] + x[1] > 0);
  const X = ent.map((d) => d.x), y = ent.map((d) => d.y);
  const a = ENTRENADORES.red(X, y, R), b = ENTRENADORES.red(X, y, R);
  assert.deepEqual(a, b);
  const copia = JSON.parse(JSON.stringify(a));
  assert.ok(Math.abs(predecirModelo(copia, {a: 0.3, b: 0.1, ruido: 0.5}) - predecirModelo(a, [0.3, 0.1, 0.5])) < 1e-12);
});
