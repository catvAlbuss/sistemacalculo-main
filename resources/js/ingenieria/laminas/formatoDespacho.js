// Formato de lámina del despacho para un proyecto nuevo (sin módulo de referencia):
// tamaño de marco, reparto del contenido entre láminas, rótulo con sus casillas y el
// bloque de especificaciones técnicas y parámetros sísmicos.
//
// Todo sale de lo aprendido en los expedientes (perfilesLaminasAprendidos.js, generado por
// scripts/agente/exportar-perfiles-laminas.mjs) o de los datos del proyecto actual; nunca
// lleva nombre de especialista, CIP, CUI ni entidad de un proyecto de referencia.

import {L, line, text} from "../cad/primitives.js";
import {PERFILES_LAMINAS} from "../aprendizaje/perfilesLaminasAprendidos.js";
import {CRITERIOS} from "../criterios/criteriosEstructurales.js";

// Respaldo si no hubiera perfiles: el marco más común medido en los expedientes del despacho.
const MARCO_RESPALDO = {ancho: 41, alto: 28.7};

// Marco más común entre todas las láminas estudiadas (en metros de dibujo; proporción de
// formato A: entre 1.25 y 1.65). Lo usan las láminas de un proyecto sin referencia.
export function formatoDespacho(perfiles = PERFILES_LAMINAS) {
  const grupos = new Map();
  for (const p of perfiles ?? []) {
    for (const m of p.marcos ?? []) {
      if (m.unidades !== "metros de dibujo" || !(m.ancho > 0 && m.alto > 0)) continue;
      const razon = Math.max(m.ancho, m.alto) / Math.min(m.ancho, m.alto);
      if (razon < 1.25 || razon > 1.65) continue;
      const clave = `${m.ancho.toFixed(1)}x${m.alto.toFixed(1)}`;
      const g = grupos.get(clave) ?? {ancho: m.ancho, alto: m.alto, laminas: 0, modulos: new Set()};
      g.laminas++; g.modulos.add(p.nombre);
      grupos.set(clave, g);
    }
  }
  const e = [...grupos.values()].sort((a, b) => b.modulos.size - a.modulos.size || b.laminas - a.laminas)[0];
  const ancho = e?.ancho ?? MARCO_RESPALDO.ancho, alto = e?.alto ?? MARCO_RESPALDO.alto;
  return {x0: 0, y0: 0, x1: Math.max(ancho, alto), y1: Math.min(ancho, alto),
    origen: e ? `formato más común del despacho (${e.laminas} láminas de ${e.modulos.size} módulos estudiados)` : "formato del despacho",
    referencia: null, aprendido: Boolean(e)};
}

// Tipos de contenido que se reparten entre láminas (los mismos que exporta el inventario).
export const TIPOS_CONTENIDO = ["cimentacion", "cimiento", "tabiqueria", "losa", "losaTecho", "portico", "escalera"];
const CUADROS = ["cuadroColumnas", "cuadroColumnetas"];
const ORDEN_RESPALDO = ["cimentacion", "cimiento", "tabiqueria", "losa", "losaTecho", "portico", "escalera"];
const mediana = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };

