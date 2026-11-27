// Arquitectura → estructuras con la plantilla de láminas del despacho
// (public/assets/plantillas/estructuras-laminas.dxf/.json, generada desde un
// expediente de referencia con scripts/agente/generar-plantilla-estructuras.mjs).
//
// La plantilla aporta lo estándar: marco, rótulo, especificaciones técnicas,
// parámetros, detalles típicos y cuadros. Aquí se genera lo propio del proyecto
// desde la arquitectura leída y se encaja en los espacios de la plantilla:
// plano de cimentación, cimiento corrido, aligerado, pórticos y cuadro de columnas,
// con sus títulos ("<PROYECTO> - PLANO DE …") y los datos del rótulo.
// Unidades: las de un dibujo en metros (la plantilla dibuja los planos x2 = 1/25).

import {L, line, text} from "../cad/primitives.js";
import {planoCimentacion, planoCimientoCorrido, planoTabiqueria, escalerasEnPlanta, huellaColumnas} from "../planos/cimentacionPlano.js";
import {predimensionarEscalera, detalleEscalera, detallesEscaleraPorTramo} from "../planos/escaleraPlano.js";
import {direccionPrincipal} from "../planos/aligeradoPlano.js";
import {planoAligerado, seccionViga} from "../planos/aligeradoPlano.js";
import {cuadroColumnas, cuadroColumnetas, cuadroVigas} from "./cuadroColumnas.js";
import {criteriosMetrado} from "../metrado/metrado.js";
import {datosDesdeArquitectura, textoEnCasilla, anchoTexto} from "./rotulo.js";
import {aplicarEstilo} from "../criterios/estiloLaminas.js";
import {separarTextos} from "./separarTextos.js";
import {planoPortico, baseDeNiveles, cumbreraDesdeArquitectura, nivelesDesdeArquitectura, pendienteDesdeArquitectura, pendienteAnotada, vanosDesdeArquitectura} from "../planos/porticoPlano.js";
import {porticoDesdeBiblioteca} from "../planos/porticoBiblioteca.js";
import {aplicarPreferencias} from "../agente/preferenciasCliente.js";
import {preferenciaDeEstilo} from "../aprendizaje/estiloDespacho.js";
import {techoDesdeArquitectura, nivelCumbreraEscrito, cotaDelTecho} from "../lectura/techoArquitectura.js";
import {detalleDesdeBiblioteca} from "./detalleBiblioteca.js";
import {datosParaLaminas, datosTecnicos, CAMPOS_TECNICOS} from "../criterios/datosProyecto.js";
import {MODELO_MUROS_CIMENTACION} from "../aprendizaje/modelosAprendidos.js";
import {predecirModelo} from "../aprendizaje/modelos.js";

// Modelo aprendido de los planos del ingeniero (entrenar-modelos.mjs): qué muros van en la planta de
// cimentación. Sin modelo publicado (no le ganó a la regla), decide la regla escrita.
const decidirMuroAprendido = MODELO_MUROS_CIMENTACION
  ? (rasgos) => predecirModelo(MODELO_MUROS_CIMENTACION.modelo, rasgos) >= MODELO_MUROS_CIMENTACION.umbral : undefined;
import {CRITERIOS} from "../criterios/criteriosEstructurales.js";
import {componerPaqueteLaminas} from "./componerPaquete.js";
import {notasTecnicas} from "./formatoDespacho.js";
import {corteCimientoCorrido} from "./corteCimiento.js";
import {detallesEstandar} from "./detallesEstandar.js";
import {detalleTipicoAligerado, detalleEmpalmesGanchos, cuadroLongitudesDesarrollo, tablaDesencofrado, especificacionLadrillo, cuadroViguetas} from "./detallesTipicos.js";

const r4 = (v) => Math.round(v * 10000) / 10000;
const MESES = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SETIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];

// Transforma primitivas con una función de punto y un factor para radios y textos.
function transformar(primitivas, f, escala) {
  const P = ([x, y]) => { const q = f(x, y); return [r4(q[0]), r4(q[1])]; };
  return primitivas.map((p) => {
    if (p.type === "line") return {...p, a: P(p.a), b: P(p.b)};
    if (p.type === "pline") return {...p, points: p.points.map(P)};
    if (p.type === "circle" || p.type === "arc") return {...p, c: P(p.c), r: p.r * escala};
    if (p.type === "text") return {...p, at: P(p.at), h: p.h * escala};
    if (p.type === "hatch") return {...p, points: p.points.map(P), escala: (p.escala ?? 1) * escala};
    return p;
  });
}

// Encaja un contenido en su espacio a la escala nominal de la lámina. Si la plantilla
// guardó dónde puso el ingeniero las burbujas de ejes de ese plano, el plano se ubica
// igual (mismo centro de la grilla), así ocupa el lugar del original y no pisa nada;
// solo se reduce si la grilla de este proyecto es más grande que la del original.
// Caja de lo que realmente se dibuja (ejes, cotas, textos), no solo de la grilla.
export function cajaDibujo(primitivas) {
  const xs = [], ys = [];
  const add = ([x, y]) => { xs.push(x); ys.push(y); };
  for (const p of primitivas) {
    if (p.type === "line") { add(p.a); add(p.b); }
    else if (p.type === "pline" || p.type === "hatch") p.points.forEach(add);
    else if (p.type === "circle" || p.type === "arc") { add([p.c[0] - p.r, p.c[1] - p.r]); add([p.c[0] + p.r, p.c[1] + p.r]); }
    else if (p.type === "text") {
      // Ancho aproximado del texto según su alineación (sin rotar: los verticales son cortos).
      // Varias líneas (\P): la más ancha y el alto de todas.
      const lineas = String(p.value ?? "").split("\\P");
      const w = Math.max(...lineas.map((l) => anchoTexto(l, p.h ?? 0))), H = (p.h ?? 0) * (1 + 1.6 * (lineas.length - 1));
      const vertical = Math.abs(Math.sin(((p.rot ?? 0) * Math.PI) / 180)) > 0.7;
      if (Number.isInteger(p.ancla) && !vertical) {
        // Punto de inserción del MTEXT (1 arriba-izq … 9 abajo-der): los textos copiados del
        // ingeniero crecen hacia la derecha y abajo de su punto, no alrededor (antes se salían).
        const col = (p.ancla - 1) % 3, fila = Math.floor((p.ancla - 1) / 3);
        const x0 = p.at[0] - (col * w) / 2, y1 = p.at[1] + (fila * H) / 2;
        add([x0, y1 - H]); add([x0 + w, y1]);
        continue;
      }
      const [dx, dy] = vertical ? [H / 2, w / 2] : [w / 2, H / 2];
      const cx = p.align === "izq" && !vertical ? p.at[0] + w / 2 : p.at[0];
      add([cx - dx, p.at[1] - dy]); add([cx + dx, p.at[1] + dy]);
    }
  }
  if (!xs.length) return null;
  // Sin "Math.min(...xs)": un pórtico de la biblioteca trae decenas de miles de puntos.
  const c = {x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity};
  for (let i = 0; i < xs.length; i++) { c.x0 = Math.min(c.x0, xs[i]); c.x1 = Math.max(c.x1, xs[i]); c.y0 = Math.min(c.y0, ys[i]); c.y1 = Math.max(c.y1, ys[i]); }
  return c;
}

function encajar(contenido, caja, nominal, ejesPlantilla = null) {
  const m = contenido.marco;
  const e = contenido.ejes;
  if (ejesPlantilla && e) {
    const ew = e.x1 - e.x0, eh = e.y1 - e.y0, rw = ejesPlantilla.x1 - ejesPlantilla.x, rh = ejesPlantilla.y1 - ejesPlantilla.y;
    let escala = Math.min(nominal, (rw * 1.1) / ew, (rh * 1.1) / eh);
    if (escala > nominal * 0.97) escala = nominal;
    const ex = (e.x0 + e.x1) / 2, ey = (e.y0 + e.y1) / 2;
    let rx = (ejesPlantilla.x + ejesPlantilla.x1) / 2, ry = (ejesPlantilla.y + ejesPlantilla.y1) / 2;
    // Lo dibujado (cotas y rótulos incluidos) no sale de su espacio: si sobresale se corre
    // hacia adentro y, si aun así no entra, se reduce (la escala del título lo dice).
    const d = cajaDibujo(contenido.primitivas);
    if (d) {
      const dw = d.x1 - d.x0, dh = d.y1 - d.y0, cw = caja.x1 - caja.x0, ch = caja.y1 - caja.y0;
      // 3 % de tolerancia (los espacios tienen holgura y el ancho de los textos es estimado).
      const cabe = Math.min(cw / dw, ch / dh) * 1.03;
      // Reducida, a una escala estándar (1/30, 1/40…), no 1/27.
      escala = Math.min(escala, cabe);
    }
    if (escala < nominal * 0.999) escala = 50 / ([30, 35, 40, 50, 75, 100, 125, 150, 200].find((den) => 50 / den <= escala + 1e-9) ?? Math.ceil(50 / escala));
    if (d) {
      const b = {x0: rx + (d.x0 - ex) * escala, y0: ry + (d.y0 - ey) * escala, x1: rx + (d.x1 - ex) * escala, y1: ry + (d.y1 - ey) * escala};
      if (b.x0 < caja.x0) rx += caja.x0 - b.x0; else if (b.x1 > caja.x1) rx -= b.x1 - caja.x1;
      if (b.y0 < caja.y0) ry += caja.y0 - b.y0; else if (b.y1 > caja.y1) ry -= b.y1 - caja.y1;
    }
    return {escala, primitivas: transformar(contenido.primitivas, (x, y) => [rx + (x - ex) * escala, ry + (y - ey) * escala], escala)};
  }
  const cw = m.x1 - m.x0, ch = m.y1 - m.y0;
  // Margen de 0.15 dentro del espacio: dos cuadros vecinos (en la plantilla sus espacios se
  // tocan o se pisan 0.2, p. ej. columnas y columnetas en E-02) quedan separados y nunca
  // se salen de su espacio.
  const g = Math.min(0.15, (caja.x1 - caja.x0) * 0.05, (caja.y1 - caja.y0) * 0.05);
  const escala = Math.min(nominal, (caja.x1 - caja.x0 - 2 * g) / cw, (caja.y1 - caja.y0 - 2 * g) / ch);
  const mx = (m.x0 + m.x1) / 2, my = (m.y0 + m.y1) / 2, cx = (caja.x0 + caja.x1) / 2, cy = (caja.y0 + caja.y1) / 2;
  return {escala, primitivas: transformar(contenido.primitivas, (x, y) => [cx + (x - mx) * escala, cy + (y - my) * escala], escala)};
}

