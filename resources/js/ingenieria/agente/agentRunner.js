// Bucle del Agente NovaCad sobre cualquier API compatible con OpenAI
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
// Motor del despacho en el servidor (GPT): la clave vive en el .env y el navegador pasa por el
// proxy de Laravel (AgenteLlmController). Fuera del equipo de desarrollo es el motor por defecto.
export const AGENTE_SERVIDOR = {baseUrl: "/software/etabs/agente/llm", model: "servidor", apiKey: "", memoria: "completa"};
export const OLLAMA_LOCAL = {baseUrl: "http://127.0.0.1:11434/v1", model: "qwen3-cad", apiKey: "", memoria: "auto"};
const enEquipoLocal = () => typeof location === "undefined" || /^(localhost|127\.0\.0\.1|.*\.test)$/.test(location.hostname);
export const DEFAULT_AGENT_SETTINGS = enEquipoLocal() ? OLLAMA_LOCAL : AGENTE_SERVIDOR;
export const usaServidor = (settings) => String(settings?.baseUrl ?? "").startsWith("/");
const MAX_ROUNDS = 3;
const HISTORY_TURNS = 4;

export const SYSTEM_PROMPT = [
  "Eres el Agente NovaCad, asistente CAD de ingenieros civiles en Perú. Responde en español, breve. Unidades en metros.",
  "Usa SIEMPRE una herramienta; no inventes resultados ni datos (Hz, Df, zona, suelo, categoría, motivos): pásalos solo si el usuario los dijo.",
  "Casa o vivienda: casa_primer_nivel (por defecto frente 8, fondo 20, 3 dormitorios, 2 baños, cochera).",
  "Arquitectura a estructuras (estructurar, cimentación, aligerado, rehacer láminas): plano_estructuras sin conservar; no pidas pisos ni cargas. Solo ejes y columnas: leer_estructura. Varias vistas: vistas_plano y pasa 'vista'.",
  "Analizar o proponer la estructura: proponer_estructura. Metrado: metrar_estructura. Corrección del ingeniero: corregir_estructura. Hz, Df, zona, suelo, categoría (colegio A2, vivienda C): datos_proyecto. Revisar o corregir encimados: revisar_laminas. Borrar: quitar_laminas.",
  "Si el resultado trae 'mensaje', respóndelo tal cual con sus avisos. Si ninguna herramienta sirve, dilo. Nunca digas que algo se hizo si no devolvió ok.",
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

// El modelo escribió mal la llamada a la herramienta (Ollama: "XML syntax error…" con 500).
const LLAMADA_MAL_ESCRITA = /XML syntax error|tool call|function call|unexpected (end|token)|failed to parse/i;

async function chat({settings, messages, tools, fetchImpl, signal, temperature = 0.2}) {
  const response = await fetchImpl(`${settings.baseUrl.replace(/\/+$/, "")}/chat/completions`, {
    method: "POST",
    signal,
    // Por el servidor: sesión y token CSRF de Laravel, nunca una clave desde el navegador.
    headers: usaServidor(settings)
      ? {"Content-Type": "application/json", Accept: "application/json", "X-Requested-With": "XMLHttpRequest", "X-CSRF-TOKEN": (typeof document !== "undefined" ? document.querySelector('meta[name="csrf-token"]')?.content : "") ?? ""}
      : {"Content-Type": "application/json", ...(settings.apiKey ? {Authorization: `Bearer ${settings.apiKey}`} : {})},
    ...(usaServidor(settings) ? {credentials: "same-origin"} : {}),
    body: JSON.stringify({model: settings.model, messages, tools, tool_choice: "auto", temperature, stream: false}),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    if (usaServidor(settings)) {
      // El proxy ya devuelve un mensaje claro (sin clave, límite de pedidos, proveedor caído).
      let mensaje = "";
      try { mensaje = JSON.parse(detail).error?.message ?? ""; } catch { /* no es JSON */ }
      throw new Error(mensaje || `El servidor del agente respondió ${response.status}.`);
    }
    if (response.status === 402) throw new Error("El modelo elegido es de pago (nube). Usa un modelo local, por ejemplo qwen3-cad.");
    if (response.status === 404) throw new Error(`El modelo "${settings.model}" no existe en el servidor. Revisa la configuración.`);
    const error = new Error(`El servidor del modelo respondió ${response.status}. ${detail.slice(0, 160)}`);
    if (response.status >= 500 && LLAMADA_MAL_ESCRITA.test(detail)) error.llamadaMalEscrita = true;
    throw error;
  }
  const data = await response.json();
  return {message: data.choices?.[0]?.message ?? {role: "assistant", content: ""}, usage: data.usage};
}

// Un reintento (más determinista) si el modelo escribió mal la llamada; si vuelve a pasar,
// un mensaje que se entienda en lugar del error crudo de Ollama.
async function chatConReintento(opciones) {
  try { return await chat(opciones); } catch (error) {
    if (!error.llamadaMalEscrita) throw error;
  }
  try { return await chat({...opciones, temperature: 0}); } catch (error) {
    if (!error.llamadaMalEscrita) throw error;
    throw new Error(`El modelo "${opciones.settings.model}" no escribió bien la llamada a la herramienta (dos veces). No se hizo ningún cambio en el plano. Prueba de nuevo o usa qwen3-cad, que es el evaluado para el agente.`);
  }
}

const NOMBRES = {plano_estructuras: "las láminas de estructuras", datos_proyecto: "los datos del proyecto", quitar_laminas: "quitar las láminas", vistas_plano: "las vistas del plano", leer_estructura: "las columnas y ejes"};

// La respuesta final sale de lo que realmente pasó, no de lo que el modelo diga: un modelo
// chico puede decir "Se generaron las láminas" aunque la herramienta haya fallado.
// - Herramienta que falló (sin un intento posterior que funcionara): se dice que no se hizo.
// - Herramientas que funcionaron con 'mensaje': ese mensaje y sus avisos, tal cual.
// - Ninguna herramienta: el texto del modelo, pero sin afirmar cambios que no ocurrieron.
export function respuestaHonesta(textoModelo, steps) {
  const ultimo = new Map();
  for (const s of steps) ultimo.set(s.tool, s);
  const fallidos = [...ultimo.values()].filter((s) => s.result?.ok === false);
  const hechos = [...ultimo.values()].filter((s) => s.result?.ok !== false && s.result?.mensaje);
  const partes = [];
  for (const s of fallidos) partes.push(`No pude hacer ${NOMBRES[s.tool] ?? s.tool}: ${s.result.error ?? "error desconocido"}. No se cambió el plano.`);
  for (const s of hechos) {
    const avisos = (s.result.avisos ?? []).filter(Boolean);
    partes.push([s.result.mensaje, ...avisos.map((a) => `Aviso: ${a}`)].join("\n"));
  }
  if (partes.length) return partes.join("\n\n");
  const texto = stripThinking(textoModelo);
  if (!steps.length && /\b(gener[ée]|he generado|se (han )?generado|correg[íi]|mejor[ée]|modifiqu[ée]|actualic[ée]|listo)\b/i.test(texto || "listo")) {
    return `No hice cambios en el plano: no se ejecutó ninguna herramienta.${texto && !/^listo\.?$/i.test(texto) ? `\n\n${texto}` : ""}`;
  }
  return texto || "No hice cambios en el plano.";
}

// history: [{role: "user"|"assistant", content}] de turnos anteriores (solo texto).
export async function runAgent({text, history = [], settings = DEFAULT_AGENT_SETTINGS, context, skills = SKILLS, fetchImpl = globalThis.fetch?.bind(globalThis), onStep = () => {}, signal}) {
  const tools = toolDefinitions(skills);
  // Lo que el usuario escribió: las herramientas solo aceptan datos del proyecto que estén ahí
  // (un modelo chico inventaba "suelo S2, zona 3, Df 2.50" en "genera el plano con platea").
  if (context?.memoria) context.memoria.ultimoPedido = String(text ?? "");
  const messages = [{role: "system", content: promptDelSistema(settings)}, ...history.slice(-HISTORY_TURNS), {role: "user", content: text}];
  const steps = [];
  const usage = {prompt: 0, completion: 0};
  for (let round = 0; round <= MAX_ROUNDS; round++) {
    const {message, usage: used} = await chatConReintento({settings, messages, tools: round < MAX_ROUNDS ? tools : undefined, fetchImpl, signal});
    usage.prompt += used?.prompt_tokens ?? 0;
    usage.completion += used?.completion_tokens ?? 0;
    const calls = message.tool_calls ?? [];
    if (!calls.length) return {reply: respuestaHonesta(message.content, steps), steps, usage};

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
  return {reply: steps.length ? respuestaHonesta("", steps) : "Se alcanzó el límite de pasos para este pedido.", steps, usage};
}
