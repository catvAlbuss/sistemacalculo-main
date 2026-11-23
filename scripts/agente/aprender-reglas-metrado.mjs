// Reglas de metrado aprendidas de las planillas del ingeniero (las de pares.json con metrado):
// sección de vigas por su luz (ancho, peralte de las vigas que cargan la losa y de las que no),
// armado de vigas (varillas corridas, bastones y estribos por metro), sobrecimiento (alto, ancho
// de soga y de cabeza, qué parte del cimiento lleva sobrecimiento), columnas (altura de cálculo
// sobre el techo del último nivel) y columnetas (largo de varilla sobre su alto, estribos por
// metro). Genera resources/js/ingenieria/metrado/reglasDespacho.js con SOLO números por módulo
// (clave anónima, sin nombres ni descripciones) y las reglas agregadas. Lo leen metrado.js y el
// dibujo (aligeradoPlano.js, pórticos y cuadros).
//
//   node scripts/agente/aprender-reglas-metrado.mjs [--grupo=<g>]
//
// Evaluación honesta: con AGENTE_REGLAS_SIN=<clave> las reglas se agregan sin ese módulo
// (evaluar-metrado.mjs --sin-modulo).

import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import ExcelJS from 'exceljs';
import {PLANOS} from './planos.mjs';
import {paresDelManifiesto} from './pares-entrenamiento.mjs';
import {partidasDeHoja} from './leer-planilla.mjs';

// Clave anónima del módulo: hash corto del grupo + número (la misma en evaluar-metrado.mjs).
export const claveModulo = (grupo, n) => `${createHash('sha1').update(String(grupo)).digest('hex').slice(0, 6)}/${n}`;

