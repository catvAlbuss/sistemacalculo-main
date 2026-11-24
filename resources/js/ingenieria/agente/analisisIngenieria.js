// Revisión de ingeniería del proyecto abierto, determinista y sin tokens. Es la materia prima
// con la que el modelo de IA razona como un ingeniero: no responde "listo", sino qué ve, qué
// riesgo hay, qué recomienda y con qué herramienta se resuelve. Cada hallazgo dice de dónde sale
// (E.030, E.060, criterio del despacho o lo aprendido) y es una recomendación, no una
// verificación estructural: el diseño final lo firma el ingeniero.

import {CRITERIOS, espesorPorLuz} from "../criterios/criteriosEstructurales.js";
import {parametrosSismicos} from "../criterios/datosProyecto.js";
import {versionE030, CITAS} from "../criterios/normativa.js";

const r2 = (v) => Math.round(v * 100) / 100;
const arriba05 = (v) => Math.ceil(v / 0.05 - 1e-9) * 0.05;

// Líneas de columnas en una dirección (agrupa coordenadas a ±tol) y luces entre ellas.
export function lucesEntreColumnas(columnas = [], eje = "x", tol = 0.3) {
  const valores = columnas.map((c) => c[eje]).filter(Number.isFinite).sort((a, b) => a - b);
  const lineas = [];
  for (const v of valores) {
    const ultima = lineas.at(-1);
    if (ultima && v - ultima.max <= tol) { ultima.max = v; ultima.suma += v; ultima.n++; } else lineas.push({max: v, suma: v, n: 1});
  }
  const pos = lineas.map((l) => l.suma / l.n);
  return pos.slice(1).map((p, i) => r2(p - pos[i])).filter((l) => l >= 1);
}

// Peralte de viga por luz (L/11, mínimo del despacho) y ancho del despacho.
export function peralteViga(luz) {
  return r2(Math.max(CRITERIOS.vigas.peraltaMinimo, arriba05(luz / 11)));
}

// Área de columna requerida por carga de gravedad (predimensionamiento usual en Perú):
// P = At · pisos · w; Ag = P / (0.45 f'c) interior, / (0.35 f'c) perímetro o esquina.
export function areaColumnaRequerida({at, pisos = 1, w = 1.0, perimetral = false, fc = CRITERIOS.concreto.columnas}) {
  const P = at * pisos * w * 1000; // kg
  return P / ((perimetral ? 0.35 : 0.45) * fc); // cm²
}

const pesoPorCategoria = (cat) => (/^A/.test(cat ?? "") ? 1.5 : cat === "B" ? 1.25 : 1.0); // t/m²

