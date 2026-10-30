// Tablas de entrada por tramo de Losas aligeradas.
// Los nombres de los campos son los que lee DesingLosaController: por tramo (1..n) y por punto (1..3n,
// tres puntos por tramo: inicio, centro y final). Al cambiar el número de tramos se conservan los valores escritos.

const POINTS = ["Inicio", "Centro", "Final"];

// Una columna por tramo. [nombre del campo, etiqueta, unidad, valor de ejemplo]
const SPAN_ROWS = [
  ["Luz_Libre", "Luz libre", "m", 4],
  ["CMuerta", "Carga muerta", "t/m", 0.25],
  ["Cviva", "Carga viva", "t/m", 0.08],
  ["BASE", "Base", "cm", 40],
  ["ALTURA", "Altura de la losa", "cm", 20],
  ["EVB", "Ancho de vigueta b", "cm", 10],
  ["Mi", "Momento en el apoyo izquierdo Mi", "t·m", 0.6],
  ["Md", "Momento en el apoyo derecho Md", "t·m", 0.6],
  ["δ1", "Deflexión δ1", "cm", 0.5],
  ["δ2", "Deflexión δ2", "cm", 0.8],
  ["δ3", "Deflexión δ3", "cm", 0.5],
];

// Tres columnas por tramo. [nombre del campo, etiqueta, unidad, valores de ejemplo por punto]
const POINT_GROUPS = [
  ["Negativos (−)", [
    ["MomentoUltimo-", "Momento último Mu−", "t·m", [0.6, 0, 0.6]],
    ["Vu-", "Cortante último Vu−", "t", [1.2, 0.2, 1.2]],
    ["Tu-", "Torsión última Tu−", "t·m", [0, 0, 0]],
  ]],
  ["Positivos (+)", [
    ["MomentoUltimo+", "Momento último Mu+", "t·m", [0, 0.45, 0]],
    ["Vu+", "Cortante último Vu+", "t", [0, 0, 0]],
    ["Tu+", "Torsión última Tu+", "t·m", [0, 0, 0]],
  ]],
];

const el = (tag, attrs = {}, text = "") => {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  if (text) node.textContent = text;
  return node;
};

const input = (name, value, type = "number") =>
  el("input", type === "number" ? { type, step: "any", name, value, "aria-label": name } : { type, name, value, "aria-label": name });

const rowHeader = (label, unit) => el("th", { scope: "row" }, unit ? `${label} (${unit})` : label);

function buildSpanTable(table, spans, saved) {
  table.replaceChildren();
  const head = el("tr");
  head.append(el("th", { scope: "col" }, "Dato"));
  for (let t = 1; t <= spans; t++) head.append(el("th", { scope: "col" }, `Tramo ${t}`));
  table.append(el("thead"), el("tbody"));
  table.tHead.append(head);
  SPAN_ROWS.forEach(([name, label, unit, example]) => {
    const tr = el("tr");
    tr.append(rowHeader(label, unit));
    for (let t = 1; t <= spans; t++) {
      const td = el("td");
      td.append(input(name + t, saved.get(name + t) ?? example));
      tr.append(td);
    }
    table.tBodies[0].append(tr);
  });
}

function buildPointTable(table, spans, saved) {
  table.replaceChildren();
  table.append(el("thead"), el("tbody"));
  const spanRow = el("tr");
  const pointRow = el("tr");
  spanRow.append(el("th", { scope: "col", rowspan: 2 }, "Dato"));
  for (let t = 1; t <= spans; t++) {
    spanRow.append(el("th", { scope: "colgroup", colspan: 3, class: "sheet-span-group" }, `Tramo ${t}`));
    POINTS.forEach((point) => pointRow.append(el("th", { scope: "col" }, point)));
  }
  table.tHead.append(spanRow, pointRow);

  const body = table.tBodies[0];
  const ejes = el("tr");
  ejes.append(rowHeader("Eje"));
  for (let p = 1; p <= spans * 3; p++) {
    // Ejes de ejemplo: el inicio de cada tramo en su eje y el final en el siguiente.
    const span = Math.ceil(p / 3);
    const example = p % 3 === 1 ? String(span) : p % 3 === 0 ? String(span + 1) : "";
    const td = el("td");
    td.append(input("EJE" + p, saved.get("EJE" + p) ?? example, "text"));
    ejes.append(td);
  }
  body.append(ejes);

  POINT_GROUPS.forEach(([groupLabel, rows]) => {
    const group = el("tr", { class: "sheet-row-group" });
    group.append(el("th", { scope: "rowgroup", colspan: 1 + spans * 3 }, groupLabel));
    body.append(group);
    rows.forEach(([name, label, unit, examples]) => {
      const tr = el("tr");
      tr.append(rowHeader(label, unit));
      for (let p = 1; p <= spans * 3; p++) {
        const td = el("td");
        td.append(input(name + p, saved.get(name + p) ?? examples[(p - 1) % 3]));
        tr.append(td);
      }
      body.append(tr);
    });
  });
}

export function setupSpanTables({ countInput, spanTable, pointTable }) {
  const render = () => {
    const spans = Math.max(1, Math.min(20, parseInt(countInput.value, 10) || 1));
    const saved = new Map([...spanTable.querySelectorAll("input"), ...pointTable.querySelectorAll("input")].map((i) => [i.name, i.value]));
    buildSpanTable(spanTable, spans, saved);
    buildPointTable(pointTable, spans, saved);
  };
  countInput.addEventListener("input", render);
  render();
}
