// Textos de la arquitectura que el agente copia a sus láminas (nombre del módulo, rótulo).
import test from 'node:test';
import assert from 'node:assert/strict';
import {textoPlano} from '../../resources/js/ingenieria/lectura/lectorPlano.js';
import {proyectoDesdeArquitectura} from '../../resources/js/ingenieria/laminas/laminasPlantilla.js';

test('"\\U+00D3" escapes from the browser DWG reader are decoded with exactly 4 digits (no "M?ULO" titles)', () => {
  assert.equal(textoPlano('M\\U+00D3DULO XIV'), 'MÓDULO XIV');
  assert.equal(textoPlano('ESPECIFICACIONES T\\U+00C9CNICAS'), 'ESPECIFICACIONES TÉCNICAS');
  assert.equal(textoPlano('{\\fArial|b1;M\\U+00D3DULO\\PIII}'), 'MÓDULO III');
  assert.equal(textoPlano('%%c3/8" a 45%%d %%p0.00'), 'Ø3/8" a 45° ±0.00');
  const items = [{tipo: 'texto', capa: 'TITULO', texto: textoPlano('M\\U+00D3DULO XIV'), alto: 1, centro: {x: 0, y: 0}}];
  assert.equal(proyectoDesdeArquitectura(items), 'MÓDULO XIV');
});
