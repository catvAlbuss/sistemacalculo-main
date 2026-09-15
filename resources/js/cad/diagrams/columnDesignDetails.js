/**
 * Export del "Details" de diseño de columnas, ESPEJO del de ETABS.
 *
 * Reproduce las nueve tablas de ETABS ▸ Concrete Frame Design ▸ Details con
 * los MISMOS títulos, las MISMAS columnas, las MISMAS unidades y en inglés,
 * para que los dos papeles se puedan superponer. Referencia: el Details de
 * C2 (Story1) del modelo `01.MODULO 01 (1) columna L actualizado`.
 *
 * UNIDADES DE ETABS EN ESTE REPORTE — no son las del resto de la app:
 *   materiales   kgf/mm²   (210 kg/cm² = 2.1 kgf/mm²;  4200 = 42)
 *   fuerzas      tonf, tonf-m
 *   longitudes   mm
 *   Av/s         mm²/m
 *
 * DE DÓNDE SALE CADA DATO (verificado contra lo que el modal ya muestra, que es
 * la fuente de verdad; leerlo de otro lado dejó media tabla en N/C la primera
 * vez):
 *   col.geometryDisplay      b, h, fc, fy, cover, longBarDiameter, shape,
 *                            flangeThick, webThick, transReinf
 *   col.geometry.slenderness ec (Pa), lu
 *   col.geometry             confineBarDiameter, code
 *   col.surface              bars[], beta1
 *   col.frameLength          longitud del elemento (m)
 *   check.slenderness.M2/.M3 cm, deltaNs, m2Min, mc, slendernessRatio
 *   col.shear.shearV2/.shearV3  ve, vc, vcZero, vsProvided, avProvided
 *
 * `dc` se calcula: recubrimiento libre + Ø estribo + Ø longitudinal/2. En C2 da
 * 22.5 + 10 + 10 = 42.5 mm, exactamente lo que reporta ETABS.
 *
 * LO QUE NO CALCULAMOS lleva los códigos del propio ETABS (N/A no aplica,
 * N/C no calculado, N/N no necesario), que van explicados en el bloque de Notas
 * al pie igual que en su reporte.
 *
 * SALIDA: PDF por el diálogo de impresión del navegador. Sin dependencias.
 */

const TONF = 9806.65;        // N → tonf   y   N·m → tonf-m
const PA_A_KGFMM2 = 9.80665e6; // Pa → kgf/mm²
const PHI_CORTE = 0.75;      // el mismo que el modal usa al mostrar ΦVc/ΦVs

const NA = "N/A";
const NC = "N/C";
const NN = "N/N";

function num(v, d = 4, code = NC) {
  const x = Number(v);
  return Number.isFinite(x) ? x.toFixed(d) : code;
}

/** Como ETABS: sin ceros de relleno cuando el valor es entero (1, no 1.0000). */
function limpio(v, d = 4, code = NC) {
  const x = Number(v);
  if (!Number.isFinite(x)) return code;
  return Number.isInteger(x) ? String(x) : x.toFixed(d);
}

const celdas = (arr, th = false) =>
  `<tr>${arr.map((c) => `<${th ? "th" : "td"}>${c}</${th ? "th" : "td"}>`).join("")}</tr>`;

/** Tabla centrada con título arriba, como las de ETABS. */
function tablaEtabs(titulo, heads, filas, ancho = null) {
  return `<div class="bloque">
    <p class="tit">${titulo}</p>
    <table${ancho ? ` style="width:${ancho}"` : ""}>
      <thead>${celdas(heads, true)}</thead>
      <tbody>${filas.join("")}</tbody>
    </table>
  </div>`;
}

/**
 * Cm solo puede estar entre 0.4 y 1.0 (ACI 318-14 6.6.4.5.3a). Si llega algo
 * fuera de ese rango no es un Cm: se marca en vez de imprimirlo como si lo
 * fuera. Apareció un 44.0 en un reporte y un número imposible enmascarado de
 * válido es peor que un aviso.
 */
function cmValido(v) {
  const x = Number(v);
  if (!Number.isFinite(x)) return NC;
  if (x < 0.4 || x > 1.0) return `${x.toFixed(4)} (?)`;
  return x.toFixed(6);
}

