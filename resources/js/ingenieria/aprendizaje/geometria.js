const CATEGORIAS = ['ejes', 'columnas', 'murosVanos', 'losas'];
const TOLERANCIAS_MAX = {ejes: 0.05, columnas: 0.05, murosVanos: 0.1, losas: 0.1};
const META_F1 = 0.9;

function vistasDe(geometria) {
  return Array.isArray(geometria?.vistas) ? geometria.vistas : [];
}

function identidadVista(vista) {
  if (Number.isFinite(vista?.nivel)) return `nivel:${vista.nivel}`;
  const semantica = vista?.identidad ?? vista?.semantica;
  return typeof semantica === 'string' && semantica.trim()
    ? `semantica:${semantica.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()}`
    : null;
}

function etiquetaVista(vista) {
  return {id: vista?.id ?? null, nivel: Number.isFinite(vista?.nivel) ? vista.nivel : null};
}

function agruparVistas(vistas) {
  const grupos = new Map();
  for (const vista of vistas) {
    const identidad = identidadVista(vista);
    if (identidad) grupos.set(identidad, [...(grupos.get(identidad) ?? []), vista]);
  }
  return grupos;
}

function emparejarVistas(esperada, generada) {
  const gruposE = agruparVistas(esperada);
  const gruposG = agruparVistas(generada);
  const pareadas = [];
  const usadasE = new Set();
  const usadasG = new Set();
  for (const [identidad, listaE] of gruposE) {
    const listaG = gruposG.get(identidad) ?? [];
    if (listaE.length !== 1 || listaG.length !== 1) continue;
    pareadas.push({identidad, esperada: listaE[0], generada: listaG[0]});
    usadasE.add(listaE[0]);
    usadasG.add(listaG[0]);
  }
  return {
    pareadas,
    noEmparejadasEsperadas: esperada.filter((vista) => !usadasE.has(vista)).map(etiquetaVista),
    noEmparejadasGeneradas: generada.filter((vista) => !usadasG.has(vista)).map(etiquetaVista),
  };
}

function limitesDe(vista) {
  const ejes = vista?.categorias?.ejes ?? [];
  const puntosEjes = ejes.flatMap((eje) => eje?.p && eje?.q ? [eje.p, eje.q] : []);
  const puntos = puntosEjes.length ? puntosEjes : [];
  if (!puntosEjes.length) {
    for (const categoria of ['columnas', 'murosVanos', 'losas']) {
      for (const item of vista?.categorias?.[categoria] ?? []) {
        if (item?.centro) puntos.push(item.centro);
        puntos.push(...(item?.contorno ?? item?.puntos ?? []));
      }
    }
  }
  const xs = puntos.map((p) => p?.x).filter(Number.isFinite);
  const ys = puntos.map((p) => p?.y).filter(Number.isFinite);
  return {
    x0: xs.length ? Math.min(...xs) : 0,
    y0: ys.length ? Math.min(...ys) : 0,
  };
}

function longitudEje(eje) {
  return Math.hypot(eje.q.x - eje.p.x, eje.q.y - eje.p.y);
}

function escalaEntreVistas(esperada, generada) {
  const ejesE = new Map((esperada?.categorias?.ejes ?? []).filter((e) => e?.nombre && e.p && e.q).map((e) => [e.nombre, e]));
  const razones = [];
  for (const ejeG of generada?.categorias?.ejes ?? []) {
    const ejeE = ejesE.get(ejeG?.nombre);
    if (!ejeE || !ejeG.p || !ejeG.q) continue;
    const lg = longitudEje(ejeG), le = longitudEje(ejeE);
    if (lg > 1e-9 && le > 1e-9) razones.push(le / lg);
  }
  if (!razones.length) return 1;
  razones.sort((a, b) => a - b);
  return razones[Math.floor(razones.length / 2)];
}

function coordLocal(vista, punto, factor = 1) {
  const origen = limitesDe(vista);
  return {x: (punto.x - origen.x0) * factor, y: (punto.y - origen.y0) * factor};
}

