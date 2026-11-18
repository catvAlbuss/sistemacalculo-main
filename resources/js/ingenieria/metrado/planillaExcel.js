// Planilla de metrados en Excel con el formato del despacho: el mismo del metrado de muros de
// contención (resources/js/muros-contencion/metrados.js) y de la planilla del ingeniero del
// módulo de referencia XIV:
//  - fila 3: título "METRADO DE ESTRUCTURAS"; filas 5-10: proyecto, propietario, fecha,
//    especialidad, módulo, localidad, hecho por y revisado por;
//  - filas 14-15: cabecera (ITEM, DESCRIPCIÓN, Und, Elem. Simil., DIMENSIONES Largo/Ancho/Alto,
//    N° de Veces, METRADO Lon./Área/Vol./Kg./Und., Total) desde la columna C; la columna Q lleva
//    la observación (cuenta, criterio y nota) que la vista previa muestra igual;
//  - desde la fila 17, las filas de filasPlanilla con el color por nivel del ítem (02 morado,
//    02.01 rojo, 02.01.02 azul, 02.01.02.01 verde si tiene partidas debajo, el resto negro).
// Hoja "Resumen": ítem, descripción, und. y total. ExcelJS se carga solo al exportar.

import {COLUMNAS_PLANILLA, filasPlanilla} from "./metrado.js";

export const FILA_CABECERA = 14;
export const FILA_DATOS = 17;
export const COLUMNA_INICIAL = 3; // C: la planilla del despacho deja A y B libres
const ANCHOS = [15, 50, 6, 6, 8, 8, 8, 8, 8, 8, 8, 10, 8, 12, 70];
const ARIAL = {name: "Arial", size: 10};
const BORDE = {top: {style: "thin"}, bottom: {style: "thin"}, left: {style: "thin"}, right: {style: "thin"}};
const COLOR_NIVEL = {1: "FF800080", 2: "FFFF0000", 3: "FF0000FF", 4: "FF008000"};
const letra = (i) => String.fromCharCode(64 + COLUMNA_INICIAL + i); // índice de celda → letra (0 → C)

