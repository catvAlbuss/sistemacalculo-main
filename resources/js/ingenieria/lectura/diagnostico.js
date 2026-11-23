// Diagnóstico de la lectura de un plano de arquitectura recién importado.
//
// El agente estructura a partir de lo que lee de la arquitectura: si la importación pierde algo
// (referencias externas sin su contenido, objetos de AutoCAD Architecture, muros en multilínea,
// ejes sin nombre), las láminas salen incompletas sin que nadie lo note. Este diagnóstico recorre
// el dibujo completo (bloques incluidos) y dice, antes de pedir nada:
//  - qué leyó (entidades por tipo, vistas con sus ejes, columnas y columnetas, niveles NPT);
//  - qué no puede interpretar y si eso puede esconder arquitectura;
//  - si el plano está listo para estructurar y, si no, qué hacer en AutoCAD para corregirlo.
// No modifica el dibujo.

import {detectarVistas, leerVista, textoPlano} from "./lectorPlano.js";

const MAX_PROFUNDIDAD = 8;
const UNIDADES = {0: "sin unidades", 1: "pulgadas", 2: "pies", 4: "milímetros", 5: "centímetros", 6: "metros", 14: "decímetros"};

// Lo que el lector usa para la estructura.
const LEE = new Set(["LINE", "LWPOLYLINE", "POLYLINE", "CIRCLE", "TEXT", "MTEXT", "INSERT", "ATTRIB"]);
// Anotación y relleno: se ven en el visor y no hacen falta para estructurar.
const INFORMATIVO = new Set(["DIMENSION", "HATCH", "ARC", "SOLID", "ELLIPSE", "SPLINE", "POINT", "LEADER", "MLEADER", "MULTILEADER",
  "WIPEOUT", "ATTDEF", "XLINE", "RAY", "TABLE", "IMAGE", "OLE2FRAME", "OLEFRAME", "TOLERANCE", "SHAPE", "VIEWPORT", "3DFACE", "TRACE"]);
// Pueden esconder arquitectura que el agente no ve (muros, puertas, sólidos).
const RIESGO = {
  MLINE: "muros en multilínea",
  "3DSOLID": "sólidos 3D",
  REGION: "regiones",
  BODY: "cuerpos 3D",
  MESH: "mallas",
};

