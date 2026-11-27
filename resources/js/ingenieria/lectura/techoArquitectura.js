// Techo leído de la arquitectura: pendientes de la cubierta, nivel de cumbrera y dónde va la
// cumbrera en planta. Lo que dice el plano manda sobre los supuestos del generador.
//
// El arquitecto dibuja el techo inclinado en los cortes y elevaciones (el perfil del faldón con su
// "PENDIENTE: 50.95%") y anota los niveles (NFT, NTT). La planta no dice por dónde pasa la
// cumbrera: se sabe con el perfil del corte (dónde cae el pico respecto de los muros) llevado a los
// ejes de la planta. Así un techo asimétrico (51 % a un lado y 40 % al otro, cumbrera sobre el eje
// central) sale como lo dibujó el arquitecto y no como un techo plano o centrado.

// Pendiente escrita: "PTE=33%", "PENDIENTE: 50.95%", "S=40%".
const PATRON = /(?:\bPTE|\bPEND(?:IENTE)?|\bS)\s*\.?\s*[=:]?\s*(\d+(?:[.,]\d+)?)\s*%/i;
// Pendientes que no son del techo: rampas, pisos, veredas, drenaje.
const NO_TECHO = /RAMPA|PISO|VEREDA|AFIRMAD|PATIO|CUNETA|CANALETA|DESAG|TUBER|ESCALER|SARDINEL|JARD|CONTRAPISO|LOSA DEPORT|PISTA|ESTACION/i;
// Textos o capas que sí son del techo.
const DE_TECHO = /CUBIERTA|COBERTURA|TECHO|TEJA|CALAMINA|TR-?4|ALUZINC|ETERNIT|POLICARB|∠/i;
const CAPA_TECHO = /TECH|COBERT|CUBIERT/i;

// Pendientes de la cubierta (fracción, 0.05–1.5): las escritas que no son de rampas, pisos ni drenaje
// (una rampa al 10 % no es el techo). "S=40%" suelto solo cuenta en una capa de techo o junto a la
// palabra cubierta/techo: en un piso es la pendiente del piso.
export function pendientesDeTecho(items = []) {
  const deTecho = [], otras = [];
  for (const it of items) {
    if (it.tipo !== "texto" || !it.texto) continue;
    const m = PATRON.exec(it.texto);
    if (!m || NO_TECHO.test(it.texto)) continue;
    const v = Number(m[1].replace(",", ".")) / 100;
    if (!(v >= 0.05 && v <= 1.5)) continue;
    // "S=40%" suelto solo cuenta si está en una capa de techo (en un piso es la pendiente del piso).
    const esS = /^\s*S\s*=/i.test(it.texto.slice(m.index));
    if (DE_TECHO.test(it.texto) || CAPA_TECHO.test(it.capa ?? "")) deTecho.push(v);
    else if (!esS) otras.push(v);
  }
  const lista = [...deTecho, ...otras];
  return [...new Set(lista.map((v) => Math.round(v * 10000) / 10000))].sort((a, b) => a - b);
}

// Segmentos inclinados de las capas de techo (perfil de cortes y elevaciones), en metros.
function segmentosInclinados(items, k) {
  const segs = [];
  for (const it of items) {
    if ((it.tipo !== "linea" && it.tipo !== "poli") || !CAPA_TECHO.test(it.capa ?? "") || !(it.puntos?.length >= 2)) continue;
    const pts = it.puntos.map((p) => ({x: p.x / k, y: p.y / k}));
    if (it.cerrada && pts.length > 2) pts.push(pts[0]);
    for (let i = 1; i < pts.length; i++) {
      let a = pts[i - 1], b = pts[i];
      if (b.x < a.x) [a, b] = [b, a];
      const dx = b.x - a.x;
      if (dx < 0.8) continue;
      const s = (b.y - a.y) / dx;
      if (Math.abs(s) < 0.05 || Math.abs(s) > 1.5) continue;
      segs.push({a, b, s, capa: it.capa});
    }
  }
  return segs;
}

