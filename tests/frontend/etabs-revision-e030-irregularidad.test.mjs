// Irregularidades E.030 (Tablas 8 y 9), diseño y el pedido a la IA de la Revisión del agente.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {revisarIrregularidades, revisarDiseno, revisarResultados, mensajesExplicacion} from '../../resources/js/cad/engine/revisionE030.js';

const res = JSON.parse(readFileSync('python-backend/tests/response_seismic.json', 'utf8'));
const payload = JSON.parse(readFileSync('python-backend/tests/payload_seismic.json', 'utf8'));
const titulo = (v, t) => v.find((x) => x.titulo === t);

test('resultados reales: torsión con la planta de los nudos y sin piso blando ni masa', () => {
  const o = revisarIrregularidades({direcciones: {X: {resultado: res}, Y: {resultado: res}}, nodos: payload.nodes, factorDeriva: 6});
  const t = titulo(o.verificaciones, 'Torsional (en planta)');
  assert.equal(t.valor, 1.21);
  assert.equal(t.estado, 'cumple');
  assert.doesNotMatch(t.detalle, /aprox/);
  assert.equal(titulo(o.verificaciones, 'Rigidez (piso blando)').estado, 'cumple');
  assert.equal(titulo(o.verificaciones, 'Masa o peso').estado, 'cumple');
  assert.deepEqual([o.Ia, o.Ip, o.irregular], [1, 1, false]);
});

// Edificio de 3 pisos construido: el 1° muy flexible (piso blando) y el 2° muy pesado.
const piso = (story, z, deriva, V, m) => ({story, z, shear: V, story_shear: V, mass: m, elevation_m: z, height_m: 3, drift_x_m: deriva});
const sintetico = {
  seismic: {x: {story_drifts: [piso('P1', 3, 0.006, 100, 1000), piso('P2', 6, 0.002, 80, 2000), piso('P3', 9, 0.002, 40, 1000)], displacements: {}}},
  story_shears: {x: [piso('P1', 3, 0.006, 100, 1000), piso('P2', 6, 0.002, 80, 2000), piso('P3', 9, 0.002, 40, 1000)]},
};

test('piso blando y masa: Ia y la acción concreta', () => {
  const o = revisarIrregularidades({direcciones: {X: {resultado: sintetico}}, factorDeriva: 6});
  const rig = titulo(o.verificaciones, 'Rigidez (piso blando)');
  assert.equal(rig.estado, 'no_cumple');          // k1 = 100/0.006 = 16 667; k2 = 40 000 → 42 %
  assert.match(rig.detalle, /P1 en X: 42 %/);
  assert.match(rig.detalle, /Extrema \(Ia = 0.50\)/);
  assert.equal(titulo(o.verificaciones, 'Masa o peso').estado, 'no_cumple'); // P2 = 2 × P1
  assert.equal(o.Ia, 0.5);
  assert.equal(o.irregular, true);
});

test('irregular: deriva con 0.85·R y cortante mínimo del 90 %', () => {
  const regular = revisarResultados({direcciones: {X: {resultado: res}}, R: 8, regular: true}).parametros;
  const irregular = revisarResultados({direcciones: {X: {resultado: res}}, R: 8, regular: false}).parametros;
  assert.equal(regular.factorDeriva, 6);
  assert.equal(irregular.factorDeriva, 6.8);
});

test('diseño: columnas que no cumplen, sin diseño automático y viga', () => {
  const columnas = [
    {label: 'C1 (Story1)', check: {base: {ratio: 1.12}, top: {ratio: 0.8}}},
    {label: 'C2 (Story1)', check: {base: {ratio: 0.6}, top: {ratio: 0.7}}},
    {label: 'C3 (Story1)', unsupported: true, unsupportedReason: 'Sección L sin armado definido'},
  ];
  const viga = {results: {flexion: {positivo: {data: {meta: [{As_usar: 4, As_max: 20}, {As_usar: 4, As_max: 20}]}}}}, rebarState: {positivo: {asReal: [5.27, 2.58]}}};
  const v = revisarDiseno({columnas, viga}).verificaciones;
  assert.equal(titulo(v, 'Columnas (flexocompresión)').estado, 'no_cumple');
  assert.match(titulo(v, 'Columnas (flexocompresión)').detalle, /C1 \(Story1\) \(1.12\)/);
  assert.equal(titulo(v, 'Columnas sin diseño automático').valor, 1);
  assert.equal(titulo(v, 'Viga diseñada (flexión, acero real)').valor, '1/2 cumplen');
  assert.equal(revisarDiseno({}).verificaciones[0].estado, 'sin_datos');
});

test('a la IA solo le llegan los hechos que no cumplen', () => {
  const m = mensajesExplicacion({verificaciones: [{grupo: 'Sismo X', titulo: 'Deriva', estado: 'no_cumple', valor: 0.0077}, {grupo: 'Modelo', titulo: 'Apoyos', estado: 'cumple'}], parametros: {R: 8}});
  assert.match(m[0].content, /SOLO los números dados/);
  const datos = JSON.parse(m[1].content);
  assert.deepEqual(datos.observaciones.map((x) => x.verificacion), ['Deriva']);
});
