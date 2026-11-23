// Pórticos adaptados desde la biblioteca de detalles del despacho (fase 2b).
//
// La biblioteca (scripts/agente/extraer-biblioteca.mjs) guarda cada pórtico que dibujó el
// ingeniero en metros locales: x desde el primer eje, y = cota del dibujo, con sus capas,
// colores y textos. Aquí:
//
// - elegirPortico(destino, piezas): la pieza más parecida al pórtico que hay que dibujar
//   (mismo número de ejes, de pisos y el mismo tipo de techo; luces, alturas y cimentación
//   parecidas). null si ninguna se parece lo suficiente: entonces se usa el generador
//   (porticoPlano.js).
// - adaptarPortico(pieza, destino): estira la pieza por tramos hasta las luces y niveles del
//   destino. En x los ejes de la pieza van a las columnas del destino y la zona de cada
//   columna (± media sección) se traslada sin deformarse; en y cada nivel (NFZ, NPN, pisos,
//   techo) va a su nivel del destino y los peraltes de vigas y losas, la zapata y el
//   cimiento corrido se trasladan rígidos. Nombres de ejes, valores de niveles, códigos de
//   columna y secciones de viga se reemplazan por los del destino; las cotas se recalculan
//   o se quitan si su valor ya no corresponde.
//
// El resultado son primitivas en el mismo marco que planoPortico (x desde la primera
// columna, y = 0 en ±0.00), con las capas y colores del ingeniero.
//
// destino: la geometría que devuelve planoPortico (resultado.geometria):
//   {eje, ejes: [{nombre, x, s0, s1, tipo}], pisos: [0, z2…], techo, cumbrera, xCumbrera,
//    cimentacion: {tipo, df, hz}, viga: {b, h}, h}

import {CAPAS_DESPACHO} from "../criterios/estiloLaminas.js";
import {L} from "../cad/primitives.js";
import {anchoTexto} from "../laminas/rotulo.js";

const r4 = (v) => Math.round(v * 10000) / 10000;
// Capa con el nombre exacto del despacho ("ladrillo" → "LADRILLO"): el visor busca las capas
// distinguiendo mayúsculas y una entidad en "ladrillo" con la capa creada como "LADRILLO" no se
// dibuja ("layer doesn't exist").
const CAPA_CANONICA = new Map(Object.keys(CAPAS_DESPACHO).map((c) => [c.toLowerCase(), c]));
const capaDe = (e) => { const c = e.capa ?? "0"; return CAPA_CANONICA.get(c.toLowerCase()) ?? c; };
const P = (q) => (Array.isArray(q) ? {x: q[0], y: q[1]} : q);
const SIN_DIBUJO = /texto|text|cota|acot|dim|eje|axis|titul|rotulo|lamina|cuadro|niveles?$/i;

// ---------------------------------------------------------------------------------------
// Lectura de la pieza: ejes, niveles, techo y cimentación.
// ---------------------------------------------------------------------------------------

const cacheAnalisis = new WeakMap();

// Niveles útiles de la pieza: NFZ, NPN y los pisos (NFP/NFT) sobre el NPN; los NPT, NFV y
// repetidos (a menos de 0.30 m) no son niveles estructurales distintos.
function nivelesDePieza(pieza) {
  const niveles = (pieza.niveles ?? []).filter((n) => Number.isFinite(n.y));
  const npn = niveles.filter((n) => n.sigla === "NPN").sort((a, b) => a.y - b.y)[0] ?? null;
  const nfz = niveles.filter((n) => n.sigla === "NFZ" && (!npn || n.y < npn.y - 0.3)).sort((a, b) => a.y - b.y)[0] ?? null;
  const base = npn?.y ?? 0;
  const pisos = [];
  for (const n of niveles.filter((x) => /^NF[PT]$/.test(x.sigla) && x.y > base + 1.5).sort((a, b) => a.y - b.y)) {
    if (pisos.length && n.y - pisos.at(-1).y < 0.3) continue;
    pisos.push(n);
  }
  return {nfz, npn, pisos};
}

// Techo a dos aguas: dos faldones inclinados (pendientes de signo contrario) largos sobre el
// primer nivel. Devuelve la cumbrera (punto más alto de los faldones) o null, y el alero: la
// altura de la cara superior de los faldones sobre los ejes extremos (promedio de ambos lados).
function techoDePieza(pieza, ejes, base) {
  const x0 = ejes[0].x - 1.5, x1 = ejes.at(-1).x + 1.5, luz = Math.max(1, ejes.at(-1).x - ejes[0].x);
  let sube = 0, baja = 0, cumbrera = null;
  const sobre = [null, null]; // y del faldón más alto sobre el primer y el último eje
  const enEje = (a, b, x) => (x >= Math.min(a.x, b.x) && x <= Math.max(a.x, b.x) ? a.y + ((x - a.x) * (b.y - a.y)) / (b.x - a.x) : null);
  for (const e of pieza.entidades ?? []) {
    if ((e.tipo !== "linea" && e.tipo !== "poli") || SIN_DIBUJO.test(e.capa ?? "")) continue;
    const ps = e.puntos ?? [];
    for (let i = 1; i < ps.length; i++) {
      const a = ps[i - 1], b = ps[i], dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy);
      if (l < Math.max(0.6, luz * 0.2) || Math.abs(dx) < 1e-6) continue;
      const m = dy / dx;
      if (Math.abs(m) < 0.1 || Math.abs(m) > 1.2) continue;
      if (Math.min(a.x, b.x) < x0 || Math.max(a.x, b.x) > x1 || Math.min(a.y, b.y) < base + 1.5) continue;
      if (m > 0) sube++; else baja++;
      const [k, xe] = m > 0 ? [0, ejes[0].x] : [1, ejes.at(-1).x];
      const ye = enEje(a, b, xe);
      if (ye != null && (sobre[k] == null || ye > sobre[k])) sobre[k] = ye;
      const alto = a.y > b.y ? a : b;
      if (!cumbrera || alto.y > cumbrera.y) cumbrera = {x: alto.x, y: alto.y};
    }
  }
  if (!(sube && baja)) return null;
  const lados = sobre.filter((v) => v != null);
  return {...cumbrera, alero: lados.length ? lados.reduce((t, v) => t + v, 0) / lados.length : null};
}

