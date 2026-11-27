// Irregularidades por la forma (E.030 Tablas 8 y 9) con la geometría del modelo del motor.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {revisarGeometria} from '../../resources/js/cad/engine/revisionE030.js';

// Edificio de grilla: columnas en los cruces de xs × ys (salvo `sin`), vigas entre vecinos, `pisos` de 3 m.
function edificio({xs, ys, pisos = 2, sin = () => false, extraVigas = [], sinColumnaAbajo = null}) {
  const nodos = [], elementos = [];
  let id = 1;
  const at = new Map();
  for (let k = 0; k <= pisos; k++) for (const x of xs) for (const y of ys) {
    if (k > 0 && sin(x, y, k)) continue;
    nodos.push({id, x, y, z: 3 * k}); at.set(`${x},${y},${k}`, id++);
  }
  for (let k = 1; k <= pisos; k++) for (const x of xs) for (const y of ys) {
    const n = at.get(`${x},${y},${k}`), m = at.get(`${x},${y},${k - 1}`);
    if (n && m && !(sinColumnaAbajo && sinColumnaAbajo(x, y, k))) elementos.push({node_i: m, node_j: n});
    for (const [dx, dy] of [[1, 0], [0, 1]]) {
      const x2 = xs[xs.indexOf(x) + dx], y2 = ys[ys.indexOf(y) + dy];
      const o = x2 !== undefined && y2 !== undefined ? at.get(`${x2},${y2},${k}`) : undefined;
      if (n && o) elementos.push({node_i: n, node_j: o});
    }
  }
  for (const [a, b] of extraVigas) elementos.push({node_i: at.get(a), node_j: at.get(b)});
  return {nodos, elementos};
}
const titulo = (o, t) => o.verificaciones.find((v) => v.titulo === t);

test('edificio regular: cumple todo lo geométrico', () => {
  const o = revisarGeometria(edificio({xs: [0, 5, 10], ys: [0, 4, 8]}));
  for (const t of ['Geométrica vertical', 'Discontinuidad de los sistemas resistentes', 'Esquinas entrantes', 'Discontinuidad del diafragma', 'Sistemas no paralelos']) assert.equal(titulo(o, t).estado, 'cumple', t);
  assert.deepEqual([o.Ia, o.Ip], [1, 1]);
  assert.equal(titulo(o, 'Junta sísmica (retiro del límite)').estado, 'observacion');
  assert.equal(titulo(o, 'Resistencia (piso débil)').estado, 'sin_datos');
});

test('planta en L: esquina entrante (Ip = 0.90)', () => {
  const o = revisarGeometria(edificio({xs: [0, 5, 10, 15], ys: [0, 4, 8, 12], sin: (x, y) => x >= 10 && y >= 8}));
  assert.equal(titulo(o, 'Esquinas entrantes').estado, 'no_cumple');
  assert.equal(o.Ip, 0.9);
});

test('hueco central grande: discontinuidad del diafragma (Ip = 0.85)', () => {
  // Planta de 20 × 20 m con un anillo de losa de 2 m y un hueco de 16 × 16 m (64 %): los nudos del
  // borde del hueco existen (columnas y vigas alrededor); los de adentro, no.
  const xs = [0, 2, 6, 10, 14, 18, 20], ys = xs;
  const o = revisarGeometria(edificio({xs, ys, sin: (x, y) => x > 2 && x < 18 && y > 2 && y < 18}));
  assert.equal(titulo(o, 'Discontinuidad del diafragma').estado, 'no_cumple', titulo(o, 'Discontinuidad del diafragma').detalle);
});

test('columna que nace sobre una viga: discontinuidad (Ia = 0.80)', () => {
  const o = revisarGeometria(edificio({xs: [0, 5, 10], ys: [0, 4], sinColumnaAbajo: (x, y, k) => x === 5 && y === 0 && k === 1}));
  assert.equal(titulo(o, 'Discontinuidad de los sistemas resistentes').estado, 'no_cumple');
  assert.equal(o.Ia, 0.8);
});

test('vigas diagonales: sistemas no paralelos', () => {
  const diag = [];
  for (let k = 1; k <= 2; k++) diag.push([`0,0,${k}`, `10,8,${k}`], [`10,0,${k}`, `0,8,${k}`], [`5,0,${k}`, `10,4,${k}`], [`0,4,${k}`, `5,8,${k}`]);
  const o = revisarGeometria(edificio({xs: [0, 5, 10], ys: [0, 4, 8], extraVigas: diag}));
  assert.equal(titulo(o, 'Sistemas no paralelos').estado, 'no_cumple', titulo(o, 'Sistemas no paralelos').detalle);
});

test('retiro por junta sísmica: 2/3 del desplazamiento o s/2', () => {
  const o = revisarGeometria({...edificio({xs: [0, 5], ys: [0, 4], pisos: 3}), desplazamientoMaximo: 0.09});
  assert.match(titulo(o, 'Junta sísmica (retiro del límite)').valor, /^6 cm$/); // 2/3 × 9 cm
});

test('el modelo real del motor se revisa sin errores', () => {
  const p = JSON.parse(readFileSync('python-backend/tests/payload_seismic.json', 'utf8'));
  const o = revisarGeometria({nodos: p.nodes, elementos: p.elements});
  assert.ok(o.verificaciones.length >= 7);
});

test('techo a dos aguas de un piso: los nudos del alero y la cumbrera son el mismo piso', () => {
  const g = edificio({xs: [0, 4, 8], ys: [0, 4, 8], pisos: 1});
  // Cumbrera en x = 4 a +4.5; aleros a +3.0 (las vigas del faldón quedan inclinadas).
  for (const n of g.nodos) if (n.z > 0) n.z = n.x === 4 ? 4.5 : 3;
  const o = revisarGeometria(g);
  assert.equal(titulo(o, 'Geométrica vertical').estado, 'cumple', titulo(o, 'Geométrica vertical').detalle);
  assert.equal(titulo(o, 'Discontinuidad del diafragma').estado, 'cumple');
  assert.equal(titulo(o, 'Sistemas no paralelos').estado, 'cumple');
  assert.deepEqual([o.Ia, o.Ip], [1, 1]);
});

test('piso débil con la resistencia a corte de las columnas (E.030 Tabla 8)', async () => {
  const {revisarPisoDebil} = await import('../../resources/js/cad/engine/revisionE030.js');
  const col = (piso, v2, v3) => ({piso, v2, v3});
  // Un solo piso: la revisión de forma ya la da por cumplida.
  const uno = revisarGeometria(edificio({xs: [0, 5], ys: [0, 4], pisos: 1}));
  assert.equal(titulo(uno, 'Resistencia (piso débil)').estado, 'cumple');
  assert.equal(revisarPisoDebil([col('Piso1', 10, 10)]), null);
  // Piso 1 con 70 % de la resistencia del 2 en la dirección 3: piso débil (Ia = 0.75).
  const r = revisarPisoDebil([col('Piso1', 20, 7), col('Piso1', 20, 7), col('Piso2', 20, 10), col('Piso2', 20, 10), col('Piso10', 1, 1)].slice(0, 4));
  assert.equal(r.Ia, 0.75);
  assert.equal(r.verificacion.estado, 'no_cumple');
  assert.match(r.verificacion.detalle, /Piso1 tiene 70 %/);
  assert.equal(revisarPisoDebil([col('Piso1', 10, 5), col('Piso2', 10, 10)]).Ia, 0.5);       // 50 %: extrema
  assert.equal(revisarPisoDebil([col('Piso1', 12, 12), col('Piso2', 10, 10)]).verificacion.estado, 'cumple');
});
