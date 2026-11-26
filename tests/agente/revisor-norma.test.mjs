// Revisor de láminas contra la norma (15 puntos): lo que hay, lo que falta y la nota E.030-2026 9.2.
import test from 'node:test';
import assert from 'node:assert/strict';
import {revisarContraNorma, textoRevisorNorma} from '../../resources/js/ingenieria/laminas/revisorNorma.js';
import {notasTecnicas} from '../../resources/js/ingenieria/laminas/formatoDespacho.js';

const textosDe = (n) => n.primitivas.filter((p) => p.type === 'text').map((p) => p.value);

test('sin análisis ni qadm, los puntos 3 y 4 quedan a medias y dicen qué falta', () => {
  const notas = textosDe(notasTecnicas({sismo: {Z: 0.35, U: 1.5, S: 1.15, Tp: 0.6, TL: 2, zona: 3, suelo: 'S2', categoria: 'A2'}, df: 2, hz: 0.6}));
  const r = revisarContraNorma(notas);
  const p = (id) => r.puntos.find((x) => x.id === id);
  assert.equal(p(3).valor, 0.5);
  assert.match(p(3).falta, /período T, cortante basal, deriva/);
  assert.equal(p(4).valor, 0.5);
  assert.match(p(4).falta, /qadm/);
  assert.equal(p(5).valor, 1, 'tabla de recubrimientos');
});

test('con el análisis y el qadm, las notas cumplen la E.030-2026 art. 9.2 y la E.050', () => {
  const notas = textosDe(notasTecnicas({sismo: {Z: 0.35, U: 1.5, S: 1.15, Tp: 0.6, TL: 2, zona: 3, suelo: 'S2', categoria: 'A2'}, df: 2, hz: 0.6, qadm: 12,
    resultados: {Tx: 0.197, Ty: 0.172, Vx: 8.56, Vy: 8.57, derivaX: 0.0032, derivaY: 0.0024, limite: 0.007}}));
  assert.ok(notas.includes('Período T: Tx=0.197 s, Ty=0.172 s (análisis modal espectral)'));
  assert.ok(notas.includes('Presión admisible q adm=1.20 kg/cm² (Estudio de Mecánica de Suelos).'));
  const r = revisarContraNorma(notas);
  assert.equal(r.puntos.find((x) => x.id === 3).valor, 1);
  assert.equal(r.puntos.find((x) => x.id === 4).valor, 1);
  assert.match(textoRevisorNorma(r), /Revisión como ingeniero \(15 puntos de la norma\)/);
});

test('el rótulo pide ingeniero y CIP de los datos del proyecto', () => {
  const sin = revisarContraNorma(['E-01', 'ESCALA', 'NOVIEMBRE 2026'], {datos: {proyecto: 'X'}});
  assert.match(sin.puntos[14].falta, /ingeniero, CIP/);
  const con = revisarContraNorma(['E-01', 'ESCALA', 'NOVIEMBRE 2026'], {datos: {proyecto: 'X', especialista: 'Ing. Y', cip: '12345'}});
  assert.equal(con.puntos[14].valor, 1);
});
