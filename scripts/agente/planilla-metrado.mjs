// Lector genérico de la planilla de metrados de estructuras del ingeniero (Excel).
//
// No supone columnas fijas: busca la fila de encabezados (ITEM, DESCRIPCIÓN, Und, Total,
// Sub Total y las columnas de metrado Lon./Área/Vol./Kg./Und.) y lee las partidas por su código
// (02.01.02…). Formatos que reconoce:
//   - una hoja por módulo ("Modulo 8", "MÓDULO 08"), con el total de cada partida;
//   - una hoja de un solo módulo con cualquier nombre ("Metrado", "Hoja1", "METRADO");
//   - una hoja con varios módulos: cada partida trae el total de todos y debajo un título por
//     módulo ("MODULO 01", "MODULO 02-A", "MODULO 5") con su subtotal o sus filas de detalle.
//     Las partes de un módulo (02-A, 02-B) se suman al módulo 2.
// Lo que no se puede asignar con certeza a un módulo se informa en `avisos` y no se cuenta.
//
// Las partidas se llevan a las CATEGORIAS comparables: por código cuando la planilla usa la
// codificación del despacho (la del metrado del agente), y si no, por la descripción.

import ExcelJS from 'exceljs';

export const sinAcentos = (t) => String(t ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '');
const norm = (t) => sinAcentos(t).toUpperCase().replace(/[´`’]/g, "'").replace(/\s+/g, ' ').trim();

// Categorías comparables: el mismo trabajo aunque el código cambie (platea = "zapata corrida"
// en la planilla del módulo 14; losa de cimentación en el resumen del despacho). El código es el
// del despacho (y del metrado del agente).
export const CATEGORIAS = [
  ['Excavación de la cimentación', /^02\.01\.02\.01\.0[13]$/],
  ['Relleno con material propio', /^02\.01\.03\.0[1-4]$/],
  ['Relleno con material de préstamo', /^02\.01\.03\.0[56]$/],
  ['Nivelación interior', /^02\.01\.04\.01$/],
  ['Eliminación de excedente', /^02\.01\.05\.02$/],
  ['Solado', /^02\.02\.01\.0[12]$/],
  ['Falso piso', /^02\.02\.02\.01$/],
  ['Cimiento corrido: concreto', /^02\.02\.03\.01$/],
  ['Cimiento corrido: encofrado', /^02\.02\.03\.02$/],
  ['Sobrecimiento: concreto', /^02\.02\.04\.01$/],
  ['Sobrecimiento: encofrado', /^02\.02\.04\.02$/],
  ['Cimentación: concreto', /^02\.03\.0[12]\.01$/],
  ['Cimentación: acero', /^02\.03\.0[12]\.02$/],
  ['Columnas: concreto', /^02\.03\.06\.01\.01$/],
  ['Columnas: encofrado', /^02\.03\.06\.01\.02$/],
  ['Columnas: acero', /^02\.03\.06\.01\.03$/],
  ['Vigas: concreto', /^02\.03\.07\.01\.01$/],
  ['Vigas: encofrado', /^02\.03\.07\.01\.02$/],
  ['Vigas: acero', /^02\.03\.07\.01\.03$/],
  ['Columnetas: concreto', /^02\.03\.08\.01$/],
  ['Columnetas: encofrado', /^02\.03\.08\.02$/],
  ['Columnetas: acero', /^02\.03\.08\.03$/],
  ['Losa aligerada: concreto', /^02\.03\.11\.01$/],
  ['Losa aligerada: encofrado', /^02\.03\.11\.02$/],
  ['Losa aligerada: acero', /^02\.03\.11\.03$/],
  ['Ladrillo de techo', /^02\.03\.11\.04$/],
  ['VSa: concreto', /^02\.03\.09\.01$/],
  ['VSa: encofrado', /^02\.03\.09\.02$/],
  ['VSa: acero', /^02\.03\.09\.03$/],
  ['Canaleta: concreto', /^02\.03\.10\.01$/],
  ['Canaleta: encofrado', /^02\.03\.10\.02$/],
  ['Canaleta: acero', /^02\.03\.10\.03$/],
  ['Correas metálicas', /^02\.04\.01\.01$/],
  ['Placas: concreto', /^02\.03\.05\.01\.01$/],
  ['Placas: encofrado', /^02\.03\.05\.01\.02$/],
  ['Placas: acero', /^02\.03\.05\.01\.03$/],
];

// Categoría por la descripción de la partida (para planillas con otra codificación).
// Devuelve null si la partida no corresponde a ninguna categoría o si es dudosa: curado,
// desencofrado aparte (el agente mide encofrado y desencofrado juntos), geomembrana, acarreo,
// montaje, vigas de cimentación, muros de contención y excavaciones (la planilla puede partir la
// misma zanja por tipo de terreno y sumarlas contaría dos veces).
export function categoriaPorDescripcion(descripcion, unidad = '') {
  const d = norm(descripcion), u = norm(unidad).toLowerCase().replace(/[.\s]/g, '');
  if (!d) return null;
  if (/ARMAD[OU]R?A? DE CORREA|^CORREAS? METALICA/.test(d)) return 'Correas metálicas';
  if (/DESENCOFRADO/.test(d) && !/ENCOFRADO Y DESENCOFRADO/.test(d)) return null;
  if (/CURADO|GEOME[MN]BRANA|ACARREO|MONTAJE|EXCAVACION|MUROS? DE CONTENCION|VIGAS? DE CIMENTACION|ANCLAJE|METALIC|JUNTA|COBERTURA|CUMBRERA/.test(d)) return null;
  if (/NIVELACION INTERIOR/.test(d)) return 'Nivelación interior';
  if (/^ELIMINACION DE MATERIAL EXCEDENTE/.test(d)) return 'Eliminación de excedente';
  if (/RELLENO/.test(d)) {
    if (/PRESTAMO/.test(d)) return !u || u === 'm3' ? 'Relleno con material de préstamo' : null;
    if (/PROPIO/.test(d)) return !u || u === 'm3' ? 'Relleno con material propio' : null;
    return null;
  }
  const tipo = /ENCOFRADO/.test(d) ? 'encofrado' : /^ACERO|\bACERO (EN|PARA)\b/.test(d) ? 'acero' : 'concreto';
  if (/SOLADO/.test(d)) return tipo === 'concreto' ? 'Solado' : null;
  if (/FALSO ?PISO/.test(d)) return tipo === 'concreto' ? 'Falso piso' : null;
  if (/SOBRECIMIENTO/.test(d)) return tipo === 'acero' ? null : `Sobrecimiento: ${tipo}`;
  if (/CIMIENTOS? CORRIDOS?/.test(d)) return tipo === 'acero' ? null : `Cimiento corrido: ${tipo}`;
  if (/LADRILLO.*TECHO/.test(d)) return 'Ladrillo de techo';
  if (/ZAPATA|LOSA DE CIMENTACION|PLATEA/.test(d)) return tipo === 'encofrado' ? null : `Cimentación: ${tipo}`;
  if (/COLUMNETA/.test(d)) return `Columnetas: ${tipo}`;
  // Viguetas de amarre (soleras de la albañilería): la partida "VSa" del despacho.
  if (/VIGUETA/.test(d)) return `VSa: ${tipo}`;
  if (/CANALETA/.test(d)) return /PLUVIAL/.test(d) ? null : `Canaleta: ${tipo}`;
  if (/LOSAS? ALIGERADA/.test(d)) return `Losa aligerada: ${tipo}`;
  if (/\bPLACAS?\b/.test(d)) return `Placas: ${tipo}`;
  if (/\bCOLUMNAS?\b/.test(d)) return `Columnas: ${tipo}`;
  if (/\bVIGAS?\b/.test(d)) return `Vigas: ${tipo}`;
  return null;
}

// ---------------------------------------------------------------------------------------------

const valor = (c) => {
  const x = c?.value;
  if (x === null || x === undefined) return null;
  if (typeof x === 'object' && !(x instanceof Date)) {
    if (x.result !== undefined) return x.result;
    if (x.richText) return x.richText.map((t) => t.text).join('');
    if (x.text !== undefined) return x.text;
    return null;
  }
  return x;
};
const numero = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const texto = (v) => (v === null || v === undefined ? '' : String(v).replace(/\s+/g, ' ').trim());
const ES_ITEM = /^\d{2}(\.\d{2})+$/;

// Número de módulo de un título de sección: "MODULO 01", "MÓDULO 02-A", "Modulo 5", "MODULO IV",
// "MODULO II-A (SEGUNDO NIVEL)", "MODULO 01 Primer Nivel". Lo que sigue al número solo puede
// ser el nivel (entre paréntesis o con NIVEL/PISO/TECHO/AZOTEA).
const ROMANOS = {I: 1, V: 5, X: 10, L: 50};
export function moduloDeTitulo(t) {
  const m = /^MODULO\s*[-_.:]?\s*(\d{1,3}|[IVXL]{1,6})(?:\s*[-_ ]\s*([A-Z])|([A-Z]))?(?![A-Z0-9])\s*(.*)$/.exec(norm(t));
  if (!m) return null;
  const resto = m[4].trim();
  if (resto && !/^\(.*\)$|NIVEL|PISO|TECHO|AZOTEA/.test(resto)) return null;
  m[2] = m[2] ?? m[3];
  const n = /^\d+$/.test(m[1]) ? Number(m[1]) : [...m[1]].reduce((a, ch, i, s) => (ROMANOS[ch] < (ROMANOS[s[i + 1]] ?? 0) ? a - ROMANOS[ch] : a + ROMANOS[ch]), 0);
  return n > 0 ? {numero: n, parte: m[2] ?? null} : null;
}

// Módulos que declara la cabecera "Modulo : Modulo 5 y 6" / "11" / "GENERAL".
function modulosDeCabecera(t) {
  const s = norm(t);
  if (!s || /GENERAL/.test(s)) return [];
  const nums = [...s.replace(/MODULOS?/g, ' ').matchAll(/(\d{1,3})/g)].map((m) => Number(m[1])).filter((n) => n > 0);
  return [...new Set(nums)];
}

// Fila de encabezados y columnas de la hoja (null si no tiene forma de planilla de metrado).
export function columnasDeHoja(ws) {
  const limite = Math.min(ws.rowCount, 60);
  for (let i = 1; i <= limite; i++) {
    const fila = ws.getRow(i);
    const col = {};
    fila.eachCell((c, j) => {
      const t = norm(valor(c));
      if (col.item === undefined && /^ITEM$/.test(t)) col.item = j;
      else if (col.descripcion === undefined && /^DESCRIPCION/.test(t)) col.descripcion = j;
      else if (col.unidad === undefined && /^(UND|UNID|UNIDAD|UNIT)\.?$/.test(t)) col.unidad = j;
      else if (col.subtotal === undefined && /^SUB ?-?TOTAL$/.test(t)) col.subtotal = j;
      else if (col.total === undefined && /^(TOTAL|METRADO TOTAL|TOTAL PARCIAL|PARCIAL)$/.test(t) && j > (col.descripcion ?? 0)) col.total = j;
    });
    if (col.item === undefined || col.descripcion === undefined || col.total === undefined) continue;
    // Columnas de metrado (Lon./Área/Vol./Kg./Und.) en esta fila o en la siguiente.
    col.metrado = {};
    for (const k of [i, i + 1]) ws.getRow(k).eachCell((c, j) => {
      if (j <= col.descripcion || j === col.unidad || j >= col.total || (col.subtotal && j >= col.subtotal)) return;
      const t = norm(valor(c)).replace(/\./g, '');
      const clave = /^(LON|LONG|LONGITUD|ML)$/.test(t) ? 'm' : /^(AREA|M2)$/.test(t) ? 'm2' : /^(VOL|VOLUMEN|M3)$/.test(t) ? 'm3' : /^(KG|PESO)$/.test(t) ? 'kg' : /^(UND|UNID|PZA)$/.test(t) ? 'und' : null;
      if (clave && col.metrado[clave] === undefined) col.metrado[clave] = j;
    });
    col.filaEncabezado = i;
    return col;
  }
  return null;
}

const UNIDAD = (u) => {
  const t = norm(u).toLowerCase().replace(/[.\s]/g, '').replace('²', '2').replace('³', '3');
  return /^(m3|mt3)$/.test(t) ? 'm3' : /^(m2|mt2)$/.test(t) ? 'm2' : /^(kg|kgs|kgf)$/.test(t) ? 'kg' : /^(m|ml|mt)$/.test(t) ? 'm' : /^(und|u|unid|pza|glb)$/.test(t) ? 'und' : t;
};

// Valor de una sección (o de las filas de una partida sin secciones): el subtotal si lo escribió
// el ingeniero; si no, la suma de las filas de detalle en la columna de la unidad (y si esa
// columna está vacía, en la única columna de metrado que tenga números).
// Una sección partida por niveles (varios títulos seguidos del mismo módulo) vale la suma de los
// subtotales escritos; si ninguno lo tiene, la suma del detalle de todos.
function valorDeSeccion(sec, unidad) {
  if (sec.subtotales.length) return sec.subtotales.reduce((s, v) => s + v, 0);
  const porColumna = {};
  for (const f of sec.filas) for (const [k, v] of Object.entries(f)) if (v !== null) (porColumna[k] ??= []).push(v);
  const clave = porColumna[unidad] ? unidad : Object.keys(porColumna).length === 1 ? Object.keys(porColumna)[0] : null;
  return clave ? porColumna[clave].reduce((s, v) => s + v, 0) : null;
}

// Lee las partidas de una hoja con sus secciones por módulo.
export function leerHoja(ws) {
  const col = columnasDeHoja(ws);
  if (!col) return null;
  let cabecera = [];
  for (let i = 1; i < col.filaEncabezado; i++) {
    const celdas = [];
    ws.getRow(i).eachCell((c) => celdas.push(texto(valor(c))));
    const k = celdas.findIndex((t) => /^M[O]DULO\s*:?$/.test(norm(t)));
    if (k >= 0) cabecera = modulosDeCabecera(celdas.slice(k + 1).find((t) => t && !/^:$/.test(t)) ?? '');
  }
  const partidas = [];
  let actual = null, seccion = null;
  const metradoDeFila = (r) => {
    const out = {};
    for (const [k, j] of Object.entries(col.metrado)) out[k] = numero(valor(r.getCell(j)));
    return out;
  };
  ws.eachRow((r, i) => {
    if (i <= col.filaEncabezado + 1) return;
    // Algunos ítems vienen con coma (02.03.06,01,01): mismo código.
    const item = texto(valor(r.getCell(col.item))).replace(/,/g, '.');
    const descripcion = texto(valor(r.getCell(col.descripcion)));
    if (ES_ITEM.test(item)) {
      actual = {item, descripcion, unidad: UNIDAD(valor(r.getCell(col.unidad ?? 0))), total: numero(valor(r.getCell(col.total))),
        subtotal: col.subtotal ? numero(valor(r.getCell(col.subtotal))) : null, secciones: [], filas: []};
      partidas.push(actual); seccion = null;
      return;
    }
    if (!actual) return;
    const mod = moduloDeTitulo(descripcion);
    if (mod) {
      const subtotal = col.subtotal ? numero(valor(r.getCell(col.subtotal))) : numero(valor(r.getCell(col.total)));
      if (!seccion || seccion.numero !== mod.numero || seccion.parte !== mod.parte) {
        seccion = {...mod, titulo: descripcion, subtotales: [], filas: []};
        actual.secciones.push(seccion);
      }
      if (subtotal !== null) seccion.subtotales.push(subtotal);
    }
    const m = metradoDeFila(r);
    if (Object.values(m).some((v) => v !== null)) (seccion ?? actual).filas.push(m);
  });
  // Módulos de las secciones, por cuántas partidas los traen. Un título suelto de otro módulo
  // (copiado por error) no convierte la hoja en una de varios módulos.
  const cuenta = new Map();
  for (const p of partidas) for (const n of new Set(p.secciones.map((s) => s.numero))) cuenta.set(n, (cuenta.get(n) ?? 0) + 1);
  const conSecciones = partidas.filter((p) => p.secciones.length).length;
  const modulosSecciones = [...cuenta].filter(([, c]) => c >= Math.max(2, 0.2 * conSecciones)).map(([n]) => n).sort((a, b) => a - b);
  const varios = cabecera.length >= 2 || (cabecera.length !== 1 && modulosSecciones.length >= 2);
  return {hoja: ws.name, columnas: col, cabecera, modulosSecciones, conSeccion: [...cuenta.keys()], varios, partidas};
}

// Totales de un módulo en una hoja leída. Devuelve {formato, partidas, avisos}.
export function totalesDelModulo(lectura, modulo) {
  const avisos = [];
  const varios = lectura.varios;
  const partidas = [];
  if (!varios) {
    for (const p of lectura.partidas) if (p.total !== null) partidas.push({item: p.item, descripcion: p.descripcion, unidad: p.unidad, total: p.total});
    return {formato: 'un módulo por hoja', partidas, avisos};
  }
  for (const p of lectura.partidas) {
    if (!p.secciones.length) {
      if (p.total !== null && p.total !== 0) avisos.push(`${p.item} sin desglose por módulo (total ${p.total.toFixed(2)}): no se cuenta`);
      continue;
    }
    const mias = p.secciones.filter((s) => s.numero === modulo);
    if (!mias.length) continue;
    const valores = mias.map((s) => valorDeSeccion(s, p.unidad));
    if (valores.some((v) => v === null)) { avisos.push(`${p.item} módulo ${modulo}: sección sin subtotal ni detalle legible`); continue; }
    partidas.push({item: p.item, descripcion: p.descripcion, unidad: p.unidad, total: valores.reduce((s, v) => s + v, 0),
      ...(mias.length > 1 ? {partes: mias.map((s) => s.titulo)} : {})});
  }
  return {formato: 'varios módulos en una hoja', partidas, avisos};
}

// Lee la planilla (libro de ExcelJS ya cargado) para un módulo. Elige la hoja:
//  1) la que se llama como el módulo; 2) la que tiene secciones de ese módulo; 3) la que declara
//  ese módulo en la cabecera; 4) la única hoja de metrado visible. Devuelve {error} si no hay.
export function leerPlanillaMetrado(libro, {modulo = null, hoja = null} = {}) {
  let ws = hoja ? libro.getWorksheet(hoja) : null;
  if (hoja && !ws) return {error: `no existe la hoja "${hoja}"`};
  let lectura = ws ? leerHoja(ws) : null;
  if (!ws) {
    const porNombre = modulo ? libro.worksheets.find((w) => new RegExp(`m[oó]dulo\\s*0*${modulo}\\b`, 'i').test(sinAcentos(w.name))) : null;
    if (porNombre) lectura = leerHoja(porNombre);
    if (!lectura) {
      const candidatas = libro.worksheets.filter((w) => w.state !== 'hidden' && w.state !== 'veryHidden' && !/resumen|general/i.test(w.name))
        .map(leerHoja).filter((l) => l && l.partidas.some((p) => p.total !== null || p.secciones.length));
      lectura = (modulo && candidatas.find((l) => l.modulosSecciones.includes(modulo)))
        ?? (modulo && candidatas.find((l) => l.cabecera.includes(modulo)))
        ?? (candidatas.length === 1 ? candidatas[0] : null);
      if (!lectura) return {error: candidatas.length ? `varias hojas de metrado y ninguna del módulo ${modulo}` : 'sin hoja de metrado (ITEM, DESCRIPCIÓN, Total)'};
    }
  }
  if (!lectura) return {error: `la hoja "${hoja}" no tiene encabezados de metrado (ITEM, DESCRIPCIÓN, Total)`};
  if (lectura.varios && modulo && !lectura.conSeccion.includes(modulo)) return {error: `la hoja "${lectura.hoja}" no tiene secciones del módulo ${modulo}`};
  const r = totalesDelModulo(lectura, modulo);
  const totales = new Map();
  for (const p of r.partidas) totales.set(p.item, p.total);
  return {hoja: lectura.hoja, formato: r.formato, partidas: r.partidas, totales, avisos: r.avisos};
}

export async function abrirPlanilla(ruta, opciones) {
  const libro = new ExcelJS.Workbook();
  await libro.xlsx.readFile(ruta);
  return leerPlanillaMetrado(libro, opciones);
}

// ¿La planilla usa la codificación del despacho? Se mira si el código y la descripción llevan a
// la misma categoría en la mayoría de partidas.
export function usaCodigoDelDespacho(partidas) {
  let iguales = 0, distintas = 0;
  for (const p of partidas) {
    const porCodigo = CATEGORIAS.find(([, re]) => re.test(p.item))?.[0] ?? null;
    const porDesc = categoriaPorDescripcion(p.descripcion, p.unidad);
    if (!porCodigo || !porDesc) continue;
    if (porCodigo === porDesc) iguales++; else distintas++;
  }
  return iguales > 0 && iguales >= 0.8 * (iguales + distintas);
}

// Total del ingeniero por categoría: Map nombre → total (solo las categorías presentes) y la
// lista de partidas con cantidad que no entraron en ninguna.
export function categoriasDelIngeniero(lectura) {
  const porCodigo = usaCodigoDelDespacho(lectura.partidas);
  const out = new Map(), sinCategoria = [];
  if (porCodigo) {
    for (const [nombre, re] of CATEGORIAS) {
      let s = 0, hay = false;
      for (const [k, v] of lectura.totales) if (re.test(k)) { s += v; hay = true; }
      if (hay) out.set(nombre, s);
    }
    return {criterio: 'código', totales: out, sinCategoria};
  }
  for (const p of lectura.partidas) {
    const c = categoriaPorDescripcion(p.descripcion, p.unidad);
    if (c) out.set(c, (out.get(c) ?? 0) + p.total);
    else if (p.total) sinCategoria.push(p);
  }
  return {criterio: 'descripción', totales: out, sinCategoria};
}
