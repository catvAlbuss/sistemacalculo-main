// Estilo del despacho aprendido de sus propios planos de estructuras terminados.
//
// El ingeniero abre en NovaCad un plano suyo (cimentación, cimiento corrido, aligerado, tabiquería) y
// pide «aprende mi estilo». Por cada planta se mide qué elementos dibuja (muros, columnetas, acero,
// viguetas…), cuánto pesan en el dibujo y en qué capa los pone. Con 2 o más planos que coinciden:
//   · quita de esa planta lo que el despacho nunca dibuja ahí (solo elementos de presentación:
//     muros, columnetas, acero dibujado, marcas de viguetas; nunca columnas, vigas, zapatas ni losas);
//   · agrega lo opcional que siempre dibuja (muros y columnetas en la cimentación, columnetas en la losa);
//   · lleva cada elemento a la capa que usa el despacho (si el nombre de su capa lo identifica).
// Medido dejando fuera cada módulo (scripts/agente/evaluar-dibujo.mjs --estilo).
// Puro: sin DOM ni servidor; el skill (agente/skills/estiloDespacho.js) lo guarda por usuario.
import {L} from "../cad/primitives.js";
import {detectarVistas} from "../lectura/lectorPlano.js";
import {clasificarVista, DICCIONARIO_CAPAS} from "../lectura/clasificador.js";

// Plantas comparables, por el título de la vista (los mismos que la evaluación).
export const TIPOS_PLANTA = [
  {id: "cimentacion", re: /PLATEA|CIMENTACI[OÓ]N(?!.*CORRIDO)|ZAPATA/i},
  {id: "cimiento", re: /CIMIENTO\s+CORRIDO/i},
  {id: "losa", re: /LOSA|ALIGERADO|TECHO\s+\d|TECHO$/i, no: /TABIQUER/i},
  {id: "tabiqueria", re: /TABIQUER/i},
];
export const tipoDePlanta = (titulo) => TIPOS_PLANTA.find((t) => t.re.test(titulo ?? "") && !t.no?.test(titulo ?? ""))?.id ?? null;

// Capas semánticas del agente por clase de elemento.
export const CAPAS_DE_CLASE = {
  muro: [L.MUROS_E], columneta: [L.COLUMNETAS], acero: [L.ACERO_LONG], vigueta: [L.VIGUETAS],
  viga: [L.VIGAS, L.VIGAS_CIM], zapata: [L.ZAPATAS], cimiento: [L.CIMIENTO], columna: [L.COLUMNAS],
};
// Lo que se puede quitar de una planta porque el despacho no lo dibuja ahí: presentación, no estructura
// (E.060 1.2.4 e pide tamaño, ubicación y refuerzo de todos los elementos: esos se quedan siempre).
export const QUITABLES = ["muro", "columneta", "acero", "vigueta"];
// Lo opcional que el agente sabe agregar cuando el despacho siempre lo dibuja.
export const AGREGABLES = {cimentacion: {muro: "murosCimentacion", columneta: "columnetasCimentacion"}, losa: {columneta: "columnetasLosa"}};

const SIN_DIBUJO = /texto|text|cota|acot|dim|eje|axis|achur|hatch|titul|rotulo|lamina|cuadro|niveles?$/i;
// Unidades del dibujo por la burbuja de los ejes: mm (radio ≥ 40), cm (≥ 4) o m.
const escalaDe = (radio) => (radio >= 40 ? 1000 : radio >= 4 ? 100 : 1);
const largoDe = (pts) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p.x - pts[i].x, p.y - pts[i].y), 0);
export const FRACCION_PRESENTE = 0.02;
const MIN_PLANOS = 2;
const r3 = (v) => Math.round(v * 1000) / 1000;

// Clase que da el NOMBRE de una capa (sin geometría): para usar la capa del despacho solo si la nombra.
export const claseDeCapa = (capa) => DICCIONARIO_CAPAS.find(([, re]) => re.test(capa ?? ""))?.[0] ?? null;

