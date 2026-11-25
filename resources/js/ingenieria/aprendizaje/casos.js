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
import {espesorPorLuz} from "../criterios/criteriosEstructurales.js";
import {aprenderPatron, patronUtil} from "./patrones.js";

// ---------- Rasgos de la arquitectura ----------

const ORDINAL = [[/\b(1|PRIMER|1ER|1ERO|1°)\b/, 1], [/\b(2|SEGUNDO|2DO|2°)\b/, 2], [/\b(3|TERCER|3ER|3RO|3°)\b/, 3], [/\b(4|CUARTO|4TO|4°)\b/, 4]];

// Ordinales escritos ("NOVENO NIVEL") y con marca ("9° NIVEL", "2DO PISO", "3ER NIVEL").
const PALABRAS = {PRIMER: 1, PRIMERO: 1, SEGUNDO: 2, TERCER: 3, TERCERO: 3, CUARTO: 4, QUINTO: 5, SEXTO: 6, SEPTIMO: 7, OCTAVO: 8, NOVENO: 9, DECIMO: 10};
const ORDINAL_MARCADO = /\b(\d{1,2})\s*(?:°|º|ER|ERO|DO|RO|TO|VO|NO|MO)(?![A-Z])|\b(PRIMERO?|SEGUNDO|TERCERO?|CUARTO|QUINTO|SEXTO|S[EÉ]PTIMO|OCTAVO|NOVENO|D[EÉ]CIMO)\b/g;
const sinTilde = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Niveles que cubre una planta por su título: "2° A 8° NIVEL" → {desde: 2, hasta: 8}; "1° Y 2°
// PISO" → {1, 2}; "9° NIVEL" → {9, 9}. Un número suelto ("MÓDULO 8") no es un piso. Null si no hay.
export function rangoDeNivelesDeTitulo(titulo) {
  const t = textoPlano(String(titulo ?? "")).toUpperCase();
  if (!/NIVEL|PISO|PLANTA/.test(t) || /TECHO|AZOTEA|CUBIERTA/.test(t)) return null;
  const nums = [...t.matchAll(ORDINAL_MARCADO)].map((m) => (m[1] ? Number(m[1]) : PALABRAS[sinTilde(m[2])])).filter((n) => n >= 1 && n <= 30);
  // "NIVEL 2" / "PISO 3": número junto a la palabra.
  const junto = /(?:NIVEL|PISO)\s*(\d{1,2})\b/.exec(t);
  if (junto) nums.push(Number(junto[1]));
  if (!nums.length) return null;
  return {desde: Math.min(...nums), hasta: Math.max(...nums)};
}

// Nivel de una planta por su título ("PLANTA DE DISTRIBUCIÓN 2DO NIVEL" → 2), o null. Con un
// rango ("2° A 8° NIVEL") devuelve el primero; rangoDeNivelesDeTitulo da todos.
export function nivelDeTitulo(titulo) {
  const r = rangoDeNivelesDeTitulo(titulo);
  if (r) return r.desde;
  const t = textoPlano(String(titulo ?? "")).toUpperCase();
  if (!/NIVEL|PISO|PLANTA/.test(t)) return null;
  if (/TECHO|AZOTEA|CUBIERTA/.test(t)) return null;
  for (const [re, n] of ORDINAL) if (re.test(t.replace(/NIVEL|PISO/g, " "))) return n;
  return null;
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
  // Con la planta típica "2° A 8° NIVEL" el edificio llega al 8° (no al 2°).
  const niveles = new Set(plantas.map((l) => rangoDeNivelesDeTitulo(l.titulo)?.hasta ?? nivelDeTitulo(l.titulo)).filter(Boolean));
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
    areaAbierta: /(?:AREA|ÁREA)\s+(?:ABIERTA|LIBRE)|SIN\s+CLASIFICAR|NO\s+CLASIFICAD[OA]/i.test(`${principal?.titulo ?? ""} ${todo}`),
    niveles: Math.max(1, ...[...niveles]),
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
    // Indicios de uso y de techo que mira el ingeniero (para aprender patrones; patrones.js).
    cubierta: /ALUZINC|TR-?4|CALAMINA|POLICARBONATO|TEJA ANDINA|PTE\.?\s*=|PENDIENTE/.test(todo),
    falsoCielo: /FALSO CIELO|CIELO RASO|CIELORRASO/.test(todo),
    deportivo: /DEPORTIV|COLISEO|TRIBUNA|LOSA MULTIUSO/.test(todo),
    agua: /CISTERNA|TANQUE ELEVADO|RESERVORIO|CUARTO DE BOMBAS/.test(todo),
    banos: /SS\.?\s*HH|S\.S\.H\.H|SERVICIOS HIGI|\bBA[ÑN]OS?\b|DUCHA|VESTIDOR/.test(todo),
  };
}

