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

const r4 = (v) => Math.round(v * 10000) / 10000;
const pt = (x, y) => [r4(x), r4(y)];
const rect = (layer, x0, y0, x1, y1) => pline(layer, [pt(x0, y0), pt(x1, y0), pt(x1, y1), pt(x0, y1)], true);

// Niveles de la arquitectura: el mayor "N.F.T." (fondo de techo) entre 2.2 y 6 m.
export function alturaDesdeArquitectura(items) {
  const valores = [];
  for (const it of items) {
    if (it.tipo !== "texto") continue;
    const m = /N\.?\s*F\.?\s*T\.?\s*:?\s*\+?\s*(\d+(?:[.,]\d+)?)/i.exec(it.texto);
    if (m) valores.push(Number(m[1].replace(",", ".")));
  }
  const utiles = valores.filter((v) => v >= 2.2 && v <= 6);
  return utiles.length ? Math.max(...utiles) : 3;
}

// Pendiente del techo: el menor "PTE=33%" de la arquitectura (la cobertura); si no hay, el criterio.
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
export function planoPortico({eje, columnas, altura = 3, espesorLosa = 0.2, viga = {b: 0.25, h: 0.4}, cimentacion = {tipo: "zapatas"}, columnetas = [], cumbrera = null, pendiente = CRITERIOS.techo.pendiente, vanos = []}) {
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
    prim.push(text(L.PLATEA, pt((xa + xb) / 2, -df + hz / 2), `PLATEA (ZAPATA CORRIDA) Hz = ${hz.toFixed(2)} m · ${CRITERIOS.platea.acero} sup. e inf.`, Math.min(h * 0.42, ((xb - xa + 0.6) * 0.92) / 52)));
    // Malla inferior y superior de la platea.
    prim.push(line(L.ACERO_LONG, pt(xa - 0.3 + rec, -df + rec + 0.03), pt(xb + 0.3 - rec, -df + rec + 0.03)), line(L.ACERO_LONG, pt(xa - 0.3 + rec, -df + hz - rec - 0.03), pt(xb + 0.3 - rec, -df + hz - rec - 0.03)));
  } else {
    for (const x of lista) prim.push(rect(L.ZAPATAS, x.s0 - 0.4, -df, x.s1 + 0.4, -df + hz));
  }
  prim.push(rect(L.CIMIENTO, xa - 0.3, -df - fz, xb + 0.3, -df));
  prim.push(text(L.CIMIENTO, pt((xa + xb) / 2, -df - fz / 2), CRITERIOS.concreto.falsaZapata.toUpperCase(), h * 0.42));
  // Relleno compactado entre la platea y el cimiento corrido.
  prim.push(line(L.NIVELES, pt(xa, nfc), pt(xb, nfc)));
  if (platea && baseCol < nfc - 0.15) prim.push(text(L.NIVELES, pt((xa + xb) / 2, (baseCol + nfc) / 2), CRITERIOS.terreno.relleno, Math.min(h * 0.3, ((xb - xa) * 0.9) / (CRITERIOS.terreno.relleno.length * 0.6))));
  // Terreno natural (NTN).
  prim.push(line(L.NIVELES, pt(xa - 1.2, 0), pt(xb + 1.2, 0)));

  // ---- Columnas con su acero ----
  for (const x of lista) {
    prim.push(pline(L.COLUMNAS, [pt(x.s0, baseCol), pt(x.s1, baseCol), pt(x.s1, y(x.s1)), pt(x.s0, y(x.s0))], true));
    prim.push(text(L.COLUMNAS_ID, pt((x.s0 + x.s1) / 2, T * 0.55), x.c.tipo, h * 0.7, 90));
    const tope = Math.min(y(x.s0), y(x.s1));
    prim.push(line(L.ACERO_LONG, pt(x.s0 + rec, -df + rec), pt(x.s0 + rec, y(x.s0) - rec)), line(L.ACERO_LONG, pt(x.s1 - rec, -df + rec), pt(x.s1 - rec, y(x.s1) - rec)));
    for (const yy of posicionesEstribos(C.distribucion, tope - vh - baseCol)) prim.push(line(L.ESTRIBOS, pt(x.s0 + rec * 0.6, baseCol + yy), pt(x.s1 - rec * 0.6, baseCol + yy)));
  }
  prim.push(text(L.ESTRIBOS, pt(lista[0].s0 - h * 0.6, T * 0.3), textoEstribos(C.estribo, C.distribucion, lista[0].c.forma === "rectangular" ? 1 : 2), h * 0.34, 90));

  // ---- Columnetas sobre el eje (pa, pb…) ----
  const postes = lista.map((x) => ({a: x.s0, b: x.s1, columna: true}));
  for (const c of columnetas) {
    const sc = proy(c) - origen;
    if (distEje(c) > 0.3 || sc < xa || sc > xb) continue;
    const s = c.contorno.map(proy).map((v) => v - origen);
    const c0 = Math.min(...s), c1 = Math.max(...s);
    if (c1 - c0 < 0.05 || postes.some((p) => c0 < p.b && c1 > p.a)) continue;
    postes.push({a: c0, b: c1, columneta: c});
    const tope = Math.min(y(c0), y(c1)) - vh;
    prim.push(rect(L.COLUMNAS, c0, 0, c1, tope));
    for (const yy of posicionesEstribos(CC.distribucion, tope)) prim.push(line(L.ESTRIBOS, pt(c0 + 0.02, yy), pt(c1 - 0.02, yy)));
    if (c.codigo) prim.push(text(L.COLUMNAS_ID, pt(c1 + h * 0.45, T * 0.42), c.codigo.toUpperCase(), h * 0.45, 90));
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
    // Muro: del sobrecimiento al fondo de la viga, siguiendo la pendiente.
    prim.push(pline(L.MUROS_E, [pt(a, puerta ? 0 : sc), pt(b, puerta ? 0 : sc), ...perfil(a, b, -vh).reverse()], true));
    if (puerta) {
      const hp = VN.alturaPuerta;
      prim.push(rect(L.LAMINA, o0, CRITERIOS.terreno.npt, o1, hp));
      prim.push(rect(L.VIGAS, Math.max(a, o0 - 0.15), hp, Math.min(b, o1 + 0.15), hp + VN.dintel));
      prim.push(text(L.VIGAS, pt((o0 + o1) / 2, hp + VN.dintel / 2), "DINTEL", Math.min(h * 0.4, VN.dintel * 0.7)));
      if (nombre) prim.push(text(L.LAMINA, pt((o0 + o1) / 2, hp * 0.55), nombre, h * 0.45));
      vanosDibujados.push(nombre || "puerta");
    } else if (ventana) {
      const hv = VN.alturaVentana;
      prim.push(rect(L.LAMINA, a, VN.alfeizar, b, hv));
      prim.push(line(L.LAMINA, pt(a, VN.alfeizar), pt(b, hv)), line(L.LAMINA, pt(a, hv), pt(b, VN.alfeizar)));
      prim.push(rect(L.VIGAS, a, hv, b, hv + VN.dintel));
      prim.push(text(L.VIGAS, pt((a + b) / 2, hv + VN.dintel / 2), "VSa", Math.min(h * 0.4, VN.dintel * 0.7)));
      if (nombre) prim.push(text(L.LAMINA, pt((a + b) / 2, (VN.alfeizar + hv) / 2 + h * 0.6), nombre, h * 0.45));
      vanosDibujados.push(nombre || "ventana");
    }
    if (!muroRotulado && b - a > 0.8) {
      const ym = puerta || ventana ? (puerta ? (VN.alturaPuerta + VN.dintel + y((a + b) / 2) - vh) / 2 : (sc + VN.alfeizar) / 2) : (sc + y((a + b) / 2) - vh) / 2;
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

  // ---- Losa aligerada (inclinada si hay cumbrera), cobertura TR4 y canaletas ----
  const e = espesorLosa;
  prim.push(pline(L.ALIGERADO, [...perfil(xa - alero, xb + alero, 0), ...perfil(xa - alero, xb + alero, -e).reverse()], true));
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
  const cadenaV = [-df, -df + hz, ...(platea && nfc > -df + hz + 0.1 ? [nfc] : []), 0, T, ...(dosAguas ? [H] : [])];
  for (let i = 0; i < cadenaV.length - 1; i++) prim.push(...cota(L.COTAS_E, pt(xv, cadenaV[i + 1]), pt(xv, cadenaV[i]), 0, h * 0.42));

  // Niveles a la izquierda, como los rotula el expediente.
  const niveles = [[0, "BASE NPN=+0.00m"], [T, `TECHO NFP=+${T.toFixed(2)}m`], ...(dosAguas ? [[H, `CUMBRERA NFP=+${H.toFixed(2)}m`]] : []), [-df, `NFZ=-${df.toFixed(2)}m`]];
  for (const [yy, rotulo] of niveles) {
    prim.push(line(L.NIVELES, pt(xa - alero - 1.2, yy), pt(xa - alero - 0.15, yy)));
    prim.push(text(L.NIVELES, pt(xa - alero - 1.2, yy + h * 0.22), rotulo, Math.min(h * 0.4, 1.0 / (rotulo.length * 0.62)), 0, "izq"));
  }

  // Sección de la viga (como VB1/VB2 del expediente), arriba a la izquierda.
  const sx = xa - alero - 1.15, sy = Math.max(T, H) + 0.35, st = sy + vh;
  prim.push(rect(L.VIGAS, sx, sy, sx + viga.b, st));
  prim.push(rect(L.ESTRIBOS, sx + rec, sy + rec, sx + viga.b - rec, st - rec));
  prim.push(line(L.ESTRIBOS, pt(sx + viga.b - rec - 0.05, st - rec), pt(sx + viga.b - rec - 0.1, st - rec - 0.05)));
  for (const [px, py] of [[sx + rec + 0.02, sy + rec + 0.02], [sx + viga.b - rec - 0.02, sy + rec + 0.02], [sx + rec + 0.02, st - rec - 0.02], [sx + viga.b - rec - 0.02, st - rec - 0.02]]) prim.push(circle(L.ESTRIBOS, pt(px, py), 0.012));
  prim.push(text(L.VIGAS, pt(sx + viga.b + 0.12, st - h * 0.4), `V-101 ${viga.b.toFixed(2)}x${vh.toFixed(2)}`, h * 0.4, 0, "izq"));
  prim.push(text(L.ESTRIBOS, pt(sx + viga.b + 0.12, sy + h * 0.2), `4Ø1/2"\\P${textoEstribos(V.estribo, V.distribucion)}`, h * 0.28, 0, "izq"));

  notas.push(`Recubrimiento: ${Math.round(V.recubrimiento * 100)} cm`);
  prim.push(text(L.LAMINA, pt(xa - alero - 1.2, -df - fz * 0.6), `Recubrimiento: ${Math.round(V.recubrimiento * 100)} cm · f'c = ${CRITERIOS.concreto.columnas} kg/cm²`, h * 0.38, 0, "izq"));
  return {
    columnas: lista.length, dosAguas, cumbrera: dosAguas ? r4(H) : null, vanos: vanosDibujados,
    contenido: {
      titulo: `PLANO DE PÓRTICO EJE ${eje.nombre}-${eje.nombre}`,
      primitivas: prim,
      // Caja de las burbujas de ejes: la lámina ubica el pórtico donde el ingeniero puso el suyo.
      ejes: {x0: lista[0].sn - rb, y0: yB - rb, x1: lista.at(-1).sn + rb, y1: yB + rb},
      marco: {x0: xa - alero - 1.3, y0: yc - 0.8, x1: xv + 0.45, y1: yB + rb + 0.1},
      h, notas,
    },
  };
}
