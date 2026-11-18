// Evalúa un modelo de lenguaje como motor del Agente Predim: corre los casos de
// casos-evaluacion.mjs y mide si elige la herramienta y los argumentos correctos.
// Sirve con cualquier API compatible con OpenAI (Ollama, OpenAI, Grok…).
//
//   node scripts/agente/evaluar-modelo.mjs                       (Ollama local, qwen3-cad)
//   AGENTE_MODEL=qwen3.5:4b-q4_K_M node scripts/agente/evaluar-modelo.mjs
//   AGENTE_URL=https://api.openai.com/v1 AGENTE_MODEL=… AGENTE_KEY=… node scripts/agente/evaluar-modelo.mjs
//   AGENTE_URL=https://api.openai.com/v1 AGENTE_MODEL=gpt-6.2-sol node scripts/agente/evaluar-modelo.mjs
//     (sin AGENTE_KEY toma AGENTE_LLM_KEY del .env local)
//
// La clave se lee de la variable de entorno o del .env; nunca se escribe ni se muestra.

import {SKILLS, toolDefinitions} from '../../resources/js/ingenieria/agente/skills/index.js';
import {promptDelSistema} from '../../resources/js/ingenieria/agente/agentRunner.js';
import {CASOS_EVALUACION} from './casos-evaluacion.mjs';
import {existsSync, readFileSync} from 'node:fs';

const claveDelEnv = () => {
  if (!existsSync('.env')) return '';
  const m = /^AGENTE_LLM_KEY=(.*)$/m.exec(readFileSync('.env', 'utf8'));
  return m ? m[1].replace(/\s+#.*$/, '').trim().replace(/^"|"$/g, '') : '';
};

const settings = {baseUrl: process.env.AGENTE_URL ?? 'http://127.0.0.1:11434/v1', model: process.env.AGENTE_MODEL ?? 'qwen3-cad', apiKey: process.env.AGENTE_KEY ?? (/^https:/.test(process.env.AGENTE_URL ?? '') ? claveDelEnv() : ''), memoria: 'auto'};
const tools = toolDefinitions(SKILLS.filter((s) => s.name !== 'zapatas_desde_plano'));
let aciertos = 0;
const tiempos = [];
// Datos del proyecto que el modelo no debe inventar: si los pasa sin que el pedido los diga, falla.
const DATOS = ['hz', 'df', 'zona', 'suelo', 'categoria', 'niveles'];
const enPedido = (valor, pedido) => {
  const n = Number(String(valor).replace(',', '.'));
  if (Number.isFinite(n)) return [...pedido.matchAll(/\d+(?:[.,]\d+)?/g)].some((m) => Math.abs(Number(m[0].replace(',', '.')) - n) < 1e-9);
  return pedido.toLowerCase().split(/[^a-z0-9áéíóúñ]+/i).includes(String(valor).toLowerCase());
};
let inventos = 0;
// Modelos de razonamiento (GPT-5, o3…): sin temperature; razonamiento bajo para no gastar.
const razona = /^(gpt-5|gpt-6|o\d)/i.test(settings.model);
const tokens = {entrada: 0, cache: 0, salida: 0};
for (const caso of CASOS_EVALUACION) {
  const t0 = Date.now();
  let d = {};
  try {
    const peticion = {
      url: `${settings.baseUrl.replace(/\/+$/, '')}/chat/completions`,
      method: 'POST',
      signal: AbortSignal.timeout(Number(process.env.AGENTE_TIMEOUT_MS ?? 120000)),
      headers: {'Content-Type': 'application/json', ...(settings.apiKey ? {Authorization: `Bearer ${settings.apiKey}`} : {})},
      body: JSON.stringify({model: settings.model, messages: [{role: 'system', content: promptDelSistema(settings)}, {role: 'user', content: caso.pedido}], tools, tool_choice: 'auto', ...(razona ? {reasoning_effort: process.env.AGENTE_RAZONAMIENTO ?? 'low'} : {temperature: 0.2}), stream: false}),
    };
    const r = await fetch(peticion.url, peticion);
    d = await r.json();
    // Modelo nuevo que rechaza un parámetro: se repite sin él (como el servidor).
    const rechazado = r.status === 400 && ['temperature', 'reasoning_effort'].find((k) => `${d.error?.param ?? ''} ${d.error?.message ?? ''}`.includes(k));
    if (rechazado) {
      const cuerpo = JSON.parse(String(peticion.body));
      delete cuerpo[rechazado];
      d = await (await fetch(peticion.url, {...peticion, body: JSON.stringify(cuerpo)})).json();
    }
  } catch (e) {
    d = {error: e.name === 'TimeoutError' ? 'no respondió a tiempo' : e.message};
  }
  const ms = Date.now() - t0;
  tokens.entrada += d.usage?.prompt_tokens ?? 0;
  tokens.cache += d.usage?.prompt_tokens_details?.cached_tokens ?? 0;
  tokens.salida += d.usage?.completion_tokens ?? 0;
  tiempos.push(ms);
  const call = d.choices?.[0]?.message?.tool_calls?.[0];
  let args = {};
  try { args = typeof call?.function?.arguments === 'string' ? JSON.parse(call.function.arguments) : call?.function?.arguments ?? {}; } catch { /* argumentos inválidos */ }
  const inventados = DATOS.filter((k) => args[k] !== undefined && args[k] !== null && args[k] !== '' && !enPedido(args[k], caso.pedido));
  if (inventados.length) inventos++;
  const bien = call?.function?.name === caso.herramienta && Object.entries(caso.argumentos).every(([k, v]) => args[k] === v) && !inventados.length;
  if (bien) aciertos++;
  console.log(`${bien ? 'OK ' : inventados.length ? 'INVENTÓ' : 'MAL'} ${String(ms).padStart(6)} ms  ${caso.pedido.slice(0, 50).padEnd(50)} → ${call?.function?.name ?? (d.error ? `error: ${JSON.stringify(d.error).slice(0, 60)}` : 'sin herramienta')} ${JSON.stringify(args)}`);
}
console.log(`\n${settings.model}: ${aciertos}/${CASOS_EVALUACION.length} aciertos (${inventos} con datos inventados), ${Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length)} ms por pedido. Tokens: ${tokens.entrada} de entrada (${tokens.cache} en caché), ${tokens.salida} de salida.`);
