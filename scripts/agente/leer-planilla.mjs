// Lector de la planilla de metrados del despacho (formato METRADOS_ESTRUCTURAS: ítem en C,
// descripción en D, und. en E, elem. simil. F, largo G, ancho H, alto I, n° de veces J,
// lon./área/vol./kg./und. K–O y total en P). Devuelve, por hoja, las partidas con sus filas.

import ExcelJS from 'exceljs';

const valor = (c) => {
  const x = c?.value;
  if (x === null || x === undefined) return null;
  if (typeof x === 'object') {
    if (x.result !== undefined) return x.result;
    if (x.richText) return x.richText.map((t) => t.text).join('');
    if (x.text) return x.text;
    return null;
  }
  return x;
};
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v.trim()) ? Number(v) : null);
const texto = (v) => (v === null || v === undefined ? '' : String(v).replace(/\s+/g, ' ').trim());

export function partidasDeHoja(ws) {
  const partidas = [];
  let actual = null;
  ws.eachRow((r, i) => {
    if (i < 12) return;
    const item = texto(valor(r.getCell(3)));
    const desc = texto(valor(r.getCell(4)));
    const und = texto(valor(r.getCell(5))).toLowerCase();
    const total = num(valor(r.getCell(16)));
    if (/^\d{2}(\.\d{2})*$/.test(item)) {
      actual = {item, descripcion: desc, und, total, filas: []};
      partidas.push(actual);
      return;
    }
    if (!actual || !desc) return;
    const celdas = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((k) => num(valor(r.getCell(k))));
    const [simil, largo, ancho, alto, veces, lon, area, vol, kg, unds] = celdas;
    const parcial = [lon, area, vol, kg, unds].find((v) => v !== null) ?? null;
    if (celdas.every((v) => v === null)) { actual.filas.push({descripcion: desc, grupo: true}); return; }
    actual.filas.push({descripcion: desc, und, simil, largo, ancho, alto, veces, lon, area, vol, kg, unds, parcial});
  });
  // Solo partidas con total (las de título no lo tienen).
  return partidas.filter((p) => p.total !== null || p.filas.length);
}

export async function leerPlanilla(ruta) {
  const libro = new ExcelJS.Workbook();
  await libro.xlsx.readFile(ruta);
  const hojas = {};
  for (const ws of libro.worksheets) {
    if (/resumen|general/i.test(ws.name)) continue;
    hojas[ws.name] = partidasDeHoja(ws);
  }
  return hojas;
}
