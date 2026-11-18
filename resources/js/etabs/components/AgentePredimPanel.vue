<template>
  <aside class="ag" :class="{ 'is-busy': busy }" aria-label="Agente NovaCad">
    <header class="ag-head">
      <span class="ag-orb" aria-hidden="true"><i></i></span>
      <div class="ag-who">
        <h2>Agente NovaCad</h2>
        <p :class="`is-${estadoTono}`"><span class="ag-dot"></span>{{ estadoTexto }}</p>
      </div>
      <button type="button" class="ag-icon" title="Datos del proyecto" @click="abrirDatos('editar')"><svg viewBox="0 0 24 24"><path :d="ICON.datos" /></svg></button>
      <button type="button" class="ag-icon" title="Nueva sesión" :disabled="busy" @click="reset"><svg viewBox="0 0 24 24"><path :d="ICON.nueva" /></svg></button>
      <button type="button" class="ag-icon" aria-label="Cerrar agente" title="Cerrar" @click="emit('close')"><svg viewBox="0 0 24 24"><path :d="ICON.cerrar" /></svg></button>
    </header>

    <div ref="listRef" class="ag-feed">
      <section v-if="!runs.length" class="ag-start">
        <h3>¿Qué hacemos con este plano?</h3>
        <p>Abre la planta de arquitectura. El agente la lee, decide la estructura con el criterio del despacho y te deja lo dudoso para revisar.</p>
        <div class="ag-caps">
          <button v-for="c in CAPACIDADES" :key="c.titulo" type="button" class="ag-cap" :disabled="busy || !motorListo" @click="send(c.pedido)">
            <span class="ag-cap-ic"><svg viewBox="0 0 24 24"><path :d="ICON[c.icono]" /></svg></span>
            <strong>{{ c.titulo }}</strong>
            <small>{{ c.detalle }}</small>
          </button>
        </div>
        <p class="ag-hint"><svg viewBox="0 0 24 24"><path :d="ICON.foto" /></svg> Adjunta fotos de observaciones (lámina marcada, detalle de obra): el agente las considera y quedan guardadas para su entrenamiento.</p>
      </section>

      <article v-for="(run, i) in runs" :key="i" class="ag-run">
        <div class="ag-ask">
          <p>{{ run.pedido }}</p>
          <div v-if="run.fotos.length" class="ag-thumbs"><img v-for="(f, j) in run.fotos" :key="j" :src="f" alt="Foto adjunta" /></div>
        </div>
        <div class="ag-work">
          <ol v-if="run.pasos.length" class="ag-steps">
            <li v-for="(p, j) in run.pasos" :key="j" :class="`is-${p.estado}`">
              <span class="ag-step-ic"><svg viewBox="0 0 24 24"><path :d="ICON[p.icono] || ICON.chispa" /></svg></span>
              <span class="ag-step-txt">{{ p.titulo }}</span>
              <span class="ag-step-t">{{ p.estado === "ok" ? "✓" : p.estado === "error" ? "✕" : "" }} {{ p.seg }}</span>
            </li>
          </ol>
          <div v-if="run.vivo" class="ag-thinking"><span class="ag-shimmer">{{ run.vivo }}</span></div>
          <p v-if="run.respuesta" class="ag-answer">{{ run.respuesta }}</p>
          <ul v-if="run.avisos.length" class="ag-notes">
            <li v-for="(a, j) in run.avisos" :key="j"><svg viewBox="0 0 24 24"><path :d="ICON.aviso" /></svg>{{ a }}</li>
          </ul>
          <div v-if="run.siguientes.length && !busy" class="ag-next">
            <button v-for="s in run.siguientes" :key="s" type="button" @click="send(s)">{{ s }} →</button>
          </div>
          <small v-if="run.meta" class="ag-meta">{{ run.meta }}</small>
        </div>
      </article>
    </div>

    <form class="ag-compose" @submit.prevent="send()">
      <div v-if="adjuntos.length" class="ag-attach">
        <span v-for="(a, j) in adjuntos" :key="j" class="ag-chip-img"><img :src="a.url" alt="" /><button type="button" aria-label="Quitar foto" @click="adjuntos.splice(j, 1)">✕</button></span>
      </div>
      <div class="ag-box">
        <button type="button" class="ag-icon" title="Adjuntar fotos de observaciones" :disabled="busy || adjuntos.length >= 6" @click="fileRef.click()"><svg viewBox="0 0 24 24"><path :d="ICON.clip" /></svg></button>
        <input ref="fileRef" type="file" accept="image/jpeg,image/png,image/webp" multiple hidden @change="adjuntar" />
        <textarea v-model="draftText" rows="1" :placeholder="motorListo ? 'Pide algo o describe una observación…' : 'El agente no tiene motor de IA configurado'" :disabled="busy || !motorListo"
          @input="autoAlto" @keydown.enter.exact.prevent="send()"></textarea>
        <button v-if="!busy" type="submit" class="ag-send" :disabled="!motorListo || (!draftText.trim() && !adjuntos.length)" aria-label="Enviar"><svg viewBox="0 0 24 24"><path :d="ICON.enviar" /></svg></button>
        <button v-else type="button" class="ag-send is-stop" aria-label="Detener" @click="cancel"><svg viewBox="0 0 24 24"><path :d="ICON.detener" /></svg></button>
      </div>
    </form>

    <Teleport to="body">
      <div v-if="modal.abierto" class="ag-modal-bg" @click.self="cerrarDatos(null)">
        <form class="ag-modal" role="dialog" aria-modal="true" aria-labelledby="ag-modal-t" @submit.prevent="cerrarDatos(modal.borrador)">
          <header>
            <span class="ag-orb is-small" aria-hidden="true"><i></i></span>
            <div>
              <h3 id="ag-modal-t">{{ modal.modo === "pedido" ? "Antes de dibujar: datos del proyecto" : "Datos del proyecto" }}</h3>
              <p>{{ modal.modo === "pedido" ? "Completa lo que tengas. Lo que falte, el agente lo toma de proyectos parecidos y lo indica en las láminas." : "Se usan en las láminas de estructuras y en el rótulo." }}</p>
            </div>
          </header>
          <div class="ag-modal-body">
            <h4>Estudio de suelos y sismo (E.030)</h4>
            <div class="ag-grid">
              <label v-for="c in CAMPOS_TECNICOS" :key="c.campo" :class="{ 'is-missing': modal.faltan.includes(c.campo) }"><span>{{ c.etiqueta }}</span>
                <select v-if="c.opciones" v-model="modal.borrador[c.campo]">
                  <option value="">Sin indicar</option>
                  <option v-for="[valor, texto] in c.opciones" :key="valor" :value="valor">{{ texto }}</option>
                </select>
                <input v-else v-model.trim="modal.borrador[c.campo]" inputmode="decimal" :placeholder="sugerido(c.campo) ? `Sugerido: ${sugerido(c.campo)}` : `Ej. ${c.ejemplo}`" />
                <small v-if="sugerido(c.campo)">Proyectos parecidos: {{ sugerido(c.campo) }}</small>
              </label>
            </div>
            <h4>Rótulo de las láminas</h4>
            <div class="ag-grid">
              <label v-for="c in CAMPOS_PROYECTO" :key="c.campo" :class="{ 'is-missing': modal.faltan.includes(c.campo), 'is-wide': c.campo === 'proyecto' || c.campo === 'entidad' }"><span>{{ c.etiqueta }}</span>
                <input v-model.trim="modal.borrador[c.campo]" :placeholder="c.ejemplo" />
              </label>
            </div>
          </div>
          <footer>
            <button type="button" class="ag-btn is-ghost" @click="cerrarDatos(null)">{{ modal.modo === "pedido" ? "Continuar sin completar" : "Cancelar" }}</button>
            <button type="submit" class="ag-btn">{{ modal.modo === "pedido" ? "Guardar y generar" : "Guardar" }}</button>
          </footer>
        </form>
      </div>
    </Teleport>
  </aside>
