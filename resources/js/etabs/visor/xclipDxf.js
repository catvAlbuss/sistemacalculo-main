// El recorte XCLIP también en los DXF que guarda NovaCad.
//
// El DXF que escribe la librería (database.dxfOut: «Exportar DXF» y la copia de recuperación) no
// lleva el recorte de los bloques: la inserción apunta a su diccionario de extensión, pero ese
// diccionario y el filtro (ACAD_FILTER → SPATIAL → SPATIAL_FILTER) no se escriben. Al reabrir el
// archivo —en NovaCad o en AutoCAD— el plano de ubicación salía con el terreno entero alrededor de
// las láminas («el plano se destruye, aparece como un mapa»).
//
// Aquí:
// 1. agregarRecortesAlDxf: después de dxfOut se escriben esos objetos como los escribe AutoCAD
//    (diccionario de extensión, ACAD_FILTER, SPATIAL_FILTER con el polígono en coordenadas del
//    bloque) y la inserción queda enlazada con el grupo {ACAD_XDICTIONARY.
// 2. recortesDelDxf: al abrir un DXF se leen los SPATIAL_FILTER (los nuestros y los de AutoCAD) y
//    se activan por inserción, porque el lector DXF de la librería no los interpreta.

import {normalizarHandle, poligonoDeFiltro, recortesParaCopia, registrarRecortesDeInsercion} from "./recorteXclip.js";

const IDENTIDAD_3X4 = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]; // columna por columna, como el DXF
const num = (v) => (Math.round(Number(v) * 1e9) / 1e9).toString();

// Pares (código, valor) de un tramo de DXF.
function pares(texto) {
  const l = texto.split(/\r?\n/);
  const out = [];
  for (let i = 0; i + 1 < l.length; i += 2) out.push([l[i].trim(), l[i + 1]]);
  return out;
}

// Matriz 3x4 por columnas del DXF → por filas (la que usa poligonoDeFiltro).
const porFilas = (c) => (c.length >= 12 ? [c[0], c[3], c[6], c[9], c[1], c[4], c[7], c[10], c[2], c[5], c[8], c[11]] : null);

