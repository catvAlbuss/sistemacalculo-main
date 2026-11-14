<template>
  <aside class="ap-panel" aria-label="Agente NovaCad">
    <header class="ap-header">
      <div class="ap-title">
        <h2>Agente NovaCad</h2>
        <p>{{ settings.model }} · {{ isLocal ? "local, sin costo" : "servidor externo" }}</p>
      </div>
      <button type="button" class="etabs-icon-btn" :aria-pressed="showSettings" title="Configuración del modelo" @click="toggleSettings">⚙</button>
      <button type="button" class="etabs-icon-btn" :aria-pressed="showProyecto" title="Datos del proyecto (Hz, Df, sismo, niveles y rótulo)" @click="showProyecto = !showProyecto">▤</button>
      <button type="button" class="etabs-icon-btn" title="Nueva conversación" :disabled="busy" @click="reset">⟲</button>
      <button type="button" class="etabs-icon-btn" aria-label="Cerrar agente" title="Cerrar" @click="emit('close')">✕</button>
    </header>

    <form v-if="showSettings" class="ap-settings" @submit.prevent="saveSettings">
      <label class="fz-field"><span>URL del servidor (compatible con OpenAI)</span><input v-model.trim="draft.baseUrl" class="fz-input" /></label>
      <label class="fz-field"><span>Modelo</span>
        <select v-if="modelos.length" v-model="draft.model" class="fz-input">
          <option v-for="m in modelos" :key="m.nombre" :value="m.nombre">{{ m.apto === true ? "✓" : m.apto === false ? "✕" : "·" }} {{ m.nombre }}{{ m.tamano ? ` (${m.tamano})` : "" }}{{ m.nube ? " · nube" : "" }}</option>
          <option v-if="!modelos.some((m) => m.nombre === draft.model)" :value="draft.model">{{ draft.model }}</option>
        </select>
        <input v-else v-model.trim="draft.model" class="fz-input" placeholder="qwen3-cad" />
      </label>
      <small v-if="notaDraft" class="ap-note" :class="{ 'is-warn': notaDraft.apto === false }">{{ notaDraft.nota }}</small>
      <small v-else-if="modelosError" class="ap-note">{{ modelosError }}</small>
      <label class="fz-field"><span>Memoria del agente</span>
        <select v-model="draft.memoria" class="fz-input">
          <option value="auto">Automática (completa en modelos grandes o en la nube)</option>
          <option value="completa">Completa: criterios del despacho en cada pedido</option>
          <option value="corta">Corta: solo instrucciones (modelos locales de 4B)</option>
        </select>
      </label>
      <label class="fz-field"><span>Clave API (vacía para Ollama local)</span><input v-model="draft.apiKey" type="password" autocomplete="off" class="fz-input" /></label>
      <div class="ap-row">
        <button type="submit" class="fz-btn fz-btn-primary">Guardar</button>
        <button type="button" class="fz-btn fz-btn-ghost" @click="draft = {...DEFAULT_AGENT_SETTINGS}">Usar Ollama local</button>
      </div>
    </form>

    <form v-if="showProyecto" class="ap-settings ap-proyecto" @submit.prevent="saveProyecto">
      <p class="ap-note">Se guardan en este navegador y se usan en cada plano de estructuras.</p>
      <h3 class="ap-section">Datos técnicos</h3>
      <p class="ap-note">Del estudio de suelos y de la E.030. Si faltan, el agente usa el criterio del despacho y lo avisa.</p>
      <label v-for="c in CAMPOS_TECNICOS" :key="c.campo" class="fz-field"><span>{{ c.etiqueta }}</span>
        <select v-if="c.opciones" v-model="proyecto[c.campo]" class="fz-input">
          <option value="">Sin indicar</option>
          <option v-for="[valor, texto] in c.opciones" :key="valor" :value="valor">{{ texto }}</option>
        </select>
        <input v-else v-model.trim="proyecto[c.campo]" class="fz-input" inputmode="decimal" :placeholder="c.ejemplo" />
      </label>
      <h3 class="ap-section">Rótulo</h3>
      <label v-for="c in CAMPOS_PROYECTO" :key="c.campo" class="fz-field"><span>{{ c.etiqueta }}</span>
        <input v-model.trim="proyecto[c.campo]" class="fz-input" :placeholder="c.ejemplo" />
      </label>
      <div class="ap-row">
        <button type="submit" class="fz-btn fz-btn-primary">Guardar</button>
        <button type="button" class="fz-btn fz-btn-ghost" @click="proyecto = {}">Limpiar</button>
      </div>
    </form>

    <div ref="listRef" class="ap-messages">
      <div v-if="!messages.length" class="ap-empty">
        <p>Abre la planta de arquitectura y pide el plano de estructuras: se dibuja debajo, sobre los mismos ejes y columnas.</p>
        <div class="ap-chips">
          <button v-for="example in examples" :key="example" type="button" class="ap-chip" :disabled="busy" @click="send(example)">{{ example }}</button>
        </div>
      </div>
      <div v-for="(message, index) in messages" :key="index" class="ap-msg" :class="`is-${message.role}`">
        <p>{{ message.content }}</p>
        <details v-for="(step, i) in message.steps || []" :key="i" class="ap-step" :class="{ 'is-error': !step.result?.ok }">
          <summary>{{ step.result?.ok ? "✓" : "✕" }} {{ toolLabels[step.tool] || step.tool }}</summary>
          <pre>{{ formatStep(step) }}</pre>
        </details>
        <small v-if="message.usage">{{ message.seconds }} s · {{ message.usage.prompt + message.usage.completion }} tokens</small>
      </div>
      <div v-if="busy" class="ap-msg is-assistant ap-working"><span class="ap-spinner" aria-hidden="true"></span> {{ progress }}</div>
    </div>

    <form class="ap-input" @submit.prevent="send()">
      <textarea v-model="draftText" rows="2" placeholder="Ej.: Construye el primer nivel de una casa de 8 x 20 m con 3 dormitorios" :disabled="busy"
        @keydown.enter.exact.prevent="send()"></textarea>
      <button v-if="!busy" type="submit" class="fz-btn fz-btn-primary" :disabled="!draftText.trim()">Enviar</button>
      <button v-else type="button" class="fz-btn fz-btn-danger" @click="cancel">Detener</button>
    </form>
  </aside>