function textoSeccion(g) {
  if (!g) return NC;
  const f = (v) => Number(v || 0).toFixed(0);
  if (g.shape === "circular") return `D ${f(g.diameter)}`;
  if (g.flangeThick || g.webThick) return `${f(g.flangeThick * 10)}`; // espesor de pata, en mm
  return `${f(g.b * 10)} x ${f(g.h * 10)}`;
}

/** Área bruta en cm². El motor no la devuelve y sin ella no hay Rebar %. */
function areaBruta(g) {
  const b = Number(g?.b) || 0;
  const h = Number(g?.h) || 0;
  if (g?.shape === "circular") {
    const d = Number(g.diameter) || 0;
    return (Math.PI * d * d) / 4;
  }
  const tf = Number(g?.flangeThick) || 0;
  const tw = Number(g?.webThick) || 0;
  if (tf > 0 && tw > 0) return b * tf + (h - tf) * tw;
  return b * h;
}

/**
 * Factores φ del código. ΦVs, ΦVjoint y Ω0 son constantes del reglamento para
 * pórticos especiales (ACI 318-14 §21.2.4 y ASCE 7), los mismos que ETABS
 * imprime; no dependen de nuestro cálculo.
 */
function phiDelCodigo(code) {
  const esE060 = String(code || "E060").toUpperCase().startsWith("E");
  return esE060
    ? { T: 0.9, CTied: 0.7, CSpiral: 0.75, Vns: 0.85, Vs: 0.6, Vjoint: 0.85, omega: 2 }
    : { T: 0.9, CTied: 0.65, CSpiral: 0.75, Vns: 0.75, Vs: 0.6, Vjoint: 0.85, omega: 2 };
}

/**
 * @param {object} col              entrada de `cadSystem.rcColumnDesignResults`
 * @param {"base"|"top"} estacion
 * @param {object} [check]          check a reportar; por defecto el gobernante
 */
