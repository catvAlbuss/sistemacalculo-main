// Pedidos del cliente sobre las láminas ("quiero mis láminas sin columnas"): el agente aconseja con la
// norma, ofrece opciones (la recomendada primero), ejecuta la que el cliente elija y la deja escrita
// en el registro de decisiones y en las notas de la lámina. Una desviación no documentada no se
// puede firmar; una documentada sí se puede discutir.
//
// accion: {ocultar: [{capas, en: [tipos o ids de bloque]}], quitar: [tipos o ids de bloque]} — se aplica
// en laminasPlantilla.js sobre los bloques de la lámina antes de componerla.

import {L} from "../cad/primitives.js";

const PLANTAS = ["cimentacion", "cimiento", "losa", "losaTecho", "tabiqueria"];
const GE020 = {norma: "GE.020 art. 12", estado: "investigada"};

export const PEDIDOS = [
  {
    id: "sin_columnas", titulo: "Láminas sin columnas", claves: ["columna", "columnas"],
    patron: /\bsin (las )?columnas\b|\b(quita|saca|elimina|borra|oculta)\w*\b.*\bcolumnas\b|\bno (dibujes|pongas|muestres)\b.*\bcolumnas\b/,
    deshacer: /\b(vuelve a poner|pon de nuevo|pon otra vez|restaura|regresa|devuelve)\w*\b.*\bcolumnas\b|\bcon (las )?columnas\b/,
    consejo: "Las columnas sostienen el edificio: su ubicación (planta de cimentación) y su sección y refuerzo (cuadro de columnas) tienen que estar en las láminas para construirlas y para la revisión de la licencia.",
    cita: GE020, norma: "Los planos de estructuras definen cada elemento con su dimensión y refuerzo (GE.020 art. 12; refuerzo según E.060).",
    opciones: [
      {id: "aligerado", texto: "Ocultarlas solo en la planta de aligerado (el resto queda igual)", recomendada: true,
        nota: "Columnas no dibujadas en la planta de aligerado (ver planta de cimentación y cuadro de columnas).", accion: {ocultar: [{capas: [L.COLUMNAS, L.COLUMNAS_ID], en: ["losa", "losaTecho"]}]}},
      {id: "plantas", texto: "Ocultarlas en todas las plantas y dejar el cuadro de columnas",
        nota: "Columnas no dibujadas en las plantas: su ubicación y refuerzo van en el cuadro de columnas.", accion: {ocultar: [{capas: [L.COLUMNAS, L.COLUMNAS_ID], en: PLANTAS}]}},
      {id: "todo", texto: "Quitarlas también del cuadro (la lámina no se podrá aprobar)", noAprobable: true,
        nota: "Sin columnas ni cuadro de columnas: las láminas NO definen las columnas; deben completarse antes de construir.", accion: {ocultar: [{capas: [L.COLUMNAS, L.COLUMNAS_ID], en: PLANTAS}], quitar: ["cuadroColumnas", "cuadroPlacas"]}},
    ],
  },
  {
    id: "sin_cotas", titulo: "Láminas sin cotas", claves: ["cota", "cotas"],
    patron: /\bsin (las )?cotas\b|\b(quita|saca|elimina|borra|oculta)\w*\b.*\bcotas\b|\bno (dibujes|pongas|muestres)\b.*\bcotas\b/,
    deshacer: /\b(vuelve a poner|pon de nuevo|restaura|regresa|devuelve)\w*\b.*\bcotas\b|\bcon (las )?cotas\b/,
    consejo: "Las cotas dan las luces entre ejes, las secciones y los niveles: sin ellas el maestro de obra no puede replantear ni armar.",
    cita: GE020, norma: "Los planos de estructuras deben poder construirse sin medir sobre el papel (GE.020 art. 12).",
    opciones: [
      {id: "detalles", texto: "Quitar solo las cotas de pórticos y cortes (las plantas conservan sus luces)", recomendada: true,
        nota: "Cotas de detalle omitidas: rigen las cotas de las plantas.", accion: {ocultar: [{capas: [L.COTAS_E, L.COTAS], en: ["portico", "corte", "escalera"]}]}},
      {id: "todas", texto: "Quitar todas las cotas (no recomendado)", noAprobable: true,
        nota: "Láminas sin cotas: no sirven para replantear; deben acotarse antes de construir.", accion: {ocultar: [{capas: [L.COTAS_E, L.COTAS], en: [...PLANTAS, "portico", "corte", "escalera"]}]}},
    ],
  },
  {
    id: "sin_porticos", titulo: "Láminas sin pórticos", claves: ["portico", "porticos", "elevacion"],
    patron: /\bsin (los )?porticos\b|\b(quita|saca|elimina|borra|oculta)\w*\b.*\bporticos\b|\bno (dibujes|pongas)\b.*\bporticos\b/,
    deshacer: /\b(vuelve a poner|pon de nuevo|restaura|regresa|devuelve)\w*\b.*\bporticos\b|\bcon (los )?porticos\b/,
    consejo: "Los pórticos muestran en elevación las alturas, las vigas y su refuerzo (ganchos, confinamiento, empalmes). Sin ellos, el armado de vigas queda solo en el cuadro de vigas.",
    cita: {norma: "E.060 cap. 21", estado: "investigada"}, norma: "El detallado sísmico de vigas (confinamiento, empalmes fuera de la zona 2h) debe quedar indicado (E.060 cap. 21).",
    opciones: [
      {id: "quitar", texto: "Quitar los pórticos y dejar el cuadro de vigas con su refuerzo", recomendada: true,
        nota: "Pórticos omitidos: el refuerzo de vigas va en el cuadro de vigas.", accion: {quitar: ["portico"]}},
    ],
  },
  {
    id: "sin_tablas", titulo: "Láminas sin tablas estándar", claves: ["tabla", "tablas", "desencofrado", "empalmes", "desarrollo"],
    patron: /\bsin (las )?tablas\b|\bsin (el )?(cuadro de )?(desencofrado|empalmes|longitudes)\b|\b(quita|saca|elimina)\w*\b.*\btablas\b/,
    deshacer: /\b(vuelve a poner|pon de nuevo|restaura|regresa|devuelve)\w*\b.*\btablas\b|\bcon (las )?tablas\b/,
    consejo: "Las longitudes de desarrollo y los empalmes dicen cuánto se traslapa y ancla cada varilla; el desencofrado, la especificación del ladrillo y las viguetas son tablas de apoyo.",
    cita: {norma: "E.060 12.2 y 12.15", estado: "investigada"}, norma: "Desarrollo y empalmes del refuerzo (E.060 12.2 y 12.15).",
    opciones: [
      {id: "apoyo", texto: "Quitar desencofrado, ladrillo y viguetas; dejar desarrollo y empalmes", recomendada: true,
        nota: "Tablas de desencofrado, ladrillo y viguetas omitidas.", accion: {quitar: ["desencofrado", "ladrillo", "cuadroViguetas"]}},
      {id: "todas", texto: "Quitar todas, también desarrollo y empalmes (no recomendado)", noAprobable: true,
        nota: "Sin longitudes de desarrollo ni empalmes: deben indicarse antes de armar.", accion: {quitar: ["desencofrado", "ladrillo", "cuadroViguetas", "desarrollo", "empalmes"]}},
    ],
  },
  {
    id: "sin_notas", titulo: "Láminas sin notas técnicas", claves: ["notas", "especificaciones"],
    patron: /\bsin (las )?(notas|especificaciones)\b|\b(quita|saca|elimina)\w*\b.*\b(notas|especificaciones)\b/,
    deshacer: /\b(vuelve a poner|pon de nuevo|restaura|regresa|devuelve)\w*\b.*\b(notas|especificaciones)\b|\bcon (las )?notas\b/,
    consejo: "Las notas dicen con qué se construye: f'c, fy, recubrimientos, sobrecargas y parámetros sísmicos. Sin ellas la lámina no se puede ejecutar ni aprobar.",
    cita: {norma: "E.060 7.7.1 · E.020 · E.030", estado: "confirmada"}, norma: "Recubrimientos (E.060 7.7.1), sobrecargas (E.020) y parámetros sísmicos (E.030) van en los planos.",
    opciones: [
      {id: "quitar", texto: "Quitarlas de todas formas (la lámina no se podrá aprobar)", noAprobable: true,
        nota: null, accion: {quitar: ["notas"]}},
    ],
  },
];

