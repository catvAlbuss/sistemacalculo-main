// Genera la plantilla de láminas de estructuras del Agente Predim a partir de un
// expediente de referencia (por defecto el módulo 14 de Vinchos):
//
//   node scripts/agente/generar-plantilla-estructuras.mjs [referencia.dwg]
//
// - Copia los detalles estándar de las láminas (especificaciones, parámetros
//   sísmicos, detalles típicos, cortes, cuadros, marco y rótulo) a un DXF limpio.
// - Quita lo que es propio del proyecto: los planos (platea, cimiento corrido,
//   aligerado, pórticos), el cuadro de columnas, los títulos y los datos del
//   rótulo (proyecto, ubicación, CUI, especialista y CIP, fecha, logos).
// - Guarda en un JSON los "espacios" (slots) donde el agente dibuja lo que genera
//   desde la arquitectura, y los campos del rótulo que llena.
//
// Salida: public/assets/plantillas/estructuras-laminas.dxf y .json

import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import * as dm from '@mlightcad/data-model';
import {AcDbLibreDwgMainThreadConverter} from '@mlightcad/libredwg-converter/node';
import {copiarDesdePlantilla} from '../../resources/js/ingenieria/cad/copiarPlantilla.js';
import {aplanarModelo} from '../../resources/js/ingenieria/lectura/lectorPlano.js';
import {plano} from './planos.mjs';
import {anchoTexto} from '../../resources/js/ingenieria/laminas/rotulo.js';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const referencia = process.argv[2] ?? plano('estructuras', '14.VINCHOS MODULO 14 estructuras.dwg');
const salida = resolve(raiz, 'public/assets/plantillas');

// Láminas de la referencia (marco exterior) y lo que cada una tiene de proyecto.
const LAMINAS = [
  {
    codigo: 'E-64', marco: {x0: 3316.18, y0: 1121.22, x1: 3358.18, y1: 1150.92},
    plano: 'CIMENTACIÓN, CIMIENTO CORRIDO Y LOSA ALIGERADA',
    espacios: [
      {id: 'cimentacion', bloque: 'CIMENTACION14', titulo: 'PLANO DE CIMENTACIÓN'},
      {id: 'cimiento', bloque: 'CIMIE-CORR14', titulo: 'PLANO DE CIMIENTO CORRIDO'},
      {id: 'aligerado', bloque: 'ALIGERADO', titulo: 'PLANO DE ALIGERADO'},
      {id: 'cuadroColumnas', bloque: 'CUADRO COLUMNAS', titulo: null},
      {id: 'cuadroColumnetas', bloque: 'gwtg', titulo: null},
    ],
  },
  {
    codigo: 'E-65', marco: {x0: 3361.13, y0: 1120.69, x1: 3403.13, y1: 1150.39},
    plano: 'PÓRTICOS',
    espacios: [
      // Los pórticos están insertados con origen lejano: su zona se midió explotando el bloque.
      {id: 'portico1', bloque: 'c3', titulo: 'PLANO DE PÓRTICO', caja: {x0: 3362.4, y0: 1140.5, x1: 3370.4, y1: 1149.4}},
      {id: 'portico2', bloque: 'c4', titulo: 'PLANO DE PÓRTICO', caja: {x0: 3372.3, y0: 1140.6, x1: 3379.9, y1: 1149.5}},
      {id: 'portico3', bloque: 'c1', titulo: 'PLANO DE PÓRTICO', caja: {x0: 3384.2, y0: 1141.7, x1: 3388.7, y1: 1149.3}},
      {id: 'portico4', bloque: 'c2', titulo: 'PLANO DE PÓRTICO', caja: {x0: 3363.6, y0: 1130.1, x1: 3369.0, y1: 1137.7}},
      {id: 'cuadroColumnas', bloque: 'CUADRO COLUMNAS', titulo: null},
      {id: 'cuadroColumnetas', bloque: 'gwtg', titulo: null},
    ],
  },
];

// Rótulo: etiqueta de la plantilla → nombre del campo que llena el agente.
const ETIQUETAS_ROTULO = [
  [/PROYECTO/i, 'proyecto'], [/ESPECI?A?LISTA/i, 'especialista'], [/ESPECIALIDAD/i, 'especialidad'], [/^PLANO/i, 'plano'],
  [/^ESCALA/i, 'escala'], [/^FECHA/i, 'fecha'], [/REGI[OÓ]N/i, 'region'], [/PROVINCIA/i, 'provincia'], [/DISTRITO/i, 'distrito'],
  [/LOCALIDAD/i, 'localidad'], [/C[OÓ]DIGO\s+LOCAL/i, 'codigoLocal'], [/C[OÓ]DIGO\s+MODULAR/i, 'codigoModular'],
];

// Correcciones de nomenclatura y ortografía de la plantilla (la lámina es para el cliente).
const CORRECCIONES = [
  [/ESPECILISTA/g, 'ESPECIALISTA'], [/DTOS DE LA I\.E\s*:/g, 'DATOS DE LA I.E.:'], [/Refuerso/g, 'Refuerzo'], [/mìnimo/g, 'mínimo'],
  [/Monoliticamente/g, 'monolíticamente'], [/CODIGO /g, 'CÓDIGO '], [/Nivel de terreno Nivelado/g, 'Nivel de terreno nivelado'],
];