// Cimentación de la pieza: por sus textos ("Zapata Aislada 01", "PLATEA") o, si no dicen
// nada, por su dibujo (una losa continua bajo todos los ejes, cerca del NFZ, es platea).
function cimentacionDePieza(pieza, ejes, nfz) {
  const textos = (pieza.textos ?? []).join(" | ");
  if (/platea|losa\s+de\s+cimentaci/i.test(textos)) return "platea";
  if (/zapata\s+(aislada|aisalda|combinada|corrida)|\bZ-\d/i.test(textos)) return "zapatas";
  if (!nfz) return null;
  const a = ejes[0].x, b = ejes.at(-1).x;
  for (const e of pieza.entidades ?? []) {
    if ((e.tipo !== "linea" && e.tipo !== "poli") || SIN_DIBUJO.test(e.capa ?? "")) continue;
    const ps = e.puntos ?? [];
    for (let i = 1; i < ps.length; i++) {
      const p = ps[i - 1], q = ps[i];
      if (Math.abs(p.y - q.y) > 0.01 || p.y < nfz.y + 0.05 || p.y > nfz.y + 1.0) continue;
      if (Math.min(p.x, q.x) <= a + 0.05 && Math.max(p.x, q.x) >= b - 0.05) return "platea";
    }
  }
  return "zapatas";
}

// Sección de cada columna de la pieza en el primer nivel, por sus estribos: los trazos
// horizontales cortos que cruzan el eje (al menos 6). Las caras: el trazo vertical justo afuera
// de los estribos (el recubrimiento) o, si no se ve, los estribos ± 4 cm. null si no se ve.
function columnasDePieza(pieza, ejes, npn, pisos) {
  const hs = [], vs = [];
  for (const e of pieza.entidades ?? []) {
    if ((e.tipo !== "linea" && e.tipo !== "poli") || SIN_DIBUJO.test(e.capa ?? "")) continue;
    const ps = e.puntos ?? [];
    for (let i = 1; i < ps.length; i++) {
      const p = ps[i - 1], q = ps[i];
      if (Math.abs(p.y - q.y) < 0.005 && p.y > npn.y + 0.1 && p.y < pisos[0].y - 0.3) {
        const l = Math.abs(q.x - p.x);
        if (l >= 0.1 && l <= 1.8) hs.push([Math.min(p.x, q.x), Math.max(p.x, q.x)]);
      } else if (Math.abs(p.x - q.x) < 0.005 && Math.abs(p.y - q.y) >= 1.0) vs.push((p.x + q.x) / 2);
    }
  }
  const mediana = (xs) => { const o = [...xs].sort((u, v) => u - v); return o[Math.floor(o.length / 2)]; };
  return ejes.map((e) => {
    const cruzan = hs.filter(([x0, x1]) => x0 <= e.x + 0.03 && x1 >= e.x - 0.03);
    if (cruzan.length < 6) return null;
    const l0 = mediana(cruzan.map((c) => c[0])), r0 = mediana(cruzan.map((c) => c[1]));
    const izq = vs.filter((x) => x < l0 - 0.005 && x >= l0 - 0.08).sort((u, v) => v - u)[0];
    const der = vs.filter((x) => x > r0 + 0.005 && x <= r0 + 0.08).sort((u, v) => u - v)[0];
    return {l: izq ?? l0 - 0.04, r: der ?? r0 + 0.04};
  });
}

export function analizarPieza(pieza) {
  if (cacheAnalisis.has(pieza)) return cacheAnalisis.get(pieza);
  const ejes = [...(pieza.parametros?.ejes ?? [])].filter((e) => Number.isFinite(e.x)).sort((a, b) => a.x - b.x);
  let r = null;
  if (ejes.length >= 2) {
    const {nfz, npn, pisos} = nivelesDePieza(pieza);
    if (npn && pisos.length) {
      const techo = techoDePieza(pieza, ejes, npn.y);
      const cumbrera = techo && {x: techo.x, y: techo.y};
      // Alero en el nivel de la losa: los faldones dibujan la cobertura, que va sobre la losa tanto
      // como la cumbrera sobre el último nivel.
      const alero = techo?.alero != null ? techo.alero - (techo.y - pisos.at(-1).y) : null;
      r = {
        alero,
        ejes, nfz, npn, pisos, cumbrera, dosAguas: Boolean(cumbrera),
        // Alturas de cada nivel (del NPN al primer piso, y así hasta el techo).
        alturas: pisos.map((p, i) => p.y - (i ? pisos[i - 1].y : npn.y)),
        columnas: columnasDePieza(pieza, ejes, npn, pisos),
        luces: ejes.slice(1).map((e, i) => e.x - ejes[i].x),
        df: nfz ? npn.y - nfz.y : null,
        cimentacion: cimentacionDePieza(pieza, ejes, nfz),
      };
    }
  }
  cacheAnalisis.set(pieza, r);
  return r;
}

// Lo que hay que dibujar, en los términos de la pieza.
function resumenDestino(d) {
  const pisos = d.pisos?.length ? d.pisos : [0];
  const tope = d.cumbrera ?? d.techo;
  const niveles = [...pisos.slice(1), tope];
  return {
    ejes: d.ejes, pisos, tope, dosAguas: d.cumbrera != null,
    alturas: niveles.map((z, i) => z - (i ? niveles[i - 1] : 0)),
    luces: d.ejes.slice(1).map((e, i) => e.x - d.ejes[i].x),
    df: d.cimentacion?.df ?? null, cimentacion: d.cimentacion?.tipo ?? null,
  };
}

// ---------------------------------------------------------------------------------------
// Elección por parecido.
// ---------------------------------------------------------------------------------------

// excluir: {proyecto} o {proyecto, modulo}: para medir sin la pieza del mismo proyecto o módulo.
export function excluida(pieza, excluir) {
  if (!excluir?.proyecto) return false;
  if (pieza.proyecto !== excluir.proyecto) return false;
  return !excluir.modulo || pieza.modulo === excluir.modulo;
}

const desvio = (as, bs) => as.reduce((s, a, i) => s + Math.abs(Math.log(bs[i] / a)), 0) / Math.max(1, as.length);

