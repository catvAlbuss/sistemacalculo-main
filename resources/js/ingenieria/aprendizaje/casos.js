// Aprendizaje por casos: el agente decide la estructura de un plano nuevo mirando qué hizo
// el ingeniero en los proyectos que ya estudió.
//
// Cada caso es un par de planos del mismo proyecto (arquitectura + estructuras), alineados por
// sus ejes con nombre:
//   - rasgos: lo que se lee en la arquitectura (niveles, ejes, luces, área, columnas, techo);
//   - decisiones: lo que el ingeniero resolvió en estructuras (cimentación, Hz, Df, losa y su
//     espesor, techo, vigas, concreto, estribos, láminas) y cómo quedaron las columnas de cada
//     cruce de ejes respecto de la arquitectura.
// Para un plano nuevo se buscan los casos de rasgos más parecidos y cada decisión se propone
// con su confianza: lo que los casos parecidos resuelven igual (y cumple las reglas de la
// norma) lo decide el agente; lo dudoso o lo que depende del estudio de suelos queda para el
// ingeniero. No guarda datos personales: solo geometría y criterios.

import {textoPlano} from "../lectura/lectorPlano.js";

// ---------- Rasgos de la arquitectura ----------

const ORDINAL = [[/\b(1|PRIMER|1ER|1ERO|1°)\b/, 1], [/\b(2|SEGUNDO|2DO|2°)\b/, 2], [/\b(3|TERCER|3ER|3RO|3°)\b/, 3], [/\b(4|CUARTO|4TO|4°)\b/, 4]];

// Nivel de una planta por su título ("PLANTA DE DISTRIBUCIÓN 2DO NIVEL" → 2), o null.
export function nivelDeTitulo(titulo) {
  const t = textoPlano(String(titulo ?? "")).toUpperCase();
  if (!/NIVEL|PISO|PLANTA/.test(t)) return null;
  if (/TECHO|AZOTEA|CUBIERTA/.test(t)) return null;
  for (const [re, n] of ORDINAL) if (re.test(t.replace(/NIVEL|PISO/g, " "))) return n;
  return /NIVEL|PISO/.test(t) ? null : null;
}

const r2 = (v) => Math.round(v * 100) / 100;

// Posiciones de los ejes (en metros) separadas por dirección. Un eje inclinado (muro en
// diagonal, eje Z´ del módulo 14) cuenta por su punto medio en su dirección dominante.
export function posicionesDeEjes(ejes) {
  const x = [], y = [];
  for (const e of ejes ?? []) {
    const dx = Math.abs(e.q.x - e.p.x), dy = Math.abs(e.q.y - e.p.y);
    if (dy >= dx) x.push((e.p.x + e.q.x) / 2); // eje vertical: fija una x
    else y.push((e.p.y + e.q.y) / 2);
  }
  const unicos = (l) => l.sort((a, b) => a - b).filter((v, i, a) => i === 0 || v - a[i - 1] > 0.05);
  return {x: unicos(x), y: unicos(y)};
}

const luces = (pos) => pos.slice(1).map((v, i) => v - pos[i]).filter((d) => d > 0.5);

