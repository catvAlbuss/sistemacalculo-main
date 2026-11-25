// Lo que dice el agente lo dice el plano: cada dato del mensaje se busca en los textos dibujados.
import test from 'node:test';
import assert from 'node:assert/strict';
import {verificarCoherencia, textoLimpio} from '../../resources/js/ingenieria/agente/coherencia.js';

const resumen = {
  cimentacion: 'platea', hz: 0.6, df: 2, cimientoCorrido: 3, altura: 3.38,
  losas: [{titulo: 'PLANO DE LOSA ALIGERADA', espesor: 0.2, viguetas: 22}],
  porticos: ['X', 'U´'], techo: {pendiente: 0.35, cumbrera: 4.44},
  columnas: [{tipo: 'C1', refuerzo: '12Ø5/8"'}], sismo: {Z: 0.35, Tp: 0.6},
};
const dibujado = [
  'PLATEA DE CIMENTACIÓN', 'Hz = 0.60 m', 'Df = -2.00 m', 'MÓDULO VIII - PLANO DE CIMIENTO CORRIDO',
  'Paño 01\\PLOSA ALIGERADA E=20CM\\P(11 VIGUETAS)', 'E=20CM (11 VIG.)',
  'MÓDULO VIII - PLANO DE PÓRTICO EJE X-X', 'MÓDULO VIII - PLANO DE PÓRTICO EJE U´-U´',
  'Cobertura TR4 · PTE=35%', 'TECHO NFP=+3.38m', 'CUMBRERA NFP=+4.44m', 'C1', '12Ø5/8"', 'Z=0.35(ZONA 3)', 'Tp=0.60(suelo S2)',
];

test('todo lo del mensaje está dibujado: coherente', () => {
  const r = verificarCoherencia(resumen, dibujado);
  assert.deepEqual(r.faltan, []);
  assert.ok(r.verificados.includes('22 viguetas'));
});

test('lo que el mensaje dice y el plano no trae se reporta', () => {
  const r = verificarCoherencia({...resumen, cimentacion: '4 zapatas', losas: [{titulo: 'PLANO DE LOSA ALIGERADA', espesor: 0.25, viguetas: 30}]}, dibujado);
  assert.ok(r.faltan.includes('cimentación con 4 zapatas'));
  assert.ok(r.faltan.includes('losa aligerada e=0.25 m'));
  assert.ok(r.faltan.includes('30 viguetas'));
});

test('sin losa el plano no trae aligerado; la decisión de losa maciza se ve en el plano', () => {
  assert.deepEqual(verificarCoherencia({...resumen, losas: []}, [...dibujado, 'MÓDULO VIII - PLANO DE LOSA ALIGERADA']).faltan, ['techo sin losa (cobertura liviana)']);
  // Decidió "no" pero el plano trae maciza en baños; el descanso de escalera macizo sí vale.
  const conBano = {...resumen, losas: [{...resumen.losas[0], macizas: {'baños': 1}}]};
  assert.deepEqual(verificarCoherencia(conBano, [...dibujado, 'LOSA MACIZA E=20CM'], {losaMaciza: false}).faltan, ['sin losa maciza en baños (lo que decidiste)']);
  const conDescanso = {...resumen, losas: [{...resumen.losas[0], macizas: {descanso: 1}}]};
  assert.deepEqual(verificarCoherencia(conDescanso, [...dibujado, 'LOSA MACIZA E=20CM'], {losaMaciza: false}).faltan, []);
  // Decidió "sí" y no hay maciza en baños; y los rótulos deben coincidir con los paños dibujados.
  assert.deepEqual(verificarCoherencia(resumen, dibujado, {losaMaciza: true}).faltan, ['losa maciza en baños (lo que decidiste)']);
  assert.deepEqual(verificarCoherencia(conDescanso, dibujado).faltan, ['1 paño(s) de losa maciza rotulados']);
});

test('texto limpio de MTEXT', () => {
  assert.equal(textoLimpio('{\\fArial|b0;Paño 01}\\PLOSA E=20CM'), 'Paño 01 LOSA E=20CM');
});
