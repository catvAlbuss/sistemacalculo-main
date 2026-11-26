// Modelo de análisis (.e2k de ETABS) a partir de lo que el agente leyó de la arquitectura:
// columnas en los cruces de ejes, vigas sobre los ejes, losas entre ejes, pisos con sus alturas,
// cargas de la E.020, masa y espectro de la E.030. Lo abre Análisis Estructural (mismo lector que
// un .e2k exportado de ETABS) y también ETABS, para contrastar.
//
// Todo lo que no sale de la arquitectura ni de los datos del proyecto va en `supuestos`: el agente
// lo informa y el ingeniero lo confirma. Unidades del archivo: TONF y M.

import {parametrosSismicos} from "../criterios/datosProyecto.js";
import {CRITERIOS} from "../criterios/criteriosEstructurales.js";
import {refuerzoMinimo} from "../laminas/laminaEstructuras.js";

const r4 = (v) => Math.round(v * 10000) / 10000;
const fmt = (v) => String(r4(Number(v) || 0));
const cm = (v) => Math.round(Number(v) * 100);

// E.020 (Tabla 1 y Anexo 1): peso del aligerado por espesor y cargas vivas por uso (kgf/m²).
export const PESO_ALIGERADO = {0.17: 280, 0.2: 300, 0.25: 350, 0.3: 420};
export const CARGA_VIVA = {A1: 300, A2: 250, B: 250, C: 200, techo: 100};
export const ACABADOS = 100, TABIQUERIA_EQUIVALENTE = 100;
// E.030 art. 26: porcentaje de la carga viva en el peso sísmico.
const FRACCION_VIVA_MASA = {A1: 0.5, A2: 0.5, B: 0.5, C: 0.25};

const pesoAligerado = (e) => {
  const claves = Object.keys(PESO_ALIGERADO).map(Number).sort((a, b) => a - b);
  const k = claves.find((c) => e <= c + 1e-6) ?? claves.at(-1);
  return PESO_ALIGERADO[k];
};

// Área de una varilla (m²) por su diámetro nominal en pulgadas ('5/8"' → 1.979e-4).
const areaVarilla = (barra) => {
  const [a, b] = String(barra).replace('"', "").split("/").map(Number);
  const d = (b ? a / b : a) * 0.0254;
  return (Math.PI * d * d) / 4;
};

// Armado de columna para el .e2k con el MISMO refuerzo del cuadro de columnas (refuerzoMinimo:
// cuantía 1 %, Ø5/8") en el patrón "R-n2-n3" de ETABS, que el diseño de columnas verifica:
//  - rectangular: n2 varillas por cara sobre el lado b y n3 sobre el lado h (2·n2 + 2·n3 − 4);
//  - L: pata sobre el eje 3 (ancho B) con n3 y pata sobre el eje 2 (peralte D) con n2, dos hileras
//    cada una, solo se funde la varilla del vértice común (2·n2 + 2·n3 − 1);
//  - T: igual pero sin varillas comunes (2·n2 + 2·n3).
// Ver python-backend/design/column_interaction.py y column_polygon.py.
export function armadoColumnaE2k({b, h, area, forma = null, espesor = null}) {
  const C = CRITERIOS.columnas;
  const e = Number(espesor) || 0;
  const bruta = (forma === "L" || forma === "T") && e > 0 ? e * (b + h - e) : b * h; // patas sin duplicar el cruce
  const ref = refuerzoMinimo(Number(area) > 0 ? Number(area) : bruta);
  const reparte = (suma, lado, otro) => {
    const n = Math.min(suma - 2, Math.max(2, Math.round((suma * lado) / (lado + otro))));
    return [n, suma - n];
  };
  let n2, n3, total;
  if (forma === "L" || forma === "T") {
    const suma = Math.max(4, Math.ceil((ref.n + (forma === "L" ? 1 : 0)) / 2));
    [n3, n2] = reparte(suma, b, h);
    total = 2 * suma - (forma === "L" ? 1 : 0);
  } else {
    const suma = ref.n / 2 + 2;
    [n2, n3] = reparte(suma, b, h);
    total = 2 * n2 + 2 * n3 - 4;
  }
  // Ramas del estribo en cada dirección: una por cada dos varillas de la cara (mínimo 2).
  const ramas = (n) => Math.max(2, Math.ceil(n / 2));
  return {
    n: total, nCuadro: ref.n, texto: `${total}Ø${C.barra}`, barra: C.barra, n2, n3, patron: `R-${n2}-${n3}`,
    areaBarra: areaVarilla(C.barra), estribo: C.estribo, areaEstribo: areaVarilla(C.estribo),
    espaciamiento: 0.1, recubrimiento: C.recubrimiento, ramas2: ramas(n2), ramas3: ramas(n3),
  };
}

