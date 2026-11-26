// Modelos de aprendizaje para decisiones de dibujo (clasificación binaria), sin dependencias: el
// navegador usa exactamente lo que se entrenó (scripts/agente/entrenar-modelos.mjs). Cada modelo es
// JSON plano: {tipo, rasgos, ...}; predecirModelo(modelo, rasgos) da la probabilidad de "sí".
//   - arbol: árbol de decisión CART (Gini), con sus ramas legibles (textoArbolModelo);
//   - bosque: bosque aleatorio (árboles sobre remuestreos y subconjuntos de rasgos);
//   - logistica: regresión logística (lineal, línea base de los modelos);
//   - red: red neuronal de una capa oculta (tanh), entrenada con Adam y regularización L2.
// Con pocos proyectos, una red puede sobreajustarse: por eso se valida dejando un PROYECTO fuera.

// Aleatorio con semilla (mulberry32): mismo entrenamiento, mismo modelo.
export function aleatorio(semilla = 1) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const vector = (rasgos, nombres) => nombres.map((k) => Number(rasgos?.[k]) || 0);
const sigmoide = (z) => 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, z))));

// ---------- Árbol de decisión (CART) ----------

function gini(pos, n) { if (!n) return 0; const p = pos / n; return 2 * p * (1 - p); }

function umbrales(valores, max = 24) {
  const u = [...new Set(valores)].sort((a, b) => a - b);
  if (u.length <= 1) return [];
  const medios = u.slice(1).map((v, i) => (v + u[i]) / 2);
  if (medios.length <= max) return medios;
  return Array.from({length: max}, (_, i) => medios[Math.floor(((i + 0.5) * medios.length) / max)]);
}

function crecerArbol(X, y, idx, opc, prof, rnd) {
  const n = idx.length, pos = idx.reduce((s, i) => s + y[i], 0);
  const hoja = {p: (pos + 1) / (n + 2), n};
  if (prof >= opc.profundidad || n < 2 * opc.minHoja || pos === 0 || pos === n) return hoja;
  const d = X[0].length;
  let rasgos = [...Array(d).keys()];
  if (opc.rasgosPorNodo && opc.rasgosPorNodo < d) {
    for (let i = d - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [rasgos[i], rasgos[j]] = [rasgos[j], rasgos[i]]; }
    rasgos = rasgos.slice(0, opc.rasgosPorNodo);
  }
  let mejor = null;
  const base = gini(pos, n);
  for (const f of rasgos) {
    for (const t of umbrales(idx.map((i) => X[i][f]))) {
      let nI = 0, pI = 0;
      for (const i of idx) if (X[i][f] <= t) { nI++; pI += y[i]; }
      const nD = n - nI;
      if (nI < opc.minHoja || nD < opc.minHoja) continue;
      const ganancia = base - (nI / n) * gini(pI, nI) - (nD / n) * gini(pos - pI, nD);
      if (!mejor || ganancia > mejor.ganancia) mejor = {f, t, ganancia};
    }
  }
  if (!mejor || mejor.ganancia <= 1e-6) return hoja;
  const izq = idx.filter((i) => X[i][mejor.f] <= mejor.t), der = idx.filter((i) => X[i][mejor.f] > mejor.t);
  return {f: mejor.f, t: mejor.t, n, izq: crecerArbol(X, y, izq, opc, prof + 1, rnd), der: crecerArbol(X, y, der, opc, prof + 1, rnd)};
}

const bajarArbol = (nodo, x) => { let q = nodo; while (q.izq) q = x[q.f] <= q.t ? q.izq : q.der; return q.p; };

export function entrenarArbol(X, y, rasgos, {profundidad = 5, minHoja = 20, semilla = 1} = {}) {
  return {tipo: "arbol", rasgos, raiz: crecerArbol(X, y, [...X.keys()], {profundidad, minHoja}, 0, aleatorio(semilla))};
}

export function entrenarBosque(X, y, rasgos, {arboles = 40, profundidad = 7, minHoja = 10, semilla = 7} = {}) {
  const rnd = aleatorio(semilla), n = X.length, d = X[0].length;
  const lista = [];
  for (let k = 0; k < arboles; k++) {
    const idx = Array.from({length: n}, () => Math.floor(rnd() * n));
    lista.push(crecerArbol(X, y, idx, {profundidad, minHoja, rasgosPorNodo: Math.max(1, Math.round(Math.sqrt(d)))}, 0, rnd));
  }
  return {tipo: "bosque", rasgos, arboles: lista};
}

