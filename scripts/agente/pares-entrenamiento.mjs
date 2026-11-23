import {basename, win32} from 'node:path';

const sinAcentos = (texto) => String(texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// Rol del archivo por una palabra suelta en cualquier parte del nombre (ARQUITECTURA, ARQ,
// ESTRUCTURA(S), EST, ESTR) y nombre base sin esa palabra ni separadores.
const ROL_ARQ = /(^|\s)(arquitectura|arquitectonico|arq)(\s|$)/i;
const ROL_EST = /(^|\s)(estructuras?|estructural|estr|est)(\s|$)/i;
function describirBasename(nombre) {
  const archivo = String(nombre ?? '');
  const stem = sinAcentos(archivo.replace(/\.[^.]+$/, '')).replace(/[\s._-]+/g, ' ').trim();
  const arq = ROL_ARQ.exec(stem), est = ROL_EST.exec(stem);
  const m = arq && !est ? arq : est && !arq ? est : null;
  return {
    rol: m ? (m === arq ? 'arquitectura' : 'estructura') : null,
    base: (m ? `${stem.slice(0, m.index)} ${stem.slice(m.index + m[0].length)}` : stem).replace(/\s+/g, ' ').trim().toLowerCase(),
  };
}

const ROMANOS = {I: 1, V: 5, X: 10, L: 50, C: 100};
const romano = (t) => [...t.toUpperCase()].reduce((acc, ch, i, a) => (ROMANOS[ch] < (ROMANOS[a[i + 1]] ?? 0) ? acc - ROMANOS[ch] : acc + ROMANOS[ch]), 0);
// Número de módulo de un nombre: "MÓDULO 4", "MODULO IV", "M-04", "M04" o el número inicial "4.".
export function numeroDeModulo(nombre) {
  const t = sinAcentos(String(nombre ?? '')).toUpperCase().replace(/\.[A-Z0-9]+$/, '');
  const m = /MODULO\s*[-_.]?\s*(\d{1,3}|[IVXLC]{1,6})(?![A-Z0-9])/.exec(t) ?? /(?:^|[\s_-])M[-_]?(\d{1,3})(?![0-9])/.exec(t) ?? /^\s*(\d{1,3})(?=[\s._-])/.exec(t);
  if (!m) return null;
  const n = /^\d+$/.test(m[1]) ? Number(m[1]) : romano(m[1]);
  return n > 0 ? n : null;
}

// Módulos que cubre una planilla de metrado: "MODULO 05 Y 06" → [5, 6];
// "MODULOS 01-02A-02B-03-04" → [1, 2, 3, 4] (un rango "01 AL 04" también se expande).
export function modulosDeMetrado(nombre) {
  const t = sinAcentos(String(nombre ?? '')).toUpperCase().replace(/\.[A-Z0-9]+$/, '');
  const m = /MODULOS?\s*[-_.]?\s*((?:\d{1,3}[A-Z]?)(?:\s*(?:-|,|Y|AL|A|&)\s*\d{1,3}[A-Z]?)*)/.exec(t);
  if (!m) { const n = numeroDeModulo(nombre); return n ? [n] : []; }
  const nums = new Set();
  const partes = m[1].split(/\s*(?:-|,|Y|&)\s*/);
  for (const p of partes) {
    const r = /^(\d{1,3})[A-Z]?\s*(?:AL|A)\s*(\d{1,3})/.exec(p);
    if (r) for (let i = Number(r[1]); i <= Number(r[2]) && i - Number(r[1]) < 50; i++) nums.add(i);
    else { const n = /^(\d{1,3})/.exec(p); if (n && Number(n[1]) > 0) nums.add(Number(n[1])); }
  }
  return [...nums];
}

// Manifiesto propuesto para la carpeta de un proyecto: empareja por número de módulo la
// arquitectura, la estructura y el metrado. Lo dudoso (dos candidatos, falta un archivo) se
// informa y no se adivina.
export function proponerManifiesto(archivos) {
  const porModulo = new Map();
  const sinNumero = [];
  for (const a of archivos) {
    const ext = (/\.([^.]+)$/.exec(a)?.[1] ?? '').toLowerCase();
    let rol = null;
    if (['dwg', 'dxf'].includes(ext)) rol = describirBasename(a).rol;
    else if (['xlsx', 'xls'].includes(ext) && /metrad/i.test(a)) rol = 'metrado';
    if (!rol) continue;
    const ns = rol === 'metrado' ? modulosDeMetrado(a) : [numeroDeModulo(a)].filter(Boolean);
    if (!ns.length) { sinNumero.push(a); continue; }
    for (const n of ns) {
      const id = `modulo-${String(n).padStart(2, '0')}`;
      const fila = porModulo.get(id) ?? {id, arquitectura: [], estructura: [], metrado: []};
      fila[rol].push(a);
      porModulo.set(id, fila);
    }
  }
  const entradas = [], dudas = [];
  for (const f of [...porModulo.values()].sort((a, b) => a.id.localeCompare(b.id, 'es', {numeric: true}))) {
    if (!f.arquitectura.length && !f.estructura.length) continue; // solo la planilla: no es un módulo dibujado
    if (f.arquitectura.length !== 1 || f.estructura.length !== 1) {
      dudas.push({id: f.id, motivo: !f.arquitectura.length ? 'falta la arquitectura' : !f.estructura.length ? 'falta la estructura' : 'hay más de un candidato', arquitectura: f.arquitectura, estructura: f.estructura});
      continue;
    }
    entradas.push({id: f.id, arquitectura: f.arquitectura[0], estructura: f.estructura[0], ...(f.metrado.length === 1 ? {metrado: f.metrado[0]} : {})});
  }
  return {entradas, dudas, sinNumero};
}

// Ruta de un archivo del manifiesto: en la carpeta del proyecto (base/grupo) o, como antes, en base.
export function rutaArchivo(base, grupo, nombre, existe) {
  const enGrupo = `${base}/${grupo}/${nombre}`;
  return existe(enGrupo) ? enGrupo : `${base}/${nombre}`;
}

function idCanonico(id) {
  const numeroModulo = String(id).match(/^(?:modulo|module)[_-]?0*(\d+)$/i)?.[1];
  return numeroModulo ? `modulo-${numeroModulo.padStart(2, '0')}` : String(id).toLowerCase();
}

function esBasename(nombre) {
  return typeof nombre === 'string'
    && nombre.length > 0
    && basename(nombre) === nombre
    && win32.basename(nombre) === nombre;
}

function filasManifiesto(manifiesto) {
  if (!manifiesto || typeof manifiesto !== 'object' || Array.isArray(manifiesto)) {
    throw new TypeError('El manifiesto debe ser un objeto { grupo: [{ id, arquitectura, estructura }] }.');
  }
  const filas = [];
  for (const [grupo, entradas] of Object.entries(manifiesto)) {
    if (!/^[a-z0-9][a-z0-9_-]*$/i.test(grupo) || !Array.isArray(entradas)) {
      throw new TypeError(`Grupo inválido en el manifiesto: ${grupo}`);
    }
    for (const entrada of entradas) {
      if (!entrada || typeof entrada !== 'object'
        || !/^[a-z0-9][a-z0-9_-]*$/i.test(entrada.id ?? '')
        || !esBasename(entrada.arquitectura)
        || !esBasename(entrada.estructura)
        || (entrada.metrado !== undefined && !esBasename(entrada.metrado))) {
        throw new TypeError(`Entrada inválida en el manifiesto del grupo ${grupo}. Se requieren id y basenames exactos.`);
      }
      filas.push({grupo, ...entrada});
    }
  }
  return filas;
}

/**
 * Resuelve únicamente los pares seleccionados por el manifiesto local.
 * Los IDs se consideran únicos dentro de un grupo, nunca entre grupos.
 */
export function descubrirPares(archivos, manifiesto) {
  if (!Array.isArray(archivos) || archivos.some((archivo) => !esBasename(archivo))) {
    throw new TypeError('archivos debe contener únicamente basenames locales.');
  }
  const disponibles = new Set(archivos);
  const filas = filasManifiesto(manifiesto);
  const grupos = new Map();
  for (const fila of filas) {
    const id = idCanonico(fila.id);
    const clave = `${fila.grupo}\u0000${id}`;
    grupos.set(clave, [...(grupos.get(clave) ?? []), {...fila, idCanonico: id}]);
  }

  const pares = [];
  const ambiguos = [];
  const faltantes = [];
  for (const [clave, candidatos] of grupos) {
    if (candidatos.length > 1) {
      ambiguos.push({
        grupo: candidatos[0].grupo,
        id: candidatos[0].idCanonico,
        candidatos: candidatos.map(({arquitectura, estructura}) => ({arquitectura, estructura})),
      });
      continue;
    }
    const [fila] = candidatos;
    const arquitectura = disponibles.has(fila.arquitectura) ? fila.arquitectura : null;
    const estructura = disponibles.has(fila.estructura) ? fila.estructura : null;
    if (!arquitectura || !estructura) {
      faltantes.push({grupo: fila.grupo, id: fila.id, arquitectura, estructura: estructura ?? (arquitectura ? fila.estructura : null)});
      continue;
    }
    const nombreArquitectura = describirBasename(arquitectura);
    const nombreEstructura = describirBasename(estructura);
    // Mismo nombre base o, si cada uno nombra distinto ("M-12 ARQ" / "Modulo 12 - Est"), mismo módulo.
    const mismoModulo = numeroDeModulo(arquitectura) !== null && numeroDeModulo(arquitectura) === numeroDeModulo(estructura);
    if (nombreArquitectura.rol !== 'arquitectura' || nombreEstructura.rol !== 'estructura'
      || (nombreArquitectura.base !== nombreEstructura.base && !mismoModulo)) {
      ambiguos.push({
        grupo: fila.grupo,
        id: fila.id,
        candidatos: [{arquitectura, estructura}],
        motivo: 'Debe seleccionar arquitectura y estructura del mismo nombre base.',
      });
      continue;
    }
    pares.push({grupo: fila.grupo, id: fila.id, arquitectura, estructura, ...(fila.metrado ? {metrado: fila.metrado} : {})});
  }
  return {pares, ambiguos, faltantes};
}

/**
 * Conserva solo decisiones aprobadas, resolviendo el último evento de estado por ID.
 * Las filas legadas sin estado conservan compatibilidad y se consideran aprobadas.
 */
export function eventosAprobados(eventos, clavesValidas, sanitizarRasgos = () => ({})) {
  if (!Array.isArray(eventos) || !clavesValidas || typeof clavesValidas !== 'object'
    || typeof sanitizarRasgos !== 'function') {
    throw new TypeError('Se requieren eventos, un catálogo de claves válidas y el sanitizador de rasgos.');
  }
  const estadoPorId = new Map();
  for (const evento of eventos) {
    if (evento && evento.evento_id && evento.estado && !Object.hasOwn(evento, 'clave')) {
      estadoPorId.set(evento.evento_id, evento.estado);
    }
  }
  return eventos.filter((evento) => {
    if (!evento || !Object.hasOwn(evento, 'clave') || !Object.hasOwn(clavesValidas, evento.clave)) return false;
    const estado = evento.evento_id
      ? estadoPorId.get(evento.evento_id) ?? evento.estado ?? 'aprobado'
      : evento.estado ?? 'aprobado';
    return estado === 'aprobado';
  }).map(({tipo, clave, valor, rasgos}) => ({
    tipo,
    clave,
    valor,
    rasgos: sanitizarRasgos(rasgos),
  }));
}

// Pares del manifiesto con su grupo y las rutas completas (subcarpeta del proyecto o la base).
export function paresDelManifiesto(base, manifiesto, existe) {
  return Object.entries(manifiesto).flatMap(([grupo, lista]) => lista.map((p) => ({...p, grupo,
    rutaArquitectura: rutaArchivo(base, grupo, p.arquitectura, existe),
    rutaEstructura: rutaArchivo(base, grupo, p.estructura, existe),
    ...(p.metrado ? {rutaMetrado: rutaArchivo(base, grupo, p.metrado, existe)} : {})})));
}
