// Las correcciones se envían al servidor como pendientes. Solo las aprobadas por un ingeniero
// autorizado se comparten con las propuestas del agente.

const RUTA = "/software/etabs/agente/aprendizaje";
// Solo geometría y rasgos de uso (sin nombres ni textos del plano): con ellos se aprenden patrones.
const RASGOS = ["niveles", "luzLosa", "luzMax", "largo", "ancho", "area", "columnas", "columnetas", "placas", "techoLiviano", "cubierta", "falsoCielo", "deportivo", "agua", "banos"];
let cargados = null;

const navegador = () => typeof window !== "undefined" && typeof fetch === "function";
const token = () => (typeof document !== "undefined" ? document.querySelector('meta[name="csrf-token"]')?.content ?? "" : "");

export function rasgosParaGuardar(rasgos = {}) {
  return Object.fromEntries(RASGOS.filter((k) => typeof rasgos[k] === "number" || typeof rasgos[k] === "boolean").map((k) => [k, rasgos[k]]));
}

// evento: {tipo: "correccion"|"confirmacion", clave, valor, propuesto, motivo, rasgos}
export async function registrarEvento(evento) {
  const e = {...evento, rasgos: rasgosParaGuardar(evento.rasgos), fecha: new Date().toISOString()};
  if (!navegador()) return {ok: false, guardado: false, error: "No se pudo enviar la corrección al servidor."};
  try {
    const r = await fetch(RUTA, {method: "POST", headers: {"Content-Type": "application/json", Accept: "application/json", "X-CSRF-TOKEN": token(), "X-Requested-With": "XMLHttpRequest"}, credentials: "same-origin", body: JSON.stringify(e)});
    if (!r.ok) return {ok: false, guardado: false, error: `No se pudo enviar la corrección (HTTP ${r.status}).`};
    const j = await r.json().catch(() => ({}));
    return {ok: true, guardado: true, estado: j.estado ?? "pendiente", evento_id: j.evento_id};
  } catch {
    return {ok: false, guardado: false, error: "No se pudo enviar la corrección: revisa la conexión e inténtalo de nuevo."};
  }
}

function errorRevision(response, accion) {
  if (response.status === 403) return "No tienes permiso para revisar correcciones.";
  return `No se pudo ${accion} las correcciones (HTTP ${response.status}).`;
}

export async function cargarEventosPendientes() {
  if (!navegador()) return {ok: false, eventos: [], error: "No se pudo cargar la cola de revisión en este entorno."};
  try {
    const r = await fetch(`${RUTA}/pendientes`, {headers: {Accept: "application/json"}, credentials: "same-origin"});
    // Sin permiso de revisión no es un error para el usuario: simplemente no ve la cola.
    if (r.status === 403 || r.status === 401) return {ok: true, eventos: [], sinPermiso: true};
    if (!r.ok) return {ok: false, eventos: [], error: errorRevision(r, "cargar")};
    const j = await r.json();
    return {ok: true, eventos: j.eventos ?? []};
  } catch {
    return {ok: false, eventos: [], error: "No se pudo cargar la cola de revisión: revisa la conexión e inténtalo de nuevo."};
  }
}

export async function resolverEventoPendiente(id, accion) {
  if (!["aprobar", "rechazar"].includes(accion)) return {ok: false, error: "Acción de revisión no válida."};
  if (!navegador()) return {ok: false, error: "No se pudo enviar la revisión en este entorno."};
  try {
    const r = await fetch(`${RUTA}/${encodeURIComponent(id)}/${accion}`, {
      method: "POST",
      headers: {Accept: "application/json", "X-CSRF-TOKEN": token(), "X-Requested-With": "XMLHttpRequest"},
      credentials: "same-origin",
    });
    if (!r.ok) return {ok: false, error: errorRevision(r, accion)};
    return {ok: true, ...(await r.json().catch(() => ({})))};
  } catch {
    return {ok: false, error: `No se pudo ${accion} la corrección: revisa la conexión e inténtalo de nuevo.`};
  }
}

export function eventosTrasRevision(eventos, id, resultado) {
  return resultado?.ok ? eventos.filter((evento) => evento.evento_id !== id) : eventos;
}

// Eventos aprobados del despacho; los pendientes no se añaden a la sesión.
export async function eventosDeUso() {
  if (navegador() && !cargados) {
    cargados = fetch(RUTA, {headers: {Accept: "application/json"}, credentials: "same-origin"})
      .then((r) => (r.ok ? r.json() : {eventos: []})).then((j) => (j.eventos ?? []).filter((e) => !e.estado || e.estado === "aprobado")).catch(() => []);
  }
  return cargados ? await cargados : [];
}

// Para pruebas y al iniciar una sesión nueva: vuelve a cargar los eventos aprobados.
export function olvidarSesion() { cargados = null; }