</template>

<script setup>
import {computed, nextTick, onMounted, reactive, ref} from "vue";
import {AGENTE_SERVIDOR, runAgent} from "../../ingenieria/agente/agentRunner.js";
import {CAMPOS_PROYECTO} from "../../ingenieria/laminas/rotulo.js";
import {CAMPOS_TECNICOS} from "../../ingenieria/criterios/datosProyecto.js";

const emit = defineEmits(["close", "foundation"]);

// Íconos de trazo (24x24), en el mismo lenguaje que NovaCadIcon.
const ICON = {
  analizar: "M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15zm5.3-2.2L21 21",
  estructura: "M3 21h18M5 21V9m14 12V9M3 9h18M8 9V5h8v4M9 21v-6h6v6",
  metrado: "M4 3h16v18H4zM4 8h16M4 13h16M4 18h16M10 3v18",
  revisar: "M9 12l2 2 4-4M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6z",
  datos: "M5 4h14v16H5zM8 8h8M8 12h8M8 16h5",
  nueva: "M4 12a8 8 0 1 1 2.3 5.7M4 20v-4h4",
  cerrar: "M6 6l12 12M18 6L6 18",
  foto: "M4 7h3l2-3h6l2 3h3v13H4zm8 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  clip: "M20 11l-8 8a5 5 0 0 1-7-7l8-8a3.5 3.5 0 0 1 5 5l-8 8a2 2 0 0 1-3-3l7-7",
  enviar: "M4 12l16-8-6 16-2.5-6.5z",
  detener: "M7 7h10v10H7z",
  aviso: "M12 3l10 18H2zm0 7v5m0 3v.5",
  chispa: "m12 2 2 7 7 3-7 2-2 8-2-8-7-2 7-3z",
  corregir: "M4 20h4L19 9l-4-4L4 16zm9-13 4 4",
  borrar: "M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3",
  capas: "m12 2 10 5-10 5L2 7zm-10 10 10 5 10-5",
};

