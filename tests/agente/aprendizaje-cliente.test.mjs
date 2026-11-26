// Aprendizaje con el cliente: etiquetas desde la lámina corregida, validación antes de activarse.
import test from 'node:test';
import assert from 'node:assert/strict';
import {ajustarTransformacion, etiquetasDeCorrecciones, entrenarModeloCliente, decidirMuroCliente, textoModeloCliente} from '../../resources/js/ingenieria/aprendizaje/aprendizajeCliente.js';
import {aleatorio} from '../../resources/js/ingenieria/aprendizaje/modelos.js';

test('la transformación planta → lámina sale de los muros marcados', () => {
  const T = (p) => ({x: 2 * p.x + 100, y: 2 * p.y - 50});
  const tr = ajustarTransformacion([[{x: 0, y: 0}, T({x: 0, y: 0})], [{x: 4, y: 0}, T({x: 4, y: 0})], [{x: 0, y: 3}, T({x: 0, y: 3})]]);
  assert.deepEqual([tr.s, tr.tx, tr.ty].map((v) => Math.round(v * 1000) / 1000), [2, 100, -50]);
  assert.ok(tr.error < 1e-9);
});

test('conservados, borrados y agregados por el ingeniero', () => {
  const T = (p) => ({x: 2 * p.x + 100, y: 2 * p.y + 10});
  const rasgos = {largo: 4};
  const candidatos = [
    {i: 0, a: {x: 0, y: 0}, b: {x: 4, y: 0}, rasgos, regla: true, dibujado: true},   // queda
    {i: 1, a: {x: 0, y: 3}, b: {x: 4, y: 3}, rasgos, regla: true, dibujado: true},   // queda
    {i: 2, a: {x: 0, y: 0}, b: {x: 0, y: 3}, rasgos, regla: true, dibujado: true},   // lo borra
    {i: 3, a: {x: 4, y: 0}, b: {x: 4, y: 3}, rasgos, regla: false, dibujado: false}, // lo agrega
    {i: 4, a: {x: 2, y: 0}, b: {x: 2, y: 3}, rasgos, regla: false, dibujado: false}, // sigue sin dibujar
  ];
  const agente = [0, 1].map((i) => ({pieza: `muro-cim:${i}`, a: T(candidatos[i].a), b: T(candidatos[i].b)}));
  const usuario = [[T({x: 4, y: 0}), T({x: 4, y: 3})], [{x: -900, y: -900}, {x: -800, y: -900}]];
  const {muestras, resumen} = etiquetasDeCorrecciones({candidatos, agente, usuario});
  assert.deepEqual(muestras.map((m) => m.etiqueta), [true, true, false, true, false]);
  assert.deepEqual(resumen, {conservados: 2, borrados: 1, agregados: 1, sinCambio: 1});
});

// Un cliente con un estilo distinto de la regla: dibuja SOLO los muros largos (> 3 m), la regla
// dibuja los cercanos al borde.
const rnd = aleatorio(3);
const muestra = (modulo) => {
  const largo = 0.5 + rnd() * 5, dBorde = rnd() * 3;
  return {modulo, rasgos: {largo, dBorde, dEje: rnd(), inclinacion: 0, dColumna: rnd() * 4, dExtremoColumna: rnd() * 2, dColumneta: 5, posRelativa: rnd(), paralelos: 1, platea: 0, niveles: 1, area: 80},
    regla: dBorde < 0.5, etiqueta: largo > 3, largo};
};
const modulos = (n) => Array.from({length: n}, (_, k) => Array.from({length: 60}, () => muestra(`m${k}`))).flat();

test('con pocas correcciones sigue la regla; con suficientes y mejores, aprende el estilo del cliente', () => {
  const dos = entrenarModeloCliente({cliente: modulos(2)});
  assert.equal(dos.activo, false);
  assert.equal(dos.validacion.modelo, null);
  assert.match(textoModeloCliente(dos), /con 3 o más/);
  assert.equal(decidirMuroCliente(dos), undefined, 'sin activar: decide la regla');
  const cuatro = entrenarModeloCliente({cliente: modulos(4)});
  assert.equal(cuatro.activo, true, JSON.stringify(cuatro.validacion));
  assert.ok(cuatro.validacion.modelo > cuatro.validacion.regla + 0.1);
  const decidir = decidirMuroCliente(cuatro);
  assert.equal(decidir({largo: 4.5, dBorde: 2, dEje: 0.5, inclinacion: 0, dColumna: 2, dExtremoColumna: 1, dColumneta: 5, posRelativa: 0.5, paralelos: 1, platea: 0, niveles: 1, area: 80}, false), true);
  assert.equal(decidir({largo: 1, dBorde: 0.1, dEje: 0.5, inclinacion: 0, dColumna: 2, dExtremoColumna: 1, dColumneta: 5, posRelativa: 0.1, paralelos: 1, platea: 0, niveles: 1, area: 80}, true), false);
  assert.match(textoModeloCliente(cuatro), /Aprendí tu criterio/);
});