// Puntaje de 0 a 1 de una pieza para el destino; null si no sirve (otro número de ejes o de
// pisos, otro techo, o luces/alturas que habría que estirar más del doble).
export function parecido(destino, pieza) {
  if (pieza.tipo && pieza.tipo !== "portico") return null;
  const a = analizarPieza(pieza);
  if (!a) return null;
  const d = resumenDestino(destino);
  if (a.ejes.length !== d.ejes.length || a.pisos.length !== d.alturas.length || a.dosAguas !== d.dosAguas) return null;
  if ([...d.luces.map((l, i) => l / a.luces[i]), ...d.alturas.map((h, i) => h / a.alturas[i])].some((f) => !(f > 0.45 && f < 2.2))) return null;
  // Sin NFZ la pieza no dibuja la cimentación (ilo módulo 11) y con otra cimentación (platea por
  // zapatas) el pie del pórtico sale distinto: medido, ambas bajan la semejanza 10 a 30 puntos.
  if (d.df && !a.nfz) return null;
  if (a.cimentacion && d.cimentacion && a.cimentacion !== d.cimentacion) return null;
  const sLuz = Math.exp(-2 * desvio(a.luces, d.luces));
  const sAlt = Math.exp(-2 * desvio(a.alturas, d.alturas));
  const sCim = !a.cimentacion || !d.cimentacion ? 0.5 : a.cimentacion === d.cimentacion ? 1 : 0;
  const sDf = a.df && d.df ? Math.exp(-Math.abs(Math.log(d.df / a.df))) : 0.5;
  const dudas = (pieza.dudas ?? []).length;
  const puntaje = 0.45 * sLuz + 0.25 * sAlt + 0.2 * sCim + 0.1 * sDf - 0.05 * Math.min(2, dudas);
  const porque = [
    `${a.ejes.length} ejes y ${a.pisos.length} nivel(es)${a.dosAguas ? " con techo a dos aguas" : ""}, como el destino`,
    `luces ${a.luces.map((l) => l.toFixed(2)).join("/")} → ${d.luces.map((l) => l.toFixed(2)).join("/")}`,
    `alturas ${a.alturas.map((l) => l.toFixed(2)).join("/")} → ${d.alturas.map((l) => l.toFixed(2)).join("/")}`,
    `cimentación ${a.cimentacion ?? "?"} (destino ${d.cimentacion ?? "?"})`,
  ];
  return {puntaje: r4(puntaje), porque};
}

export function elegirPortico(destino, piezas, {excluir = null, minimo = 0.55} = {}) {
  let mejor = null;
  for (const pieza of piezas ?? []) {
    if (excluida(pieza, excluir)) continue;
    const p = parecido(destino, pieza);
    if (p && p.puntaje >= minimo && (!mejor || p.puntaje > mejor.puntaje)) mejor = {pieza, ...p};
  }
  return mejor;
}

// ---------------------------------------------------------------------------------------
// Estiramiento por tramos.
// ---------------------------------------------------------------------------------------

// anclas: [{p, d, l, r}]: el punto p de la pieza va a d del destino; [p − l, p + r] se
// traslada rígido (l o r Infinity: todo lo que queda de ese lado). Entre zonas rígidas, lineal.
// Si dos zonas no caben en el tramo (en la pieza o en el destino) se achican en proporción.
export function porTramos(anclas) {
  const as = [...anclas].sort((a, b) => a.p - b.p);
  const L = as.map((a) => a.l), R = as.map((a) => a.r);
  for (let i = 0; i + 1 < as.length; i++) {
    const hueco = Math.min(as[i + 1].p - as[i].p, as[i + 1].d - as[i].d);
    const rr = Number.isFinite(R[i]) ? R[i] : hueco, ll = Number.isFinite(L[i + 1]) ? L[i + 1] : hueco;
    const libre = Math.max(0, hueco - 0.05);
    const k = rr + ll > libre ? libre / (rr + ll || 1) : 1;
    R[i] = rr * k; L[i + 1] = ll * k;
  }
  const pts = [];
  as.forEach((a, i) => {
    if (i > 0 && L[i] > 1e-6) pts.push([a.p - L[i], a.d - L[i]]);
    pts.push([a.p, a.d]);
    if (i + 1 < as.length && R[i] > 1e-6) pts.push([a.p + R[i], a.d + R[i]]);
  });
  return (v) => {
    if (v <= pts[0][0]) return v - pts[0][0] + pts[0][1];
    if (v >= pts.at(-1)[0]) return v - pts.at(-1)[0] + pts.at(-1)[1];
    let i = 1;
    while (pts[i][0] < v) i++;
    const [p0, d0] = pts[i - 1], [p1, d1] = pts[i];
    return p1 - p0 < 1e-9 ? d1 : d0 + ((v - p0) * (d1 - d0)) / (p1 - p0);
  };
}

// Cara superior de la losa del destino en x (planoPortico: techo plano o a dos aguas, con la
// pendiente medida desde la cara interior de las columnas extremas).
export function perfilDestino(destino) {
  const T = destino.techo, H = destino.cumbrera, xr = destino.xCumbrera, ejes = destino.ejes ?? [];
  if (H == null || xr == null || ejes.length < 2) return () => T;
  const iL = ejes[0].s1 ?? ejes[0].x, iR = ejes.at(-1).s0 ?? ejes.at(-1).x;
  const sL = (H - T) / Math.max(0.01, xr - iL), sR = (H - T) / Math.max(0.01, iR - xr);
  return (x) => (x <= xr ? H - sL * (xr - x) : H - sR * (x - xr));
}

// Funciones de x y de y que llevan la pieza al destino.
export function transformacion(pieza, destino) {
  const a = analizarPieza(pieza);
  const d = resumenDestino(destino);
  // x: cada eje a su columna; la columna (± media sección + 5 cm) se traslada sin deformarse.
  // Si la columna de la pieza (por sus estribos) no tiene las caras del destino respecto del eje
  // (otro ancho, una placa donde la pieza tiene una columna, el eje en otra posición), sus caras van
  // a las caras del destino y su interior se estira: la columna dibujada es la del destino.
  const anclasX = [];
  const n = a.ejes.length;
  a.ejes.forEach((e, i) => {
    const c = d.ejes[i], col = a.columnas?.[i];
    const borde = (k, v) => (k === 0 ? Infinity : v);
    if (col && c.s0 != null && c.s1 != null && (Math.abs(col.l - e.x - (c.s0 - c.x)) > 0.03 || Math.abs(col.r - e.x - (c.s1 - c.x)) > 0.03)) {
      anclasX.push({p: col.l, d: c.s0, l: i === 0 ? Infinity : 0.05, r: 0});
      if (e.x > col.l + 0.02 && e.x < col.r - 0.02 && c.x > c.s0 + 0.02 && c.x < c.s1 - 0.02) anclasX.push({p: e.x, d: c.x, l: 0, r: 0});
      anclasX.push({p: col.r, d: c.s1, l: 0, r: i === n - 1 ? Infinity : 0.05});
    } else {
      anclasX.push({p: e.x, d: c.x, l: borde(i, Math.max(0.15, c.x - (c.s0 ?? c.x - 0.15)) + 0.05), r: borde(n - 1 - i, Math.max(0.15, (c.s1 ?? c.x + 0.15) - c.x) + 0.05)});
    }
  });
  // La cumbrera de la pieza va a la del destino (si cae entre dos columnas en ambos).
  if (a.cumbrera && destino.xCumbrera != null) {
    const i = a.ejes.findIndex((e, j) => j > 0 && a.cumbrera.x < e.x);
    if (i > 0 && destino.xCumbrera > d.ejes[i - 1].x && destino.xCumbrera < d.ejes[i].x) anclasX.push({p: a.cumbrera.x, d: destino.xCumbrera, l: 0.2, r: 0.2});
  }
  // y: NFZ (la zapata o platea sobre él, rígida), NPN (cimiento corrido y sobrecimiento),
  // cada piso (viga y losa bajo él) y el techo (todo lo de arriba se traslada).
  const vh = Math.max(0.45, (destino.viga?.h ?? 0.4) + 0.1);
  const anclasY = [];
  if (a.nfz && d.df) anclasY.push({p: a.nfz.y, d: -d.df, l: Infinity, r: Math.max(0.6, destino.cimentacion?.hz ?? 0.6)});
  anclasY.push({p: a.npn.y, d: 0, l: a.nfz && d.df ? 0.8 : Infinity, r: 0.35});
  a.pisos.forEach((n, i) => {
    const ultimo = i === a.pisos.length - 1;
    anclasY.push({p: n.y, d: ultimo ? d.tope : d.pisos[i + 1], l: vh, r: ultimo ? Infinity : 0.1});
  });
  // Techo a dos aguas: el alero de la pieza va a la altura del alero del destino (sobre los ejes
  // extremos) y lo que cuelga bajo él (viga, canaleta, alero) se traslada rígido; solo el faldón,
  // entre el alero y la cumbrera, se estira. Sin esta ancla el alero subía hacia la cumbrera.
  if (d.dosAguas && a.alero != null) {
    const perfil = perfilDestino(destino);
    const aleroD = (perfil(d.ejes[0].x) + perfil(d.ejes.at(-1).x)) / 2;
    const ultimo = a.pisos.at(-1).y, previoP = a.pisos.length > 1 ? a.pisos.at(-2).y : a.npn.y, previoD = d.pisos.at(-1);
    if (a.alero > previoP + 1 && a.alero < ultimo - 0.15 && aleroD > previoD + 1 && aleroD < d.tope - 0.15) {
      anclasY.push({p: a.alero, d: aleroD, l: vh + 0.1, r: 0.05});
    }
  }
  return {fx: porTramos(anclasX), fy: porTramos(anclasY), a, d};
}