</template>

<script setup>
import {computed, nextTick, ref} from "vue";
import {DEFAULT_AGENT_SETTINGS, runAgent} from "../../ingenieria/agente/agentRunner.js";
import {modelosInstalados, notaModelo} from "../../ingenieria/agente/modelosAgente.js";
import {CAMPOS_PROYECTO} from "../../ingenieria/laminas/rotulo.js";
import {CAMPOS_TECNICOS} from "../../ingenieria/criterios/datosProyecto.js";

const emit = defineEmits(["close", "foundation"]);

// Acceso al documento abierto del visor, creado una sola vez al primer pedido.
let contextPromise = null;
const getContext = () => contextPromise ??= Promise.all([
  import("@mlightcad/cad-simple-viewer"), import("@mlightcad/data-model"), import("../../ingenieria/cad/drawingContext.js"),
]).then(([viewer, dm, {createDrawingContext}]) => createDrawingContext({
  getDatabase: () => viewer.AcApDocManager.instance?.curDocument?.database,
  dm,
  edit: viewer.acapRunDatabaseEdit,
  // Con caja (p. ej. una lámina nueva) se encuadra esa zona; si no, zoom inteligente,
  // que ignora objetos perdidos lejos del dibujo.
  afterDraw: (box) => {
    if (box && window.__novacadPrueba) window.__novacadPrueba.ultimaZona = box;
    const view = viewer.AcApDocManager.instance?.curView;
    if (box && view?.zoomTo) {
      view.zoomTo(new dm.AcGeBox2d({x: box.x0, y: box.y0}, {x: box.x1, y: box.y1}), 0.04 * (box.x1 - box.x0));
      return;
    }
    (view?.zoomToSmartExtents ?? view?.zoomToFitDrawing)?.call(view);
  },
  onFoundation: (payload) => emit("foundation", payload),
  // Tras quitar láminas: la selección no debe apuntar a objetos que ya no existen.
  onErase: () => viewer.AcApDocManager.instance?.curView?.selectionSet?.clear?.(),
  // Datos del rótulo que el ingeniero llenó (▤).
  getProjectData: () => ({...proyecto.value}),
  // Datos que el ingeniero dicta en el chat ("Hz 0.60, zona 3"): quedan en ▤ como si los escribiera.
  setProjectData: (datos) => {
    proyecto.value = {...proyecto.value, ...datos};
    try { localStorage.setItem(PROYECTO_KEY, JSON.stringify(proyecto.value)); } catch { /* sin almacenamiento */ }
  },
  // Plantilla de láminas de estructuras (detalles estándar del despacho). Sin caché del
  // navegador: al regenerar la plantilla, el agente usa la nueva sin borrar la caché a mano.
  loadTemplate: async () => {
    const [buffer, config] = await Promise.all([
      fetch("/assets/plantillas/estructuras-laminas.dxf", {cache: "no-cache"}).then((r) => { if (!r.ok) throw new Error(`plantilla ${r.status}`); return r.arrayBuffer(); }),
      fetch("/assets/plantillas/estructuras-laminas.json", {cache: "no-cache"}).then((r) => r.json()),
    ]);
    const db = new dm.AcDbDatabase();
    await db.read(buffer, {readOnly: true}, dm.AcDbFileType.DXF);
    return {db, config};
  },
}));