// lecturas: [{titulo, lectura}] de las vistas de la arquitectura (leerVista); textos: los del plano.
export function rasgosDeArquitectura(lecturas, textos = []) {
  const plantas = lecturas.filter((l) => l.lectura?.ejes?.length >= 2);
  const principal = [...plantas].sort((a, b) => (b.lectura.columnas.length - a.lectura.columnas.length))[0];
  const niveles = new Set(plantas.map((l) => nivelDeTitulo(l.titulo)).filter(Boolean));
  const pos = posicionesDeEjes(principal?.lectura.ejes);
  const lx = luces(pos.x), ly = luces(pos.y);
  const largo = pos.x.length > 1 ? pos.x.at(-1) - pos.x[0] : 0;
  const ancho = pos.y.length > 1 ? pos.y.at(-1) - pos.y[0] : 0;
  const maxX = lx.length ? Math.max(...lx) : 0, maxY = ly.length ? Math.max(...ly) : 0;
  const todo = textos.map((t) => textoPlano(t).toUpperCase()).join(" | ");
  const columnas = principal?.lectura.columnas ?? [];
  const tipos = (principal?.lectura.tipos ?? []).map((t) => ({nombre: t.nombre ?? t.tipo ?? "", forma: t.forma ?? "", b: r2(t.b), h: r2(t.h), n: t.cantidad ?? t.n ?? 0}));
  return {
    vista: principal?.titulo ?? "",
    niveles: Math.max(1, niveles.size, ...[...niveles]),
    ejes: {x: pos.x.length, y: pos.y.length},
    luces: {x: lx.map(r2), y: ly.map(r2)},
    largo: r2(Math.max(largo, ancho)), ancho: r2(Math.min(largo, ancho)),
    area: r2(largo * ancho),
    // Luz que gobierna la losa: el paño más grande, por su lado corto.
    luzLosa: r2(maxX && maxY ? Math.min(maxX, maxY) : Math.max(maxX, maxY)),
    luzMax: r2(Math.max(maxX, maxY)),
    columnas: columnas.length,
    tipos,
    placas: tipos.some((t) => /^PL/i.test(t.nombre) || Math.max(t.b, t.h) >= 0.9),
    columnetas: principal?.lectura.columnetas ?? 0,
    techoLiviano: /TR-?4|ALUZINC|CALAMINA|TEJA ANDINA|COBERTURA|PTE\s*=\s*\d/.test(todo),
  };
}

// ---------- Decisiones del ingeniero (plano de estructuras) ----------

const num = (s) => Number(String(s).replace(",", "."));
function frecuentes(textos, re, normaliza) {
  const m = new Map();
  for (const t of textos) for (const x of t.matchAll(re)) { const k = normaliza(x); if (k !== null && k !== undefined && k !== "") m.set(k, (m.get(k) ?? 0) + 1); }
  return [...m].sort((a, b) => b[1] - a[1]);
}
const primero = (l) => (l.length ? l[0][0] : null);