function elementosEmparejados(pareadas, categoria) {
  const esperados = [], generados = [];
  let verdadDisponible = false;
  for (const par of pareadas) {
    const verdad = par.esperada?.categorias?.[categoria];
    if (!Array.isArray(verdad)) continue;
    verdadDisponible = true;
    const propuesta = par.generada?.categorias?.[categoria];
    const escala = escalaEntreVistas(par.esperada, par.generada);
    for (const item of verdad) esperados.push({item, vista: par.esperada, identidad: par.identidad, factor: 1});
    for (const item of Array.isArray(propuesta) ? propuesta : []) {
      generados.push({item, vista: par.generada, identidad: par.identidad, factor: escala});
    }
  }
  return {esperados, generados, verdadDisponible};
}

function categoriasConVerdad(geometria) {
  const vistas = vistasDe(geometria);
  return CATEGORIAS.filter((categoria) => vistas.length > 0
    && vistas.every((vista) => Array.isArray(vista?.categorias?.[categoria])));
}

function categoriasConSalida(geometria) {
  const vistas = vistasDe(geometria);
  return CATEGORIAS.filter((categoria) => vistas.length > 0
    && vistas.every((vista) => Array.isArray(vista?.categorias?.[categoria])));
}

function puntoCentro(item) {
  if (item?.centro && Number.isFinite(item.centro.x) && Number.isFinite(item.centro.y)) return item.centro;
  const puntos = item?.contorno ?? item?.puntos ?? [];
  if (!puntos.length) return null;
  const xs = puntos.map((p) => p.x).filter(Number.isFinite);
  const ys = puntos.map((p) => p.y).filter(Number.isFinite);
  if (!xs.length || !ys.length) return null;
  return {x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2};
}

function dimensiones(item) {
  if (Number.isFinite(item?.b) && Number.isFinite(item?.h)) return {b: item.b, h: item.h};
  const puntos = item?.contorno ?? item?.puntos ?? [];
  const xs = puntos.map((p) => p.x).filter(Number.isFinite);
  const ys = puntos.map((p) => p.y).filter(Number.isFinite);
  return xs.length && ys.length
    ? {b: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys)}
    : null;
}

function distanciaEjes(a, b) {
  if (String(a.item?.nombre ?? '') !== String(b.item?.nombre ?? '')) return Infinity;
  const ap = coordLocal(a.vista, a.item.p), aq = coordLocal(a.vista, a.item.q);
  const bp = coordLocal(b.vista, b.item.p, b.factor), bq = coordLocal(b.vista, b.item.q, b.factor);
  const directa = Math.max(Math.abs(ap.x - bp.x), Math.abs(ap.y - bp.y), Math.abs(aq.x - bq.x), Math.abs(aq.y - bq.y));
  const invertida = Math.max(Math.abs(ap.x - bq.x), Math.abs(ap.y - bq.y), Math.abs(aq.x - bp.x), Math.abs(aq.y - bp.y));
  return Math.min(directa, invertida);
}

function distanciaElemento(a, b) {
  if (a.identidad !== b.identidad) return Infinity;
  if (a.item?.eje != null && b.item?.eje != null && a.item.eje !== b.item.eje) return Infinity;
  if (a.item?.forma && b.item?.forma && a.item.forma !== b.item.forma) return Infinity;
  const centroA = puntoCentro(a.item), centroB = puntoCentro(b.item);
  if (!centroA || !centroB) return Infinity;
  const ca = coordLocal(a.vista, centroA), cb = coordLocal(b.vista, centroB, b.factor);
  let d = Math.max(Math.abs(ca.x - cb.x), Math.abs(ca.y - cb.y));
  const da = dimensiones(a.item), db = dimensiones(b.item);
  if (da && db) {
    d = Math.max(d, Math.abs(da.b - db.b * b.factor), Math.abs(da.h - db.h * b.factor));
  }
  return d;
}