// Textos para el visor (la lámina se abre en el navegador, no solo en AutoCAD):
// - \U+XXXX del DXF R14 se escriben como carácter (el lector toma 5 cifras y rompe
//   "\U+00C9CNICAS" o "\U+22053/8"); el diámetro ∅ (U+2205), que no está en las
//   fuentes, pasa a Ø; %%c → Ø, %%d → °, %%p → ±.
// - Se quitan los códigos de párrafo de MTEXT (\pxqc;): el visor no los interpreta y
//   deja el resto del texto literal ("ESCALA:\P1/25").
function limpiarTextosDxf(dxf) {
  let s = dxf.replace(/\\U\+([0-9A-Fa-f]{4})/g, (_, h) => { const c = parseInt(h, 16); return c === 0x2205 || c === 0x00F8 ? 'Ø' : String.fromCharCode(c); });
  s = s.replace(/[∅ø]/g, 'Ø').replace(/%%[cC]/g, 'Ø').replace(/%%[dD]/g, '°').replace(/%%[pP]/g, '±');
  s = s.replace(/\\p[^;\\\n]*;/g, '');
  // Fuente angosta dentro de un MTEXT ("{\fArial Narrow|b1|…;CUADRO DE VIGUETAS}"): el visor
  // solo tiene Arial y con Arial normal el título se sale de su casilla. Arial al 82 %.
  s = s.replace(/\\f(?:Arial Narrow|ArialN|Swis721 (?:Lt )?Cn[^|;]*)\|([^;\n]*);/gi, '\\fArial|$1;\\W0.82;');
  // Un salto de renglón seguido de una fracción ("ESCALA:\P1/25") el visor lo deja
  // literal; con un espacio después del salto sí lo interpreta.
  s = s.replace(/\\P(?=\d+\/\d)/g, '\\P ');
  for (const [a, b] of CORRECCIONES) s = s.replace(a, b);
  // Lo que no entra en Latin-1 (el archivo se escribe en 1252) vuelve a \U+.
  return s.replace(/[^\x00-\xff]/gu, (c) => `\\U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`);
}
const BLOQUES_DEL_PROYECTO = new Set(['1.-1']);
const TITULO_PROYECTO = /PLANO DE (PLATEA|CIMIENTO|ALIGERADO|PORTICO)/i;
// Capas de los valores del rótulo (los rótulos "PROYECTO:", "PLANO:" van en la capa 0).
const CAPAS_DATOS = new Set(['NCAMINO1', 'CAPA8', '.']);

dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
const buffer = readFileSync(referencia);
const origen = new dm.AcDbDatabase();
await origen.read(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength), {readOnly: true}, dm.AcDbFileType.DWG);

const extension = (e) => { try { return e.geometricExtents; } catch { return null; } };
const dentro = (b, m, pad = 0.5) => b && b.min.x >= m.x0 - pad && b.max.x <= m.x1 + pad && b.min.y >= m.y0 - pad && b.max.y <= m.y1 + pad;
// Fracción de la caja b que cae dentro del marco m. Los bloques con MTEXT (p. ej. "ET",
// las especificaciones técnicas) declaran un ancho de párrafo mayor que su texto: su caja
// sobresale del marco aunque el dibujo esté dentro.
const solape = (b, m) => {
  if (!b) return 0;
  const w = Math.max(0, Math.min(b.max.x, m.x1) - Math.max(b.min.x, m.x0)), h = Math.max(0, Math.min(b.max.y, m.y1) - Math.max(b.min.y, m.y0));
  const area = (b.max.x - b.min.x) * (b.max.y - b.min.y);
  return area > 0 ? (w * h) / area : 0;
};
const texto = (e) => String(e.textString ?? e.contents ?? '').replace(/\\[A-Za-z][^;\\]*;|[{}]/g, '').trim();
const r3 = (v) => Math.round(v * 1000) / 1000;

const base = LAMINAS[0].marco; // origen de la plantilla: esquina inferior izquierda de la primera lámina
const local = (x, y) => ({x: r3(x - base.x0), y: r3(y - base.y0)});
const modelo = origen.tables.blockTable.modelSpace.newIterator().toArray();
// Bordes del dibujo (bloques explotados) que no son horizontales: separan las casillas
// del rótulo, incluidas las que terminan en diagonal hacia el rombo de la lámina.
const itemsReferencia = aplanarModelo(modelo).items;
// Burbujas de ejes del expediente (círculos en la capa de ejes).
const burbujasReferencia = itemsReferencia.filter((it) => it.tipo === 'circulo' && /EJE/i.test(it.capa) && it.radio > 0.1);
const bordes = itemsReferencia
  .flatMap((it) => (it.tipo === 'linea' || it.tipo === 'poli' ? it.puntos.slice(0, -1).map((a, i) => [a, it.puntos[i + 1]]).concat(it.cerrada ? [[it.puntos.at(-1), it.puntos[0]]] : []) : []))
  .filter(([a, b]) => Math.abs(a.y - b.y) > 0.05 && Math.abs(a.y - b.y) > Math.abs(a.x - b.x) * 0.3);
// x donde los bordes cruzan la fila y (a la derecha de x0).
const cruces = (y, x0) => bordes.filter(([a, b]) => Math.min(a.y, b.y) <= y && Math.max(a.y, b.y) >= y)
  .map(([a, b]) => a.x + ((y - a.y) * (b.x - a.x)) / (b.y - a.y)).filter((x) => x > x0 + 0.05);
const verticales = bordes.filter(([a, b]) => Math.abs(a.x - b.x) < 0.005)
  .map(([a, b]) => ({x: (a.x + b.x) / 2, y0: Math.min(a.y, b.y), y1: Math.max(a.y, b.y)}));
