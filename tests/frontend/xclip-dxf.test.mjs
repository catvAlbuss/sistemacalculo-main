// El recorte XCLIP se escribe en los DXF que guarda NovaCad y se vuelve a leer al abrirlos: sin esto
// el plano de ubicación se reabría con el terreno entero («el plano se destruye, sale como un mapa»).
import test from 'node:test';
import assert from 'node:assert/strict';
import {agregarRecortesAlDxf, recortesDelDxf} from '../../resources/js/etabs/visor/xclipDxf.js';

// DXF mínimo como lo escribe la librería: la inserción apunta (360) a un diccionario que no existe.
const DXF = [
  '0', 'SECTION', '2', 'HEADER', '9', '$ACADVER', '1', 'AC1014', '9', '$HANDSEED', '5', '2E0DB', '0', 'ENDSEC',
  '0', 'SECTION', '2', 'ENTITIES',
  '0', 'INSERT', '5', 'D8F3', '330', '1F', '360', 'D8F4', '100', 'AcDbEntity', '8', '0', '60', '0', '100', 'AcDbBlockReference', '2', 'UBICACION', '10', '100', '20', '50', '30', '0',
  '0', 'LINE', '5', 'D900', '330', '1F', '100', 'AcDbEntity', '8', '0', '100', 'AcDbLine', '10', '0', '20', '0', '30', '0', '11', '1', '21', '1', '31', '0',
  '0', 'ENDSEC',
  '0', 'SECTION', '2', 'OBJECTS', '0', 'DICTIONARY', '5', 'C', '330', '0', '100', 'AcDbDictionary', '0', 'ENDSEC', '0', 'EOF',
].join('\r\n');
const poli = [{x: 10, y: 20}, {x: 40, y: 20}, {x: 40, y: 35}, {x: 10, y: 35}];

test('el DXF guardado lleva el recorte y al abrirlo se recupera', () => {
  const salida = agregarRecortesAlDxf(DXF, [{h: 'D8F3', bloque: 'UBICACION', poli}]);
  assert.match(salida, /INSERT\r\n5\r\nD8F3\r\n102\r\n\{ACAD_XDICTIONARY\r\n360\r\nD8F4\r\n102\r\n\}\r\n330\r\n1F\r\n100/);
  assert.match(salida, /0\r\nDICTIONARY\r\n5\r\nD8F4\r\n/);
  assert.match(salida, /3\r\nACAD_FILTER\r\n360\r\n2E0DB\r\n/);
  assert.match(salida, /0\r\nSPATIAL_FILTER\r\n5\r\n2E0DC\r\n/);
  assert.match(salida, /\$HANDSEED\r\n5\r\n2E0DD\r\n/);          // dos handles nuevos
  assert.ok(salida.indexOf('SPATIAL_FILTER') < salida.lastIndexOf('ENDSEC'));
  assert.ok(salida.endsWith('0\r\nEOF'));
  assert.deepEqual(recortesDelDxf(salida), [{h: 'D8F3', bloque: 'UBICACION', poli}]);
  // El DXF de antes (sin filtro) no trae recortes; uno sin inserciones recortadas queda igual.
  assert.deepEqual(recortesDelDxf(DXF), []);
  assert.equal(agregarRecortesAlDxf(DXF, []), DXF);
});