function puntuar(categoria, datos, tolerancia) {
  if (!datos.verdadDisponible) {
    return {aplicable: false, tp: 0, fp: 0, fn: 0, precision: null, recall: null, f1: null};
  }
  const candidatos = [];
  for (let i = 0; i < datos.esperados.length; i++) {
    for (let j = 0; j < datos.generados.length; j++) {
      const d = categoria === 'ejes' ? distanciaEjes(datos.esperados[i], datos.generados[j]) : distanciaElemento(datos.esperados[i], datos.generados[j]);
      if (d <= tolerancia) candidatos.push({i, j, d});
    }
  }
  candidatos.sort((a, b) => a.d - b.d);
  const usadosE = new Set(), usadosG = new Set();
  for (const candidato of candidatos) {
    if (usadosE.has(candidato.i) || usadosG.has(candidato.j)) continue;
    usadosE.add(candidato.i);
    usadosG.add(candidato.j);
  }
  const tp = usadosE.size;
  const fp = datos.generados.length - usadosG.size;
  const fn = datos.esperados.length - tp;
  const precision = datos.generados.length ? tp / datos.generados.length : (datos.esperados.length ? 0 : 1);
  const recall = datos.esperados.length ? tp / datos.esperados.length : 1;
  const f1 = precision + recall ? 2 * precision * recall / (precision + recall) : 0;
  return {aplicable: true, tp, fp, fn, precision, recall, f1};
}

function validarTolerancias(tolerancias) {
  const salida = {unidad: 'm'};
  for (const categoria of CATEGORIAS) {
    const maximo = TOLERANCIAS_MAX[categoria];
    const valor = tolerancias[categoria] ?? maximo;
    if (!Number.isFinite(valor) || valor < 0 || valor > maximo) {
      throw new RangeError(`La tolerancia de ${categoria} debe estar entre 0 y ${maximo} m.`);
    }
    salida[categoria] = valor;
  }
  return salida;
}

/**
 * Compara geometría en metros, alineando origen y escala mediante ejes nombrados.
 * Las tolerancias tienen máximos fijos por categoría y se devuelven en el resultado.
 */
export function compararGeometria(esperada, generada, tolerancias = {}) {
  const toleranciasAplicadas = validarTolerancias(tolerancias);
  const listaE = vistasDe(esperada), listaG = vistasDe(generada);
  const emparejamiento = emparejarVistas(listaE, listaG);
  const categorias = {};
  for (const categoria of CATEGORIAS) {
    const datos = elementosEmparejados(emparejamiento.pareadas, categoria);
    categorias[categoria] = puntuar(categoria, datos, toleranciasAplicadas[categoria]);
  }
  const aplicables = CATEGORIAS.map((categoria) => categorias[categoria]).filter((r) => r.aplicable);
  const f1Macro = aplicables.length ? aplicables.reduce((suma, r) => suma + r.f1, 0) / aplicables.length : null;
  const disponibles = categoriasConVerdad(esperada);
  const faltantes = CATEGORIAS.filter((categoria) => !disponibles.includes(categoria));
  const coberturaCategorias = {
    aplicables: disponibles.length,
    requeridas: CATEGORIAS.length,
    fraccion: disponibles.length / CATEGORIAS.length,
    completa: faltantes.length === 0,
    faltantes,
  };
  const disponiblesSalida = categoriasConSalida(generada);
  const faltantesSalida = CATEGORIAS.filter((categoria) => !disponiblesSalida.includes(categoria));
  const coberturaSalida = {
    aplicables: disponiblesSalida.length,
    requeridas: CATEGORIAS.length,
    fraccion: disponiblesSalida.length / CATEGORIAS.length,
    completa: faltantesSalida.length === 0,
    faltantes: faltantesSalida,
  };
  const vistasCompletas = emparejamiento.noEmparejadasEsperadas.length === 0
    && emparejamiento.noEmparejadasGeneradas.length === 0;
  const coberturaVistas = {
    pareadas: emparejamiento.pareadas.length,
    esperadas: listaE.length,
    generadas: listaG.length,
    fraccion: listaE.length ? emparejamiento.pareadas.length / listaE.length : (listaG.length ? 0 : 1),
    completa: vistasCompletas,
  };
  const completa = coberturaCategorias.completa && coberturaSalida.completa && coberturaVistas.completa;
  return {
    categorias,
    f1Macro,
    tolerancias: toleranciasAplicadas,
    vistas: {
      pareadas: emparejamiento.pareadas.map((par) => ({
        identidad: par.identidad,
        esperada: etiquetaVista(par.esperada),
        generada: etiquetaVista(par.generada),
      })),
      noEmparejadasEsperadas: emparejamiento.noEmparejadasEsperadas,
      noEmparejadasGeneradas: emparejamiento.noEmparejadasGeneradas,
    },
    coberturaCategorias,
    coberturaSalida,
    coberturaVistas,
    completa,
    estado: completa ? (f1Macro >= META_F1 ? 'objetivo_alcanzado' : 'objetivo_no_alcanzado') : 'incompleta',
    objetivoAlcanzado: completa && f1Macro !== null && f1Macro >= META_F1,
  };
}