const destino = new dm.AcDbDatabase();
destino.createDefaultData();

const config = {referencia: referencia.split(/[\\/]/).pop(), unidades: 'metros de dibujo (planos a escala x2 = 1/25)', escalaPlanos: 2, laminas: []};
const copiar = [];
for (const lamina of LAMINAS) {
  const {marco} = lamina;
  const propios = new Set(lamina.espacios.map((s) => s.bloque));
  const info = {codigo: lamina.codigo, plano: lamina.plano, marco: {...local(marco.x0, marco.y0), x1: r3(marco.x1 - base.x0), y1: r3(marco.y1 - base.y0)}, espacios: [], titulos: [], rotulo: []};
  const valores = [], etiquetas = [], propiasDeLamina = [];
  for (const e of modelo) {
    const b = extension(e);
    const tipo = String(e.dxfTypeName).toUpperCase();
    // Los bloques con geometría perdida lejos (c1…c4) se ubican por su punto de inserción.
    const p = e.position ?? e.location;
    const enLamina = dentro(b, marco) || (tipo === 'INSERT' && !propios.has(e.blockName) && solape(b, marco) >= 0.7) || (tipo === 'INSERT' && p && p.x >= marco.x0 - 40 && p.x <= marco.x1 && propios.has(e.blockName));
    if (!enLamina) continue;
    if (tipo === 'INSERT' && propios.has(e.blockName)) {
      const espacio = lamina.espacios.find((s) => s.bloque === e.blockName);
      const caja = dentro(b, marco, 2) ? b : null;
      info.espacios.push({id: espacio.id, titulo: espacio.titulo, caja: caja ? {...local(caja.min.x, caja.min.y), x1: r3(caja.max.x - base.x0), y1: r3(caja.max.y - base.y0)} : null, bloque: e.blockName});
      continue;
    }
    const t = texto(e);
    if ((tipo === 'MTEXT' || tipo === 'TEXT') && !CAPAS_DATOS.has(e.layer) && TITULO_PROYECTO.test(t)) {
      info.titulos.push({texto: t, ...local(p.x, p.y), alto: r3(e.height)});
      continue;
    }
    // Subrayados de los títulos (bloques anónimos largos y planos justo debajo del título).
    if (tipo === 'INSERT' && /^\*U/.test(e.blockName) && b && (b.max.x - b.min.x) > 5 && (b.max.y - b.min.y) < 0.3) continue;
    if (tipo === 'OLE2FRAME') continue; // logos incrustados
    // Secciones de viga del proyecto de referencia ("CORTE 1-1" de 0.25x0.30 junto a cada
    // pórtico): el agente dibuja la sección de su propia viga.
    if (tipo === 'INSERT' && BLOQUES_DEL_PROYECTO.has(e.blockName)) continue;
    if ((tipo === 'TEXT' || tipo === 'MTEXT') && (CAPAS_DATOS.has(e.layer) || /^E-\d+$/.test(t))) {
      // MTEXT se inserta por su esquina superior; el agente escribe desde la línea base.
      const arriba = tipo === 'MTEXT' && ![7, 8, 9].includes(e.attachmentPoint);
      valores.push({texto: t, x: p.x, y: arriba ? p.y - e.height : p.y, alto: e.height, capa: e.layer});
      continue;
    }
    if ((tipo === 'TEXT' || tipo === 'MTEXT') && ETIQUETAS_ROTULO.some(([re]) => re.test(t)) && /:/.test(t)) etiquetas.push({texto: t, x: p.x, y: p.y, alto: e.height});
    copiar.push(e);
    propiasDeLamina.push(e);
  }
  for (const espacio of lamina.espacios) {
    if (espacio.caja && !info.espacios.some((s) => s.id === espacio.id)) {
      const c = espacio.caja;
      info.espacios.push({id: espacio.id, titulo: espacio.titulo, caja: {...local(c.x0, c.y0), x1: r3(c.x1 - base.x0), y1: r3(c.y1 - base.y0)}, bloque: espacio.bloque});
    }
  }
  // Dónde puso el ingeniero las burbujas de ejes de cada plano: el agente ubica su
  // plano con el mismo centro de grilla (así ocupa el lugar del original, a su escala).
  for (const espacio of info.espacios) {
    if (!espacio.caja || /^cuadro/.test(espacio.id)) continue;
    const c = {x0: espacio.caja.x + base.x0 - 0.3, y0: espacio.caja.y + base.y0 - 0.3, x1: espacio.caja.x1 + base.x0 + 0.3, y1: espacio.caja.y1 + base.y0 + 0.3};
    const dentroB = burbujasReferencia.filter((b) => b.centro.x > c.x0 && b.centro.x < c.x1 && b.centro.y > c.y0 && b.centro.y < c.y1);
    if (dentroB.length < 2) continue;
    espacio.ejes = {
      x: r3(Math.min(...dentroB.map((b) => b.centro.x - b.radio)) - base.x0), y: r3(Math.min(...dentroB.map((b) => b.centro.y - b.radio)) - base.y0),
      x1: r3(Math.max(...dentroB.map((b) => b.centro.x + b.radio)) - base.x0), y1: r3(Math.max(...dentroB.map((b) => b.centro.y + b.radio)) - base.y0),
    };
  }
  // Anotaciones sueltas que caen enteras dentro de un plano del proyecto (llamadas de
  // acero, cotas de la referencia) son de ese plano: no van a la plantilla.
  const enEspacio = (e) => {
    const b = extension(e);
    return b && info.espacios.some((s) => s.caja && b.min.x - base.x0 >= s.caja.x - 0.05 && b.max.x - base.x0 <= s.caja.x1 + 0.05 && b.min.y - base.y0 >= s.caja.y - 0.05 && b.max.y - base.y0 <= s.caja.y1 + 0.05);
  };
  const sueltas = new Set(propiasDeLamina.filter(enEspacio));
  if (sueltas.size) {
    console.log(`  ${lamina.codigo}: ${sueltas.size} anotaciones de los planos de referencia quitadas (${[...sueltas].map((e) => String(e.textString ?? e.contents ?? e.dxfTypeName).replace(/\s+/g, ' ').slice(0, 30)).join(' | ')})`);
    for (const lista of [copiar, propiasDeLamina]) lista.splice(0, lista.length, ...lista.filter((e) => !sueltas.has(e)));
  }
  // Lo que genera el agente no debe pisar los detalles de la plantilla: cada espacio se
  // recorta por los detalles que se meten en él (se corta por el lado que deja más área).
  const cajasPlantilla = propiasDeLamina.map((e) => ({e, b: extension(e)})).filter((x) => x.b)
    .map(({e, b}) => ({e, x0: b.min.x - base.x0, y0: b.min.y - base.y0, x1: b.max.x - base.x0, y1: b.max.y - base.y0}))
    .filter((b) => b.x1 - b.x0 < 0.6 * (marco.x1 - marco.x0) && b.y1 - b.y0 < 0.6 * (marco.y1 - marco.y0));
  for (const espacio of info.espacios) {
    if (!espacio.caja) continue;
    let c = {x0: espacio.caja.x, y0: espacio.caja.y, x1: espacio.caja.x1, y1: espacio.caja.y1};
    for (let vuelta = 0; vuelta < 30; vuelta++) {
      const pisa = cajasPlantilla.find((b) => Math.min(c.x1, b.x1) - Math.max(c.x0, b.x0) > 0.05 && Math.min(c.y1, b.y1) - Math.max(c.y0, b.y0) > 0.05);
      if (!pisa) break;
      if (process.env.DEBUG_PLANTILLA) console.log('    pisa', espacio.id, [pisa.x0, pisa.y0, pisa.x1, pisa.y1].map((v) => v.toFixed(2)).join(' '), pisa.e?.dxfTypeName, pisa.e?.blockName ?? '', pisa.e?.layer, String(pisa.e?.textString ?? pisa.e?.contents ?? '').slice(0, 40));
      const opciones = [{...c, x1: pisa.x0 - 0.1}, {...c, x0: pisa.x1 + 0.1}, {...c, y1: pisa.y0 - 0.1}, {...c, y0: pisa.y1 + 0.1}].filter((o) => o.x1 - o.x0 > 1 && o.y1 - o.y0 > 1);
      if (!opciones.length) break;
      c = opciones.sort((a, b) => (b.x1 - b.x0) * (b.y1 - b.y0) - (a.x1 - a.x0) * (a.y1 - a.y0))[0];
    }
    if (c.x0 !== espacio.caja.x || c.x1 !== espacio.caja.x1 || c.y0 !== espacio.caja.y || c.y1 !== espacio.caja.y1) console.log(`  ${lamina.codigo} ${espacio.id}: recortado para no pisar la plantilla`);
    espacio.caja = {x: r3(c.x0), y: r3(c.y0), x1: r3(c.x1), y1: r3(c.y1)};
  }
  info.rotulo = camposDelRotulo(valores, etiquetas);
  config.laminas.push(info);
}

