// Arquitectura → estructuras: pórtico (elevación) de un eje con columnas, con el
// criterio del expediente de referencia (criteriosEstructurales.js, módulo XIV):
//
// - Cimentación con platea: la platea ("zapata corrida Hz") va abajo, de NFZ = -Df a
//   -Df + Hz, sobre la falsa zapata; encima relleno compactado, cimiento corrido
//   ciclópeo (CC) de -0.80 a 0.00 y sobrecimiento (SC) bajo los muros.
//   Con zapatas: zapata bajo cada columna y el mismo CC/SC entre columnas.
// - Techo: si el eje cruza la viga de cumbrera, techo a dos aguas con la pendiente de
//   la arquitectura (PTE=33 %), cobertura TR4 y canaletas en los aleros; si no, plano
//   a la altura del alero (TECHO NFP = N.F.T. de la arquitectura).
// - Columnas, vigas y columnetas con su acero en elevación; muros entre ellas con sus
//   vanos (puertas con DINTEL, ventanas con alféizar y VSa) leídos de la arquitectura.
// - Niveles (BASE NPN, TECHO NFP, CUMBRERA, NFZ), burbujas de los ejes que cruzan,
//   cotas en cadena y la sección de la viga.
// Coordenadas: x a lo largo del eje desde la primera columna; y = cota (0 = NPN).

import {L, line, pline, circle, text, cota, hatch} from "../cad/primitives.js";
import {CRITERIOS, textoEstribos, posicionesEstribos} from "../criterios/criteriosEstructurales.js";
// Armado de la viga: el mismo que se metra (varillas corridas del despacho).
import {criteriosMetrado} from "../metrado/metrado.js";

const r4 = (v) => Math.round(v * 10000) / 10000;
const pt = (x, y) => [r4(x), r4(y)];
const rect = (layer, x0, y0, x1, y1) => pline(layer, [pt(x0, y0), pt(x1, y0), pt(x1, y1), pt(x0, y1)], true);

// Niveles escritos en la arquitectura, con cuántas veces aparece cada valor: N.P.T. (piso
// terminado), N.F.T. (fondo de techo) y N.T.T. (techo terminado). "NPT= +3.65", "N.P.T: +3.35",
// "N.F.T: +12.97m", "NTT=+10.65". Solo valores con signo + (los -3.20 de un sótano no son pisos).
const PATRON_NIVEL = {
  npt: /N\.?\s*P\.?\s*T\.?\s*[=:]?\s*\+\s*(\d+(?:[.,]\d+)?)/i,
  nft: /N\.?\s*F\.?\s*T\.?\s*[:=]?\s*\+?\s*(\d+(?:[.,]\d+)?)/i,
  ntt: /N\.?\s*T\.?\s*T\.?\s*[:=]?\s*\+?\s*(\d+(?:[.,]\d+)?)/i,
};
export function textosDeNivel(items) {
  const r = {npt: new Map(), nft: new Map(), ntt: new Map()};
  for (const it of items) {
    if (it.tipo !== "texto") continue;
    for (const [k, re] of Object.entries(PATRON_NIVEL)) {
      const m = re.exec(it.texto ?? "");
      if (!m) continue;
      const v = Math.round(Number(m[1].replace(",", ".")) * 100) / 100;
      if (Number.isFinite(v)) r[k].set(v, (r[k].get(v) ?? 0) + 1);
    }
  }
  return r;
}
// Los valores que la arquitectura repite (los pisos se rotulan en cada vista y en los cortes);
// los que salen una o dos veces son descansos de escalera, graderías o desniveles.
const frecuentes = (mapa) => {
  const max = Math.max(0, ...mapa.values());
  return [...mapa].filter(([, n]) => n >= Math.max(3, max * 0.2)).map(([v]) => v).sort((a, b) => a - b);
};

// Base del módulo: si TODOS los N.P.T. frecuentes son un solo valor alto (el módulo está sobre una
// plataforma: "N.P.T: +3.35" en todo el plano y nada más), los niveles se cuentan desde ahí, como
// el ingeniero (su NPN ±0.00 es ese piso). Con un +0.15 o varios pisos no se desplaza nada.
function baseDelModulo(niveles) {
  const npt = frecuentes(niveles.npt);
  return npt.length === 1 && npt[0] >= 1 ? npt[0] : 0;
}

// Cumbrera escrita en la arquitectura: el N.T.T. (techo terminado) más alto que queda sobre el
// techo del alero (más de 0.30 m y hasta 4 m arriba). En el módulo 8 la arquitectura anota
// N.T.T. +4.44 y el ingeniero pone CUMBRERA +4.45; con la pendiente sola salía +4.06.
export function cumbreraDesdeArquitectura(items, techo) {
  const n = textosDeNivel(items);
  const base = baseDelModulo(n);
  const altos = [...n.ntt.keys()].map((v) => v - base).filter((v) => v > techo + 0.3 && v <= techo + 4);
  return altos.length ? Math.max(...altos) : null;
}

