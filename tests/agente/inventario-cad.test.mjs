// Paso 2 del plan: el inventario CAD-JSON guarda lo que el plano contiene, en metros y referido a
// los ejes, con el identificador de cada entidad para volver a ella.
import test from 'node:test';
import assert from 'node:assert/strict';
import {inventariar, tipoDePlano, ESQUEMA} from '../../scripts/agente/inventario-cad.mjs';

test('plan type comes from the title the engineer wrote', () => {
  assert.equal(tipoDePlano('MODULO I - PLANO DE PLATEA DE CIMENTACION'), 'cimentacion');
  assert.equal(tipoDePlano('PLANO- CIMIENTO CORRIDO'), 'cimiento');
  assert.equal(tipoDePlano('PLANO- LOSA ALIGERADA 1° Y 2° PISO'), 'losa');
  assert.equal(tipoDePlano('PLANO- TECHO 2º PISO'), 'losa');
  assert.equal(tipoDePlano('MODULO I - PLANO DE TABIQUERIA 2° Y 3° PISO'), 'tabiqueria');
  assert.equal(tipoDePlano('PLANO DE PÓRTICO EJE E-E'), 'portico');
  assert.equal(tipoDePlano('Modulo 01 Primer Nivel'), 'planta');
});

test('entities keep their DWG id and are stored in meters relative to the first axes', () => {
  // Grilla A-B x 1-2 en metros con origen en (100, 200); una columna y un texto con su id.
  const burbuja = (x, y, n) => [{tipo: 'circulo', capa: 'EJES', centro: {x, y}, radio: 0.25, id: `c${n}${x}${y}`}, {tipo: 'texto', capa: 'EJES', centro: {x, y}, texto: n, id: `t${n}${x}${y}`}];
  const items = [
    ...burbuja(100, 197, '1'), ...burbuja(100, 211, '1'), ...burbuja(106, 197, '2'), ...burbuja(106, 211, '2'),
    ...burbuja(97, 200, 'A'), ...burbuja(109, 200, 'A'), ...burbuja(97, 208, 'B'), ...burbuja(109, 208, 'B'),
    {tipo: 'linea', capa: 'EJES', puntos: [{x: 100, y: 197.3}, {x: 100, y: 210.7}], id: 'e1'},
    {tipo: 'poli', capa: 'COLUMNAS', cerrada: true, puntos: [{x: 99.85, y: 199.85}, {x: 100.15, y: 199.85}, {x: 100.15, y: 200.15}, {x: 99.85, y: 200.15}], id: '2A0', color: 5},
    {tipo: 'texto', capa: 'TEXTO', centro: {x: 103, y: 204}, texto: 'PLANO DE CIMENTACION', alto: 0.3, id: 'tt'},
    {tipo: 'texto', capa: 'TEXTO', centro: {x: 103, y: 192}, texto: 'PLANO DE CIMENTACION', alto: 0.5, id: 'titulo'},
    {tipo: 'linea', capa: 'ROTULO', puntos: [{x: 300, y: 300}, {x: 310, y: 300}], id: 'lejos'},
  ];
  const inv = inventariar(items, {archivo: 'm.dwg', sha256: 'x', rol: 'estructura', proyecto: 'p', modulo: 'modulo-01'});
  assert.equal(inv.esquema, ESQUEMA.nombre);
  assert.equal(inv.vistas.length, 1);
  const v = inv.vistas[0];
  assert.deepEqual(v.ejes.map((e) => `${e.nombre}:${e.orientacion}:${e.posicion}`).sort(), ['1:x:0', '2:x:6', 'A:y:0', 'B:y:8']);
  const col = v.entidades.find((e) => e.id === '2A0');
  assert.deepEqual(col.puntos[0], {x: -0.15, y: -0.15}, 'relative to the 1/A crossing, in meters');
  assert.equal(col.color, 5);
  assert.equal(col.clase, null, 'interpretation comes later (step 3)');
  assert.equal(inv.sinVista, 2, 'the title block line and the title below the grid are outside the view');
  assert.equal(inv.validaciones.entidadesSinId, 0);
});