const CAPACIDADES = [
  {titulo: "Analizar", icono: "analizar", detalle: "Lee niveles, ejes y columnas y propone la estructura", pedido: "Analiza este plano y dime qué estructura propones"},
  {titulo: "Estructurar", icono: "estructura", detalle: "Genera las láminas E-01, E-02… sobre la arquitectura", pedido: "Genera el plano de estructuras de esta arquitectura"},
  {titulo: "Metrar", icono: "metrado", detalle: "Partidas del despacho y planilla Excel", pedido: "Saca el metrado de estructuras en Excel"},
  {titulo: "Revisar", icono: "revisar", detalle: "Encimados, datos faltantes y rótulo", pedido: "Revisa las láminas que hiciste"},
];

// Herramienta → paso visible (título e ícono) y siguientes pasos sugeridos.
const PASOS = {
  proponer_estructura: {titulo: "Analicé la estructura", icono: "analizar", siguientes: ["Genera el plano de estructuras de esta arquitectura"]},
  plano_estructuras: {titulo: "Generé las láminas de estructuras", icono: "estructura", siguientes: ["Saca el metrado de estructuras en Excel", "Revisa las láminas que hiciste"]},
  metrar_estructura: {titulo: "Saqué el metrado", icono: "metrado", siguientes: ["Revisa las láminas que hiciste"]},
  revisar_laminas: {titulo: "Revisé las láminas", icono: "revisar", siguientes: []},
  corregir_estructura: {titulo: "Anoté la corrección", icono: "corregir", siguientes: ["Genera el plano de estructuras de esta arquitectura"]},
  datos_proyecto: {titulo: "Guardé los datos del proyecto", icono: "datos", siguientes: ["Genera el plano de estructuras de esta arquitectura"]},
  leer_estructura: {titulo: "Leí ejes y columnas", icono: "analizar", siguientes: ["Analiza este plano y dime qué estructura propones"]},
  vistas_plano: {titulo: "Revisé las vistas del plano", icono: "capas", siguientes: []},
  quitar_laminas: {titulo: "Quité las láminas", icono: "borrar", siguientes: []},
};

// ---- Motor (solo su estado: proveedor, clave y modelo viven en el .env del servidor) ----
const settings = ref({...AGENTE_SERVIDOR});
const motor = ref({cargando: true, listo: false, mensaje: ""});
const motorListo = computed(() => motor.value.listo);
onMounted(async () => {
  try {
    const r = await fetch("/software/etabs/agente/llm/estado", {headers: {Accept: "application/json"}, credentials: "same-origin"});
    const e = r.ok ? await r.json() : {listo: false, mensaje: "No pude consultar el motor del agente."};
    motor.value = {cargando: false, listo: Boolean(e.listo), mensaje: e.mensaje ?? ""};
    settings.value = {...AGENTE_SERVIDOR, memoria: e.memoria ?? "completa", vision: Boolean(e.vision), sinRazonar: e.memoria === "corta"};
  } catch {
    motor.value = {cargando: false, listo: false, mensaje: "No pude consultar el motor del agente."};
  }
});