// ---------- Escalado, regresión logística y red neuronal ----------

function escalado(X) {
  const d = X[0].length;
  const media = Array.from({length: d}, (_, j) => X.reduce((s, x) => s + x[j], 0) / X.length);
  const desv = Array.from({length: d}, (_, j) => Math.sqrt(X.reduce((s, x) => s + (x[j] - media[j]) ** 2, 0) / X.length) || 1);
  return {media, desv};
}
const escalar = (x, e) => x.map((v, j) => (v - e.media[j]) / e.desv[j]);

// Pesos por clase (si hay pocos "sí", pesan más) para no aprender a decir siempre "no".
const pesosClase = (y) => { const p = y.reduce((s, v) => s + v, 0) / y.length || 0.5; return [0.5 / (1 - p || 0.5), 0.5 / (p || 0.5)]; };

export function entrenarRed(X, y, rasgos, {ocultas = 12, epocas = 60, lote = 64, aprendizaje = 0.01, l2 = 1e-4, semilla = 3} = {}) {
  const rnd = aleatorio(semilla), e = escalado(X), Z = X.map((x) => escalar(x, e)), d = Z[0].length, h = ocultas;
  const gauss = () => { const u = rnd() || 1e-9, v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const W1 = Array.from({length: h}, () => Array.from({length: d}, () => gauss() * Math.sqrt(1 / d))), b1 = Array(h).fill(0);
  const W2 = Array.from({length: h}, () => gauss() * Math.sqrt(1 / h)); let b2 = 0;
  // Adam
  const m = {W1: W1.map((r) => r.map(() => 0)), b1: b1.map(() => 0), W2: W2.map(() => 0), b2: 0};
  const v = {W1: W1.map((r) => r.map(() => 0)), b1: b1.map(() => 0), W2: W2.map(() => 0), b2: 0};
  const [w0, w1] = pesosClase(y), B1 = 0.9, B2 = 0.999, EPS = 1e-8;
  let paso = 0;
  const orden = [...Z.keys()];
  for (let ep = 0; ep < epocas; ep++) {
    for (let i = orden.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [orden[i], orden[j]] = [orden[j], orden[i]]; }
    for (let s = 0; s < orden.length; s += lote) {
      const g = {W1: W1.map((r) => r.map(() => 0)), b1: Array(h).fill(0), W2: Array(h).fill(0), b2: 0};
      const tanda = orden.slice(s, s + lote);
      for (const i of tanda) {
        const x = Z[i], a = W1.map((w, k) => Math.tanh(w.reduce((t, wj, j) => t + wj * x[j], b1[k])));
        const p = sigmoide(a.reduce((t, ak, k) => t + ak * W2[k], b2));
        const err = (p - y[i]) * (y[i] ? w1 : w0);
        for (let k = 0; k < h; k++) {
          g.W2[k] += err * a[k];
          const da = err * W2[k] * (1 - a[k] * a[k]);
          g.b1[k] += da;
          for (let j = 0; j < d; j++) g.W1[k][j] += da * x[j];
        }
        g.b2 += err;
      }
      paso++;
      const actualizar = (val, grad, mm, vv) => { mm = B1 * mm + (1 - B1) * grad; vv = B2 * vv + (1 - B2) * grad * grad; const mh = mm / (1 - B1 ** paso), vh = vv / (1 - B2 ** paso); return [val - (aprendizaje * mh) / (Math.sqrt(vh) + EPS), mm, vv]; };
      const nT = tanda.length;
      for (let k = 0; k < h; k++) {
        for (let j = 0; j < d; j++) [W1[k][j], m.W1[k][j], v.W1[k][j]] = actualizar(W1[k][j], g.W1[k][j] / nT + l2 * W1[k][j], m.W1[k][j], v.W1[k][j]);
        [b1[k], m.b1[k], v.b1[k]] = actualizar(b1[k], g.b1[k] / nT, m.b1[k], v.b1[k]);
        [W2[k], m.W2[k], v.W2[k]] = actualizar(W2[k], g.W2[k] / nT + l2 * W2[k], m.W2[k], v.W2[k]);
      }
      [b2, m.b2, v.b2] = actualizar(b2, g.b2 / nT, m.b2, v.b2);
    }
  }
  const r = (z) => Math.round(z * 1e5) / 1e5;
  return {tipo: "red", rasgos, escala: {media: e.media.map(r), desv: e.desv.map(r)}, W1: W1.map((w) => w.map(r)), b1: b1.map(r), W2: W2.map(r), b2: r(b2)};
}

// Regresión logística = red sin capa oculta (línea base lineal).
export function entrenarLogistica(X, y, rasgos, {epocas = 400, aprendizaje = 0.3, l2 = 1e-3} = {}) {
  const e = escalado(X), Z = X.map((x) => escalar(x, e)), d = Z[0].length, [w0, w1] = pesosClase(y);
  const w = Array(d).fill(0); let b = 0;
  for (let ep = 0; ep < epocas; ep++) {
    const g = Array(d).fill(0); let gb = 0;
    for (let i = 0; i < Z.length; i++) {
      const err = (sigmoide(Z[i].reduce((t, zj, j) => t + zj * w[j], b)) - y[i]) * (y[i] ? w1 : w0);
      for (let j = 0; j < d; j++) g[j] += err * Z[i][j];
      gb += err;
    }
    for (let j = 0; j < d; j++) w[j] -= aprendizaje * (g[j] / Z.length + l2 * w[j]);
    b -= aprendizaje * (gb / Z.length);
  }
  return {tipo: "logistica", rasgos, escala: e, w, b};
}

// ---------- Predicción ----------

export function predecirModelo(modelo, rasgos) {
  const x = Array.isArray(rasgos) ? rasgos : vector(rasgos, modelo.rasgos);
  switch (modelo.tipo) {
    case "arbol": return bajarArbol(modelo.raiz, x);
    case "bosque": return modelo.arboles.reduce((s, a) => s + bajarArbol(a, x), 0) / modelo.arboles.length;
    case "logistica": { const z = escalar(x, modelo.escala); return sigmoide(z.reduce((t, zj, j) => t + zj * modelo.w[j], modelo.b)); }
    case "red": {
      const z = escalar(x, modelo.escala);
      const a = modelo.W1.map((w, k) => Math.tanh(w.reduce((t, wj, j) => t + wj * z[j], modelo.b1[k])));
      return sigmoide(a.reduce((t, ak, k) => t + ak * modelo.W2[k], modelo.b2));
    }
    default: throw new Error(`Modelo desconocido: ${modelo.tipo}`);
  }
}

export const ENTRENADORES = {arbol: entrenarArbol, bosque: entrenarBosque, logistica: entrenarLogistica, red: entrenarRed};

export function matrizDe(muestras, rasgos) {
  return {X: muestras.map((m) => vector(m.rasgos, rasgos)), y: muestras.map((m) => (m.etiqueta ? 1 : 0))};
}

// Exactitud, precisión, exhaustividad y F1 de "sí".
export function metricas(y, pred) {
  let vp = 0, fp = 0, fn = 0, vn = 0;
  y.forEach((v, i) => { if (pred[i] && v) vp++; else if (pred[i]) fp++; else if (v) fn++; else vn++; });
  const precision = vp + fp ? vp / (vp + fp) : 0, exhaustividad = vp + fn ? vp / (vp + fn) : 0;
  return {n: y.length, exactitud: (vp + vn) / (y.length || 1), precision, exhaustividad, f1: precision + exhaustividad ? (2 * precision * exhaustividad) / (precision + exhaustividad) : 0};
}

// Ramas del árbol en palabras ("si dBorde ≤ 0.12 y dEje ≤ 0.30 → 92 % sí").
export function textoArbolModelo(modelo, {max = 12} = {}) {
  const out = [];
  const bajar = (q, camino) => {
    if (out.length >= max) return;
    if (!q.izq) { out.push(`${camino.length ? `si ${camino.join(" y ")}` : "siempre"} → ${Math.round(q.p * 100)} % sí (${q.n} muestras)`); return; }
    const k = modelo.rasgos[q.f], t = Math.round(q.t * 100) / 100;
    bajar(q.izq, [...camino, `${k} ≤ ${t}`]);
    bajar(q.der, [...camino, `${k} > ${t}`]);
  };
  bajar(modelo.raiz, []);
  return out;
}