// Campos del rótulo: cada valor del expediente de referencia se nombra por la etiqueta
// que lo antecede ("REGIÓN :" → region) y se guarda con el ancho libre hasta la
// siguiente línea vertical del rótulo, para que el agente ajuste el texto a la casilla.
function camposDelRotulo(valores, etiquetas) {
  const campos = [];
  for (const v of valores) {
    let campo = /^E-\d+$/.test(v.texto) ? 'lamina' : /\bCIP\b/i.test(v.texto) ? 'cip' : /\bCUI\b/i.test(v.texto) ? 'cui' : null;
    if (!campo) {
      const candidatas = etiquetas.filter((e) => e.y >= v.y - 0.06 && e.x <= v.x + 0.3 && e.y - v.y < 0.6);
      const mejor = candidatas.sort((a, b) => ((a.y - v.y) * 3 + Math.abs(v.x - a.x)) - ((b.y - v.y) * 3 + Math.abs(v.x - b.x)))[0];
      campo = mejor ? ETIQUETAS_ROTULO.find(([re]) => re.test(mejor.texto))[1] : 'entidad';
    }
    const ya = campos.find((c) => c.campo === campo);
    if (ya && ['proyecto', 'plano', 'entidad'].includes(campo)) { // varias líneas: se guarda la de arriba y el interlineado
      ya.lineas++;
      ya.interlineado = r3(Math.abs(ya.y + base.y0 - v.y) / (ya.lineas - 1));
      if (v.y > ya.y + base.y0) Object.assign(ya, local(v.x, v.y));
      ya.x = Math.min(ya.x, r3(v.x - base.x0));
      continue;
    }
    const nombre = ya ? `${campo}${campos.filter((c) => c.campo.startsWith(campo)).length + 1}` : campo;
    campos.push({campo: nombre, ...local(v.x, v.y), alto: r3(v.alto), capa: v.capa, lineas: 1, interlineado: r3(v.alto * 1.5)});
  }
  // Ancho libre de cada casilla: hasta la línea vertical más cercana a la derecha que
  // cruza sus renglones, o la siguiente etiqueta de la fila. La casilla del plano termina
  // en diagonal (hacia el rombo de la lámina): ahí manda la vertical de la casilla de abajo.
  for (const c of campos) {
    const x = c.x + base.x0, yTop = c.y + base.y0, yBot = yTop - (c.lineas - 1) * c.interlineado - c.alto * 0.2;
    const abajo = c.campo === 'plano' ? 0.45 : 0;
    const derecha = [
      ...verticales.filter((s) => s.x > x + 0.05 && s.y0 <= yTop + 0.1 && s.y1 >= yBot - abajo).map((s) => s.x),
      // Bordes (también inclinados) que cruzan el renglón de arriba (con su altura) y el de abajo.
      ...cruces(yTop + c.alto, x), ...cruces(yTop, x), ...cruces(yBot, x),
      ...etiquetas.filter((e) => e.x > x + 0.1 && Math.abs(e.y - yTop) < 0.12).map((e) => e.x),
    ];
    c.ancho = c.campo === 'cui' ? 0.9 : r3((derecha.length ? Math.min(...derecha) : x + 2) - x - 0.1); // el CUI se extiende sobre el rombo
    // Aire bajo la etiqueta de encima ("PLANO:", "ESPECIALISTA:"): el valor no la roza.
    const encima = etiquetas.filter((e) => e.y - yTop > c.alto * 0.6 && Math.abs(e.x - x) < 0.6 && e.y - (yTop + c.alto) < 0.05);
    if (encima.length) c.y = r3(Math.min(...encima.map((e) => e.y)) - 0.05 - c.alto - base.y0);
  }
  return campos;
}