// ---------------------------------------------------------------------------------------
// Adaptación.
// ---------------------------------------------------------------------------------------

const NUMERO = /([+\-−]?)\s*(\d+)[.,](\d+)/;
const TITULO = /P[OÓ]RTICO\s+EJE|M[OÓ]DULO|^\s*ESC(ALA)?\.?\s*:?\s*1\s*\/\s*\d+|^\s*CUADRO\s+DE\s+(COLUMNAS|COLUMNETAS|ZAPATAS)\s*$/i;
const NIVEL = /\b(N\.?\s*F\.?\s*Z|N\.?\s*P\.?\s*N|N\.?\s*F\.?\s*P|N\.?\s*F\.?\s*T|N\.?\s*P\.?\s*T|N\.?\s*T\.?\s*T|N\.?\s*F\.?\s*V)\.?\s*[=:]/i;
const COTA = /^\s*\d{1,2}[.,]\d{2}\s*$/;
const CODIGO_COLUMNA = /^\s*(?:C|PL)-?\d+[A-Z]?\s*$/i;
const SECCION_VIGA = /^(\s*V(?:P|B|-?\d)[\w-]*\s*\(?\s*)(\d*[.,]\d+)\s*[xX×]\s*(\d*[.,]\d+)/;
// Sección de viga en centímetros de un cuadro de viga: "CUADRO DE VIGA (30x50cm)".
const SECCION_CM = /\(\s*(\d{2})\s*[xX×]\s*(\d{2})\s*cm\s*\)/;
// Lo que es propio del módulo de origen y no se puede traducir al destino: códigos de columneta
// (pa, pb…), vanos (P-3, V-12), dinteles y VSa, rótulos de muro y nombres de zapata. Donde el
// destino tiene esas cosas las dibuja el generador (paños de muro); el resto se quita.
const DEL_ORIGEN = [
  /^\s*p[a-z]{1,2}\d?\s*$/,
  /^\s*[PV]\s*-\s*\d+[A-Z]?\s*$/i,
  /^\s*(VSa|V\.\s*S\.\s*A\.?|DINTEL)(\s*[-_]?\s*\d+)?\s*$/i,
  /muro\s+de\s+(soga|cabeza|canto)|ladrillo\s+(king|kk|pandereta|tipo)/i,
  /zapata\s+(aislada|aisalda|combinada)\s*\d+|^\s*Z\s*-?\s*\d+[A-Z]?\s*$/i,
];

// Mismo formato que el original: signo, separador decimal y número de decimales.
function conValor(texto, valor) {
  return texto.replace(NUMERO, (m, signo, ent, dec) => {
    const v = Math.abs(valor).toFixed(dec.length), num = m.includes(",") ? v.replace(".", ",") : v;
    const espacio = m.slice(signo.length).match(/^\s*/)[0];
    // ±0.00 conserva el signo que escribió el ingeniero ("+/- 0.00", "-0.00", "0.00").
    const s = Number(v) === 0 ? signo : valor < 0 ? (signo === "−" ? "−" : "-") : signo ? "+" : "";
    return `${s}${s ? espacio : ""}${num}`;
  });
}

// Giro de un texto de la pieza en grados ("rot" de la biblioteca; "rotacion" en la publicada).
const giro = (e) => Number(e.rot ?? e.rotacion ?? 0) || 0;

// Centro de un texto de la pieza. La biblioteca guarda el punto de inserción (centro) y, si no es
// el centro del texto, su ancla (1 = arriba-izq … 9 = abajo-der, como el MTEXT; un TEXT se apoya en
// su base izquierda) y su giro (rot, grados): el centro real sale del ancho del texto girado.
export function centroTexto(e) {
  const ancla = e.ancla ?? 5;
  if (ancla === 5) return e.centro;
  const h = e.alto ?? 0.1, w = anchoTexto(e.texto ?? "", h);
  const ih = (ancla - 1) % 3, iv = Math.floor((ancla - 1) / 3);
  const dx = ((1 - ih) * w) / 2, dy = ((iv - 1) * h) / 2;
  const g = (giro(e) * Math.PI) / 180, c = Math.cos(g), s = Math.sin(g);
  return {x: e.centro.x + dx * c - dy * s, y: e.centro.y + dx * s + dy * c};
}

// Caja de un texto de la pieza (con su giro), en coordenadas de la pieza.
const cajaTexto = (e) => {
  const c = centroTexto(e), w = anchoTexto(e.texto ?? "", e.alto ?? 0.1), h = (e.alto ?? 0.1) * 1.3;
  const g = (giro(e) * Math.PI) / 180, ca = Math.abs(Math.cos(g)), sa = Math.abs(Math.sin(g));
  const ex = (w * ca + h * sa) / 2, ey = (w * sa + h * ca) / 2;
  return {x0: c.x - ex, y0: c.y - ey, x1: c.x + ex, y1: c.y + ey};
};
const dentro = (q, c) => q.x >= c.x0 && q.x <= c.x1 && q.y >= c.y0 && q.y <= c.y1;

// Cota de la pieza: la línea casi horizontal o vertical cerca del texto con su mismo largo.
function lineaDeCota(texto, valor, segmentos) {
  let mejor = null;
  const t = centroTexto(texto), alcance = Math.max(0.15, (texto.alto ?? 0.1) * 3);
  for (const [a, b] of segmentos) {
    const l = Math.hypot(b.x - a.x, b.y - a.y);
    if (Math.abs(l - valor) > Math.max(0.015, valor * 0.02)) continue;
    const horizontal = Math.abs(b.y - a.y) < 0.01, vertical = Math.abs(b.x - a.x) < 0.01;
    if (!horizontal && !vertical) continue;
    const dist = horizontal
      ? (t.x >= Math.min(a.x, b.x) && t.x <= Math.max(a.x, b.x) ? Math.abs(t.y - a.y) : Infinity)
      : (t.y >= Math.min(a.y, b.y) && t.y <= Math.max(a.y, b.y) ? Math.abs(t.x - a.x) : Infinity);
    if (dist <= alcance && (!mejor || dist < mejor.dist)) mejor = {a, b, dist};
  }
  return mejor;
}

// ---------------------------------------------------------------------------------------
// Paños de muro: lo que es propio de cada módulo (muros, vanos, columnetas, dinteles, VSa y
// sus rótulos) vive entre las columnas, de cada piso al fondo de la viga de encima. En el pórtico
// adaptado ese contenido de la pieza se quita y se dibuja el del destino (planoPortico).
// ---------------------------------------------------------------------------------------

// Segmentos de dibujo de la pieza (sin textos, cotas ni ejes).
function segmentosDibujo(ents) {
  const s = [];
  for (const e of ents) {
    if ((e.tipo !== "linea" && e.tipo !== "poli") || SIN_DIBUJO.test(e.capa ?? "")) continue;
    const ps = e.puntos ?? [];
    for (let i = 1; i < ps.length; i++) s.push([ps[i - 1], ps[i]]);
  }
  return s;
}

// Caras de las columnas de la pieza (x de la pieza): el trazo vertical largo más alejado de cada
// eje, a no más de la media sección del destino + 12 cm (más lejos ya es una columneta o un muro).
function carasDePieza(segs, a, destino) {
  return a.ejes.map((e, i) => {
    const c = destino.ejes[i];
    const alcL = Math.max(0.3, c.x - (c.s0 ?? c.x - 0.15) + 0.12), alcR = Math.max(0.3, (c.s1 ?? c.x + 0.15) - c.x + 0.12);
    let l = e.x, r = e.x;
    for (const [p, q] of segs) {
      if (Math.abs(p.x - q.x) > 0.005 || Math.abs(p.y - q.y) < 1.0) continue;
      const x = (p.x + q.x) / 2;
      if (x >= e.x && x - e.x <= alcR) r = Math.max(r, x);
      if (x <= e.x && e.x - x <= alcL) l = Math.min(l, x);
    }
    return {l, r};
  });
}

// Fondo de la viga bajo cada piso de la pieza (y de la pieza): el trazo horizontal más bajo, de
// 12 a 90 cm bajo el piso, que recorre al menos un tercio del pórtico. null si no se ve.
function fondosDeViga(segs, a) {
  const luz = Math.max(1, a.ejes.at(-1).x - a.ejes[0].x);
  return a.pisos.map((n, k) => {
    if (a.dosAguas && k === a.pisos.length - 1) return null; // viga inclinada: la del destino
    const largo = new Map();
    for (const [p, q] of segs) {
      if (Math.abs(p.y - q.y) > 0.005) continue;
      const y = (p.y + q.y) / 2;
      if (y < n.y - 0.9 || y > n.y - 0.12) continue;
      const k2 = Math.round(y * 100);
      largo.set(k2, (largo.get(k2) ?? 0) + Math.abs(q.x - p.x));
    }
    const ys = [...largo].filter(([, l]) => l >= luz / 3).map(([y]) => y / 100);
    return ys.length ? Math.min(...ys) : null;
  });
}

// Paños del destino (marco del destino): entre las caras de columna (las del destino o las de la
// pieza si son más anchas) y de cada piso al fondo de la viga siguiente. top(x): fondo de la viga
// de la pieza ya adaptada (o la del destino); topD(x): el del generador. seguro: cabe un muro.
function panosDestino(destino, caras, fondos, fx, fy) {
  const perfil = perfilDestino(destino), vh = destino.viga?.h ?? 0.4;
  const pisos = destino.pisos?.length ? destino.pisos : [0];
  const panos = [];
  for (let i = 0; i + 1 < destino.ejes.length; i++) {
    const x0 = Math.max(destino.ejes[i].s1 ?? destino.ejes[i].x, fx(caras[i].r)) + 0.005;
    const x1 = Math.min(destino.ejes[i + 1].s0 ?? destino.ejes[i + 1].x, fx(caras[i + 1].l)) - 0.005;
    // Hasta dónde puede llegar algo del paño: el acero de un dintel o una VSa se ancla en las
    // columnas vecinas, pero no las atraviesa.
    const xmin = Math.min(destino.ejes[i].s0 ?? destino.ejes[i].x, fx(caras[i].l)) - 0.05;
    const xmax = Math.max(destino.ejes[i + 1].s1 ?? destino.ejes[i + 1].x, fx(caras[i + 1].r)) + 0.05;
    pisos.forEach((y0, n) => {
      const sig = pisos[n + 1];
      const topD = (x) => (sig ?? perfil(x)) - vh;
      const fondo = fondos[n] != null ? fy(fondos[n]) : null;
      // El fondo de la viga de la pieza manda si está cerca del del destino (la viga de la pieza
      // es la que se ve); si no, el del destino.
      const top = fondo != null && Math.abs(fondo - topD((x0 + x1) / 2)) < 0.35 ? () => fondo : topD;
      const xm = (x0 + x1) / 2;
      panos.push({i, n, x0, x1, xmin, xmax, y0, top, topD, seguro: x1 - x0 >= 0.3 && top(xm) - y0 >= 1.0 && topD(xm) - y0 >= 1.0});
    });
  }
  return panos;
}

// Muestras cada 10 cm de una entidad ya llevada al destino (puntos [x, y]).
function muestras(pts, cerrada) {
  const out = [];
  const lados = pts.length < 2 ? [] : [...pts.slice(1).map((q, i) => [pts[i], q]), ...(cerrada && pts.length > 2 ? [[pts.at(-1), pts[0]]] : [])];
  if (!lados.length) return pts.map(([x, y]) => ({x, y}));
  lados.forEach(([p, q], j) => {
    const n = Math.max(1, Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / 0.1));
    for (let k = j ? 1 : 0; k <= n; k++) out.push({x: p[0] + ((q[0] - p[0]) * k) / n, y: p[1] + ((q[1] - p[1]) * k) / n});
  });
  return out;
}