const SECCION = /(\d?\.\d+)\s*[xX×]\s*(\d?\.\d+)/;
const seccionDe = (d) => { const m = SECCION.exec(d ?? ''); return m ? [Number(m[1]), Number(m[2])] : null; };
const diametroDe = (d) => /(\d\/\d)\s*"?/.exec(d ?? '')?.[1] ?? null;
const clase = (d) => (/techo/i.test(d) ? 'techo' : /borde/i.test(d) ? 'borde' : /chata|vch/i.test(d) ? 'chata' : /cumbrera/i.test(d) ? 'cumbrera' : /estrib/i.test(d) ? 'estribo' : /eje|viga|v-|v\(/i.test(d) ? 'eje' : 'otro');
const n = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const r3 = (v) => Math.round(v * 1000) / 1000;
const veces = (f) => (n(f.simil) ?? 1) * (n(f.veces) ?? 1);

// Muestras de un módulo (solo números).
export function muestrasDeHoja(partidas) {
  const p = (item) => partidas.find((x) => x.item === item);
  const filas = (item) => (p(item)?.filas ?? []).filter((f) => !f.grupo);
  const m = {};
  // Tipo de cimentación del módulo (separa el sistema estructural: platea con muros / zapatas con pórticos).
  m.tipo = p('02.03.01.01') ? 'platea' : p('02.03.02.01') ? 'zapatas' : null;

  // ---- Vigas: secciones (de la denominación) por clase y luz ----
  const vc = filas('02.03.07.01.01');
  const vigas = vc.map((f) => ({clase: clase(f.descripcion), sec: seccionDe(f.descripcion), largo: n(f.largo), b: n(f.ancho), h: n(f.alto), cuenta: veces(f)}));
  const ejes = vigas.filter((v) => (v.clase === 'eje' || v.clase === 'techo') && v.sec && v.largo);
  if (ejes.length) {
    const hs = ejes.map((v) => Math.max(...v.sec));
    const hMax = Math.max(...hs), hMin = Math.min(...hs);
    m.vigas = {
      // Ancho de las vigas de eje (el lado menor de la denominación), ponderado por metro.
      anchos: ejes.map((v) => [Math.min(...v.sec), r3(v.largo * v.cuenta)]),
      // Vigas que cargan la losa: el mayor peralte del módulo, con su luz (tramos de un paño: ≤ 7.5 m).
      // Se toma la luz mayor del módulo (la que manda el peralte); tramos de 2.5 a 7.5 m.
      principal: hMax > hMin ? [Math.max(0, ...ejes.filter((v) => Math.max(...v.sec) === hMax && v.largo >= 2.5 && v.largo <= 7.5).map((v) => v.largo))].filter((l) => l > 0).map((l) => [r3(l), hMax]) : [],
      // Vigas que no cargan la losa (paralelas a las viguetas): el menor peralte.
      secundaria: hMax > hMin ? hMin : null,
      // Con un solo peralte en todo el módulo: [luz mayor de un paño, peralte].
      unica: hMax === hMin ? [r3(Math.max(0, ...ejes.filter((v) => v.largo >= 2.5 && v.largo <= 7.5).map((v) => v.largo))), hMax] : null,
    };
    const borde = vigas.find((v) => v.clase === 'borde' && v.sec), chata = vigas.find((v) => v.clase === 'chata' && v.sec);
    if (borde) m.vigas.borde = [...borde.sec].sort((a, b) => a - b);
    if (chata) m.vigas.chata = [...chata.sec].sort((a, b) => b - a);
  }
  // Armado de vigas: metros de varilla por metro de viga (de eje y de techo) y estribos por metro.
  const va = filas('02.03.07.01.03');
  if (va.length) {
    // Solo las filas de vigas de eje/techo: hasta la primera fila de borde, chata o cumbrera.
    const lim = va.findIndex((f) => /borde|chata|vch|cumbrera/i.test(f.descripcion));
    const propias = lim > 0 ? va.slice(0, lim) : va;
    const esEstribo = (f) => /estrib/i.test(f.descripcion);
    const largas = propias.filter((f) => !esEstribo(f) && diametroDe(f.descripcion) === '5/8');
    // Corridas: las que recorren la viga (≥ 4 m); bastones: las cortas en los apoyos.
    const corridas = largas.filter((f) => n(f.largo) >= 4);
    const metros = (fs) => fs.reduce((s, f) => s + (n(f.simil) ?? 1) * ((n(f.largo) ?? 0) + (n(f.ancho) ?? 0) + (n(f.alto) ?? 0)) * (n(f.veces) ?? 0), 0);
    // Estribos por metro: cada fila de estribos con la última fila de varillas corridas de su grupo.
    const porMetro = [];
    let ultima = null;
    for (const f of propias) {
      if (!esEstribo(f) && n(f.largo) >= 4) ultima = f;
      else if (esEstribo(f) && ultima && n(f.veces) > 0) porMetro.push(r3(n(f.veces) / n(ultima.largo)));
    }
    if (corridas.length) m.vigaAcero = {
      corridas: corridas.map((f) => n(f.veces)).filter(Boolean),
      gancho: corridas.map((f) => n(f.ancho)).filter((v) => v > 0),
      // Bastones: metros de varilla corta por metro de varilla corrida.
      bastones: r3(metros(largas.filter((f) => !corridas.includes(f))) / (metros(corridas) || 1)),
      estribosPorMetro: porMetro,
    };
  }

  // ---- Sobrecimiento y cimiento corrido ----
  const sc = filas('02.02.04.01'), cc = filas('02.02.03.01'), sce = filas('02.02.04.02');
  if (sc.length) {
    const largoSC = sc.reduce((s, f) => s + (n(f.largo) ?? 0) * veces(f), 0);
    const largoCC = cc.reduce((s, f) => s + (n(f.largo) ?? 0) * veces(f), 0);
    m.sobrecimiento = {
      altos: sc.map((f) => n(f.alto)).filter(Boolean),
      anchos: sc.map((f) => [n(f.ancho), r3((n(f.largo) ?? 0) * veces(f))]).filter(([a]) => a),
      largoSobreCimiento: largoCC > 0 ? r3(largoSC / largoCC) : null,
      caras: sce.length && largoSC > 0 ? r3(sce.reduce((s, f) => s + (n(f.largo) ?? 0) * (n(f.simil) ?? 1) * (n(f.veces) ?? 1), 0) / largoSC) : null,
    };
  }

  // ---- Columnas y placas: altura de cálculo (una por módulo) ----
  const altos = [...filas('02.03.06.01.01'), ...filas('02.03.05.01.01')].map((f) => n(f.alto)).filter((v) => v > 2);
  if (altos.length) m.columnas = {altura: Math.max(...altos)};

  // ---- Columnetas: largo de varilla sobre el alto y estribos por metro de varilla ----
  const ctc = filas('02.03.08.01'), cta = filas('02.03.08.03');
  if (ctc.length && cta.length) {
    const cuenta = ctc.reduce((s, f) => s + veces(f), 0), altoMedio = ctc.reduce((s, f) => s + (n(f.alto) ?? 0) * veces(f), 0) / (cuenta || 1);
    const largas = cta.filter((f) => !/estrib/i.test(f.descripcion) && n(f.largo));
    const nl = largas.reduce((s, f) => s + (n(f.simil) ?? 1), 0);
    const barraMedia = largas.reduce((s, f) => s + (n(f.simil) ?? 1) * n(f.largo), 0) / (nl || 1);
    // Estribos: cada fila de estribos sigue a la de varillas del mismo grupo.
    const pares = [];
    cta.forEach((f, i) => { const a = cta[i - 1]; if (/estrib/i.test(f.descripcion) && a && !/estrib/i.test(a.descripcion) && n(a.largo) > 0) pares.push(n(f.veces) / n(a.largo)); });
    m.columnetas = {
      extraVarilla: nl ? r3(barraMedia - altoMedio) : null,
      gancho: largas.map((f) => n(f.ancho)).filter((v) => v > 0),
      estribosPorMetro: pares.filter((v) => v > 0).map(r3),
    };
  }

  // ---- Movimiento de tierras: esponjamiento (eliminación / (excavación − relleno propio)) ----
  const total = (re) => partidas.filter((x) => re.test(x.item) && n(x.total) !== null).reduce((s, x) => s + x.total, 0);
  const exc = total(/^02\.01\.02\./), rel = total(/^02\.01\.03\.0[1-4]$/), eli = total(/^02\.01\.05\.02$/);
  if (exc > rel && eli > 0) m.eliminacion = {esponjamiento: r3(eli / (exc - rel))};
  return m;
}

// ---------- Agregado: de las muestras a las reglas (se reusa en reglasDespacho.js) ----------
// Se escribe como texto para que el archivo generado lo traiga sin depender de este script.
export const FUENTE_AGREGADO = String.raw`
const mediana = (xs) => { const s = xs.filter((x) => Number.isFinite(x)).sort((a, b) => a - b); if (!s.length) return null; const i = (s.length - 1) / 2; return (s[Math.floor(i)] + s[Math.ceil(i)]) / 2; };
const moda = (pares) => { const m = new Map(); for (const [v, w] of pares) if (Number.isFinite(v)) m.set(v, (m.get(v) ?? 0) + (w ?? 1)); return [...m].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null; };
const r3 = (v) => (v === null ? null : Math.round(v * 1000) / 1000);
const modaSeccion = (secciones) => { const m = new Map(); for (const s of secciones) m.set(s.join('x'), (m.get(s.join('x')) ?? 0) + 1); const k = [...m].sort((a, b) => b[1] - a[1])[0]?.[0]; return k ? k.split('x').map(Number) : null; };
// minimo: módulos que deben enseñar una regla para usarla (si no, queda el criterio).
export function reglasDe(muestras, sin = null, tipo = null, minimo = 3) {
  // sin: la clave de un módulo que no enseña (evaluación honesta) o "*" (ninguna regla: los criterios).
  // tipo: solo los módulos con ese tipo de cimentación.
  const ms = Object.entries(muestras).filter(([k, m]) => sin !== '*' && k !== sin && (!tipo || m.tipo === tipo)).map(([, m]) => m);
  const r = reglasSinMinimo(ms);
  for (const sec of Object.values(r)) if (sec && typeof sec === 'object' && sec.n < minimo) for (const k of Object.keys(sec)) if (k !== 'n') sec[k] = null;
  return r;
}
function reglasSinMinimo(ms) {
  const de = (f) => ms.map(f).filter((x) => x !== undefined && x !== null);
  const principal = de((m) => m.vigas?.principal).flat();
  const unica = de((m) => m.vigas?.unica).filter(([l]) => l > 0);
  const nVigas = ms.filter((m) => m.vigas?.principal?.length || m.vigas?.unica?.[0] > 0).length;
  // Luz/peralte: mediana de las vigas que cargan la losa (y de los módulos con un solo peralte).
  const k = mediana([...principal, ...unica].map(([l, h]) => l / h));
  return {
    modulos: ms.length,
    vigas: {
      ancho: moda(de((m) => m.vigas?.anchos).flat()),
      luzSobrePeralte: r3(k),
      secundaria: moda(de((m) => m.vigas?.secundaria).map((h) => [h, 1])),
      borde: modaSeccion(de((m) => m.vigas?.borde)),
      chata: modaSeccion(de((m) => m.vigas?.chata)),
      n: nVigas,
    },
    vigaAcero: {
      corridas: moda(de((m) => m.vigaAcero?.corridas).flat().map((v) => [v, 1])),
      gancho: moda(de((m) => m.vigaAcero?.gancho).flat().map((v) => [v, 1])),
      bastones: r3(mediana(de((m) => m.vigaAcero?.bastones))),
      estribosPorMetro: r3(mediana(de((m) => m.vigaAcero?.estribosPorMetro).flat())),
      n: de((m) => m.vigaAcero).length,
    },
    sobrecimiento: {
      alto: moda(de((m) => m.sobrecimiento?.altos).flat().map((v) => [v, 1])),
      soga: moda(de((m) => m.sobrecimiento?.anchos).flat().filter(([a]) => a < 0.18)),
      cabeza: moda(de((m) => m.sobrecimiento?.anchos).flat().filter(([a]) => a >= 0.18)),
      largoSobreCimiento: r3(mediana(de((m) => m.sobrecimiento?.largoSobreCimiento))),
      caras: moda(de((m) => m.sobrecimiento?.caras).map((c) => [Math.round(c), 1])),
      n: de((m) => m.sobrecimiento).length,
    },
    columnetas: {
      extraVarilla: r3(mediana(de((m) => m.columnetas?.extraVarilla))),
      gancho: moda(de((m) => m.columnetas?.gancho).flat().map((v) => [v, 1])),
      estribosPorMetro: r3(mediana(de((m) => m.columnetas?.estribosPorMetro).flat())),
      n: de((m) => m.columnetas).length,
    },
    eliminacion: {esponjamiento: r3(mediana(de((m) => m.eliminacion?.esponjamiento))), n: de((m) => m.eliminacion).length},
  };
}
`;

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/').replace(/^\//, '')}`) {
  const grupo = process.argv.slice(2).find((a) => a.startsWith('--grupo='))?.slice(8);
  const BASE = join(PLANOS, 'estructuras');
  const pares = paresDelManifiesto(BASE, JSON.parse(readFileSync(join(BASE, 'pares.json'), 'utf8')), existsSync)
    .filter((p) => p.rutaMetrado && (!grupo || p.grupo === grupo));
  const muestras = {};
  for (const par of pares) {
    const num = Number(/(\d+)/.exec(par.id)?.[1]);
    const libro = new ExcelJS.Workbook();
    await libro.xlsx.readFile(par.rutaMetrado);
    const ws = libro.worksheets.find((w) => new RegExp(`m[oó]dulo\\s*0*${num}\\b`, 'i').test(w.name));
    if (!ws) continue; // otro formato de planilla
    const m = muestrasDeHoja(partidasDeHoja(ws));
    if (Object.keys(m).length) muestras[claveModulo(par.grupo, num)] = m;
  }
  const salida = 'resources/js/ingenieria/metrado/reglasDespacho.js';
  writeFileSync(salida, `// Generado por scripts/agente/aprender-reglas-metrado.mjs con ${Object.keys(muestras).length} módulos de planillas del despacho.
// Solo números por módulo (clave anónima) y las reglas agregadas: nada del proyecto ni del cliente.
// No editar a mano: volver a correr el script. Con AGENTE_REGLAS_SIN=<clave> (solo en node) las
// reglas se agregan sin ese módulo, para medir sin trampa (evaluar-metrado.mjs --sin-modulo).
${FUENTE_AGREGADO}
export const MUESTRAS_DESPACHO = ${JSON.stringify(muestras)};

const SIN = globalThis.process?.env?.AGENTE_REGLAS_SIN ?? null;
export const REGLAS_DESPACHO = reglasDe(MUESTRAS_DESPACHO, SIN);
// Por tipo de cimentación (cada una con lo que enseñaron al menos 3 módulos de ese tipo).
export const REGLAS_POR_TIPO = {platea: reglasDe(MUESTRAS_DESPACHO, SIN, 'platea'), zapatas: reglasDe(MUESTRAS_DESPACHO, SIN, 'zapatas')};
export const reglasPara = (tipoCimentacion) => (tipoCimentacion ? REGLAS_POR_TIPO[tipoCimentacion] ?? null : REGLAS_DESPACHO);
`);
  const {reglasDe} = await import(`../../${salida}?t=${Date.now()}`);
  console.log(`${Object.keys(muestras).length} módulos → ${salida}`);
  console.log(JSON.stringify(reglasDe(muestras), null, 1));
  for (const [k, m] of Object.entries(muestras)) console.log(k, JSON.stringify({v: m.vigas && {p: m.vigas.principal, s: m.vigas.secundaria, u: m.vigas.unica}, a: m.vigaAcero, sc: m.sobrecimiento && {l: m.sobrecimiento.largoSobreCimiento, c: m.sobrecimiento.caras}, col: m.columnas, ct: m.columnetas && {x: m.columnetas.extraVarilla}, e: m.eliminacion}));
}
