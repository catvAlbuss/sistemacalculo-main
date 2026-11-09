// Evalúa un modelo de lenguaje como motor del Agente Predim: corre los casos de
// casos-evaluacion.mjs y mide si elige la herramienta y los argumentos correctos.
// Sirve con cualquier API compatible con OpenAI (Ollama, OpenAI, Grok…).
//
//   node scripts/agente/evaluar-modelo.mjs                       (Ollama local, qwen3-cad)
//   AGENTE_MODEL=qwen3.5:4b-q4_K_M node scripts/agente/evaluar-modelo.mjs
//   AGENTE_URL=https://api.openai.com/v1 AGENTE_MODEL=… AGENTE_KEY=… node scripts/agente/evaluar-modelo.mjs
//
// La clave se lee de la variable de entorno; nunca se escribe en archivos.

import {SKILLS, toolDefinitions} from '../../resources/js/etabs/agente/skills/index.js';
import {promptDelSistema} from '../../resources/js/etabs/agente/agentRunner.js';
import {CASOS_EVALUACION} from './casos-evaluacion.mjs';

const settings = {baseUrl: process.env.AGENTE_URL ?? 'http://127.0.0.1:11434/v1', model: process.env.AGENTE_MODEL ?? 'qwen3-cad', apiKey: process.env.AGENTE_KEY ?? '', memoria: 'auto'};
const tools = toolDefinitions(SKILLS.filter((s) => s.name !== 'zapatas_desde_plano'));
let aciertos = 0;
const tiempos = [];
for (const caso of CASOS_EVALUACION) {
  const t0 = Date.now();
  const r = await fetch(`${settings.baseUrl.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', ...(settings.apiKey ? {Authorization: `Bearer ${settings.apiKey}`} : {})},
    body: JSON.stringify({model: settings.model, messages: [{role: 'system', content: promptDelSistema(settings)}, {role: 'user', content: caso.pedido}], tools, tool_choice: 'auto', temperature: 0.2, stream: false}),
  });
  const d = await r.json();
  const ms = Date.now() - t0;
  tiempos.push(ms);
  const call = d.choices?.[0]?.message?.tool_calls?.[0];
  let args = {};
  try { args = typeof call?.function?.arguments === 'string' ? JSON.parse(call.function.arguments) : call?.function?.arguments ?? {}; } catch { /* argumentos inválidos */ }
  const bien = call?.function?.name === caso.herramienta && Object.entries(caso.argumentos).every(([k, v]) => args[k] === v);
  if (bien) aciertos++;
  console.log(`${bien ? 'OK ' : 'MAL'} ${String(ms).padStart(6)} ms  ${caso.pedido.slice(0, 50).padEnd(50)} → ${call?.function?.name ?? (d.error ? `error: ${JSON.stringify(d.error).slice(0, 60)}` : 'sin herramienta')} ${JSON.stringify(args)}`);
}
console.log(`\n${settings.model}: ${aciertos}/${CASOS_EVALUACION.length} aciertos, ${Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length)} ms por pedido.`);
