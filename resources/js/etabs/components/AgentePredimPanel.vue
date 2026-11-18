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
      <!-- Lectura de la arquitectura importada: lo que el agente vio y lo que le falta. -->
      <section v-if="lectura.estado !== 'vacio'" class="ag-read" :class="`is-${lectura.estado}`">
        <button type="button" class="ag-read-head" :aria-expanded="verLectura" @click="verLectura = !verLectura">
          <span class="ag-read-ic"><svg viewBox="0 0 24 24"><path :d="ICON.capas" /></svg></span>
          <span class="ag-read-t"><strong>Lectura de la arquitectura</strong><small>{{ lectura.nombre || "Plano abierto" }}</small></span>
          <span class="ag-pill">{{ ESTADO_LECTURA[lectura.estado] }}</span>
        </button>
        <p v-if="lectura.estado === 'leyendo'" class="ag-read-sum"><span class="ag-shimmer">Leyendo ejes, columnas, muros y textos del plano…</span></p>
        <template v-else-if="verLectura">
          <p class="ag-read-sum">{{ lectura.resumen }}</p>
          <dl class="ag-stats">
            <div><dt>Vistas</dt><dd>{{ lectura.vistas.length }}</dd></div>
            <div><dt>Columnas</dt><dd>{{ principal?.columnas ?? 0 }}</dd></div>
            <div><dt>Columnetas</dt><dd>{{ principal?.columnetas ?? 0 }}</dd></div>
            <div><dt>Textos</dt><dd>{{ lectura.textos }}</dd></div>
          </dl>
          <ul v-if="lectura.vistas.length" class="ag-views">
            <li v-for="v in lectura.vistas" :key="v.titulo" :class="{ 'is-ok': v.columnas > 0 }">
              <strong>{{ v.titulo }}</strong>
              <span>Ejes {{ v.ejes.join(" · ") || "—" }} · {{ v.columnas }} columnas · {{ v.columnetas }} columnetas</span>
            </li>
          </ul>
          <p v-if="lectura.niveles.length" class="ag-read-line">Niveles NPT leídos: {{ lectura.niveles.join(", ") }} · {{ lectura.entidades.leidas.toLocaleString() }} de {{ lectura.entidades.total.toLocaleString() }} objetos usados ({{ lectura.unidades }})</p>
          <ul v-if="lectura.problemas.length" class="ag-problems">
            <li v-for="p in lectura.problemas" :key="p.codigo"><svg viewBox="0 0 24 24"><path :d="ICON.aviso" /></svg><div><b>{{ p.texto }}</b><small>{{ p.arreglo }}</small></div></li>
          </ul>
          <details v-if="lectura.avisos.length" class="ag-more">
            <summary>{{ lectura.avisos.length }} {{ lectura.avisos.length === 1 ? "detalle" : "detalles" }} de la lectura</summary>
            <ul><li v-for="(a, j) in lectura.avisos" :key="j">{{ a }}</li></ul>
          </details>
          <button type="button" class="ag-link" :disabled="busy" @click="diagnosticar">Volver a leer el plano</button>
        </template>
      </section>

      <section v-if="!runs.length" class="ag-start">
        <h3>¿Qué hacemos con este plano?</h3>
        <p>El agente lee la arquitectura, decide la estructura con el criterio del despacho y te deja lo dudoso para revisar.</p>
        <div class="ag-caps">
          <button v-for="c in CAPACIDADES" :key="c.titulo" type="button" class="ag-cap" :disabled="busy" @click="ejecutar(c.herramienta, c.args, c.pedido)">
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
              <span class="ag-step-t">{{ p.estado === "ok" ? "✓" : p.estado === "error" ? "✕" : "–" }} {{ p.seg }}</span>
            </li>
          </ol>
          <div v-if="run.vivo" class="ag-thinking"><span class="ag-shimmer">{{ run.vivo }}</span></div>
          <p v-if="run.respuesta" class="ag-answer">{{ run.respuesta }}</p>
          <ul v-if="run.avisos.length" class="ag-notes">
            <li v-for="(a, j) in run.avisos" :key="j"><svg viewBox="0 0 24 24"><path :d="ICON.aviso" /></svg>{{ a }}</li>
          </ul>
          <div v-if="run.metrado" class="ag-ready">
            <span class="ag-ready-ic"><svg viewBox="0 0 24 24"><path :d="ICON.metrado" /></svg></span>
            <div><strong>{{ run.metrado === "listo" ? "Metrado de estructuras listo" : "Metrado disponible" }}</strong><small>Partidas del despacho calculadas con la estructura que dibujé.</small></div>
            <button type="button" class="ag-btn is-sm" :disabled="busy" @click="verMetrado(run)">{{ run.metrado === "listo" ? "Ver metrado" : "Sacar metrado" }}</button>
          </div>
          <div v-if="run.siguientes.length && !busy" class="ag-next">
            <button v-for="s in run.siguientes" :key="s.texto" type="button" @click="ejecutar(s.herramienta, s.args, s.texto)">{{ s.texto }} →</button>
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
        <textarea v-model="draftText" rows="1" :placeholder="motorListo ? 'Pide algo o describe una observación…' : 'Sin motor de IA: usa las acciones de arriba'" :disabled="busy || !motorListo"
          @input="autoAlto" @keydown.enter.exact.prevent="send()"></textarea>
        <button v-if="!busy" type="submit" class="ag-send" :disabled="!motorListo || (!draftText.trim() && !adjuntos.length)" aria-label="Enviar"><svg viewBox="0 0 24 24"><path :d="ICON.enviar" /></svg></button>
        <button v-else type="button" class="ag-send is-stop" aria-label="Detener" :disabled="!controller" @click="cancel"><svg viewBox="0 0 24 24"><path :d="ICON.detener" /></svg></button>
      </div>
    </form>

    <!-- Datos del proyecto: al pedir el plano llegan llenos (lo guardado y lo que propone el agente). -->
    <Teleport to="body">
      <div v-if="modal.abierto" class="ag-modal-bg" @click.self="cerrarDatos(null)">
        <form class="ag-modal" role="dialog" aria-modal="true" aria-labelledby="ag-modal-t" @submit.prevent="cerrarDatos(modal.borrador)">
          <header>
            <span class="ag-orb is-small" aria-hidden="true"><i></i></span>
            <div>
              <h3 id="ag-modal-t">{{ modal.modo === "pedido" ? "Datos para el plano de estructuras" : "Datos del proyecto" }}</h3>
              <p v-if="modal.modo === 'pedido'">Revisa y corrige lo que haga falta.<template v-if="modal.propuestos.length"> Lo marcado en azul lo propone el agente con proyectos parecidos.</template> Al confirmar dibujo las láminas{{ modal.vista ? ` de ${modal.vista}` : "" }}.</p>
              <p v-else>Se usan en las láminas de estructuras y en el rótulo.</p>
            </div>
          </header>
          <div class="ag-modal-body">
            <h4>Estudio de suelos y sismo (E.030)</h4>
            <div class="ag-grid">
              <label v-for="c in CAMPOS_TECNICOS" :key="c.campo" :class="marcaCampo(c.campo)"><span>{{ c.etiqueta }}</span>
                <select v-if="c.opciones" v-model="modal.borrador[c.campo]">
                  <option value="">Sin indicar</option>
                  <option v-for="[valor, texto] in c.opciones" :key="valor" :value="valor">{{ texto }}</option>
                </select>
                <input v-else v-model.trim="modal.borrador[c.campo]" inputmode="decimal" :placeholder="`Ej. ${c.ejemplo}`" />
              </label>
            </div>
            <h4>Rótulo de las láminas</h4>
            <div class="ag-grid">
              <label v-for="c in CAMPOS_PROYECTO" :key="c.campo" :class="[marcaCampo(c.campo), { 'is-wide': c.campo === 'proyecto' || c.campo === 'entidad' }]"><span>{{ c.etiqueta }}</span>
                <input v-model.trim="modal.borrador[c.campo]" :placeholder="c.ejemplo" />
              </label>
            </div>
          </div>
          <footer>
            <button type="button" class="ag-btn is-ghost" @click="cerrarDatos(null)">Cancelar</button>
            <button type="submit" class="ag-btn">{{ modal.modo === "pedido" ? "Generar plano" : "Guardar" }}</button>
          </footer>
        </form>
      </div>
    </Teleport>

    <!-- Metrado de estructuras: partidas, detalle por elemento y exportación a Excel. -->
    <Teleport to="body">
      <div v-if="met.abierto" class="ag-modal-bg" @click.self="met.abierto = false">
        <section class="ag-modal is-wide" role="dialog" aria-modal="true" aria-labelledby="ag-met-t">
          <header>
            <span class="ag-orb is-small" aria-hidden="true"><i></i></span>
            <div>
              <h3 id="ag-met-t">Metrado de estructuras</h3>
              <p>{{ met.datos.proyecto || "Proyecto" }} · {{ partidasMet.length }} partidas. Toca una partida para ver su detalle.</p>
            </div>
          </header>
          <div class="ag-tiles">
            <div><small>Excavación</small><strong>{{ fmt(met.datos.resumen.excavacion) }}</strong><span>m³</span></div>
            <div><small>Concreto</small><strong>{{ fmt(met.datos.resumen.concreto) }}</strong><span>m³</span></div>
            <div><small>Acero</small><strong>{{ fmt(met.datos.resumen.acero) }}</strong><span>kg</span></div>
            <div><small>Encofrado</small><strong>{{ fmt(met.datos.resumen.encofrado) }}</strong><span>m²</span></div>
          </div>
          <div class="ag-modal-body">
            <table class="ag-table">
              <thead><tr><th>Ítem</th><th>Descripción</th><th>Und.</th><th class="num">Metrado</th></tr></thead>
              <tbody>
                <template v-for="(p, i) in met.datos.partidas" :key="i">
                  <tr v-if="p.titulo" class="is-title"><td>{{ p.item }}</td><td colspan="3">{{ p.descripcion }}</td></tr>
                  <template v-else>
                    <tr class="is-row" :class="{ 'is-open': met.abiertas.includes(i) }" @click="alternarPartida(i)">
                      <td>{{ p.item }}</td><td>{{ p.descripcion }}</td><td>{{ p.und }}</td><td class="num">{{ fmt(p.total) }}</td>
                    </tr>
                    <tr v-if="met.abiertas.includes(i)" class="is-detail">
                      <td></td>
                      <td colspan="3">
                        <table class="ag-subtable">
                          <tr v-for="(f, j) in p.filas" :key="j">
                            <td>{{ f.descripcion }}</td>
                            <td class="dim">{{ dimensiones(f) }}</td>
                            <td class="num">{{ fmt(f.parcial) }}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </template>
                </template>
              </tbody>
            </table>
            <ul v-if="met.datos.notas?.length" class="ag-notes">
              <li v-for="(n, j) in met.datos.notas" :key="j"><svg viewBox="0 0 24 24"><path :d="ICON.aviso" /></svg>{{ n }}</li>
            </ul>
          </div>
          <footer>
            <span v-if="met.error" class="ag-err">{{ met.error }}</span>
            <button type="button" class="ag-btn is-ghost" @click="met.abierto = false">Cerrar</button>
            <button type="button" class="ag-btn" :disabled="met.exportando" @click="exportarMetrado">{{ met.exportando ? "Exportando…" : "Exportar a Excel" }}</button>
          </footer>
        </section>
      </div>
    </Teleport>
  </aside>