// Prueba visual en el visor real (scripts/agente/ver-en-visor.mjs): las herramientas del
// agente se corren por el mismo camino que el chat (mismo contexto y plantilla), sin modelo.
if (window.__NOVACAD_PRUEBA__) {
  window.__novacadPrueba = window.__novacadPrueba ?? {};
  window.__novacadPrueba.herramienta = async (nombre, args = {}) => {
    const [{SKILLS}, ctx] = await Promise.all([import("../../ingenieria/agente/skills/index.js"), getContext()]);
    const skill = SKILLS.find((s) => s.name === nombre);
    if (!skill) throw new Error(`No existe la herramienta ${nombre}`);
    return JSON.parse(JSON.stringify(await skill.run(args, ctx)));
  };
}

const STORAGE_KEY = "predim-agente.settings";
const loadSettings = () => {
  try { return {...DEFAULT_AGENT_SETTINGS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")}; }
  catch { return {...DEFAULT_AGENT_SETTINGS}; }
};

const examples = [
  "Genera el plano de estructuras de esta arquitectura",
  "¿Qué vistas tiene el plano abierto?",
  "Lee los ejes y columnas del primer nivel",
  "Genera el plano de estructuras con platea",
  "Hz 0.60, Df 2.50, zona 2, suelo S3, es un colegio",
];
const toolLabels = {
  casa_primer_nivel: "Casa primer nivel", dibujar_ejes: "Ejes", dibujar_ambiente: "Ambiente",
  resumen_plano: "Resumen del plano", buscar_textos: "Buscar textos", vistas_plano: "Vistas del plano", plano_estructuras: "Plano de estructuras",
  leer_estructura: "Columnas y ejes del plano", zapatas_desde_plano: "Zapatas desde el plano", datos_proyecto: "Datos del proyecto", quitar_laminas: "Quitar láminas", revisar_laminas: "Revisar láminas",
};

// Datos del proyecto para el rótulo de las láminas.
const PROYECTO_KEY = "predim-agente.proyecto";
const proyecto = ref((() => { try { return JSON.parse(localStorage.getItem(PROYECTO_KEY) || "{}"); } catch { return {}; } })());
const showProyecto = ref(false);
function saveProyecto() {
  try { localStorage.setItem(PROYECTO_KEY, JSON.stringify(proyecto.value)); } catch { /* sin almacenamiento: vale para esta sesión */ }
  showProyecto.value = false;
}

const settings = ref(loadSettings());
const draft = ref({...settings.value});
const showSettings = ref(false);
const messages = ref([]);
const draftText = ref("");
const busy = ref(false);
const progress = ref("");
const listRef = ref(null);
let controller = null;

// Modelos instalados en Ollama, con la nota de la evaluación del agente.
const modelos = ref([]);
const modelosError = ref("");
const notaDraft = computed(() => modelos.value.find((m) => m.nombre === draft.value.model) ?? notaModelo(draft.value.model));
async function toggleSettings() {
  showSettings.value = !showSettings.value;
  if (!showSettings.value) return;
  modelosError.value = "";
  try { modelos.value = await modelosInstalados(draft.value.baseUrl); }
  catch { modelos.value = []; modelosError.value = "No pude listar los modelos de Ollama: escribe el nombre a mano."; }
}

const isLocal = computed(() => /\/\/(127\.0\.0\.1|localhost)[:/]/.test(settings.value.baseUrl));

const scrollDown = () => nextTick(() => { if (listRef.value) listRef.value.scrollTop = listRef.value.scrollHeight; });

function saveSettings() {
  settings.value = {...DEFAULT_AGENT_SETTINGS, ...draft.value};
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value)); } catch { /* sin almacenamiento: vale para esta sesión */ }
  showSettings.value = false;
}

function formatStep({args, result}) {
  return `${JSON.stringify(args)}\n→ ${JSON.stringify(result, null, 1)}`.slice(0, 1500);
}

function reset() {
  messages.value = [];
}

function cancel() {
  controller?.abort();
}

