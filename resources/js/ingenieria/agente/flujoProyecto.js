// En qué va el proyecto y cuál es el siguiente paso, para que usar el agente sea simple: el panel
// muestra las etapas (plano → láminas → análisis → diseño → metrado), UN botón con lo siguiente y
// sugerencias según la etapa. Puro: lee la memoria del agente (ctx.memoria) y el estado de la lectura.

export const ETAPAS = [
  {id: "plano", titulo: "Plano"},
  {id: "laminas", titulo: "Láminas"},
  {id: "analisis", titulo: "Análisis"},
  {id: "diseno", titulo: "Diseño"},
  {id: "metrado", titulo: "Metrado"},
];

// lectura: "vacio" | "leyendo" | "lista" | "parcial" | "no".
export function estadoDelProyecto(memoria = {}, lectura = "vacio") {
  const hecho = {
    plano: lectura === "lista" || lectura === "parcial",
    laminas: Boolean(memoria.modeloEstructural),
    analisis: Boolean(memoria.resultadosSismicos || memoria.revisionAnalisis),
    diseno: Boolean(memoria.disenoColumnas),
    metrado: Boolean(memoria.metrado),
  };
  const enCurso = {plano: lectura === "leyendo", analisis: Boolean(memoria.esperandoAnalisis) && !hecho.analisis};
  const actual = ETAPAS.find((e) => !hecho[e.id])?.id ?? null;
  return {
    hecho, enCurso, actual,
    etapas: ETAPAS.map((e) => ({...e, estado: hecho[e.id] ? "hecho" : enCurso[e.id] ? "en_curso" : e.id === actual ? "actual" : "pendiente"})),
  };
}

const A = {
  todo: {texto: "Hacer todo: láminas, análisis y diseño", herramienta: "ciclo_completo", pedido: "Estructura y analiza", detalle: "Dibujo las láminas, las analizo en Análisis Estructural y aplico el diseño."},
  laminas: {texto: "Solo las láminas", herramienta: "plano_estructuras", pedido: "Genera las láminas de estructuras", detalle: "Cimentación, aligerado, pórticos y cuadros."},
  pasoAPaso: {texto: "Paso a paso", herramienta: "construir_estructura", pedido: "Construye la estructura paso a paso", detalle: "Te pregunto lo dudoso antes de dibujar."},
  analizar: {texto: "Analizar y diseñar", herramienta: "ciclo_completo", pedido: "Estructura y analiza", detalle: "Análisis sísmico, revisión E.030 y diseño de columnas en Análisis Estructural."},
  aplicar: {texto: "Aplicar el diseño a las láminas", herramienta: "aplicar_diseno", pedido: "Aplica el diseño", detalle: "Cuadro de columnas, cimentación y notas sísmicas con lo calculado."},
  metrado: {texto: "Sacar el metrado", herramienta: "metrar_estructura", pedido: "Saca el metrado de estructuras", detalle: "Partidas y Excel de lo dibujado."},
  revisar: {texto: "Revisar como ingeniero", herramienta: "revisar_norma", pedido: "Revisa como ingeniero", detalle: "Los 15 puntos de la norma: qué cumple y qué falta."},
  aprender: {texto: "Aprende de mis correcciones", herramienta: "aprender_correcciones", pedido: "Aprende de mis correcciones", detalle: "Si corregiste la cimentación a mano, aprendo tu criterio."},
  ordenar: {texto: "Ordenar la lámina", herramienta: "revisar_laminas", pedido: "Revisa las láminas", args: {corregir: true}, detalle: "Textos encimados y fuera de lámina."},
  estado: {texto: "¿En qué vamos?", herramienta: "estado_proyecto", pedido: "¿En qué vamos?"},
};

// El botón grande: lo que conviene hacer ahora (null = esperar o abrir un plano).
export function siguientePaso(memoria = {}, lectura = "vacio", {disenoPendiente = false} = {}) {
  const e = estadoDelProyecto(memoria, lectura);
  if (lectura === "vacio" || lectura === "no") return {texto: "Abre la arquitectura (DWG) para empezar", herramienta: null, detalle: lectura === "no" ? "Este plano no se puede estructurar: revisa los detalles de la lectura." : "Archivo ▸ Abrir, y el agente la lee sola."};
  if (lectura === "leyendo") return {texto: "Leyendo el plano…", herramienta: null, detalle: "Ejes, columnas, muros y textos."};
  if (!e.hecho.laminas) return {...A.todo, alternativas: [A.laminas, A.pasoAPaso]};
  if (e.enCurso.analisis && !disenoPendiente) return {texto: "Analizando en Análisis Estructural…", herramienta: null, detalle: "Cuando vuelva el diseño, lo aplico solo a las láminas.", alternativas: [A.aplicar]};
  if (disenoPendiente || (e.hecho.analisis && !e.hecho.diseno)) return {...A.aplicar, alternativas: [A.revisar]};
  if (!e.hecho.analisis) return {...A.analizar, alternativas: [A.metrado, A.revisar]};
  if (!e.hecho.metrado) return {...A.metrado, alternativas: [A.revisar]};
  return {...A.revisar, alternativas: [A.aprender]};
}

// Sugerencias cortas junto al cuadro de texto (3–4, según la etapa).
export function sugerencias(memoria = {}, lectura = "vacio") {
  const e = estadoDelProyecto(memoria, lectura);
  if (!e.hecho.plano) return [];
  if (!e.hecho.laminas) return [A.todo, A.laminas, A.pasoAPaso, A.estado];
  const lista = [A.revisar, A.ordenar, A.aprender, A.estado];
  if (!e.hecho.analisis) lista.unshift(A.analizar);
  if (!e.hecho.metrado) lista.splice(1, 0, A.metrado);
  return lista.slice(0, 4);
}

// Acciones del menú inicial: las tres principales y el resto en «más acciones».
export const ACCIONES_PRINCIPALES = [A.todo, A.laminas, A.metrado];
export const MAS_ACCIONES = [A.pasoAPaso, {texto: "Proponer la estructura", herramienta: "proponer_estructura", pedido: "Analiza este plano y propón la estructura", detalle: "Qué estructura conviene y por qué, sin dibujar."}, A.revisar, A.ordenar, A.aplicar, A.aprender,
  {texto: "Abrir Análisis Estructural", herramienta: "abrir_analisis", pedido: "Abre análisis estructural", detalle: "Con el modelo que armé desde la arquitectura."}];
