// Aprendizaje con el cliente: el agente dibuja la cimentación, el ingeniero la corrige en el CAD
// (borra muros que sobran, dibuja los que faltan) y el agente aprende de esa corrección.
//   1. etiquetasDeCorrecciones: cada muro candidato queda "sí" o "no" según la lámina corregida
//      (los dibujados llevan su marca de pieza "muro-cim:i"; los agregados se reconocen llevando los
//      candidatos a la lámina con la transformación medida en los marcados).
//   2. entrenarModeloCliente: híbrido regla + modelo (la decisión de la regla es un rasgo más: el modelo
//      aprende dónde la regla falla con ESTE cliente), con la base del despacho y el cliente pesando ×4.
//   3. Se activa solo si, dejando fuera cada módulo corregido por el cliente, le gana a la regla.
// Medido con los proyectos del despacho (curva-cliente.mjs): con 5 módulos corregidos el híbrido
// pasa a la regla en los dos proyectos; con 1–2 a veces no: por eso la validación decide.
// Puro: sin DOM; el skill (agente/skills/aprendizajeDibujo.js) le pasa las entidades.
import {ENTRENADORES, predecirModelo, matrizDe} from "./modelos.js";
import {RASGOS_MURO} from "../planos/cimentacionPlano.js";

export const DECISION_MUROS = "muro-cimentacion";
export const RASGOS_HIBRIDO = [...RASGOS_MURO, "reglaSi"];
export const PESO_CLIENTE = 4;
export const MIN_MODULOS_CLIENTE = 3;
export const MARGEN_ACTIVACION = 0.02;

const conRegla = (m) => ({...m, rasgos: {...m.rasgos, reglaSi: m.regla ? 1 : 0}});

// Escala y traslado (x' = s·x + tx, y' = s·y + ty) por mínimos cuadrados de pares de puntos.
export function ajustarTransformacion(pares) {
  if (pares.length < 2) return null;
  const n = pares.length;
  const mx = pares.reduce((t, [p]) => t + p.x, 0) / n, my = pares.reduce((t, [p]) => t + p.y, 0) / n;
  const nx = pares.reduce((t, [, q]) => t + q.x, 0) / n, ny = pares.reduce((t, [, q]) => t + q.y, 0) / n;
  let num = 0, den = 0;
  for (const [p, q] of pares) { num += (p.x - mx) * (q.x - nx) + (p.y - my) * (q.y - ny); den += (p.x - mx) ** 2 + (p.y - my) ** 2; }
  if (den <= 1e-12) return null;
  const s = num / den;
  const error = Math.sqrt(pares.reduce((t, [p, q]) => t + (s * p.x + (nx - s * mx) - q.x) ** 2 + (s * p.y + (ny - s * my) - q.y) ** 2, 0) / n);
  return {s, tx: nx - s * mx, ty: ny - s * my, error};
}

const distSeg = (p, a, b) => {
  const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2)) : 0;
  return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
};

// candidatos: [{i, a, b, rasgos, regla, dibujado}] (planta, metros).
// agente: [{pieza: "muro-cim:i", a, b}] — muros marcados que siguen en la lámina (unidades del dibujo).
// usuario: [[p, q], …] — trazos que dibujó el ingeniero (no marcados), en unidades del dibujo.
export function etiquetasDeCorrecciones({candidatos, agente, usuario = [], toleranciaM = 0.10}) {
  const presentes = new Map();
  for (const e of agente) { const m = /^muro-cim:(\d+)$/.exec(e.pieza ?? ""); if (m) presentes.set(Number(m[1]), e); }
  const pares = [];
  for (const c of candidatos) {
    const e = presentes.get(c.i);
    if (e) pares.push([c.a, e.a], [c.b, e.b]);
  }
  const tr = ajustarTransformacion(pares);
  const enLamina = tr ? (p) => ({x: tr.s * p.x + tr.tx, y: tr.s * p.y + tr.ty}) : null;
  const tol = tr ? Math.abs(tr.s) * toleranciaM : 0;
  // Solo los trazos del ingeniero cerca de la planta (no la arquitectura ni otras láminas).
  let trazos = [];
  if (enLamina) {
    const pts = candidatos.flatMap((c) => [enLamina(c.a), enLamina(c.b)]);
    const margen = Math.abs(tr.s) * 1;
    const x0 = Math.min(...pts.map((p) => p.x)) - margen, x1 = Math.max(...pts.map((p) => p.x)) + margen;
    const y0 = Math.min(...pts.map((p) => p.y)) - margen, y1 = Math.max(...pts.map((p) => p.y)) + margen;
    const dentro = (p) => p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1;
    trazos = usuario.filter(([p, q]) => dentro(p) || dentro(q));
  }
  const cubierto = (a, b) => {
    const n = Math.max(2, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / (tol || 1)));
    let k = 0;
    for (let j = 0; j <= n; j++) {
      const p = {x: a.x + ((b.x - a.x) * j) / n, y: a.y + ((b.y - a.y) * j) / n};
      if (trazos.some(([u, v]) => distSeg(p, u, v) <= tol)) k++;
    }
    return k / (n + 1);
  };
  const resumen = {conservados: 0, borrados: 0, agregados: 0, sinCambio: 0};
  const muestras = candidatos.map((c) => {
    let etiqueta;
    if (c.dibujado) { etiqueta = presentes.has(c.i); resumen[etiqueta ? "conservados" : "borrados"]++; }
    else { etiqueta = Boolean(enLamina) && cubierto(enLamina(c.a), enLamina(c.b)) >= 0.5; resumen[etiqueta ? "agregados" : "sinCambio"]++; }
    return {rasgos: c.rasgos, regla: Boolean(c.regla), etiqueta, largo: Math.round(Math.hypot(c.b.x - c.a.x, c.b.y - c.a.y) * 100) / 100};
  });
  return {muestras, resumen, transformacion: tr};
}