// La escala bajo cada título ("ESC: 1/25") la escribe el agente con la escala real del dibujo.
const titulosAbs = config.laminas.flatMap((l) => l.titulos.map((t) => ({x: t.x + base.x0, y: t.y + base.y0})));
const esEscalaDeTitulo = (e) => {
  const tipo = String(e.dxfTypeName).toUpperCase();
  if (tipo !== 'TEXT' && tipo !== 'MTEXT') return false;
  if (!/^ESC\s*\.?\s*:?\s*1\s*\/\s*\d+$/i.test(texto(e))) return false;
  const p = e.position ?? e.location;
  return titulosAbs.some((t) => p.y < t.y && p.y > t.y - 1.2 && Math.abs(p.x - t.x) < 1.5);
};
const quitadas = copiar.filter(esEscalaDeTitulo).length;
copiar.splice(0, copiar.length, ...copiar.filter((e) => !esEscalaDeTitulo(e)));
console.log(`Escalas de título quitadas: ${quitadas}`);
const resultado = copiarDesdePlantilla({origen, destino, entidades: copiar, desplazamiento: {x: -base.x0, y: -base.y0}, prefijo: 'PLT_', dm});
// Extensión real de las láminas (sin esto el visor encuadra desde el origen).
const ultima = config.laminas.at(-1).marco;
destino.extmin = {x: 0, y: Math.min(0, ultima.y), z: 0};
destino.extmax = {x: ultima.x1, y: Math.max(config.laminas[0].marco.y1, ultima.y1), z: 0};
mkdirSync(salida, {recursive: true});
// Los MTEXT con fuentes SHX del autor (romans, simplex…) se ven más anchos en el visor y
// partían en lugares raros: se les da 35 % más de ancho de párrafo. Los de Arial NO: el
// visor tiene Arial (y las angostas pasan a Arial x0.82), y ensancharlos hacía que un
// texto centrado invadiera la celda vecina (cuadro de viguetas), cruzara de columna
// (especificaciones técnicas) o se saliera de la lámina (título de recubrimientos), como
// se vio en el visor real con ver-en-visor.mjs.
let mtexts = 0, directrices = 0;
const fuenteDe = (e) => String(destino.tables.textStyleTable.getAt(e.styleName)?.fileName ?? '');
const ensanchar = (lista) => { for (const e of lista) if (String(e.dxfTypeName).toUpperCase() === 'MTEXT' && e.width > 0 && !/arial|swiss|^$/i.test(fuenteDe(e))) { e.width *= 1.35; mtexts++; } };
// Directrices (MULTILEADER) de un detalle: su letra no pasa la del texto más alto del
// mismo detalle (venían a 0.13 junto a textos de 0.05–0.075 y se encimaban).
const igualarDirectrices = (lista) => {
  const altos = lista.filter((e) => ['MTEXT', 'TEXT'].includes(String(e.dxfTypeName).toUpperCase()) && e.height > 0).map((e) => e.height);
  if (!altos.length) return;
  const tope = Math.max(...altos);
  for (const e of lista) {
    if (String(e.dxfTypeName).toUpperCase() !== 'MULTILEADER') continue;
    const h = e.textHeight ?? e._textHeight;
    if (!(h > tope * 1.05)) continue;
    if ('textHeight' in e) e.textHeight = tope; else e._textHeight = tope;
    if (e._landingGap > tope) e._landingGap = tope * 0.5;
    directrices++;
  }
};
// Directrices (MULTILEADER) → líneas + MTEXT: el visor dibuja el texto de las directrices
// con otro tamaño que el guardado (0.05 se veía como 0.13) y se encimaba con los textos
// del detalle. Como líneas y MTEXT se ven igual en el visor y en AutoCAD.
let explotadas = 0;
const explotarDirectrices = (registro) => {
  for (const e of registro.newIterator().toArray()) {
    if (String(e.dxfTypeName).toUpperCase() !== 'MULTILEADER') continue;
    const contenido = e._mtextContent;
    const nuevas = [];
    if (contenido?.text) {
      const mt = new dm.AcDbMText();
      mt.contents = contenido.text;
      mt.height = e._textHeight > 0 ? e._textHeight : 0.05;
      mt.location = {x: contenido.anchorPoint.x, y: contenido.anchorPoint.y, z: 0};
      mt.attachmentPoint = e._textAttachmentPoint || 1;
      if (e._textWidth > 0) mt.width = e._textWidth * 1.35;
      nuevas.push(mt);
    }
    for (const lider of e._leaders ?? []) {
      const fin = lider.lastLeaderLinePoint;
      if (!fin) continue;
      for (const linea of lider.leaderLines ?? []) {
        const pts = [...(linea.vertices ?? []), fin];
        if (pts.length < 2) continue;
        const pl = new dm.AcDbPolyline();
        pts.forEach((q, i) => pl.addVertexAt(i, new dm.AcGePoint2d(q.x, q.y)));
        nuevas.push(pl);
      }
      const d = lider.doglegVector, l = lider.doglegLength ?? e._doglegLength ?? 0;
      if (d && l > 0) nuevas.push(new dm.AcDbLine({x: fin.x, y: fin.y, z: 0}, {x: fin.x + d.x * l, y: fin.y + d.y * l, z: 0}));
    }
    if (!nuevas.length) continue;
    for (const n of nuevas) { n.layer = e.layer; registro.appendEntity(n); }
    registro.removeEntity(e.objectId);
    explotadas++;
  }
};
for (const r of [destino.tables.blockTable.modelSpace, ...destino.tables.blockTable.newIterator()]) explotarDirectrices(r);
console.log(`Directrices convertidas a líneas + texto: ${explotadas}`);