// recortes: [{h: handle de la inserción, bloque, poli: [{x, y}] en coordenadas del bloque,
// inversa?: 16 valores por columnas de la inversa de la transformación de la inserción}].
export function agregarRecortesAlDxf(texto, recortes) {
  if (typeof texto !== "string" || !recortes?.length) return texto;
  const eol = texto.includes("\r\n") ? "\r\n" : "\n";
  const semilla = /(\r?\n)\s*9\r?\n\$HANDSEED\r?\n\s*5\r?\n([0-9A-Fa-f]+)/.exec(texto);
  const inicioObjetos = texto.search(/\r?\n\s*0\r?\nSECTION\r?\n\s*2\r?\nOBJECTS\r?\n/);
  if (!semilla || inicioObjetos < 0) return texto;
  let siguiente = parseInt(semilla[2], 16);
  const nuevo = () => (siguiente++).toString(16).toUpperCase();
  const objetos = [];
  let salida = texto;
  for (const r of recortes) {
    const h = normalizarHandle(r.h);
    if (!h || !(r.poli?.length >= 3)) continue;
    // La inserción: "0 INSERT / 5 <h> / [330 dueño] / [360 diccionario]".
    const patron = new RegExp(`(\\r?\\n\\s*0\\r?\\nINSERT\\r?\\n\\s*5\\r?\\n)(${h})(\\r?\\n)((?:\\s*330\\r?\\n[^\\r\\n]*\\r?\\n)?)((?:\\s*360\\r?\\n[^\\r\\n]*\\r?\\n)?)`, "i");
    const m = patron.exec(salida);
    if (!m) continue;
    const xdPrevio = m[5] ? m[5].split(/\r?\n/)[1].trim() : null;
    // Si el diccionario ya está escrito en OBJECTS (lo escribió otro programa), no se toca.
    if (xdPrevio && new RegExp(`\\r?\\n\\s*5\\r?\\n${xdPrevio}\\r?\\n`, "i").test(salida.slice(inicioObjetos))) continue;
    const xd = xdPrevio || nuevo(), dicFiltro = nuevo(), filtro = nuevo();
    // {ACAD_XDICTIONARY antes del dueño, como AutoCAD.
    const enlace = ["102", "{ACAD_XDICTIONARY", "360", xd, "102", "}"].join(eol) + eol;
    salida = salida.slice(0, m.index) + m[1] + m[2] + m[3] + enlace + m[4] + salida.slice(m.index + m[0].length);
    const inversa = Array.isArray(r.inversa) && r.inversa.length === 16
      ? [r.inversa[0], r.inversa[1], r.inversa[2], r.inversa[4], r.inversa[5], r.inversa[6], r.inversa[8], r.inversa[9], r.inversa[10], r.inversa[12], r.inversa[13], r.inversa[14]]
      : IDENTIDAD_3X4;
    objetos.push(
      "0", "DICTIONARY", "5", xd, "102", "{ACAD_REACTORS", "330", h, "102", "}", "330", h, "100", "AcDbDictionary", "280", "1", "281", "1", "3", "ACAD_FILTER", "360", dicFiltro,
      "0", "DICTIONARY", "5", dicFiltro, "102", "{ACAD_REACTORS", "330", xd, "102", "}", "330", xd, "100", "AcDbDictionary", "280", "1", "281", "1", "3", "SPATIAL", "360", filtro,
      "0", "SPATIAL_FILTER", "5", filtro, "102", "{ACAD_REACTORS", "330", dicFiltro, "102", "}", "330", dicFiltro, "100", "AcDbFilter", "100", "AcDbSpatialFilter",
      "70", String(r.poli.length), ...r.poli.flatMap((p) => ["10", num(p.x), "20", num(p.y)]),
      "210", "0", "220", "0", "230", "1", "11", "0", "21", "0", "31", "0", "71", "1", "72", "0", "73", "0",
      ...inversa.flatMap((v) => ["40", num(v)]), ...IDENTIDAD_3X4.flatMap((v) => ["40", num(v)]),
    );
  }
  if (!objetos.length) return texto;
  // Al final de OBJECTS (antes de su ENDSEC) y la semilla de handles actualizada.
  const desdeObjetos = salida.search(/\r?\n\s*0\r?\nSECTION\r?\n\s*2\r?\nOBJECTS\r?\n/);
  const fin = /\r?\n\s*0\r?\nENDSEC/.exec(salida.slice(desdeObjetos + 10));
  if (!fin) return texto;
  const corte = desdeObjetos + 10 + fin.index;
  salida = salida.slice(0, corte) + eol + objetos.join(eol) + salida.slice(corte);
  return salida.replace(/(\r?\n\s*9\r?\n\$HANDSEED\r?\n\s*5\r?\n)([0-9A-Fa-f]+)/, (_, a) => `${a}${siguiente.toString(16).toUpperCase()}`);
}

