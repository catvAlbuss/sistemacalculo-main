// Recuperación del plano de trabajo. El visor guarda el dibujo solo en la memoria de
// la pestaña: si el navegador la descarta por estar en segundo plano (Ahorro de memoria
// de Chrome/Edge), si el usuario va a otra página del sistema y vuelve, o si se pierde
// el contexto gráfico, el plano (con las láminas del agente) desaparece.
//
// Aquí se guarda una copia DXF del documento abierto en IndexedDB de este navegador:
// al ocultarse la pestaña, al salir de la página y cada cierto tiempo si cambió. Al
// volver, el visor ofrece reabrirla. Nada sale del navegador del usuario.

const BASE = "novacad";
const ALMACEN = "recuperacion";
const CLAVE = "ultimo";

// Almacén clave/valor sobre IndexedDB (una sola entrada: el último plano).
export function almacenIndexedDb(idb = globalThis.indexedDB) {
  if (!idb) return null;
  const abrir = () => new Promise((resolve, reject) => {
    const pedido = idb.open(BASE, 1);
    pedido.onupgradeneeded = () => pedido.result.createObjectStore(ALMACEN);
    pedido.onsuccess = () => resolve(pedido.result);
    pedido.onerror = () => reject(pedido.error);
  });
  const operar = async (modo, accion) => {
    const db = await abrir();
    try {
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(ALMACEN, modo);
        const pedido = accion(tx.objectStore(ALMACEN));
        tx.oncomplete = () => resolve(pedido?.result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
    } finally { db.close(); }
  };
  return {
    leer: () => operar("readonly", (s) => s.get(CLAVE)),
    escribir: (valor) => operar("readwrite", (s) => s.put(valor, CLAVE)),
    borrar: () => operar("readwrite", (s) => s.delete(CLAVE)),
  };
}

// Firma barata del dibujo para saber si cambió desde la última copia.
const firmaDe = (database) => {
  try {
    const ms = database.tables.blockTable.modelSpace.newIterator().toArray();
    return `${ms.length}:${ms.at(-1)?.objectId ?? ""}`;
  } catch { return ""; }
};

// getDocument(): {database, nombre} del documento abierto, o null.
export function crearRecuperacion({getDocument, almacen = almacenIndexedDb(), ahora = () => new Date()}) {
  let ultimaFirma = null, guardando = null;
  return {
    disponible: Boolean(almacen),
    // Guarda si hay un plano con contenido y cambió desde la última copia.
    async guardar({forzar = false} = {}) {
      if (!almacen || guardando) return guardando ?? false;
      const doc = getDocument();
      if (!doc?.database) return false;
      const firma = firmaDe(doc.database);
      if (!firma || firma.startsWith("0:") || (!forzar && firma === ultimaFirma)) return false;
      guardando = (async () => {
        try {
          const dxf = doc.database.dxfOut(undefined, 6);
          const texto = typeof dxf === "string" ? dxf : new TextDecoder().decode(dxf);
          await almacen.escribir({nombre: doc.nombre || "plano", guardado: ahora().toISOString(), dxf: texto, entidades: Number(firma.split(":")[0])});
          ultimaFirma = firma;
          return true;
        } catch (error) {
          console.warn("NovaCad: no se pudo guardar la copia de recuperación", error);
          return false;
        } finally { guardando = null; }
      })();
      return guardando;
    },
    async leer() {
      if (!almacen) return null;
      try { return (await almacen.leer()) ?? null; } catch { return null; }
    },
    async descartar() {
      ultimaFirma = null;
      if (almacen) try { await almacen.borrar(); } catch { /* nada que borrar */ }
    },
    // Archivo DXF listo para abrir en el visor.
    archivo(copia) {
      const base = String(copia.nombre || "plano").replace(/\.(dwg|dxf)$/i, "").replace(/\s*\(recuperado\)$/i, "");
      return new File([copia.dxf], `${base} (recuperado).dxf`, {type: "application/dxf"});
    },
  };
}

// Texto del aviso: "MODULO 14.dwg, guardado hoy a las 10:32".
export function describirCopia(copia, ahora = new Date()) {
  const fecha = new Date(copia.guardado);
  const hora = fecha.toLocaleTimeString("es-PE", {hour: "2-digit", minute: "2-digit"});
  const mismoDia = fecha.toDateString() === ahora.toDateString();
  return `${copia.nombre}, guardado ${mismoDia ? "hoy" : `el ${fecha.toLocaleDateString("es-PE")}`} a las ${hora}`;
}