export function buildColumnDetailsHtml(col, estacion = "base", check = null) {
  const g = col?.geometryDisplay || {};
  const geo = col?.geometry || {};
  const chk = check || col?.check?.[estacion] || null;
  const sl = chk?.slenderness || {};
  const sh = col?.shear || {};
  const v2 = sh.shearV2 || {};
  const v3 = sh.shearV3 || {};
  const llrf = col?.liveLoadReduction || {};
  const phi = phiDelCodigo(geo.code || col?.code);

  const nBarras = Array.isArray(col?.surface?.bars) ? col.surface.bars.length : NaN;
  const dLongMm = (Number(g.longBarDiameter) || 0) * 1000;
  const dEstMm = (Number(geo.confineBarDiameter) || 0) * 1000;
  const coverMm = (Number(g.cover) || 0) * 10; // geometryDisplay.cover viene en cm
  const areaBarra = (Math.PI * Math.pow(dLongMm / 10, 2)) / 4; // cm²
  const ag = areaBruta(g);
  const rebarPct = Number.isFinite(nBarras) && ag > 0 ? (100 * nBarras * areaBarra) / ag : NaN;
  // dc solo tiene sentido con los tres componentes; si falta alguno se reporta
  // N/C en vez de un numero armado con ceros, que pareceria valido.
  const dc = coverMm > 0 && dEstMm > 0 && dLongMm > 0
    ? coverMm + dEstMm + dLongMm / 2
    : NaN;

  const largoMm = Number(col?.frameLength) * 1000;
  const estacionLoc = estacion === "base" ? 0 : largoMm;
  const ecKgfmm2 = Number(geo?.slenderness?.ec) / PA_A_KGFMM2;

  const b = [];

  // 1 ─ Column Element Details
  b.push(
    tablaEtabs(
      "Detalle del elemento",
      ["Nivel", "Elemento", "N.º único", "Sección", "Combinación", "Estación", "Longitud (mm)", "LLRF", "Tipo"],
      [
        celdas([
          col?.story || NC,
          col?.label || NC,
          col?.frameId ?? NC,
          col?.sectionName || NC,
          chk?.comboName || chk?.comboId || NC,
          limpio(estacionLoc, 0),
          limpio(largoMm, 0),
          limpio(llrf?.factor, 3, "1"),
          NC, // Sway Special / Ordinary: es un ajuste de Design Preferences que no leemos
        ]),
      ]
    )
  );

  // 2 ─ Section Properties
  b.push(
    tablaEtabs(
      "Propiedades de la sección",
      ["Sección", "d<sub>c</sub> (mm)", "Recub. torsión (mm)"],
      [celdas([textoSeccion(g), limpio(dc, 1), NC])],
      "60%"
    )
  );

  // 3 ─ Material Properties
  b.push(
    tablaEtabs(
      "Propiedades de los materiales",
      [
        "E<sub>c</sub> (kgf/mm²)",
        "f&#39;<sub>c</sub> (kgf/mm²)",
        "Factor peso ligero",
        "f<sub>y</sub> (kgf/mm²)",
        "f<sub>ys</sub> (kgf/mm²)",
      ],
      [
        celdas([
          limpio(ecKgfmm2, 2),
          limpio(Number(g.fc) / 100, 2),
          "1",
          limpio(Number(g.fy) / 100, 0),
          limpio(Number(g.fy) / 100, 0),
        ]),
      ]
    )
  );

  // 4 ─ Design Code Parameters
  b.push(
    tablaEtabs(
      "Parámetros del código de diseño",
      ["Φ<sub>T</sub>", "Φ<sub>CTied</sub>", "Φ<sub>CSpiral</sub>", "Φ<sub>Vns</sub>", "Φ<sub>Vs</sub>", "Φ<sub>Vjoint</sub>", "Ω<sub>0</sub>"],
      [celdas([phi.T, phi.CTied, phi.CSpiral, phi.Vns, phi.Vs, phi.Vjoint, phi.omega].map((x) => limpio(x, 2)))]
    )
  );

  // 5 ─ Axial Force and Biaxial Moment Check
  b.push(
    tablaEtabs(
      "Verificación por carga axial y momento biaxial (P<sub>u</sub>, M<sub>u2</sub>, M<sub>u3</sub>)",
      [
        "P<sub>u</sub> diseño<br>tonf",
        "M<sub>u2</sub> diseño<br>tonf-m",
        "M<sub>u3</sub> diseño<br>tonf-m",
        "M<sub>2</sub> mínimo<br>tonf-m",
        "M<sub>3</sub> mínimo<br>tonf-m",
        "Cuantía<br>%",
        "Ratio de capacidad",
      ],
      [
        celdas([
          num(Math.abs(Number(chk?.P)) / TONF, 4),
          num(Number(chk?.M2) / TONF, 4),
          num(Number(chk?.M3) / TONF, 4),
          num(Number(sl?.M2?.m2Min) / TONF, 4),
          num(Number(sl?.M3?.m2Min) / TONF, 4),
          num(rebarPct, 2),
          num(chk?.ratio, 3),
        ]),
      ]
    )
  );

  // 6 ─ Axial Force and Biaxial Moment Factors
  const filaFactores = (rot, e) =>
    celdas([
      rot,
      cmValido(e?.cm),
      e?.unstable ? "INESTABLE" : limpio(e?.deltaNs, 4, "1"),
      "1", // δs: pórtico arriostrado, igual que ETABS acá
      limpio(e?.k, 2, "1"),
      limpio(largoMm, 0),
    ]);
  b.push(
    tablaEtabs(
      "Factores de esbeltez",
      ["", "Factor C<sub>m</sub>", "Factor δ<sub>ns</sub>", "Factor δ<sub>s</sub>", "Factor K", "Longitud<br>mm"],
      [filaFactores("Flexión mayor (M3)", sl.M3), filaFactores("Flexión menor (M2)", sl.M2)]
    )
  );

  // 7 ─ Shear Design
  // OJO con cual cortante. ETABS reporta en "Shear Vu" el cortante del
  // ANALISIS (3.3717 tonf en C2), no el de diseno por capacidad Ve = SMpr/Hn,
  // que es mucho mayor. La primera version usaba `ve` (el de capacidad) y por
  // eso la tabla no calzaba. El de capacidad se sigue viendo en el modal.
  const filaCorte = (rot, v) =>
    celdas([
      rot,
      num(Number(v?.veAnalysis) / TONF, 4),
      v?.vcZero ? "0" : num((Number(v?.vc) * PHI_CORTE) / TONF, 4),
      num((Number(v?.vsProvided) * PHI_CORTE) / TONF, 4),
      "0", // ΦVp: aporte del axial; ETABS lo reporta 0 en columnas sin pretensado
      num(Number(v?.avProvided) * 1e6, 0), // m²/m → mm²/m
    ]);
  b.push(
    tablaEtabs(
      "Diseño por cortante (V<sub>u2</sub>, V<sub>u3</sub>)",
      ["", "V<sub>u</sub><br>tonf", "ΦV<sub>c</sub><br>tonf", "ΦV<sub>s</sub><br>tonf", "ΦV<sub>p</sub><br>tonf", "A<sub>v</sub>/s<br>mm²/m"],
      sh.unsupported
        ? [celdas(["Mayor, V<sub>u2</sub>", NC, NC, NC, NC, NC]), celdas(["Menor, V<sub>u3</sub>", NC, NC, NC, NC, NC])]
        : [filaCorte("Mayor, V<sub>u2</sub>", v2), filaCorte("Menor, V<sub>u3</sub>", v3)]
    )
  );

  // 8 ─ Joint Shear Check/Design
  b.push(
    tablaEtabs(
      "Verificación del nudo",
      ["", "Fuerza en<br>el nudo<br>tonf", "V<sub>u,sup</sub><br>tonf", "V<sub>u,tot</sub><br>tonf", "ΦV<sub>c</sub><br>tonf", "Área del<br>nudo<br>mm²", "Ratio"],
      [
        celdas(["Cortante mayor, V<sub>u2</sub>", NN, NN, NN, NN, NN, NN]),
        celdas(["Cortante menor, V<sub>u3</sub>", NN, NN, NN, NN, NN, NN]),
      ]
    )
  );

  // 9 ─ (6/5) Beam/Column Capacity Ratio
  b.push(
    tablaEtabs("Relación de capacidad viga/columna (6/5)", ["Ratio mayor", "Ratio menor"], [celdas([NN, NN])], "40%")
  );

  return `<div class="hoja">
    <p class="marca">ETTABS 4.0 · Concrete Frame Design</p>
    <p class="norma">${String(geo.code || "E060").toUpperCase().startsWith("E") ? "E.060" : "ACI 318-14"} Diseño de sección de columna (resumen)</p>
    ${b.join("\n")}
    <div class="notas">
      <p>Notas:</p>
      <p>${NA}: no aplica</p>
      <p>${NC}: no calculado</p>
      <p>${NN}: no necesario</p>
    </div>
  </div>`;
}