// Paño en que cae una entidad: todo su ancho entre las columnas que lo cierran (puede anclarse en
// ellas, no atravesarlas) y la mayor parte de su trazo adentro del paño. Lo que corre
// sobre el borde (caras de columna, piso, fondo de la viga) no cuenta ni a favor ni en contra:
// una línea solo sobre el borde se queda (es de la columna, del piso o de la viga).
function panoDe(pts, cerrada, panos, {minimo = 0.55, top = "top"} = {}) {
  const ms = muestras(pts, cerrada);
  if (!ms.length) return null;
  const xa = Math.min(...ms.map((q) => q.x)), xb = Math.max(...ms.map((q) => q.x));
  const B = 0.01;
  for (const P of panos) {
    if (xa < P.xmin || xb > P.xmax) continue;
    let dentro = 0, fuera = 0;
    for (const q of ms) {
      const t = P[top](q.x);
      const borde = Math.abs(q.x - P.x0) < B || Math.abs(q.x - P.x1) < B || Math.abs(q.y - P.y0) < B || Math.abs(q.y - t) < B;
      if (borde) continue;
      if (q.x > P.x0 && q.x < P.x1 && q.y > P.y0 && q.y < t) dentro++; else fuera++;
    }
    if (dentro && dentro / (dentro + fuera) >= minimo) return P;
  }
  return null;
}