// MTEXT simples de varios renglones → un MTEXT por renglón (misma capa, estilo, alto y
// alineación; interlineado 1.667 h como AutoCAD). El visor a veces deja "\P" literal
// (p. ej. "ESCALA:\P1/25" anotativo); un renglón suelto siempre lo dibuja bien.
let partidos = 0;
// Párrafo centrado o a la derecha (\pxqc; \pxqr;): el visor no interpreta el código y el
// texto quedaba a la izquierda de su caja, sobre la celda vecina (cuadro de viguetas: "4Ø3/8"
// encima de "Refuerzo y estribaje"). Se pasa al anclaje equivalente del MTEXT.
let parrafos = 0;
const alinearParrafos = (registro) => {
  for (const e of registro.newIterator().toArray()) {
    if (String(e.dxfTypeName).toUpperCase() !== 'MTEXT') continue;
    const contenido = String(e.contents ?? '');
    const m = /\\p[^;\\]*q([cr])[^;\\]*;/.exec(contenido);
    if (!m || !(e.width > 0)) continue;
    const att = e.attachmentPoint || 1, columna = (att - 1) % 3;
    if (columna !== 0) continue; // ya anclado al centro o a la derecha
    const dx = m[1] === 'c' ? e.width / 2 : e.width;
    const dir = e.direction ?? {x: Math.cos(e.rotation ?? 0), y: Math.sin(e.rotation ?? 0)};
    const p = e.location ?? e.position;
    e.location = {x: p.x + dir.x * dx, y: p.y + dir.y * dx, z: p.z ?? 0};
    e.attachmentPoint = att + (m[1] === 'c' ? 1 : 2);
    e.contents = contenido.replace(/\\p[^;\\]*;/g, '');
    parrafos++;
  }
};
for (const r of [destino.tables.blockTable.modelSpace, ...destino.tables.blockTable.newIterator()]) alinearParrafos(r);
console.log(`Párrafos centrados o a la derecha pasados a anclaje: ${parrafos}`);