const ESTILO = `
  @page { size: A4 portrait; margin: 14mm 12mm; }
  body{font-family:"Times New Roman",Georgia,serif;font-size:11px;color:#000;margin:0}
  .hoja{max-width:190mm;margin:0 auto}
  .marca{font-size:10px;color:#444;margin:0}
  .norma{font-weight:bold;font-size:13px;text-align:center;margin:2px 0 14px}
  .bloque{margin-bottom:14px;page-break-inside:avoid}
  .tit{font-weight:bold;font-size:12px;text-align:center;margin:0 0 4px}
  table{border-collapse:collapse;margin:0 auto;width:100%}
  th,td{border:1px solid #555;padding:3px 6px;text-align:center;font-size:10px;
        vertical-align:middle}
  th{font-weight:bold;background:#fff}
  tbody td:first-child{text-align:left;font-weight:normal}
  sub{font-size:8px}
  .notas{margin-top:18px;font-size:10px}
  .notas p{margin:1px 0}
`;

/**
 * Abre el diálogo de impresión con el reporte listo para "Guardar como PDF".
 * Se prefiere sobre una librería de PDF: no agrega dependencia al bundle,
 * respeta los saltos de página de las tablas y usa la tipografía del sistema.
 */
export function exportColumnDetails(col, estacion = "base", check = null) {
  const cuerpo = buildColumnDetailsHtml(col, estacion, check);
  const titulo = `Diseno de columna ${col?.label || "columna"}`;
  const html =
    `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">` +
    `<title>${titulo}</title><style>${ESTILO}</style></head><body>${cuerpo}</body></html>`;

  // SE ABRE POR BLOB, NO POR document.write().
  //
  // Con `document.write` sobre about:blank el navegador ya eligio una
  // codificacion antes de llegar al <meta charset>, y las tildes y la enie
  // salian rotas en el PDF. El Blob declara utf-8 en su propio MIME, asi que
  // la ventana nace con la codificacion correcta.
  const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
  const w = window.open(url, "_blank", "width=980,height=1000");
  if (!w) {
    URL.revokeObjectURL(url);
    alert("El navegador bloqueó la ventana emergente. Permitila para exportar el reporte.");
    return;
  }
  // Sin esperar al onload, Chrome a veces imprime la pagina en blanco.
  w.addEventListener("load", () => {
    w.focus();
    w.print();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  });
}