// ---- Datos del proyecto (formulario) ----
const PROYECTO_KEY = "predim-agente.proyecto";
const proyecto = ref((() => { try { return JSON.parse(localStorage.getItem(PROYECTO_KEY) || "{}"); } catch { return {}; } })());
const guardarProyecto = (datos) => {
  proyecto.value = {...proyecto.value, ...datos};
  try { localStorage.setItem(PROYECTO_KEY, JSON.stringify(proyecto.value)); } catch { /* sin almacenamiento: vale para esta sesión */ }
};
const modal = reactive({abierto: false, modo: "editar", faltan: [], sugeridos: {}, borrador: {}, resolver: null});
const sugerido = (campo) => {
  const v = modal.sugeridos?.[campo];
  return typeof v === "number" ? v.toFixed(2) : null;
};
function abrirDatos(modo = "editar", {faltan = [], sugeridos = {}} = {}) {
  // Las listas parten en "Sin indicar" ("") para que se vea su estado.
  const vacios = Object.fromEntries([...CAMPOS_TECNICOS, ...CAMPOS_PROYECTO].map((c) => [c.campo, ""]));
  Object.assign(modal, {abierto: true, modo, faltan, sugeridos, borrador: {...vacios, ...proyecto.value}});
  return new Promise((resolve) => { modal.resolver = resolve; });
}
function cerrarDatos(datos) {
  if (datos) guardarProyecto(datos);
  modal.abierto = false;
  modal.resolver?.(datos ? {...datos} : null);
  modal.resolver = null;
}

// ---- Contexto del documento abierto (creado una vez) ----
let contextPromise = null;
const getContext = () => contextPromise ??= Promise.all([
  import("@mlightcad/cad-simple-viewer"), import("@mlightcad/data-model"), import("../../ingenieria/cad/drawingContext.js"),
]).then(([viewer, dm, {createDrawingContext}]) => {
  const ctx = createDrawingContext({
    getDatabase: () => viewer.AcApDocManager.instance?.curDocument?.database,
    dm,
    edit: viewer.acapRunDatabaseEdit,
    // Con caja (una lámina nueva) se encuadra esa zona; si no, zoom inteligente.
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
    onErase: () => viewer.AcApDocManager.instance?.curView?.selectionSet?.clear?.(),
    getProjectData: () => ({...proyecto.value}),
    setProjectData: guardarProyecto,
    // Plantilla de láminas del despacho, sin caché del navegador.
    loadTemplate: async () => {
      const [buffer, config] = await Promise.all([
        fetch("/assets/plantillas/estructuras-laminas.dxf", {cache: "no-cache"}).then((r) => { if (!r.ok) throw new Error(`plantilla ${r.status}`); return r.arrayBuffer(); }),
        fetch("/assets/plantillas/estructuras-laminas.json", {cache: "no-cache"}).then((r) => r.json()),
      ]);
      const db = new dm.AcDbDatabase();
      await db.read(buffer, {readOnly: true}, dm.AcDbFileType.DXF);
      return {db, config};
    },
  });
  // El agente pide los datos que faltan con el formulario, antes de dibujar el plano.
  ctx.pedirDatos = ({faltan, sugeridos}) => abrirDatos("pedido", {faltan, sugeridos});
  return ctx;
});

// Prueba en el visor real (scripts/agente/ver-en-visor.mjs): herramientas sin modelo.
if (window.__NOVACAD_PRUEBA__) {
  window.__novacadPrueba = window.__novacadPrueba ?? {};
  window.__novacadPrueba.herramienta = async (nombre, args = {}) => {
    const [{SKILLS}, ctx] = await Promise.all([import("../../ingenieria/agente/skills/index.js"), getContext()]);
    const skill = SKILLS.find((s) => s.name === nombre);
    if (!skill) throw new Error(`No existe la herramienta ${nombre}`);
    ctx.pedirDatos = null; // la prueba no abre formularios
    return JSON.parse(JSON.stringify(await skill.run(args, ctx)));
  };
}

