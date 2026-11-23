// Lector genérico de la planilla de metrados del ingeniero: cada formato se prueba con una
// planilla sintética generada aquí (sin datos de clientes).
import test from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import {
  leerPlanillaMetrado, categoriasDelIngeniero, categoriaPorDescripcion, moduloDeTitulo, usaCodigoDelDespacho,
} from '../../scripts/agente/planilla-metrado.mjs';

// Escribe y vuelve a leer el libro (como si viniera de un .xlsx real).
async function recargar(libro) {
  const otro = new ExcelJS.Workbook();
  await otro.xlsx.load(await libro.xlsx.writeBuffer());
  return otro;
}

// Hoja con el encabezado de dos filas del despacho a partir de la columna `c0`.
// `filas`: [item, descripcion, und, {lon, area, vol, kg, und}, subtotal, total]
function hojaMetrado(libro, nombre, {c0 = 1, filaEnc = 12, subtotal = false, modulo = null} = {}, filas = []) {
  const ws = libro.addWorksheet(nombre);
  ws.getCell(1, c0).value = 'METRADO DE ESTRUCTURAS';
  if (modulo !== null) { ws.getCell(filaEnc - 3, c0).value = 'Modulo        :'; ws.getCell(filaEnc - 3, c0 + 1).value = modulo; }
  const enc1 = ['ITEM', 'DESCRIPCIÓN', 'Und', 'Elem. Simil.', 'DIMENSIONES', 'DIMENSIONES', 'DIMENSIONES', 'Nº de Veces', 'METRADO', 'METRADO', 'METRADO', 'METRADO', 'METRADO', ...(subtotal ? ['Sub Total'] : []), 'Total'];
  const enc2 = ['ITEM', 'DESCRIPCIÓN', 'Und', 'Elem. Simil.', 'Largo', 'Ancho', 'Alto', 'Nº de Veces', 'Lon.', 'Área', 'Vol.', 'Kg.', 'Und.', ...(subtotal ? ['Sub Total'] : []), 'Total'];
  enc1.forEach((t, k) => { ws.getCell(filaEnc, c0 + k).value = t; ws.getCell(filaEnc + 1, c0 + k).value = enc2[k]; });
  const col = {lon: 8, area: 9, vol: 10, kg: 11, und: 12};
  const cSub = c0 + 13, cTot = c0 + (subtotal ? 14 : 13);
  let r = filaEnc + 2;
  for (const [item, desc, und, met = {}, sub = null, tot = null] of filas) {
    if (item) ws.getCell(r, c0).value = item;
    if (desc) ws.getCell(r, c0 + 1).value = desc;
    if (und) ws.getCell(r, c0 + 2).value = und;
    for (const [k, v] of Object.entries(met)) ws.getCell(r, c0 + col[k]).value = v;
    if (sub !== null) ws.getCell(r, subtotal ? cSub : cTot).value = sub;
    if (tot !== null) ws.getCell(r, cTot).value = tot;
    r++;
  }
  return ws;
}

test('formato del despacho: una hoja por módulo, categorías por código (como antes)', async () => {
  const libro = new ExcelJS.Workbook();
  libro.addWorksheet('RESUMEN METRADOS').getCell('A14').value = 'ITEM';
  hojaMetrado(libro, 'Modulo 2', {c0: 3, filaEnc: 14, modulo: 'Modulo 2'}, [
    ['02', 'ESTRUCTURAS'],
    ['02.02.03.01', "CONCRETO EN CIMIENTO CORRIDO, F'C =100KG/CM2 + 30%P.G.", 'm3', {}, null, 5.5],
    ['', 'MODULO 02', 'm3', {vol: 5.5}],
    ['02.02.03.02', 'ENCOFRADO Y DESENCOFRADO EN CIMIENTO CORRIDO', 'm2', {}, null, 26],
    ['02.03.06.01.01', 'CONCRETO EN COLUMNAS F´C=210 KG/CM2', 'm3', {}, null, 4.5],
    ['02.03.06.01.02', 'ENCOFRADO Y DESENCOFRADO EN COLUMNAS F´C=210 KG/CM2', 'm2', {}, null, 40],
    ['02.03.07.01.03', 'ACERO EN VIGAS F´C=210 KG/CM2 CON F´Y=4200 KG/CM2', 'kg', {}, null, 900],
    ['02.03.11.04', 'LADRILLO HUECO DE ARCILLA RAYADO DE 15X30X30 CM P/TECHO', 'und', {}, null, 300],
  ]);
  hojaMetrado(libro, 'Modulo 3', {c0: 3, filaEnc: 14}, [['02.03.06.01.01', 'CONCRETO EN COLUMNAS', 'm3', {}, null, 99]]);
  const l = leerPlanillaMetrado(await recargar(libro), {modulo: 2});
  assert.equal(l.hoja, 'Modulo 2');
  assert.equal(l.formato, 'un módulo por hoja');
  assert.equal(l.totales.get('02.02.03.01'), 5.5);
  assert.equal(l.totales.get('02.03.07.01.03'), 900);
  const c = categoriasDelIngeniero(l);
  assert.equal(c.criterio, 'código');
  assert.equal(c.totales.get('Cimiento corrido: concreto'), 5.5);
  assert.equal(c.totales.get('Columnas: encofrado'), 40);
  assert.equal(c.totales.get('Vigas: acero'), 900);
  assert.equal(c.totales.get('Ladrillo de techo'), 300);
});

