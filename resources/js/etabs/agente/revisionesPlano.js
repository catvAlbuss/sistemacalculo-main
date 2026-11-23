// La cola del despacho se consulta únicamente mientras hay un archivo CAD abierto.
// Las respuestas de un documento anterior no deben restaurar una cola ya cerrada.
export function crearRevisionDePlano({estado, cargar, resolver}) {
  let database = null, nombre = '', version = 0, solicitud = 0;
  const limpiar = () => Object.assign(estado, {activa: false, cargando: false, error: '', eventos: [], revisando: {}, errores: {}, sinPermiso: false});
  limpiar();

  async function cargarPendientes() {
    if (!estado.activa) return;
    const actual = version, peticion = ++solicitud;
    estado.cargando = true;
    estado.error = '';
    try {
      const resultado = await cargar();
      if (actual !== version || peticion !== solicitud) return;
      if (resultado.ok) {
        estado.sinPermiso = Boolean(resultado.sinPermiso);
        estado.eventos = estado.sinPermiso ? [] : resultado.eventos;
        estado.errores = {};
      } else estado.error = resultado.error;
    } catch {
      if (actual === version && peticion === solicitud) estado.error = 'No se pudo cargar la cola de revisión. Inténtalo de nuevo.';
    } finally {
      if (actual === version && peticion === solicitud) estado.cargando = false;
    }
  }

  function activar(doc) {
    const archivo = doc?.fileName || doc?.uri || '';
    const db = archivo ? doc?.database : null;
    if (db && database === db && nombre === archivo) return Promise.resolve();
    version++;
    database = db ?? null;
    nombre = archivo;
    limpiar();
    if (!database) return Promise.resolve();
    estado.activa = true;
    return cargarPendientes();
  }

  async function revisarEvento(id, accion) {
    if (!estado.activa || estado.sinPermiso || estado.revisando[id] || !estado.eventos.some((e) => e.evento_id === id)) return;
    const actual = version;
    estado.revisando[id] = true;
    delete estado.errores[id];
    try {
      const resultado = await resolver(id, accion);
      if (actual !== version) return;
      if (resultado.ok) {
        estado.eventos = estado.eventos.filter((e) => e.evento_id !== id);
        await cargarPendientes();
      } else estado.errores[id] = resultado.error;
    } catch {
      if (actual === version) estado.errores[id] = 'No se pudo revisar la corrección. Inténtalo de nuevo.';
    } finally {
      if (actual === version) estado.revisando[id] = false;
    }
  }

  return {activar, cargarPendientes, revisarEvento};
}
