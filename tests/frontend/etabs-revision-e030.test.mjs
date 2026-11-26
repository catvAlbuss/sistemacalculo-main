// Revisión del agente (E.030) sobre resultados reales del motor (python-backend/tests/response_seismic.json).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {revisarResultados, revisarModelo, resumirRevision, rDelEspectro, saEnG} from '../../resources/js/cad/engine/revisionE030.js';

const res = JSON.parse(readFileSync('python-backend/tests/response_seismic.json', 'utf8'));
// Espectro E.030 de meseta 0.1887 g (Z=0.35, U=1.5, S=1.15, R=8) y Tp = 0.6 s, TL = 2 s, en g con SF 9.81.
const puntos = [0, 0.3, 0.6, 0.8, 1.0, 1.5, 2.0, 3.0].map((T) => ({T, Sa: 0.1887 * (T <= 0.6 ? 1 : T <= 2 ? 0.6 / T : (0.6 * 2) / (T * T))}));

test('R del nombre del espectro y Sa en g', () => {
  assert.equal(rDelEspectro({name: 'E030-2018 Z3S2 R8'}), 8);
  assert.equal(rDelEspectro({name: 'Espectro', meta: {R: 6}}), 6);
  assert.equal(rDelEspectro({name: 'Func1'}), null);
  assert.equal(Math.round(saEnG(puntos, 0.3, 9.80665) * 1e4) / 1e4, 0.1887); // en g (SF convierte a m/s²)
  assert.equal(Math.round(saEnG(puntos.map((p) => ({...p, Sa: p.Sa * 9.80665})), 0.3, 1, false) * 1e4) / 1e4, 0.1887); // en m/s²
  assert.equal(Math.round(saEnG(puntos, 0.3, 1) * 1e4) / 1e4, 0.1887); // en g con factor 1
});

test('resultados reales: masa, deriva inelástica (0.75·R) y cortante mínimo con la acción concreta', () => {
  const {verificaciones: v, parametros} = revisarResultados({direcciones: {X: {resultado: res, espectro: {puntos, factor: 9.80665}}, Y: {resultado: res, espectro: {puntos, factor: 9.80665}}}, R: 8});
  const de = (dir, titulo) => v.find((x) => x.grupo === `Sismo ${dir}` && x.titulo === titulo);
  assert.equal(parametros.factorDeriva, 6);
  assert.equal(de('X', 'Masa participativa acumulada').estado, 'cumple');
  // X: deriva elástica máx. 0.0012827 → ×6 = 0.0077 > 0.007.
  const dx = de('X', 'Deriva inelástica máxima');
  assert.equal(dx.valor, 0.0077);
  assert.equal(dx.estado, 'no_cumple');
  assert.match(dx.accion, /Rigidiza en X/);
  assert.equal(de('Y', 'Deriva inelástica máxima').estado, 'cumple');
  // Cortante: X con T1 = 0.734 s; el resultado debe salir con un número y su acción si no llega.
  const vx = de('X', 'Cortante dinámico / estático');
  assert.ok(['cumple', 'no_cumple'].includes(vx.estado));
  assert.match(vx.detalle, /Sa\(T1\)/);
  const resumen = resumirRevision(v);
  assert.ok(resumen.noCumple >= 1 && resumen.acciones.length >= 1);
});

test('sin resultados o con un modelo incompleto lo dice sin inventar', () => {
  const {verificaciones} = revisarResultados({direcciones: {}});
  assert.ok(verificaciones.every((x) => x.estado === 'sin_datos'));
  const m = revisarModelo({apoyos: 0, barras: 10, sinSeccion: 2, cargas: {muerta: true}, masa: false, espectroX: true});
  const no = m.filter((x) => x.estado === 'no_cumple').map((x) => x.titulo);
  assert.deepEqual(no, ['Apoyos en la base', 'Secciones asignadas', 'Fuente de masa (peso sísmico)', 'Espectro en X e Y']);
  assert.equal(m.find((x) => x.titulo === 'Carga viva (CV)').estado, 'observacion');
});