const enPano = (q, P, top = "top") => q.x > P.x0 && q.x < P.x1 && q.y > P.y0 && q.y < P[top](q.x);

// Contenido del generador en los paños seguros, llevado a la altura libre del paño de la pieza
// (si su viga es más o menos peraltada que la del destino) y recortado a sus caras.
function contenidoDePanos(primitivas, panos) {
  const seguros = panos.filter((P) => P.seguro);
  const out = [];
  const ajustar = (P) => ([x, y]) => {
    const xc = Math.min(P.x1, Math.max(P.x0, x));
    const tD = P.topD(xc), t = P.top(xc);
    const yy = tD - P.y0 > 0.01 ? P.y0 + ((Math.min(y, tD) - P.y0) * (t - P.y0)) / (tD - P.y0) : y;
    return [r4(xc), r4(yy)];
  };
  for (const p of primitivas) {
    if (p.type === "text") {
      // Del generador, solo los rótulos de lo que va en el muro: los de vigas y estribos ya los
      // pone la pieza.
      if (p.layer === L.ESTRIBOS || (p.layer === L.VIGAS && !/^(VSa|DINTEL)$/.test(p.value))) continue;
      const q = {x: p.at[0], y: p.at[1]};
      const P = seguros.find((x) => enPano(q, x, "topD"));
      if (P) out.push({...p, at: ajustar(P)(p.at)});
      continue;
    }
    const pts = p.type === "line" ? [p.a, p.b] : p.type === "pline" || p.type === "hatch" ? p.points : p.type === "circle" ? [p.c] : null;
    if (!pts) continue;
    const P = panoDe(pts, p.closed || p.type === "hatch", seguros, {minimo: 0.5, top: "topD"});
    if (!P) continue;
    const f = ajustar(P);
    if (p.type === "line") out.push({...p, a: f(p.a), b: f(p.b)});
    else if (p.type === "circle") out.push({...p, c: f(p.c)});
    else out.push({...p, points: p.points.map(f)});
  }
  return out;
}

// Lo que el metrado toma del pórtico (columnetas, VSa y dinteles) reducido a lo que quedó
// dibujado: el generador las dibuja en el orden del modelo (columneta: un rectángulo E-COLUMNAS
// que nace en ±0.00; VSa y dintel: su rótulo). null si el dibujo y el modelo no se corresponden.
function modeloDibujado(modelo, primitivas, panos) {
  if (!modelo) return modelo;
  const seguros = panos.filter((P) => P.seguro);
  const centro = (pts) => ({x: pts.reduce((s, q) => s + q[0], 0) / pts.length, y: pts.reduce((s, q) => s + q[1], 0) / pts.length});
  const ctas = primitivas.filter((p) => p.type === "pline" && p.layer === L.COLUMNAS && p.closed && Math.abs(Math.min(...p.points.map((q) => q[1]))) < 1e-6);
  const rotulo = (v) => primitivas.filter((p) => p.type === "text" && p.layer === L.VIGAS && p.value === v);
  const vsa = rotulo("VSa"), din = rotulo("DINTEL");
  const n = (x) => (x ?? []).length;
  if (ctas.length !== n(modelo.columnetas) || vsa.length !== n(modelo.vsa) || din.length !== n(modelo.dinteles)) return null;
  const dibujado = (q) => seguros.some((P) => enPano(q, P, "topD"));
  return {
    ...modelo,
    columnetas: (modelo.columnetas ?? []).filter((_, k) => dibujado(centro(ctas[k].points))),
    vsa: (modelo.vsa ?? []).filter((_, k) => dibujado({x: vsa[k].at[0], y: vsa[k].at[1]})),
    dinteles: (modelo.dinteles ?? []).filter((_, k) => dibujado({x: din[k].at[0], y: din[k].at[1]})),
  };
}