const escalaPorBurbuja = (radio) => (radio >= 40 ? 1000 : radio >= 4 ? 100 : 1);
const tipoDe = (e) => String(e?.dxfTypeName ?? "").toUpperCase();
const esProxy = (e) => /PROXY/.test(tipoDe(e)) || Boolean(e?.originalDxfName && e?.proxyGraphic !== undefined);
const nombreProxy = (e) => String(e?.originalDxfName || e?.originalClassName || tipoDe(e) || "PROXY").toUpperCase();
const sumar = (mapa, clave, n = 1) => mapa.set(clave, (mapa.get(clave) ?? 0) + n);
const lista = (xs) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} y ${xs.at(-1)}` : xs[0] ?? "");
const top = (mapa, n = 6) => [...mapa].sort((a, b) => b[1] - a[1]).slice(0, n);

// Recorre el espacio modelo con los bloques: cuenta por tipo, referencias externas, proxies y
// lo que está en capas apagadas.
export function recorrerDibujo(database) {
  const porTipo = new Map(), proxies = new Map(), riesgo = new Map(), xrefs = new Map(), ocultas = new Map();
  const apagadas = new Set();
  for (const capa of database?.tables?.layerTable?.newIterator?.().toArray?.() ?? []) {
    if (capa.isOff || capa.isFrozen) apagadas.add(capa.name);
  }
  let total = 0, bloquesVacios = 0;
  const vistos = new Set();
  const visitar = (lista, capaPadre, profundidad) => {
    for (const e of lista) {
      total++;
      const tipo = tipoDe(e) || "?";
      const capa = e.layer === "0" && capaPadre ? capaPadre : e.layer;
      if (apagadas.has(capa)) sumar(ocultas, capa);
      if (esProxy(e)) { sumar(proxies, nombreProxy(e)); continue; }
      sumar(porTipo, tipo);
      if (RIESGO[tipo]) sumar(riesgo, tipo);
      if (tipo !== "INSERT" || profundidad >= MAX_PROFUNDIDAD) continue;
      const registro = e.blockTableRecord ?? null;
      if (registro?.isXref) {
        const nombre = e.blockName ?? registro.name;
        const previo = xrefs.get(nombre) ?? {nombre, ruta: registro.pathName ?? "", veces: 0, vacia: false};
        previo.veces++;
        const contenido = registro.newIterator?.().toArray?.() ?? [];
        previo.vacia = previo.vacia || registro.isUnresolvedXref === true || !contenido.length;
        xrefs.set(nombre, previo);
        if (contenido.length) visitar(contenido, capa, profundidad + 1);
        continue;
      }
      const dibujable = e.drawableBlockTableRecord ?? registro;
      const contenido = dibujable?.newIterator?.().toArray?.() ?? [];
      if (!contenido.length && !vistos.has(e.blockName)) { bloquesVacios++; vistos.add(e.blockName); }
      visitar(contenido, capa, profundidad + 1);
    }
  };
  visitar(database?.tables?.blockTable?.modelSpace?.newIterator?.().toArray?.() ?? [], null, 0);
  return {total, porTipo, proxies, riesgo, xrefs: [...xrefs.values()], ocultas, bloquesVacios};
}

// Peso del dibujo: definiciones de bloque que nada inserta (bibliotecas de muebles, bloques de
// otros proyectos) y su contenido. El módulo 6 de VINCHOS traía 12 340 bloques y usaba 136: el
// 96 % del archivo era contenido sin uso, y el visor tardaba 15 s y ~1 GB en abrirlo.
export function pesoDelDibujo(database) {
  const registros = database?.tables?.blockTable?.newIterator?.().toArray?.() ?? [];
  const usados = new Set();
  const visitar = (lista, profundidad) => {
    for (const e of lista) {
      if (tipoDe(e) !== "INSERT" || usados.has(e.blockName) || profundidad > MAX_PROFUNDIDAD) continue;
      usados.add(e.blockName);
      visitar(e.blockTableRecord?.newIterator?.().toArray?.() ?? [], profundidad + 1);
    }
  };
  // Lo que se ve: espacio modelo y presentaciones (*Paper_Space…).
  for (const r of registros) if (/^\*(model|paper)_space/i.test(r.name ?? "")) visitar(r.newIterator?.().toArray?.() ?? [], 0);
  let enUso = 0, sinUso = 0, bloquesSinUso = 0;
  for (const r of registros) {
    const n = r.newIterator?.().toArray?.().length ?? 0;
    // Los anónimos (*D cotas, *U dinámicos, *X sombreados) los usan otras entidades: cuentan como en uso.
    if (String(r.name ?? "").startsWith("*") || usados.has(r.name)) enUso += n;
    else { sinUso += n; bloquesSinUso++; }
  }
  return {bloques: registros.length, bloquesSinUso, entidadesEnUso: enUso, entidadesSinUso: sinUso,
    capas: database?.tables?.layerTable?.newIterator?.().toArray?.().length ?? 0};
}

// Código de error del lector DWG (libredwg, banderas sumadas): los menores a 128 no impiden abrir
// el plano, pero avisan que algunos objetos no se decodificaron.
const ERRORES_DWG = {1: "CRC incorrecto", 2: "partes de una versión aún no soportada", 4: "clases de objetos no soportadas", 8: "tipos de objeto inválidos",
  16: "referencias internas rotas", 32: "datos extendidos inválidos", 64: "valores fuera de rango"};
export function textoErrorDwg(codigo) {
  const n = Number(codigo) || 0;
  return Object.entries(ERRORES_DWG).filter(([bit]) => n & Number(bit)).map(([, t]) => t);
}

// items: elementos aplanados del lector (readPlan().items, solo arquitectura).
// vistas: las detectadas (readPlan().vistas); si no vienen, se detectan aquí.
// codigoDwg: código de error del lector DWG, si se conoce (scripts en Node).
export function diagnosticarLectura({database, items = [], vistas = null, codigoDwg = 0}) {
  const r = recorrerDibujo(database);
  const vs = vistas ?? detectarVistas(items);
  const lecturas = vs.map((v) => {
    try {
      const l = leerVista(items, v, escalaPorBurbuja(v.radio));
      return {titulo: v.titulo || `Vista ${v.indice ?? ""}`.trim(), ejes: l.ejes.map((e) => e.nombre), inclinados: l.ejes.filter((e) => e.inclinado).length, columnas: l.columnas.length, tipos: l.tipos.length, columnetas: l.columnetas};
    } catch (error) {
      return {titulo: v.titulo || "Vista", ejes: v.ejes?.map((e) => e.nombre) ?? [], columnas: 0, tipos: 0, columnetas: 0, error: error?.message ?? String(error)};
    }
  });
  const textos = items.filter((it) => it.tipo === "texto" && textoPlano(it.texto));
  const npt = [...new Set(textos.map((t) => /N\.?\s*P\.?\s*T\.?\s*[:=]?\s*([+-]?\s*\d+[.,]\d+)/i.exec(t.texto)?.[1]?.replace(/\s/g, "").replace(",", ".")).filter(Boolean))]
    .sort((a, b) => Number(a) - Number(b));

  const leidas = [...r.porTipo].filter(([t]) => LEE.has(t) || /POLYLINE/.test(t)).reduce((s, [, n]) => s + n, 0);
  const informativas = [...r.porTipo].filter(([t]) => INFORMATIVO.has(t)).reduce((s, [, n]) => s + n, 0);
  const desconocidas = [...r.porTipo].filter(([t]) => !LEE.has(t) && !/POLYLINE/.test(t) && !INFORMATIVO.has(t) && !RIESGO[t]);
  const nProxies = [...r.proxies.values()].reduce((s, n) => s + n, 0);
  const conColumnas = lecturas.filter((l) => l.ejes.length >= 2 && l.columnas > 0);

  // Problemas (impiden o recortan la estructura) y avisos (conviene saberlos).
  const problemas = [], avisos = [];
  const xrefVacias = r.xrefs.filter((x) => x.vacia);
  if (xrefVacias.length) problemas.push({codigo: "xref", texto: `El DWG trae ${xrefVacias.length} referencia(s) externa(s) sin su contenido (${lista(xrefVacias.slice(0, 4).map((x) => x.nombre))}): el agente no ve lo que hay en ellas.`, arreglo: "En AutoCAD: comando BIND (Enlazar) de las referencias, o eTransmit, y vuelve a subir el DWG."});
  if (nProxies) problemas.push({codigo: "proxy", texto: `Hay ${nProxies} objeto(s) de otra aplicación que el visor no puede leer (${lista(top(r.proxies, 3).map(([n, c]) => `${n} ×${c}`))}); suelen ser muros, puertas o ventanas de AutoCAD Architecture.`, arreglo: "En AutoCAD Architecture: comando -AECEXPORTTOAUTOCAD (Exportar a AutoCAD) y sube ese DWG."});
  if (!vs.length) problemas.push({codigo: "ejes", texto: "No encontré ejes con nombre (burbuja: círculo con su letra o número en una capa de ejes). Sin ejes no puedo ubicar columnas ni estructurar.", arreglo: "Revisa que los ejes estén en una capa de ejes (EJES, AXIS…) con su burbuja y rótulo, o súbelo con la planta que los tiene."});
  else if (!conColumnas.length) problemas.push({codigo: "columnas", texto: `Leí ${vs.length} vista(s) con ejes, pero ninguna columna en sus cruces.`, arreglo: "Revisa que las columnas estén dibujadas (polilínea cerrada o sombreado con contorno) en los cruces de ejes y no en una capa de muebles o textos."});
  if (r.riesgo.get("MLINE")) avisos.push(`${r.riesgo.get("MLINE")} muro(s) en multilínea (MLINE): aún no los leo como muros; si faltan cimientos corridos, explótalos (EXPLODE) en AutoCAD.`);
  const solidos = ["3DSOLID", "REGION", "BODY", "MESH"].map((t) => r.riesgo.get(t) ? `${r.riesgo.get(t)} ${RIESGO[t]}` : "").filter(Boolean);
  if (solidos.length) avisos.push(`Hay ${lista(solidos)}: no se usan para estructurar la planta.`);
  if (r.xrefs.length > xrefVacias.length) avisos.push(`${r.xrefs.length - xrefVacias.length} referencia(s) externa(s) con contenido: las leí como parte del plano.`);
  if (r.ocultas.size) avisos.push(`${[...r.ocultas.values()].reduce((s, n) => s + n, 0)} objeto(s) en capas apagadas o congeladas (${lista(top(r.ocultas, 3).map(([c]) => c))}): no los uso salvo los textos de niveles.`);
  if (desconocidas.length) avisos.push(`Tipos que no interpreto: ${lista(desconocidas.slice(0, 5).map(([t, n]) => `${t} ×${n}`))}.`);
  const errores = textoErrorDwg(codigoDwg);
  if (errores.length) avisos.push(`El lector DWG avisó ${lista(errores)} (código ${codigoDwg}): algún objeto puede no verse. Si falta algo, guarda el DWG en una versión 2018 o anterior con AUDIT y PURGE y vuelve a subirlo.`);
  const peso = pesoDelDibujo(database);
  if (peso.entidadesSinUso > 20000 && peso.entidadesSinUso > peso.entidadesEnUso * 0.5) {
    const parte = Math.round((peso.entidadesSinUso / (peso.entidadesSinUso + peso.entidadesEnUso)) * 100);
    avisos.push(`Plano pesado: ${peso.bloquesSinUso} definiciones de bloque sin usar con ${peso.entidadesSinUso.toLocaleString("es-PE")} objetos (${parte} % del archivo). Abrirlo y trabajarlo es más lento. En AutoCAD: -PURGE → Todo → anidado (Sí), luego AUDIT y guarda; o WBLOCK solo de las plantas que necesitas.`);
  }
  if (!database?.insunits) avisos.push("El dibujo no declara unidades: deduzco la escala por el tamaño de las burbujas de eje.");
  for (const l of lecturas.filter((x) => x.error)) avisos.push(`No pude leer la vista ${l.titulo}: ${l.error}.`);

  const estado = problemas.some((p) => ["ejes", "columnas"].includes(p.codigo)) ? "no" : problemas.length ? "parcial" : "lista";
  return {
    estado,
    resumen: estado === "lista" ? `Listo para estructurar: ${conColumnas.length} vista(s) con ejes y columnas.`
      : estado === "parcial" ? "Puedo estructurarlo, pero falta información del DWG: revisa los problemas." : "Aún no puedo estructurar este plano.",
    unidades: UNIDADES[database?.insunits] ?? `INSUNITS ${database?.insunits}`,
    entidades: {total: r.total, leidas, informativas, proxies: nProxies, porTipo: top(r.porTipo, 10)},
    vistas: lecturas,
    textos: textos.length,
    niveles: npt,
    xrefs: r.xrefs,
    bloquesVacios: r.bloquesVacios,
    peso,
    problemas,
    avisos,
  };
}