// Descriptor geométrico mínimo para el aprendizaje local: metros, origen local por vista
// y únicamente elementos reconocidos por leerVista. Los títulos/textos del DWG no se guardan.
export function geometriaDeLecturas(lecturas = []) {
  const vistas = lecturas.map(({titulo, lectura}, indice) => {
    const ejesLeidos = (lectura?.ejes ?? []).filter((e) => e?.p && e?.q && [e.p.x, e.p.y, e.q.x, e.q.y].every(Number.isFinite));
    const columnasLeidas = (lectura?.columnas ?? []).filter((c) => Number.isFinite(c.x) && Number.isFinite(c.y));
    const columnetasLeidas = (lectura?.listaColumnetas ?? []).filter((c) => Number.isFinite(c.x) && Number.isFinite(c.y));
    const xs = [...ejesLeidos.flatMap((e) => [e.p.x, e.q.x]), ...columnasLeidas.map((c) => c.x), ...columnetasLeidas.map((c) => c.x)];
    const ys = [...ejesLeidos.flatMap((e) => [e.p.y, e.q.y]), ...columnasLeidas.map((c) => c.y), ...columnetasLeidas.map((c) => c.y)];
    const origen = {x: xs.length ? Math.min(...xs) : 0, y: ys.length ? Math.min(...ys) : 0};
    const puntoLocal = (p) => ({x: r2(p.x - origen.x), y: r2(p.y - origen.y)});
    const columnas = [
      ...columnasLeidas.map((c) => ({
        eje: typeof c.eje === 'string' ? c.eje : null,
        centro: puntoLocal(c.nodo && Number.isFinite(c.nodo.x) && Number.isFinite(c.nodo.y) ? c.nodo : c),
        b: r2(c.b), h: r2(c.h), forma: String(c.forma ?? 'desconocida').slice(0, 24),
      })),
      ...columnetasLeidas.map((c) => ({
        eje: null, centro: puntoLocal(c), b: r2(c.b), h: r2(c.h), forma: 'columneta',
      })),
    ];
    return {
      id: `vista-${String(indice + 1).padStart(2, '0')}`,
      nivel: nivelDeTitulo(titulo),
      categorias: {
        ejes: ejesLeidos.map((e) => ({nombre: String(e.nombre ?? '').slice(0, 8), p: puntoLocal(e.p), q: puntoLocal(e.q)})),
        columnas,
        // El lector actual no verifica muros, vanos ni losas: null evita puntuarlos como aciertos.
        murosVanos: null,
        losas: null,
      },
    };
  });
  return {version: 1, unidad: 'm', vistas};
}