// generado: {primitivas, modelo} de planoPortico para el mismo eje. Con él, los paños de muro de
// la pieza se reemplazan por los del destino y el modelo describe lo que quedó dibujado.
export function adaptarPortico(pieza, destino, {eje = destino.eje, generado = null} = {}) {
  const {fx, fy, a, d} = transformacion(pieza, destino);
  const Q = (q) => [r4(fx(q.x)), r4(fy(q.y))];
  const ents = pieza.entidades ?? [];
  const reemplazos = {ejes: 0, niveles: 0, cotasRecalculadas: 0, cotasQuitadas: 0, codigos: 0, secciones: 0, titulos: 0, panos: 0, panosQuitados: 0, quitadasDePanos: 0, delOrigen: 0, cruzanColumna: 0};

  // Título y escala de la pieza: la lámina pone los suyos. También su subrayado.
  const titulos = ents.filter((e) => e.tipo === "texto" && TITULO.test(e.texto ?? ""));
  const zonasTitulo = titulos.map((e) => { const c = cajaTexto(e), g = (e.alto ?? 0.1) * 1.2; return {x0: c.x0 - g, y0: c.y0 - g * 1.5, x1: c.x1 + g, y1: c.y1 + g}; });
  // Subrayado: trazos horizontales bajo el título que lo abarcan (hasta 4 veces su ancho).
  const subrayado = titulos.map((e) => { const c = cajaTexto(e), w = c.x1 - c.x0, g = (e.alto ?? 0.1) * 2.5; return {x0: c.x0 - w * 1.5, y0: c.y0 - g, x1: c.x1 + w * 1.5, y1: c.y1}; });
  const enTitulo = (e) => zonasTitulo.some((z) => (e.puntos ?? [e.centro]).every((q) => dentro(q, z)))
    || ((e.puntos?.length ?? 0) >= 2 && e.puntos.every((q) => Math.abs(q.y - e.puntos[0].y) < 0.01) && subrayado.some((z) => e.puntos.every((q) => dentro(q, z))));

  // Burbujas de los ejes: círculos sobre el techo centrados en un eje de la pieza.
  const burbujas = [];
  for (const e of ents) {
    if (e.tipo !== "circulo" || e.radio < 0.06 || e.radio > 0.9 || e.centro.y < a.pisos.at(-1).y) continue;
    const i = a.ejes.findIndex((x) => Math.abs(x.x - e.centro.x) < Math.max(0.1, e.radio * 0.5));
    if (i >= 0) burbujas.push({e, i});
  }
  // Lo que dibuja una burbuja (círculo y sus marcas) se traslada con ella sin deformarse: la
  // columna del destino puede estirar la zona del eje.
  const rigidoDeBurbuja = (e) => {
    const ps = e.puntos ?? [e.centro];
    const b = burbujas.find(({e: c}) => ps.every((q) => Math.hypot(q.x - c.centro.x, q.y - c.centro.y) <= c.radio * 1.6 + (e.radio ?? 0)));
    if (!b) return null;
    const [cx, cy] = Q(b.e.centro), dx = cx - b.e.centro.x, dy = cy - b.e.centro.y;
    return (q) => [r4(q.x + dx), r4(q.y + dy)];
  };
  // Segmentos de la pieza para encontrar la línea de cada cota.
  const segmentos = [];
  for (const e of ents) if (e.tipo === "linea" || e.tipo === "poli") for (let i = 1; i < (e.puntos?.length ?? 0); i++) segmentos.push([e.puntos[i - 1], e.puntos[i]]);
  // Zona rígida: alrededor del punto la transformación es una traslación.
  const rigido = (q) => Math.abs(fx(q.x + 0.05) - fx(q.x) - 0.05) < 0.002 && Math.abs(fy(q.y + 0.05) - fy(q.y) - 0.05) < 0.002;
  // Valor del destino para una cota de nivel de la pieza (por su valor rotulado).
  const niveles = (pieza.niveles ?? []).filter((n) => Number.isFinite(n.cota) && Number.isFinite(n.y));

  // Paños de muro (solo con el dibujo del generador para reponerlos).
  const segs = generado ? segmentosDibujo(ents) : [];
  // Caras de columna: por sus estribos si se ven; si no, por sus trazos verticales.
  const caras = generado ? carasDePieza(segs, a, destino).map((c, i) => a.columnas?.[i] ?? c) : [];
  const panos = generado ? panosDestino(destino, caras, fondosDeViga(segs, a), fx, fy) : [];
  const perfil = perfilDestino(destino);
  const df = destino.cimentacion?.df ?? 1.5;

  const prim = [];
  const fijos = new Set(); // textos traducidos al destino (ejes, niveles, cotas): no se quitan
  const color = (e) => (Number.isInteger(e.color) ? {color: e.color} : {});
  for (const e of ents) {
    // Trozos de un cuadro vecino (cuadro de columnetas bajo el pórtico) que cayeron en la caja.
    if (generado && /cuadro/i.test(e.capa ?? "")) { reemplazos.delOrigen++; continue; }
    if (e.tipo === "texto") {
      let valor = String(e.texto ?? "");
      if (!valor.trim()) continue;
      if (titulos.includes(e)) { reemplazos.titulos++; continue; }
      const c = centroTexto(e);
      let fijo = false;
      const b = burbujas.find((x) => Math.hypot(c.x - x.e.centro.x, c.y - x.e.centro.y) <= x.e.radio * 1.3 && valor.trim().length <= 4);
      if (b) {
        const nombre = d.ejes[b.i]?.nombre ?? "";
        if (!nombre) continue;
        valor = nombre; reemplazos.ejes++; fijo = true;
      } else if (NIVEL.test(valor) && NUMERO.test(valor)) {
        const m = NUMERO.exec(valor), v = (m[1] === "-" || m[1] === "−" ? -1 : 1) * Number(`${m[2]}.${m[3]}`);
        const n = niveles.find((x) => Math.abs(x.cota - v) < 0.015);
        if (n) { valor = conValor(valor, r4(fy(n.y))); reemplazos.niveles++; }
        fijo = true;
      } else if (COTA.test(valor)) {
        const v = Number(valor.trim().replace(",", "."));
        const linea = lineaDeCota(e, v, segmentos);
        if (linea) {
          const nuevo = Math.hypot(fx(linea.b.x) - fx(linea.a.x), fy(linea.b.y) - fy(linea.a.y));
          if (Math.abs(nuevo - v) > 0.005) { valor = conValor(valor, nuevo); reemplazos.cotasRecalculadas++; }
        } else if (!rigido(c)) { reemplazos.cotasQuitadas++; continue; }
        fijo = true;
      } else if (CODIGO_COLUMNA.test(valor)) {
        const i = a.ejes.findIndex((x) => Math.abs(x.x - c.x) < 0.5);
        if (i >= 0 && d.ejes[i]?.tipo) { valor = d.ejes[i].tipo; reemplazos.codigos++; }
        else if (generado) { reemplazos.delOrigen++; continue; }
      } else if (destino.viga && SECCION_VIGA.test(valor)) {
        valor = valor.replace(SECCION_VIGA, (m, pre, b0, h0) => `${pre}${conValor(b0, destino.viga.b)}x${conValor(h0, destino.viga.h)}`);
        reemplazos.secciones++;
      } else if (destino.viga && SECCION_CM.test(valor)) {
        valor = valor.replace(SECCION_CM, () => `(${Math.round(destino.viga.b * 100)}x${Math.round(destino.viga.h * 100)}cm)`);
        reemplazos.secciones++;
      } else if (generado && DEL_ORIGEN.some((x) => x.test(valor))) {
        reemplazos.delOrigen++; continue;
      }
      const at = Q(c);
      if (generado && !fijo) {
        const q = {x: at[0], y: at[1]};
        const P = panos.find((x) => enPano(q, x));
        // En un paño solo quedan las especificaciones de estribos junto a una columna (girados) o
        // bajo la viga: describen columnas y vigas, no el muro.
        if (P) {
          const girado = Math.abs(Math.sin((giro(e) * Math.PI) / 180)) > 0.7;
          const estribo = /@/.test(valor) && (girado ? Math.min(q.x - P.x0, P.x1 - q.x) < 0.35 : q.y > P.top(q.x) - 0.45);
          if (!estribo) { reemplazos.quitadasDePanos++; continue; }
        }
      }
      prim.push({type: "text", layer: capaDe(e), at, value: valor, h: e.alto ?? 0.1, rot: giro(e), ...color(e), ...(fijo ? {} : {_pieza: true})});
    } else if (e.tipo === "linea" || e.tipo === "poli") {
      if (!(e.puntos?.length >= 2) || enTitulo(e)) continue;
      const pts = e.puntos.map(rigidoDeBurbuja(e) ?? Q);
      if (generado && panoDe(pts, e.cerrada, panos)) { reemplazos.quitadasDePanos++; continue; }
      if (e.tipo === "linea" && pts.length === 2) prim.push({type: "line", layer: capaDe(e), a: pts[0], b: pts[1], ...color(e)});
      else prim.push({type: "pline", layer: capaDe(e), points: pts, closed: Boolean(e.cerrada), ...color(e)});
    } else if (e.tipo === "circulo") {
      const c = Q(e.centro);
      if (generado && panos.some((P) => enPano({x: c[0], y: c[1]}, P))) { reemplazos.quitadasDePanos++; continue; }
      prim.push({type: "circle", layer: capaDe(e), c, r: e.radio, ...color(e)});
    }
  }

  // Rótulos de la pieza (no traducidos) que, horizontales, cruzan la cara de una columna: se
  // quitan (un rótulo de estribos atravesando la columna no se lee y confunde).
  const salida = [];
  for (const p of prim) {
    if (p.type === "text" && p._pieza && generado) {
      const g = ((p.rot ?? 0) * Math.PI) / 180;
      if (Math.abs(Math.sin(g)) < 0.3) {
        const w = anchoTexto(p.value, p.h) * Math.abs(Math.cos(g)), x0 = p.at[0] - w / 2, x1 = p.at[0] + w / 2;
        const cruza = destino.ejes.some((c) => [c.s0, c.s1].some((f) => f != null && x0 < f - 0.05 && x1 > f + 0.05) && p.at[1] > -df - 0.3 && p.at[1] < perfil(c.x));
        if (cruza) { reemplazos.cruzanColumna++; continue; }
      }
    }
    const {_pieza, ...limpio} = p;
    salida.push(limpio);
  }

  // Contenido del destino en los paños: muros, vanos, columnetas, dinteles, VSa y sus rótulos,
  // en sus capas semánticas (la lámina los lleva a las del despacho y aparta sus rótulos).
  let modelo;
  if (generado) {
    const nuevo = contenidoDePanos(generado.primitivas ?? [], panos);
    salida.push(...nuevo);
    reemplazos.panos = panos.filter((P) => P.seguro).length;
    reemplazos.panosQuitados = panos.length - reemplazos.panos;
    modelo = modeloDibujado(generado.modelo, generado.primitivas ?? [], panos);
  }

  // Caja de las burbujas (la lámina ubica el pórtico donde el ingeniero puso el suyo) y marco.
  const cajas = burbujas.map(({e}) => { const [x, y] = Q(e.centro); return {x0: x - e.radio, y0: y - e.radio, x1: x + e.radio, y1: y + e.radio}; });
  const marco = {x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity};
  for (const p of salida) {
    for (const q of p.type === "line" ? [p.a, p.b] : p.type === "pline" || p.type === "hatch" ? p.points : [p.c ?? p.at]) {
      marco.x0 = Math.min(marco.x0, q[0] - 0.3); marco.y0 = Math.min(marco.y0, q[1] - 0.3);
      marco.x1 = Math.max(marco.x1, q[0] + 0.3); marco.y1 = Math.max(marco.y1, q[1] + 0.3);
    }
  }
  const tope = d.tope;
  const ejes = cajas.length
    ? {x0: Math.min(...cajas.map((c) => c.x0)), y0: Math.min(...cajas.map((c) => c.y0)), x1: Math.max(...cajas.map((c) => c.x1)), y1: Math.max(...cajas.map((c) => c.y1))}
    : {x0: d.ejes[0].x - 0.4, y0: tope + 0.8, x1: d.ejes.at(-1).x + 0.4, y1: tope + 1.6};
  return {
    contenido: {titulo: `PLANO DE PÓRTICO EJE ${eje}-${eje}`, primitivas: salida, ejes, marco, h: destino.h ?? 0.2, notas: []},
    reemplazos,
    ...(generado ? {modelo} : {}),
  };
}

