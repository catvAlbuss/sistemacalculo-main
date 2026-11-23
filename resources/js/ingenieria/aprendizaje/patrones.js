// Aprendizaje de patrones del despacho: un árbol de decisión chico (hasta 3 preguntas) por cada
// decisión, sobre los rasgos que mira un ingeniero en la arquitectura. Se vuelve a aprender con
// todos los casos cada vez que entra un proyecto nuevo o una corrección aprobada, y se mide
// dejando cada caso fuera (cuánto acierta con planos que no vio). Así los umbrales ("zapatas
// si la planta pasa de 60 m²") salen de los datos y cambian cuando cambian los datos.

// Rasgos que puede preguntar el árbol (los calcula rasgosDeArquitectura).
export const RASGOS_PATRON = [
  {k: "niveles", nombre: "niveles", tipo: "num"},
  {k: "area", nombre: "área en planta (m²)", tipo: "num"},
  {k: "luzLosa", nombre: "luz de losa (m)", tipo: "num"},
  {k: "columnas", nombre: "columnas", tipo: "num"},
  {k: "placas", nombre: "tiene placas", tipo: "bool"},
  {k: "cubierta", nombre: "la arquitectura anota la cobertura (aluzinc, pendiente)", tipo: "bool"},
  {k: "falsoCielo", nombre: "tiene falso cielo", tipo: "bool"},
  {k: "deportivo", nombre: "es de uso deportivo", tipo: "bool"},
  {k: "agua", nombre: "tiene cisterna o tanque", tipo: "bool"},
  {k: "banos", nombre: "tiene baños o SS.HH.", tipo: "bool"},
];
const MAX_PROFUNDIDAD = 3;
const conValor = (casos, clave) => casos.filter((c) => c.decisiones?.[clave] !== null && c.decisiones?.[clave] !== undefined);
const clave2 = (v) => (typeof v === "object" ? JSON.stringify(v) : String(v));

function mayoria(casos, clave) {
  const votos = new Map();
  for (const c of casos) { const k = clave2(c.decisiones[clave]); votos.set(k, {valor: c.decisiones[clave], n: (votos.get(k)?.n ?? 0) + 1}); }
  return [...votos.values()].sort((a, b) => b.n - a.n)[0] ?? {valor: null, n: 0};
}
const umbralLindo = (a, b) => {
  const m = (a + b) / 2, paso = m >= 20 ? 5 : m >= 5 ? 0.5 : 0.05;
  const r = Math.round(m / paso) * paso;
  return r > a && r <= b ? Math.round(r * 100) / 100 : Math.round(m * 100) / 100;
};
const valorDe = (c, r) => (r.tipo === "bool" ? Boolean(c.rasgos?.[r.k]) : Number(c.rasgos?.[r.k] ?? 0));

// Mejores preguntas posibles: {rasgo, umbral} que separan los casos.
function preguntas(casos) {
  const out = [];
  for (const r of RASGOS_PATRON) {
    if (r.tipo === "bool") { out.push({r, umbral: null}); continue; }
    const vs = [...new Set(casos.map((c) => valorDe(c, r)))].sort((a, b) => a - b);
    for (let i = 0; i < vs.length - 1; i++) out.push({r, umbral: umbralLindo(vs[i], vs[i + 1])});
  }
  return out;
}
const responde = (c, p) => (p.r.tipo === "bool" ? valorDe(c, p.r) : valorDe(c, p.r) >= p.umbral);

function crecer(casos, clave, prof) {
  const m = mayoria(casos, clave);
  if (prof >= MAX_PROFUNDIDAD || m.n === casos.length || casos.length < 2) return {valor: m.valor, n: casos.length, aciertos: m.n};
  let mejor = null;
  for (const p of preguntas(casos)) {
    const si = casos.filter((c) => responde(c, p)), no = casos.filter((c) => !responde(c, p));
    if (!si.length || !no.length) continue;
    const aciertos = mayoria(si, clave).n + mayoria(no, clave).n;
    // A igual acierto: la pregunta booleana (más fácil de explicar) y luego el umbral más parejo.
    const puntaje = aciertos * 100 + (p.r.tipo === "bool" ? 1 : 0) - Math.abs(si.length - no.length) * 0.01;
    if (!mejor || puntaje > mejor.puntaje) mejor = {p, si, no, aciertos, puntaje};
  }
  if (!mejor || mejor.aciertos <= m.n) return {valor: m.valor, n: casos.length, aciertos: m.n};
  return {pregunta: {k: mejor.p.r.k, nombre: mejor.p.r.nombre, tipo: mejor.p.r.tipo, umbral: mejor.p.umbral},
    si: crecer(mejor.si, clave, prof + 1), no: crecer(mejor.no, clave, prof + 1), n: casos.length};
}

export function predecir(arbol, rasgos) {
  let nodo = arbol;
  while (nodo?.pregunta) {
    const r = RASGOS_PATRON.find((x) => x.k === nodo.pregunta.k);
    const v = r.tipo === "bool" ? Boolean(rasgos?.[r.k]) : Number(rasgos?.[r.k] ?? 0) >= nodo.pregunta.umbral;
    nodo = v ? nodo.si : nodo.no;
  }
  return nodo?.valor ?? null;
}

const fmt = (v) => (typeof v === "boolean" ? (v ? "sí" : "no") : String(v));
export function textoArbol(nodo) {
  if (!nodo?.pregunta) return fmt(nodo?.valor);
  const q = nodo.pregunta;
  const cond = q.tipo === "bool" ? q.nombre : `${q.nombre} ≥ ${q.umbral}`;
  return `si ${cond} → ${textoArbol(nodo.si)}; si no → ${textoArbol(nodo.no)}`;
}

// Patrón aprendido para una decisión: el árbol, cuántos casos lo respaldan y cuánto acierta con
// los casos que no vio (dejando uno fuera cada vez). null si hay pocos casos.
export function aprenderPatron(casos, clave, {minimo = 8} = {}) {
  const datos = conValor(casos, clave);
  if (datos.length < minimo) return null;
  const arbol = crecer(datos, clave, 0);
  let aciertos = 0;
  for (let i = 0; i < datos.length; i++) {
    const resto = datos.filter((_, j) => j !== i);
    if (clave2(predecir(crecer(resto, clave, 0), datos[i].rasgos)) === clave2(datos[i].decisiones[clave])) aciertos++;
  }
  // Línea base: decir siempre lo más común (sin mirar el plano), también dejando cada caso fuera.
  let base = 0;
  for (let i = 0; i < datos.length; i++) if (clave2(mayoria(datos.filter((_, j) => j !== i), clave).valor) === clave2(datos[i].decisiones[clave])) base++;
  const proyectos = new Set(datos.map((c) => String(c.grupo ?? c.nombre ?? "").toLowerCase())).size;
  return {clave, arbol, casos: datos.length, proyectos, aciertoNoVisto: Math.round((aciertos / datos.length) * 100) / 100,
    lineaBase: Math.round((base / datos.length) * 100) / 100, texto: textoArbol(arbol)};
}

// Un patrón vale si acierta con planos que no vio (≥ 75 %) y claramente más que la línea base.
export const patronUtil = (pat) => Boolean(pat) && pat.aciertoNoVisto >= 0.75 && pat.aciertoNoVisto >= pat.lineaBase + 0.05;