function identidadModulo(caso) {
  const grupo = String(caso?.grupo ?? '').trim().toLowerCase();
  const id = String(caso?.id ?? '').trim().toLowerCase();
  const numeroModulo = id.match(/^(?:modulo|module)[_-]?0*(\d+)$/)?.[1];
  return {
    grupo,
    id: numeroModulo ? `modulo-${numeroModulo.padStart(2, '0')}` : id,
  };
}

/**
 * Ejecuta una evaluación por módulo excluido. `generar({ objetivo, ejemplos })`
 * recibe solo los demás módulos del mismo grupo y devuelve el descriptor previsto.
 */
export function evaluarLeaveOneModuleOut(casos, generar, tolerancias = {}) {
  if (!Array.isArray(casos) || typeof generar !== 'function') {
    throw new TypeError('Se requieren casos y generar({ objetivo, ejemplos }) para evaluar leave-one-module-out.');
  }
  const identidades = casos.map(identidadModulo);
  if (identidades.some(({grupo, id}) => !grupo || !id)) {
    throw new TypeError('Cada caso debe incluir grupo e id para evaluar sin mezclar proyectos.');
  }
  const modulosPorGrupo = new Map();
  for (const {grupo, id} of identidades) {
    modulosPorGrupo.set(grupo, new Set([...(modulosPorGrupo.get(grupo) ?? []), id]));
  }
  if ([...modulosPorGrupo.values()].some((modulos) => modulos.size < 2)) {
    throw new RangeError('Cada grupo necesita al menos dos módulos distintos para evaluar leave-one-module-out.');
  }
  const toleranciasAplicadas = validarTolerancias(tolerancias);
  const resultados = casos.map((objetivo, indice) => {
    const identidad = identidades[indice];
    const ejemplos = casos.filter((_, i) => {
      const candidata = identidades[i];
      return candidata.grupo === identidad.grupo && candidata.id !== identidad.id;
    });
    const predicha = generar({objetivo, ejemplos});
    const comparacion = compararGeometria(objetivo?.geometria, predicha, toleranciasAplicadas);
    return {
      grupo: objetivo?.grupo ?? null,
      id: objetivo?.id ?? objetivo?.nombre ?? `caso-${indice + 1}`,
      categorias: comparacion.categorias,
      f1Macro: comparacion.f1Macro,
      tolerancias: comparacion.tolerancias,
      coberturaCategorias: comparacion.coberturaCategorias,
      coberturaSalida: comparacion.coberturaSalida,
      coberturaVistas: comparacion.coberturaVistas,
      completa: comparacion.completa,
      estado: comparacion.estado,
      objetivoAlcanzado: comparacion.objetivoAlcanzado,
    };
  });
  const puntuaciones = resultados.map((fila) => fila.f1Macro).filter(Number.isFinite);
  const completo = resultados.every((fila) => fila.completa);
  const f1Macro = puntuaciones.length ? puntuaciones.reduce((suma, f1) => suma + f1, 0) / puntuaciones.length : null;
  return {
    resultados,
    f1Macro,
    tolerancias: toleranciasAplicadas,
    completa: resultados.length > 0 && completo,
    estado: !completo || !resultados.length ? 'incompleta' : (f1Macro >= META_F1 ? 'objetivo_alcanzado' : 'objetivo_no_alcanzado'),
    objetivoAlcanzado: resultados.length > 0 && completo && f1Macro !== null && f1Macro >= META_F1,
  };
}