// Biblioteca: un arreglo de piezas o {piezas, excluir, minimo}.
// Devuelve el resultado de planoPortico con el dibujo adaptado: la estructura (columnas, vigas,
// losas, cimentación) del ingeniero y, en los paños de muro, lo del destino; el modelo (metrado)
// describe lo que quedó dibujado. Si ninguna pieza se parece lo suficiente, o el dibujo del
// generador no se corresponde con su modelo, el mismo resultado.
export function porticoDesdeBiblioteca(resultado, biblioteca) {
  const piezas = Array.isArray(biblioteca) ? biblioteca : biblioteca?.piezas;
  if (!piezas?.length || !resultado?.geometria) return resultado;
  const opciones = Array.isArray(biblioteca) ? {} : biblioteca;
  const elegida = elegirPortico(resultado.geometria, piezas, {excluir: opciones.excluir ?? null, ...(opciones.minimo != null ? {minimo: opciones.minimo} : {})});
  if (!elegida) return resultado;
  let adaptado;
  try { adaptado = adaptarPortico(elegida.pieza, resultado.geometria, {generado: {primitivas: resultado.contenido.primitivas, modelo: resultado.modelo}}); } catch { return resultado; }
  if (!adaptado.contenido.primitivas.length || (resultado.modelo && !adaptado.modelo)) return resultado;
  const modelo = adaptado.modelo ?? resultado.modelo;
  return {
    ...resultado,
    modelo,
    // Vanos dibujados (los del generador que quedaron en un paño).
    vanos: modelo && resultado.modelo && (modelo.vsa?.length !== resultado.modelo.vsa?.length || modelo.dinteles?.length !== resultado.modelo.dinteles?.length)
      ? [...(modelo.dinteles ?? []), ...(modelo.vsa ?? [])].map((v) => v.nombre)
      : resultado.vanos,
    contenido: {...adaptado.contenido, notas: resultado.contenido.notas},
    generador: resultado.contenido,
    biblioteca: {pieza: elegida.pieza.archivo ?? elegida.pieza.huella ?? elegida.pieza.titulo, puntaje: elegida.puntaje, porque: elegida.porque, reemplazos: adaptado.reemplazos},
  };
}