const sinTildes = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// ¿El texto es un pedido de este catálogo? {pedido, deshacer}
export function reconocerPedido(texto) {
  const t = sinTildes(texto);
  for (const p of PEDIDOS) {
    if (p.deshacer.test(t)) return {pedido: p, deshacer: true};
    if (p.patron.test(t)) return {pedido: p, deshacer: false};
  }
  return null;
}

export const pedidoPorId = (id) => PEDIDOS.find((p) => p.id === id) ?? null;

// Preferencia aceptada, con lo que necesita el registro de decisiones.
export function preferenciaDe(pedido, opcionId) {
  const o = pedido.opciones.find((x) => x.id === opcionId);
  if (!o) return null;
  return {pedido: pedido.id, opcion: o.id, titulo: pedido.titulo, opcionTexto: o.texto, consejo: pedido.consejo, cita: pedido.cita, norma: pedido.norma,
    claves: pedido.claves, nota: o.nota, noAprobable: Boolean(o.noAprobable), accion: o.accion,
    alternativas: pedido.opciones.filter((x) => x.id !== o.id).map((x) => x.texto).concat("dejar las láminas como estaban")};
}

// Las preferencias del cliente sobre los bloques de la lámina (laminasPlantilla.js): quita bloques y
// oculta capas. bloques: [{id, tipo, contenido}]. Devuelve los bloques que quedan.
export function aplicarPreferencias(bloques, preferencias = []) {
  if (!preferencias?.length) return bloques;
  const quitar = preferencias.flatMap((p) => p.accion?.quitar ?? []);
  const ocultar = preferencias.flatMap((p) => p.accion?.ocultar ?? []);
  return bloques.filter((b) => !quitar.includes(b.id) && !quitar.includes(b.tipo)).map((b) => {
    const capas = ocultar.filter((o) => o.en.includes(b.tipo) || o.en.includes(b.id)).flatMap((o) => o.capas);
    return capas.length && b.contenido?.primitivas ? {...b, contenido: {...b.contenido, primitivas: b.contenido.primitivas.filter((q) => !capas.includes(q.layer))}} : b;
  });
}

// Memoria de las preferencias del cliente en este navegador (por cliente: el usuario de la sesión).
const CLAVE = "novacad:preferencias-laminas";
export function cargarPreferencias() {
  try { return JSON.parse(globalThis.localStorage?.getItem(CLAVE) ?? "[]").filter((p) => pedidoPorId(p.pedido)); } catch { return []; }
}
export function guardarPreferencias(lista) {
  try { globalThis.localStorage?.setItem(CLAVE, JSON.stringify(lista.map(({pedido, opcion}) => ({pedido, opcion})))); } catch { /* sin almacenamiento: vale para esta sesión */ }
}
// Preferencias guardadas → objetos completos (con su acción y su consejo).
export const completarPreferencias = (lista) => lista.map((p) => (pedidoPorId(p.pedido) ? preferenciaDe(pedidoPorId(p.pedido), p.opcion) : null)).filter(Boolean);