function exactitudPonderada(lista, pred) {
  let bien = 0, total = 0;
  lista.forEach((m, i) => { const w = m.largo || 0.01; total += w; if (Boolean(pred[i]) === Boolean(m.etiqueta)) bien += w; });
  return total ? bien / total : 0;
}

function entrenarHibrido(lista) {
  const {X, y} = matrizDe(lista.map(conRegla), RASGOS_HIBRIDO);
  if (new Set(y).size < 2) return {tipo: "constante", valor: y[0] ?? 0, rasgos: RASGOS_HIBRIDO};
  return ENTRENADORES.logistica(X, y, RASGOS_HIBRIDO);
}
const predecirHibrido = (modelo, m) => (modelo.tipo === "constante" ? Boolean(modelo.valor) : predecirModelo(modelo, conRegla(m).rasgos) >= 0.5);

// base: muestras del despacho [{rasgos, regla, etiqueta, largo}]; cliente: [{modulo, …misma forma}].
export function entrenarModeloCliente({base = [], cliente = []}) {
  const modulos = [...new Set(cliente.map((m) => m.modulo))];
  const conPeso = (lista) => Array.from({length: PESO_CLIENTE}, () => lista).flat();
  let validacion = {modulos: modulos.length, modelo: null, regla: null};
  if (modulos.length >= MIN_MODULOS_CLIENTE) {
    const rm = [], rr = [];
    for (const mod of modulos) {
      const prueba = cliente.filter((m) => m.modulo === mod), resto = cliente.filter((m) => m.modulo !== mod);
      const modelo = entrenarHibrido([...base, ...conPeso(resto)]);
      rm.push(exactitudPonderada(prueba, prueba.map((m) => predecirHibrido(modelo, m))));
      rr.push(exactitudPonderada(prueba, prueba.map((m) => m.regla)));
    }
    const prom = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
    validacion = {modulos: modulos.length, modelo: Math.round(prom(rm) * 1000) / 1000, regla: Math.round(prom(rr) * 1000) / 1000};
  }
  const activo = validacion.modelo !== null && validacion.modelo >= validacion.regla + MARGEN_ACTIVACION;
  const modelo = cliente.length ? entrenarHibrido([...base, ...conPeso(cliente)]) : null;
  return {decision: DECISION_MUROS, modelo, activo, validacion, muestrasCliente: cliente.length, fecha: new Date().toISOString().slice(0, 10)};
}

// Función para cimentacionPlano (o.decidirMuro): el modelo del cliente si está activo; si no, la regla.
export function decidirMuroCliente(entrenado) {
  if (!entrenado?.activo || !entrenado.modelo) return undefined;
  return (rasgos, regla) => predecirHibrido(entrenado.modelo, {rasgos, regla});
}

// Explicación corta para el ingeniero.
export function textoModeloCliente(e) {
  const v = e?.validacion ?? {};
  if (!e?.muestrasCliente) return "Aún no hay correcciones tuyas guardadas.";
  if (v.modelo === null) return `Tengo correcciones de ${v.modulos} módulo(s); con ${MIN_MODULOS_CLIENTE} o más puedo medir si tu estilo mejora el dibujo. Mientras tanto sigo la regla del despacho.`;
  const pct = (x) => `${Math.round(x * 100)} %`;
  return e.activo
    ? `Aprendí tu criterio: probado dejando fuera cada uno de tus ${v.modulos} módulos, acierto ${pct(v.modelo)} de los muros de cimentación contra ${pct(v.regla)} de la regla. Desde ahora dibujo con tu criterio.`
    : `Con tus ${v.modulos} módulos corregidos todavía no supero a la regla (${pct(v.modelo)} contra ${pct(v.regla)}): sigo con la regla y sigo aprendiendo con cada corrección.`;
}