export {cuadroColumnas};

// Nombre del proyecto: el texto más alto del dibujo (p. ej. el título "MÓDULO XIV").
export function proyectoDesdeArquitectura(items, respaldo = "") {
  // La vista elegida manda, aunque su título sea genérico. Un texto grande de otra
  // lámina no puede sustituirlo (por ejemplo, XV al trabajar con el módulo II).
  const modulo = /m[oó]dulo[\s._-]*(\d{1,3}|[IVXLCDM]+)\b/i.exec(respaldo);
  if (modulo) return `MÓDULO ${modulo[1].replace(/^l(?=[VX]$)/, 'I').toUpperCase()}`;
  if (String(respaldo).trim()) return respaldo.toUpperCase().replace(/\s+/g, " ").trim();
  let mejor = null;
  for (const it of items) {
    if (it.tipo !== "texto" || /^E-/.test(it.capa)) continue;
    const t = it.texto.trim();
    if (t.length < 4 || t.length > 40 || /^[\d.,+\-\s:]+$/.test(t)) continue;
    if (!mejor || it.alto > mejor.alto) mejor = {alto: it.alto, texto: t};
  }
  return (mejor?.texto ?? respaldo).toUpperCase().replace(/\s+/g, " ");
}

// Marco de lámina de la arquitectura: el rectángulo cerrado más grande que contiene
// la vista (en metros). Sin marco, la caja de la vista.
export function marcoDeVista(items, caja, k = 1) {
  const c = {x0: caja.x0 / k, y0: caja.y0 / k, x1: caja.x1 / k, y1: caja.y1 / k};
  let mejor = null;
  for (const it of items) {
    if (it.tipo !== "poli" || it.puntos.length < 4 || it.puntos.length > 5) continue;
    const xs = it.puntos.map((p) => p.x / k), ys = it.puntos.map((p) => p.y / k);
    const m = {x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys)};
    const recto = it.puntos.every((p) => [m.x0, m.x1].some((v) => Math.abs(p.x / k - v) < 1e-3) && [m.y0, m.y1].some((v) => Math.abs(p.y / k - v) < 1e-3));
    if (!recto || m.x0 > c.x0 || m.x1 < c.x1 || m.y0 > c.y0 || m.y1 < c.y1) continue;
    if (!mejor || (m.x1 - m.x0) * (m.y1 - m.y0) < (mejor.x1 - mejor.x0) * (mejor.y1 - mejor.y0)) mejor = {...m, detectado: true};
  }
  return mejor ?? c;
}

const ocupado = (items, k, box) => items.some((it) => (it.puntos ?? [it.centro]).some((p) => p && p.x / k > box.x0 && p.x / k < box.x1 && p.y / k > box.y0 && p.y / k < box.y1));

// Orden de los pórticos como en el expediente: ejes con letra (descendente), luego números (descendente).
const ordenEjes = (a, b) => b.nombre.localeCompare(a.nombre, "es", {numeric: true});