// Cómo reparte el ingeniero: orden de los tipos (posición mediana de su primera lámina),
// qué tipos comparten lámina (familias: juntos en la mitad o más de los módulos que tienen
// ambos), con qué tipo va la escalera y en qué láminas repite los cuadros de columnas.
export function repartoDespacho(perfiles = PERFILES_LAMINAS) {
  const conReparto = (perfiles ?? []).filter((p) => p.reparto?.length >= 2);
  if (!conReparto.length) {
    return {orden: ORDEN_RESPALDO, familias: [["cimentacion", "cimiento"], ["tabiqueria"], ["losa", "losaTecho"], ["portico", "escalera"]], escaleraCon: "portico", cuadrosCon: ["cimentacion", "portico"], aprendido: false, modulos: 0};
  }
  const posiciones = Object.fromEntries(TIPOS_CONTENIDO.map((t) => [t, []]));
  const juntos = new Map(), ambos = new Map();
  const conEscalera = {}, cuadros = {};
  for (const p of conReparto) {
    const hojas = p.reparto.map((h) => h.contenido ?? []);
    for (const t of TIPOS_CONTENIDO) {
      const i = hojas.findIndex((c) => c.includes(t));
      if (i >= 0) posiciones[t].push(i / Math.max(1, hojas.length - 1));
    }
    for (const a of TIPOS_CONTENIDO) for (const b of TIPOS_CONTENIDO) {
      if (a >= b || !hojas.some((c) => c.includes(a)) || !hojas.some((c) => c.includes(b))) continue;
      const k = `${a}|${b}`;
      ambos.set(k, (ambos.get(k) ?? 0) + 1);
      if (hojas.some((c) => c.includes(a) && c.includes(b))) juntos.set(k, (juntos.get(k) ?? 0) + 1);
    }
    for (const c of hojas) {
      if (c.includes("escalera")) for (const t of c) if (t !== "escalera" && TIPOS_CONTENIDO.includes(t)) conEscalera[t] = (conEscalera[t] ?? 0) + 1;
      for (const t of c) if (TIPOS_CONTENIDO.includes(t)) {
        cuadros[t] ??= {hojas: 0, con: 0};
        cuadros[t].hojas++;
        if (c.some((x) => CUADROS.includes(x))) cuadros[t].con++;
      }
    }
  }
  const orden = [...TIPOS_CONTENIDO].sort((a, b) => (mediana(posiciones[a]) ?? ORDEN_RESPALDO.indexOf(a) / 6) - (mediana(posiciones[b]) ?? ORDEN_RESPALDO.indexOf(b) / 6) || ORDEN_RESPALDO.indexOf(a) - ORDEN_RESPALDO.indexOf(b));
  const escaleraCon = Object.entries(conEscalera).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "portico";
  // Familias: tipos consecutivos (sin la escalera, que va con su tipo) que el ingeniero junta.
  const base = orden.filter((t) => t !== "escalera");
  const familias = [];
  for (const t of base) {
    const previa = familias.at(-1);
    const a = previa?.at(-1), k = a && (a < t ? `${a}|${t}` : `${t}|${a}`);
    if (previa && (juntos.get(k) ?? 0) / (ambos.get(k) || 1) >= 0.5) previa.push(t); else familias.push([t]);
  }
  familias.find((f) => f.includes(escaleraCon))?.push("escalera") ?? familias.push(["escalera"]);
  const cuadrosCon = Object.entries(cuadros).filter(([, v]) => v.hojas >= 3 && v.con / v.hojas >= 0.5).map(([t]) => t);
  return {orden, familias, escaleraCon, cuadrosCon, aprendido: true, modulos: conReparto.length};
}

// Nombre del plano de una lámina (para el rótulo) según lo que contiene.
const NOMBRES = {cimentacion: "CIMENTACIÓN", cimiento: "CIMIENTO CORRIDO", tabiqueria: "TABIQUERÍA", losa: "LOSA ALIGERADA", losaTecho: "LOSA ALIGERADA DE TECHO", portico: "PÓRTICOS", escalera: "ESCALERA"};
export function nombrePlanoLamina(tipos) {
  const ts = TIPOS_CONTENIDO.filter((t) => tipos.includes(t));
  const nombres = ts.includes("losa") && ts.includes("losaTecho") ? ts.filter((t) => t !== "losaTecho").map((t) => (t === "losa" ? "LOSAS ALIGERADAS" : NOMBRES[t])) : ts.map((t) => NOMBRES[t]);
  if (!nombres.length) return tipos.some((t) => CUADROS.includes(t)) ? "CUADROS DE COLUMNAS" : "ESTRUCTURAS";
  return nombres.length > 1 ? `${nombres.slice(0, -1).join(", ")} Y ${nombres.at(-1)}` : nombres[0];
}

