// Combinaciones de carga creadas en Define ▸ Combinaciones de carga: llegan al motor con `id` y
// `terms` (antes viajaban como `loadCases` y el motor las descartaba en silencio).
import test from 'node:test';
import assert from 'node:assert/strict';
import {comboParaMotor, esComboDelUsuario} from '../../resources/js/cad/mixins/io/file-io/e2k-load-combos.js';

test('una combinación del modal pasa al formato del motor', () => {
  const c = comboParaMotor({name: '1.2CM+1.0SDX', combinationType: 'ADD', loadCases: [{name: 'CM', scale: 1.2}, {name: 'SDX', scale: 1}, {name: 'CV', scale: 0}]}, new Set(['SDX']));
  assert.equal(c.id, '1.2CM+1.0SDX');
  assert.equal(c.type, 'ADD');
  // Factor 0 no aporta; el término de espectro va sin signo, como los importados.
  assert.deepEqual(c.terms, [{case: 'CM', factor: 1.2}, {case: 'SDX', factor: 1, signless: true}]);
});

test('envolvente y combinaciones importadas del .e2k', () => {
  assert.equal(comboParaMotor({name: 'ENV', combinationType: 'ENVE', loadCases: [{name: 'CM', scale: 1}]}).type, 'ENVELOPE');
  const importada = {id: '01', name: '01 1.4CM+1.7CV', type: 'ADD', design: 'Concrete', terms: [{case: 'CM', factor: 1.4}, {case: 'CV', factor: 1.7}]};
  const m = comboParaMotor(importada);
  assert.equal(m.id, '01');
  assert.equal(m.design, 'Concrete');
  assert.deepEqual(m.terms, importada.terms);
  assert.equal(esComboDelUsuario(importada), false);
  assert.equal(esComboDelUsuario({name: 'X', loadCases: []}), true);
  assert.equal(esComboDelUsuario({...importada, origen: 'usuario'}), true);
});