test('hoja de un solo módulo con otra codificación: columnas por encabezado y categorías por descripción', async () => {
  const libro = new ExcelJS.Workbook();
  hojaMetrado(libro, 'Hoja1', {modulo: 11}, [
    ['02.02.01', 'CIMIENTO CORRIDO'],
    ['02.02.01.01', "CONCRETO EN CIMIENTO CORRIDO f'c =100kgf/cm2", 'm3', {}, null, 24.9],
    ['02.02.01.02', 'ENCOFRADO EN CIMIENTO CORRIDO', 'm2', {}, null, 124.5],
    ['02.02.01.03', 'DESENCOFRADO EN CIMIENTO CORRIDO', 'm2', {}, null, 124.5],
    ['02.03.04.01.01', 'CONCRETO EN COLUMNAS F´C=280 KG/CM2', 'm3', {}, null, 21.8],
    ['02.03.04.01.04', 'ACERO EN COLUMNAS F´C=280 KG/CM2 CON F´Y=4200 KG/CM2', 'kg', {}, null, 8647.8],
    ['02.03.04.01.05', "CURADO DEL CONCRETO EN COLUMNAS F'C = 280KG/CM2", 'm2', {}, null, 217.9],
    ['02.03.05.01.01', 'CONCRETO EN VIGAS  F´C=280 KG/CM2', 'm3', {}, null, 48.5],
    ['02.03.06.01.01', 'CONCRETO EN COLUMNETAS F´C=175 KG/CM2', 'm3', {}, null, 20.7],
    ['02.03.07.01', 'CONCRETO EN VIGUETAS  F´C=175 KG/CM2', 'm3', {}, null, 3.1],
    ['02.03.08.01.01', 'CONCRETO EN LOSAS ALIGERADAS  F´C=210 KG/CM2', 'm3', {}, null, 30],
    ['02.03.08.01.05', 'LADRILLO HUECO DE ARCILLA RAYADO DE 15X30X30 CM P/TECHO EN LOSA', 'und', {}, null, 800],
    ['02.03.08.01.06', 'LADRILLO HUECO DE ARCILLA RAYADO DE 20X30X30 CM P/TECHO EN LOSA', 'und', {}, null, 200],
    ['02.03.02.01', 'CONCRETO EN VIGA DE CIMENTACIÓN  F´C=280 KG/CM2', 'm3', {}, null, 23],
    ['02.04.01.01', 'ARMADURA DE CORREA METÁLICA DE 40X80X2,5MM', 'm', {}, null, 101.6],
    ['02.04.01.02', 'MONTAJE DE CORREA METÁLICA DE 40X80X2,5MM', 'm', {}, null, 101.6],
  ]);
  const l = leerPlanillaMetrado(await recargar(libro), {modulo: 11});
  assert.equal(l.hoja, 'Hoja1');
  assert.equal(l.formato, 'un módulo por hoja');
  const c = categoriasDelIngeniero(l);
  assert.equal(c.criterio, 'descripción', 'los códigos no son los del despacho (02.03.04 = columnas)');
  assert.equal(c.totales.get('Cimiento corrido: concreto'), 24.9);
  assert.equal(c.totales.get('Cimiento corrido: encofrado'), 124.5, 'el desencofrado aparte no se suma');
  assert.equal(c.totales.get('Columnas: concreto'), 21.8);
  assert.equal(c.totales.get('Columnas: acero'), 8647.8);
  assert.equal(c.totales.get('Vigas: concreto'), 48.5);
  assert.equal(c.totales.get('Columnetas: concreto'), 20.7);
  assert.equal(c.totales.get('VSa: concreto'), 3.1);
  assert.equal(c.totales.get('Losa aligerada: concreto'), 30);
  assert.equal(c.totales.get('Ladrillo de techo'), 1000, 'los dos tamaños de ladrillo se suman');
  assert.equal(c.totales.get('Correas metálicas'), 101.6, 'armado sí, montaje no');
  assert.ok(!c.totales.has('Placas: concreto'));
  assert.ok(c.sinCategoria.some((p) => /VIGA DE CIMENTACI/.test(p.descripcion)), 'viga de cimentación queda sin categoría');
});