// Integra aprendizaje por pares sin reemplazar la geometría del plano abierto.
// Solo usa un caso con geometría verificada como contexto acotado; la salida
// siempre conserva los niveles, ejes y elementos reconocidos en la arquitectura actual.
export function integrarGeometriaAprendida({rasgos = {}, propuesta = {}, casos = [], lecturaActual = null}) {
  const geometriaActual = lecturaActual && Array.isArray(lecturaActual.vistas)
    ? lecturaActual
    : {version: 1, unidad: 'm', vistas: []};
  const vistas = geometriaActual.vistas;
  const niveles = [...new Set(vistas.map((v) => v.nivel).filter(Number.isFinite))];
  const nNiveles = niveles.length
    ? Math.max(1, ...niveles)
    : Math.max(1, Number(rasgos.niveles) || 1);
  const vecino = propuesta.vecinos?.[0] ?? null;
  const distancia = Number.isFinite(vecino?.distancia) ? Math.max(0, vecino.distancia) : 4;
  const confianzaGeometria = r2(1 / (1 + distancia / 2));
  const casoSeleccionado = vecino?.nombre ?? null;
  let casoAprendido = null;
  const candidato = casos.find((caso) => caso?.nombre === vecino?.nombre && caso?.geometria);
  if (confianzaGeometria >= 0.6 && candidato?.fuente === "pareado-validado") {
    casoAprendido = candidato.nombre;
  }

  const gruposVerificados = [];
  const gruposNoVerificados = [];
  for (const categoria of ["ejes", "columnas", "murosVanos", "losas"]) {
    const disponible = vistas.length > 0 && vistas.every((v) => Array.isArray(v?.categorias?.[categoria]));
    if (disponible) {
      if (categoria === "ejes" || categoria === "columnas") {
        const tieneAlMenosUno = vistas.some((v) => (v.categorias[categoria]?.length ?? 0) > 0);
        const areaAbierta = rasgos.areaAbierta === true;
        if (!areaAbierta && tieneAlMenosUno) gruposVerificados.push(categoria);
        else gruposNoVerificados.push(categoria);
      } else {
        gruposVerificados.push(categoria);
      }
    } else {
      gruposNoVerificados.push(categoria);
    }
  }

  const avisosRevision = [];
  if (rasgos.areaAbierta === true) avisosRevision.push("Área abierta o no clasificada: no copié elementos estructurales; revisión obligatoria.");
  if (confianzaGeometria < 0.6) avisosRevision.push(`Baja confianza geométrica (${Math.round(confianzaGeometria * 100)} %): no apliqué el caso aprendido.`);
  if (!gruposVerificados.includes("murosVanos")) avisosRevision.push("Muros y vanos no están verificados por el lector actual.");
  if (!gruposVerificados.includes("losas")) avisosRevision.push("Losas no están verificadas por el lector actual.");
  const motivoLimite = "No hay adaptación geométrica segura disponible: el generador determinista actual no puede alinear ni transportar referencias mediante ejes nombrados.";
  avisosRevision.push("No hay adaptación geométrica aprendida completa: el generador no utiliza la referencia ni las coordenadas fuente para dibujar.");

  return {
    niveles: nNiveles,
    losaTecho: nNiveles <= 1,
    geometriaActual,
    casoSeleccionado,
    casoAprendido,
    geometriaAdaptada: false,
    patronGeometrico: null,
    motivoLimite,
    confianzaGeometria,
    gruposVerificados,
    gruposNoVerificados,
    avisosRevision,
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

// Cuántos niveles cubren las plantas de losa del ingeniero, por sus títulos: "LOSA ALIGERADA
// 1°-2° PISO" (1 y 2), "1° Y 2° PISO", "3° PISO", "ALIGERADO 2° NIVEL", "TECHO 2º PISO" (2) y
// "LOSA ALIGERADA TECHO" (el último, uno más que los numerados). Sin número: una planta.
export function nivelesDePlantasDeLosa(titulos) {
  const niveles = new Set();
  let techo = false, generica = false;
  for (const t of titulos) {
    if (!/LOSA|ALIGERAD|TECHO/.test(t) || /TABIQUER|CIMENTA|PORTICO|ESCALERA/.test(t)) continue;
    const nums = [...t.matchAll(/(\d)\s*[°º]/g)].map((m) => Number(m[1]));
    if (/(\d)\s*[°º]\s*-\s*(\d)\s*[°º]/.test(t)) { const [a, b] = nums; for (let n = Math.min(a, b); n <= Math.max(a, b); n++) niveles.add(n); }
    else if (nums.length) nums.forEach((n) => niveles.add(n));
    else if (/TECHO/.test(t)) techo = true;
    else generica = true;
  }
  const total = niveles.size + (techo ? 1 : 0);
  return total || (generica ? 1 : 0);
}

// textos: todos los textos del plano de estructuras (en cualquier orden).
export function decisionesDeEstructura(textos) {
  const ts = [...new Set(textos.map((t) => textoPlano(t).toUpperCase().replace(/\s+/g, " ").trim()).filter(Boolean))];
  const todo = ts.join(" | ");
  const titulos = ts.filter((t) => /PLANO\s*(DE\s|-)/.test(t) && t.length < 90);
  const espesorLosa = primero(frecuentes(ts, /(?:LOSA\s+)?ALIGERAD[OA]\s*(?:DE\s*)?(?:E|H|ESP\.?)\s*=\s*(0?\.\d+|\d{2})\s*(M|CM)?/g,
    (x) => { const v = num(x[1]); return r2(v >= 1 ? v / 100 : v); }));
  // Solo una losa maciza dibujada (con su espesor o su detalle), no la de las notas generales
  // ("…y losas macizas será de 2 cm", "fondo de vigas y losa maciza… 20 días").
  const maciza = /LOSA\s+MACIZA\s*(?:E|H|ESP\.?)\s*=|DETALLE[^|]*LOSA\s+MACIZA/.test(todo);
  const vigas = frecuentes(ts, /VIGA\S*\s*\(?\s*(\d{2})\s*X\s*(\d{2})\s*(?:CM)?\)?/g, (x) => `${x[1]}x${x[2]}`).map(([v]) => v);
  const fc = (re) => primero(frecuentes(ts, re, (x) => Number(x[1])));
  const nivelesLosa = nivelesDePlantasDeLosa(titulos);
  return {
    cimentacion: /PLATEA/.test(todo) ? "platea" : /ZAPATA\s*(AISLADA|Z-?\d|\d)|DETALLE DE ZAPATA|CUADRO DE ZAPATA/.test(todo) ? "zapatas" : "cimiento corrido",
    cimientoCorrido: /CIMIENTO CORRIDO|CIMENTO CORRIDO/.test(todo),
    hz: primero(frecuentes(ts, /HZ\s*=\s*(0?\.\d+)/g, (x) => r2(num(x[1])))),
    df: primero(frecuentes(ts, /DF\s*=\s*-?\s*(\d?\.\d+)/g, (x) => r2(num(x[1])))),
    losa: espesorLosa ? (maciza ? "aligerada y maciza" : "aligerada") : maciza ? "maciza" : null,
    espesorLosa,
    // Plantas de losa dibujadas ("PLANO DE LOSA 1° NIVEL", "PLANO DE ALIGERADO"): comparadas con
    // los niveles de la arquitectura dicen si el último nivel lleva losa o solo cobertura.
    plantasDeLosa: nivelesLosa,
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
  techoDosAguas: {nombre: "Techo a dos aguas (cobertura inclinada)"},
  mallaCimentacion: {nombre: "Malla completa en el plano de cimentación (o solo bastones)"},
  fcColumnas: {nombre: "f'c columnas y vigas (kg/cm²)"},
  fcColumnetas: {nombre: "f'c columnetas (kg/cm²)"},
  estribos: {nombre: "Estribos de columnas"},
  columnasComoArquitectura: {nombre: "Columnas con las secciones de la arquitectura"},
};

// Nombre de un caso para mostrar al usuario: sin el proyecto (otro cliente no debe ver de quién
// es el plano): "vinchos:modulo-01" → "un caso estudiado (módulo 01)".
export const nombreVisible = (nombre) => { const m = /modulo-?0*(\d+)/i.exec(String(nombre)); return m ? `módulo ${m[1].padStart(2, "0")} estudiado` : "caso estudiado"; };
export const MIN_CASOS_COSTUMBRE = 3;
// Decisiones que el agente aprende como patrón (árbol de decisión) de los casos.
export const PATRONES = ["cimentacion", "losaDeTecho", "cimientoCorrido", "losa", "fcColumnas", "mallaCimentacion"];
import {predecir as predecirArbol} from "./patrones.js";
const predecirPatron = (pat, rasgos) => predecirArbol(pat.arbol, rasgos);
// Una regla que explica sin excepción al menos tantos casos (aunque sean de un solo proyecto)
// se aplica como propuesta del dibujo, pero queda para que el ingeniero la confirme.
export const MIN_CASOS_PROPUESTA = 6;

// Reglas candidatas: criterio de ingeniería escrito como función de los rasgos. Solo se usan si
// explican TODOS los casos conocidos y están respaldadas por tres proyectos independientes:
// los módulos del mismo proyecto no cuentan como evidencia independiente.
export const REGLAS = [
  {clave: "espesorLosa", texto: "aligerado de 0.20 m hasta 5.5 m de luz libre, 0.25 hasta 6.5 y 0.30 más (luz libre = entre ejes − viga)",
    valor: (r) => (r.luzLosa > 0 ? espesorPorLuz(r.luzLosa) : null)},
  // Un solo nivel varía (losa bajo la cobertura o solo cobertura liviana sobre vigas): no aplica.
  {clave: "losaDeTecho", texto: "con más de un nivel, el último también lleva losa (bajo la cobertura)",
    valor: (r) => (r.niveles >= 2 ? true : undefined)},
  // Hipótesis de experto para un nivel: se valida con los datos y se descarta sola si un proyecto
  // nuevo la contradice (entonces decide el patrón aprendido o los casos parecidos).
  {clave: "losaDeTecho", texto: "con un nivel, losa si la arquitectura anota la cobertura y no es de uso deportivo, o si tiene cisterna; si no, solo cobertura liviana",
    valor: (r) => (r.niveles <= 1 ? Boolean(r.agua || (r.cubierta && !r.deportivo)) : undefined)},
  {clave: "cimentacion", texto: "con más de un nivel, platea; con un nivel, zapatas si la planta pasa de 60 m² y platea si es menor",
    valor: (r) => (!(r.area > 0) ? null : r.niveles >= 2 ? "platea" : r.area >= 60 ? "zapatas" : "platea")},
  {clave: "cimientoCorrido", texto: "cimiento corrido bajo los muros cuando hay columnetas (albañilería confinada)",
    valor: (r) => r.columnetas > 0},
];

const identidadProyecto = (caso) => {
  const grupo = String(caso?.grupo ?? "").trim().toLocaleLowerCase();
  return grupo || caso?.nombre || caso;
};

export function reglasValidas(casos) {
  return REGLAS.map((regla) => {
    const tol = DECISIONES[regla.clave]?.tolerancia;
    // Solo los casos donde la regla aplica (devuelve undefined donde no dice nada).
    const conDato = casos.filter((c) => c.decisiones?.[regla.clave] !== null && c.decisiones?.[regla.clave] !== undefined && regla.valor(c.rasgos ?? {}) !== undefined);
    const proyectos = new Set(conDato.map(identidadProyecto));
    const fallan = conDato.filter((c) => {
      const v = regla.valor(c.rasgos), real = c.decisiones[regla.clave];
      return v === null || (tol ? Math.abs(v - real) > tol : v !== real);
    }).map((c) => c.nombre);
    return {...regla, casos: conDato.length, proyectos: proyectos.size, fallan,
      valida: proyectos.size >= MIN_CASOS_COSTUMBRE && !fallan.length,
      propuesta: conDato.length >= MIN_CASOS_PROPUESTA && !fallan.length};
  });
}

// rasgos: los del plano nuevo; casos: [{nombre, rasgos, decisiones}]. Devuelve cada decisión con
// su valor, de qué casos sale, la confianza (0–1) y si queda para el ingeniero (y por qué).
export function proponer(rasgos, casos, {k = 3, umbral = 0.6} = {}) {
  const vecinos = casos.filter((c) => c.fuente !== "uso").map((c) => ({c, d: distancia(rasgos, c.rasgos)})).sort((a, b) => a.d - b.d).slice(0, k);
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
    for (const c of casos.filter((x) => x.fuente !== "uso")) {
      const v = c.decisiones?.[clave];
      if (v === null || v === undefined) continue;
      if (!valores.some((x) => (def.tolerancia ? Math.abs(x - v) <= def.tolerancia : x === v))) valores.push(v);
    }
    if (valores.length > 1 && decisiones[clave] && !decisiones[clave].ingeniero) {
      decisiones[clave].ingeniero = `Cambia entre proyectos (${valores.map((v) => (typeof v === "boolean" ? (v ? "sí" : "no") : v)).join(" / ")}) y aún no hay una regla que lo explique.`;
    }
  }
  // Reglas respaldadas en proyectos independientes generalizan mejor que copiar al vecino.
  for (const regla of reglasValidas(casos)) {
    if (!regla.valida && !regla.propuesta) continue;
    const valor = regla.valor(rasgos);
    if (valor === null || valor === undefined) continue;
    decisiones[regla.clave] = regla.valida
      ? {nombre: DECISIONES[regla.clave].nombre, valor, fuentes: [], confianza: r2(Math.min(0.95, 0.7 + 0.05 * regla.proyectos)),
        regla: `${regla.texto}; validado en ${regla.proyectos} proyecto(s) independiente(s)`}
      : {nombre: DECISIONES[regla.clave].nombre, valor, fuentes: [], confianza: 0.75,
        regla: `${regla.texto}; explica los ${regla.casos} casos estudiados`,
        ingeniero: `Criterio que explica los ${regla.casos} casos estudiados, pero de ${regla.proyectos} proyecto(s): confírmalo.`};
  }
  // Patrones aprendidos de los casos (árbol chico, medido con casos que no vio): por encima de
  // copiar al vecino, salvo que una regla validada en 3 proyectos ya lo decida.
  const aprendidos = casos.filter((c) => c.fuente !== "uso");
  for (const clave of PATRONES) {
    // Una regla que explica todos los casos (validada o propuesta) no la reemplaza un patrón.
    if (decisiones[clave]?.regla) continue;
    // Si hay una regla para otros casos (varios niveles → losa de techo), el patrón se aprende solo
    // con los casos donde esa regla no dice nada (los de un nivel): mismo contexto que el plano.
    const regla = REGLAS.find((r) => r.clave === clave);
    const contexto = regla && regla.valor(rasgos) === undefined ? aprendidos.filter((c) => regla.valor(c.rasgos ?? {}) === undefined) : aprendidos;
    const pat = aprenderPatron(contexto, clave, {minimo: contexto === aprendidos ? 8 : 6});
    if (!patronUtil(pat)) continue;
    const valor = predecirPatron(pat, rasgos);
    if (valor === null || valor === undefined) continue;
    const solo = pat.proyectos >= MIN_CASOS_COSTUMBRE;
    decisiones[clave] = {nombre: DECISIONES[clave].nombre, valor, fuentes: [], confianza: r2(Math.min(0.95, pat.aciertoNoVisto * 0.95)), patron: pat.texto,
      regla: `patrón aprendido de ${pat.casos} casos: ${pat.texto} (acierta ${Math.round(pat.aciertoNoVisto * 100)} % en planos que no vio)`,
      ...(solo ? {} : {ingeniero: `Patrón de ${pat.casos} casos de ${pat.proyectos} proyecto(s): confírmalo; con ${MIN_CASOS_COSTUMBRE} proyectos lo decido solo.`})};
  }
  // Criterio de espesor por luz libre por encima de copiar al vecino.
  const L = rasgos.luzLosa;
  const e = decisiones.espesorLosa;
  if (L > 0 && /aligerada/.test(String(decisiones.losa?.valor ?? "aligerada"))) {
    const minimo = espesorPorLuz(L);
    if (!e.valor || e.valor < minimo) {
      decisiones.espesorLosa = {nombre: e.nombre, valor: minimo, fuentes: [], confianza: 0.95,
        regla: `luz libre ${r2(L - 0.25)} m (entre ejes ${L} m) → aligerado ${minimo} m${e.valor ? ` (los casos usaban ${e.valor})` : ""}`,
        ingeniero: "Validar con el ingeniero estructural: confirmar sistema de losa, luz efectiva y criterio normativo antes de adoptar este espesor."};
    }
  }
  // Lo que el ingeniero corrigió manda: en este mismo plano, sin preguntar; en uno parecido,
  // se propone su valor y se le avisa.
  for (const clave of Object.keys(DECISIONES)) {
    const usos = casos.filter((c) => c.fuente === "uso" && c.decisiones?.[clave] !== undefined && c.decisiones[clave] !== null)
      .map((c) => ({c, d: distancia(rasgos, c.rasgos)})).sort((a, b) => a.d - b.d);
    const u = usos[0];
    if (!u || u.d > 1) continue;
    const anterior = decisiones[clave];
    const valor = u.c.decisiones[clave];
    if (u.d < 0.05) {
      decisiones[clave] = {nombre: DECISIONES[clave].nombre, valor, fuentes: [], confianza: 0.95, regla: "lo corregiste en este mismo plano"};
      if (clave === "espesorLosa" && L > 0 && valor < espesorPorLuz(L) - 1e-9) decisiones[clave].ingeniero = `Ojo: con luz entre ejes ${L} m el criterio pide ${espesorPorLuz(L)} m.`;
    } else if (anterior?.valor !== valor) {
      decisiones[clave] = {nombre: DECISIONES[clave].nombre, valor, fuentes: [], confianza: 0.6,
        ingeniero: `En un plano parecido lo corregiste a ${typeof valor === "boolean" ? (valor ? "sí" : "no") : valor} (yo proponía ${anterior?.valor ?? "—"}): confírmalo.`};
    }
  }
  // Más de un nivel: cada nivel lleva su losa (entrepiso), aunque los casos no lo digan.
  decisiones.losasDeEntrepiso = {nombre: "Losas de entrepiso", valor: Math.max(0, rasgos.niveles - 1), fuentes: [], confianza: 0.95, regla: `${rasgos.niveles} nivel(es) leídos en la arquitectura`};
  for (const d of Object.values(decisiones)) {
    if (d.ingeniero || d.regla) continue;
    const fuentes = (d.fuentes ?? []).map((nombre) => casos.find((c) => c.nombre === nombre)).filter(Boolean);
    const proyectos = new Set(fuentes.map(identidadProyecto));
    if (proyectos.size < MIN_CASOS_COSTUMBRE) {
      d.ingeniero = `Solo ${proyectos.size} proyecto(s) independiente(s) parecido(s) lo respaldan; hacen falta ${MIN_CASOS_COSTUMBRE} proyectos independientes para decidirlo solo.`;
      continue;
    }
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

// ---------- Aprendizaje por uso ----------

// Correcciones y confirmaciones del ingeniero (registro.js) como casos parciales: un caso por
// evento, con los rasgos del plano y solo la decisión que tocó. La última corrección de una
// decisión para el mismo plano reemplaza a las anteriores.
export function casosDeUso(eventos = []) {
  const ultimos = new Map();
  for (const e of eventos) {
    if (!e || !(e.clave in DECISIONES) || !e.rasgos) continue;
    const clave = `${e.clave}|${JSON.stringify(e.rasgos)}`;
    ultimos.set(clave, e);
  }
  return [...ultimos.values()].map((e, i) => ({
    nombre: `${e.tipo === "confirmacion" ? "confirmado" : "corregido"} por el ingeniero${e.motivo ? ` (${String(e.motivo).slice(0, 40)})` : ""}`,
    fuente: "uso", indice: i,
    rasgos: {niveles: 1, luzLosa: 0, area: 0, columnas: 0, techoLiviano: false, placas: false, columnetas: 0, ...e.rasgos},
    decisiones: {[e.clave]: e.valor},
  }));
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
  return {filas, acierto: t ? r2(suma("aciertos") / t) : 0, aciertoAgente: solo ? r2(suma("soloAciertos") / solo) : null, parteAgente: t ? r2(solo / t) : 0};
}

// Respuesta corta para el ingeniero: qué decide el agente y qué le deja.
export function textoPropuesta(rasgos, p) {
  const fmt = (d) => (typeof d.valor === "boolean" ? (d.valor ? "sí" : "no")
    : typeof d.valor === "number" && !Number.isInteger(d.valor) && d.valor < 10 ? d.valor.toFixed(2) : String(d.valor ?? "—"));
  const linea = ([, d]) => `- ${d.nombre}: ${fmt(d)}${d.regla ? ` (${d.regla})` : d.fuentes?.length ? ` (como ${d.fuentes.map(nombreVisible).join(", ")})` : ""}`;
  const entradas = Object.entries(p.decisiones);
  return [
    `Leí ${rasgos.niveles} nivel(es), ${rasgos.ejes.x}×${rasgos.ejes.y} ejes, ${rasgos.largo}×${rasgos.ancho} m, luz de losa ${rasgos.luzLosa} m, ${rasgos.columnas} columnas${rasgos.techoLiviano ? ", techo liviano" : ""}. Casos más parecidos: ${p.vecinos.map((v) => v.nombre).join(", ") || "ninguno"}.`,
    "Decido:",
    ...entradas.filter(([, d]) => !d.ingeniero).map(linea),
    "Para el ingeniero:",
    ...entradas.filter(([, d]) => d.ingeniero).map(([k, d]) => `${linea([k, d])} — ${d.ingeniero}`),
  ].join("\n");
}