</template>

<script setup>
import {computed, nextTick, onBeforeUnmount, onMounted, reactive, ref} from "vue";
import {AGENTE_SERVIDOR, respuestaHonesta, runAgent} from "../../ingenieria/agente/agentRunner.js";
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

// Acciones directas: corren la herramienta sin pasar por el modelo de IA (sin costo y sin
// esperar al motor). El texto libre del cuadro de abajo sí va al modelo.
const CAPACIDADES = [
  {titulo: "Analizar", icono: "analizar", detalle: "Lee niveles, ejes y columnas y propone la estructura", herramienta: "proponer_estructura", pedido: "Analiza este plano y propón la estructura"},
  {titulo: "Estructurar", icono: "estructura", detalle: "Confirma los datos y genera las láminas E-01, E-02…", herramienta: "plano_estructuras", pedido: "Genera el plano de estructuras"},
  {titulo: "Metrar", icono: "metrado", detalle: "Partidas del despacho, con exportación a Excel", herramienta: "metrar_estructura", pedido: "Saca el metrado de estructuras"},
  {titulo: "Revisar", icono: "revisar", detalle: "Encimados, datos faltantes y rótulo", herramienta: "revisar_laminas", pedido: "Revisa las láminas"},
];
const GENERAR = {texto: "Generar el plano de estructuras", herramienta: "plano_estructuras"};
const REVISAR = {texto: "Revisar las láminas", herramienta: "revisar_laminas"};

