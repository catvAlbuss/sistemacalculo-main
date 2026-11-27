import test from 'node:test';
import assert from 'node:assert/strict';
import {irAlModelo} from '../../resources/js/etabs/visor/espacioModelo.js';

test('a drawing saved in a paper-space layout switches to Model before showing the agent sheets', () => {
  const llamadas = [];
  const dm = {acdbHostApplicationServices: () => ({layoutManager: {setCurrentLayoutBtrId: (id, db) => { llamadas.push(id); db.currentSpaceId = id; return true; }}})};
  const db = {currentSpaceId: 'MIV-05', tables: {blockTable: {modelSpace: {objectId: 'MODEL'}}}};
  assert.equal(irAlModelo(dm, db), true);
  assert.deepEqual(llamadas, ['MODEL']);
  // Ya en Model: no hace nada; sin documento o sin API, tampoco falla.
  assert.equal(irAlModelo(dm, db), false);
  assert.equal(irAlModelo(dm, null), false);
  assert.equal(irAlModelo({}, {currentSpaceId: 'X', tables: {blockTable: {modelSpace: {objectId: 'M'}}}}), false);
});
