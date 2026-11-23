// Capa de robustez sobre el visor (mlightcad AcTrView2d), sin tocar node_modules.
//
// Mientras un plano carga (más tiempo cuanto más pesado), la vista todavía no tiene su
// presentación activa (activeLayoutView). Si en ese lapso el usuario mueve el mouse o algo
// pide un encuadre, el visor falla con "Cannot read properties of undefined (reading
// 'pointToBox' / 'zoomTo')". Aquí esos métodos esperan a que la vista esté lista:
// - pick (mouse): no hay nada que elegir todavía → lista vacía;
// - zoomTo / flyTo: el último encuadre pedido se aplica apenas la vista está lista;
// - mode / center: se aplican cuando la vista está lista.
// Se instala una vez sobre el prototipo de la vista (vale para todas las vistas).

const MARCA = Symbol.for("novacad.robustezVisor");
const PENDIENTES = Symbol.for("novacad.robustezVisor.pendientes");
const ESPERA_MAX_MS = 120000;

export function vistaLista(vista) {
  try { return Boolean(vista?.activeLayoutView); } catch { return false; }
}

// Ejecuta fn cuando la vista esté lista (o la descarta pasado ESPERA_MAX_MS). Solo cuenta
// el último pedido de cada clave: dos encuadres seguidos durante la carga → el último.
function cuandoEsteLista(vista, clave, fn, ahora = () => Date.now(), programar = (f) => (globalThis.requestAnimationFrame ?? ((g) => setTimeout(g, 16)))(f)) {
  const pendientes = (vista[PENDIENTES] ??= {});
  const ya = Boolean(pendientes[clave]);
  pendientes[clave] = fn;
  if (ya) return;
  const inicio = ahora();
  const revisar = () => {
    if (vistaLista(vista)) { const f = pendientes[clave]; delete pendientes[clave]; f?.(); return; }
    if (ahora() - inicio > ESPERA_MAX_MS) { delete pendientes[clave]; return; }
    programar(revisar);
  };
  programar(revisar);
}

// prototipo: Object.getPrototypeOf(vista). Devuelve true si se instaló ahora.
export function blindarPrototipoVista(prototipo, opciones = {}) {
  if (!prototipo || prototipo[MARCA]) return false;
  const original = (nombre) => prototipo[nombre];
  const pick = original("pick");
  if (typeof pick === "function") {
    prototipo.pick = function (...args) { return vistaLista(this) ? pick.apply(this, args) : []; };
  }
  for (const nombre of ["zoomTo", "flyTo"]) {
    const fn = original(nombre);
    if (typeof fn !== "function") continue;
    prototipo[nombre] = function (...args) {
      if (vistaLista(this)) return fn.apply(this, args);
      cuandoEsteLista(this, nombre, () => fn.apply(this, args), opciones.ahora, opciones.programar);
      return undefined;
    };
  }
  for (const nombre of ["mode", "center"]) {
    const d = Object.getOwnPropertyDescriptor(prototipo, nombre);
    if (!d?.set) continue;
    Object.defineProperty(prototipo, nombre, {
      ...d,
      set(valor) {
        if (vistaLista(this)) { d.set.call(this, valor); return; }
        cuandoEsteLista(this, `set:${nombre}`, () => d.set.call(this, valor), opciones.ahora, opciones.programar);
      },
    });
  }
  Object.defineProperty(prototipo, MARCA, {value: true});
  return true;
}

// ---- Apertura por peso del plano (chico / mediano / grande) ----
// El visor lee y dibuja el plano en el navegador del cliente (el servidor solo entrega el
// archivo). Por defecto convierte TODO antes de dibujar: con un plano grande la pestaña
// queda congelada largo rato. Por peso se eligen sus opciones de apertura:
// - progressiveRendering: convierte por tandas cediendo el control (la pestaña responde y
//   el plano aparece por partes);
// - minimumChunkSize: tamaño de cada tanda (más chica en planos grandes);
// - timeout: espera del lector DWG (en su worker) antes de abandonar.
export const LIMITES_MB = {mediano: 5, grande: 30};

export function perfilPorPeso(bytes) {
  const mb = (bytes || 0) / 1048576;
  return mb >= LIMITES_MB.grande ? "grande" : mb >= LIMITES_MB.mediano ? "mediano" : "chico";
}

const OPCIONES = {
  chico: {},
  mediano: {progressiveRendering: true, minimumChunkSize: 1000, timeout: 240000},
  grande: {progressiveRendering: true, minimumChunkSize: 300, timeout: 900000},
};

// Opciones de apertura para un plano de `bytes`. En los grandes mandan las de rendimiento;
// en los demás, las que pidió quien abre.
export function opcionesPorPeso(bytes, pedidas = {}) {
  const perfil = perfilPorPeso(bytes);
  const propias = OPCIONES[perfil];
  return {perfil, mb: +((bytes || 0) / 1048576).toFixed(1), opciones: perfil === "grande" ? {...pedidas, ...propias} : {...propias, ...pedidas}};
}

const MARCA_APERTURA = Symbol.for("novacad.aperturaPorPeso");

// claseGestor: AcApDocManager. alAbrir({nombre, mb, perfil}) avisa a la aplicación antes de abrir.
export function instalarAperturaPorPeso(claseGestor, alAbrir = () => {}, pesoDeUrl = pesoPorHead) {
  const proto = claseGestor?.prototype;
  if (!proto || proto[MARCA_APERTURA]) return false;
  const abrirDocumento = proto.openDocument, abrirUrl = proto.openUrl;
  if (typeof abrirDocumento === "function") {
    proto.openDocument = function (nombre, contenido, opciones, vista) {
      const r = opcionesPorPeso(contenido?.byteLength ?? 0, opciones ?? {});
      try { alAbrir({nombre, mb: r.mb, perfil: r.perfil}); } catch { /* el aviso no impide abrir */ }
      return abrirDocumento.call(this, nombre, contenido, r.opciones, vista);
    };
  }
  if (typeof abrirUrl === "function") {
    proto.openUrl = async function (url, opciones) {
      const r = opcionesPorPeso(await pesoDeUrl(url), opciones ?? {});
      try { alAbrir({nombre: nombreDeUrl(url), mb: r.mb, perfil: r.perfil}); } catch { /* idem */ }
      return abrirUrl.call(this, url, r.opciones);
    };
  }
  Object.defineProperty(proto, MARCA_APERTURA, {value: true});
  return true;
}

function nombreDeUrl(url) {
  let ruta = String(url);
  try { ruta = new URL(ruta, "http://local/").pathname; } catch { ruta = ruta.split(/[?#]/)[0]; }
  return decodeURIComponent(ruta.split("/").filter(Boolean).at(-1) ?? ruta);
}

async function pesoPorHead(url) {
  try {
    const r = await fetch(url, {method: "HEAD"});
    return Number(r.headers.get("content-length")) || 0;
  } catch { return 0; }
}

// Instala la capa en cuanto el visor crea su vista. getDocManager: () => AcApDocManager.instance.
export function instalarRobustezVisor(getDocManager, {intentos = 400, intervalo = 50} = {}) {
  let n = 0;
  const probar = () => {
    let vista = null;
    try { const m = getDocManager(); vista = m?.curView ?? m?.mainView ?? null; } catch { /* aún no existe */ }
    if (vista) { blindarPrototipoVista(Object.getPrototypeOf(vista)); return; }
    if (++n < intentos) setTimeout(probar, intervalo);
  };
  probar();
}