// Herramienta → paso visible, texto mientras trabaja y siguientes pasos sugeridos.
const PASOS = {
  proponer_estructura: {titulo: "Analicé la estructura", vivo: "Analizando la arquitectura…", icono: "analizar", siguientes: [GENERAR]},
  plano_estructuras: {titulo: "Generé las láminas de estructuras", vivo: "Leyendo la arquitectura y preparando los datos…", icono: "estructura", siguientes: [REVISAR]},
  metrar_estructura: {titulo: "Saqué el metrado", vivo: "Metrando la estructura…", icono: "metrado", siguientes: [REVISAR]},
  revisar_laminas: {titulo: "Revisé las láminas", vivo: "Revisando las láminas…", icono: "revisar", siguientes: []},
  corregir_estructura: {titulo: "Anoté la corrección", icono: "corregir", siguientes: [GENERAR]},
  datos_proyecto: {titulo: "Guardé los datos del proyecto", icono: "datos", siguientes: [GENERAR]},
  leer_estructura: {titulo: "Leí ejes y columnas", icono: "analizar", siguientes: [{texto: "Proponer la estructura", herramienta: "proponer_estructura"}]},
  vistas_plano: {titulo: "Revisé las vistas del plano", icono: "capas", siguientes: []},
  quitar_laminas: {titulo: "Quité las láminas", icono: "borrar", siguientes: []},
};

// ---- Motor (solo su estado: proveedor, clave y modelo viven en el .env del servidor) ----
const settings = ref({...AGENTE_SERVIDOR});
const motor = ref({cargando: true, listo: false, mensaje: ""});
const motorListo = computed(() => motor.value.listo);
async function consultarMotor() {
  try {
    const r = await fetch("/software/etabs/agente/llm/estado", {headers: {Accept: "application/json"}, credentials: "same-origin"});
    const e = r.ok ? await r.json() : {listo: false, mensaje: "No pude consultar el motor del agente."};
    motor.value = {cargando: false, listo: Boolean(e.listo), mensaje: e.mensaje ?? ""};
    settings.value = {...AGENTE_SERVIDOR, memoria: e.memoria ?? "completa", vision: Boolean(e.vision), sinRazonar: e.memoria === "corta"};
  } catch {
    motor.value = {cargando: false, listo: false, mensaje: "No pude consultar el motor del agente."};
  }
}

