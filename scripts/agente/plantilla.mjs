// Plantilla de láminas para los scripts de entrenamiento y medición: la misma que usa el panel.
// La plantilla fija del módulo 14 se retiró (public/assets/plantillas): las láminas se componen
// en modo adaptativo con el formato aprendido del despacho (referenciasProyecto.js).
export const PLANTILLA_ADAPTATIVA = Object.freeze({db: null, config: Object.freeze({modo: 'adaptativa', escalaPlanos: 1})});
export const cargarPlantillaAdaptativa = async () => ({db: null, config: {modo: 'adaptativa', escalaPlanos: 1}});

// Detalles estándar del despacho publicados (los mismos que el panel pide a /biblioteca/estandar).
// AGENTE_SIN_ESTANDAR=1: sin ellos (para medir el dibujo solo con lo generado).
import {readFileSync as leerArchivo, existsSync as existeArchivo} from 'node:fs';
export const RUTA_ESTANDAR = 'storage/app/private/agente/biblioteca-publicable/estandar.json';
export function cargarDetallesEstandar() {
  if (process.env.AGENTE_SIN_ESTANDAR || !existeArchivo(RUTA_ESTANDAR)) return null;
  try { return JSON.parse(leerArchivo(RUTA_ESTANDAR, 'utf8')).piezas ?? null; } catch { return null; }
}

// Cortes de cimiento del despacho publicados (los que el panel pide a /biblioteca/corte_cimiento).
export const RUTA_CORTES = 'storage/app/private/agente/biblioteca-publicable/corte_cimiento.json';
export function cargarCortesDespacho() {
  if (process.env.AGENTE_SIN_ESTANDAR || !existeArchivo(RUTA_CORTES)) return null;
  try { const piezas = JSON.parse(leerArchivo(RUTA_CORTES, 'utf8')).piezas ?? []; return piezas.length ? {piezas} : null; } catch { return null; }
}
