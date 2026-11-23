// Plantilla de láminas para los scripts de entrenamiento y medición: la misma que usa el panel.
// La plantilla fija del módulo 14 se retiró (public/assets/plantillas): las láminas se componen
// en modo adaptativo con el formato aprendido del despacho (referenciasProyecto.js).
export const PLANTILLA_ADAPTATIVA = Object.freeze({db: null, config: Object.freeze({modo: 'adaptativa', escalaPlanos: 2})});
export const cargarPlantillaAdaptativa = async () => ({db: null, config: {modo: 'adaptativa', escalaPlanos: 2}});