// ---- Datos del proyecto (formulario) ----
const PROYECTO_KEY = "predim-agente.proyecto";
const proyecto = ref((() => { try { return JSON.parse(localStorage.getItem(PROYECTO_KEY) || "{}"); } catch { return {}; } })());
const guardarProyecto = (datos) => {
  proyecto.value = {...proyecto.value, ...datos};
  try { localStorage.setItem(PROYECTO_KEY, JSON.stringify(proyecto.value)); } catch { /* sin almacenamiento: vale para esta sesión */ }
};
const modal = reactive({abierto: false, modo: "editar", faltan: [], propuestos: [], vista: "", borrador: {}, resolver: null});
const marcaCampo = (campo) => ({"is-proposed": modal.propuestos.includes(campo), "is-missing": modal.faltan.includes(campo)});
// modo "pedido": antes de dibujar el plano. Los campos vacíos se llenan con lo que propone el
// agente (marcados para que el personal los revise); lo guardado no se toca.
function abrirDatos(modo = "editar", {faltan = [], sugeridos = {}, vista = ""} = {}) {
  const borrador = {...Object.fromEntries([...CAMPOS_TECNICOS, ...CAMPOS_PROYECTO].map((c) => [c.campo, ""])), ...proyecto.value};
  const propuestos = [];
  for (const [campo, valor] of Object.entries(sugeridos ?? {})) {
    if (valor === undefined || valor === null || String(borrador[campo] ?? "").trim() !== "") continue;
    borrador[campo] = typeof valor === "number" && campo !== "niveles" ? valor.toFixed(2) : String(valor);
    propuestos.push(campo);
  }
  modal.resolver?.(null);
  Object.assign(modal, {abierto: true, modo, faltan: faltan.filter((c) => !propuestos.includes(c)), propuestos, vista, borrador});
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
const cargarVisor = () => import("@mlightcad/cad-simple-viewer");
const getContext = () => contextPromise ??= Promise.all([
  cargarVisor(), import("@mlightcad/data-model"), import("../../ingenieria/cad/drawingContext.js"),
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
  // Antes de dibujar el plano, el agente muestra los datos del proyecto para confirmarlos.
  ctx.pedirDatos = ({faltan, sugeridos, vista}) => abrirDatos("pedido", {faltan, sugeridos, vista});
  return ctx;
});
const cargarSkills = () => import("../../ingenieria/agente/skills/index.js");

// Prueba en el visor real (scripts/agente/ver-en-visor.mjs): herramientas sin modelo.
if (window.__NOVACAD_PRUEBA__) {
  window.__novacadPrueba = window.__novacadPrueba ?? {};
  window.__novacadPrueba.herramienta = async (nombre, args = {}) => {
    const [{SKILLS}, ctx] = await Promise.all([cargarSkills(), getContext()]);
    const skill = SKILLS.find((s) => s.name === nombre);
    if (!skill) throw new Error(`No existe la herramienta ${nombre}`);
    const pedir = ctx.pedirDatos;
    ctx.pedirDatos = null; // la prueba no abre formularios
    try { return JSON.parse(JSON.stringify(await skill.run(args, ctx))); } finally { ctx.pedirDatos = pedir; }
  };
  window.__novacadPrueba.lectura = () => JSON.parse(JSON.stringify(lectura.value));
}

// ---- Lectura de la arquitectura al importar el plano ----
const ESTADO_LECTURA = {leyendo: "Leyendo…", lista: "Listo", parcial: "Revisar", no: "No apto"};
const lectura = ref({estado: "vacio"});
const verLectura = ref(true);
const principal = computed(() => lectura.value.vistas?.find((v) => v.columnas > 0) ?? lectura.value.vistas?.[0] ?? null);
let lecturaId = 0;
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
async function diagnosticar() {
  const id = ++lecturaId;
  let viewer, ctx, diag;
  try { [viewer, ctx, diag] = await Promise.all([cargarVisor(), getContext(), import("../../ingenieria/lectura/diagnostico.js")]); } catch { return; }
  const doc = viewer.AcApDocManager.instance?.curDocument;
  const db = doc?.database;
  const cuenta = () => { try { return db.tables.blockTable.modelSpace.newIterator().toArray().length; } catch { return 0; } };
  // Un plano grande se dibuja por tandas: se espera a que deje de crecer antes de leerlo.
  let previo = cuenta(), iguales = 0;
  if (previo) lectura.value = {estado: "leyendo", nombre: doc?.docTitle ?? ""};
  for (let i = 0; i < 360 && iguales < 2; i++) {
    await esperar(500);
    if (id !== lecturaId) return;
    const n = cuenta();
    iguales = n > 0 && n === previo ? iguales + 1 : 0;
    if (n && lectura.value.estado !== "leyendo") lectura.value = {estado: "leyendo", nombre: doc?.docTitle ?? ""};
    previo = n;
  }
  if (!previo) { lectura.value = {estado: "vacio"}; return; }
  await nextTick();
  delete ctx.memoria.lectura;
  try {
    const plan = ctx.readPlan();
    lectura.value = {...diag.diagnosticarLectura({database: db, items: plan.items, vistas: plan.vistas}), nombre: doc?.docTitle ?? ""};
  } catch (error) {
    lectura.value = {estado: "no", nombre: doc?.docTitle ?? "", resumen: `No pude leer el plano: ${error?.message ?? error}`, vistas: [], niveles: [], textos: 0, unidades: "", entidades: {total: 0, leidas: 0}, problemas: [], avisos: []};
  }
  verLectura.value = !runs.value.length || lectura.value.estado !== "lista";
}
let quitarEscucha = null;
onMounted(async () => {
  consultarMotor();
  diagnosticar();
  try {
    const manager = (await cargarVisor()).AcApDocManager.instance;
    const alActivar = () => diagnosticar();
    manager?.events?.documentActivated?.addEventListener(alActivar);
    quitarEscucha = () => manager?.events?.documentActivated?.removeEventListener(alActivar);
  } catch { /* sin visor: no hay plano que leer */ }
});
onBeforeUnmount(() => { quitarEscucha?.(); lecturaId++; });

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
const controller = ref(null);

const estadoTono = computed(() => (busy.value ? "busy" : motor.value.cargando ? "idle" : motor.value.listo ? "ok" : "off"));
const estadoTexto = computed(() => (busy.value ? "Trabajando en tu plano…" : motor.value.cargando ? "Conectando…" : motor.value.listo ? "Listo · IA del despacho" : "Acciones directas · sin motor de IA"));

const scrollDown = () => nextTick(() => { if (listRef.value) listRef.value.scrollTop = listRef.value.scrollHeight; });
const autoAlto = (e) => { e.target.style.height = "auto"; e.target.style.height = `${Math.min(140, e.target.scrollHeight)}px`; };
const reset = () => { runs.value = []; };
const cancel = () => controller.value?.abort();

function nuevoRun(pedido, fotos = []) {
  const run = reactive({pedido, fotos, pasos: [], vivo: "Entendiendo el pedido…", respuesta: "", avisos: [], siguientes: [], metrado: null, meta: ""});
  runs.value.push(run);
  verLectura.value = lectura.value.estado !== "lista";
  scrollDown();
  return run;
}
function anotarPaso(run, step, desde) {
  const def = PASOS[step.tool] ?? {titulo: step.tool, icono: "chispa"};
  const estado = step.result?.cancelado ? "skip" : step.result?.ok === false ? "error" : "ok";
  run.pasos.push({titulo: step.result?.cancelado ? "Cancelaste los datos del proyecto" : def.titulo, icono: def.icono, estado, seg: `${((performance.now() - desde) / 1000).toFixed(1)} s`});
  scrollDown();
}
// Cierre común (modelo o acción directa): respuesta, avisos, siguientes pasos y metrado.
async function cerrarRun(run, steps, reply, inicio) {
  // Los avisos van en su recuadro: no se repiten dentro de la respuesta.
  run.respuesta = String(reply ?? "").split("\n").filter((l) => !l.startsWith("Aviso: ")).join("\n").trim();
  run.avisos = [...new Set(steps.flatMap((s) => s.result?.avisos ?? []))].slice(0, 6);
  const hechos = steps.filter((s) => s.result?.ok !== false);
  const ultimo = hechos.at(-1);
  const sig = [...(PASOS[ultimo?.tool]?.siguientes ?? [])];
  if (ultimo?.tool === "revisar_laminas" && ultimo.result?.encimados) sig.unshift({texto: "Corregir los textos encimados", herramienta: "revisar_laminas", args: {corregir: true}});
  run.siguientes = sig.slice(0, 2);
  if (hechos.some((s) => s.tool === "metrar_estructura")) {
    run.metrado = "listo";
    const ctx = await getContext();
    if (ctx.memoria.metrado) mostrarMetrado(ctx.memoria.metrado);
  } else if (hechos.some((s) => s.tool === "plano_estructuras")) {
    run.metrado = "disponible";
  }
  run.meta = `${((performance.now() - inicio) / 1000).toFixed(1)} s`;
}

// Acción directa: la herramienta corre en el navegador, sin el modelo de IA.
async function ejecutar(herramienta, args = {}, pedido = herramienta) {
  if (busy.value) return;
  const run = nuevoRun(pedido);
  busy.value = true;
  const inicio = performance.now();
  try {
    const [{SKILLS}, ctx] = await Promise.all([cargarSkills(), getContext()]);
    const skill = SKILLS.find((s) => s.name === herramienta);
    if (!skill) throw new Error(`No conozco la acción ${herramienta}.`);
    run.vivo = PASOS[herramienta]?.vivo ?? "Trabajando…";
    if (ctx.memoria) ctx.memoria.ultimoPedido = pedido;
    let result;
    try { result = await skill.run({...args}, ctx); } catch (error) { result = {ok: false, error: error?.message ?? String(error)}; }
    const step = {tool: herramienta, args, result};
    anotarPaso(run, step, inicio);
    await cerrarRun(run, [step], result?.cancelado ? "No dibujé el plano: cancelaste los datos del proyecto." : respuestaHonesta("", [step]), inicio);
  } catch (error) {
    run.respuesta = error?.message ?? String(error);
  } finally {
    run.vivo = "";
    busy.value = false;
    scrollDown();
  }
}

// Pedido libre: va al modelo de IA del servidor, que elige las herramientas.
async function send(text = draftText.value) {
  const value = text.trim() || (adjuntos.value.length ? "Revisa estas observaciones" : "");
  if (!value || busy.value || !motorListo.value) return;
  const fotos = adjuntos.value.splice(0);
  draftText.value = "";
  // Solo el texto de turnos previos viaja al modelo.
  const history = runs.value.flatMap((r) => [{role: "user", content: r.pedido}, ...(r.respuesta ? [{role: "assistant", content: r.respuesta}] : [])]);
  const run = nuevoRun(value, fotos.map((f) => f.url));
  busy.value = true;
  controller.value = new AbortController();
  const inicio = performance.now();
  let marca = inicio;
  try {
    const ctx = await getContext();
    const guardada = fotos.length ? guardarObservacion(value, fotos, ctx) : Promise.resolve(false);
    const out = await runAgent({
      text: value, imagenes: fotos.map((f) => f.url), history, settings: settings.value, context: ctx, signal: controller.value.signal,
      onStep: (step) => { anotarPaso(run, step, marca); marca = performance.now(); run.vivo = "Preparando la respuesta…"; },
    });
    await cerrarRun(run, out.steps, out.steps.some((s) => s.result?.cancelado) ? "No dibujé el plano: cancelaste los datos del proyecto." : out.reply, inicio);
    if (fotos.length) run.avisos.unshift((await guardada) ? `Guardé ${fotos.length} foto(s) como observación para entrenar al agente.` : "No pude guardar las fotos como observación; inténtalo de nuevo.");
  } catch (error) {
    run.respuesta = error?.name === "AbortError" ? "Pedido detenido." : error?.message ?? String(error);
  } finally {
    run.vivo = "";
    busy.value = false;
    controller.value = null;
    scrollDown();
  }
}

// ---- Metrado ----
const met = reactive({abierto: false, datos: null, abiertas: [], exportando: false, error: ""});
const partidasMet = computed(() => (met.datos?.partidas ?? []).filter((p) => !p.titulo));
const fmt = (v) => (Number.isFinite(v) ? v.toLocaleString("es-PE", {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "—");
const d2 = (v) => (v === null || v === undefined ? null : Number(v).toFixed(2));
// Cómo se obtuvo cada fila: medidas (concreto, encofrado) o varillas (acero).
function dimensiones(f) {
  if (f.varillas !== undefined) return `${f.simil > 1 ? `${f.simil} × ` : ""}(${d2(f.longitud)}${f.gancho ? ` + ${d2(f.gancho)}` : ""}) m × ${f.varillas} Ø${f.diametro ?? ""} × ${f.kgm} kg/m`;
  const medidas = [f.largo, f.ancho, f.alto].map(d2).filter(Boolean);
  const pre = [f.simil > 1 ? `${f.simil}` : null, f.veces !== 1 ? `${f.veces}` : null].filter(Boolean);
  return medidas.length ? [...pre, ...medidas].join(" × ") : "";
}
function mostrarMetrado(datos) {
  Object.assign(met, {abierto: true, datos, abiertas: [], error: ""});
}
const alternarPartida = (i) => { met.abiertas = met.abiertas.includes(i) ? met.abiertas.filter((x) => x !== i) : [...met.abiertas, i]; };
// Desde el aviso del plano: se recalcula con la estructura dibujada (rápido y sin IA).
async function verMetrado(run) {
  const [{SKILLS}, ctx] = await Promise.all([cargarSkills(), getContext()]);
  if (!ctx.memoria.modeloEstructural) { await ejecutar("metrar_estructura", {}, "Sacar el metrado de estructuras"); return; }
  try {
    const r = await SKILLS.find((s) => s.name === "metrar_estructura").run({}, ctx);
    if (r.ok === false) throw new Error(r.error);
    run.metrado = "listo";
    mostrarMetrado(ctx.memoria.metrado);
  } catch (error) {
    run.avisos.push(`No pude sacar el metrado: ${error?.message ?? error}`);
  }
}
async function exportarMetrado() {
  met.exportando = true;
  met.error = "";
  try {
    const {descargarPlanilla} = await import("../../ingenieria/metrado/planillaExcel.js");
    const nombre = `METRADOS_ESTRUCTURAS_${String(met.datos.proyecto ?? "PROYECTO").replace(/[^A-Za-z0-9ÁÉÍÓÚÑáéíóúñ]+/g, "_").slice(0, 40)}.xlsx`;
    await descargarPlanilla(met.datos, nombre);
  } catch (error) {
    met.error = `No pude exportar: ${error?.message ?? error}`;
  } finally {
    met.exportando = false;
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
.ag svg, .ag-modal svg { width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round; }

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

/* Lectura de la arquitectura */
.ag-read { --tono:var(--ag-a);border:1px solid var(--pr-line);border-left:3px solid var(--tono);border-radius:12px;background:var(--pr-soft);padding:10px 12px; }
.ag-read.is-lista { --tono:#22c55e; }
.ag-read.is-parcial { --tono:#f59e0b; }
.ag-read.is-no { --tono:#ef4444; }
.ag-read-head { display:flex;align-items:center;gap:10px;width:100%;padding:0;border:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer; }
.ag-read-ic { display:inline-grid;place-items:center;width:28px;height:28px;flex:none;border-radius:8px;background:var(--pr-panel);border:1px solid var(--pr-line);color:var(--tono); }
.ag-read-ic svg { width:15px;height:15px; }
.ag-read-t { flex:1;min-width:0;display:grid; }
.ag-read-t strong { font-size:12.5px; }
.ag-read-t small { font-size:11px;color:var(--pr-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.ag-pill { flex:none;padding:3px 8px;border-radius:999px;font-size:11px;font-weight:600;color:var(--tono);background:color-mix(in srgb,var(--tono) 14%,transparent); }
.ag-read-sum { margin:8px 0 0;font-size:12.5px;line-height:1.45; }
.ag-stats { display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:10px 0 0; }
.ag-stats div { padding:6px 8px;border-radius:9px;background:var(--pr-panel);border:1px solid var(--pr-line); }
.ag-stats dt { font-size:10.5px;color:var(--pr-muted); }
.ag-stats dd { margin:0;font-size:15px;font-weight:700;font-variant-numeric:tabular-nums; }
.ag-views { list-style:none;margin:10px 0 0;padding:0;display:grid;gap:6px; }
.ag-views li { display:grid;gap:1px;padding-left:10px;border-left:2px solid var(--pr-line);font-size:11.5px; }
.ag-views li.is-ok { border-left-color:#22c55e; }
.ag-views span { color:var(--pr-muted); }
.ag-read-line { margin:8px 0 0;font-size:11px;color:var(--pr-muted); }
.ag-problems { list-style:none;margin:10px 0 0;padding:0;display:grid;gap:6px; }
.ag-problems li { display:flex;gap:8px;padding:8px 9px;border-radius:9px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.28);font-size:11.8px;line-height:1.4; }
.ag-problems svg { flex:none;width:15px;height:15px;color:#ef4444;margin-top:1px; }
.ag-problems small { display:block;margin-top:3px;color:var(--pr-muted); }
.ag-more { margin-top:8px;font-size:11.5px; }
.ag-more summary { cursor:pointer;color:var(--pr-muted); }
.ag-more ul { margin:6px 0 0;padding-left:16px;display:grid;gap:4px;color:var(--pr-muted);line-height:1.4; }
.ag-link { margin-top:8px;padding:0;border:0;background:none;color:var(--ag-a);font:inherit;font-size:11.5px;cursor:pointer; }
.ag-link:disabled { opacity:.5;cursor:default; }

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
.is-skip .ag-step-ic, .is-skip .ag-step-txt { color:var(--pr-muted); }
.ag-step-t { font-size:11px;color:var(--pr-muted);font-variant-numeric:tabular-nums; }
.is-ok .ag-step-t { color:#22c55e; }
.is-error .ag-step-t { color:#ef4444; }
.ag-thinking { padding:4px 0 2px;font-size:12.5px; }
.ag-shimmer { background:linear-gradient(90deg,var(--pr-muted) 0%,var(--pr-text) 50%,var(--pr-muted) 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:ag-shine 1.6s linear infinite; }
.ag-answer { margin:0;font-size:13px;line-height:1.55;white-space:pre-wrap; }
.ag-notes { list-style:none;margin:10px 0 0;padding:0;display:grid;gap:6px; }
.ag-notes li { display:flex;gap:7px;align-items:flex-start;padding:7px 9px;border-radius:9px;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.28);font-size:11.8px;line-height:1.4; }
.ag-notes svg { flex:none;width:15px;height:15px;color:#f59e0b;margin-top:1px; }
.ag-ready { display:flex;align-items:center;gap:10px;margin-top:10px;padding:10px;border-radius:11px;border:1px solid color-mix(in srgb,var(--ag-a) 45%,transparent);background:linear-gradient(135deg,rgba(91,140,255,.12),rgba(164,107,255,.12)); }
.ag-ready-ic { display:inline-grid;place-items:center;width:30px;height:30px;flex:none;border-radius:9px;background:linear-gradient(135deg,var(--ag-a),var(--ag-b));color:#fff; }
.ag-ready-ic svg { width:16px;height:16px; }
.ag-ready div { flex:1;min-width:0;display:grid; }
.ag-ready strong { font-size:12.5px; }
.ag-ready small { font-size:11px;color:var(--pr-muted);line-height:1.35; }
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

/* Modales */
.ag-modal-bg { position:fixed;inset:0;z-index:2000;display:grid;place-items:center;padding:16px;background:rgba(5,10,20,.55);backdrop-filter:blur(3px); }
.ag-modal { display:flex;flex-direction:column;width:min(640px,100%);max-height:calc(100vh - 32px);overflow:hidden;border:1px solid var(--pr-line);border-radius:16px;background:var(--pr-panel);color:var(--pr-text);box-shadow:0 30px 80px rgba(0,0,0,.5); }
.ag-modal.is-wide { width:min(920px,100%); }
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
.ag-grid label.is-proposed span::after { content:" · propuesto";color:var(--ag-a); }
.ag-grid label.is-proposed :is(input,select) { border-color:color-mix(in srgb,var(--ag-a) 60%,transparent);background:color-mix(in srgb,var(--ag-a) 8%,var(--fz-input, var(--pr-soft))); }
.ag-grid :is(input,select) { height:36px;padding:0 10px;border:1px solid var(--pr-line);border-radius:9px;background:var(--fz-input, var(--pr-soft));color:var(--pr-text);font:inherit;font-size:13px; }
.ag-grid input::placeholder { color:var(--pr-muted);opacity:.7; }
.ag-grid :is(input,select):focus { outline:0;border-color:var(--ag-a);box-shadow:0 0 0 3px rgba(91,140,255,.15); }
.ag-modal footer { display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:12px 20px 16px;border-top:1px solid var(--pr-line); }
.ag-btn { height:36px;padding:0 16px;border:0;border-radius:10px;background:linear-gradient(135deg,var(--ag-a),var(--ag-b));color:#fff;font:inherit;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap; }
.ag-btn:disabled { opacity:.6;cursor:default; }
.ag-btn.is-sm { height:30px;padding:0 12px;font-size:12px; }
.ag-btn.is-ghost { border:1px solid var(--pr-line);background:transparent;color:var(--pr-text);font-weight:500; }
.ag-err { margin-right:auto;font-size:12px;color:#ef4444; }

.ag-tiles { display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:0 20px 12px; }
.ag-tiles div { display:grid;padding:10px 12px;border-radius:12px;border:1px solid var(--pr-line);background:var(--pr-soft); }
.ag-tiles small { font-size:11px;color:var(--pr-muted); }
.ag-tiles strong { font-size:19px;font-variant-numeric:tabular-nums;line-height:1.3; }
.ag-tiles span { font-size:11px;color:var(--pr-muted); }
.ag-table { width:100%;border-collapse:collapse;font-size:12px; }
.ag-table th { position:sticky;top:0;z-index:1;padding:8px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:var(--pr-muted);background:var(--pr-panel);border-bottom:1px solid var(--pr-line); }
.ag-table td { padding:7px 8px;border-bottom:1px solid color-mix(in srgb,var(--pr-line) 60%,transparent);vertical-align:top; }
.ag-table td:first-child { white-space:nowrap;color:var(--pr-muted);font-variant-numeric:tabular-nums; }
.ag-table .num { text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums; }
.ag-table tr.is-title td { padding-top:12px;font-weight:700;color:var(--pr-text);background:transparent; }
.ag-table tr.is-row { cursor:pointer; }
.ag-table tr.is-row:hover td, .ag-table tr.is-open td { background:color-mix(in srgb,var(--ag-a) 7%,transparent); }
.ag-table tr.is-row td:last-child { font-weight:600; }
.ag-table tr.is-detail td { padding-top:0;background:color-mix(in srgb,var(--ag-a) 4%,transparent); }
.ag-subtable { width:100%;border-collapse:collapse;font-size:11.5px; }
.ag-subtable td { padding:4px 6px;border-bottom:1px dashed color-mix(in srgb,var(--pr-line) 70%,transparent);color:var(--pr-muted); }
.ag-subtable td:first-child { white-space:normal;color:var(--pr-text); }
.ag-subtable .dim { white-space:nowrap;font-variant-numeric:tabular-nums; }

@keyframes ag-spin { to { transform:rotate(360deg); } }
@keyframes ag-pulse { 50% { opacity:.35; } }
@keyframes ag-shine { to { background-position:-200% 0; } }
@media (prefers-reduced-motion: reduce) { .ag *, .ag { animation:none !important;transition:none !important; } }
@media (max-width:760px) {
  .ag { top:auto;left:8px;right:8px;bottom:8px;width:auto;height:calc(100% - 60px); }
  .ag-grid { grid-template-columns:1fr; }
  .ag-tiles, .ag-stats { grid-template-columns:repeat(2,1fr); }
}
</style>