export function analizarProyecto(ctx = {}) {
  const m = ctx.memoria ?? {};
  const datos = (typeof ctx.datosProyecto === "function" ? ctx.datosProyecto() : null) ?? {};
  const h = [];
  const add = (nivel, tema, texto, accion = null, fuente = null) => h.push({nivel, tema, texto, ...(fuente ? {fuente} : {}), ...(accion ? {accion} : {})});

  // 1) Datos que condicionan todo el diseño.
  const faltan = ["zona", "suelo", "categoria"].filter((k) => !String(datos[k] ?? "").trim());
  if (faltan.length) add("alto", "datos", `Faltan ${faltan.join(", ")}: sin ellos el espectro E.030 y la cimentación son supuestos.`, {herramienta: "datos_proyecto", porque: "pídelos o dedúcelos de la ubicación (distrito)"}, "E.030");
  // Qué E.030 rige este proyecto (transitoria de la RM 183-2026-VIVIENDA).
  const norma = versionE030(datos);
  if (norma.nivel !== "info") add(norma.nivel, "normativa", norma.aviso, {herramienta: "preguntar_ingeniero", porque: "¿el proyecto tenía licencia o expediente aprobado antes de la RM 183-2026?"}, "E.030-2026 / RM 217-2026");
  const sis = parametrosSismicos({zona: datos.zona, suelo: datos.suelo, categoria: datos.categoria});
  if (sis.Z && sis.U && sis.S) add("info", "sismo", `Z=${sis.Z}, U=${sis.U}, S=${sis.S}, Tp=${sis.Tp}, TL=${sis.TL} → ZUS=${r2(sis.Z * sis.U * sis.S)}.`, null, "E.030");
  if (datos.suelo === "S3" || datos.suelo === "S4") add("medio", "cimentacion", `Suelo ${datos.suelo} (blando): conviene platea o zapatas conectadas con vigas de cimentación; confirma con el EMS.`, {herramienta: "preguntar_ingeniero"}, "E.050");
  if (!Number(datos.hz) || !Number(datos.df)) add("medio", "cimentacion", "Sin Hz o Df del estudio de suelos: las láminas usarán valores del despacho (Hz 0.70, Df 2.00) marcados como supuestos.", {herramienta: "datos_proyecto"}, "despacho");

  const e = m.estructura;
  if (!e?.columnas?.length) {
    add("alto", "lectura", "Aún no leí la estructura de la arquitectura: sin ejes y columnas no puedo revisar luces ni secciones.", {herramienta: "leer_estructura"});
    return resumen(h);
  }

  // 2) Luces y lo que implican (losa y vigas).
  const lx = lucesEntreColumnas(e.columnas, "x"), ly = lucesEntreColumnas(e.columnas, "y");
  const maxX = Math.max(0, ...lx), maxY = Math.max(0, ...ly);
  if (maxX || maxY) {
    const corta = Math.min(maxX || Infinity, maxY || Infinity);
    const larga = Math.max(maxX, maxY);
    add("info", "luces", `Luces máximas: ${r2(maxX)} m en X y ${r2(maxY)} m en Y. Aligerado armado en la luz corta (${r2(corta)} m) → e=${espesorPorLuz(corta)} m; vigas principales h≈L/11=${peralteViga(larga)} m.`, null, "E.060 / despacho");
    if (larga > 7.5) add("alto", "luces", `Luz de ${r2(larga)} m: excede lo usual para aligerado y vigas de ${peralteViga(7.5)} m. Propón una columna intermedia o viga peraltada mayor.`, {herramienta: "preguntar_ingeniero", porque: "decisión de estructuración"}, "práctica peruana");
    else if (larga > 6.0) add("medio", "luces", `Luz de ${r2(larga)} m: revisa deflexión del aligerado (e=${espesorPorLuz(larga)} m si se arma en esa dirección) y vigas ≥ ${peralteViga(larga)} m.`, null, CITAS.espesorAligerado);
    const prop = m.propuesta?.propuesta;
    const eLosa = Number(prop?.decisiones?.espesorLosa?.valor ?? prop?.espesorLosa?.valor);
    if (eLosa && eLosa + 1e-9 < espesorPorLuz(corta)) add("alto", "losa", `La propuesta usa losa e=${eLosa} m, menor que ${espesorPorLuz(corta)} m que pide la luz de ${r2(corta)} m.`, {herramienta: "corregir_estructura"}, CITAS.espesorAligerado);
  }
  const forma = (maxX && maxY) ? Math.max(lx.reduce((a, b) => a + b, 0), ly.reduce((a, b) => a + b, 0)) / Math.max(0.1, Math.min(lx.reduce((a, b) => a + b, 0), ly.reduce((a, b) => a + b, 0))) : 1;
  if (forma > 4) add("medio", "irregularidad", `Planta alargada (relación ${r2(forma)}:1): evalúa junta sísmica o placas en la dirección larga.`, {herramienta: "preguntar_ingeniero"}, CITAS.irregularidades);

  // 3) Columnas: sección mínima por gravedad.
  const pisos = Math.max(1, Number(datos.niveles) || 1);
  const w = pesoPorCategoria(datos.categoria);
  const chicas = [];
  for (const c of e.columnas) {
    if (!c.at || !c.b || !c.h) continue;
    const req = areaColumnaRequerida({at: c.at, pisos, w, perimetral: c.aislada});
    const tiene = c.b * c.h * 1e4;
    if (tiene < req * 0.95) chicas.push(`${c.id ?? c.tipo ?? "col"} ${c.b}x${c.h} (At ${c.at} m² → ${Math.ceil(req)} cm²)`);
  }
  if (chicas.length) add("alto", "columnas", `${chicas.length} columna(s) con sección menor a la de predimensionamiento para ${pisos} nivel(es): ${chicas.slice(0, 4).join("; ")}${chicas.length > 4 ? "…" : ""}.`, {herramienta: "corregir_estructura"}, "predim. P/(0.45 f'c)");
  else add("info", "columnas", `Secciones de columna suficientes por gravedad para ${pisos} nivel(es) (w=${w} t/m²).`, null, "predim. P/(0.45 f'c)");
  if (!datos.niveles) add("medio", "datos", "No sé cuántos niveles tiene: revisé columnas con 1 nivel.", {herramienta: "datos_proyecto"});

  // 4) Rigidez lateral: placas por dirección y torsión en planta.
  const placas = e.columnas.filter((c) => Math.max(c.b ?? 0, c.h ?? 0) >= 4 * Math.min(c.b ?? 1, c.h ?? 1) - 0.02);
  const largoX = placas.filter((c) => c.b >= c.h).reduce((a, c) => a + c.b, 0), largoY = placas.filter((c) => c.h > c.b).reduce((a, c) => a + c.h, 0);
  if (pisos >= 3 && (!largoX || !largoY)) add("alto", "sismo", `Edificio de ${pisos} niveles sin placas en ${!largoX && !largoY ? "ninguna dirección" : !largoX ? "X" : "Y"}: con solo pórticos la deriva de concreto (0.007 en la E.030-2018) suele no cumplir.`, {herramienta: "preguntar_ingeniero", porque: "agregar placas es decisión de estructuración"}, CITAS.deriva);
  if (norma.version === "2026") add("medio", "sismo", "La E.030-2026 exige considerar el sismo en dos direcciones ortogonales simultáneas: el análisis y el diseño deben combinarlas.", null, "E.030-2026");
  const rig = (c, dir) => (dir === "x" ? (c.b ?? 0) * (c.h ?? 0) ** 3 : (c.h ?? 0) * (c.b ?? 0) ** 3);
  const xs = e.columnas.map((c) => c.x), ys = e.columnas.map((c) => c.y);
  const ancho = Math.max(...xs) - Math.min(...xs), fondo = Math.max(...ys) - Math.min(...ys);
  const cmx = (Math.max(...xs) + Math.min(...xs)) / 2, cmy = (Math.max(...ys) + Math.min(...ys)) / 2;
  const sx = e.columnas.reduce((a, c) => a + rig(c, "y"), 0), sy = e.columnas.reduce((a, c) => a + rig(c, "x"), 0);
  const crx = sx ? e.columnas.reduce((a, c) => a + rig(c, "y") * c.x, 0) / sx : cmx;
  const cry = sy ? e.columnas.reduce((a, c) => a + rig(c, "x") * c.y, 0) / sy : cmy;
  const ex = ancho ? Math.abs(crx - cmx) / ancho : 0, ey = fondo ? Math.abs(cry - cmy) / fondo : 0;
  if (Math.max(ex, ey) > 0.1) add("medio", "torsion", `Centro de rigidez desplazado ${r2(Math.max(ex, ey) * 100)} % de la planta (${ex > ey ? "en X" : "en Y"}): riesgo de torsión; equilibra placas o columnas del lado flexible.`, {herramienta: "preguntar_ingeniero"}, "E.030 tabla 9");

  // 5) Albañilería: confinamiento.
  if (!e.columnetas && (m.lectura?.items ?? []).some?.((it) => /muro|ladrillo|tabique/i.test(it.capa ?? ""))) add("medio", "albanileria", "Hay muros pero no leí columnetas de confinamiento: los tabiques deben aislarse o confinarse.", null, "E.070");

  // 6) Entregables.
  if (m.paqueteLaminas?.pendientes?.length) add("medio", "laminas", `Pendientes en las láminas: ${m.paqueteLaminas.pendientes.slice(0, 3).join("; ")}.`, {herramienta: "revisar_laminas"});
  if (!m.modeloEstructural) add("info", "siguiente", "Falta dibujar las láminas.", {herramienta: "plano_estructuras"});
  else if (!m.metrado) add("info", "siguiente", "Láminas listas; falta el metrado.", {herramienta: "metrar_estructura"});
  return resumen(h);
}

const ORDEN = {alto: 0, medio: 1, info: 2};
function resumen(h) {
  const hallazgos = h.sort((a, b) => ORDEN[a.nivel] - ORDEN[b.nivel]);
  const riesgos = hallazgos.filter((x) => x.nivel !== "info").length;
  const texto = hallazgos.map((x) => `${x.nivel === "alto" ? "⚠" : x.nivel === "medio" ? "•" : "·"} [${x.tema}] ${x.texto}${x.accion ? ` → ${x.accion.herramienta}` : ""}`).join("\n");
  return {ok: true, riesgos, hallazgos, mensaje: `Revisión de ingeniería (${riesgos} punto(s) a decidir):\n${texto}`};
}
