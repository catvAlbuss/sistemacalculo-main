// Planilla de metrados en Excel con el formato del despacho (METRADOS_ESTRUCTURAS): hoja
// "Planilla" (ítem, descripción, und., elementos similares, dimensiones, veces, lon./área/
// vol./kg/und. y total por partida) y hoja "Resumen" (ítem, descripción, und., total).
// ExcelJS se carga solo al exportar (no pesa en la apertura del visor).

const COLUMNAS = [
  ["ITEM", 16], ["DESCRIPCIÓN", 58], ["Und", 6], ["Elem. Simil.", 8], ["Largo", 8], ["Ancho", 8], ["Alto", 8],
  ["N° de Veces", 8], ["Lon.", 9], ["Área", 9], ["Vol.", 9], ["Kg.", 10], ["Und.", 8], ["Total", 11],
];

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
  const n = (v) => (v === null || v === undefined ? null : Math.round(v * 10000) / 10000);
  for (const p of metrado.partidas) {
    if (p.titulo) { ws.addRow([p.item, p.descripcion]).font = negrita; continue; }
    const r = ws.addRow([p.item, p.descripcion, p.und, null, null, null, null, null, null, null, null, null, null, n(p.total)]);
    r.font = negrita;
    for (const f of p.filas) {
      if (f.kgm !== undefined) {
        // Acero: (longitud + gancho) × varillas × simil → Lon.; × kg/m → Kg.
        ws.addRow([null, `   ${f.descripcion}`, "kg", f.simil, n(f.longitud), n(f.gancho), null, f.varillas, n(f.metros), null, n(f.kgm), n(f.parcial), null, null]);
      } else {
        const fila = [null, `   ${f.descripcion}`, p.und, f.simil, n(f.largo), n(f.ancho), n(f.alto), f.veces, null, null, null, null, null, null];
        const col = {m: 8, m2: 9, m3: 10, kg: 11, und: 12}[p.und] ?? 10;
        fila[col] = n(f.parcial);
        ws.addRow(fila);
      }
    }
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