// Picos de los perfiles: un faldón que sube y otro que baja con el mismo punto alto. Cada faldón se
// prolonga por los tramos colineales (el perfil puede venir en varias piezas).
export function picosDeTecho(items, {k = 1, pendientes = []} = {}) {
  const segs = segmentosInclinados(items, k);
  const coincide = (s) => !pendientes.length || pendientes.some((p) => Math.abs(Math.abs(s) - p) <= 0.03);
  const cerca = (p, q) => Math.hypot(p.x - q.x, p.y - q.y) <= 0.08;
  const suben = segs.filter((g) => g.s > 0 && coincide(g.s)), bajan = segs.filter((g) => g.s < 0 && coincide(g.s));
  const alargar = (g, haciaIzq) => {
    let extremo = haciaIzq ? g.a : g.b;
    for (let n = 0; n < 20; n++) {
      const sig = segs.find((h) => h !== g && Math.abs(h.s - g.s) <= 0.02 && cerca(haciaIzq ? h.b : h.a, extremo));
      if (!sig) break;
      extremo = haciaIzq ? sig.a : sig.b;
    }
    return extremo;
  };
  const picos = [];
  for (const r of suben) {
    for (const f of bajan) {
      if (!cerca(r.b, f.a)) continue;
      const izq = alargar(r, true), der = alargar(f, false);
      // La pendiente es la escrita (lo que dice el plano); la medida en el dibujo solo la identifica.
      const escrita = (s) => pendientes.filter((p) => Math.abs(p - s) <= 0.03).sort((p, q) => Math.abs(p - s) - Math.abs(q - s))[0] ?? s;
      const pico = {x: (r.b.x + f.a.x) / 2, y: (r.b.y + f.a.y) / 2, sIzq: escrita(r.s), sDer: escrita(-f.s), runIzq: r.b.x - izq.x, runDer: der.x - f.a.x};
      // Losa, cobertura y fondo dibujan el mismo techo con líneas paralelas: uno por techo, el más largo.
      const igual = picos.find((p) => Math.abs(p.x - pico.x) < 0.6 && Math.abs(p.y - pico.y) < 1);
      if (!igual) picos.push(pico);
      else if (pico.runIzq + pico.runDer > igual.runIzq + igual.runDer) Object.assign(igual, pico);
    }
  }
  return picos.sort((p, q) => (q.runIzq + q.runDer) - (p.runIzq + p.runDer));
}

// Título del corte bajo un pico ("CORTE LONGITUDINAL B - B"): dice en qué dirección de la planta se cortó.
function sentidoDelCorte(items, pico, k) {
  let mejor = null;
  for (const it of items) {
    if (it.tipo !== "texto" || !it.centro || !/CORTE\s+(LONGITUDINAL|TRANSVERSAL)/i.test(it.texto ?? "")) continue;
    const p = {x: it.centro.x / k, y: it.centro.y / k};
    if (p.y > pico.y || pico.y - p.y > 15) continue;
    if (p.x < pico.x - pico.runIzq - 4 || p.x > pico.x + pico.runDer + 4) continue;
    const d = Math.hypot(p.x - pico.x, p.y - pico.y);
    if (!mejor || d < mejor.d) mejor = {d, longitudinal: /LONGITUDINAL/i.test(it.texto)};
  }
  return mejor ? (mejor.longitudinal ? "largo" : "corto") : null;
}

// Niveles escritos (NFT / NTT con +), sin repetir.
function nivelesEscritos(items) {
  const v = new Set();
  for (const it of items) {
    if (it.tipo !== "texto" || !it.texto) continue;
    const m = /N\.?\s*[FT]\.?\s*T\.?\s*[:=]?\s*\+\s*(\d+(?:[.,]\d+)?)/i.exec(it.texto);
    if (m) v.add(Number(m[1].replace(",", ".")));
  }
  return [...v].filter((x) => x >= 2.2 && x <= 15).sort((a, b) => a - b);
}

// Nivel de la cumbrera escrito: el NFT/NTT más alto cuando hay otro más bajo (el del alero o el de
// un corte paralelo a la cumbrera) a no más de 4 m. Solo con un nivel escrito no se sabe si es el
// alero o la cumbrera: null.
export function nivelCumbreraEscrito(items) {
  const v = nivelesEscritos(items);
  if (v.length < 2) return null;
  const alto = v.at(-1);
  return v.some((x) => alto - x >= 0.3 && alto - x <= 4) ? alto : null;
}

