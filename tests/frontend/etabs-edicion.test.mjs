// El agente edita lo ya dibujado (no es un chatbot que solo regenera): "mejora las cotas" y
// "ordena la lámina" reubican los rótulos encimados sobre las propias entidades del dibujo,
// sin volver a pedir los datos. Aquí se prueba el planeo (puro) y las skills con un ctx falso.
import test from 'node:test';
import assert from 'node:assert/strict';
import {planearSeparacion} from '../../resources/js/ingenieria/laminas/cajasTexto.js';
import {EDICION_SKILLS} from '../../resources/js/ingenieria/agente/skills/edicion.js';
import {rutaDirecta} from '../../resources/js/ingenieria/agente/agentRunner.js';
import {L} from '../../resources/js/ingenieria/cad/primitives.js';

// Entidad de texto como la ve el visor (MTEXT): la caja se calcula de contents/height/location.
let idSeq = 0;
const txt = (layer, x, y, contents = 'ABC', height = 0.2) => ({
  dxfTypeName: 'MTEXT', layer, contents, height, width: 0, rotation: 0,
  location: {x, y, z: 0}, objectId: ++idSeq,
});

test('planearSeparacion moves an element label off a fixed cota, and leaves the cota put', () => {
  const cota = txt(L.COTAS_E, 0, 0, '3.50');       // fija: no se mueve
  const rotulo = txt(L.VIGAS, 0, 0, 'V(0.30x0.60)'); // movible: se encima con la cota
  const {moves} = planearSeparacion([cota, rotulo]);
  assert.equal(moves.length, 1, 'solo se mueve el rótulo movible');
  assert.equal(moves[0].entidad, rotulo);
  assert.ok(Math.hypot(moves[0].dx, moves[0].dy) > 0, 'se desplaza a un hueco');
  // Un rótulo que no se encima con nada no se mueve.
  const libre = txt(L.VIGAS, 100, 100, 'V-2');
  assert.equal(planearSeparacion([cota, libre]).moves.length, 0);
});

test('ordenar_lamina moves the overlapping labels via moverEntidades, without regenerating', async () => {
  const entidades = [txt(L.COTAS_E, 0, 0, '3.50'), txt(L.VIGAS, 0, 0, 'V(0.30x0.60)')];
  const movidas = [];
  const ctx = {
    entidadesDelAgente: () => entidades,
    moverEntidades: (_label, movs) => { movidas.push(...movs); return movs.length; },
    modificar: () => 0,
  };
  const skill = EDICION_SKILLS.find((s) => s.name === 'ordenar_lamina');
  const out = await skill.run({}, ctx);
  assert.equal(out.ok, true);
  assert.ok(out.movidos >= 1, 'reubicó al menos un rótulo');
  assert.equal(movidas.length, out.movidos);
  assert.match(out.mensaje, /Orden[eé] la l[áa]mina/);
});

test('mejorar_cotas clears labels that cover the cotas and never touches the cota values', async () => {
  const entidades = [txt(L.COTAS_E, 0, 0, '3.50'), txt(L.CODIGOS, 0, 0, 'Ø1/2"')];
  let movio = 0;
  const ctx = {entidadesDelAgente: () => entidades, moverEntidades: (_l, m) => (movio = m.length), modificar: () => 0};
  const skill = EDICION_SKILLS.find((s) => s.name === 'mejorar_cotas');
  const out = await skill.run({}, ctx);
  assert.equal(out.ok, true);
  assert.ok(movio >= 1);
  assert.match(out.mensaje, /cotas/i);
});

test('with no drawing the edit tools ask to generate first, and do not fail', async () => {
  const ctx = {entidadesDelAgente: () => [], moverEntidades: () => 0, modificar: () => 0};
  for (const name of ['ordenar_lamina', 'mejorar_cotas']) {
    const out = await EDICION_SKILLS.find((s) => s.name === name).run({}, ctx);
    assert.equal(out.ok, true);
    assert.match(out.mensaje, /genera el plano|no hay l[áa]minas/i);
  }
});

test('the phrases route to the edit tools with zero tokens', () => {
  assert.deepEqual(rutaDirecta('mejora mis cotas'), {tool: 'mejorar_cotas', args: {}});
  assert.deepEqual(rutaDirecta('las cotas se ven encimadas'), {tool: 'mejorar_cotas', args: {}});
  assert.deepEqual(rutaDirecta('ordena la lámina'), {tool: 'ordenar_lamina', args: {}});
  assert.deepEqual(rutaDirecta('acomoda los textos'), {tool: 'ordenar_lamina', args: {}});
  assert.deepEqual(rutaDirecta('está todo desordenado'), {tool: 'ordenar_lamina', args: {}});
});