// ---- Fotos de observaciones: comprimidas en el navegador antes de enviarlas ----
const fileRef = ref(null);
const adjuntos = ref([]);
async function comprimir(archivo, lado = 1600, calidad = 0.82) {
  const url = URL.createObjectURL(archivo);
  try {
    const img = await new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = mal; i.src = url; });
    const k = Math.min(1, lado / Math.max(img.width, img.height));
    const c = Object.assign(document.createElement("canvas"), {width: Math.round(img.width * k), height: Math.round(img.height * k)});
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    const blob = await new Promise((ok) => c.toBlob(ok, "image/jpeg", calidad));
    return {url: c.toDataURL("image/jpeg", calidad), blob};
  } finally {
    URL.revokeObjectURL(url);
  }
}
async function adjuntar(event) {
  for (const f of [...event.target.files].slice(0, 6 - adjuntos.value.length)) {
    try { adjuntos.value.push(await comprimir(f)); } catch { /* no es una imagen legible */ }
  }
  event.target.value = "";
}
async function guardarObservacion(texto, fotos, ctx) {
  const form = new FormData();
  form.append("texto", texto);
  fotos.forEach((f, i) => form.append("fotos[]", f.blob, `foto-${i + 1}.jpg`));
  const rasgos = ctx?.memoria?.propuesta?.rasgos;
  if (rasgos) form.append("rasgos", JSON.stringify(rasgos));
  const token = document.querySelector('meta[name="csrf-token"]')?.content ?? "";
  try {
    const r = await fetch("/software/etabs/agente/observaciones", {method: "POST", body: form, credentials: "same-origin", headers: {Accept: "application/json", "X-CSRF-TOKEN": token, "X-Requested-With": "XMLHttpRequest"}});
    return r.ok;
  } catch { return false; }
}

// ---- Ejecuciones ----
const runs = ref([]);
const draftText = ref("");
const busy = ref(false);
const listRef = ref(null);
let controller = null;

const estadoTono = computed(() => (busy.value ? "busy" : motor.value.cargando ? "idle" : motor.value.listo ? "ok" : "off"));
const estadoTexto = computed(() => (busy.value ? "Trabajando en tu plano…" : motor.value.cargando ? "Conectando…" : motor.value.listo ? "Listo · IA del despacho" : (motor.value.mensaje || "Sin motor de IA")));

const scrollDown = () => nextTick(() => { if (listRef.value) listRef.value.scrollTop = listRef.value.scrollHeight; });
const autoAlto = (e) => { e.target.style.height = "auto"; e.target.style.height = `${Math.min(140, e.target.scrollHeight)}px`; };
const reset = () => { runs.value = []; };
const cancel = () => controller?.abort();

async function send(text = draftText.value) {
  const value = text.trim() || (adjuntos.value.length ? "Revisa estas observaciones" : "");
  if (!value || busy.value || !motorListo.value) return;
  const fotos = adjuntos.value.splice(0);
  draftText.value = "";
  // Solo el texto de turnos previos viaja al modelo.
  const history = runs.value.flatMap((r) => [{role: "user", content: r.pedido}, ...(r.respuesta ? [{role: "assistant", content: r.respuesta}] : [])]);
  const run = reactive({pedido: value, fotos: fotos.map((f) => f.url), pasos: [], vivo: "Entendiendo el pedido…", respuesta: "", avisos: [], siguientes: [], meta: ""});
  runs.value.push(run);
  busy.value = true;
  scrollDown();
  controller = new AbortController();
  const inicio = performance.now();
  let marca = inicio;
  try {
    const ctx = await getContext();
    const guardada = fotos.length ? guardarObservacion(value, fotos, ctx) : Promise.resolve(false);
    const out = await runAgent({
      text: value, imagenes: fotos.map((f) => f.url), history, settings: settings.value, context: ctx, signal: controller.signal,
      onStep: (step) => {
        const ahora = performance.now();
        const def = PASOS[step.tool] ?? {titulo: step.tool, icono: "chispa"};
        run.pasos.push({titulo: def.titulo, icono: def.icono, estado: step.result?.ok === false ? "error" : "ok", seg: `${((ahora - marca) / 1000).toFixed(1)} s`});
        marca = ahora;
        run.vivo = "Preparando la respuesta…";
        scrollDown();
      },
    });
    run.respuesta = out.reply;
    run.avisos = [...new Set(out.steps.flatMap((s) => s.result?.avisos ?? []))].slice(0, 6);
    const ultimo = [...out.steps].reverse().find((s) => s.result?.ok !== false);
    run.siguientes = (PASOS[ultimo?.tool]?.siguientes ?? []).filter((s) => s !== value).slice(0, 2);
    if (fotos.length) run.avisos.unshift((await guardada) ? `Guardé ${fotos.length} foto(s) como observación para entrenar al agente.` : "No pude guardar las fotos como observación; inténtalo de nuevo.");
    run.meta = `${((performance.now() - inicio) / 1000).toFixed(1)} s`;
  } catch (error) {
    run.respuesta = error?.name === "AbortError" ? "Pedido detenido." : error?.message ?? String(error);
  } finally {
    run.vivo = "";
    busy.value = false;
    controller = null;
    scrollDown();
  }
}
</script>