// Un plano del despacho (items aplanados del DWG) → {tipos: {cimentacion: {vistas, clases: {muro: {fraccion, capa}}}}}.
// Solo fracciones y nombres de capa: ni coordenadas ni textos del proyecto.
export function medirEstiloDePlano(items) {
  const tipos = {};
  for (const vista of detectarVistas(items)) {
    const tipo = tipoDePlanta(vista.titulo);
    if (!tipo || !vista.caja || (vista.ejes?.length ?? 0) < 2) continue;
    const k = escalaDe(vista.radio);
    const c = vista.caja, m = 1.5 * k;
    const dentro = (p) => p && p.x >= c.x0 - m && p.x <= c.x1 + m && p.y >= c.y0 - m && p.y <= c.y1 + m;
    const ents = items.filter((it) => (it.tipo === "linea" || it.tipo === "poli") && it.puntos?.length >= 2 && !SIN_DIBUJO.test(it.capa ?? "") && it.puntos.some(dentro));
    if (ents.length < 20) continue;
    const ejes = vista.ejes.map((e) => { const v = Math.abs(e.q.y - e.p.y) >= Math.abs(e.q.x - e.p.x); return {orientacion: v ? "x" : "y", posicion: v ? (e.p.x + e.q.x) / 2 / k : (e.p.y + e.q.y) / 2 / k}; });
    const M = (p) => ({x: p.x / k, y: p.y / k});
    const metros = ents.map((it) => ({...it, puntos: it.puntos.map(M), centro: it.centro ? M(it.centro) : it.centro}));
    const cl = clasificarVista({ejes, tipoPlano: tipo, entidades: metros});
    const porClase = {};
    let total = 0;
    metros.forEach((it, i) => {
      const clase = cl[i]?.clase;
      const l = largoDe(it.cerrada && it.puntos.length > 2 ? [...it.puntos, it.puntos[0]] : it.puntos);
      total += l;
      if (!CAPAS_DE_CLASE[clase]) return;
      const x = (porClase[clase] ??= {largo: 0, capas: {}});
      x.largo += l;
      x.capas[it.capa ?? "0"] = (x.capas[it.capa ?? "0"] ?? 0) + l;
    });
    if (!total) continue;
    const t = (tipos[tipo] ??= {vistas: 0, clases: {}});
    t.vistas++;
    for (const clase of Object.keys(CAPAS_DE_CLASE)) {
      const x = porClase[clase];
      const previa = t.clases[clase];
      const fraccion = x ? x.largo / total : 0;
      // Varias vistas del mismo tipo (losa de 1° y de techo): la que más lo dibuja.
      if (previa && previa.fraccion >= fraccion) continue;
      const capa = x ? Object.entries(x.capas).sort((a, b) => b[1] - a[1])[0][0] : null;
      t.clases[clase] = {fraccion: r3(fraccion), ...(capa ? {capa} : {})};
    }
  }
  return {tipos};
}

// Varios planos medidos → reglas de dibujo. planos: [{tipos}] (uno por módulo del despacho).
// {ocultar: [{capas, en}], opciones: {murosCimentacion…}, renombrar: [{capa, destino, en}], explicacion: [...], planos}
export function reglasDeEstilo(planos = []) {
  const ocultar = [], renombrar = [], explicacion = [], opciones = {};
  const nombres = {cimentacion: "cimentación", cimiento: "cimiento corrido", losa: "aligerado", tabiqueria: "tabiquería"};
  const elementos = {muro: "los muros", columneta: "las columnetas", acero: "el acero dibujado", vigueta: "las marcas de viguetas"};
  for (const {id: tipo} of TIPOS_PLANTA) {
    const conTipo = planos.map((p) => p.tipos?.[tipo]).filter(Boolean);
    if (conTipo.length < MIN_PLANOS) continue;
    const enBloques = tipo === "losa" ? ["losa", "losaTecho"] : [tipo];
    for (const clase of Object.keys(CAPAS_DE_CLASE)) {
      const vistos = conTipo.map((t) => t.clases?.[clase]).filter(Boolean);
      const presentes = vistos.filter((x) => x.fraccion >= FRACCION_PRESENTE).length;
      const n = conTipo.length;
      if (presentes === 0 && QUITABLES.includes(clase)) {
        ocultar.push({capas: CAPAS_DE_CLASE[clase], en: enBloques});
        explicacion.push(`En la planta de ${nombres[tipo]} no dibujas ${elementos[clase]} (${n} de ${n} planos): no los pongo.`);
        continue;
      }
      if (presentes * 3 < n * 2) continue;
      const opcion = AGREGABLES[tipo]?.[clase];
      if (opcion) { opciones[opcion] = true; explicacion.push(`En la planta de ${nombres[tipo]} dibujas ${elementos[clase]} (${presentes} de ${n} planos): los agrego.`); }
      // La capa del despacho: la más usada, si su nombre dice qué es (la capa "0" se lee por la forma).
      const votos = {};
      for (const x of vistos) if (x.capa && x.fraccion >= FRACCION_PRESENTE) votos[x.capa] = (votos[x.capa] ?? 0) + 1;
      const [capa, nVotos] = Object.entries(votos).sort((a, b) => b[1] - a[1])[0] ?? [];
      if (capa && nVotos * 3 >= n * 2 && claseDeCapa(capa) === clase) {
        for (const c of CAPAS_DE_CLASE[clase]) renombrar.push({capa: c, destino: capa, en: enBloques});
      }
    }
  }
  return {ocultar, renombrar, opciones, explicacion, planos: planos.length};
}

// Reglas → acción para aplicarPreferencias (agente/preferenciasCliente.js), sin nota en la lámina.
export function preferenciaDeEstilo(reglas) {
  if (!reglas || (!reglas.ocultar?.length && !reglas.renombrar?.length)) return null;
  return {pedido: "estilo_despacho", opcion: "aprendido", titulo: "Estilo del despacho", nota: null, accion: {ocultar: reglas.ocultar ?? [], renombrar: reglas.renombrar ?? []}};
}

export function textoEstilo(reglas) {
  if (!reglas?.planos) return "Aún no aprendí tu estilo: abre uno de tus planos de estructuras terminados y pídeme «aprende mi estilo de este plano».";
  if (!reglas.explicacion.length && !reglas.renombrar.length) return `Tengo ${reglas.planos} plano(s) tuyos; con ${MIN_PLANOS} o más que coincidan en una planta aplico tu estilo. Por ahora dibujo con el del despacho.`;
  const capas = [...new Set(reglas.renombrar.map((r) => r.destino))];
  return [`Aprendí tu estilo de ${reglas.planos} plano(s):`, ...reglas.explicacion.map((t) => `• ${t}`),
    ...(capas.length ? [`• Uso tus capas: ${capas.slice(0, 8).join(", ")}.`] : [])].join("\n");
}