// textos: todos los textos del plano de estructuras (en cualquier orden).
export function decisionesDeEstructura(textos) {
  const ts = [...new Set(textos.map((t) => textoPlano(t).toUpperCase().replace(/\s+/g, " ").trim()).filter(Boolean))];
  const todo = ts.join(" | ");
  const titulos = ts.filter((t) => /PLANO DE /.test(t) && t.length < 90);
  const espesorLosa = primero(frecuentes(ts, /(?:LOSA\s+)?ALIGERAD[OA]\s*(?:DE\s*)?(?:E|H|ESP\.?)\s*=\s*(0?\.\d+|\d{2})\s*(M|CM)?/g,
    (x) => { const v = num(x[1]); return r2(v >= 1 ? v / 100 : v); }));
  // Solo una losa maciza dibujada (con su espesor o su detalle), no la de las notas generales
  // ("…y losas macizas será de 2 cm", "fondo de vigas y losa maciza… 20 días").
  const maciza = /LOSA\s+MACIZA\s*(?:E|H|ESP\.?)\s*=|DETALLE[^|]*LOSA\s+MACIZA/.test(todo);
  const vigas = frecuentes(ts, /VIGA\S*\s*\(?\s*(\d{2})\s*X\s*(\d{2})\s*(?:CM)?\)?/g, (x) => `${x[1]}x${x[2]}`).map(([v]) => v);
  const fc = (re) => primero(frecuentes(ts, re, (x) => Number(x[1])));
  const nivelesLosa = new Set(titulos.map((t) => t.match(/LOSA\s+(\d)\s*°?\s*NIVEL/)?.[1]).filter(Boolean));
  return {
    cimentacion: /PLATEA/.test(todo) ? "platea" : /ZAPATA\s*(AISLADA|Z-?\d|\d)|DETALLE DE ZAPATA|CUADRO DE ZAPATA/.test(todo) ? "zapatas" : "cimiento corrido",
    cimientoCorrido: /CIMIENTO CORRIDO|CIMENTO CORRIDO/.test(todo),
    hz: primero(frecuentes(ts, /HZ\s*=\s*(0?\.\d+)/g, (x) => r2(num(x[1])))),
    df: primero(frecuentes(ts, /DF\s*=\s*-?\s*(\d?\.\d+)/g, (x) => r2(num(x[1])))),
    losa: espesorLosa ? (maciza ? "aligerada y maciza" : "aligerada") : maciza ? "maciza" : null,
    espesorLosa,
    // Plantas de losa dibujadas ("PLANO DE LOSA 1° NIVEL", "PLANO DE ALIGERADO"): comparadas con
    // los niveles de la arquitectura dicen si el último nivel lleva losa o solo cobertura.
    plantasDeLosa: Math.max(nivelesLosa.size, titulos.some((t) => /ALIGERADO|LOSA/.test(t)) ? 1 : 0),
    vigas: vigas.slice(0, 3),
    fcColumnas: fc(/F'?C\s*=\s*(\d{3})[^|]{0,30}COLUMNA(?!S? ?DE CONFINA|TA)/g) ?? fc(/F'?C\s*=\s*(\d{3})\s*KG\/CM[2²]?,?\s*EN EL RESTO/g),
    fcColumnetas: fc(/F'?C\s*=\s*(\d{3})[^|]{0,30}COLUMNETA/g),
    estribos: primero(frecuentes(ts, /(\d\/\d)"?\s*[Ø∅]?\s*:?\s*1\s*@\s*0?\.05\s*,\s*(\d{1,2})\s*@\s*0?\.?10/g, (x) => `${x[1]}": 1@.05, ${x[2]}@.10`)),
    porticos: titulos.filter((t) => /PORTICO EJE/.test(t)).length,
  };
}

// ---------- Columnas: arquitectura frente a estructuras, por cruce de ejes ----------

const nombreEje = (s) => String(s ?? "").toUpperCase().replace(/\s+/g, "").replace(/[´`’']/g, "´");
const cruce = (c) => String(c.eje ?? "").split("/").map(nombreEje).sort().join("/");

// Coordenada de cada eje por nombre: {x: {nombre: valor}, y: {...}} (por su punto medio).
function coordenadasDeEjes(ejes) {
  const c = {x: {}, y: {}};
  for (const e of ejes ?? []) {
    const vertical = Math.abs(e.q.y - e.p.y) >= Math.abs(e.q.x - e.p.x);
    c[vertical ? "x" : "y"][nombreEje(e.nombre)] = vertical ? (e.p.x + e.q.x) / 2 : (e.p.y + e.q.y) / 2;
  }
  return c;
}

// Escala de la estructura respecto de la arquitectura, por la distancia entre los mismos ejes
// (las láminas de estructuras suelen ir a otra escala: módulo 14 a ×2). 1 si no se puede medir.
export function escalaEntrePlanos(ejesArq, ejesEst) {
  const a = coordenadasDeEjes(ejesArq), e = coordenadasDeEjes(ejesEst), razones = [];
  for (const dir of ["x", "y"]) {
    const comunes = Object.keys(a[dir]).filter((n) => n in e[dir]);
    for (let i = 0; i < comunes.length; i++) for (let j = i + 1; j < comunes.length; j++) {
      const da = a[dir][comunes[i]] - a[dir][comunes[j]], de = e[dir][comunes[i]] - e[dir][comunes[j]];
      if (Math.abs(da) > 0.3) razones.push(Math.abs(de / da));
    }
  }
  if (!razones.length) return 1;
  razones.sort((p, q) => p - q);
  return razones[Math.floor(razones.length / 2)];
}

export function compararColumnas(arq, est) {
  const escala = escalaEntrePlanos(arq?.ejes, est?.ejes);
  const deEst = new Map((est?.columnas ?? []).filter((c) => c.eje).map((c) => [cruce(c), {...c, b: c.b / escala, h: c.h / escala}]));
  const filas = [];
  for (const a of arq?.columnas ?? []) {
    if (!a.eje) continue;
    const e = deEst.get(cruce(a));
    if (!e) { filas.push({cruce: cruce(a), arq: `${a.tipo ?? ""} ${r2(a.b)}x${r2(a.h)}`.trim(), est: null, igual: false}); continue; }
    const igual = Math.abs(a.b - e.b) <= 0.05 && Math.abs(a.h - e.h) <= 0.05
      || Math.abs(a.b - e.h) <= 0.05 && Math.abs(a.h - e.b) <= 0.05;
    filas.push({cruce: cruce(a), arq: `${a.tipo ?? ""} ${r2(a.b)}x${r2(a.h)}`.trim(), est: `${e.tipo ?? ""} ${r2(e.b)}x${r2(e.h)}`.trim(), igual});
  }
  const comparables = filas.filter((f) => f.est);
  return {escala: r2(escala), filas, coincidencia: comparables.length ? r2(comparables.filter((f) => f.igual).length / comparables.length) : null};
}

// ---------- Propuesta para un plano nuevo ----------

export function distancia(a, b) {
  const area = Math.abs(Math.log((a.area || 1) / (b.area || 1)));
  return 2 * Math.abs(a.niveles - b.niveles)
    + Math.abs(a.luzLosa - b.luzLosa) / 2
    + area
    + Math.abs(a.columnas - b.columnas) / 8
    + (a.techoLiviano !== b.techoLiviano ? 1 : 0)
    + (a.placas !== b.placas ? 0.5 : 0);
}

// Decisiones que el agente propone y cómo se comparan (tolerancia en las numéricas).
export const DECISIONES = {
  cimentacion: {nombre: "Cimentación"},
  cimientoCorrido: {nombre: "Cimiento corrido bajo muros"},
  hz: {nombre: "Peralte de zapata Hz (m)", tolerancia: 0.051, suelo: true},
  df: {nombre: "Profundidad de desplante Df (m)", tolerancia: 0.051, suelo: true},
  losa: {nombre: "Tipo de losa"},
  espesorLosa: {nombre: "Espesor de losa (m)", tolerancia: 0.011},
  losaDeTecho: {nombre: "Losa en el último nivel (bajo la cobertura)"},
  fcColumnas: {nombre: "f'c columnas y vigas (kg/cm²)"},
  fcColumnetas: {nombre: "f'c columnetas (kg/cm²)"},
  estribos: {nombre: "Estribos de columnas"},
  columnasComoArquitectura: {nombre: "Columnas con las secciones de la arquitectura"},
};

const ESPESORES = [0.17, 0.2, 0.25, 0.3];
export const MIN_CASOS_COSTUMBRE = 3;

// Reglas candidatas: criterio de ingeniería escrito como función de los rasgos. Solo se usan si
// explican TODOS los casos conocidos (y al menos dos): así el agente generaliza a tamaños y
// formas que no vio, y una regla que un caso nuevo contradice deja de usarse sola.
export const REGLAS = [
  {clave: "espesorLosa", texto: "aligerado de 0.20 m como mínimo y h ≥ L/25 (E.060), al espesor comercial siguiente",
    valor: (r) => (r.luzLosa > 0 ? ESPESORES.filter((x) => x >= 0.2).find((x) => x >= r.luzLosa / 25 - 1e-9) ?? 0.3 : null)},
  {clave: "losaDeTecho", texto: "un solo nivel lleva losa en el techo (bajo la cobertura); con más niveles, el último solo cobertura",
    valor: (r) => r.niveles <= 1},
  {clave: "cimientoCorrido", texto: "cimiento corrido bajo los muros cuando hay columnetas (albañilería confinada)",
    valor: (r) => r.columnetas > 0},
];

export function reglasValidas(casos) {
  return REGLAS.map((regla) => {
    const tol = DECISIONES[regla.clave]?.tolerancia;
    const conDato = casos.filter((c) => c.decisiones?.[regla.clave] !== null && c.decisiones?.[regla.clave] !== undefined);
    const fallan = conDato.filter((c) => {
      const v = regla.valor(c.rasgos), real = c.decisiones[regla.clave];
      return v === null || (tol ? Math.abs(v - real) > tol : v !== real);
    }).map((c) => c.nombre);
    return {...regla, casos: conDato.length, fallan, valida: conDato.length >= 2 && !fallan.length};
  });
}

// rasgos: los del plano nuevo; casos: [{nombre, rasgos, decisiones}]. Devuelve cada decisión con
// su valor, de qué casos sale, la confianza (0–1) y si queda para el ingeniero (y por qué).
export function proponer(rasgos, casos, {k = 3, umbral = 0.6} = {}) {
  const vecinos = casos.map((c) => ({c, d: distancia(rasgos, c.rasgos)})).sort((a, b) => a.d - b.d).slice(0, k);
  const cercania = vecinos.length ? Math.exp(-vecinos[0].d / 3) : 0;
  const decisiones = {};
  for (const [clave, def] of Object.entries(DECISIONES)) {
    const votos = new Map();
    let total = 0;
    for (const {c, d} of vecinos) {
      const v = c.decisiones?.[clave];
      if (v === null || v === undefined) continue;
      const peso = 1 / (0.25 + d);
      total += peso;
      // Valores numéricos parecidos votan juntos.
      const igual = [...votos.keys()].find((x) => (def.tolerancia ? Math.abs(x - v) <= def.tolerancia : x === v));
      votos.set(igual ?? v, (votos.get(igual ?? v) ?? 0) + peso);
    }
    if (!total) { decisiones[clave] = {nombre: def.nombre, valor: null, confianza: 0, ingeniero: "Ningún caso parecido lo resuelve."}; continue; }
    const [valor, peso] = [...votos].sort((a, b) => b[1] - a[1])[0];
    const fuentes = vecinos.filter(({c}) => {
      const v = c.decisiones?.[clave];
      return v !== null && v !== undefined && (def.tolerancia ? Math.abs(v - valor) <= def.tolerancia : v === valor);
    }).map(({c}) => c.nombre);
    // Pesa más el acuerdo entre casos que la distancia: si varios casos distintos resuelven igual
    // (platea, f'c 210), es costumbre del despacho aunque el plano nuevo no se parezca tanto.
    const confianza = r2((peso / total) * (0.6 + 0.4 * cercania) * (fuentes.length >= 2 ? 1 : 0.8));
    decisiones[clave] = {nombre: def.nombre, valor, fuentes, confianza};
  }
  // Lo que cambia de un proyecto a otro (y ninguna regla explica) no es costumbre del despacho:
  // depende del proyecto, y lo decide el ingeniero (estribos, losa maciza, cambiar columnas).
  for (const [clave, def] of Object.entries(DECISIONES)) {
    const valores = [];
    for (const c of casos) {
      const v = c.decisiones?.[clave];
      if (v === null || v === undefined) continue;
      if (!valores.some((x) => (def.tolerancia ? Math.abs(x - v) <= def.tolerancia : x === v))) valores.push(v);
    }
    if (valores.length > 1 && decisiones[clave] && !decisiones[clave].ingeniero) {
      decisiones[clave].ingeniero = `Cambia entre proyectos (${valores.map((v) => (typeof v === "boolean" ? (v ? "sí" : "no") : v)).join(" / ")}) y aún no hay una regla que lo explique.`;
    }
  }
  // Reglas que explican todos los casos: generalizan mejor que copiar al vecino.
  for (const regla of reglasValidas(casos)) {
    if (!regla.valida) continue;
    const valor = regla.valor(rasgos);
    if (valor === null || valor === undefined) continue;
    decisiones[regla.clave] = {nombre: DECISIONES[regla.clave].nombre, valor, fuentes: [], confianza: r2(Math.min(0.95, 0.7 + 0.05 * regla.casos)),
      regla: `${regla.texto}; cumple en ${regla.casos} caso(s)`};
  }
  // Reglas de la norma por encima de la costumbre (E.060: aligerado h ≥ L/25).
  const L = rasgos.luzLosa;
  const e = decisiones.espesorLosa;
  if (L > 0 && /aligerada/.test(String(decisiones.losa?.valor ?? "aligerada"))) {
    const minimo = ESPESORES.find((x) => x >= L / 25 - 1e-9) ?? ESPESORES.at(-1);
    if (!e.valor || e.valor < minimo) {
      decisiones.espesorLosa = {nombre: e.nombre, valor: minimo, fuentes: [], confianza: 0.95,
        regla: `E.060: aligerado h ≥ L/25 = ${r2(L / 25)} m con luz ${L} m${e.valor ? ` (los casos usaban ${e.valor})` : ""}`};
    }
  }
  // Más de un nivel: cada nivel lleva su losa (entrepiso), aunque los casos no lo digan.
  decisiones.losasDeEntrepiso = {nombre: "Losas de entrepiso", valor: Math.max(0, rasgos.niveles - 1), fuentes: [], confianza: 0.95, regla: `${rasgos.niveles} nivel(es) leídos en la arquitectura`};
  for (const d of Object.values(decisiones)) {
    if (d.ingeniero || d.regla) continue;
    // Una costumbre del despacho necesita al menos 3 proyectos que la repitan: con dos que
    // coinciden por casualidad (estribos, losa maciza) el agente se equivocaba decidiendo solo.
    if ((d.fuentes?.length ?? 0) < MIN_CASOS_COSTUMBRE) { d.ingeniero = `Solo ${d.fuentes?.length ?? 0} proyecto(s) parecido(s) lo respaldan; hacen falta ${MIN_CASOS_COSTUMBRE} para decidirlo solo.`; continue; }
    if (d.confianza < umbral) d.ingeniero = `Confianza baja (${Math.round(d.confianza * 100)} %): los casos parecidos no coinciden o no se parecen lo suficiente.`;
  }
  for (const clave of ["hz", "df"]) {
    if (decisiones[clave]) decisiones[clave].ingeniero = "Depende del estudio de mecánica de suelos (qadm): confirmar con el EMS o darlo en Datos del proyecto.";
  }
  const lista = Object.entries(decisiones);
  return {
    vecinos: vecinos.map(({c, d}) => ({nombre: c.nombre, distancia: r2(d)})),
    decisiones,
    decide: lista.filter(([, d]) => !d.ingeniero).map(([k]) => k),
    ingeniero: lista.filter(([, d]) => d.ingeniero).map(([k]) => k),
  };
}

// Dejando un caso fuera, ¿cuántas de sus decisiones acierta el agente con los demás?
export function evaluar(casos, opciones) {
  const filas = casos.map((caso) => {
    const otros = casos.filter((c) => c !== caso);
    const p = proponer(caso.rasgos, otros, opciones);
    const claves = Object.keys(DECISIONES).filter((k) => caso.decisiones[k] !== null && caso.decisiones[k] !== undefined);
    const acierto = claves.filter((k) => {
      const v = p.decisiones[k]?.valor, real = caso.decisiones[k], tol = DECISIONES[k].tolerancia;
      return v !== null && v !== undefined && (tol ? Math.abs(v - real) <= tol : v === real);
    });
    // Lo que el agente decidió solo (sin pasarlo al ingeniero): ahí tiene que acertar.
    const solo = claves.filter((k) => !p.decisiones[k]?.ingeniero);
    return {caso: caso.nombre, aciertos: acierto.length, total: claves.length,
      solo: solo.length, soloAciertos: solo.filter((k) => acierto.includes(k)).length,
      fallos: claves.filter((k) => !acierto.includes(k)).map((k) => `${k}: propuso ${p.decisiones[k]?.valor ?? "—"}, era ${caso.decisiones[k]}${p.decisiones[k]?.ingeniero ? " (lo pasó al ingeniero)" : " (DECIDIÓ SOLO)"}`)};
  });
  const suma = (k) => filas.reduce((s, f) => s + f[k], 0);
  const t = suma("total"), solo = suma("solo");
  return {filas, acierto: t ? r2(suma("aciertos") / t) : 0, aciertoAgente: solo ? r2(suma("soloAciertos") / solo) : 0, parteAgente: t ? r2(solo / t) : 0};
}

// Respuesta corta para el ingeniero: qué decide el agente y qué le deja.
export function textoPropuesta(rasgos, p) {
  const fmt = (d) => (typeof d.valor === "boolean" ? (d.valor ? "sí" : "no")
    : typeof d.valor === "number" && !Number.isInteger(d.valor) && d.valor < 10 ? d.valor.toFixed(2) : String(d.valor ?? "—"));
  const linea = ([, d]) => `- ${d.nombre}: ${fmt(d)}${d.regla ? ` (${d.regla})` : d.fuentes?.length ? ` (como ${d.fuentes.join(", ")})` : ""}`;
  const entradas = Object.entries(p.decisiones);
  return [
    `Leí ${rasgos.niveles} nivel(es), ${rasgos.ejes.x}×${rasgos.ejes.y} ejes, ${rasgos.largo}×${rasgos.ancho} m, luz de losa ${rasgos.luzLosa} m, ${rasgos.columnas} columnas${rasgos.techoLiviano ? ", techo liviano" : ""}. Casos más parecidos: ${p.vecinos.map((v) => v.nombre).join(", ") || "ninguno"}.`,
    "Decido:",
    ...entradas.filter(([, d]) => !d.ingeniero).map(linea),
    "Para el ingeniero:",
    ...entradas.filter(([, d]) => d.ingeniero).map(([k, d]) => `${linea([k, d])} — ${d.ingeniero}`),
  ].join("\n");
}
