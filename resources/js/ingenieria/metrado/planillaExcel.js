// Planilla de metrados en Excel con el formato del despacho (METRADOS_ESTRUCTURAS): hoja
// "Planilla" (ítem, descripción, und., elementos similares, dimensiones, veces, lon./área/
// vol./kg/und. y total por partida) y hoja "Resumen" (ítem, descripción, und., total).
// ExcelJS se carga solo al exportar (no pesa en la apertura del visor).

import {COLUMNAS_PLANILLA, filasPlanilla} from "./metrado.js";

// Mismas columnas y filas que la vista previa del panel (filasPlanilla).
const ANCHOS = [16, 58, 6, 8, 8, 8, 8, 8, 9, 9, 9, 10, 8, 11];
const COLUMNAS = COLUMNAS_PLANILLA.map((t, i) => [t, ANCHOS[i]]);

export async function planillaExcel(metrado, {ExcelJS = null, fecha = new Date(), modulo = ""} = {}) {
  const X = ExcelJS ?? (await import("exceljs")).default;
  const libro = new X.Workbook();
  libro.creator = "Agente NovaCad";
  const ws = libro.addWorksheet("Planilla", {views: [{state: "frozen", ySplit: 7}]});
  ws.columns = COLUMNAS.map(([, width]) => ({width}));
  const negrita = {bold: true};
  ws.addRow(["PLANILLA DE METRADOS"]).font = {bold: true, size: 14};
  ws.addRow(["Proyecto :", metrado.proyecto ?? ""]);
  ws.addRow(["Especialidad :", "ESTRUCTURAS"]);
  ws.addRow(["Módulo :", modulo || metrado.proyecto || ""]);
  ws.addRow(["Fecha :", fecha.toISOString().slice(0, 10)]);
  ws.addRow([]);
  const cabecera = ws.addRow(COLUMNAS.map(([t]) => t));
  cabecera.font = negrita;
  cabecera.eachCell((c) => { c.fill = {type: "pattern", pattern: "solid", fgColor: {argb: "FFD9E1F2"}}; c.border = {bottom: {style: "thin"}}; });
  const n = (v) => (typeof v === "number" ? Math.round(v * 10000) / 10000 : v);
  for (const f of filasPlanilla(metrado)) {
    const r = ws.addRow(f.celdas.map((v, i) => (i === 1 && f.tipo === "fila" ? `   ${v}` : n(v))));
    if (f.tipo === "titulo" || f.tipo === "partida") r.font = negrita;
    if (f.tipo === "sub") r.font = {italic: true, color: {argb: "FF6B7280"}};
    // Filas que el agente propuso con criterios del despacho (por confirmar) y las corregidas.
    if (f.propuesto) r.getCell(2).fill = {type: "pattern", pattern: "solid", fgColor: {argb: "FFDCE8FF"}};
    if (f.propuesto) r.getCell(2).note = `Propuesto por el agente: ${f.propuesto}`;
    if (f.corregido) r.getCell(2).fill = {type: "pattern", pattern: "solid", fgColor: {argb: "FFE3F6E8"}};
  }
  for (const nota of metrado.notas ?? []) ws.addRow([null, `Nota: ${nota}`]).font = {italic: true};

  const rs = libro.addWorksheet("Resumen");
  rs.columns = [{width: 16}, {width: 70}, {width: 7}, {width: 12}];
  rs.addRow(["RESUMEN DE METRADOS"]).font = {bold: true, size: 14};
  rs.addRow(["Proyecto :", metrado.proyecto ?? ""]);
  rs.addRow([]);
  rs.addRow(["ITEM", "DESCRIPCIÓN", "Und", "Total"]).font = negrita;
  for (const p of metrado.partidas) rs.addRow(p.titulo ? [p.item, p.descripcion] : [p.item, p.descripcion, p.und, n(p.total)]).font = p.titulo ? negrita : {};
  return libro;
}

// En el navegador: genera y descarga el .xlsx.
export async function descargarPlanilla(metrado, nombre = "METRADOS_ESTRUCTURAS.xlsx", opciones = {}) {
  const libro = await planillaExcel(metrado, opciones);
  const datos = await libro.xlsx.writeBuffer();
  if (typeof document === "undefined") return datos;
  const url = URL.createObjectURL(new Blob([datos], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}));
  const a = Object.assign(document.createElement("a"), {href: url, download: nombre});
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return datos;
}
