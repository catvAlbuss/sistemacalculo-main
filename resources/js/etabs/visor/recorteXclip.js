// Recorte de bloques (XCLIP) que el visor no aplica.
//
// En AutoCAD un bloque puede estar recortado (XCLIP): solo se ve lo que cae dentro de un
// rectángulo o polígono. Es típico en el plano de ubicación del rótulo: se inserta el
// terreno completo (miles de entidades, árboles, curvas) y se recorta a una viñeta. La
// librería lee el recorte del DWG (objeto SPATIAL_FILTER) pero no lo usa: el visor dibuja
// el terreno entero alrededor de las láminas ("aparecen objetos que no están en el plano")
// y gasta memoria en ellos.
//
// Aquí:
// 1. Al convertir el DWG se guarda, por base de datos, el recorte de cada inserción
//    (diccionario de extensión → ACAD_FILTER → SPATIAL → SPATIAL_FILTER).
// 2. El bloque que dibuja una inserción recortada (drawableBlockTableRecord) deja fuera las
//    entidades que caen enteras fuera del recorte. Las inserciones anidadas que lo cruzan se
//    filtran igual, por dentro. Lo que cruza el borde se dibuja entero (no se corta la
//    geometría): sobresale un poco, nunca falta nada de lo que está dentro.
// No modifica la base de datos: al guardar, el bloque y su recorte quedan como estaban.

const RECORTES = new WeakMap(); // base de datos → Map(diccionario de extensión → polígono)
const POLIGONO = Symbol.for("novacad.xclip.poligono");
const CLAVE = Symbol.for("novacad.xclip.clave");
const MARCA = Symbol.for("novacad.xclip.instalado");
const MAX_PROFUNDIDAD = 8;

export const normalizarHandle = (h) => (h === undefined || h === null || h === "" ? "" : String(h).trim().toUpperCase().replace(/^0+(?=.)/, ""));

// ---- Geometría 2D ----

// Matriz 3x4 por filas de SPATIAL_FILTER (lleva puntos del bloque al sistema del recorte).
// Devuelve la inversa aplicada a cada vértice: el polígono en coordenadas del bloque.
function aCoordenadasDeBloque(vertices, m) {
  if (!Array.isArray(m) || m.length < 12) return vertices;
  const [a, b, , tx, c, d, , ty] = m;
  const det = a * d - b * c;
  if (Math.abs(det) < 1e-12) return vertices;
  return vertices.map(({x, y}) => {
    const px = x - tx, py = y - ty;
    return {x: (d * px - b * py) / det, y: (-c * px + a * py) / det};
  });
}

// Polígono del recorte en coordenadas del bloque. Dos vértices = rectángulo (esquinas).
export function poligonoDeFiltro(filtro) {
  const v = (filtro?.vertices ?? []).filter((p) => Number.isFinite(p?.x) && Number.isFinite(p?.y));
  if (v.length < 2) return null;
  const base = v.length === 2
    ? [{x: v[0].x, y: v[0].y}, {x: v[1].x, y: v[0].y}, {x: v[1].x, y: v[1].y}, {x: v[0].x, y: v[1].y}]
    : v;
  return aCoordenadasDeBloque(base, filtro.matrix);
}

const dentroPoligono = (p, poli) => {
  let dentro = false;
  for (let i = 0, j = poli.length - 1; i < poli.length; j = i++) {
    const a = poli[i], b = poli[j];
    if ((a.y > p.y) !== (b.y > p.y) && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) dentro = !dentro;
  }
  return dentro;
};

const cruzan = (p1, p2, p3, p4) => {
  const o = (a, b, c) => Math.sign((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));
  return o(p1, p2, p3) !== o(p1, p2, p4) && o(p3, p4, p1) !== o(p3, p4, p2);
};

// "fuera" | "dentro" | "borde" de una caja {min, max} respecto del polígono.
export function clasificarCaja(caja, poli) {
  const {min, max} = caja;
  const esquinas = [{x: min.x, y: min.y}, {x: max.x, y: min.y}, {x: max.x, y: max.y}, {x: min.x, y: max.y}];
  const adentro = esquinas.filter((p) => dentroPoligono(p, poli)).length;
  if (adentro === 4) return "dentro";
  if (adentro > 0) return "borde";
  if (poli.some((p) => p.x >= min.x && p.x <= max.x && p.y >= min.y && p.y <= max.y)) return "borde";
  for (let i = 0; i < 4; i++) {
    for (let j = 0, k = poli.length - 1; j < poli.length; k = j++) {
      if (cruzan(esquinas[i], esquinas[(i + 1) % 4], poli[j], poli[k])) return "borde";
    }
  }
  return "fuera";
}

// Lleva el polígono (coordenadas del bloque padre) al bloque de una inserción anidada.
function alBloqueAnidado(poli, insercion) {
  const t = insercion.blockTransform;
  if (!t?.clone) return null;
  const inv = t.clone().invert();
  const e = inv.elements; // por columnas, como three.js
  if (!e || e.some((x) => !Number.isFinite(x))) return null;
  return poli.map(({x, y}) => ({x: e[0] * x + e[4] * y + e[12], y: e[1] * x + e[5] * y + e[13]}));
}