// Techo de un nivel (TECHO NFP del pórtico, sobre el piso del módulo): el mayor N.F.T. entre 2.2 y
// 10 m; si no hay, el N.T.T. (techo terminado) en ese rango; si tampoco, 3 m.
export function alturaDesdeArquitectura(items) {
  const n = textosDeNivel(items);
  const base = baseDelModulo(n);
  const enRango = (mapa) => [...mapa.keys()].map((v) => v - base).filter((v) => v >= 2.2 && v <= 10);
  const nft = enRango(n.nft), ntt = enRango(n.ntt);
  // El N.F.T. más alto dentro de 6 m (el fondo de techo de la planta); más alto, el de una nave.
  const bajos = nft.filter((v) => v <= 6);
  if (bajos.length) return Math.max(...bajos);
  if (nft.length) return Math.min(...nft);
  if (ntt.length) return Math.min(...ntt);
  return 3;
}

// Niveles de un edificio de n pisos: el piso de cada nivel superior (NPT +3.65 del módulo 9)
// y el techo (NPT +7.15). Un nivel superior está al menos 2.2 m sobre el anterior y se rotula
// varias veces (los N.P.T. sueltos son descansos o desniveles).
// ocultos(): textos de capas apagadas o congeladas, solo si los visibles no alcanzan (en el
// módulo 9 los NPT del 2do nivel y del techo están en capas congeladas). Si tampoco están, el
// techo es el N.F.T. sobre el último piso y, si no hay, cada piso repite la altura del primero.
// fuente dice de dónde salió, para avisar.
export function nivelesDesdeArquitectura(items, niveles = 1, ocultos = () => []) {
  const primero = alturaDesdeArquitectura(items);
  if (niveles <= 1) return {entrepisos: [], techo: primero, fuente: "visible"};
  const pisosDe = (lista) => {
    const n = textosDeNivel(lista);
    const unicos = frecuentes(n.npt).filter((v) => v >= 2.2 && v <= 4.5 * niveles);
    const pisos = [];
    for (const v of unicos) if (v - (pisos.at(-1) ?? 0) >= 2.2) pisos.push(v);
    return pisos;
  };
  let pisos = pisosDe(items), fuente = "visible";
  if (pisos.length < niveles) {
    const otros = pisosDe(ocultos());
    if (otros.length > pisos.length) { pisos = otros; fuente = "capa oculta"; }
  }
  if (pisos.length < niveles - 1) fuente = "supuesta";
  const entrepisos = [];
  for (let n = 1; n < niveles; n++) entrepisos.push(pisos[n - 1] ?? (entrepisos.at(-1) ?? 0) + primero);
  // Techo sin N.P.T. propio: el N.F.T. (o N.T.T.) entre 2.2 y 6 m sobre el último piso.
  const ultimo = entrepisos.at(-1);
  const n = textosDeNivel(items);
  const sobre = (mapa) => [...mapa.keys()].filter((v) => v - ultimo >= 2.2 && v - ultimo <= 6).sort((a, b) => a - b)[0];
  const techo = pisos[niveles - 1] ?? sobre(n.nft) ?? sobre(n.ntt) ?? ultimo + primero;
  return {entrepisos, techo, fuente};
}

// Pendiente del techo: el menor "PTE=33%" de la arquitectura (la cobertura); si no hay, el criterio.
// ¿La arquitectura escribe una pendiente de techo (≥ 5 %: una de piso como S=0.5 % no cuenta)?
export function pendienteAnotada(items = []) {
  return items.some((it) => it.tipo === "texto" && (() => { const m = PATRON_PENDIENTE.exec(it.texto ?? ""); return Boolean(m) && Number(m[1].replace(",", ".")) >= 5; })());
}
const PATRON_PENDIENTE = /(?:PTE|PEND(?:IENTE)?)\.?\s*[=:]?\s*(\d+(?:[.,]\d+)?)\s*%/i;

export function pendienteDesdeArquitectura(items) {
  const valores = [];
  for (const it of items) {
    if (it.tipo !== "texto") continue;
    const m = /(?:PTE|PEND(?:IENTE)?)\.?\s*[=:]?\s*(\d+(?:[.,]\d+)?)\s*%/i.exec(it.texto);
    if (m) valores.push(Number(m[1].replace(",", ".")) / 100);
  }
  const utiles = valores.filter((v) => v >= 0.05 && v <= 1.5);
  return utiles.length ? Math.min(...utiles) : CRITERIOS.techo.pendiente;
}

// Vanos de la arquitectura: rótulos "P-10" (puertas) y "V-3" (ventanas) y los puntos de
// los bloques de puerta, en metros.
export function vanosDesdeArquitectura(items, k = 1) {
  const vanos = [];
  for (const it of items) {
    if (it.tipo === "texto") {
      const m = /^([PV])\s*-\s*\d+[A-Z]?$/i.exec(it.texto.trim());
      if (m) vanos.push({tipo: m[1].toUpperCase() === "P" ? "puerta" : "ventana", nombre: it.texto.trim().toUpperCase(), p: {x: it.centro.x / k, y: it.centro.y / k}, alcance: m[1].toUpperCase() === "V" ? 1.2 : 0.9});
    } else if (/puerta|door/i.test(it.bloque ?? "")) {
      for (const q of it.puntos ?? [it.centro]) if (q) vanos.push({tipo: "puerta", nombre: "", p: {x: q.x / k, y: q.y / k}, alcance: 0.35, hoja: true});
    }
  }
  return vanos;
}

