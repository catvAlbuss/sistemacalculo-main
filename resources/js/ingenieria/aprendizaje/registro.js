// Aprendizaje por uso: cada corrección (o confirmación) del ingeniero a una decisión del agente
// se guarda en el servidor (AgenteAprendizajeController, storage/app/private, sin datos
// personales: solo los rasgos geométricos del plano) y queda en la sesión para usarla ya.
// Lo que corrige un ingeniero lo aprende el agente para todo el despacho.

const RUTA = "/software/etabs/agente/aprendizaje";
const RASGOS = ["niveles", "luzLosa", "luzMax", "largo", "ancho", "area", "columnas", "columnetas", "placas", "techoLiviano"];
const enSesion = [];
let cargados = null;

const navegador = () => typeof window !== "undefined" && typeof fetch === "function";
const token = () => (typeof document !== "undefined" ? document.querySelector('meta[name="csrf-token"]')?.content ?? "" : "");

export function rasgosParaGuardar(rasgos = {}) {
  return Object.fromEntries(RASGOS.filter((k) => typeof rasgos[k] === "number" || typeof rasgos[k] === "boolean").map((k) => [k, rasgos[k]]));
}

// evento: {tipo: "correccion"|"confirmacion", clave, valor, propuesto, motivo, rasgos}
export async function registrarEvento(evento) {
  const e = {...evento, rasgos: rasgosParaGuardar(evento.rasgos), fecha: new Date().toISOString()};
  enSesion.push(e);
  if (!navegador()) return {ok: true, guardado: false};
  try {
    const r = await fetch(RUTA, {method: "POST", headers: {"Content-Type": "application/json", Accept: "application/json", "X-CSRF-TOKEN": token(), "X-Requested-With": "XMLHttpRequest"}, credentials: "same-origin", body: JSON.stringify(e)});
    return {ok: true, guardado: r.ok};
  } catch {
    return {ok: true, guardado: false};
  }
}

// Eventos del despacho (servidor) + los de esta sesión. Se piden una vez por sesión.
export async function eventosDeUso() {
  if (navegador() && !cargados) {
    cargados = fetch(RUTA, {headers: {Accept: "application/json"}, credentials: "same-origin"})
      .then((r) => (r.ok ? r.json() : {eventos: []})).then((j) => j.eventos ?? []).catch(() => []);
  }
  const servidor = cargados ? await cargados : [];
  const vistos = new Set(servidor.map((e) => `${e.fecha}|${e.clave}`));
  return [...servidor, ...enSesion.filter((e) => !vistos.has(`${e.fecha}|${e.clave}`))];
}

// Para pruebas: vacía lo de la sesión.
export function olvidarSesion() { enSesion.length = 0; cargados = null; }