// datos: los del proyecto (entidad, proyecto, especialista, distrito…) para la cabecera.
export async function planillaExcel(metrado, {ExcelJS = null, fecha = new Date(), modulo = "", datos = {}} = {}) {
  const X = ExcelJS ?? (await import("exceljs")).default;
  const libro = new X.Workbook();
  libro.creator = "Agente NovaCad";
  const ws = libro.addWorksheet("Metrado", {views: [{state: "frozen", ySplit: FILA_CABECERA + 1}]});
  ws.columns = [{width: 4}, {width: 4}, ...ANCHOS.map((width) => ({width}))];

  // ---- Título y datos del proyecto ----
  const fin = letra(13); // P
  ws.getRow(2).height = 18;
  ws.mergeCells(`C3:${fin}3`);
  Object.assign(ws.getCell("C3"), {value: "METRADO DE ESTRUCTURAS", font: {...ARIAL, size: 12, bold: true}, alignment: {horizontal: "center", vertical: "middle"}, border: BORDE});
  const dato = (celda, texto) => Object.assign(ws.getCell(celda), {value: texto, font: ARIAL, alignment: {vertical: "middle", horizontal: "left", wrapText: true}});
  ws.mergeCells("C5:C6"); dato("C5", "Proyecto:");
  ws.mergeCells(`D5:${fin}6`); dato("D5", datos.proyecto || metrado.proyecto || "");
  ws.getRow(5).height = 30; ws.getRow(6).height = 30;
  dato("C7", "Propietario:"); dato("D7", datos.entidad ?? "");
  dato("L7", "Hecho por:"); ws.mergeCells(`M7:${fin}7`); dato("M7", datos.especialista ?? "");
  dato("C8", "Fecha:"); dato("D8", fecha.toLocaleDateString("es-PE"));
  dato("L8", "Revisado por:"); ws.mergeCells(`M8:${fin}8`); dato("M8", "");
  dato("C9", "Especialidad:"); dato("D9", "ESTRUCTURAS");
  dato("C10", "Módulo:"); dato("D10", modulo || metrado.proyecto || "");
  dato("C11", "Localidad:"); dato("D11", [datos.localidad, datos.distrito, datos.provincia, datos.region].filter(Boolean).join(" - "));

  // ---- Cabecera (dos filas, con DIMENSIONES y METRADO agrupados) ----
  const h1 = FILA_CABECERA, h2 = FILA_CABECERA + 1;
  const cab = {font: {...ARIAL, bold: true}, alignment: {horizontal: "center", vertical: "middle", wrapText: true}, border: BORDE, fill: {type: "pattern", pattern: "solid", fgColor: {argb: "FFE7E6E6"}}};
  for (const [i, t] of COLUMNAS_PLANILLA.entries()) {
    if (i >= 4 && i <= 6) continue; // DIMENSIONES
    if (i >= 8 && i <= 12) continue; // METRADO
    ws.mergeCells(`${letra(i)}${h1}:${letra(i)}${h2}`);
    Object.assign(ws.getCell(`${letra(i)}${h1}`), {value: t === "N° de Veces" ? "Nº de Veces" : t, ...cab});
  }
  ws.mergeCells(`${letra(4)}${h1}:${letra(6)}${h1}`); Object.assign(ws.getCell(`${letra(4)}${h1}`), {value: "DIMENSIONES", ...cab});
  ws.mergeCells(`${letra(8)}${h1}:${letra(12)}${h1}`); Object.assign(ws.getCell(`${letra(8)}${h1}`), {value: "METRADO", ...cab});
  for (const i of [4, 5, 6, 8, 9, 10, 11, 12]) Object.assign(ws.getCell(`${letra(i)}${h2}`), {value: COLUMNAS_PLANILLA[i], ...cab});
  ws.getRow(h1).height = 18; ws.getRow(h2).height = 18;

  // ---- Filas: las mismas de la vista previa ----
  const filas = filasPlanilla(metrado);
  const conHijos = new Set(metrado.partidas.filter((p) => !p.titulo).map((p) => p.item.split(".").slice(0, -1).join(".")));
  const n = (v) => (typeof v === "number" ? Math.round(v * 10000) / 10000 : v);
  let fila = FILA_DATOS;
  for (const f of filas) {
    const r = ws.getRow(fila++);
    f.celdas.forEach((v, i) => {
      const c = r.getCell(COLUMNA_INICIAL + i);
      c.value = i === 1 && f.tipo === "fila" ? `   ${v}` : n(v);
      c.border = BORDE;
      c.font = ARIAL;
      c.alignment = {vertical: "middle", horizontal: i <= 1 || i === 14 ? "left" : "right", wrapText: i === 1 || i === 14};
      if (typeof v === "number" && i >= 3) c.numFmt = i === 3 || i === 7 ? "0" : i === 10 && f.acero ? "0.000" : "0.00";
    });
    const item = f.celdas[0];
    if (f.tipo === "titulo") {
      const nivel = String(item).split(".").length;
      const color = nivel === 4 && !conHijos.has(item) ? "FF000000" : COLOR_NIVEL[nivel] ?? "FF000000";
      for (const i of [0, 1]) r.getCell(COLUMNA_INICIAL + i).font = {...ARIAL, bold: true, color: {argb: color}};
    }
    if (f.tipo === "partida") for (const i of [0, 1, 2, 13]) r.getCell(COLUMNA_INICIAL + i).font = {...ARIAL, bold: true};
    if (f.tipo === "sub") f.celdas.forEach((v, i) => { r.getCell(COLUMNA_INICIAL + i).font = {...ARIAL, size: 9, italic: true, color: {argb: "FF6B7280"}}; });
    // Observación: cuenta, criterio y nota, en letra chica y ajustada a la celda.
    if (f.celdas[14]) r.getCell(COLUMNA_INICIAL + 14).font = {...ARIAL, size: 8, italic: true, color: {argb: "FF4B5563"}};
    // Filas que el agente propuso con criterios del despacho (por confirmar) y las corregidas.
    const desc = r.getCell(COLUMNA_INICIAL + 1);
    if (f.propuesto) { desc.fill = {type: "pattern", pattern: "solid", fgColor: {argb: "FFDCE8FF"}}; desc.note = `Propuesto por el agente: ${f.propuesto}`; }
    if (f.corregido) desc.fill = {type: "pattern", pattern: "solid", fgColor: {argb: "FFE3F6E8"}};
  }
  fila++;
  for (const nota of metrado.notas ?? []) Object.assign(ws.getCell(`D${fila++}`), {value: `Nota: ${nota}`, font: {...ARIAL, italic: true}});

  // ---- Resumen ----
  const rs = libro.addWorksheet("Resumen");
  rs.columns = [{width: 16}, {width: 70}, {width: 7}, {width: 12}];
  rs.addRow(["RESUMEN DE METRADOS"]).font = {...ARIAL, bold: true, size: 12};
  rs.addRow(["Proyecto :", datos.proyecto || metrado.proyecto || ""]);
  rs.addRow([]);
  rs.addRow(["ITEM", "DESCRIPCIÓN", "Und", "Total"]).font = {...ARIAL, bold: true};
  for (const p of metrado.partidas) rs.addRow(p.titulo ? [p.item, p.descripcion] : [p.item, p.descripcion, p.und, n(p.total)]).font = {...ARIAL, bold: Boolean(p.titulo)};
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
