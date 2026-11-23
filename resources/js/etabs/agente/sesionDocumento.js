// La identidad incluye la base de datos: dos archivos con el mismo nombre no son
// la misma sesión, ni deben compartir capturas, propuestas, láminas o metrados.
export function crearSesionDeDocumento() {
  let database = null, nombre = '', version = 0;
  return {version: () => version, cambiar(doc) {
    const next = doc?.database ?? null;
    const archivo = doc?.fileName || doc?.docTitle || '';
    if (next === database && archivo === nombre) return false;
    database = next;
    nombre = archivo;
    version++;
    return true;
  }};
}

export function vincularDocumento(doc, obtenerActual) {
  const database = doc?.database;
  return () => {
    if (!database || obtenerActual()?.database !== database) throw new Error('El documento cambió. Vuelve a ejecutar el pedido en el plano actual.');
    return database;
  };
}