// Rótulo del despacho en la esquina inferior derecha del marco: casillas con su etiqueta
// y los campos que llena rotulo.js (textoEnCasilla). f escala todo con el tamaño del marco.
export function rotuloDespacho(marco) {
  const w = marco.x1 - marco.x, h = marco.y1 - marco.y, f = Math.min(w / 41, h / 28.7);
  const W = 8.6 * f, g = 0.2 * f;
  const X1 = marco.x1 - g, X0 = X1 - W, Y0 = marco.y + g;
  const filas = [
    {alto: 0.75, celdas: [{ancho: 1, etiqueta: "ENTIDAD", campos: [["entidad", 0.15, 1]]}]},
    {alto: 1.05, celdas: [{ancho: 1, etiqueta: "PROYECTO", campos: [["proyecto", 0.1, 3]]}]},
    {alto: 0.85, celdas: [
      {ancho: 0.5, etiqueta: "ESPECIALISTA", campos: [["especialista", 0.09, 1], ["cip", 0.09, 1]]},
      {ancho: 0.5, etiqueta: "UBICACIÓN", campos: [["ubicacion", 0.08, 2], ["codigos", 0.07, 1]]},
    ]},
    {alto: 0.85, celdas: [
      {ancho: 0.62, etiqueta: "PLANO", campos: [["plano", 0.085, 3]]},
      {ancho: 0.38, etiqueta: "ESPECIALIDAD", campos: [["especialidad", 0.1, 1]]},
    ]},
    {alto: 0.9, celdas: [
      {ancho: 0.27, etiqueta: "ESCALA", campos: [["escala", 0.09, 1]]},
      {ancho: 0.33, etiqueta: "FECHA", campos: [["fecha", 0.09, 1]]},
      {ancho: 0.4, etiqueta: "LÁMINA", campos: [["lamina", 0.3, 1]]},
    ]},
  ];
  const H = filas.reduce((s, r) => s + r.alto, 0) * f;
  const lineas = [line(L.LAMINA, [X0, Y0], [X1, Y0]), line(L.LAMINA, [X1, Y0], [X1, Y0 + H]), line(L.LAMINA, [X1, Y0 + H], [X0, Y0 + H]), line(L.LAMINA, [X0, Y0 + H], [X0, Y0])];
  const etiquetas = [], campos = [];
  let top = Y0 + H;
  for (const fila of filas) {
    const bot = top - fila.alto * f;
    if (bot > Y0 + 1e-9) lineas.push(line(L.LAMINA, [X0, bot], [X1, bot]));
    let x = X0;
    fila.celdas.forEach((c, i) => {
      const cw = c.ancho * W;
      if (i > 0) lineas.push(line(L.LAMINA, [x, bot], [x, top]));
      const pad = 0.06 * f, he = 0.065 * f;
      etiquetas.push(text(L.LAMINA, [x + pad, top - pad - he / 2], `${c.etiqueta}:`, he, 0, "izq"));
      let y = top - pad - he - 0.06 * f;
      for (const [campo, alto, lineasCampo] of c.campos) {
        const a = alto * f;
        // Lámina: el código grande, centrado en su casilla.
        const yCampo = campo === "lamina" ? (top + bot) / 2 - he / 2 : y - a * 0.6;
        campos.push({campo, x: x + pad + (campo === "lamina" ? cw * 0.18 : 0), y: yCampo, alto: a, ancho: cw - 2 * pad, lineas: lineasCampo, interlineado: a * 1.45, capa: L.LAMINA});
        y -= a * 1.45 * lineasCampo + 0.03 * f;
      }
      x += cw;
    });
    top = bot;
  }
  // Sello sobre el rótulo: lo que el agente entrega es una propuesta que el ingeniero revisa y firma.
  const ys0 = Y0 + H + 0.12 * f, ys1 = ys0 + 0.5 * f;
  lineas.push(...[[[X0, ys0], [X1, ys0]], [[X1, ys0], [X1, ys1]], [[X1, ys1], [X0, ys1]], [[X0, ys1], [X0, ys0]]].map(([a, b]) => ({...line(L.LAMINA, a, b), color: 1})));
  etiquetas.push({...text(L.LAMINA, [(X0 + X1) / 2, (ys0 + ys1) / 2], SELLO_PROPUESTA, 0.2 * f), color: 1});
  return {caja: {x0: X0 - g, y0: marco.y, x1: marco.x1, y1: ys1 + g}, lineas, etiquetas, campos};
}
export const SELLO_PROPUESTA = "PROPUESTA – REQUIERE REVISIÓN";