// Corta una polilínea (lista de puntos {x, y, z?}) con el polígono: devuelve los tramos
// que quedan dentro. Sirve para polígonos cóncavos (intersecciones ordenadas por tramo).
export function recortarPolilinea(puntos, poli) {
  const tramos = [];
  let actual = null;
  const cerca = (a, b) => Math.abs(a.x - b.x) < 1e-9 && Math.abs(a.y - b.y) < 1e-9;
  const en = (p, q, t) => ({x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t, z: (p.z ?? 0) + ((q.z ?? 0) - (p.z ?? 0)) * t});
  for (let s = 0; s + 1 < puntos.length; s++) {
    const p = puntos[s], q = puntos[s + 1];
    const ts = [0, 1];
    const dx = q.x - p.x, dy = q.y - p.y;
    for (let j = 0, k = poli.length - 1; j < poli.length; k = j++) {
      const a = poli[k], b = poli[j];
      const ex = b.x - a.x, ey = b.y - a.y;
      const den = dx * ey - dy * ex;
      if (Math.abs(den) < 1e-15) continue;
      const t = ((a.x - p.x) * ey - (a.y - p.y) * ex) / den;
      const u = ((a.x - p.x) * dy - (a.y - p.y) * dx) / den;
      if (t > 0 && t < 1 && u >= 0 && u <= 1) ts.push(t);
    }
    ts.sort((x, y) => x - y);
    for (let i = 0; i + 1 < ts.length; i++) {
      const t0 = ts[i], t1 = ts[i + 1];
      if (t1 - t0 < 1e-12) continue;
      if (!dentroPoligono(en(p, q, (t0 + t1) / 2), poli)) { actual = null; continue; }
      const a = en(p, q, t0), b = en(p, q, t1);
      if (actual && cerca(actual[actual.length - 1], a)) actual.push(b);
      else { actual = [a, b]; tramos.push(actual); }
    }
  }
  return tramos;
}

// Renderer que corta en el borde del recorte todo lo que se dibuja como líneas.
function rendererRecortado(renderer, poli) {
  return new Proxy(renderer, {
    get(objetivo, prop) {
      if (prop === "lines") {
        return (puntos) => {
          const tramos = recortarPolilinea(Array.from(puntos ?? []), poli);
          if (tramos.length === 1) return objetivo.lines(tramos[0]);
          return objetivo.group(tramos.map((t) => objetivo.lines(t)));
        };
      }
      if (prop === "lineSegments") {
        return (arreglo, tam, indices) => {
          const pos = [], idx = [];
          for (let i = 0; i + 1 < indices.length; i += 2) {
            const a = indices[i] * tam, b = indices[i + 1] * tam;
            const p = {x: arreglo[a], y: arreglo[a + 1], z: tam > 2 ? arreglo[a + 2] : 0};
            const q = {x: arreglo[b], y: arreglo[b + 1], z: tam > 2 ? arreglo[b + 2] : 0};
            for (const [u, v] of recortarPolilinea([p, q], poli)) {
              const n = pos.length / tam;
              pos.push(u.x, u.y, ...(tam > 2 ? [u.z] : []), v.x, v.y, ...(tam > 2 ? [v.z] : []));
              idx.push(n, n + 1);
            }
          }
          if (pos.length / tam > 65535) return objetivo.lineSegments(arreglo, tam, indices);
          return objetivo.lineSegments(new Float32Array(pos), tam, new Uint16Array(idx));
        };
      }
      const v = Reflect.get(objetivo, prop, objetivo);
      return typeof v === "function" ? v.bind(objetivo) : v;
    },
    set(objetivo, prop, valor) { return Reflect.set(objetivo, prop, valor, objetivo); },
  });
}

function cajaDe(entidad) {
  try {
    const c = entidad.geometricExtents;
    if (c && Number.isFinite(c.min?.x) && Number.isFinite(c.max?.x) && Number.isFinite(c.min?.y) && Number.isFinite(c.max?.y)) return c;
  } catch { /* sin extensión: se conserva */ }
  return null;
}

// ---- Bloque recortado ----

const esInsercion = (e, ClaseInsercion) => (ClaseInsercion ? e instanceof ClaseInsercion : typeof e?.blockTransform === "object" && "drawableBlockTableRecord" in e);