async function send(text = draftText.value) {
  const value = text.trim();
  if (!value || busy.value) return;
  draftText.value = "";
  // Solo el texto de turnos previos viaja al modelo; los pasos se quedan aquí.
  const history = messages.value.map(({role, content}) => ({role, content}));
  messages.value.push({role: "user", content: value});
  busy.value = true;
  progress.value = "Pensando…";
  scrollDown();
  controller = new AbortController();
  const started = performance.now();
  try {
    const out = await runAgent({
      text: value, history, settings: settings.value, context: await getContext(), signal: controller.signal,
      onStep: (step) => { progress.value = `${toolLabels[step.tool] || step.tool} listo, redactando…`; },
    });
    messages.value.push({role: "assistant", content: out.reply, steps: out.steps, usage: out.usage, seconds: ((performance.now() - started) / 1000).toFixed(1)});
  } catch (error) {
    const aborted = error?.name === "AbortError";
    const network = /fetch|network/i.test(error?.message ?? "");
    messages.value.push({role: "assistant", content: aborted ? "Pedido detenido."
      : network ? `No se pudo conectar con ${settings.value.baseUrl}. ¿Está Ollama abierto?` : error?.message ?? String(error)});
  } finally {
    busy.value = false;
    controller = null;
    scrollDown();
  }
}
</script>

<style scoped>
.ap-panel { position:absolute;top:60px;right:64px;bottom:56px;display:flex;flex-direction:column;width:min(380px,calc(100% - 24px));min-height:0;overflow:hidden;border:1px solid var(--pr-line);border-radius:12px;background:var(--pr-panel);box-shadow:0 18px 44px rgba(0,0,0,.45); }
.ap-header { display:flex;align-items:center;gap:4px;padding:10px 10px 10px 14px;border-bottom:1px solid var(--pr-line); }
.ap-title { flex:1;min-width:0; }
.ap-title h2 { margin:0;font-size:15px;font-weight:700; }
.ap-title p { margin:2px 0 0;font-size:11.5px;color:var(--pr-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
.etabs-icon-btn[aria-pressed=true] { border-color:var(--pr-blue);color:var(--pr-blue); }
.ap-proyecto { max-height:55vh;overflow:auto; }
.ap-section { margin:6px 0 0;font-size:12.5px;font-weight:700; }
.ap-note { font-size:12px;color:var(--pr-muted, #64748b);margin-top:-4px; }
.ap-note.is-warn { color:var(--fz-warn); }
.ap-settings { display:grid;gap:8px;padding:12px 14px;border-bottom:1px solid var(--pr-line);background:var(--pr-soft); }
.ap-row { display:flex;gap:6px; }
.ap-messages { flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;display:flex;flex-direction:column;gap:10px;padding:14px; }
.ap-empty p { margin:0 0 10px;font-size:12.5px;color:var(--pr-muted); }
.ap-chips { display:grid;gap:6px; }
.ap-chip { padding:8px 10px;border:1px solid var(--pr-line);border-radius:8px;background:var(--pr-soft);color:var(--pr-text);font-size:12.5px;line-height:1.35;font-family:inherit;text-align:left;cursor:pointer; }
.ap-chip:hover:not(:disabled) { border-color:var(--pr-blue); }
.ap-msg { max-width:92%;padding:9px 11px;border-radius:10px;font-size:13px; }
.ap-msg p { margin:0;white-space:pre-wrap; }
.ap-msg small { display:block;margin-top:6px;font-size:11px;color:var(--pr-muted); }
.ap-msg.is-user { align-self:flex-end;background:var(--fz-accent);color:#fff; }
.ap-msg.is-assistant { align-self:flex-start;border:1px solid var(--pr-line);background:var(--pr-soft); }
.ap-step { margin-top:7px;font-size:12px; }
.ap-step summary { cursor:pointer;color:var(--fz-ok); }
.ap-step.is-error summary { color:var(--fz-danger); }
.ap-step pre { margin:6px 0 0;max-height:180px;overflow:auto;padding:8px;border-radius:6px;background:var(--fz-input);font:11px/1.4 ui-monospace,Consolas,monospace;white-space:pre-wrap;word-break:break-word; }
.ap-working { display:flex;align-items:center;gap:8px;color:var(--pr-muted); }
.ap-spinner { width:14px;height:14px;border:2px solid var(--pr-line);border-top-color:var(--pr-blue);border-radius:50%;animation:ap-spin .8s linear infinite; }
@keyframes ap-spin { to { transform:rotate(360deg); } }
.ap-input { display:flex;gap:8px;align-items:flex-end;padding:10px 12px;border-top:1px solid var(--pr-line);background:var(--pr-soft); }
.ap-input textarea { flex:1;min-height:44px;max-height:120px;resize:vertical;padding:8px 10px;border:1px solid var(--pr-line);border-radius:8px;background:var(--fz-input);color:var(--pr-text);font-size:13px;line-height:1.4;font-family:inherit; }
@media(max-width:760px) {
  .ap-panel { top:auto;left:8px;right:8px;bottom:8px;width:auto;height:calc(100% - 60px); }
}
</style>
