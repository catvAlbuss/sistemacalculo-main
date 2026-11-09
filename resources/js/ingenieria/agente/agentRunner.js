// Bucle del Agente Predim sobre cualquier API compatible con OpenAI
// (Ollama local por defecto). Ahorro de tokens:
//  - pocas herramientas de alto nivel (skills) con descripciones cortas;
//  - los resultados de herramientas son resúmenes, nunca el plano completo;
//  - solo se reenvían los últimos turnos de la conversación;
//  - "/no_think" desactiva el razonamiento largo de Qwen3;
//  - como máximo 3 rondas de herramientas por pedido.

import {SKILLS, toolDefinitions} from "./skills/index.js";
import {memoriaDelAgente} from "./conocimiento.js";

// memoria: "auto" | "completa" | "corta". En "auto", los modelos grandes o en la nube
// (ChatGPT, Claude, gpt-oss, >= 14B) reciben la memoria completa del agente
// (conocimiento.js); los locales chicos (Qwen 4B, 8k de contexto), solo el prompt corto.
export const DEFAULT_AGENT_SETTINGS = {baseUrl: "http://127.0.0.1:11434/v1", model: "qwen3-cad", apiKey: "", memoria: "auto"};
const MAX_ROUNDS = 3;
const HISTORY_TURNS = 4;

export const SYSTEM_PROMPT = [
  "Eres el Agente Predim, asistente CAD para ingenieros civiles en Perú. Responde siempre en español, breve.",
  "Unidades en metros. Usa SIEMPRE una herramienta para dibujar o leer el plano; no inventes resultados.",
  "Para una casa o vivienda usa casa_primer_nivel (si faltan datos usa: frente 8, fondo 20, 3 dormitorios, 2 baños, con cochera).",
  "Para pasar de arquitectura a estructuras (plano de estructuras, estructurar, cimentación, aligerado) usa plano_estructuras; no pidas pisos ni cargas. Para ver solo ejes y columnas usa leer_estructura.",
  "Si el archivo tiene varias láminas o vistas (primer nivel, techo, cimentación) usa vistas_plano y pasa 'vista' a las otras herramientas.",
  "Si el usuario da o pregunta Hz, Df, zona, suelo o categoría (colegio = A2, vivienda = C), usa datos_proyecto; si además pide las láminas, pásalos a plano_estructuras. plano_estructuras rehace y reemplaza las láminas anteriores.",
  "Si el resultado trae 'mensaje', responde ese mensaje tal cual y agrega los avisos; si no, resume en 2 o 3 líneas.",
  "/no_think",
].join("\n");

const MODELO_GRANDE = /gpt|claude|\bo\d|oss|cloud|sonnet|opus|haiku|fable|gemini|[:\-](?:1[4-9]|[2-9]\d|\d{3})b\b/i;
export function usaMemoriaCompleta(settings = DEFAULT_AGENT_SETTINGS) {
  if (settings.memoria === "completa") return true;
  if (settings.memoria === "corta") return false;
  const local = /\/\/(127\.0\.0\.1|localhost)[:/]/.test(settings.baseUrl ?? "");
  return !local || MODELO_GRANDE.test(settings.model ?? "");
}

// Prompt del sistema según el motor: corto para Ollama local chico; con la memoria
// del agente para modelos grandes. "/no_think" solo sirve a Qwen3.
export function promptDelSistema(settings = DEFAULT_AGENT_SETTINGS) {
  const base = SYSTEM_PROMPT.replace("\n/no_think", "");
  const qwen = /qwen/i.test(settings.model ?? "");
  return [base, ...(usaMemoriaCompleta(settings) ? ["", memoriaDelAgente()] : []), ...(qwen ? ["/no_think"] : [])].join("\n");
}

// Qwen3 y otros modelos pueden devolver su razonamiento entre <think>...</think>.
export const stripThinking = (value) => String(value ?? "").replace(/<think>[\s\S]*?<\/think>/g, "").replace(/^[\s\S]*<\/think>/, "").trim();

function parseArguments(raw) {
  if (raw && typeof raw === "object") return raw;
  try { return JSON.parse(raw || "{}"); } catch { return {}; }
}

async function chat({settings, messages, tools, fetchImpl, signal}) {
  const response = await fetchImpl(`${settings.baseUrl.replace(/\/+$/, "")}/chat/completions`, {
    method: "POST",
    signal,
    headers: {"Content-Type": "application/json", ...(settings.apiKey ? {Authorization: `Bearer ${settings.apiKey}`} : {})},
    body: JSON.stringify({model: settings.model, messages, tools, tool_choice: "auto", temperature: 0.2, stream: false}),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    if (response.status === 402) throw new Error("El modelo elegido es de pago (nube). Usa un modelo local, por ejemplo qwen3-cad.");
    if (response.status === 404) throw new Error(`El modelo "${settings.model}" no existe en el servidor. Revisa la configuración.`);
    throw new Error(`El servidor del modelo respondió ${response.status}. ${detail.slice(0, 160)}`);
  }
  const data = await response.json();
  return {message: data.choices?.[0]?.message ?? {role: "assistant", content: ""}, usage: data.usage};
}

// history: [{role: "user"|"assistant", content}] de turnos anteriores (solo texto).
export async function runAgent({text, history = [], settings = DEFAULT_AGENT_SETTINGS, context, skills = SKILLS, fetchImpl = globalThis.fetch?.bind(globalThis), onStep = () => {}, signal}) {
  const tools = toolDefinitions(skills);
  const messages = [{role: "system", content: promptDelSistema(settings)}, ...history.slice(-HISTORY_TURNS), {role: "user", content: text}];
  const steps = [];
  const usage = {prompt: 0, completion: 0};
  for (let round = 0; round <= MAX_ROUNDS; round++) {
    const {message, usage: used} = await chat({settings, messages, tools: round < MAX_ROUNDS ? tools : undefined, fetchImpl, signal});
    usage.prompt += used?.prompt_tokens ?? 0;
    usage.completion += used?.completion_tokens ?? 0;
    const calls = message.tool_calls ?? [];
    if (!calls.length) return {reply: stripThinking(message.content) || "Listo.", steps, usage};

    messages.push({role: "assistant", content: message.content ?? "", tool_calls: calls});
    for (const call of calls) {
      const skill = skills.find((item) => item.name === call.function?.name);
      const args = parseArguments(call.function?.arguments);
      let result;
      try {
        result = skill ? await skill.run(args, context) : {ok: false, error: `Herramienta desconocida: ${call.function?.name}`};
      } catch (error) {
        result = {ok: false, error: error?.message ?? String(error)};
      }
      const step = {tool: call.function?.name, args, result};
      steps.push(step);
      onStep(step);
      messages.push({role: "tool", tool_call_id: call.id, content: JSON.stringify(result)});
    }
  }
  return {reply: "Se alcanzó el límite de pasos para este pedido.", steps, usage};
}
