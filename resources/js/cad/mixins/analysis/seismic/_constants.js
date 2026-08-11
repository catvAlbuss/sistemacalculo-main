// Constantes de módulo del análisis sísmico (extraídas de seismic.js al partirlo).
export const BACKEND_URL = "/api/backend";
export const USE_MOCK_SEISMIC = false;
// Límites de deriva de entrepiso por sistema estructural (Perú E.030, Tabla 11).
export const DRIFT_LIMITS = {
  concreto: 0.007,
  acero: 0.010,
  albanileria: 0.005,
  madera: 0.010,
};