// Ancho de un renglón en el visor: medida de anchoTexto (calibrada en el visor) con un 15 %
// de margen; las angostas se miden a ancho completo (el visor no siempre las angosta).
const anchoRenglon = (t, e) => anchoTexto(t, e.height) * 1.15;
// Un renglón del párrafo en el visor: {t, escala}. Si cabe, igual. Si se pasa hasta un 30 %,
// se achica su letra para que quepa en uno (el párrafo no crece ni pisa al siguiente: texto
// del ladrillo de 18 huecos). Si se pasa más (también lo cortaba AutoCAD), se corta en palabras.
const cortar = (t, e) => {
  const r = e.width > 0 ? anchoRenglon(t, e) / e.width : 0;
  if (r <= 1) return [{t, escala: 1}];
  if (r <= 1.3) return [{t, escala: 1 / r}];
  const partes = [];
  let actual = '';
  for (const p of t.split(/\s+/).filter(Boolean)) {
    const prueba = actual ? `${actual} ${p}` : p;
    if (actual && anchoRenglon(prueba, e) > e.width) { partes.push(actual); actual = p; } else actual = prueba;
  }
  if (actual) partes.push(actual);
  return partes.map((x) => ({t: x, escala: Math.min(1, e.width / anchoRenglon(x, e))}));
};
const partirRenglones = (registro) => {
  for (const e of registro.newIterator().toArray()) {
    if (String(e.dxfTypeName).toUpperCase() !== 'MTEXT') continue;
    const contenido = String(e.contents ?? '').replace(/\\p[^;\\]*;/g, ''); // sin códigos de párrafo (\pxqc;)
    if (!contenido.includes('\\P') || /[{}]|\\[A-OQ-Za-z]/.test(contenido.replace(/\\P/g, ''))) continue;
    // Los renglones que no caben en el ancho del párrafo se cortan aquí: el visor, al cortar
    // él un renglón, no corre el siguiente y lo pisa (especificaciones técnicas: "Presion
    // admisible… antes de su ejecucion." debajo de "Parámetros sísmicos").
    const renglones = contenido.split('\\P').map((t) => t.trim()).flatMap((t) => (t ? cortar(t, e) : [{t: '', escala: 1}]));
    const h = e.height > 0 ? e.height : 0.1, paso = h * 1.667 * (e.lineSpacingFactor > 0 ? e.lineSpacingFactor : 1);
    const att = e.attachmentPoint || 1, fila = Math.ceil(att / 3); // 1 arriba, 2 al medio, 3 abajo
    const n = renglones.length;
    const dir = e.direction ?? {x: Math.cos(e.rotation ?? 0), y: Math.sin(e.rotation ?? 0)};
    const abajo = {x: dir.y, y: -dir.x}; // perpendicular hacia abajo del texto
    const p = e.location ?? e.position;
    renglones.forEach(({t, escala}, i) => {
      if (!t) return;
      // Desplazamiento del renglón i según dónde está anclado el bloque de texto.
      const k = fila === 1 ? i : fila === 2 ? i - (n - 1) / 2 : i - (n - 1);
      const nt = new dm.AcDbMText();
      nt.contents = t;
      nt.height = h * escala;
      nt.location = {x: p.x + abajo.x * paso * k, y: p.y + abajo.y * paso * k, z: 0};
      nt.attachmentPoint = att;
      // Sin ancho de párrafo: el corte ya está hecho aquí; con ancho, el visor (letra algo
      // más ancha) lo volvería a cortar y el renglón pisaría al siguiente.
      if (e.rotation) { nt.rotation = e.rotation; nt.direction = {x: dir.x, y: dir.y, z: 0}; }
      if (e.styleName) nt.styleName = e.styleName;
      nt.layer = e.layer;
      if (e.color) nt.color = e.color.clone ? e.color.clone() : e.color;
      registro.appendEntity(nt);
    });
    registro.removeEntity(e.objectId);
    partidos++;
  }
};
for (const r of [destino.tables.blockTable.modelSpace, ...destino.tables.blockTable.newIterator()]) partirRenglones(r);
console.log(`MTEXT de varios renglones partidos: ${partidos}`);