// Entidades del bloque que se dibujan con el recorte `poli` (coordenadas del bloque).
export function entidadesRecortadas(registro, poli, clave, ClaseInsercion, profundidad = 0) {
  const resultado = [];
  for (const e of registro.newIterator()) {
    const caja = cajaDe(e);
    const lado = caja ? clasificarCaja(caja, poli) : "borde";
    if (lado === "fuera") continue;
    if (lado === "borde" && profundidad < MAX_PROFUNDIDAD && esInsercion(e, ClaseInsercion)
        && Math.max(1, e.columnCount ?? 1) === 1 && Math.max(1, e.rowCount ?? 1) === 1) {
      const interior = alBloqueAnidado(poli, e);
      if (interior) {
        // Copia ligera de la inserción que dibuja su bloque también recortado.
        const copia = Object.create(e);
        copia[POLIGONO] = interior;
        copia[CLAVE] = `${clave}/${normalizarHandle(e.objectId) || resultado.length}`;
        copia[Symbol.for("novacad.xclip.profundidad")] = profundidad + 1;
        resultado.push(copia);
        continue;
      }
    }
    if (lado === "borde" && typeof e.subWorldDraw === "function" && !esInsercion(e, ClaseInsercion)) {
      // Cruza el borde: se dibuja cortada (líneas, polilíneas, arcos discretizados, patrones).
      const copia = Object.create(e);
      const dibujar = e.subWorldDraw;
      copia.subWorldDraw = function (renderer, ...resto) { return dibujar.call(this, rendererRecortado(renderer, poli), ...resto); };
      resultado.push(copia);
      continue;
    }
    resultado.push(e);
  }
  return resultado;
}

const PROXIES = new WeakMap(); // registro original → Map(clave → registro recortado)

function registroRecortado(registro, poli, clave, ClaseInsercion, profundidad) {
  let porClave = PROXIES.get(registro);
  if (!porClave) PROXIES.set(registro, (porClave = new Map()));
  if (porClave.has(clave)) return porClave.get(clave);
  let lista = null;
  const entidades = () => (lista ??= entidadesRecortadas(registro, poli, clave, ClaseInsercion, profundidad));
  const nombre = `${registro.name}|xclip|${clave}`;
  const proxy = new Proxy(registro, {
    get(objetivo, prop) {
      if (prop === "name") return nombre;
      if (prop === "newIterator") {
        return () => {
          const arr = entidades();
          let i = 0;
          return {
            [Symbol.iterator]() { return this; },
            next: () => (i < arr.length ? {value: arr[i++], done: false} : {value: undefined, done: true}),
            toArray: () => arr.slice(),
          };
        };
      }
      const v = Reflect.get(objetivo, prop, objetivo);
      return typeof v === "function" ? v.bind(objetivo) : v;
    },
  });
  porClave.set(clave, proxy);
  return proxy;
}

export function recorteDeInsercion(insercion) {
  const propio = insercion?.[POLIGONO];
  if (propio) return {poli: propio, clave: insercion[CLAVE]};
  const xd = normalizarHandle(insercion?.extensionDictionary);
  if (!xd) return null;
  let db = null;
  try { db = insercion.database; } catch { return null; }
  const poli = db && RECORTES.get(db)?.get(xd);
  return poli ? {poli, clave: normalizarHandle(insercion.objectId) || xd} : null;
}

// Recortes del modelo crudo de LibreDWG: diccionario de extensión de la inserción → polígono.
export function recortesDelModelo(model) {
  const filtros = model?.objects?.SPATIAL_FILTER ?? [];
  const recortes = new Map();
  if (!filtros.length) return recortes;
  const dics = new Map((model.objects.DICTIONARY ?? []).map((d) => [normalizarHandle(d.handle), d]));
  for (const f of filtros) {
    const poli = poligonoDeFiltro(f);
    if (!poli) continue;
    // SPATIAL_FILTER ← diccionario ACAD_FILTER {SPATIAL} ← diccionario de extensión {ACAD_FILTER}
    const filtroDic = dics.get(normalizarHandle(f.ownerHandle));
    const xd = normalizarHandle(filtroDic?.ownerHandle);
    if (xd) recortes.set(xd, poli);
  }
  return recortes;
}

export function registrarRecortes(db, recortes) {
  if (db && recortes?.size) RECORTES.set(db, recortes);
}

// Instala ambas partes. Clases: AcDbLibreDwgConverter y AcDbBlockReference.
export function instalarRecorteXclip({AcDbLibreDwgConverter, AcDbBlockReference}) {
  let instalado = false;
  const conv = AcDbLibreDwgConverter?.prototype;
  if (conv && !conv[MARCA] && typeof conv.processObjects === "function") {
    const original = conv.processObjects;
    conv.processObjects = function (model, db) {
      try { registrarRecortes(db, recortesDelModelo(model)); } catch { /* sin recortes: se dibuja como antes */ }
      return original.call(this, model, db);
    };
    Object.defineProperty(conv, MARCA, {value: true});
    instalado = true;
  }
  const ins = AcDbBlockReference?.prototype;
  const d = ins && Object.getOwnPropertyDescriptor(ins, "drawableBlockTableRecord");
  if (d?.get && !ins[MARCA]) {
    Object.defineProperty(ins, "drawableBlockTableRecord", {
      ...d,
      get() {
        const registro = d.get.call(this);
        if (!registro) return registro;
        const r = recorteDeInsercion(this);
        if (!r) return registro;
        return registroRecortado(registro, r.poli, r.clave, AcDbBlockReference, this[Symbol.for("novacad.xclip.profundidad")] ?? 0);
      },
    });
    Object.defineProperty(ins, MARCA, {value: true});
    instalado = true;
  }
  return instalado;
}