// estructura: lo que propuso el agente (aprendizaje/casos.js) para este plano: niveles y si el
// último nivel lleva losa de techo. Con varios niveles, los pórticos llevan sus entrepisos y la
// losa dibujada es la del 1er nivel (entrepiso).
// Desplazamiento entre dos vistas del mismo edificio por sus ejes del mismo nombre (x de los ejes
// verticales, y de los horizontales). ejes: cuántos ejes en común se usaron.
function desplazamientoPorEjes(ejesA = [], ejesB = []) {
  const nombre = (n) => String(n ?? "").replace(/[´'`’]/g, "").trim().toUpperCase();
  const dx = [], dy = [];
  for (const a of ejesA) {
    const b = ejesB.find((e) => nombre(e.nombre) === nombre(a.nombre));
    if (!b) continue;
    const vertical = Math.abs(a.q.x - a.p.x) < Math.abs(a.q.y - a.p.y);
    if (vertical) dx.push((b.p.x + b.q.x) / 2 - (a.p.x + a.q.x) / 2); else dy.push((b.p.y + b.q.y) / 2 - (a.p.y + a.q.y) / 2);
  }
  const med = (v) => (v.length ? [...v].sort((p, q) => p - q)[Math.floor(v.length / 2)] : 0);
  return {x: med(dx), y: med(dy), ejes: Math.min(dx.length, dy.length)};
}

export function laminasConPlantilla({lectura, items, caja, k = 1, config, cimentacion, datos = {}, fecha = new Date(), estructura = {}}) {
  const proyecto = proyectoDesdeArquitectura(items, lectura.titulo || "PROYECTO");
  // Datos del rótulo: el formulario del panel manda; si no, el rótulo de la arquitectura.
  const tecnicos = new Set(CAMPOS_TECNICOS.map((c) => c.campo));
  const datosRotulo = {...datosDesdeArquitectura(items), ...Object.fromEntries(Object.entries(datos ?? {}).filter(([c, v]) => !tecnicos.has(c) && v !== undefined && v !== null && String(v).trim() !== ""))};
  // Datos técnicos (Hz, Df, zona, suelo, categoría, niveles): del panel; si faltan, criterio y aviso.
  const dp = datosParaLaminas(datos, estructura.sugeridos ?? {});
  // De dónde salen Hz y Df (para la observación de cada fila del metrado).
  const dados = datosTecnicos(datos);
  const fuenteDe = (k) => (dados[k] !== null ? "dato del proyecto" : (estructura.sugeridos?.[k] > 0 ? "propuesto por el agente con proyectos parecidos" : "criterio del despacho"));
  const nominal = config.escalaPlanos ?? 1;
  const adaptativa = config.modo === 'adaptativa';
  const previas = items.filter((it) => it.tipo === "texto" && it.capa === L.LAMINA && /^E-\d{2}$/.test(it.texto)).length;

  // Estilo aprendido de los planos terminados del despacho (aprendizaje/estiloDespacho.js).
  const estiloOp = estructura.estiloDespacho?.opciones ?? {};
  const prefEstilo = preferenciaDeEstilo(estructura.estiloDespacho);
  // Contenido de cada espacio.
  // Muros del edificio sobre la planta de cimentación (estructura.murosEnCimentacion; por defecto sí).
  // Con platea solo va la cara exterior del edificio (el ingeniero dibuja el borde) y sin las
  // columnetas interiores; con zapatas, los muros y las vigas de cimentación corridas bajo el muro
  // paralelo (≤ 0.35 m). Medido el 25/11/2026 en 23 módulos: cimentación 62 → 66 % (planoCimentacion).
  const cim = planoCimentacion({lectura, items, caja, k, titulo: lectura.titulo}, {tipo: cimentacion, ...dp.cimentacion, malla: estructura.mallaCimentacion, muros: estructura.murosEnCimentacion !== false,
    reacciones: estructura.reaccionesColumnas ?? null, qadmDelEms: dp.qadmDelEms, decidirMuro: estructura.decidirMuro ?? decidirMuroAprendido,
    // Las caras de los muros en la cimentación solo con el criterio aprendido de un cliente (muro por muro).
    murosCaras: Boolean(estructura.decidirMuro) || estiloOp.murosCimentacion === true,
    // Estilo aprendido de los planos del despacho: columnetas en la cimentación si siempre las dibuja.
    ...(estiloOp.columnetasCimentacion ? {columnetasEnCimentacion: true} : {})});
  const cc = planoCimientoCorrido({lectura, items, caja, k}, {columnetas: lectura.columnetas ?? [], ...(dp.cimentacion.pisos ? {pisos: dp.cimentacion.pisos} : {})});
  const volados = estructura.volados ?? [];
  // Baños en losa maciza solo en losas de entrepiso (con baños encima); en un nivel la losa es techo.
  // Alero solo si la arquitectura lo anota o el techo es inclinado (PTE=…%, cumbrera: módulo XIV,
  // ALERO 0.60); si no, el ingeniero termina la losa en la cara de la viga (medido: sin alero
  // mejoran 12 de 14 plantas de losa de los dos proyectos).
  const conAlero = estructura.techoDosAguas === true || pendienteAnotada(items) || items.some((it) => it.tipo === "texto" && /\balero|\bPTE\s*=?\s*\d|cumbrera/i.test(it.texto ?? ""));
  const alero = conAlero ? null : 0;
  // Techo a dos aguas dibujado en los cortes de la arquitectura: dónde va la cumbrera (en qué eje) y
  // la pendiente de cada faldón. Lo que dice el plano manda sobre la cumbrera supuesta al centro.
  const techoArq = estructura.techoDosAguas === false || !lectura.columnas?.length ? null
    : techoDesdeArquitectura(items, {lectura, k, u: direccionPrincipal(lectura.ejes)});
  // Cada losa con la planta del piso que cubre, como el ingeniero: la de entrepiso con la del 2°
  // nivel y la de techo con la del último (antes ambas copiaban la del 1er nivel). Solo plantas
  // completas (≥ 60 % de las columnas de la base): una caseta de azotea no es la planta del piso.
  const nivelesLosa = Math.max(1, Number(estructura.niveles) || 1);
  const plantaNivel = (n) => (estructura.plantasNiveles ?? []).find((p) => p.nivel === n && (p.lectura?.columnas?.length ?? 0) >= Math.max(2, 0.6 * lectura.columnas.length));
  const plantaEntrepiso = nivelesLosa > 1 ? plantaNivel(2) : null;
  // Peralte de las vigas que no cargan losa: el del proyecto si lo dieron; si no, 0.40, y 0.50 en
  // zona 4 (así en los dos proyectos del despacho: Z=0.25 → 0.40, Z=0.45 → 0.50). Propuesta.
  const vigaSecundaria = Number(datos?.vigaSecundaria) > 0 ? Number(datos.vigaSecundaria) : (dp.sismo?.Z >= 0.45 ? 0.5 : 0.4);
  const vigasProyecto = {pisos: nivelesLosa, vigaSecundaria};
  // Lados del techo que llevan alero: los que tienen CANALETA escrita junto a ellos en la
  // arquitectura; si no hay, los lados cortos (el ingeniero deja el alero en los extremos y termina
  // los lados largos en la cara de la viga: VINCHOS 1, 4 y 8; medido 25/11: 1 63→72 %, 8 74→76 %,
  // 14 54→56 %, ningún módulo baja).
  const aleroParaleloA = (() => {
    if (alero === 0 || !lectura.columnas?.length) return null;
    // Con la cumbrera de la arquitectura, el agua cae a los lados paralelos a ella.
    if (techoArq) return techoArq.linea.d;
    const pano = huellaColumnas(lectura.columnas), du = direccionPrincipal(lectura.ejes), dv = {x: -du.y, y: du.x};
    const rg = (eje) => { const p = pano.map((q) => q.x * eje.x + q.y * eje.y); return [Math.min(...p), Math.max(...p)]; };
    const [u0, u1] = rg(du), [v0, v1] = rg(dv);
    let votos = 0;
    for (const it of items) {
      if (it.tipo !== "texto" || !/CANALETA/i.test(it.texto ?? "") || !it.centro) continue;
      const p = {x: it.centro.x / k, y: it.centro.y / k}, a = p.x * du.x + p.y * du.y, b = p.x * dv.x + p.y * dv.y;
      if (a < u0 - 3 || a > u1 + 3 || b < v0 - 3 || b > v1 + 3) continue;
      const cercaU = Math.min(Math.abs(a - u0), Math.abs(a - u1)), cercaV = Math.min(Math.abs(b - v0), Math.abs(b - v1));
      votos += cercaV < cercaU ? 1 : -1; // junto a un lado paralelo a u → ese par recibe el agua
    }
    if (votos > 0) return du;
    if (votos < 0) return dv;
    return u1 - u0 >= v1 - v0 ? dv : du;
  })();
  // El alero es del techo: con varios niveles, la losa de entrepiso termina en la cara de la viga
  // (el pasillo en volado sí sigue: va en `volados`).
  const ali = planoAligerado({lectura: plantaEntrepiso?.lectura ?? lectura, items, k: plantaEntrepiso?.k ?? k, espesorFijo: estructura.espesorLosa ?? null, losaMaciza: estructura.losaMaciza ?? Number(estructura.niveles) >= 2, panosMacizos: estructura.panosMacizos ?? null, volados, alero: nivelesLosa > 1 ? 0 : alero, tipoCimentacion: cim.tipo, ...vigasProyecto, aleroParaleloA, columnetas: estiloOp.columnetasLosa === true});
  const planoAligeradoTieneCumbrera = Boolean(ali.cumbrera);
  const cuadro = cuadroColumnas(lectura.columnas, {niveles: Math.max(1, Number(estructura.niveles) || 1), diseno: estructura.disenoColumnas ?? null}); // en NIVEL, los pisos que cubre
  // Con placas y columnas, el ingeniero hace dos cuadros: "CUADRO DE PLACAS" y "CUADRO DE COLUMNAS"
  // (así en 35 de los 44 cuadros de la biblioteca); el cuadro completo queda para el metrado.
  const placasPlanta = lectura.columnas.filter((c) => c.clase === "placa"), columnasPlanta = lectura.columnas.filter((c) => c.clase !== "placa");
  const cuadrosSeparados = placasPlanta.length && columnasPlanta.length
    ? [cuadroColumnas(columnasPlanta, {niveles: Math.max(1, Number(estructura.niveles) || 1), diseno: estructura.disenoColumnas ?? null}), cuadroColumnas(placasPlanta, {niveles: Math.max(1, Number(estructura.niveles) || 1), diseno: estructura.disenoColumnas ?? null})] : null;
  const nNiveles = Math.max(1, Number(estructura.niveles) || 1);
  const niv = nivelesDesdeArquitectura(items, nNiveles, estructura.textosOcultos ?? (() => []));
  const {entrepisos, fuente: fuenteNiveles} = niv;
  // Nivel de la cumbrera: el N.T.T. sobre el alero o, si no, el NFT/NTT más alto cuando hay otro
  // más bajo. Con el techo de los cortes y ese nivel, el alero sale de la cumbrera y las pendientes
  // (VILCABAMBA 1: NFT +5.91 es la cumbrera; tomarlo como alero ponía todo el techo a 5.91).
  const nivelCumbreraArq = techoArq && nNiveles <= 1 && !planoAligeradoTieneCumbrera ? (cumbreraDesdeArquitectura(items, niv.techo) ?? ((v) => (v ? v - baseDeNiveles(items) : null))(nivelCumbreraEscrito(items))) : null;
  const techoPortico = nivelCumbreraArq ? {...techoArq, H: nivelCumbreraArq} : null;
  const altura = techoPortico ? Math.min(...lectura.columnas.map((c) => cotaDelTecho(techoPortico, c.nodo ?? c, techoPortico.H))) : niv.techo;
  const altura0 = altura;
  const losaTecho = estructura.losaTecho ?? true;
  // Losas como el ingeniero: "LOSA ALIGERADA 1°-2° PISO" (entrepisos típicos) y aparte la del
  // techo; un nivel sin losa (solo cobertura liviana) no lleva plano de aligerado.
  const rangoPisos = (a, b) => (a === b ? `${a}°` : b === a + 1 ? `${a}° Y ${b}°` : `${a}°-${b}°`);
  if (nNiveles > 1) ali.contenido.titulo = `PLANO DE LOSA ALIGERADA ${rangoPisos(1, nNiveles - 1)} PISO`;
  const sinLosa = nNiveles <= 1 && losaTecho === false;
  // Planos de los niveles de arriba, en láminas extra: losa de techo y tabiquería de cada nivel
  // (los niveles con la misma tabiquería van en un solo plano: "2° Y 3° PISO").
  const extras = [];
  // Losas que quedan dibujadas (para que el mensaje diga lo mismo que el plano).
  const losasDibujadas = sinLosa ? [] : [{titulo: ali.contenido.titulo, espesor: ali.espesor, viguetas: ali.viguetas, macizas: ali.modelo?.losa?.macizas ?? {}}];
  if (nNiveles > 1 && losaTecho) {
    const plantaTecho = plantaNivel(nNiveles);
    const aliT = planoAligerado({lectura: plantaTecho?.lectura ?? lectura, items, k: plantaTecho?.k ?? k, espesorFijo: estructura.espesorLosa ?? null, losaMaciza: estructura.losaMaciza ?? Number(estructura.niveles) >= 2, conVacios: false, volados, alero, tipoCimentacion: cim.tipo, ...vigasProyecto, aleroParaleloA, columnetas: estiloOp.columnetasLosa === true});
    aliT.contenido.titulo = "PLANO DE LOSA ALIGERADA TECHO";
    extras.push(aliT.contenido);
    losasDibujadas.push({titulo: aliT.contenido.titulo, espesor: aliT.espesor, viguetas: aliT.viguetas, macizas: aliT.modelo?.losa?.macizas ?? {}});
  }
  const columnetasExtra = [];
  const plantas = (estructura.plantasNiveles ?? []).filter((p) => p.nivel >= 2 && p.nivel <= nNiveles && p.lectura?.columnas?.length >= 2);
  if (plantas.length) {
    // Niveles casi iguales van juntos, como el ingeniero ("2° Y 3° PISO"): mismas columnas,
    // ≥ 85 % de las columnetas en el mismo lugar respecto de los ejes y muros parecidos (±15 %).
    const relativas = (t) => (t.columnetasCodificadas ?? []).map((c) => ({x: c.x - t.contenido.ejes.x0, y: c.y - t.contenido.ejes.y0}));
    const parecidos = (a, b) => {
      if (a.p.lectura.columnas.length !== b.p.lectura.columnas.length) return false;
      if (Math.abs(a.t.muros - b.t.muros) > 0.15 * Math.max(a.t.muros, b.t.muros, 1)) return false;
      const ra = relativas(a.t), rb = relativas(b.t), n = Math.max(ra.length, rb.length);
      if (!n) return true;
      return ra.filter((p) => rb.some((q) => Math.hypot(p.x - q.x, p.y - q.y) < 0.15)).length / n >= 0.85;
    };
    const grupos = [];
    for (const p of plantas) {
      const t = planoTabiqueria({lectura: p.lectura, items, k}, {codigos: cc.columnetas});
      const g = grupos.find((x) => parecidos(x, {t, p}));
      if (g) g.niveles.push(p.nivel); else grupos.push({niveles: [p.nivel], t, p});
    }
    for (const g of grupos) {
      const ns = [...new Set(g.niveles)].sort((a, b) => a - b);
      g.t.contenido.titulo = `PLANO DE TABIQUERÍA ${ns.length > 1 && ns.at(-1) - ns[0] === ns.length - 1 && ns.length > 2 ? rangoPisos(ns[0], ns.at(-1)) : ns.map((n) => `${n}°`).join(" Y ")} PISO`;
      extras.push(g.t.contenido);
      // Columnetas de otra medida que solo aparecen arriba: también van al cuadro.
      for (const c of g.t.columnetasCodificadas ?? []) if (c.codigo && !columnetasExtra.some((x) => x.codigo === c.codigo) && !(lectura.columnetas ?? []).some((x) => x.codigo === c.codigo)) columnetasExtra.push(c);
    }
  }
  // Azotea: tabiquería de parapetos (con las columnas del edificio llevadas a la vista de azotea por
  // los ejes del mismo nombre, si allí no se dibujaron) y losa de la caseta si tiene columnas propias.
  const az = estructura.plantaAzotea;
  if (az && nNiveles >= 2) {
    const desp = desplazamientoPorEjes(lectura.ejes, az.lectura.ejes);
    const mover = (c) => ({...c, x: c.x + desp.x, y: c.y + desp.y, ...(c.nodo ? {nodo: {x: c.nodo.x + desp.x, y: c.nodo.y + desp.y}} : {}), ...(c.contorno ? {contorno: c.contorno.map((p) => ({x: p.x + desp.x, y: p.y + desp.y}))} : {})});
    const propias = az.lectura.columnas ?? [];
    const columnasAz = propias.length >= 2 ? propias : desp.ejes >= 2 ? lectura.columnas.map(mover) : [];
    if (columnasAz.length >= 2 && (az.lectura.columnetas?.length ?? 0) >= 4) {
      try {
        const t = planoTabiqueria({lectura: {...az.lectura, columnas: columnasAz}, items, k: az.k}, {codigos: cc.columnetas});
        t.contenido.titulo = "PLANO DE TABIQUERÍA AZOTEA";
        extras.push(t.contenido);
      } catch { /* sin tabiquería de azotea */ }
    }
    if (propias.length >= 4 && propias.length < 0.6 * lectura.columnas.length) {
      try {
        const aliA = planoAligerado({lectura: az.lectura, items, k: az.k, espesorFijo: estructura.espesorLosa ?? null, losaMaciza: false, conVacios: false, alero: 0, tipoCimentacion: cim.tipo, ...vigasProyecto});
        aliA.contenido.titulo = "PLANO DE LOSA ALIGERADA AZOTEA (CASETA)";
        extras.push(aliA.contenido);
        losasDibujadas.push({titulo: aliA.contenido.titulo, espesor: aliA.espesor, viguetas: aliA.viguetas, macizas: aliA.modelo?.losa?.macizas ?? {}});
      } catch { /* sin losa de caseta */ }
    }
  }
  // Detalles (cortes de cimiento, escalera, cuadros) en coordenadas locales, para medirlos contra los
  // del ingeniero (evaluar-detalles.mjs). Con biblioteca de detalles del despacho
  // (estructura.bibliotecaDetalles), cada detalle es el del ingeniero más parecido adaptado.
  const bibliotecaDetalles = estructura.bibliotecaDetalles ?? null;
  const detallesLocales = [];
  // Escalera entre niveles: su detalle (corte de un tramo) va con las plantas de arriba.
  let escalera = null;
  if (nNiveles > 1) {
    const [esc] = escalerasEnPlanta({columnas: lectura.columnas, items, k}, direccionPrincipal(lectura.ejes));
    if (esc) {
      const altura = (altura0 - entrepisos[0]) / Math.max(1, nNiveles - 1) || entrepisos[0];
      const dim = predimensionarEscalera(esc, altura);
      const d = detalleEscalera(dim, {nombre: dim.nTramos > 1 ? "TRAMOS I Y II" : "TRAMO I"});
      // Un detalle por tramo (TRAMO I, TRAMO II…) con sus descansos, como el ingeniero. La pieza de
      // la biblioteca no se usa aquí: medido, adaptada (44 %) queda por debajo del tramo generado (63 %).
      for (const t of detallesEscaleraPorTramo(dim, esc)) {
        extras.push(t.contenido);
        detallesLocales.push({tipo: "escalera", titulo: t.contenido.titulo, unidades: "m", primitivas: t.contenido.primitivas});
      }
      escalera = {...dim, tramosPorNivel: dim.nTramos, niveles: nNiveles - 1, porTramo: d.modelo};
    }
  }
  const cuadroCtas = cuadroColumnetas([...(lectura.columnetas ?? []), ...columnetasExtra], {niveles: nNiveles}); // ya traen su código (pa, pb…) del cimiento corrido
  const pendiente = pendienteDesdeArquitectura(items);
  const vanos = vanosDesdeArquitectura(items, k);
  // Sección de las vigas: la del aligerado (la misma que se metra). En cada pórtico, la de las
  // vigas de su eje (la de mayor peralte); el tipo más peraltado para lo demás.
  const vigaTipo = ali.tiposViga[0] ? (([b, h]) => ({b, h}))(ali.tiposViga[0].medida.split("x").map(Number)) : seccionViga(4);
  const vigaDelEje = (nombre) => (ali.modelo?.vigas ?? []).filter((v) => v.eje === nombre && v.b && v.h).sort((p, q) => q.h - p.h).map((v) => ({b: v.b, h: v.h}))[0] ?? vigaTipo;
  const ejesPortico = lectura.ejes
    .map((eje) => ({eje, columnas: lectura.columnas.filter((c) => c.eje.split("/").includes(eje.nombre))}))
    .filter((x) => x.columnas.length >= 2)
    .sort((a, b) => ordenEjes(a.eje, b.eje));
  // Con biblioteca de detalles del despacho (estructura.bibliotecaPorticos), cada pórtico es el
  // del ingeniero más parecido adaptado a estas luces y niveles; si ninguno se parece, el generado.
  const bibliotecaPorticos = estructura.bibliotecaPorticos ?? null;
  // Techo a dos aguas decidido por el ingeniero sin viga cumbrera en la losa: la cumbrera va por el
  // centro de la planta, a lo largo del lado largo (así en los módulos a dos aguas estudiados).
  // Con la pendiente escrita en la arquitectura (PTE=43 %) el techo es inclinado aunque la losa sea
  // de varios paños (módulo 8): a dos aguas, salvo que el ingeniero haya dicho que es plano.
  const dosAguas = estructura.techoDosAguas === true || (estructura.techoDosAguas !== false && pendienteAnotada(items));
  const cumbrera = ali.cumbrera ?? (dosAguas ? (techoArq?.linea ?? cumbreraAlCentro(lectura)) : null);
  const porticos = ejesPortico.map(({eje, columnas}) => {
    const p = planoPortico({eje, columnas, altura, espesorLosa: ali.espesor, viga: vigaDelEje(eje.nombre), cimentacion: {tipo: cim.tipo, peralte: cim.peralte, df: cim.df}, columnetas: lectura.columnetas ?? [], cumbrera, pendiente, vanos, entrepisos, losaTecho, nivelCumbrera: dosAguas ? cumbreraDesdeArquitectura(items, altura) : null, techo: dosAguas ? techoPortico : null});
    return bibliotecaPorticos ? porticoDesdeBiblioteca(p, bibliotecaPorticos) : p;
  });
  // Pórticos repetidos: como el ingeniero, uno solo por dibujo idéntico (módulo 12: dibuja E´ y 8,
  // no H ni 13). Todos siguen en el modelo (metrado); solo se agrupan en las láminas.
  const redondo = ([x, y]) => [Math.round(x * 50) / 50, Math.round(y * 50) / 50];
  const firmaPortico = (p) => JSON.stringify(p.contenido.primitivas.filter((q) => q.type !== "text").map((q) => [
    q.type, q.layer, ...(q.a ? [redondo(q.a), redondo(q.b)] : []), ...(q.points ? q.points.map(redondo) : []), ...(q.c ? [redondo(q.c), Math.round(q.r * 50) / 50] : []),
  ]));
  const grupos = new Map();
  porticos.forEach((p, i) => { const f = firmaPortico(p); grupos.set(f, [...(grupos.get(f) ?? []), i]); });
  const nombreDe = (i) => ejesPortico[i].eje.nombre;
  const representante = new Map(); // índice dibujado → similares
  for (const indices of grupos.values()) {
    const [primero, ...resto] = [...indices].sort((a, b) => nombreDe(a).localeCompare(nombreDe(b), "es", {numeric: true}));
    representante.set(primero, resto.map(nombreDe));
  }
  const dibujados = porticos.map((_, i) => i).filter((i) => representante.has(i));
  const porticosDibujo = dibujados.map((i) => porticos[i]);
  const similares = dibujados.filter((i) => representante.get(i).length).map((i) => `${nombreDe(i)} (igual a ${representante.get(i).join(", ")})`);
  const contenidos = {
    cimentacion: cim.contenido, cimiento: cc.contenido, aligerado: sinLosa ? null : ali.contenido, cuadroColumnas: (cuadrosSeparados?.[0] ?? cuadro).contenido, cuadroPlacas: cuadrosSeparados?.[1].contenido ?? null, cuadroColumnetas: cuadroCtas?.contenido,
  };
  // Cuadros con la rejilla del despacho y las filas de este proyecto (detalleBiblioteca.js).
  for (const [tipo, clave, gen] of [["cuadro_columnas", "cuadroColumnas", cuadrosSeparados?.[0] ?? cuadro], ["cuadro_columnas", "cuadroPlacas", cuadrosSeparados?.[1]], ["cuadro_columnetas", "cuadroColumnetas", cuadroCtas]]) {
    if (!gen?.contenido) continue;
    const b = bibliotecaDetalles ? detalleDesdeBiblioteca(tipo, {generado: gen.contenido.primitivas, niveles: nNiveles}, bibliotecaDetalles) : null;
    if (b) contenidos[clave] = b.contenido;
    detallesLocales.push({tipo, titulo: clave === "cuadroPlacas" ? "CUADRO DE PLACAS" : tipo === "cuadro_columnas" ? "CUADRO DE COLUMNAS" : "CUADRO DE COLUMNETAS", unidades: "lamina", primitivas: contenidos[clave].primitivas, ...(b ? {biblioteca: b.biblioteca, generador: gen.contenido.primitivas} : {})});
  }
  // Cortes de cimiento corrido: sin biblioteca, los de la plantilla (origen "plantilla", sin
  // primitivas aquí); con ella, el corte del despacho más parecido con el cimiento de este
  // proyecto, en el lugar del corte de la plantilla con el mismo número si se conoce
  // (bibliotecaDetalles.cortesPlantilla: [{numero, origen, escala, zona}] en unidades de la plantilla).
  const cortesColocados = [];
  const cortesAdaptados = [];
  for (const numero of cc.cortes ?? []) {
    const destinoCorte = {numero, interior: numero === 3, ancho: cc.ancho, peralte: CRITERIOS.cimientoCorrido.alto, cotaFondo: -CRITERIOS.cimientoCorrido.alto, npt: CRITERIOS.terreno.npt};
    const b = bibliotecaDetalles ? detalleDesdeBiblioteca("corte_cimiento", destinoCorte, bibliotecaDetalles) : null;
    // Sin pieza del despacho (modo adaptativo): el corte se dibuja con los datos de este proyecto.
    const dato = (cc.cortesDetalle ?? []).find((c) => c.numero === numero) ?? {};
    const g = adaptativa ? corteCimientoCorrido({numero, ancho: cc.ancho, alto: CRITERIOS.cimientoCorrido.alto, espesorMuro: dato.espesorMuro, exterior: dato.exterior ?? numero !== 3, conPuerta: dato.conPuerta ?? numero === 1, npt: CRITERIOS.terreno.npt}) : null;
    // El corte del despacho ya trae su título ("CORTE 1-1 / ESC: 1/25"): no se le pone otro.
    if (b) cortesAdaptados.push({...b.contenido, tituloPropio: true}); else if (g) cortesAdaptados.push(g);
    detallesLocales.push({tipo: "corte_cimiento", numero, titulo: `CORTE ${numero}-${numero}`, unidades: "m", origen: b ? "biblioteca" : g ? "generado con los datos del proyecto" : "plantilla", primitivas: b?.contenido.primitivas ?? g?.primitivas ?? [], ...(b ? {biblioteca: b.biblioteca, ...(g ? {generador: g.primitivas} : {})} : {})});
    const lugar = b && (bibliotecaDetalles.cortesPlantilla ?? []).find((c) => c.numero === numero);
    if (lugar) cortesColocados.push({lugar, primitivas: transformar(b.contenido.primitivas, (x, y) => [lugar.origen.x + x * lugar.escala, lugar.origen.y + y * lugar.escala], lugar.escala)});
  }

  // Hojas: las de la plantilla y, si hay más pórticos que espacios (módulo 3: 8 ejes),
  // copias de la lámina de pórticos a la derecha (E-03, E-04…) con los que faltan.
  const porHoja = (lamina) => lamina.espacios.filter((e) => /^portico\d+$/.test(e.id) && e.caja).length;
  const marco = marcoDeVista(items, caja, k);
  // Modo adaptativo: formato de la referencia identificada o, en un proyecto nuevo, el más común
  // del despacho (formatoDespacho.js). El marco de la lámina de arquitectura no sirve: está a la
  // escala de la arquitectura, no a la de las láminas de estructuras.
  let paquete = null;
  if (adaptativa) {
    // Textos separados antes de medir lo que ocupa cada plano (su caja real con cotas y rótulos).
    const medir = (contenido, plano) => {
      if (!contenido) return null;
      if (plano) separarTextos(contenido.primitivas);
      const d = cajaDibujo(contenido.primitivas);
      const m = contenido.marco;
      return d ?? (m ? {x0: m.x0, y0: m.y0, x1: m.x1, y1: m.y1} : null);
    };
    const tipoExtra = (c) => (/TABIQUER/i.test(c.titulo) ? "tabiqueria" : /ESCALERA/i.test(c.titulo) ? "escalera" : /LOSA|ALIGERAD/i.test(c.titulo) ? "losaTecho" : "otro");
    const notas = notasTecnicas({sismo: dp.sismo, df: cim.df, hz: cim.peralte, altura: Math.max(altura, ...porticos.map((p) => p.cumbrera ?? 0)), losaTecho: !sinLosa, cimentacion: cim.tipo, conCimiento: Boolean(cc.tramos), conAlbanileria: Boolean(cc.tramos || (lectura.columnetas ?? []).length),
      qadm: dp.cimentacion.qadm ?? null, resultados: estructura.resultadosSismicos ?? null,
      // Pedidos del cliente aceptados (preferenciasCliente.js): quedan escritos en la lámina.
      pedidosCliente: (estructura.preferencias ?? []).map((p) => p.nota).filter(Boolean)});
    const estandar = detallesEstandar(estructura.detallesEstandar ?? [], {espesor: ali.espesor}, {conLosa: !sinLosa, conCanaleta: Boolean(cumbrera) || items.some((it) => it.tipo === "texto" && /canaleta/i.test(it.texto ?? ""))});
    const estandarDe = (clave) => estandar.some((d) => d.clave === clave);
    const lista = aplicarPreferencias([
      {id: 'cimentacion', tipo: 'cimentacion', contenido: contenidos.cimentacion, titulado: true},
      ...(cc.tramos ? [{id: 'cimiento', tipo: 'cimiento', contenido: contenidos.cimiento, titulado: true}] : []),
      ...cortesAdaptados.map((contenido, i) => ({id: `corte${i + 1}`, tipo: 'corte', contenido, nominal: 2, titulado: Boolean(contenido.titulo) && !contenido.tituloPropio})),
      {id: 'aligerado', tipo: 'losa', contenido: contenidos.aligerado, titulado: true},
      // El detalle típico de aligerado y la especificación de ladrillo: los del ingeniero (biblioteca)
      // si están; si no, los generados.
      ...(sinLosa || estandarDe("aligerado") ? [] : [{id: 'detalleAligerado', tipo: 'detalleLosa', contenido: detalleTipicoAligerado(ali.espesor), nominal: 5, titulado: true}]),
      ...extras.map((contenido, i) => ({id: `extra${i}`, tipo: tipoExtra(contenido), contenido, titulado: true})),
      ...porticosDibujo.map((p, i) => ({id: `portico${i + 1}`, tipo: 'portico', contenido: p.contenido, nominal: 1, titulado: true})),
      // Cuadro de vigas (22 de 28 expedientes lo tienen): una columna por sección del modelo.
      {id: 'cuadroVigas', tipo: 'cuadroVigas', contenido: cuadroVigas(ali.modelo?.vigas ?? [], {niveles: nNiveles, armado: criteriosMetrado(cim.tipo).vigas})?.contenido ?? null, nominal: 1},
      {id: 'cuadroColumnas', tipo: 'cuadroColumnas', contenido: contenidos.cuadroColumnas, nominal: 1},
      {id: 'cuadroPlacas', tipo: 'cuadroColumnas', contenido: contenidos.cuadroPlacas, nominal: 1},
      {id: 'cuadroColumnetas', tipo: 'cuadroColumnetas', contenido: contenidos.cuadroColumnetas, nominal: 1},
      {id: 'notas', tipo: 'notas', contenido: notas, nominal: 1},
      // Empalmes y ganchos estándar del despacho (E.060), como en sus especificaciones técnicas.
      {id: 'empalmes', tipo: 'cuadroEmpalmes', contenido: detalleEmpalmesGanchos(), nominal: 1, titulado: true, relleno: true},
      // Tablas y detalles estándar que el despacho pone en toda lámina (criterio E.060/E.070, no
      // dependen del proyecto): longitudes de desarrollo, desencofrado, ladrillo-mortero y viguetas.
      // Las tablas van de relleno: a la lámina con más espacio (las viguetas, con la losa).
      {id: 'desarrollo', tipo: 'cuadroEmpalmes', contenido: cuadroLongitudesDesarrollo(), nominal: 1, titulado: true, relleno: true},
      {id: 'desencofrado', tipo: 'notas', contenido: tablaDesencofrado(), nominal: 1, titulado: true, relleno: true},
      ...(estandarDe("ladrillo") ? [] : [{id: 'ladrillo', tipo: 'detalleLosa', contenido: especificacionLadrillo(), nominal: 1, titulado: true}]),
      ...(sinLosa ? [] : [{id: 'cuadroViguetas', tipo: 'cuadroColumnetas', contenido: cuadroViguetas(ali.espesor), nominal: 1, titulado: true, relleno: true, familia: 'losa'}]),
      // El cuadro de columnas también en las láminas de pórticos (si cabe), como el ingeniero.
      {id: 'cuadroColumnas', tipo: 'cuadroColumnas', contenido: contenidos.cuadroColumnas, nominal: 1, repetible: true},
      // Detalles estándar del despacho (biblioteca): llenan el hueco libre como en sus láminas.
      ...estandar.map((d) => ({...d, nominal: 1, relleno: true})),
    ].filter((c) => c.contenido), [...(estructura.preferencias ?? []), ...(prefEstilo ? [prefEstilo] : [])]);
    for (const c of lista) c.caja = medir(c.contenido, c.titulado);
    paquete = componerPaqueteLaminas({marco: estructura.formatoReferencia ?? null, escalaPlanos: nominal, proyecto, contenidos: lista});
  }
  if (paquete) config = {...config, laminas: paquete.hojas.map((h) => h.lamina)};
  const marcos = config.laminas.map((l) => l.marco);
  const T = {x0: Math.min(...marcos.map((m) => m.x)), y0: Math.min(...marcos.map((m) => m.y)), x1: Math.max(...marcos.map((m) => m.x1)), y1: Math.max(...marcos.map((m) => m.y1))};
  const alto = T.y1 - T.y0, gap = Math.max(3, 0.1 * alto);
  const O = {x: marco.x0 - T.x0, y: marco.y0 - gap - alto - T.y0};
  for (let i = 0; i < 20 && ocupado(items, k, {x0: T.x0 + O.x, y0: T.y0 + O.y, x1: T.x1 + O.x, y1: T.y1 + O.y}); i++) O.y -= alto + gap;
  const mover = (prims) => transformar(prims, (x, y) => [x + O.x, y + O.y], 1);
  const iPorticos = config.laminas.findIndex((l) => porHoja(l) > 0);
  const hojas = paquete?.hojas ?? config.laminas.map((lamina) => ({lamina, extra: {x: 0, y: 0}, porticos: []}));
  if (!adaptativa && iPorticos >= 0) {
    const lp = config.laminas[iPorticos], cap = porHoja(lp);
    hojas[iPorticos].porticos = porticosDibujo.slice(0, cap);
    const ancho = lp.marco.x1 - lp.marco.x, separacion = Math.max(1, (lp.marco.x - (config.laminas[iPorticos - 1]?.marco.x1 ?? lp.marco.x - 3)));
    for (let n = 1; cap * n < porticosDibujo.length; n++) {
      hojas.push({lamina: lp, extra: {x: T.x1 - lp.marco.x + separacion + (n - 1) * (ancho + separacion), y: 0}, porticos: porticosDibujo.slice(cap * n, cap * (n + 1)), copia: true});
    }
  }
  // Láminas extra de plantas (losa de techo, tabiquerías): el marco y el rótulo de la primera
  // lámina de la plantilla, sin sus detalles, con hasta tres planos en sus espacios de planta.
  const l0 = config.laminas[0];
  const ESPACIOS_PLANTA = ["cimentacion", "cimiento", "aligerado"].filter((id) => l0.espacios.some((e) => e.id === id && e.caja));
  if (!adaptativa && extras.length && ESPACIOS_PLANTA.length) {
    const sep = 3, ancho0 = l0.marco.x1 - l0.marco.x;
    let x = Math.max(T.x1, ...hojas.map((h) => h.lamina.marco.x1 + h.extra.x)) + sep;
    for (let i = 0; i < extras.length; i += ESPACIOS_PLANTA.length) {
      const planos = Object.fromEntries(ESPACIOS_PLANTA.map((id, j) => [id, extras[i + j]]).filter(([, c]) => c));
      const tiene = (re) => Object.values(planos).some((c) => re.test(c.titulo));
      const plano = [tiene(/LOSA/) && "LOSA ALIGERADA DE TECHO", tiene(/TABIQUER/) && "TABIQUERÍA", tiene(/ESCALERA/) && "ESCALERA"].filter(Boolean).join(", ").replace(/, ([^,]+)$/, " Y $1");
      hojas.push({lamina: l0, extra: {x: x - l0.marco.x, y: 0}, porticos: [], planos, copia: true, soloMarco: true, plano});
      x += ancho0 + sep;
    }
  }
  const zona = {x0: T.x0, y0: T.y0, x1: Math.max(T.x1, ...hojas.map((h) => h.lamina.marco.x1 + h.extra.x)), y1: T.y1};

  const prim = [];
  const laminas = [];
  const copias = [];
  const excluirPlantilla = [];
  const escalas = new Set();
  const ubicaciones = [];
  const secciones = [];
  const fueraDeLamina = [];
  hojas.forEach(({lamina, extra, porticos: deHoja, copia, planos, soloMarco, plano: planoHoja}, i) => {
    const nombrePlano = planoHoja || lamina.plano;
    const codigo = `E-${String(previas + i + 1).padStart(2, "0")}`;
    const mover = (prims) => transformar(prims, (x, y) => [x + O.x + extra.x, y + O.y + extra.y], 1);
    if (adaptativa) {
      // Marco del despacho y casillas del rótulo (formatoDespacho.js), en su capa y color.
      const m = lamina.marco;
      prim.push(...mover(aplicarEstilo([
        line(L.LAMINA, [m.x, m.y], [m.x1, m.y]), line(L.LAMINA, [m.x1, m.y], [m.x1, m.y1]),
        line(L.LAMINA, [m.x1, m.y1], [m.x, m.y1]), line(L.LAMINA, [m.x, m.y1], [m.x, m.y]),
        ...(lamina.rotuloDibujo ?? []),
      ], 'planta')));
      for (const espacio of lamina.espacios) {
        const contenido = planos?.[espacio.id];
        if (!contenido) continue;
        const e = espacio.extension, s = espacio.escala, c = espacio.caja;
        const primitivas = transformar(contenido.primitivas, (x, y) => [c.x + (x - e.x0) * s, c.y + (y - e.y0) * s], s);
        // Nada fuera del marco de su lámina (con 2 cm de holgura por el ancho estimado de los textos).
        const cd = cajaDibujo(primitivas), mf = lamina.marco, tol = 0.02 * Math.min(mf.x1 - mf.x, mf.y1 - mf.y);
        if (cd && (cd.x0 < mf.x - tol || cd.x1 > mf.x1 + tol || cd.y0 < mf.y - tol || cd.y1 > mf.y1 + tol)) fueraDeLamina.push(`${contenido.titulo ?? espacio.id} (${codigo})`);
        const estilo = /^cuadro/.test(espacio.tipo) ? "cuadro" : espacio.tipo === "portico" ? "portico" : "planta";
        const colocadas = mover(aplicarEstilo(primitivas, estilo));
        prim.push(...colocadas);
        if (colocadas.length) secciones.push({titulo: contenido.titulo, tipo: espacio.tipo, lamina: codigo, entidades: colocadas.length});
        if (!espacio.titulado) continue;
        ubicaciones.push({titulo: contenido.titulo, lamina: codigo, espacio: espacio.id, escala: s, caja: cajaDibujo(colocadas)});
        // Tablas y detalles típicos sin dibujo a escala (empalmes y ganchos): "SIN ESCALA", como el ingeniero.
        const esc = contenido.sinEscala ? "SIN ESCALA" : `1/${Math.round(50 / s)}`;
        if (!contenido.sinEscala) escalas.add(esc);
        const pos = espacio.titulo;
        const titulo = `${proyecto} - ${contenido.titulo}`;
        const largo = anchoTexto(titulo, pos.alto);
        prim.push(...mover(aplicarEstilo([
          text(L.TITULO, [pos.x, pos.y], titulo, pos.alto, 0, "izq"),
          line(L.TITULO, [pos.x, pos.y - pos.alto * 0.35], [pos.x + largo, pos.y - pos.alto * 0.35]),
          text(L.TITULO, [pos.x, pos.y - pos.alto * 1.6], `${contenido.sinEscala ? "" : "ESC: "}${esc}`, pos.alto * 0.7, 0, "izq"),
        ])));
      }
    }
    const titulosLibres = [...lamina.titulos];
    for (const espacio of adaptativa ? [] : lamina.espacios) {
      const m = /^portico(\d+)$/.exec(espacio.id);
      const contenido = planos ? planos[espacio.id] : m ? deHoja[Number(m[1]) - 1]?.contenido : contenidos[espacio.id];
      if (!contenido || !espacio.caja) continue;
      const esPlano = !/^cuadro/.test(espacio.id);
      // Plantas a 1/25 (x2); pórticos a 1/50 (x1) y cuadros en unidades de lámina, como el expediente.
      const nominalEspacio = !esPlano ? 1 : /^portico/.test(espacio.id) ? 1 : nominal;
      // En los planos, ningún rótulo encima de otro (los cuadros ya van celda por celda).
      if (esPlano) separarTextos(contenido.primitivas);
      const {primitivas, escala} = encajar(contenido, {x0: espacio.caja.x, y0: espacio.caja.y, x1: espacio.caja.x1, y1: espacio.caja.y1}, nominalEspacio, espacio.ejes);
      // Capas y colores del despacho (estiloLaminas.js) según el tipo de plano.
      const colocadas = mover(aplicarEstilo(primitivas, !esPlano ? "cuadro" : /^portico/.test(espacio.id) ? "portico" : "planta"));
      prim.push(...colocadas);
      // Dónde quedó cada planta (para medirla contra la del ingeniero y para el visor).
      if (esPlano) ubicaciones.push({titulo: contenido.titulo, lamina: codigo, espacio: espacio.id, escala, caja: cajaDibujo(colocadas)});
      if (!esPlano) continue;
      const esc = `1/${Math.round(50 / escala)}`;
      escalas.add(esc);
      // Título: el de la plantilla más cercano bajo el espacio (subrayado como en el expediente).
      const cerca = titulosLibres.map((t, j) => ({t, j, d: Math.hypot(t.x - espacio.caja.x, (t.y - espacio.caja.y) * 2)})).sort((a, b) => a.d - b.d)[0];
      const pos = cerca ? cerca.t : {x: espacio.caja.x, y: espacio.caja.y - 0.6, alto: 0.25};
      if (cerca) titulosLibres.splice(cerca.j, 1);
      const titulo = `${proyecto} - ${contenido.titulo}`;
      const largo = anchoTexto(titulo, pos.alto);
      prim.push(...mover(aplicarEstilo([
        text(L.TITULO, [pos.x, pos.y], titulo, pos.alto, 0, "izq"),
        line(L.TITULO, [pos.x, pos.y - pos.alto * 0.35], [pos.x + largo, pos.y - pos.alto * 0.35]),
        text(L.TITULO, [pos.x, pos.y - pos.alto * 1.6], `ESC: ${esc}`, pos.alto * 0.7, 0, "izq"),
      ])));
    }
    // Rótulo: cada dato en su casilla, ajustado a su ancho (sin salirse ni encimarse).
    const valores = {
      ...datosRotulo,
      lamina: codigo, especialidad: "ESTRUCTURAS", escala: "INDICADA", fecha: `${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`,
      plano: `PLANO DE ${nombrePlano} - ${proyecto}`,
      ubicacion: [datosRotulo.region, datosRotulo.provincia, datosRotulo.distrito, datosRotulo.localidad].filter(Boolean).join(' / '),
      // El CUI va como último renglón del proyecto (su casilla original cae sobre el código de lámina).
      proyecto: `${datosRotulo.proyecto || proyecto}${datosRotulo.cui ? ` · CUI N° ${String(datosRotulo.cui).replace(/^CUI\s*N?°?\s*/i, "")}` : ""}`,
      cip: datosRotulo.cip ? `CIP N° ${String(datosRotulo.cip).replace(/^CIP\s*N?°?\s*/i, "")}` : "",
      cui: "",
      codigos: [datosRotulo.codigoLocal && `CÓD. LOCAL ${datosRotulo.codigoLocal}`, datosRotulo.codigoModular && `CÓD. MODULAR ${datosRotulo.codigoModular}`].filter(Boolean).join(" · "),
    };
    for (const campo of lamina.rotulo) {
      const max = campo.campo === "plano" || campo.campo === "proyecto" ? Math.max(campo.lineas, 3) : campo.lineas;
      // En la capa (y color) del dato en el expediente: NCAMINO1, CAPA8, ".".
      prim.push(...mover(textoEnCasilla(campo, valores[campo.campo], {max, capa: campo.capa ?? L.LAMINA})));
    }
    // Títulos de la plantilla que quedaron sin plano (espacio vacío, p. ej. la copia de pórticos
    // con un solo pórtico): su símbolo de título no se copia (quedaba suelto en la lámina).
    const sinUsar = titulosLibres.map((t) => ({x: t.x - 1.35, y: t.y - 1.1, x1: t.x + 0.02, y1: t.y + 0.35}));
    // Solo marco y rótulo: se excluye todo lo de adentro salvo la esquina del rótulo.
    const interior = soloMarco ? interiorSinRotulo(lamina) : [];
    if (copia) copias.push({desplazamiento: {x: O.x + extra.x, y: O.y + extra.y}, marco: lamina.marco, excluir: [...sinUsar, ...interior]});
    else if (!adaptativa) excluirPlantilla.push(...sinUsar);
    laminas.push({codigo, plano: nombrePlano});
  });

  // Cortes adaptados en el lugar de los de la plantilla (que ya no se copian).
  if (!adaptativa) for (const c of cortesColocados) { prim.push(...mover(c.primitivas)); excluirPlantilla.push(c.lugar.zona); }
  const avisos = [...dp.avisos, ...cim.avisos, ...(paquete?.avisos ?? [])];
  if (adaptativa && (cc.cortes?.length ?? 0) > cortesAdaptados.length) avisos.push('Los cortes sin una referencia adaptable quedan pendientes; no copié detalles fijos de otro módulo.');
  // Al ingeniero solo lo que pide una acción suya (área abierta, baja confianza, criterio sin
  // confirmar). El estado interno del aprendizaje geométrico queda en revisionInterna.
  const revisionInterna = [...(Array.isArray(estructura.avisosRevision) ? estructura.avisosRevision : [])];
  if (estructura.geometriaAdaptada === true && estructura.casoAprendido && estructura.patronGeometrico) {
    avisos.push(`Patrón geométrico validado aplicado desde ${estructura.casoAprendido} con confianza ${Math.round(Number(estructura.confianzaGeometria) * 100)} %; la salida conserva ejes y dimensiones del plano abierto.`);
  } else revisionInterna.push(estructura.motivoLimite ?? "Sin adaptación geométrica aprendida: el dibujo sale de la arquitectura leída y los criterios.");
  avisos.push(...revisionInterna.filter((a) => /área abierta|no clasificad|baja confianza|último nivel lleva losa/i.test(a)));
  if (iPorticos < 0 && porticos.length) avisos.push("La plantilla no tiene espacio para pórticos.");
  if (similares.length) avisos.push(`Pórticos iguales dibujados una sola vez: ${similares.join("; ")}.`);
  if (nNiveles > 1 && fuenteNiveles !== "visible") avisos.push(fuenteNiveles === "capa oculta"
    ? `Los niveles (NPT +${[...entrepisos, altura].map((z) => z.toFixed(2)).join(", +")}) los tomé de capas apagadas de la arquitectura: confírmalos.`
    : `La arquitectura no rotula los NPT de los niveles superiores: supuse +${[...entrepisos, altura].map((z) => z.toFixed(2)).join(", +")} (altura del 1er nivel). Dímelos para corregir.`);
  if (!cc.tramos) avisos.push("No encontré muros sobre los ejes: el plano de cimiento corrido quedó sin cimientos.");
  return {
    desplazamiento: O, copias, excluirPlantilla, primitivas: prim, laminas, proyecto, avisos: [...avisos, ...(fueraDeLamina.length ? [`Se sale del marco de la lámina: ${fueraDeLamina.join("; ")}. Revísalo antes de entregar.`] : [])], revisionInterna, ubicaciones, fueraDeLamina,
    usarPlantilla: !adaptativa, formato: paquete?.formato ?? null, secciones,
    // Para la copia de la plantilla: parámetros sísmicos del proyecto en lugar de los del expediente.
    textosPlantilla: dp.textos,
    zona: {x0: zona.x0 + O.x, y0: zona.y0 + O.y, x1: zona.x1 + O.x, y1: zona.y1 + O.y},
    resumen: {
      cimentacion: cim.tipo === "platea" ? "platea" : `${cim.zapatas.length} zapatas`,
      hz: cim.peralte, df: cim.df, sismo: dp.sismo,
      cimientoCorrido: cc.tramos, anchoCimiento: cc.ancho,
      aligerado: sinLosa ? null : {espesor: ali.espesor, viguetas: ali.viguetas, vigas: ali.vigas, panos: ali.panos?.length},
      losas: losasDibujadas,
      columnetas: cuadroCtas?.filas?.map((f) => `${f.codigo} ${f.refuerzo}`),
      rotulo: Object.keys(datosRotulo).filter((k2) => datosRotulo[k2]),
      porticos: dibujados.map(nombreDe), porticosSimilares: Object.fromEntries(dibujados.map((i) => [nombreDe(i), representante.get(i)])), altura, niveles: nNiveles, entrepisos, losaTecho,
      techo: cumbrera ? {pendiente, cumbrera: Math.max(...porticos.map((p) => p.cumbrera ?? 0))} : null,
      columnas: cuadro.filas, escalas: [...escalas],
    },
    // Pórticos en coordenadas locales (x desde la primera columna, y desde ±0.00), sin ubicar en
    // la lámina: para compararlos con los del ingeniero (evaluar-porticos.mjs).
    // Con biblioteca: la pieza usada y el dibujo del generador (para medir con y sin ella).
    // Detalles (cortes de cimiento, escalera, cuadros) en coordenadas locales: metros (cortes y
    // escalera) o unidades de lámina (cuadros); con biblioteca, la pieza usada y el dibujo del generador.
    detallesLocales,
    // Muros candidatos de la cimentación (rasgos, regla y si se dibujaron): para aprender de las
    // correcciones del ingeniero (aprender_correcciones).
    candidatosMuro: cim.candidatosMuro ?? [],
    porticosLocales: porticos.map((p) => ({eje: p.modelo?.eje, titulo: p.contenido?.titulo, primitivas: p.contenido?.primitivas ?? [], geometria: p.geometria ?? null, ...(p.biblioteca ? {biblioteca: p.biblioteca, generador: p.generador?.primitivas ?? []} : {})})),
    // Modelo estructural de lo dibujado: de aquí sale el metrado (metrado/metrado.js).
    modelo: {
      proyecto, niveles: nNiveles, entrepisos, techo: altura, losaTecho: sinLosa ? false : losaTecho,
      escalera,
      planos: [cim.contenido.titulo, cc.contenido.titulo, ...(sinLosa ? [] : [ali.contenido.titulo]), ...extras.map((c) => c.titulo)],
      cimentacion: {tipo: cim.tipo, hz: cim.peralte, df: cim.df, fuentes: {hz: fuenteDe("hz"), df: fuenteDe("df")}, ...cim.modelo},
      cimientoCorrido: {ancho: cc.ancho, ...cc.modelo},
      columnas: lectura.columnas.map((c) => ({tipo: c.tipo, eje: c.eje, b: c.b, h: c.h, area: c.area, forma: c.forma, clase: c.clase, perimetro: perimetroDe(c.contorno)})),
      refuerzoColumnas: cuadro.filas.map((f) => ({tipo: f.tipo, refuerzo: f.refuerzo, ...(f.verificado ? {verificado: f.verificado} : {})})),
      // Columnetas con el eje y el alto real del pórtico donde se dibujaron (bajo el techo
      // inclinado); las que no caen en un pórtico quedan sin alto (el metrado usa el del muro).
      columnetas: (lectura.columnetas ?? []).map((c) => {
        const enPortico = porticos.flatMap((p) => p.modelo?.columnetas ?? []).find((x) => x.columneta === c);
        return {codigo: c.codigo, b: c.b, h: c.h, eje: enPortico ? porticos.find((p) => p.modelo?.columnetas.includes(enPortico)).modelo.eje : null, alto: enPortico?.alto ?? null, juntoVentana: Boolean(enPortico?.juntoVentana)};
      }),
      vsa: porticos.flatMap((p) => (p.modelo?.vsa ?? []).map((v) => ({...v, eje: p.modelo.eje}))),
      dinteles: porticos.flatMap((p) => (p.modelo?.dinteles ?? []).map((v) => ({...v, eje: p.modelo.eje}))),
      cubierta: cumbrera ? {pendiente, cumbrera: Math.max(...porticos.map((p) => p.cumbrera ?? 0)), alero: CRITERIOS.aligerado.alero,
        // Techo de la arquitectura (para el modelo de análisis): recta de la cumbrera en planta (metros),
        // pendiente de cada faldón y el eje donde se apoya.
        ...(dosAguas && techoPortico ? {linea: techoPortico.linea, pendientes: techoPortico.pendientes, ejeCumbrera: techoPortico.eje, nivelCumbrera: techoPortico.H, fuente: "cortes de la arquitectura"} : techoDePorticos(porticos, cumbrera))} : null,
      vigas: ali.modelo?.vigas ?? [],
      losa: ali.modelo?.losa ?? null,
      vigaPeralte: vigaTipo.h,
    },
  };
}

// Zonas de una lámina de la plantilla que no son marco ni rótulo (para copiar solo esos dos).
function interiorSinRotulo(lamina) {
  const m = lamina.marco, r = lamina.rotulo ?? [];
  const rx0 = Math.min(...r.map((c) => c.x)) - 1.6, ry1 = Math.max(...r.map((c) => c.y)) + 1.2;
  const g = 0.35;
  return [
    {x: m.x + g, y: ry1, x1: m.x1 - g, y1: m.y1 - g},
    {x: m.x + g, y: m.y + g, x1: rx0, y1: ry1},
  ];
}

const perimetroDe = (pts = []) => pts.reduce((s, p, i) => s + Math.hypot(pts[(i + 1) % pts.length].x - p.x, pts[(i + 1) % pts.length].y - p.y), 0);

// Cumbrera supuesta: recta por el centro de las columnas, en la dirección del lado largo.
// Techo a dos aguas tal como quedó dibujado en los pórticos (sin perfil en los cortes): la recta de la
// cumbrera de la losa, su nivel y la pendiente del faldón (de la cara interior de la columna a la
// cumbrera, la que dibuja el pórtico). Así el modelo de análisis tiene el mismo techo que las láminas.
function techoDePorticos(porticos, cumbrera) {
  const p = porticos.find((x) => x.geometria?.xCumbrera != null && x.geometria?.cumbrera > x.geometria?.techo);
  if (!p || !cumbrera?.a || !cumbrera?.d) return {};
  const g = p.geometria, iL = g.ejes[0].s1, iR = g.ejes.at(-1).s0;
  const sL = (g.cumbrera - g.techo) / Math.max(0.3, g.xCumbrera - iL), sR = (g.cumbrera - g.techo) / Math.max(0.3, iR - g.xCumbrera);
  const s = Math.round(((sL + sR) / 2) * 10000) / 10000;
  const l = Math.hypot(cumbrera.d.x, cumbrera.d.y) || 1;
  return {linea: {a: cumbrera.a, d: {x: cumbrera.d.x / l, y: cumbrera.d.y / l}}, pendientes: {neg: s, pos: s}, ejeCumbrera: null,
    nivelCumbrera: Math.max(...porticos.map((x) => x.geometria?.cumbrera ?? 0)), fuente: "pórticos dibujados"};
}

function cumbreraAlCentro(lectura) {
  const pts = (lectura.columnas ?? []).flatMap((c) => c.contorno ?? []);
  if (pts.length < 3) return null;
  const u = direccionPrincipal(lectura.ejes), v = {x: -u.y, y: u.x};
  const pr = (p, e) => p.x * e.x + p.y * e.y;
  const [u0, u1] = [Math.min(...pts.map((p) => pr(p, u))), Math.max(...pts.map((p) => pr(p, u)))];
  const [v0, v1] = [Math.min(...pts.map((p) => pr(p, v))), Math.max(...pts.map((p) => pr(p, v)))];
  const cu = (u0 + u1) / 2, cv = (v0 + v1) / 2;
  const a = {x: u.x * cu + v.x * cv, y: u.y * cu + v.y * cv};
  return {a, d: u1 - u0 >= v1 - v0 ? u : v, supuesta: true};
}