<style scoped>
.ag, .ag-modal-bg { --ag-a:#5b8cff;--ag-b:#a46bff;--ag-glow:rgba(91,140,255,.35); }
.ag { 
  position:absolute;top:60px;right:64px;bottom:56px;display:flex;flex-direction:column;width:min(420px,calc(100% - 24px));min-height:0;overflow:hidden;
  border:1px solid var(--pr-line);border-radius:16px;background:var(--pr-panel);color:var(--pr-text);
  box-shadow:0 24px 60px rgba(0,0,0,.45),0 0 0 1px rgba(255,255,255,.02) inset; }
.ag::before { content:"";position:absolute;inset:0 0 auto 0;height:2px;background:linear-gradient(90deg,var(--ag-a),var(--ag-b));opacity:.85; }
.ag svg { width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round; }

.ag-head { display:flex;align-items:center;gap:6px;padding:14px 12px 12px 14px;border-bottom:1px solid var(--pr-line); }
.ag-who { flex:1;min-width:0; }
.ag-who h2 { margin:0;font-size:15px;font-weight:700;letter-spacing:.1px; }
.ag-who p { display:flex;align-items:center;gap:6px;margin:2px 0 0;font-size:11.5px;color:var(--pr-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.ag-dot { width:7px;height:7px;border-radius:50%;background:var(--pr-muted);flex:none; }
.is-ok .ag-dot { background:#22c55e;box-shadow:0 0 0 3px rgba(34,197,94,.18); }
.is-busy .ag-dot { background:var(--ag-a);animation:ag-pulse 1.2s ease-in-out infinite; }
.is-off .ag-dot { background:#f59e0b; }
.ag-orb { position:relative;width:34px;height:34px;flex:none;border-radius:11px;background:conic-gradient(from 210deg,var(--ag-a),var(--ag-b),#38bdf8,var(--ag-a));box-shadow:0 6px 18px var(--ag-glow); }
.ag-orb i { position:absolute;inset:7px;border-radius:7px;background:var(--pr-panel);mask:radial-gradient(circle,transparent 3px,#000 3.5px); }
.ag-orb i::after { content:"";position:absolute;inset:3px;border-radius:50%;background:linear-gradient(135deg,var(--ag-a),var(--ag-b)); }
.ag-orb.is-small { width:30px;height:30px;border-radius:10px; }
.is-busy .ag-orb { animation:ag-spin 2.4s linear infinite; }
.ag-icon { display:inline-grid;place-items:center;width:32px;height:32px;border:1px solid transparent;border-radius:9px;background:transparent;color:var(--pr-muted);cursor:pointer; }
.ag-icon:hover:not(:disabled) { border-color:var(--pr-line);background:var(--pr-soft);color:var(--pr-text); }
.ag-icon:disabled { opacity:.45;cursor:default; }

.ag-feed { flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;display:flex;flex-direction:column;gap:14px;padding:16px 14px; }
.ag-start h3 { margin:2px 0 4px;font-size:16px;font-weight:700; }
.ag-start > p { margin:0 0 14px;font-size:12.5px;line-height:1.5;color:var(--pr-muted); }
.ag-caps { display:grid;grid-template-columns:1fr 1fr;gap:8px; }
.ag-cap { display:grid;gap:4px;justify-items:start;padding:12px;border:1px solid var(--pr-line);border-radius:12px;background:var(--pr-soft);color:var(--pr-text);text-align:left;font-family:inherit;cursor:pointer;transition:border-color .15s,transform .15s,box-shadow .15s; }
.ag-cap:hover:not(:disabled) { border-color:var(--ag-a);transform:translateY(-1px);box-shadow:0 8px 20px rgba(0,0,0,.18); }
.ag-cap:disabled { opacity:.55;cursor:default; }
.ag-cap-ic { display:inline-grid;place-items:center;width:30px;height:30px;border-radius:9px;background:linear-gradient(135deg,rgba(91,140,255,.18),rgba(164,107,255,.18));color:var(--ag-a);margin-bottom:2px; }
.ag-cap strong { font-size:13px; }
.ag-cap small { font-size:11.5px;line-height:1.35;color:var(--pr-muted); }
.ag-hint { display:flex;gap:8px;align-items:flex-start;margin:12px 0 0;padding:10px;border:1px dashed var(--pr-line);border-radius:10px;font-size:11.5px;line-height:1.45;color:var(--pr-muted); }
.ag-hint svg { flex:none;width:16px;height:16px;margin-top:1px; }

.ag-run { display:grid;gap:8px; }
.ag-ask { justify-self:end;max-width:88%;padding:8px 12px;border-radius:12px 12px 4px 12px;background:linear-gradient(135deg,var(--ag-a),var(--ag-b));color:#fff;font-size:13px; }
.ag-ask p { margin:0;white-space:pre-wrap; }
.ag-thumbs { display:flex;gap:4px;margin-top:6px; }
.ag-thumbs img { width:46px;height:46px;object-fit:cover;border-radius:6px;border:1px solid rgba(255,255,255,.4); }
.ag-work { padding:12px;border:1px solid var(--pr-line);border-radius:12px;background:var(--pr-soft); }
.ag-steps { list-style:none;margin:0 0 8px;padding:0;display:grid;gap:2px; }
.ag-steps li { position:relative;display:grid;grid-template-columns:24px 1fr auto;align-items:center;gap:8px;padding:5px 0;font-size:12.5px; }
.ag-steps li + li::before { content:"";position:absolute;left:11px;top:-6px;height:10px;border-left:1px dashed var(--pr-line); }
.ag-step-ic { display:inline-grid;place-items:center;width:24px;height:24px;border-radius:7px;background:var(--pr-panel);border:1px solid var(--pr-line);color:var(--ag-a); }
.ag-step-ic svg { width:14px;height:14px; }
.is-error .ag-step-ic { color:#ef4444; }
.ag-step-t { font-size:11px;color:var(--pr-muted);font-variant-numeric:tabular-nums; }
.is-ok .ag-step-t { color:#22c55e; }
.is-error .ag-step-t { color:#ef4444; }
.ag-thinking { padding:4px 0 2px;font-size:12.5px; }
.ag-shimmer { background:linear-gradient(90deg,var(--pr-muted) 0%,var(--pr-text) 50%,var(--pr-muted) 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:ag-shine 1.6s linear infinite; }
.ag-answer { margin:0;font-size:13px;line-height:1.55;white-space:pre-wrap; }
.ag-notes { list-style:none;margin:10px 0 0;padding:0;display:grid;gap:6px; }
.ag-notes li { display:flex;gap:7px;align-items:flex-start;padding:7px 9px;border-radius:9px;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.28);font-size:11.8px;line-height:1.4; }
.ag-notes svg { flex:none;width:15px;height:15px;color:#f59e0b;margin-top:1px; }
.ag-next { display:flex;flex-wrap:wrap;gap:6px;margin-top:10px; }
.ag-next button { padding:6px 10px;border:1px solid var(--pr-line);border-radius:999px;background:var(--pr-panel);color:var(--pr-text);font:inherit;font-size:12px;cursor:pointer; }
.ag-next button:hover { border-color:var(--ag-a);color:var(--ag-a); }
.ag-meta { display:block;margin-top:8px;font-size:10.5px;color:var(--pr-muted); }

.ag-compose { padding:10px 12px 12px;border-top:1px solid var(--pr-line); }
.ag-attach { display:flex;gap:6px;margin-bottom:8px; }
.ag-chip-img { position:relative; }
.ag-chip-img img { width:52px;height:52px;object-fit:cover;border-radius:8px;border:1px solid var(--pr-line); }
.ag-chip-img button { position:absolute;top:-6px;right:-6px;width:18px;height:18px;border:0;border-radius:50%;background:#111827;color:#fff;font-size:10px;cursor:pointer; }
.ag-box { display:flex;align-items:flex-end;gap:6px;padding:6px;border:1px solid var(--pr-line);border-radius:14px;background:var(--fz-input, var(--pr-soft));transition:border-color .15s,box-shadow .15s; }
.ag-box:focus-within { border-color:var(--ag-a);box-shadow:0 0 0 3px rgba(91,140,255,.15); }
.ag-box textarea { flex:1;min-height:32px;max-height:140px;resize:none;padding:6px 4px;border:0;outline:0;background:transparent;color:var(--pr-text);font:inherit;font-size:13px;line-height:1.45; }
.ag-send { display:inline-grid;place-items:center;width:34px;height:34px;border:0;border-radius:10px;background:linear-gradient(135deg,var(--ag-a),var(--ag-b));color:#fff;cursor:pointer;box-shadow:0 4px 12px var(--ag-glow); }
.ag-send:disabled { opacity:.4;cursor:default;box-shadow:none; }
.ag-send.is-stop { background:#ef4444;box-shadow:none; }

.ag-modal-bg { position:fixed;inset:0;z-index:2000;display:grid;place-items:center;padding:16px;background:rgba(5,10,20,.55);backdrop-filter:blur(3px); }
.ag-modal { display:flex;flex-direction:column;width:min(640px,100%);max-height:calc(100vh - 32px);overflow:hidden;border:1px solid var(--pr-line);border-radius:16px;background:var(--pr-panel);color:var(--pr-text);box-shadow:0 30px 80px rgba(0,0,0,.5); }
.ag-modal header { display:flex;gap:12px;align-items:flex-start;padding:18px 20px 12px; }
.ag-modal h3 { margin:0;font-size:16px; }
.ag-modal header p { margin:4px 0 0;font-size:12.5px;line-height:1.45;color:var(--pr-muted); }
.ag-modal-body { overflow:auto;padding:4px 20px 16px; }
.ag-modal h4 { margin:12px 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--pr-muted); }
.ag-grid { display:grid;grid-template-columns:1fr 1fr;gap:10px 12px; }
.ag-grid label { display:grid;gap:4px;font-size:12px; }
.ag-grid label.is-wide { grid-column:1 / -1; }
.ag-grid label span { color:var(--pr-muted); }
.ag-grid label.is-missing span::after { content:" · falta";color:#f59e0b; }
.ag-grid :is(input,select) { height:36px;padding:0 10px;border:1px solid var(--pr-line);border-radius:9px;background:var(--fz-input, var(--pr-soft));color:var(--pr-text);font:inherit;font-size:13px; }
.ag-grid input::placeholder { color:var(--pr-muted);opacity:.7; }
.ag-modal svg { width:18px;height:18px; }
.ag-grid :is(input,select):focus { outline:0;border-color:var(--ag-a);box-shadow:0 0 0 3px rgba(91,140,255,.15); }
.ag-grid small { font-size:11px;color:var(--ag-a); }
.ag-modal footer { display:flex;justify-content:flex-end;gap:8px;padding:12px 20px 16px;border-top:1px solid var(--pr-line); }
.ag-btn { height:36px;padding:0 16px;border:0;border-radius:10px;background:linear-gradient(135deg,var(--ag-a),var(--ag-b));color:#fff;font:inherit;font-size:13px;font-weight:600;cursor:pointer; }
.ag-btn.is-ghost { border:1px solid var(--pr-line);background:transparent;color:var(--pr-text);font-weight:500; }

@keyframes ag-spin { to { transform:rotate(360deg); } }
@keyframes ag-pulse { 50% { opacity:.35; } }
@keyframes ag-shine { to { background-position:-200% 0; } }
@media (prefers-reduced-motion: reduce) { .ag *, .ag { animation:none !important;transition:none !important; } }
@media (max-width:760px) {
  .ag { top:auto;left:8px;right:8px;bottom:8px;width:auto;height:calc(100% - 60px); }
  .ag-grid { grid-template-columns:1fr; }
}
</style>