// Especificaciones técnicas y resumen de parámetros sísmicos con los datos del proyecto.
// Lo que falta se escribe "POR DEFINIR" (nunca el valor de otro proyecto).
const f2 = (v) => Number(v).toFixed(2);
// Sobrecargas de la Norma E.020 (Tabla 1) solo cuando la categoría indica el uso; si no, se pide.
function sobrecargas(categoria, losaTecho) {
  const techo = losaTecho ? ["Techos (azotea): 100 kg/m²."] : ["Techo de cobertura liviana: 30 kg/m² (E.020)."];
  if (categoria === "C") return ["Vivienda: 200 kg/m²; corredores y escaleras: 200 kg/m².", ...techo];
  if (categoria === "A2") return ["Centros de educación: aulas 250 kg/m²; corredores y escaleras 400 kg/m² (confirmar el uso).", ...techo];
  return ["Pisos: según E.020 para el uso (POR DEFINIR en Datos del proyecto).", ...techo];
}
// Junta sísmica (E.030, art. 5.3): s = 0.006 h ≥ 3 cm, con h la altura del edificio.
function juntaSismica(altura) {
  if (!(altura > 0)) return ["s = 0.006 h ≥ 3 cm con edificaciones vecinas; retiro del límite ≥ s/2."];
  const s = Math.max(3, Math.ceil(0.6 * altura));
  return [`s = 0.006 h ≥ 3 cm; con h=${f2(altura)} m: s=${s} cm con edificaciones vecinas.`, `Retiro del límite de propiedad ≥ ${(s / 2).toFixed(1)} cm.`];
}
const f1 = (v) => Number(v).toFixed(1);
export function notasTecnicas({sismo = {}, df = null, hz = null, cimentacion = "platea", conCimiento = true, conAlbanileria = true, altura = null, losaTecho = true} = {}) {
  const p = sismo ?? {};
  const falta = (q) => `${q} = POR DEFINIR (completar en Datos del proyecto)`;
  const sismicos = [p.Z !== undefined && `Z=${f2(p.Z)}`, p.U !== undefined && `U=${f1(p.U)}`, p.S !== undefined && `S=${f2(p.S)}`, p.Tp !== undefined && `Tp=${f2(p.Tp)}`, p.TL !== undefined && `TL=${f1(p.TL)}`].filter(Boolean);
  const bloques = [
    ["ESPECIFICACIONES TÉCNICAS", null],
    ["1) CONCRETOS", [
      ...(conCimiento ? [`${CRITERIOS.concreto.cimientoCorrido} en cimiento corrido.`, `${CRITERIOS.concreto.sobrecimiento} en sobrecimiento.`, `${CRITERIOS.concreto.falsaZapata} donde haga falta llegar al estrato del EMS.`] : []),
      `Concreto f'c=${CRITERIOS.concreto.columnas} kg/cm² en ${cimentacion === "platea" ? "platea de cimentación" : "zapatas y vigas de cimentación"}, columnas, vigas y losas.`,
      ...(conAlbanileria ? [`Concreto f'c=${CRITERIOS.concreto.columnetas} kg/cm² en columnetas de confinamiento.`] : []),
      "Cemento Portland tipo I.",
    ]],
    ["2) ACERO DE REFUERZO", ["Acero ASTM A615 - G60, fy=4200 kg/cm²."]],
    ["3) SUELO", [
      `Tipo de cimentación: ${cimentacion === "platea" ? "platea de cimentación" : "zapatas"}${conCimiento ? " y cimiento corrido" : ""}${hz ? `; ${cimentacion === "platea" ? "espesor" : "peralte"} Hz=${f2(hz)} m` : ""}.`,
      df !== null && df !== undefined ? `Profundidad de desplante Df=${f2(df)} m desde el nivel de terreno natural.` : "Profundidad de desplante Df = POR DEFINIR (estudio de suelos).",
      "Presión admisible: verificar el Estudio de Mecánica de Suelos.",
      sismicos.length ? `Parámetros sísmicos: ${sismicos.join(", ")}` : "Parámetros sísmicos: POR DEFINIR (zona, suelo y categoría).",
    ]],
    ["4) RECUBRIMIENTOS", ["Platea, zapatas y vigas de cimentación: 7.5 cm.", "Columnas y vigas peraltadas: 4 cm.", "Vigas chatas, losas aligeradas y macizas: 2 cm."]],
    ["5) SOBRECARGAS (E.020)", sobrecargas(p.categoria, losaTecho)],
    ["6) JUNTA SÍSMICA (E.030)", juntaSismica(altura)],
    ...(conAlbanileria ? [["7) ALBAÑILERÍA", ["Ladrillo tipo IV 9x13x24 cm, 30% de vacíos; f'm=65 kg/cm².", "Mortero 1:5 (cemento:arena); junta de 1.5 cm."]]] : []),
    ["NOTA:", ["- De existir discrepancias entre los planos y el terreno, consultar al proyectista.", "- Las juntas de construcción van en zonas de cortante bajo, con resina epóxica.", "- Los paños grandes de losa se vacían en forma alternada."]],
    ["RESUMEN DE PARÁMETROS SÍSMICOS (E.030)", null],
    ["", [
      p.Z !== undefined ? `Z=${f2(p.Z)}(ZONA ${p.zona})` : falta("Z"),
      p.U !== undefined ? `U=${f1(p.U)} categoria "${p.categoria}" (EDIFICACIONES ${p.nombreCategoria})` : falta("U"),
      p.S !== undefined ? `S=${f2(p.S)}(suelo tipo ${p.suelo})` : falta("S"),
      p.Tp !== undefined ? `Tp=${f2(p.Tp)}(suelo ${p.suelo})` : falta("Tp"),
      p.TL !== undefined ? `TL=${f1(p.TL)}(suelo tipo ${p.suelo})` : falta("TL"),
    ]],
  ];
  const h = 0.1, ht = 0.14, paso = h * 1.6;
  const prim = [];
  let y = 0;
  for (const [titulo, lineas] of bloques) {
    if (titulo) {
      const grande = !lineas;
      const a = grande ? ht : h * 1.05;
      if (grande && y < 0) y -= paso * 0.6;
      prim.push(text(L.TITULO, [0, y], titulo, a, 0, "izq"));
      y -= (grande ? ht * 1.8 : paso);
    }
    for (const l of lineas ?? []) { prim.push(text(L.TEXTO, [0.15, y], l, h, 0, "izq")); y -= paso; }
  }
  return {titulo: "ESPECIFICACIONES TÉCNICAS", primitivas: prim, marco: {x0: 0, y0: y, x1: 0, y1: ht}};
}