// eje: {nombre, p, q}; columnas del eje (con contorno, nodo, eje "A/B", tipo).
// cimentacion: {tipo: "platea"|"zapatas", peralte, df}.
// cumbrera: {a, d} recta de la viga de cumbrera en planta (o null); pendiente: 0.33.
// entrepisos: pisos de los niveles superiores (NPT, m) en edificios de varios niveles: en cada
// uno van su viga y su losa, y muros, columnetas y estribos se dibujan por nivel.
// losaTecho: false cuando el último nivel lleva solo cobertura (sin losa de techo).
export function planoPortico({eje, columnas, altura = 3, espesorLosa = 0.2, viga = {b: 0.25, h: 0.4}, cimentacion = {tipo: "zapatas"}, columnetas = [], cumbrera = null, pendiente = CRITERIOS.techo.pendiente, vanos = [], entrepisos = [], losaTecho = true, nivelCumbrera = null}) {
  const ux = eje.q.x - eje.p.x, uy = eje.q.y - eje.p.y, l = Math.hypot(ux, uy) || 1;
  const u = {x: ux / l, y: uy / l};
  const proy = (p) => (p.x - eje.p.x) * u.x + (p.y - eje.p.y) * u.y;
  const lista = columnas.map((c) => {
    const s = c.contorno.map(proy);
    return {c, s0: Math.min(...s), s1: Math.max(...s), sn: proy(c.nodo), cruce: c.eje.split("/").find((n) => n !== eje.nombre) ?? ""};
  }).sort((a, b) => a.sn - b.sn);
  // Línea del muro del pórtico: la que une los centros de las columnas extremas (las
  // columnas suelen ir a un lado del eje; en ejes inclinados el eje se aleja del muro).
  const m0 = lista[0].c, m1 = lista.at(-1).c;
  const lm = Math.hypot(m1.x - m0.x, m1.y - m0.y) || 1;
  const distEje = (p) => Math.abs((p.x - m0.x) * -(m1.y - m0.y) / lm + (p.y - m0.y) * (m1.x - m0.x) / lm);
  const origen = lista[0].sn;
  lista.forEach((x) => { x.s0 -= origen; x.s1 -= origen; x.sn -= origen; });
  const largo = lista.at(-1).sn;
  const h = Math.max(0.12, Math.min(0.3, (largo + 2) / 40));
  const rb = h * 1.6;
  const alero = CRITERIOS.aligerado.alero;
  const xa = lista[0].s0, xb = lista.at(-1).s1;
  const C = CRITERIOS.columnas, V = CRITERIOS.vigas, CC = CRITERIOS.columnetas, VN = CRITERIOS.vanos;
  const rec = C.recubrimiento, vh = viga.h;
  const prim = [];
  const notas = [];

  // ---- Perfil del techo: y(x) = nivel superior de la losa. ----
  const T = altura; // TECHO NFP en el alero (N.F.T. de la arquitectura), como el expediente (+3.57 / +3.58)
  let xr = null, H = T, sL = 0, sR = 0;
  if (cumbrera && lista.length >= 2) {
    const den = u.x * cumbrera.d.y - u.y * cumbrera.d.x;
    if (Math.abs(den) > 0.5) { // el eje cruza la cumbrera (casi perpendicular)
      const s = ((cumbrera.a.x - eje.p.x) * cumbrera.d.y - (cumbrera.a.y - eje.p.y) * cumbrera.d.x) / den - origen;
      const iL = lista[0].s1, iR = lista.at(-1).s0;
      if (s > iL + 0.3 && s < iR - 0.3) {
        xr = s;
        H = T + pendiente * ((xr - iL) + (iR - xr)) / 2; // la pendiente se mide desde la cara interior de la columna
        if (nivelCumbrera > T + 0.3) H = nivelCumbrera; // la cota de la arquitectura manda sobre la pendiente
        sL = (H - T) / (xr - iL); sR = (H - T) / (iR - xr);
      }
    }
  }
  const dosAguas = xr !== null;
  const y = (x) => (!dosAguas ? T : x <= xr ? H - sL * (xr - x) : H - sR * (x - xr));
  // Puntos del perfil entre a y b (con la cumbrera si cae dentro), desplazados dy.
  const perfil = (a, b, dy = 0) => [a, ...(dosAguas && xr > a && xr < b ? [xr] : []), b].map((x) => pt(x, y(x) + dy));

  // ---- Cimentación ----
  const platea = cimentacion.tipo === "platea";
  const df = cimentacion.df ?? (platea ? CRITERIOS.platea.df : 1.5);
  const hz = cimentacion.peralte ?? (platea ? CRITERIOS.platea.espesor : 0.6);
  const nfc = -CRITERIOS.cimientoCorrido.alto; // fondo del cimiento corrido (-0.80)
  const baseCol = -df + hz;                    // las columnas nacen sobre la platea o zapata
  const fz = 0.5;                              // alto de la falsa zapata dibujada
  if (platea) {
    prim.push(rect(L.PLATEA, xa - 0.3, -df, xb + 0.3, -df + hz));
    prim.push(hatch(L.PLATEA, [pt(xa - 0.3, -df), pt(xb + 0.3, -df), pt(xb + 0.3, -df + hz), pt(xa - 0.3, -df + hz)], {patron: "AR-CONC", escala: 0.04}));
    prim.push(text(L.PLATEA, pt((xa + xb) / 2, -df + hz / 2), `PLATEA DE CIMENTACIÓN Hz = ${hz.toFixed(2)} m · ${CRITERIOS.platea.acero} sup. e inf.`, Math.min(h * 0.42, ((xb - xa + 0.6) * 0.92) / 52)));
    // Malla inferior y superior de la platea.
    prim.push(line(L.ACERO_LONG, pt(xa - 0.3 + rec, -df + rec + 0.03), pt(xb + 0.3 - rec, -df + rec + 0.03)), line(L.ACERO_LONG, pt(xa - 0.3 + rec, -df + hz - rec - 0.03), pt(xb + 0.3 - rec, -df + hz - rec - 0.03)));
  } else {
    for (const x of lista) prim.push(rect(L.ZAPATAS, x.s0 - 0.4, -df, x.s1 + 0.4, -df + hz));
  }
  prim.push(rect(L.CIMIENTO, xa - 0.3, -df - fz, xb + 0.3, -df));
  prim.push(text(L.CIMIENTO, pt((xa + xb) / 2, -df - fz / 2), CRITERIOS.concreto.falsaZapata.toUpperCase(), h * 0.42));
  // Relleno compactado entre la platea y el cimiento corrido.
  prim.push(line(L.NIVELES, pt(xa, nfc), pt(xb, nfc)));
  // En el paño más ancho entre columnas, sin cruzar ninguna (visto en el visor: cruzaba columnas).
  if (platea && baseCol < nfc - 0.15) {
    const panos = lista.slice(0, -1).map((x, i) => ({a: x.s1, b: lista[i + 1].s0})).sort((p, q) => (q.b - q.a) - (p.b - p.a));
    const pano = panos[0] ?? {a: xa, b: xb};
    prim.push(text(L.NIVELES, pt((pano.a + pano.b) / 2, (baseCol + nfc) / 2), CRITERIOS.terreno.relleno, Math.min(h * 0.3, ((pano.b - pano.a) * 0.9) / (CRITERIOS.terreno.relleno.length * 0.6))));
  }
  // Terreno natural (NTN).
  prim.push(line(L.NIVELES, pt(xa - 1.2, 0), pt(xb + 1.2, 0)));

  // Niveles: pisos sobre el terreno (0 y los entrepisos) y el alto libre de cada uno.
  const pisos = [0, ...entrepisos.filter((z) => z > 1 && z < T - 1)];
  const alto1 = pisos[1] ?? T; // piso del 2do nivel o techo: el primer nivel va hasta ahí

  // ---- Columnas con su acero ----
  for (const x of lista) {
    prim.push(pline(L.COLUMNAS, [pt(x.s0, baseCol), pt(x.s1, baseCol), pt(x.s1, y(x.s1)), pt(x.s0, y(x.s0))], true));
    prim.push(text(L.COLUMNAS_ID, pt((x.s0 + x.s1) / 2, alto1 * 0.55), x.c.tipo, h * 0.7, 90));
    const tope = Math.min(y(x.s0), y(x.s1));
    prim.push(line(L.ACERO_LONG, pt(x.s0 + rec, -df + rec), pt(x.s0 + rec, y(x.s0) - rec)), line(L.ACERO_LONG, pt(x.s1 - rec, -df + rec), pt(x.s1 - rec, y(x.s1) - rec)));
    // Estribos por nivel: cada tramo de columna entre losas lleva su confinamiento.
    const tramos = pisos.map((z, i) => [i === 0 ? baseCol : z, (pisos[i + 1] ?? tope) - vh]);
    for (const [z0, z1] of tramos) for (const yy of posicionesEstribos(C.distribucion, z1 - z0)) prim.push(line(L.ESTRIBOS, pt(x.s0 + rec * 0.6, z0 + yy), pt(x.s1 - rec * 0.6, z0 + yy)));
  }
  prim.push(text(L.ESTRIBOS, pt(lista[0].s0 - h * 0.6, alto1 * 0.3), textoEstribos(C.estribo, C.distribucion, lista[0].c.forma === "rectangular" ? 1 : 2), h * 0.34, 90));

  // ---- Columnetas sobre el eje (pa, pb…) ----
  const postes = lista.map((x) => ({a: x.s0, b: x.s1, columna: true}));
  // Lo dibujado que se metra: alto real de cada columneta (bajo el techo inclinado) y los
  // largos de VSa y dinteles sobre los vanos.
  const modelo = {eje: eje.nombre, columnetas: [], vsa: [], dinteles: []};
  for (const c of columnetas) {
    const sc = proy(c) - origen;
    if (distEje(c) > 0.3 || sc < xa || sc > xb) continue;
    const s = c.contorno.map(proy).map((v) => v - origen);
    const c0 = Math.min(...s), c1 = Math.max(...s);
    if (c1 - c0 < 0.05 || postes.some((p) => c0 < p.b && c1 > p.a)) continue;
    postes.push({a: c0, b: c1, columneta: c});
    const tope = Math.min(y(c0), y(c1)) - vh;
    modelo.columnetas.push({columneta: c, alto: r4(pisos.reduce((t, z, i) => t + ((i + 1 < pisos.length ? pisos[i + 1] - vh : tope) - z), 0))});
    // Una columneta por nivel: nace en cada losa y llega al fondo de la viga siguiente.
    pisos.forEach((z, i) => {
      const fin = i + 1 < pisos.length ? pisos[i + 1] - vh : tope;
      prim.push(rect(L.COLUMNAS, c0, z, c1, fin));
      for (const yy of posicionesEstribos(CC.distribucion, fin - z)) prim.push(line(L.ESTRIBOS, pt(c0 + 0.02, z + yy), pt(c1 - 0.02, z + yy)));
    });
    if (c.codigo) prim.push(text(L.COLUMNAS_ID, pt(c1 + h * 0.45, alto1 * 0.42), c.codigo.toUpperCase(), h * 0.45, 90));
  }
  postes.sort((p, q) => p.a - q.a);

  // ---- Muros entre postes, con sus vanos, sobrecimiento y cimiento corrido ----
  const sc = CRITERIOS.cimientoCorrido.sobrecimientoAlto;
  let muroRotulado = false;
  const vanosDibujados = [];
  for (let i = 0; i < postes.length - 1; i++) {
    const a = postes[i].b, b = postes[i + 1].a;
    if (b - a < 0.3) continue;
    // Vanos que caen en este paño de muro.
    const aqui = vanos.filter((v) => distEje(v.p) <= v.alcance && proy(v.p) - origen > a && proy(v.p) - origen < b);
    // Puerta: la hoja dibujada sobre el muro (un rótulo "P-5" solo le da nombre).
    const puerta = aqui.find((v) => v.hoja), ventana = !puerta && aqui.find((v) => v.tipo === "ventana");
    const nombre = (aqui.find((v) => v.nombre && v.tipo === (puerta ? "puerta" : "ventana")) ?? {}).nombre ?? "";
    let o0 = a, o1 = b;
    if (puerta) {
      const hojas = aqui.filter((v) => v.hoja).map((v) => proy(v.p) - origen);
      if (Math.max(...hojas) - Math.min(...hojas) >= 0.6) { o0 = Math.max(a, Math.min(...hojas)); o1 = Math.min(b, Math.max(...hojas)); }
      else { const c = (Math.max(...hojas) + Math.min(...hojas)) / 2; o0 = Math.max(a, c - 0.45); o1 = Math.min(b, c + 0.45); }
    }
    // Cimiento corrido ciclópeo (bajo todo el paño) y sobrecimiento (no bajo la puerta).
    prim.push(rect(L.CIMIENTO, a, nfc, b, 0));
    prim.push(hatch(L.CIMIENTO, [pt(a, nfc), pt(b, nfc), pt(b, 0), pt(a, 0)], {patron: "AR-CONC", escala: 0.04}));
    const tramosSC = puerta ? [[a, o0], [o1, b]].filter(([p, q]) => q - p > 0.05) : [[a, b]];
    for (const [p, q] of tramosSC) prim.push(rect(L.CIMIENTO, p, 0, q, sc));
    // Muro: del sobrecimiento al fondo de la viga, siguiendo la pendiente; con entrepisos, un
    // muro por nivel (de cada losa al fondo de la viga siguiente).
    if (pisos.length > 1) {
      prim.push(pline(L.MUROS_E, [pt(a, puerta ? 0 : sc), pt(b, puerta ? 0 : sc), pt(b, pisos[1] - vh), pt(a, pisos[1] - vh)], true));
      for (let n = 1; n < pisos.length; n++) {
        const z = pisos[n];
        prim.push(pline(L.MUROS_E, n + 1 < pisos.length ? [pt(a, z), pt(b, z), pt(b, pisos[n + 1] - vh), pt(a, pisos[n + 1] - vh)] : [pt(a, z), pt(b, z), ...perfil(a, b, -vh).reverse()], true));
      }
    } else {
      prim.push(pline(L.MUROS_E, [pt(a, puerta ? 0 : sc), pt(b, puerta ? 0 : sc), ...perfil(a, b, -vh).reverse()], true));
    }
    if (puerta) {
      const hp = VN.alturaPuerta;
      prim.push(rect(L.LAMINA, o0, CRITERIOS.terreno.npt, o1, hp));
      prim.push(rect(L.VIGAS, Math.max(a, o0 - 0.15), hp, Math.min(b, o1 + 0.15), hp + VN.dintel));
      modelo.dinteles.push({nombre: nombre || "puerta", largo: r4(Math.min(b, o1 + 0.15) - Math.max(a, o0 - 0.15)), pano: r4(b - a)});
      prim.push(text(L.VIGAS, pt((o0 + o1) / 2, hp + VN.dintel / 2), "DINTEL", Math.min(h * 0.4, VN.dintel * 0.7)));
      if (nombre) prim.push(text(L.LAMINA, pt((o0 + o1) / 2, hp * 0.55), nombre, h * 0.45));
      vanosDibujados.push(nombre || "puerta");
    } else if (ventana) {
      const hv = VN.alturaVentana;
      prim.push(rect(L.LAMINA, a, VN.alfeizar, b, hv));
      prim.push(line(L.LAMINA, pt(a, VN.alfeizar), pt(b, hv)), line(L.LAMINA, pt(a, hv), pt(b, VN.alfeizar)));
      prim.push(rect(L.VIGAS, a, hv, b, hv + VN.dintel));
      modelo.vsa.push({nombre: nombre || "ventana", largo: r4(b - a)});
      // Las columnetas que flanquean la ventana confinan el parapeto (metrado del despacho).
      for (const poste of [postes[i], postes[i + 1]]) {
        const m = poste.columneta && modelo.columnetas.find((x) => x.columneta === poste.columneta);
        if (m) m.juntoVentana = true;
      }
      prim.push(text(L.VIGAS, pt((a + b) / 2, hv + VN.dintel / 2), "VSa", Math.min(h * 0.4, VN.dintel * 0.7)));
      if (nombre) prim.push(text(L.LAMINA, pt((a + b) / 2, (VN.alfeizar + hv) / 2 + h * 0.6), nombre, h * 0.45));
      vanosDibujados.push(nombre || "ventana");
    }
    if (!muroRotulado && b - a > 0.8) {
      const techoMuro = pisos.length > 1 ? pisos[1] - vh : y((a + b) / 2) - vh;
      const ym = puerta || ventana ? (puerta ? (VN.alturaPuerta + VN.dintel + techoMuro) / 2 : (sc + VN.alfeizar) / 2) : (sc + techoMuro) / 2;
      prim.push(text(L.MUROS_E, pt((a + b) / 2, ym), CRITERIOS.muro, Math.min(h * 0.32, ((b - a) * 0.95) / (CRITERIOS.muro.length * 0.6))));
      muroRotulado = true;
    }
  }
  // Rótulos de CC y SC en el primer paño ancho.
  const ancho = postes.slice(0, -1).map((p, i) => ({a: p.b, b: postes[i + 1].a})).sort((p, q) => (q.b - q.a) - (p.b - p.a))[0];
  if (ancho && ancho.b - ancho.a > 0.6) {
    const w = ancho.b - ancho.a, cx = (ancho.a + ancho.b) / 2;
    const hc = (t) => Math.min(h * 0.32, (w * 0.95) / (t.length * 0.6));
    prim.push(text(L.CIMIENTO, pt(cx, nfc / 2), `CC\\P${CRITERIOS.concreto.cimientoCorrido}`, hc(CRITERIOS.concreto.cimientoCorrido)));
    prim.push(text(L.CIMIENTO, pt(cx, sc / 2), `SC ${CRITERIOS.concreto.sobrecimiento}`, hc(`SC ${CRITERIOS.concreto.sobrecimiento}`)));
  }

  // ---- Despiece de cada viga (E.060): acero corrido con ganchos de 90° en los apoyos extremos
  // (12 db, 7.1), zona de confinamiento 2h acotada en el primer apoyo (21.4.4.4) y su llamada con la
  // regla de empalmes (sin empalmes a menos de 2h de la cara de los apoyos, 21.4.4.3).
  const armadoViga = criteriosMetrado(cimentacion?.tipo).vigas;
  const porCaraViga = Math.max(2, Math.ceil(armadoViga.barras / 2));
  const db = ({'1/2"': 0.0127, '5/8"': 0.015875, '3/4"': 0.01905, '1"': 0.0254})[armadoViga.barra] ?? 0.015875;
  const gancho = Math.min(12 * db, vh - 2 * rec);
  const despieceViga = (yTop) => {
    for (const xe of [xa + rec + 0.03, xb - rec - 0.03]) {
      const yt = yTop(xe);
      prim.push(line(L.ACERO_LONG, pt(xe, yt - rec), pt(xe, yt - rec - gancho)), line(L.ACERO_LONG, pt(xe, yt - vh + rec), pt(xe, yt - vh + rec + gancho)));
    }
    const cara = lista[0].s1;
    if ((lista[1]?.s0 ?? xb) - cara > 2 * vh + 0.3) prim.push(...cota(L.COTAS_E, pt(cara, yTop(cara) - vh), pt(cara + 2 * vh, yTop(cara + 2 * vh) - vh), -0.12, h * 0.3));
    // La llamada del acero (corrido, ganchos, empalmes) va en el detalle de la sección: bajo la viga
    // chocaba con el texto de estribos y el del muro (visto en el visor real).
  };

  // ---- Viga (sigue el perfil del techo) con su acero ----
  prim.push(pline(L.VIGAS, [...perfil(xa, xb, 0), ...perfil(xa, xb, -vh).reverse()], true));
  prim.push(pline(L.ACERO_LONG, perfil(xa + rec, xb - rec, -rec)), pline(L.ACERO_LONG, perfil(xa + rec, xb - rec, -vh + rec)));
  for (let i = 0; i < lista.length - 1; i++) {
    const a = lista[i].s1, b = lista[i + 1].s0;
    if (b - a < 0.2) continue;
    for (const xx of posicionesEstribos(V.distribucion, b - a)) prim.push(line(L.ESTRIBOS, pt(a + xx, y(a + xx) - vh + rec * 0.6), pt(a + xx, y(a + xx) - rec * 0.6)));
  }
  const tramo0 = {a: lista[0].s1, b: lista[1]?.s0 ?? xb};
  const xl = dosAguas ? (tramo0.a + xr) / 2 : (tramo0.a + tramo0.b) / 2;
  prim.push(text(L.VIGAS, pt(xl, y(xl) - vh - h * 0.55), `V-101 (${viga.b.toFixed(2)}x${vh.toFixed(2)})`, h * 0.45));
  prim.push(text(L.ESTRIBOS, pt(xl, y(xl) - vh - h * 1.15), textoEstribos(V.estribo, V.distribucion), h * 0.3));
  despieceViga(y);

  // ---- Entrepisos: viga y losa en el piso de cada nivel superior ----
  const e = espesorLosa;
  pisos.slice(1).forEach((z, n) => {
    const nombreViga = `V-${201 + 100 * n}`;
    prim.push(rect(L.VIGAS, xa, z - vh, xb, z));
    prim.push(rect(L.ALIGERADO, xa, z - e, xb, z));
    prim.push(line(L.ACERO_LONG, pt(xa + rec, z - rec), pt(xb - rec, z - rec)), line(L.ACERO_LONG, pt(xa + rec, z - vh + rec), pt(xb - rec, z - vh + rec)));
    for (let i = 0; i < lista.length - 1; i++) {
      const a = lista[i].s1, b = lista[i + 1].s0;
      if (b - a < 0.2) continue;
      for (const xx of posicionesEstribos(V.distribucion, b - a)) prim.push(line(L.ESTRIBOS, pt(a + xx, z - vh + rec * 0.6), pt(a + xx, z - rec * 0.6)));
    }
    // En el paño más ancho entre columnas y columnetas: el rótulo no cruza ninguna.
    const xm = ancho ? (ancho.a + ancho.b) / 2 : (lista[0].s1 + (lista[1]?.s0 ?? xb)) / 2;
    prim.push(text(L.VIGAS, pt(xm, z - vh - h * 0.55), `${nombreViga} (${viga.b.toFixed(2)}x${vh.toFixed(2)}) · LOSA E=${Math.round(e * 100)}CM`, h * 0.4));
    despieceViga(() => z);
  });

  // ---- Losa aligerada (inclinada si hay cumbrera), cobertura TR4 y canaletas ----
  // Sin losa de techo (último nivel solo con cobertura) queda la viga con la cobertura.
  if (losaTecho) prim.push(pline(L.ALIGERADO, [...perfil(xa - alero, xb + alero, 0), ...perfil(xa - alero, xb + alero, -e).reverse()], true));
  prim.push(pline(L.COBERTURA, perfil(xa - alero - 0.05, xb + alero + 0.05, 0.06)));
  if (dosAguas) {
    // Viga de cumbrera en corte, bajo la cumbrera.
    prim.push(rect(L.VIGAS, xr - viga.b / 2, H - vh, xr + viga.b / 2, H));
    prim.push(line(L.VIGAS, pt(xr - viga.b / 2, H - vh), pt(xr + viga.b / 2, H)), line(L.VIGAS, pt(xr - viga.b / 2, H), pt(xr + viga.b / 2, H - vh)));
    prim.push(text(L.VIGAS, pt(xr, H - vh - h * 0.5), "VCUMBRERA", h * 0.36));
    // Canaletas en los extremos del alero.
    const {ancho: wc, alto: hcn} = CRITERIOS.techo.canaleta;
    for (const [xe, s] of [[xa - alero, -1], [xb + alero, 1]]) {
      const ye = y(xe);
      prim.push(pline(L.COBERTURA, [pt(xe, ye + 0.04), pt(xe, ye - hcn), pt(xe + s * wc, ye - hcn), pt(xe + s * wc, ye + 0.04)]));
    }
    prim.push(text(L.COBERTURA, pt(xa - alero - wc * 0.5, y(xa - alero) - CRITERIOS.techo.canaleta.alto - h * 0.5), "CANALETA", h * 0.3));
    // Rótulo de la cobertura con su pendiente, sobre el faldón izquierdo.
    const xc = (xa + xr) / 2;
    prim.push(line(L.COBERTURA, pt(xc, y(xc) + 0.06), pt(xc - 0.3, y(xc) + 0.55)));
    prim.push(text(L.COBERTURA, pt(xc - 0.3, y(xc) + 0.62), `${CRITERIOS.techo.cobertura} · PTE=${Math.round(pendiente * 100)}%`, h * 0.32, 0, "izq"));
  }

  // ---- Ejes que cruzan: línea vertical y burbuja arriba con el nombre ----
  const yB = Math.max(T, H) + 0.75 + rb;
  for (const x of lista) {
    prim.push(line(L.EJES, pt(x.sn, -df - fz - 0.2), pt(x.sn, yB - rb)));
    prim.push(circle(L.EJES, pt(x.sn, yB), rb), text(L.EJES, pt(x.sn, yB), x.cruce, h));
  }
  // Cotas horizontales bajo la falsa zapata: cadena de caras y total entre ejes.
  const yc = -df - fz;
  const caras = lista.flatMap((x) => [x.s0, x.s1]);
  for (let i = 0; i < caras.length - 1; i++) if (caras[i + 1] - caras[i] > 0.02) prim.push(...cota(L.COTAS_E, pt(caras[i], yc), pt(caras[i + 1], yc), -0.25, h * 0.4));
  for (let i = 0; i < lista.length - 1; i++) prim.push(...cota(L.COTAS_E, pt(lista[i].sn, yc), pt(lista[i + 1].sn, yc), -0.55, h * 0.4));
  // Cotas verticales a la derecha.
  const xv = xb + alero + 0.35;
  const cadenaV = [-df, -df + hz, ...(platea && nfc > -df + hz + 0.1 ? [nfc] : []), ...pisos, T, ...(dosAguas ? [H] : [])];
  for (let i = 0; i < cadenaV.length - 1; i++) prim.push(...cota(L.COTAS_E, pt(xv, cadenaV[i + 1]), pt(xv, cadenaV[i]), 0, h * 0.42));

  // Niveles a la izquierda, como los rotula el expediente.
  const niveles = [[0, "BASE NPN=+0.00m"], ...pisos.slice(1).map((z, n) => [z, `${n + 2}° NIVEL NPT=+${z.toFixed(2)}m`]), [T, `TECHO NFP=+${T.toFixed(2)}m`], ...(dosAguas ? [[H, `CUMBRERA NFP=+${H.toFixed(2)}m`]] : []), [-df, `NFZ=-${df.toFixed(2)}m`]];
  for (const [yy, rotulo] of niveles) {
    prim.push(line(L.NIVELES, pt(xa - alero - 1.2, yy), pt(xa - alero - 0.15, yy)));
    prim.push(text(L.NIVELES, pt(xa - alero - 1.2, yy + h * 0.22), rotulo, Math.min(h * 0.4, 1.0 / (rotulo.length * 0.62)), 0, "izq"));
  }

  // Sección de la viga (como VB1/VB2 del expediente), arriba a la izquierda.
  // La nota del despiece va a la derecha de la sección y no debe llegar a la burbuja del primer eje
  // (en techo plano el alero es corto y la nota la cruzaba).
  const notaViga = [`${armadoViga.barras}Ø${armadoViga.barra}: ${porCaraViga} sup. + ${porCaraViga} inf. corridos`, textoEstribos(V.estribo, V.distribucion), "Gancho 90° (12db) en apoyos extremos", `Sin empalmes a < 2h = ${(2 * vh).toFixed(2)} m de los apoyos`];
  const anchoNota = Math.max(...notaViga.map((t) => t.length)) * h * 0.28 * 0.62;
  const sx = Math.min(xa - alero - 1.15, lista[0].sn - rb - 0.15 - anchoNota - 0.12 - viga.b), sy = Math.max(T, H) + 0.35, st = sy + vh;
  prim.push(rect(L.VIGAS, sx, sy, sx + viga.b, st));
  prim.push(rect(L.ESTRIBOS, sx + rec, sy + rec, sx + viga.b - rec, st - rec));
  prim.push(line(L.ESTRIBOS, pt(sx + viga.b - rec - 0.05, st - rec), pt(sx + viga.b - rec - 0.1, st - rec - 0.05)));
  // Varillas corridas: la mitad arriba y la mitad abajo, repartidas en el ancho (6Ø5/8": 3 + 3).
  const porCara = porCaraViga;
  const x0b = sx + rec + 0.02, x1b = sx + viga.b - rec - 0.02;
  for (const py of [sy + rec + 0.02, st - rec - 0.02]) for (let i = 0; i < porCara; i++) prim.push(circle(L.ESTRIBOS, pt(x0b + ((x1b - x0b) * i) / (porCara - 1), py), 0.012));
  // El nombre va encima de la sección y el acero a su derecha: en una viga poco peraltada
  // (0.40 m) los dos textos a la derecha se pisaban.
  // La nota (4 renglones, apoyada en su base) crece hacia arriba: el título va sobre ella.
  const topeNota = sy + h * 0.2 + 4 * h * 0.28 * 1.7;
  prim.push(text(L.VIGAS, pt(sx, Math.max(st + h * 0.3, topeNota + h * 0.15)), `V-101 ${viga.b.toFixed(2)}x${vh.toFixed(2)}`, h * 0.4, 0, "izq"));
  prim.push(text(L.ESTRIBOS, pt(sx + viga.b + 0.12, sy + h * 0.2), notaViga.join("\\P"), h * 0.28, 0, "izq"));

  notas.push(`Recubrimiento: ${Math.round(V.recubrimiento * 100)} cm`);
  prim.push(text(L.LAMINA, pt(xa - alero - 1.2, yc - 0.95), `Recubrimiento: ${Math.round(V.recubrimiento * 100)} cm · f'c = ${CRITERIOS.concreto.columnas} kg/cm²`, h * 0.38, 0, "izq"));
  return {
    columnas: lista.length, dosAguas, cumbrera: dosAguas ? r4(H) : null, vanos: vanosDibujados, niveles: pisos.length, modelo,
    // Geometría del pórtico en su marco local (x desde la primera columna, y desde ±0.00): es el
    // "destino" al que se adapta un pórtico de la biblioteca del despacho (porticoBiblioteca.js).
    geometria: {
      eje: eje.nombre,
      ejes: lista.map((x) => ({nombre: x.cruce, x: r4(x.sn), s0: r4(x.s0), s1: r4(x.s1), tipo: x.c.tipo})),
      pisos: pisos.map(r4), techo: r4(T), cumbrera: dosAguas ? r4(H) : null, xCumbrera: dosAguas ? r4(xr) : null, pendiente,
      cimentacion: {tipo: platea ? "platea" : "zapatas", df: r4(df), hz: r4(hz)},
      viga: {b: viga.b, h: vh}, losaTecho, h,
    },
    contenido: {
      titulo: `PLANO DE PÓRTICO EJE ${eje.nombre}-${eje.nombre}`,
      primitivas: prim,
      // Caja de las burbujas de ejes: la lámina ubica el pórtico donde el ingeniero puso el suyo.
      ejes: {x0: lista[0].sn - rb, y0: yB - rb, x1: lista.at(-1).sn + rb, y1: yB + rb},
      marco: {x0: xa - alero - 1.3, y0: yc - 1.1, x1: xv + 0.45, y1: yB + rb + 0.1},
      h, notas,
    },
  };
}
