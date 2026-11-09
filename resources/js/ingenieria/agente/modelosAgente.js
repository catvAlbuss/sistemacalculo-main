// Modelos del Agente Predim: lista los instalados en Ollama que aceptan
// herramientas y les pone la nota de la evaluación del agente.
//
// Lo que se evalúa: que elija la herramienta correcta y sus argumentos en 4 pedidos
// típicos del chat ("genera el plano de estructuras", "¿qué vistas tiene?",
// "… con platea", "estructura el techo … con zapatas"). El dibujo no depende del
// modelo: lo hacen las herramientas, que son deterministas. El modelo solo entiende
// el pedido y redacta la respuesta.
// Evaluado el 2026-11-06 con scripts de prueba sobre Ollama local.

export const EVALUACION_MODELOS = {
  "qwen3-cad": {nota: "Recomendado: 4/4 pedidos bien, ~3.7 s por paso", apto: true},
  "qwen3.5:4b-q4_K_M": {nota: "4/4 pedidos bien, ~3 s por paso; además lee imágenes (útil para planos escaneados)", apto: true},
  "qwen3:4b-instruct-2507-q4_K_M": {nota: "Rápido (0.5 s) pero elige mal la herramienta (1/4)", apto: false},
  "coder-agent-8k": {nota: "No llama herramientas (0/4): es un modelo para código", apto: false},
  "qwen2.5-coder:7b-instruct": {nota: "No llama herramientas (0/4): es un modelo para código", apto: false},
  "gpt-oss:20b-cloud": {nota: "Corre en la nube de Ollama (envía el pedido fuera del equipo; puede tener límites de uso)", apto: true},
};

const sinLatest = (nombre) => String(nombre).replace(/:latest$/, "");
export const notaModelo = (nombre) => EVALUACION_MODELOS[sinLatest(nombre)] ?? null;

// Modelos de chat con herramientas instalados en el servidor Ollama de baseUrl
// (".../v1" → ".../api/tags"). Los modelos de embeddings (bge-m3) no sirven para chatear.
export async function modelosInstalados(baseUrl, fetchImpl = globalThis.fetch?.bind(globalThis)) {
  const raiz = String(baseUrl).replace(/\/+$/, "").replace(/\/v1$/, "");
  const respuesta = await fetchImpl(`${raiz}/api/tags`);
  if (!respuesta.ok) throw new Error(`Ollama respondió ${respuesta.status}`);
  const {models = []} = await respuesta.json();
  return models
    .filter((m) => (m.capabilities ? m.capabilities.includes("tools") : !/embed|bge/i.test(m.name)))
    .map((m) => ({nombre: sinLatest(m.name), tamano: m.details?.parameter_size ?? "", nube: Boolean(m.remote_host), ...(notaModelo(m.name) ?? {nota: "Sin evaluar con el agente", apto: null})}))
    .sort((a, b) => (b.apto === true) - (a.apto === true) || a.nube - b.nube || a.nombre.localeCompare(b.nombre));
}