// Recortes de un DXF (texto): [{h: handle de la inserción, bloque, poli}] para activarlos al abrirlo.
export function recortesDelDxf(texto) {
  if (typeof texto !== "string" || !texto.includes("SPATIAL_FILTER")) return [];
  const inicio = texto.search(/\r?\n\s*0\r?\nSECTION\r?\n\s*2\r?\nOBJECTS\r?\n/);
  if (inicio < 0) return [];
  const objetos = texto.slice(inicio);
  const dueno = new Map(); // handle → dueño (330 fuera de los grupos 102)
  const filtros = [];
  const partes = objetos.split(/\r?\n\s*0\r?\n(?=[A-Z_]+\r?\n)/);
  for (const parte of partes) {
    const tipo = parte.split(/\r?\n/)[0].trim();
    if (tipo !== "DICTIONARY" && tipo !== "SPATIAL_FILTER") continue;
    let handle = null, owner = null, enGrupo = false;
    const vertices = [], cuarenta = [];
    let x = null;
    for (const [c, v] of pares(parte.split(/\r?\n/).slice(1).join("\n"))) {
      if (c === "102") { enGrupo = v.trim().startsWith("{"); continue; }
      if (c === "5" && !handle) handle = normalizarHandle(v);
      else if (c === "330" && !enGrupo && !owner) owner = normalizarHandle(v);
      else if (tipo === "SPATIAL_FILTER" && c === "10") x = Number(v);
      else if (tipo === "SPATIAL_FILTER" && c === "20" && x !== null) { vertices.push({x, y: Number(v)}); x = null; }
      else if (tipo === "SPATIAL_FILTER" && c === "40") cuarenta.push(Number(v));
    }
    if (!handle) continue;
    dueno.set(handle, owner);
    if (tipo === "SPATIAL_FILTER") filtros.push({handle, owner, vertices, matrix: porFilas(cuarenta.slice(12, 24))});
  }
  const lista = [];
  for (const f of filtros) {
    const xd = dueno.get(f.owner);
    const insercion = xd ? dueno.get(xd) : null;
    const poli = poligonoDeFiltro(f);
    if (!insercion || !poli) continue;
    // Nombre del bloque de la inserción (código 2), leyendo pares hasta la siguiente entidad: un
    // valor "0" (p. ej. 60/0) no corta la entidad.
    const m = new RegExp(`\\r?\\n\\s*0\\r?\\nINSERT\\r?\\n\\s*5\\r?\\n${insercion}\\r?\\n`, "i").exec(texto);
    let bloque = "";
    if (m) {
      for (const [c, v] of pares(texto.slice(m.index + m[0].length, m.index + m[0].length + 4000))) {
        if (c === "0") break;
        if (c === "2") { bloque = v.trim(); break; }
      }
    }
    lista.push({h: insercion, bloque, poli});
  }
  return lista;
}

// Instala las dos partes: dxfOut escribe los recortes y el lector DXF los activa al abrir.
export function instalarXclipEnDxf({AcDbDatabase, AcDbNativeDxfConverter, AcDbBlockReference}) {
  const db = AcDbDatabase?.prototype;
  if (db && typeof db.dxfOut === "function" && !db.dxfOut.novacadXclip) {
    const original = db.dxfOut;
    const envuelto = function (...args) {
      const texto = original.apply(this, args);
      try {
        const recortes = recortesParaCopia(this, AcDbBlockReference, {conInversa: true});
        return recortes.length ? agregarRecortesAlDxf(texto, recortes) : texto;
      } catch {
        return texto; // sin recortes: el DXF como lo escribe la librería
      }
    };
    envuelto.novacadXclip = true;
    db.dxfOut = envuelto;
  }
  const conv = AcDbNativeDxfConverter?.prototype;
  if (conv && typeof conv.read === "function" && !conv.read.novacadXclip) {
    const leer = conv.read;
    const envuelto = async function (data, base, ...resto) {
      try {
        // Solo si el archivo trae filtros (búsqueda en bytes; los planos grandes no se decodifican).
        const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : ArrayBuffer.isView(data) ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength) : null;
        if (bytes && bytes.byteLength < 400 * 1024 * 1024 && contiene(bytes, "AcDbSpatialFilter")) {
          registrarRecortesDeInsercion(base, recortesDelDxf(new TextDecoder("latin1").decode(bytes)));
        } else if (typeof data === "string" && data.includes("SPATIAL_FILTER")) {
          registrarRecortesDeInsercion(base, recortesDelDxf(data));
        }
      } catch { /* sin recortes: se abre como antes */ }
      return leer.call(this, data, base, ...resto);
    };
    envuelto.novacadXclip = true;
    conv.read = envuelto;
  }
}

function contiene(bytes, palabra) {
  const p = [...palabra].map((c) => c.charCodeAt(0));
  const n = bytes.length - p.length;
  for (let i = 0; i <= n; i++) {
    if (bytes[i] !== p[0]) continue;
    let k = 1;
    while (k < p.length && bytes[i + k] === p[k]) k++;
    if (k === p.length) return true;
  }
  return false;
}