test('una hoja con varios módulos: subtotal por título, partes A/B, niveles e ítems sin desglose', async () => {
  const libro = new ExcelJS.Workbook();
  libro.addWorksheet('Param', {state: 'hidden'}).getCell('A1').value = 'ITEM';
  hojaMetrado(libro, 'Metrado', {c0: 3, filaEnc: 14, subtotal: true}, [
    ['02.02.01.01', 'CONCRETO EN CIMIENTO CORRIDO', 'm3', {}, null, 30],
    ['', 'MODULO 01', null, {}, 10],
    ['', 'Eje 1', 'm3', {vol: 10}],
    ['', 'MODULO 02-A', null, {}, 7],
    ['', 'Eje 2', 'm3', {vol: 7}],
    ['', 'MODULO 02-B', null, {}, 3],
    ['', 'Eje 3', 'm3', {vol: 3}],
    ['', 'MODULO 03'],
    ['', 'Eje 4', 'm3', {vol: 6}],
    ['', 'Eje 5 (descuento)', 'm3', {vol: -1}],
    // Ítems con coma en el código y módulo partido por niveles (subtotal solo en el primero).
    ['02,03,05,01,01', 'CONCRETO EN VIGAS F´C=280 KG/CM2', 'm3', {}, null, 50],
    ['', 'MODULO I(PRIMER NIVEL)', null, {}, 20],
    ['', 'V-101', 'm3', {vol: 12}],
    ['', 'MODULO I (SEGUNDO NIVEL)'],
    ['', 'V-201', 'm3', {vol: 8}],
    ['', 'MODULO III', null, {}, 15],
    ['', 'V-101', 'm3', {vol: 15}],
    // Unidad mal escrita: el detalle está en otra columna.
    ['02.03.05.01.02', 'ENCOFRADO EN VIGAS', 'kg', {}, null, 0],
    ['', 'MODULO 01'],
    ['', 'V-101', 'm3', {area: 40}],
    ['', 'MODULO 03'],
    ['', 'V-101', 'm3', {area: 25}],
    // Sin desglose por módulo: no se adivina.
    ['02.05.01.01', 'JUNTA DE TECNOPOR', 'm', {}, null, 80],
  ]);
  const libroLeido = await recargar(libro);
  const m1 = leerPlanillaMetrado(libroLeido, {modulo: 1});
  assert.equal(m1.hoja, 'Metrado');
  assert.equal(m1.formato, 'varios módulos en una hoja');
  assert.equal(m1.totales.get('02.02.01.01'), 10);
  assert.equal(m1.totales.get('02.03.05.01.01'), 20, 'el subtotal del módulo partido por niveles');
  assert.equal(m1.totales.get('02.03.05.01.02'), 40, 'sin subtotal: suma del detalle en la columna con números');
  assert.ok(!m1.totales.has('02.05.01.01'));
  assert.ok(m1.avisos.some((a) => /02\.05\.01\.01 sin desglose/.test(a)));
  const m2 = leerPlanillaMetrado(libroLeido, {modulo: 2});
  assert.equal(m2.totales.get('02.02.01.01'), 10, '02-A + 02-B');
  assert.ok(!m2.totales.has('02.03.05.01.01'), 'el módulo 2 no tiene vigas en esta planilla');
  const m3 = leerPlanillaMetrado(libroLeido, {modulo: 3});
  assert.equal(m3.totales.get('02.02.01.01'), 5, 'sin subtotal: detalle con descuentos');
  assert.equal(m3.totales.get('02.03.05.01.01'), 15);
  assert.equal(m3.totales.get('02.03.05.01.02'), 25);
  const c = categoriasDelIngeniero(m3);
  assert.equal(c.totales.get('Vigas: concreto'), 15);
  assert.equal(c.totales.get('Vigas: encofrado'), 25);
  assert.match(leerPlanillaMetrado(libroLeido, {modulo: 7}).error, /no tiene secciones del módulo 7/);
});

