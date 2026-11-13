// Lector "global" de planos de arquitectura: explota bloques anidados, encuentra
// los ejes con su nombre (burbujas 8, 10, Y´, Z´… incluso inclinados), separa las
// vistas del archivo (cada planta con su grilla) y reconoce columnas como los
// contornos cerrados que caen en las intersecciones de ejes, sin depender del
// nombre de la capa. Todo en unidades del dibujo; el escalado lo hace quien llama.

// Capas que nunca son columna aunque tengan contornos chicos en un eje.
export const CAPAS_NO_COLUMNA = /mobil|equip|mueble|puerta|ventana|vano|texto|text|cota|acot|dim|aparato|sanit|indicador|area|piso|achur|hatch|textur|eje|axis|corte|elevaci|proyecc|techo|tabique|muro|wall|cuadro|detalle|vereda|jard|calle|terreno|celosi|junta|niveles?$/i;
const CAPAS_EJE = /eje|axis|grid/i;
const CAPAS_ESTRUCTURA = /col|placa|estruc/i;
// Rótulo de eje: 1-3 caracteres alfanuméricos, con prima opcional (Y´, A').
const ROTULO_EJE = /^[A-Za-z0-9]{1,3}\s*[´'`’]?$/;
const TITULO_VISTA = /nivel|planta|piso|techo|azotea|cimentaci|aligerad|losa|platea|cimiento/i;

const MAX_PROFUNDIDAD = 8;
const IDENTIDAD = [1, 0, 0, 0, 1, 0];

const aplicar = (m, p) => ({x: m[0] * p.x + m[1] * p.y + m[2], y: m[3] * p.x + m[4] * p.y + m[5]});
const componer = (a, b) => [
  a[0] * b[0] + a[1] * b[3], a[0] * b[1] + a[1] * b[4], a[0] * b[2] + a[1] * b[5] + a[2],
  a[3] * b[0] + a[4] * b[3], a[3] * b[1] + a[4] * b[4], a[3] * b[2] + a[4] * b[5] + a[5],
];
const escalaDe = (m) => Math.sqrt(Math.abs(m[0] * m[4] - m[1] * m[3])) || 1;
// Texto legible de un TEXT/MTEXT. Los caracteres fuera de ASCII llegan como "\U+00D3"
// (el lector DWG del navegador): se decodifican con sus 4 cifras exactas. Si quedaran
// crudos, el visor los lee con 5 ("\U+00D3D" de "MÓDULO") y dibuja "M?ULO" en los
// títulos que el agente copia de la arquitectura.
export const textoPlano = (value) => String(value ?? "")
  .replace(/\\U\+([0-9A-Fa-f]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
  .replace(/\\P/g, " ").replace(/\\[A-Za-z][^;\\]*;/g, "").replace(/[{}]/g, "")
  .replace(/%%[cC]/g, "Ø").replace(/%%[dD]/g, "°").replace(/%%[pP]/g, "±").replace(/%%[uUoO]/g, "")
  .replace(/\s+/g, " ").trim();

// Matriz 2D del INSERT del visor (AcGeMatrix3d en orden de columnas) más el
// espejo de la extrusión (0,0,-1), que AutoCAD aplica después.
function matrizInsert(entity) {
  const e = entity.blockTransform?.elements;
  if (!e) return null;
  const m = [e[0], e[4], e[12], e[1], e[5], e[13]];
  return (entity.normal?.z ?? 1) < 0 ? [-m[0], -m[1], -m[2], m[3], m[4], m[5]] : m;
}

const tipoDe = (entity) => String(entity.dxfTypeName ?? "").toUpperCase();

// Recorre el espacio modelo con los bloques explotados. Devuelve elementos simples:
// {tipo: "linea"|"poli"|"circulo"|"texto", capa, puntos, cerrada, centro, radio, texto, bloque}.
// Las capas "0" heredan la capa del bloque que las inserta, como en AutoCAD.
export function aplanarModelo(entidades, {capasApagadas = new Set()} = {}) {
  const items = [];
  const bloques = new Map();
  const visitar = (lista, m, capaPadre, profundidad, ruta) => {
    for (const entity of lista) {
      const capa = entity.layer === "0" && capaPadre ? capaPadre : entity.layer;
      if (capasApagadas.has(capa)) continue;
      const tipo = tipoDe(entity);
      if (tipo === "INSERT") {
        if (profundidad >= MAX_PROFUNDIDAD) continue;
        const local = matrizInsert(entity);
        // El bloque tal como se dibuja: representación dinámica y recorte XCLIP si los hay.
        const registro = entity.drawableBlockTableRecord ?? entity.blockTableRecord;
        if (local && registro) {
          bloques.set(entity.blockName, (bloques.get(entity.blockName) ?? 0) + 1);
          visitar(registro.newIterator().toArray(), componer(m, local), capa, profundidad + 1, ruta ? `${ruta}/${entity.blockName}` : entity.blockName);
        }
        // Los atributos ya están en coordenadas del bloque padre.
        for (const attr of entity.attributeIterator?.() ?? []) {
          if (attr.isInvisible) continue;
          const at = attr.position;
          if (at) items.push({tipo: "texto", capa: attr.layer === "0" ? capa : attr.layer, centro: aplicar(m, at), texto: textoPlano(attr.textString), alto: (attr.height ?? 0) * escalaDe(m), bloque: ruta});
        }
        continue;
      }
      if (tipo === "LINE" && entity.startPoint && entity.endPoint) {
        items.push({tipo: "linea", capa, puntos: [aplicar(m, entity.startPoint), aplicar(m, entity.endPoint)], bloque: ruta});
      } else if (Number.isInteger(entity.numberOfVertices) && (entity.getPoint3dAt || entity.getPointAt)) {
        const leer = entity.getPoint3dAt || entity.getPointAt;
        const puntos = Array.from({length: entity.numberOfVertices}, (_, i) => aplicar(m, leer.call(entity, i)));
        items.push({tipo: "poli", capa, puntos, cerrada: entity.closed === true, bloque: ruta});
      } else if (tipo === "CIRCLE" && entity.center) {
        items.push({tipo: "circulo", capa, centro: aplicar(m, entity.center), radio: entity.radius * escalaDe(m), bloque: ruta});
      } else if (tipo === "TEXT" || tipo === "MTEXT" || tipo === "ATTDEF") {
        const at = entity.position ?? entity.location;
        if (at && tipo !== "ATTDEF") items.push({tipo: "texto", capa, centro: aplicar(m, at), texto: textoPlano(entity.textString ?? entity.contents), alto: (entity.height ?? 0) * escalaDe(m), bloque: ruta});
      }
    }
  };
  visitar(entidades, IDENTIDAD, null, 0, "");
  return {items, bloques};
}

// ---------- Ejes ----------

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// Burbujas de eje: círculos en capas de ejes con un rótulo corto adentro.
function burbujas(items) {
  const textos = items.filter((it) => it.tipo === "texto" && ROTULO_EJE.test(it.texto));
  const circulos = items.filter((it) => it.tipo === "circulo" && CAPAS_EJE.test(it.capa) && it.radio > 0);
  const resultado = [];
  for (const c of circulos) {
    // El punto de inserción del texto suele estar en la esquina: se toma el más cercano dentro de 1.6 r.
    let mejor = null;
    for (const t of textos) {
      const d = dist(t.centro, c.centro);
      if (d <= c.radio * 1.6 && (!mejor || d < mejor.d)) mejor = {d, t};
    }
    if (mejor) resultado.push({centro: c.centro, radio: c.radio, nombre: mejor.t.texto.replace(/\s+/g, "").replace(/[`’']/g, "´")});
  }
  // Círculos duplicados (contorno doble) se quedan una vez.
  return resultado.filter((b, i) => !resultado.slice(0, i).some((o) => o.nombre === b.nombre && dist(o.centro, b.centro) < b.radio * 0.2));
}

// Dirección del eje que sale de una burbuja suelta: el trazo de eje más largo que nace en ella.
function direccionSuelta(b, items) {
  let mejor = null;
  for (const it of items) {
    if (it.tipo !== "linea" || !CAPAS_EJE.test(it.capa)) continue;
    const [p, q] = it.puntos;
    const dp = dist(p, b.centro), dq = dist(q, b.centro);
    const cerca = Math.min(dp, dq), lejos = Math.max(dp, dq);
    if (cerca > b.radio * 1.6 || lejos < b.radio * 2) continue;
    if (!mejor || lejos > mejor.largo) mejor = {largo: lejos, hacia: dp < dq ? q : p};
  }
  return mejor;
}

// Ejes con nombre: dos burbujas con el mismo rótulo definen el eje (aunque esté
// inclinado). Se emparejan por cercanía para no mezclar vistas del mismo archivo.
export function detectarEjesNombrados(items) {
  const lista = burbujas(items);
  const trazos = lista.map((b) => direccionSuelta(b, items));
  // El trazo que sale de cada burbuja debe apuntar hacia la otra (±15°).
  const apunta = (i, j) => {
    const t = trazos[i];
    if (!t) return true;
    const a = lista[i].centro, b = lista[j].centro;
    const u = {x: t.hacia.x - a.x, y: t.hacia.y - a.y}, v = {x: b.x - a.x, y: b.y - a.y};
    return (u.x * v.x + u.y * v.y) / (Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y) || 1) > 0.966;
  };
  const usados = new Set();
  const ejes = [];
  const pares = [];
  lista.forEach((a, i) => lista.forEach((b, j) => {
    if (j > i && a.nombre === b.nombre && dist(a.centro, b.centro) > a.radio * 4 && apunta(i, j) && apunta(j, i)) pares.push({i, j, d: dist(a.centro, b.centro)});
  }));
  pares.sort((p, q) => p.d - q.d);
  // Dirección local junto a cada burbuja: el trazo dibujado o, si no hay, la cuerda.
  const unitario = (a, b) => { const l = dist(a, b) || 1; return {x: (b.x - a.x) / l, y: (b.y - a.y) / l}; };
  for (const {i, j} of pares) {
    if (usados.has(i) || usados.has(j)) continue;
    usados.add(i); usados.add(j);
    const p = lista[i].centro, q = lista[j].centro;
    ejes.push({
      nombre: lista[i].nombre, p, q, radio: lista[i].radio,
      dp: trazos[i] ? unitario(p, trazos[i].hacia) : unitario(p, q),
      dq: trazos[j] ? unitario(q, trazos[j].hacia) : unitario(q, p),
    });
  }
  lista.forEach((b, i) => {
    if (usados.has(i)) return;
    const dir = trazos[i];
    if (dir) ejes.push({nombre: b.nombre, p: b.centro, q: dir.hacia, radio: b.radio, suelto: true});
  });
  return ejes;
}

// Intersección de las rectas de dos ejes, si cae dentro del tramo de ambos (con holgura).
function cruce(a, b) {
  const d1 = {x: a.q.x - a.p.x, y: a.q.y - a.p.y}, d2 = {x: b.q.x - b.p.x, y: b.q.y - b.p.y};
  const den = d1.x * d2.y - d1.y * d2.x;
  const l1 = Math.hypot(d1.x, d1.y), l2 = Math.hypot(d2.x, d2.y);
  if (Math.abs(den) < 0.3 * l1 * l2) return null; // casi paralelos (< ~17°)
  const t = ((b.p.x - a.p.x) * d2.y - (b.p.y - a.p.y) * d2.x) / den;
  const u = ((b.p.x - a.p.x) * d1.y - (b.p.y - a.p.y) * d1.x) / den;
  const h1 = a.suelto ? 0.05 : -0.02, h2 = b.suelto ? 0.05 : -0.02;
  // Un eje suelto solo conoce su trazo: se prolonga un poco (30 %), no sin límite;
  // si no, los ejes de cortes y elevaciones cruzan las plantas vecinas de la hoja.
  const fuera = (s, suelto, h) => (suelto ? s < h || s > 1.3 : s < -h || s > 1 + h);
  if (fuera(t, a.suelto, h1) || fuera(u, b.suelto, h2)) return null;
  const aprox = {x: a.p.x + t * d1.x, y: a.p.y + t * d1.y};
  // Ejes quebrados (Z´ del módulo 14): cerca de cada extremo manda el trazo de
  // esa burbuja, no la cuerda. Se corta con los tramos del extremo más cercano.
  const tramo = (e, s) => (!e.dp ? {o: e.p, d: unitario2(e.p, e.q)} : s <= 0.5 ? {o: e.p, d: e.dp} : {o: e.q, d: e.dq});
  const ra = tramo(a, t), rb = tramo(b, u);
  const den2 = ra.d.x * rb.d.y - ra.d.y * rb.d.x;
  if (Math.abs(den2) < 0.25) return {...aprox, alternos: []};
  const s = ((rb.o.x - ra.o.x) * rb.d.y - (rb.o.y - ra.o.y) * rb.d.x) / den2;
  const fino = {x: ra.o.x + s * ra.d.x, y: ra.o.y + s * ra.d.y};
  return dist(fino, aprox) < 0.25 * Math.min(l1, l2) ? {...fino, alternos: [aprox]} : {...aprox, alternos: []};
}
const unitario2 = (a, b) => { const l = dist(a, b) || 1; return {x: (b.x - a.x) / l, y: (b.y - a.y) / l}; };

// Vistas = grillas: componentes de ejes que se cruzan entre sí. Las elevaciones
// (solo ejes paralelos) quedan fuera. A cada grilla se le busca su título.
export function detectarVistas(items) {
  const ejes = detectarEjesNombrados(items);
  const padre = ejes.map((_, i) => i);
  const raiz = (i) => (padre[i] === i ? i : (padre[i] = raiz(padre[i])));
  const cruces = [];
  // Una grilla usa un solo tamaño de burbuja: los planos clave (burbujas diminutas)
  // y las llamadas de corte no se mezclan con la planta.
  const mismaBurbuja = (a, b) => Math.max(a.radio, b.radio) / (Math.min(a.radio, b.radio) || 1e-9) < 1.5;
  for (let i = 0; i < ejes.length; i++) for (let j = i + 1; j < ejes.length; j++) {
    if (!mismaBurbuja(ejes[i], ejes[j])) continue;
    const punto = cruce(ejes[i], ejes[j]);
    if (!punto) continue;
    padre[raiz(i)] = raiz(j);
    cruces.push({i, j, punto});
  }
  const grupos = new Map();
  ejes.forEach((_, i) => grupos.set(raiz(i), [...(grupos.get(raiz(i)) ?? []), i]));
  const titulos = items.filter((it) => it.tipo === "texto" && TITULO_VISTA.test(it.texto) && it.texto.length > 6);
  const vistas = [];
  for (const indices of grupos.values()) {
    const propios = cruces.filter((c) => indices.includes(c.i));
    if (indices.length < 2 || !propios.length) continue;
    const pts = indices.flatMap((i) => [ejes[i].p, ejes[i].q]);
    const caja = {x0: Math.min(...pts.map((p) => p.x)), y0: Math.min(...pts.map((p) => p.y)), x1: Math.max(...pts.map((p) => p.x)), y1: Math.max(...pts.map((p) => p.y))};
    const radio = Math.max(...indices.map((i) => ejes[i].radio));
    // Título: el texto de vista más cercano por debajo o dentro de la grilla.
    const ancho = caja.x1 - caja.x0, alto = caja.y1 - caja.y0;
    const candidatos = titulos.filter((t) => t.centro.x > caja.x0 - ancho * 0.3 && t.centro.x < caja.x1 + ancho * 0.3 && t.centro.y > caja.y0 - alto * 0.6 && t.centro.y < caja.y1);
    // El título va debajo de la grilla y es de los textos grandes; los textos dentro
    // de la planta (leyendas de acabados, "piso de porcelanato…") casi nunca lo son.
    const altoMax = Math.max(0, ...candidatos.map((t) => t.alto ?? 0));
    const puntaje = (t) => Math.abs(t.centro.y - caja.y0)
      + (t.centro.y > caja.y0 + radio * 2 ? alto : 0)
      + ((t.alto ?? 0) < altoMax * 0.6 ? alto * 0.5 : 0)
      - (/planta|plano|nivel/i.test(t.texto) ? radio * 4 : 0);
    const titulo = candidatos.sort((a, b) => puntaje(a) - puntaje(b))[0]?.texto ?? "";
    vistas.push({
      titulo,
      ejes: indices.map((i) => ejes[i]),
      intersecciones: propios.map((c) => ({ejes: [ejes[c.i].nombre, ejes[c.j].nombre], ...c.punto})),
      caja, radio,
    });
  }
  // Orden de lectura: de arriba hacia abajo y de izquierda a derecha.
  vistas.sort((a, b) => (Math.abs(a.caja.y1 - b.caja.y1) > (a.caja.y1 - a.caja.y0) * 0.5 ? b.caja.y1 - a.caja.y1 : a.caja.x0 - b.caja.x0));
  vistas.forEach((v, i) => { v.indice = i + 1; });
  return vistas;
}

// ---------- Columnas ----------

const area = (pts) => Math.abs(pts.reduce((s, p, i) => s + p.x * pts[(i + 1) % pts.length].y - pts[(i + 1) % pts.length].x * p.y, 0)) / 2;
const cajaDe = (pts) => ({x0: Math.min(...pts.map((p) => p.x)), y0: Math.min(...pts.map((p) => p.y)), x1: Math.max(...pts.map((p) => p.x)), y1: Math.max(...pts.map((p) => p.y))});

function distanciaAlContorno(p, pts) {
  let mejor = Infinity;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2));
    mejor = Math.min(mejor, Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy));
  }
  return mejor;
}
function dentro(p, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i], b = pts[j];
    if ((a.y > p.y) !== (b.y > p.y) && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

// Quita vértices repetidos y los que están en medio de un lado recto: una L dibujada
// con un vértice de más no es una sección "irregular".
function sinColineales(pts, k) {
  let out = pts.filter((p, i) => dist(p, pts[(i + 1) % pts.length]) > 1e-4 * k);
  out = out.filter((b, i) => {
    const a = out[(i - 1 + out.length) % out.length], c = out[(i + 1) % out.length];
    const u = {x: b.x - a.x, y: b.y - a.y}, v = {x: c.x - b.x, y: c.y - b.y};
    return Math.abs(u.x * v.y - u.y * v.x) / ((Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y)) || 1) > 0.005; // < 0.3°: mismo lado
  });
  return out.length >= 3 ? out : pts;
}

// Contornos cerrados (o casi: las copias de tarrajeo suelen quedar abiertas).
function contornos(items, k) {
  const lista = [];
  for (const it of items) {
    if (it.tipo !== "poli" || it.puntos.length < 3 || CAPAS_NO_COLUMNA.test(it.capa)) continue;
    let pts = it.puntos;
    // Cerrada "a mano": el último vértice repite el primero (placa del módulo 3).
    const cerrada = it.cerrada || (pts.length > 3 && dist(pts[0], pts.at(-1)) < 1e-6 * k);
    if (pts.length > 3 && dist(pts[0], pts.at(-1)) < 1e-6 * k) pts = pts.slice(0, -1);
    pts = sinColineales(pts, k);
    const c = cajaDe(pts);
    const lado = Math.max(c.x1 - c.x0, c.y1 - c.y0), corto = Math.min(c.x1 - c.x0, c.y1 - c.y0);
    // Hasta 2.5 m: las placas en L o T (1.50x1.00 en el módulo 3) también son candidatas.
    if (corto < 0.12 * k || lado > 2.5 * k) continue;
    if (!cerrada && dist(pts[0], pts.at(-1)) > lado * 0.75) continue;
    lista.push({pts, caja: c, area: area(pts), capa: it.capa});
  }
  return lista;
}

// Columnas = contornos que tocan una intersección de ejes de la vista. Si hay
// varios (columna + tarrajeo + achurado), se toma el de menor área: el concreto.
export function columnasEnVista(items, vista, k = 1) {
  const tol = 0.06 * k, alcance = 0.3 * k;
  // Una columna mide al menos 0.25 m de lado mayor: los cuadraditos menores en un cruce
  // son columnetas o adornos (0.20x0.20 del módulo 3).
  const candidatos = contornos(items, k).filter((c) => c.caja.x0 <= vista.caja.x1 && c.caja.x1 >= vista.caja.x0 && c.caja.y0 <= vista.caja.y1 && c.caja.y1 >= vista.caja.y0
    && Math.max(c.caja.x1 - c.caja.x0, c.caja.y1 - c.caja.y0) >= 0.245 * k);
  const columnas = [];
  for (const nodo of vista.intersecciones) {
    // En ejes quebrados el cruce exacto es incierto: se prueban todos los puntos posibles.
    const puntos = [nodo, ...(nodo.alternos ?? [])];
    const lejania = (c) => Math.min(...puntos.map((p) => (dentro(p, c.pts) ? 0 : distanciaAlContorno(p, c.pts))));
    const medidos = candidatos.map((c) => ({c, d: lejania(c)})).filter((m) => m.d <= alcance);
    if (!medidos.length) continue;
    // Si varios tocan el cruce (columna + tarrajeo + achurado) manda el de menor área: el concreto.
    // Si alguno está en una capa estructural (columnas, placas), ese manda.
    let tocan = medidos.filter((m) => m.d <= tol);
    if (tocan.some((m) => CAPAS_ESTRUCTURA.test(m.c.capa))) tocan = tocan.filter((m) => CAPAS_ESTRUCTURA.test(m.c.capa));
    const elegido = (tocan.length ? tocan.sort((a, b) => a.c.area - b.c.area) : medidos.sort((a, b) => a.d - b.d))[0].c;
    if (columnas.some((col) => col.contorno === elegido)) continue;
    columnas.push({contorno: elegido, nodo});
  }
  return columnas.map(({contorno, nodo}) => {
    const {caja, pts} = contorno;
    const b = (caja.x1 - caja.x0) / k, h = (caja.y1 - caja.y0) / k;
    const rect = Math.abs(contorno.area / k ** 2 - b * h) < 0.02 * b * h && pts.length === 4;
    return {
      x: (caja.x0 + caja.x1) / 2 / k, y: (caja.y0 + caja.y1) / 2 / k,
      b: Math.round(b * 100) / 100, h: Math.round(h * 100) / 100,
      area: Math.round((contorno.area / k ** 2) * 10000) / 10000,
      forma: rect ? "rectangular" : pts.length === 4 ? "trapecio" : pts.length === 6 ? "L" : pts.length === 8 ? "T" : "irregular",
      eje: nodo.ejes.slice().sort().join("/"),
      nodo: {x: nodo.x / k, y: nodo.y / k},
      capas: [contorno.capa],
      contorno: pts.map((p) => ({x: p.x / k, y: p.y / k})),
    };
  });
}

// Columnetas de confinamiento: contornos chicos en capas estructurales fuera de los
// cruces (sin repetir las copias superpuestas). Devuelve su geometría en metros.
export function columnetasEnVista(items, vista, columnas, k = 1) {
  const lista = [];
  for (const c of contornos(items, k)) {
    if (!CAPAS_ESTRUCTURA.test(c.capa)) continue;
    // Una columneta mide a lo sumo 0.45 m (0.13x0.64 es un tramo de viga o de muro).
    if (Math.max(c.caja.x1 - c.caja.x0, c.caja.y1 - c.caja.y0) > 0.45 * k) continue;
    if (c.caja.x0 < vista.caja.x0 || c.caja.x1 > vista.caja.x1 || c.caja.y0 < vista.caja.y0 || c.caja.y1 > vista.caja.y1) continue;
    const x = (c.caja.x0 + c.caja.x1) / 2 / k, y = (c.caja.y0 + c.caja.y1) / 2 / k;
    if (columnas.some((col) => Math.abs(col.x - x) < col.b / 2 + 0.02 && Math.abs(col.y - y) < col.h / 2 + 0.02)) continue;
    if (lista.some((o) => Math.abs(o.x - x) < 0.06 && Math.abs(o.y - y) < 0.06)) continue;
    lista.push({
      x, y, b: Math.round(((c.caja.x1 - c.caja.x0) / k) * 100) / 100, h: Math.round(((c.caja.y1 - c.caja.y0) / k) * 100) / 100,
      contorno: c.pts.map((p) => ({x: p.x / k, y: p.y / k})),
    });
  }
  return lista;
}

// Espesor del alma de una sección en L o T de lados b x h y área A: A = t(b + h - t).
export function espesorDeSeccion({forma, b, h, area}) {
  if (forma === "rectangular" || forma === "trapecio") return Math.min(b, h);
  const s = b + h, disc = s * s - 4 * area;
  return disc > 0 ? Math.round(((s - Math.sqrt(disc)) / 2) * 100) / 100 : Math.min(b, h);
}

// Placa o columna, como nombra el ingeniero (módulos 3, 09 y 14):
// - placa (PL): cada ala mide al menos 3 veces el espesor (L 0.90x0.90 y 1.50x1.00 de 0.30);
//   en rectangulares, el lado largo es 4 veces el corto o más;
// - columna T (CT): T cuyas alas no llegan a placa (T 1.00x0.60x0.30);
// - columna (C): el resto (L 0.40x0.40 o 0.50x0.60, rectangulares).
export function claseDeSeccion(c) {
  const t = espesorDeSeccion(c);
  const corto = Math.min(c.b, c.h), largo = Math.max(c.b, c.h);
  if (c.forma === "rectangular" || c.forma === "trapecio") return largo >= 4 * corto - 1e-6 ? {clase: "placa", prefijo: "PL", espesor: t} : {clase: "columna", prefijo: "C", espesor: t};
  if (corto >= 3 * t - 0.02) return {clase: "placa", prefijo: "PL", espesor: t};
  if (c.forma === "T") return {clase: "columna", prefijo: "CT", espesor: t};
  return {clase: "columna", prefijo: "C", espesor: t};
}

// Tipos de columna (C1, CT1, PL1…): misma forma y medidas (redondeadas a 1 cm),
// sin importar la orientación ni el espejo. Se numera por clase.
export function tiposDeColumna(columnas) {
  const firma = (c) => `${c.forma}:${[c.b, c.h].sort((p, q) => p - q).map((v) => v.toFixed(2)).join("x")}:${c.area.toFixed(3)}`;
  const tipos = new Map();
  for (const c of columnas) {
    const key = firma(c);
    Object.assign(c, claseDeSeccion(c));
    if (!tipos.has(key)) tipos.set(key, {forma: c.forma, b: Math.max(c.b, c.h), h: Math.min(c.b, c.h), area: c.area, clase: c.clase, prefijo: c.prefijo, espesor: c.espesor, cantidad: 0, ejes: [], x: c.x, y: c.y});
    const t = tipos.get(key);
    t.cantidad++;
    t.ejes.push(c.eje);
    if (c.y > t.y + 0.3 || (Math.abs(c.y - t.y) <= 0.3 && c.x < t.x)) Object.assign(t, {x: c.x, y: c.y});
  }
  // Las más repetidas primero; a igual cantidad, en orden de lectura de la planta
  // (de arriba hacia abajo, de izquierda a derecha), como numera el expediente.
  const lectura = (a, b) => (Math.abs(a.y - b.y) > 0.3 ? b.y - a.y : a.x - b.x);
  const lista = [...tipos.entries()].sort((a, b) => b[1].cantidad - a[1].cantidad || lectura(a[1], b[1]));
  const contador = {};
  lista.forEach(([, t]) => { contador[t.prefijo] = (contador[t.prefijo] ?? 0) + 1; t.tipo = `${t.prefijo}${contador[t.prefijo]}`; });
  const porFirma = new Map(lista);
  columnas.forEach((c) => { c.tipo = porFirma.get(firma(c)).tipo; });
  return lista.map(([, t]) => t);
}

// Lectura completa de una vista: ejes, columnas y tipos.
export function leerVista(items, vista, k = 1) {
  const columnas = columnasEnVista(items, vista, k);
  // Orden de lectura de abajo hacia arriba e izquierda a derecha; id por posición.
  columnas.sort((p, q) => (Math.abs(p.y - q.y) > 0.3 ? p.y - q.y : p.x - q.x));
  columnas.forEach((c, i) => { c.id = `C${i + 1}`; });
  const tipos = tiposDeColumna(columnas);
  return {
    titulo: vista.titulo,
    ejes: vista.ejes.map((e) => ({nombre: e.nombre, p: {x: e.p.x / k, y: e.p.y / k}, q: {x: e.q.x / k, y: e.q.y / k}, inclinado: (() => { const a = Math.abs(Math.atan2(e.q.y - e.p.y, e.q.x - e.p.x)) % (Math.PI / 2); return Math.min(a, Math.PI / 2 - a) > 0.01; })()})), // > 0.6°: un trazo apenas torcido no es eje inclinado
    columnas, tipos,
    listaColumnetas: columnetasEnVista(items, vista, columnas, k),
    get columnetas() { return this.listaColumnetas.length; },
  };
}