// Espectro E.030: Sa/g = Z·U·C·S/R, con C = 2.5, 2.5·Tp/T o 2.5·Tp·TL/T².
export function espectroE030({Z, U, S, Tp, TL}, R) {
  const C = (T) => (T < Tp ? 2.5 : T < TL ? 2.5 * (Tp / T) : 2.5 * ((Tp * TL) / (T * T)));
  const Ts = [];
  for (let T = 0; T < 2 - 1e-9; T += 0.1) Ts.push(r4(T));
  for (let T = 2; T <= 10 + 1e-9; T += 0.5) Ts.push(r4(T));
  return Ts.map((T) => ({T, Sa: r4((Z * U * C(T) * S) / R)}));
}

// estructura: ctx.memoria.estructura (columnas con nodo/b/h/tipo, ejesNombrados con p/q, escala k).
// modelo: ctx.memoria.modeloEstructural (niveles, entrepisos, techo, vigas por eje, losa, cimentación).
// datos: datos del proyecto (zona, suelo, categoría). R0: coeficiente básico de reducción (E.030 Tabla 7).
export function modeloE2k({estructura, modelo, datos = {}, nombre = "modelo", R0 = 8}) {
  const supuestos = [], avisos = [];
  const k = Number(estructura?.escala) || 1;
  const columnas = (estructura?.columnas ?? []).filter((c) => c.nodo || (Number.isFinite(c.x) && Number.isFinite(c.y)));
  if (columnas.length < 2) throw new Error("Hacen falta al menos dos columnas leídas para armar el modelo de análisis.");
  const ejes = (estructura.ejesNombrados ?? []).filter((e) => e?.p && e?.q);
  if (ejes.some((e) => e.inclinado)) avisos.push("Hay ejes inclinados: el modelo solo arma los ejes ortogonales; revisa los elementos sobre ejes inclinados.");

  // ---- Puntos: un nudo por cruce de ejes con columna (en metros, origen en el menor x/y) ----
  const base = columnas.map((c) => c.nodo ?? {x: c.x, y: c.y});
  const x0 = Math.min(...base.map((p) => p.x)), y0 = Math.min(...base.map((p) => p.y));
  const aM = (p) => ({x: r4((p.x - x0) / k), y: r4((p.y - y0) / k)});
  const puntos = [];
  const puntoEn = (q) => puntos.find((p) => Math.hypot(p.x - q.x, p.y - q.y) < 0.05);
  for (const c of columnas) {
    const q = aM(c.nodo ?? {x: c.x, y: c.y});
    let p = puntoEn(q);
    if (!p) { p = {nombre: String(puntos.length + 1), ...q, columnas: []}; puntos.push(p); }
    p.columnas.push(c);
  }

  // ---- Pisos ----
  const niveles = Math.max(1, Number(modelo?.niveles) || 1);
  const entrepisos = (modelo?.entrepisos ?? []).map(Number).filter((v) => v > 0).sort((a, b) => a - b);
  let elev = [...entrepisos.slice(0, niveles - 1), Number(modelo?.techo) || 0].filter((v) => v > 0);
  if (elev.length !== niveles) {
    elev = Array.from({length: niveles}, (_, i) => r4(3 * (i + 1)));
    supuestos.push("Altura de piso de 3.00 m (la arquitectura no trae los niveles de todos los pisos).");
  }
  const pisos = elev.map((z, i) => ({nombre: `Piso${i + 1}`, elev: r4(z)}));
  supuestos.push("Columnas empotradas en la cota ±0.00 (base del modelo); la cimentación se diseña aparte con las reacciones.");

  // ---- Secciones ----
  const secciones = new Map(); // nombre → {b, h, tipo: Column|Beam}
  const seccion = (prefijo, b, h, tipo, forma = null, espesor = null, area = null) => {
    const nombre = `${prefijo}-${cm(b)}X${cm(h)}${forma ? `X${cm(espesor)}` : ""}`;
    if (!secciones.has(nombre)) secciones.set(nombre, {b, h, tipo, forma, espesor, armado: tipo === "Column" ? armadoColumnaE2k({b, h, area, forma, espesor}) : null});
    return nombre;
  };
  const enL = new Set();
  // Columnas en L o T con su sección real ("Concrete L" / "Concrete Tee"); su orientación en
  // planta (espejo) queda por confirmar.
  const seccionColumna = (c) => {
    const b = Number(c.b) || 0.25, h = Number(c.h) || 0.25, e = Number(c.espesor);
    const forma = (c.forma === "L" || c.forma === "T") && e > 0 && e < Math.min(b, h) ? c.forma : null;
    if (forma) enL.add(`${c.tipo} (${forma})`);
    return seccion(c.tipo || "C", b, h, "Column", forma, e, c.area);
  };

  // Sección de cada columna ANTES de escribir el archivo (la tabla de secciones va antes que las
  // asignaciones; registrarlas al asignar dejaba a las columnas sin su FRAMESECTION).
  for (const pt of puntos) pt.seccion = seccionColumna(pt.columnas[0]);
  // (los nudos sin columna se agregan después, en los cruces de vigas)

  // ---- Vigas: tramos entre columnas consecutivas sobre cada eje ----
  const vigasPorEje = new Map();
  for (const v of modelo?.vigas ?? []) if (v?.eje && v.b > 0 && v.h > 0) (vigasPorEje.get(v.eje) ?? vigasPorEje.set(v.eje, []).get(v.eje)).push(v);
  const seccionVigaDe = (eje) => {
    const vs = vigasPorEje.get(eje) ?? [];
    if (!vs.length) return null;
    const cuenta = new Map();
    for (const v of vs) { const key = `${v.b}|${v.h}`; cuenta.set(key, (cuenta.get(key) ?? 0) + 1); }
    const [b, h] = [...cuenta].sort((p, q) => q[1] - p[1])[0][0].split("|").map(Number);
    return {b, h};
  };
  // Cada eje recto: su recta y el tramo que cubren sus columnas (las vigas no salen de ahí).
  const ejesRectos = ejes.filter((e) => !e.inclinado).map((e) => {
    const p = aM(e.p), q = aM(e.q), largo = Math.hypot(q.x - p.x, q.y - p.y);
    if (largo < 0.1) return null;
    const u = {x: (q.x - p.x) / largo, y: (q.y - p.y) / largo};
    const t = (pt) => (pt.x - p.x) * u.x + (pt.y - p.y) * u.y;
    const d = (pt) => Math.abs((pt.x - p.x) * u.y - (pt.y - p.y) * u.x);
    const ts = puntos.filter((pt) => d(pt) < 0.15).map(t);
    return ts.length >= 2 ? {nombre: e.nombre, p, u, t, d, t0: Math.min(...ts), t1: Math.max(...ts)} : null;
  }).filter(Boolean);
  // Nudos sin columna donde se cruzan dos ejes dentro de sus tramos: ahí se apoya una viga en otra
  // y se cierran los paños de losa (módulos con albañilería: no hay columna en cada cruce).
  for (let a = 0; a < ejesRectos.length; a++) {
    for (let b = a + 1; b < ejesRectos.length; b++) {
      const A = ejesRectos[a], B = ejesRectos[b];
      const det = A.u.x * B.u.y - A.u.y * B.u.x;
      if (Math.abs(det) < 0.5) continue; // casi paralelos
      const w = {x: B.p.x - A.p.x, y: B.p.y - A.p.y};
      const ta = (w.x * B.u.y - w.y * B.u.x) / det;
      const X = {x: r4(A.p.x + A.u.x * ta), y: r4(A.p.y + A.u.y * ta)};
      const dentro = (E) => E.t(X) >= E.t0 - 0.05 && E.t(X) <= E.t1 + 0.05;
      if (!dentro(A) || !dentro(B) || puntoEn(X)) continue;
      puntos.push({nombre: String(puntos.length + 1), ...X, columnas: []});
    }
  }
  const vigas = [];
  let sinSeccion = 0;
  for (const E of ejesRectos) {
    const sobre = puntos.filter((pt) => E.d(pt) < 0.15 && E.t(pt) >= E.t0 - 0.05 && E.t(pt) <= E.t1 + 0.05).sort((a, b) => E.t(a) - E.t(b));
    let sec = seccionVigaDe(E.nombre);
    if (!sec) { sec = {b: 0.25, h: 0.4}; sinSeccion++; }
    for (let i = 1; i < sobre.length; i++) {
      const a = sobre[i - 1], b = sobre[i];
      if (vigas.some((v) => (v.i === a && v.j === b) || (v.i === b && v.j === a))) continue;
      vigas.push({i: a, j: b, eje: E.nombre, seccion: seccion("V", sec.b, sec.h, "Beam")});
    }
  }
  const tieneViga = (a, b) => vigas.some((v) => (v.i === a && v.j === b) || (v.i === b && v.j === a));
  if (sinSeccion) supuestos.push(`Viga 0.25x0.40 en ${sinSeccion} eje(s) sin sección dibujada en la losa.`);
  if (enL.size) supuestos.push(`Columnas ${[...enL].join(", ")} con su sección en L/T; confirma su orientación en planta.`);

  // ---- Losas: paños entre ejes cerrados por vigas ----
  const xs = [...new Set(puntos.map((p) => p.x))].sort((a, b) => a - b);
  const ys = [...new Set(puntos.map((p) => p.y))].sort((a, b) => a - b);
  const paños = [];
  for (let i = 1; i < xs.length; i++) {
    for (let j = 1; j < ys.length; j++) {
      const esquinas = [[xs[i - 1], ys[j - 1]], [xs[i], ys[j - 1]], [xs[i], ys[j]], [xs[i - 1], ys[j]]].map(([x, y]) => puntoEn({x, y}));
      // Paño cerrado por cuatro vigas (sus esquinas pueden ser cruces de vigas sin columna).
      if (esquinas.every(Boolean) && esquinas.every((e, n) => tieneViga(e, esquinas[(n + 1) % 4]))) paños.push(esquinas);
    }
  }
  const espesor = Number(modelo?.losa?.espesor) || 0.2;
  const sinLosaTecho = niveles === 1 && modelo?.losaTecho === false;
  const losa = `ALIG-${cm(espesor)}`;
  if (sinLosaTecho) avisos.push("Techo de cobertura liviana (sin losa): el modelo no incluye el peso de la cobertura; agrégalo como carga sobre las vigas de techo.");
  else if (!paños.length) avisos.push("No encontré paños cerrados por vigas: el modelo va sin losas (agrega las cargas a las vigas).");

  // ---- Cargas E.020 (kgf/m² → tonf/m²) ----
  const categoria = String(datos.categoria || "").toUpperCase() || null;
  const cvUso = CARGA_VIVA[categoria] ?? CARGA_VIVA.C;
  if (!categoria) supuestos.push("Categoría C (vivienda): carga viva 200 kgf/m²; confirma el uso.");
  const cargasPiso = (iPiso) => {
    const techo = iPiso === pisos.length - 1;
    const cm_ = pesoAligerado(espesor) + ACABADOS + (techo ? 0 : TABIQUERIA_EQUIVALENTE);
    return {CM: cm_ / 1000, CV: (techo ? CARGA_VIVA.techo : cvUso) / 1000};
  };
  supuestos.push(`Cargas E.020: aligerado ${pesoAligerado(espesor)} + acabados ${ACABADOS}${pisos.length > 1 ? ` + tabiquería ${TABIQUERIA_EQUIVALENTE}` : ""} kgf/m²; viva ${cvUso} kgf/m² (techo ${CARGA_VIVA.techo}).`);

  // ---- Sismo E.030 ----
  const p = parametrosSismicos({zona: datos.zona, suelo: datos.suelo, categoria: categoria ?? undefined});
  const sismo = {Z: p.Z, U: p.U ?? 1.0, S: p.S, Tp: p.Tp, TL: p.TL};
  const faltanSismo = ["Z", "S", "Tp", "TL"].filter((key) => !(sismo[key] > 0));
  if (faltanSismo.length) avisos.push(`Faltan datos sísmicos (zona y suelo): el modelo va sin espectro E.030. Completa ${faltanSismo.includes("Z") ? "la zona" : ""}${faltanSismo.includes("S") ? " y el perfil de suelo" : ""} en Datos del proyecto.`);
  const R = R0; // Ia = Ip = 1 hasta verificar irregularidades
  // R en el nombre del espectro: la Revisión del agente en Análisis Estructural lo lee de ahí.
  const funcionE030 = `E030-R${R}`;
  supuestos.push(`R = ${R0} (pórticos de concreto armado, E.030 Tabla 7) con Ia = Ip = 1 hasta verificar irregularidades.`);

  // ================= Texto .e2k =================
  const L = [];
  const ahora = new Date(), d2 = (n) => String(n).padStart(2, "0");
  const sello = `${d2(ahora.getDate())}/${d2(ahora.getMonth() + 1)}/${ahora.getFullYear()} ${d2(ahora.getHours())}:${d2(ahora.getMinutes())}:${d2(ahora.getSeconds())}`;
  const archivo = String(nombre).replace(/[^\w\-]+/g, "_") || "modelo";
  L.push(`$ File ${archivo}.e2k saved ${sello}`, "", "$ PROGRAM INFORMATION", '  PROGRAM  "ETABS"  VERSION "22.7.0"  ', "");
  L.push("$ CONTROLS", '  UNITS  "TONF"  "M"  "C"  ', `  TITLE1  "Modelo generado por el agente NovaCad desde la arquitectura"  `, "  PREFERENCE  MERGETOL 0.001", "");

  L.push("$ STORIES - IN SEQUENCE FROM TOP");
  const arriba = [...pisos].reverse();
  arriba.forEach((s, i) => {
    const debajo = arriba[i + 1]?.elev ?? 0;
    L.push(`  STORY "${s.nombre}"  HEIGHT ${fmt(s.elev - debajo)} `);
  });
  L.push('  STORY "Base"  ELEV 0 ', "");

  L.push("$ GRIDS", '  GRIDSYSTEM "G1"  TYPE "CARTESIAN"  BUBBLESIZE 1.25 ');
  for (const e of ejes.filter((x) => !x.inclinado)) {
    const p0 = aM(e.p), p1 = aM(e.q);
    const vertical = Math.abs(p1.x - p0.x) < Math.abs(p1.y - p0.y);
    L.push(`  GRID "G1"  LABEL "${e.nombre}"  DIR "${vertical ? "X" : "Y"}"  COORD ${fmt(vertical ? (p0.x + p1.x) / 2 : (p0.y + p1.y) / 2)} VISIBLE "Yes"  BUBBLELOC "${vertical ? "End" : "Start"}"  `);
  }
  L.push("", "$ DIAPHRAGM NAMES", '  DIAPHRAGM "D1"    TYPE RIGID', "");

  // f'c 210 kg/cm²: E = 15000·√f'c kg/cm²; ×10 → tonf/m².
  const E = r4(15000 * Math.sqrt(210) * 10);
  L.push("$ MATERIAL PROPERTIES");
  for (const [nombreMat, peso] of [["CONC210", 2.4], ["CONC210-LOSA", 0]]) {
    L.push(`  MATERIAL  "${nombreMat}"    TYPE "Concrete"    WEIGHTPERVOLUME ${fmt(peso)}`);
    L.push(`  MATERIAL  "${nombreMat}"    SYMTYPE "Isotropic"  E ${fmt(E)}  U 0.2  A 0.0000099`);
    L.push(`  MATERIAL  "${nombreMat}"  FC 2100`);
  }
  L.push("");
  supuestos.push("Concreto f'c = 210 kg/cm² (E = 15000√f'c) en columnas, vigas y losas; el peso del aligerado va como carga muerta.");

  L.push("$ FRAME SECTIONS");
  for (const [n, s] of secciones) {
    if (s.forma === "L") L.push(`  FRAMESECTION  "${n}"  MATERIAL "CONC210"  SHAPE "Concrete L"  D ${fmt(s.h)} B ${fmt(s.b)} TF ${fmt(s.espesor)} TW ${fmt(s.espesor)} `);
    else if (s.forma === "T") L.push(`  FRAMESECTION  "${n}"  MATERIAL "CONC210"  SHAPE "Concrete Tee"  D ${fmt(s.h)} B ${fmt(s.b)} TF ${fmt(s.espesor)} TW ${fmt(s.espesor)} `);
    else L.push(`  FRAMESECTION  "${n}"  MATERIAL "CONC210"  SHAPE "Concrete Rectangular"  D ${fmt(s.h)} B ${fmt(s.b)} `);
  }
  L.push("", "$ CONCRETE SECTIONS");
  for (const [n, s] of secciones) {
    const a = s.armado;
    // Columnas con su armado fijo (DESIGNCHECK "CHECK"): ETABS y el diseño de columnas de la app
    // VERIFICAN el acero que dibuja la lámina en vez de dimensionar uno distinto.
    L.push(a
      ? `  CONCRETESECTION  "${n}"  LONGBARMATERIAL "fy=4200 kg/cm2"  CONFINEBARMATERIAL "fy=4200 kg/cm2"  TYPE "Column"  PATTERN "${a.patron}"  TRANSREINF "Ties"  COVER ${fmt(a.recubrimiento)}  NUMCONFINEBARS2 ${a.ramas2}  NUMCONFINEBARS3 ${a.ramas3}  LONGBARAREA ${a.areaBarra.toExponential(4)}  CONFINEBARAREA ${a.areaEstribo.toExponential(4)}  CONFINEBARSPACING ${fmt(a.espaciamiento)}  DESIGNCHECK "CHECK" `
      : `  CONCRETESECTION  "${n}"  LONGBARMATERIAL "fy=4200 kg/cm2"  CONFINEBARMATERIAL "fy=4200 kg/cm2"  TYPE "${s.tipo}"  COVER 0.04 `);
  }
  L.push("");
  const armados = [...secciones].filter(([, s]) => s.armado);
  if (armados.length) {
    supuestos.push(`Columnas con el refuerzo del cuadro de columnas (cuantía 1 %, Ø${CRITERIOS.columnas.barra}, estribos Ø${CRITERIOS.columnas.estribo}, recubrimiento ${cm(CRITERIOS.columnas.recubrimiento)} cm): ${armados.map(([n, s]) => `${n} ${s.armado.texto}`).join(", ")}. El diseño de columnas lo verifica con las fuerzas del análisis.`);
    const distintos = armados.filter(([, s]) => s.armado.n !== s.armado.nCuadro);
    if (distintos.length) avisos.push(`El patrón de ETABS en L/T no admite el mismo número de varillas del cuadro: ${distintos.map(([n, s]) => `${n} ${s.armado.n} en vez de ${s.armado.nCuadro}`).join(", ")} (una varilla más, del lado seguro).`);
  }
  if (paños.length && !sinLosaTecho) {
    L.push("$ SLAB PROPERTIES", `  SHELLPROP  "${losa}"  PROPTYPE  "Slab"  MATERIAL "CONC210-LOSA"  MODELINGTYPE "Membrane"  SLABTYPE "Slab"  SLABTHICKNESS ${fmt(espesor)} `, "");
  }

  L.push("$ POINT COORDINATES");
  for (const pt of puntos) L.push(`  POINT "${pt.nombre}"  ${fmt(pt.x)} ${fmt(pt.y)} `);
  L.push("", "$ LINE CONNECTIVITIES");
  const conColumna = puntos.filter((pt) => pt.columnas.length);
  conColumna.forEach((pt, i) => { pt.columna = `C${i + 1}`; L.push(`  LINE  "${pt.columna}"  COLUMN  "${pt.nombre}"  "${pt.nombre}"  1`); });
  vigas.forEach((v, i) => { v.nombre = `B${i + 1}`; L.push(`  LINE  "${v.nombre}"  BEAM  "${v.i.nombre}"  "${v.j.nombre}"  0`); });
  L.push("");
  const conLosa = paños.length && !sinLosaTecho;
  if (conLosa) {
    L.push("$ AREA CONNECTIVITIES");
    paños.forEach((e, i) => L.push(`  AREA "F${i + 1}"  FLOOR  4  ${e.map((pt) => `"${pt.nombre}"`).join("  ")}  0  0  0  0  `));
    L.push("");
  }

  L.push("$ POINT ASSIGNS");
  for (const pt of conColumna) L.push(`  POINTASSIGN  "${pt.nombre}"  "Base"  RESTRAINT "UX UY UZ RX RY RZ"  `);
  L.push("", "$ LINE ASSIGNS");
  for (const s of pisos) {
    for (const pt of conColumna) L.push(`  LINEASSIGN  "${pt.columna}"  "${s.nombre}"  SECTION "${pt.seccion}"  MINNUMSTA 3 AUTOMESH "YES"  MESHATINTERSECTIONS "YES"  `);
    for (const v of vigas) L.push(`  LINEASSIGN  "${v.nombre}"  "${s.nombre}"  SECTION "${v.seccion}"  MINNUMSTA 3 AUTOMESH "YES"  MESHATINTERSECTIONS "YES"  `);
  }
  L.push("");
  if (conLosa) {
    L.push("$ AREA ASSIGNS");
    for (const s of pisos) paños.forEach((_, i) => L.push(`  AREAASSIGN  "F${i + 1}"  "${s.nombre}"  SECTION "${losa}"  DIAPH "D1"  OBJMESHTYPE "DEFAULT"  ADDRESTRAINT "Yes"  CARDINALPOINT "TOP"  TRANSFORMSTIFFNESSFOROFFSETS "No"  `));
    L.push("");
  }

  L.push("$ LOAD PATTERNS", '  LOADPATTERN "CM"  TYPE  "Dead"  SELFWEIGHT  1', '  LOADPATTERN "CV"  TYPE  "Live"  SELFWEIGHT  0', "");
  if (conLosa) {
    L.push("$ SHELL OBJECT LOADS");
    pisos.forEach((s, iPiso) => {
      const c = cargasPiso(iPiso);
      paños.forEach((_, i) => {
        L.push(`  AREALOAD  "F${i + 1}"  "${s.nombre}"  TYPE "UNIFF"  DIR "GRAV"  LC "CM"  FVAL ${fmt(c.CM)}`);
        L.push(`  AREALOAD  "F${i + 1}"  "${s.nombre}"  TYPE "UNIFF"  DIR "GRAV"  LC "CV"  FVAL ${fmt(c.CV)}`);
      });
    });
    L.push("");
  }
  L.push("$ ANALYSIS OPTIONS", '  ACTIVEDOF "UX UY UZ RX RY RZ"  ', '  PDELTA  METHOD "NONE"  ', "");

  const fViva = FRACCION_VIVA_MASA[categoria] ?? 0.25;
  L.push("$ MASS SOURCE", '  MASSSOURCE  "MsSrc1"    INCLUDEELEMENTS "Yes"    INCLUDEADDEDMASS "No"    INCLUDELOADS "Yes"    LUMPATSTORIES "Yes"    ISDEFAULT "Yes"  ');
  L.push('  MASSSOURCELOAD  "MsSrc1"  "CM"  1', `  MASSSOURCELOAD  "MsSrc1"  "CV"  ${fViva}`, "");

  const conEspectro = !faltanSismo.length;
  if (conEspectro) {
    const puntosEsp = espectroE030(sismo, R).map((q) => `${fmt(q.T)}  ${fmt(q.Sa)}`);
    L.push("$ FUNCTIONS", `  FUNCTION "${funcionE030}"  FUNCTYPE "SPECTRUM"  DAMPRATIO 0.05  SPECTYPE "USER"  `);
    for (let i = 0; i < puntosEsp.length; i += 8) L.push(`  FUNCTION "${funcionE030}"  TIMEVAL "${puntosEsp.slice(i, i + 8).join("  ")}"  `);
    L.push("");
  }

  L.push("$ LOAD CASES");
  L.push('  LOADCASE "Modal"  TYPE  "Modal - Eigen"  INITCOND  "PRESET"  ', `  LOADCASE "Modal"  MAXMODES  ${3 * pisos.length} MINMODES  1 `);
  for (const c of ["CM", "CV"]) L.push(`  LOADCASE "${c}"  TYPE  "Linear Static"  INITCOND  "PRESET"  `, `  LOADCASE "${c}"  LOADPAT  "${c}"  SF  1 `);
  if (conEspectro) {
    for (const [nombreCaso, dir] of [["SDX", "U1"], ["SDY", "U2"]]) {
      L.push(`  LOADCASE "${nombreCaso}"  TYPE  "Response Spectrum"  MODALCASE  "Modal"  `);
      L.push(`  LOADCASE "${nombreCaso}"  ACCEL  "${dir}"  FUNC  "${funcionE030}"  SF  9.80665 `);
      L.push(`  LOADCASE "${nombreCaso}"  MODALDAMPTYPE  "Constant"  CONSTDAMP  0.05 `, `  LOADCASE "${nombreCaso}"  ECCENRATIOTYPICAL  0.05 `);
    }
  }
  L.push("");

  // Combinaciones E.060 art. 9.2 (las que el ingeniero define a mano en ETABS).
  const combos = [["1.4CM+1.7CV", [["CM", 1.4], ["CV", 1.7]]]];
  if (conEspectro) {
    for (const s of ["SDX", "SDY"]) {
      for (const sg of [1, -1]) {
        combos.push([`1.25(CM+CV)${sg > 0 ? "+" : "-"}${s}`, [["CM", 1.25], ["CV", 1.25], [s, sg]]]);
        combos.push([`0.9CM${sg > 0 ? "+" : "-"}${s}`, [["CM", 0.9], [s, sg]]]);
      }
    }
  }
  L.push("$ LOAD COMBINATIONS");
  for (const [n, terms] of combos) {
    L.push(`  COMBO "${n}"  TYPE "Linear Add"  `, `  COMBO "${n}"  DESIGN "Concrete"  COMBOTYPE "Strength"  `);
    for (const [c, f] of terms) L.push(`  COMBO "${n}"  LOADCASE "${c}"  SF ${fmt(f)} `);
  }
  L.push("", "$ PROJECT INFORMATION", `  PROJECTINFO    MODELNAME "${archivo}"  `, "");
  L.push("$ LOG", "  STARTCOMMENTS  ", "", `ETABS Ultimate  22.7.0 File saved as ${archivo}.EDB at ${sello}`, "  ENDCOMMENTS  ", "", "  END", "$ END OF MODEL FILE");

  return {
    texto: L.join("\r\n") + "\r\n",
    resumen: {pisos: pisos.length, nudos: puntos.length, apoyos: conColumna.length, columnas: conColumna.length * pisos.length, vigas: vigas.length * pisos.length, losas: conLosa ? paños.length * pisos.length : 0,
      secciones: [...secciones.keys()],
      armadoColumnas: Object.fromEntries([...secciones].filter(([, s]) => s.armado).map(([n, s]) => [n, s.armado])), sismo: conEspectro ? {...sismo, R} : null, combinaciones: combos.map(([n]) => n)},
    supuestos, avisos,
  };
}