// MTEXT con alturas relativas por renglón ("{\LESPECIFICACIÓN\P\H0.066667x;\P\H15x;LADRILLO -
// MORTERO}\P{\H0.0666x;ESCALA 1/20}"): el visor real las interpreta distinto que AutoCAD y el
// título crece hacia arriba hasta pisar el dibujo del ladrillo (visto con ver-en-visor.mjs).
// Se parte en un MTEXT por renglón con su altura absoluta, apilados como AutoCAD (1.667 h),
// respetando el anclaje del original. El subrayado (\L…\l) se conserva.
function renglonesConAltura(contenido, hBase) {
  const lineas = [{partes: [], h: 0}];
  const pila = [];
  let h = hBase, sub = false;
  const agrega = (t) => { const l = lineas.at(-1); l.partes.push({t, sub}); if (t.trim()) l.h = Math.max(l.h, h); };
  for (let i = 0; i < contenido.length; i++) {
    const c = contenido[i];
    if (c === '{') { pila.push({h, sub}); continue; }
    if (c === '}') { ({h, sub} = pila.pop() ?? {h, sub}); continue; }
    if (c !== '\\') { agrega(c); continue; }
    const k = contenido[i + 1];
    if (k === 'P') { if (!lineas.at(-1).h) lineas.at(-1).h = h; lineas.push({partes: [], h: 0}); i++; continue; }
    if (k === 'L') { sub = true; i++; continue; }
    if (k === 'l') { sub = false; i++; continue; }
    if (k === '\\' || k === '{' || k === '}') { agrega(k); i++; continue; }
    const fin = contenido.indexOf(';', i);
    if (fin < 0) { agrega(contenido.slice(i)); break; }
    const codigo = contenido.slice(i + 1, fin);
    const m = /^H([\d.]+)(x?)$/i.exec(codigo);
    if (m) h = m[2] ? h * Number(m[1]) : Number(m[1]);
    i = fin; // \f, \C, \W, \Q, \T, \A…: el visor usa los del estilo
  }
  if (!lineas.at(-1).h) lineas.at(-1).h = h;
  return lineas.map((l) => {
    let texto = '', abierto = false;
    for (const p of l.partes) { if (p.sub !== abierto) { texto += p.sub ? '\\L' : '\\l'; abierto = p.sub; } texto += p.t; }
    if (abierto) texto += '\\l';
    return {texto: texto.trim(), h: l.h};
  });
}
let alturasRelativas = 0;
const partirAlturas = (registro) => {
  for (const e of registro.newIterator().toArray()) {
    if (String(e.dxfTypeName).toUpperCase() !== 'MTEXT') continue;
    const contenido = String(e.contents ?? '');
    if (!/\\H[\d.]+x?;/i.test(contenido)) continue;
    const h0 = e.height > 0 ? e.height : 0.1;
    const lineas = renglonesConAltura(contenido, h0);
    if (lineas.length < 2 && !/\\H/i.test(contenido)) continue;
    const att = e.attachmentPoint || 1, columna = (att - 1) % 3, fila = Math.ceil(att / 3);
    const pasos = lineas.map((l) => l.h * 1.667);
    const alto = pasos.slice(0, -1).reduce((s, v) => s + v, 0) + lineas.at(-1).h;
    const p = e.location ?? e.position;
    const dir = e.direction ?? {x: Math.cos(e.rotation ?? 0), y: Math.sin(e.rotation ?? 0)};
    const abajo = {x: dir.y, y: -dir.x};
    const arriba0 = fila === 1 ? 0 : fila === 2 ? -alto / 2 : -alto; // desplazamiento del borde superior respecto del anclaje
    let acumulado = 0;
    lineas.forEach((l, i) => {
      const d = arriba0 + acumulado;
      acumulado += pasos[i];
      if (!l.texto.replace(/\\[Ll]/g, '').trim()) return; // renglón de espacio
      const nt = new dm.AcDbMText();
      nt.contents = l.texto;
      nt.height = l.h;
      nt.location = {x: p.x + abajo.x * d, y: p.y + abajo.y * d, z: 0};
      nt.attachmentPoint = 1 + columna; // anclado arriba, con la alineación horizontal del original
      if (e.width > 0) nt.width = e.width;
      if (e.rotation) { nt.rotation = e.rotation; nt.direction = {x: dir.x, y: dir.y, z: 0}; }
      if (e.styleName) nt.styleName = e.styleName;
      nt.layer = e.layer;
      if (e.color) nt.color = e.color.clone ? e.color.clone() : e.color;
      registro.appendEntity(nt);
    });
    registro.removeEntity(e.objectId);
    alturasRelativas++;
  }
};
for (const r of [destino.tables.blockTable.modelSpace, ...destino.tables.blockTable.newIterator()]) partirAlturas(r);
console.log(`MTEXT con alturas relativas partidos por renglón: ${alturasRelativas}`);
for (const lista of [destino.tables.blockTable.modelSpace.newIterator().toArray(), ...[...destino.tables.blockTable.newIterator()].map((r) => r.newIterator().toArray())]) { ensanchar(lista); igualarDirectrices(lista); }
console.log(`MTEXT ensanchados: ${mtexts}; directrices ajustadas: ${directrices}`);
// Contornos de achurado con un tramo de largo cero (p. ej. "Tierra de chacra" del corte):
// el visor no los puede rellenar ("PolyBool: Zero-length segment") y avisa en la consola
// cada vez que se inserta el bloque. Se quita el tramo nulo; el contorno sigue cerrado.
const largo = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
let tramosNulos = 0;
for (const registro of [destino.tables.blockTable.modelSpace, ...destino.tables.blockTable.newIterator()]) {
  for (const e of registro.newIterator()) {
    const lazos = e.dxfTypeName === 'HATCH' ? e._geo?._loops : null;
    if (!lazos) continue;
    lazos.forEach((lazo, i) => {
      if (!lazo.curves) return;
      const curvas = lazo.curves.filter((c) => !(c.startPoint && c.endPoint && /Line/.test(c.constructor.name) && largo(c.startPoint, c.endPoint) < 1e-6));
      if (curvas.length === lazo.curves.length) return;
      tramosNulos += lazo.curves.length - curvas.length;
      lazos[i] = new dm.AcGeLoop2d(curvas);
    });
  }
}
console.log(`Tramos de largo cero quitados de contornos de achurado: ${tramosNulos}`);

// Estilos con fuente angosta (Arial Narrow, Swiss condensada): el visor no tiene esas
// fuentes y las dibuja con Arial normal, ~20 % más ancha, y los textos se salen de las
// casillas (VIGA BORDE, CUADRO DE VIGUETAS). Pasan a Arial con factor de ancho 0.82:
// se ven igual en el visor y en AutoCAD.
const ANGOSTA = /^(arialn\w*|arial ?narrow|swissc\w*)(\.(ttf|shx))?$/i;
let estilosAngostos = 0;
for (const estilo of destino.tables.textStyleTable.newIterator()) {
  if (!ANGOSTA.test(String(estilo.fileName ?? '').trim())) continue;
  estilo.fileName = 'arial';
  estilo.xScale = (estilo.xScale > 0 ? estilo.xScale : 1) * 0.82;
  estilosAngostos++;
}
console.log(`Estilos de fuente angosta pasados a Arial x0.82: ${estilosAngostos}`);
const dxf = limpiarTextosDxf(await destino.dxfOut());
writeFileSync(resolve(salida, 'estructuras-laminas.dxf'), Buffer.from(dxf, 'latin1'));
writeFileSync(resolve(salida, 'estructuras-laminas.json'), JSON.stringify(config, null, 1));
console.log(`Plantilla: ${resultado.entidades} entidades, ${resultado.bloques} bloques (${resultado.fallidas} fallidas), ${(dxf.length / 1024).toFixed(0)} KB`);
for (const l of config.laminas) console.log(` ${l.codigo}: espacios ${l.espacios.map((s) => `${s.id}${s.caja ? '' : ' (sin caja)'}`).join(', ')}; títulos ${l.titulos.length}; campos de rótulo ${l.rotulo.map((r) => r.campo).join(',')}`);