test('un título suelto de otro módulo no vuelve la hoja de varios módulos', async () => {
  const libro = new ExcelJS.Workbook();
  const filas = [];
  for (let k = 1; k <= 6; k++) filas.push([`02.03.0${k}.01`, `CONCRETO EN COLUMNAS ${k}`, 'm3', {}, null, k], ['', 'MODULO 7', 'm3', {vol: k}]);
  filas.push(['02.03.09.01', 'CONCRETO EN COLUMNAS 9', 'm3', {}, null, 9], ['', 'MODULO 8', 'm3', {vol: 9}]);
  hojaMetrado(libro, 'Metrado', {modulo: 'Modulo 7'}, filas);
  const l = leerPlanillaMetrado(await recargar(libro), {modulo: 7});
  assert.equal(l.formato, 'un módulo por hoja');
  assert.equal(l.totales.get('02.03.09.01'), 9);
});

test('sin encabezados de metrado: no se reconoce (no se inventa)', async () => {
  const libro = new ExcelJS.Workbook();
  const ws = libro.addWorksheet('Hoja1');
  ws.getCell('A1').value = 'Presupuesto'; ws.getCell('A3').value = '02.01'; ws.getCell('B3').value = 12;
  assert.match(leerPlanillaMetrado(await recargar(libro), {modulo: 1}).error, /sin hoja de metrado/);
  assert.match(leerPlanillaMetrado(await recargar(libro), {hoja: 'Otra'}).error, /no existe la hoja/);
});

test('títulos de módulo y categorías por descripción', () => {
  assert.deepEqual(moduloDeTitulo('MODULO 01'), {numero: 1, parte: null});
  assert.deepEqual(moduloDeTitulo('MÓDULO 02-A'), {numero: 2, parte: 'A'});
  assert.deepEqual(moduloDeTitulo('MODULO II-A (SEGUNDO NIVEL)'), {numero: 2, parte: 'A'});
  assert.deepEqual(moduloDeTitulo('MODULO 01 Primer Nivel'), {numero: 1, parte: null});
  assert.deepEqual(moduloDeTitulo('   Modulo 5'), {numero: 5, parte: null});
  assert.equal(moduloDeTitulo('MODULO 3 INICIAL Terminado'), null);
  assert.equal(moduloDeTitulo('Zapata Aislada 01'), null);
  assert.equal(categoriaPorDescripcion('ENCOFRADO Y DESENCOFRADO EN PLACAS F´C=210 KG/CM2', 'm2'), 'Placas: encofrado');
  assert.equal(categoriaPorDescripcion('DESENCOFRADO EN PLACAS F´C=280 KG/CM2', 'm2'), null);
  assert.equal(categoriaPorDescripcion('ACERO PARA CANALETA EN TECHO', 'kg'), 'Canaleta: acero');
  assert.equal(categoriaPorDescripcion('CANALETA PLUVIAL METALICA 80X240', 'm'), null);
  assert.equal(categoriaPorDescripcion('CONCRETO EN SOLADOS DE ZAPATAS E=0.10m', 'm2'), 'Solado');
  assert.equal(categoriaPorDescripcion('CONCRETO EN ZAPATA DE MUROS DE CONTENCIÓN', 'm3'), null);
  assert.equal(categoriaPorDescripcion('ACERO EN ZAPATAS F´Y=4200 KG/CM2', 'kg'), 'Cimentación: acero');
  assert.equal(categoriaPorDescripcion('RELLENO Y COMPACTADO CON MATERIAL PRESTAMO E=20 CM PARA PISO', 'm2'), null, 'préstamo en m2 no es comparable');
  assert.equal(categoriaPorDescripcion('RELLENO CON MATERIAL PRESTAMO AFIRMADO', 'm3'), 'Relleno con material de préstamo');
  assert.equal(categoriaPorDescripcion('EXCAVACION DE ZANJAS PARA ZAPATA EN ROCA', 'm3'), null, 'la excavación puede venir partida por terreno');
  assert.equal(categoriaPorDescripcion('CONCRETO EN LOSA MACIZA', 'm3'), null);
  assert.equal(usaCodigoDelDespacho([
    {item: '02.03.06.01.01', descripcion: 'CONCRETO EN COLUMNAS', unidad: 'm3'},
    {item: '02.03.07.01.01', descripcion: 'CONCRETO EN VIGAS', unidad: 'm3'},
  ]), true);
  assert.equal(usaCodigoDelDespacho([
    {item: '02.03.05.01.01', descripcion: 'CONCRETO EN VIGAS', unidad: 'm3'},
    {item: '02.02.01.01', descripcion: 'CONCRETO EN CIMIENTO CORRIDO', unidad: 'm3'},
  ]), false);
});