// Techo a dos aguas de la arquitectura llevado a la planta.
// lectura: {columnas (contorno, nodo), ejes (p, q, nombre)} en metros; k: unidades de dibujo por metro.
// u: dirección principal de la grilla. Devuelve null si los cortes no muestran un techo a dos aguas.
// Resultado: {linea: {a, d}, pendientes: {neg, pos}, eje, sentido, pico} — pendientes del faldón a
// cada lado de la recta (signo del producto cruz de d con el punto), eje: el de la cumbrera si cae
// en uno.
export function techoDesdeArquitectura(items, {lectura, k = 1, u}) {
  const pendientes = pendientesDeTecho(items);
  const picos = picosDeTecho(items, {k, pendientes});
  if (!picos.length || !lectura?.columnas?.length || !u) return null;
  const pico = picos[0];
  const v = {x: -u.y, y: u.x};
  const pts = lectura.columnas.flatMap((c) => c.contorno ?? [c.nodo ?? c]).filter(Boolean);
  const pr = (p, e) => p.x * e.x + p.y * e.y;
  const rango = (e) => { const s = pts.map((p) => pr(p, e)); return [Math.min(...s), Math.max(...s)]; };
  const [u0, u1] = rango(u), [v0, v1] = rango(v);
  const largoU = u1 - u0, largoV = v1 - v0;
  const larga = largoU >= largoV ? u : v, corta = larga === u ? v : u;
  // Dirección en que se cortó: la del título; si no la dice, la extensión de la planta más parecida
  // al ancho del perfil (que trae los aleros).
  const sentido = sentidoDelCorte(items, pico, k);
  const ancho = pico.runIzq + pico.runDer;
  const dir = sentido === "largo" ? larga : sentido === "corto" ? corta
    : Math.abs(ancho - Math.max(largoU, largoV)) <= Math.abs(ancho - Math.min(largoU, largoV)) ? larga : corta;
  const [d0, d1] = dir === u ? [u0, u1] : [v0, v1];
  const largo = d1 - d0;
  if (largo < 1) return null;
  const f = pico.runIzq / ancho;
  // Ejes perpendiculares a la dirección del corte, por dentro de la planta: la cumbrera se apoya en
  // uno (viga de cumbrera). Se prueba el corte visto de frente y de espaldas (espejo).
  const ejes = (lectura.ejes ?? []).filter((e) => {
    const l = Math.hypot(e.q.x - e.p.x, e.q.y - e.p.y) || 1;
    return Math.abs(((e.q.x - e.p.x) * dir.x + (e.q.y - e.p.y) * dir.y) / l) < 0.2;
  }).map((e) => ({e, t: pr(e.p, dir)})).filter(({t}) => t > d0 + 0.3 && t < d1 - 0.3);
  let mejor = null;
  for (const {e, t} of ejes) {
    const g = (t - d0) / largo;
    for (const espejo of [false, true]) {
      const err = Math.abs(g - (espejo ? 1 - f : f));
      if (err <= 0.15 && (!mejor || err < mejor.err)) mejor = {err, t, espejo, eje: e.nombre};
    }
  }
  // Sin eje donde apoyarla: en la proporción del corte (la más cercana al centro si es simétrico).
  if (!mejor) mejor = {t: d0 + f * largo, espejo: false, eje: null};
  const perp = dir === u ? v : u;
  const a = {x: dir.x * mejor.t + perp.x * ((perp === v ? v0 + v1 : u0 + u1) / 2), y: dir.y * mejor.t + perp.y * ((perp === v ? v0 + v1 : u0 + u1) / 2)};
  // Faldón del lado de d0 (antes del pico en el corte, salvo espejo) y del lado de d1.
  const sBajo = mejor.espejo ? pico.sDer : pico.sIzq, sAlto = mejor.espejo ? pico.sIzq : pico.sDer;
  const lado = (p) => Math.sign(perp.x * (p.y - a.y) - perp.y * (p.x - a.x));
  const ladoBajo = lado({x: a.x - dir.x, y: a.y - dir.y});
  const r = (x) => Math.round(x * 10000) / 10000;
  return {
    linea: {a, d: perp},
    pendientes: ladoBajo < 0 ? {neg: r(sBajo), pos: r(sAlto)} : {neg: r(sAlto), pos: r(sBajo)},
    eje: mejor.eje, sentido: sentido ?? "perfil", pico,
  };
}

// Pendiente del faldón en un punto de la planta (según el lado de la cumbrera) y la cota del techo
// ahí: cumbrera − pendiente × distancia a la recta de la cumbrera.
export function cotaDelTecho(techo, p, nivelCumbrera) {
  const {a, d} = techo.linea;
  const c = d.x * (p.y - a.y) - d.y * (p.x - a.x);
  const s = c < 0 ? techo.pendientes.neg : techo.pendientes.pos;
  return nivelCumbrera - s * Math.abs(c);
}
