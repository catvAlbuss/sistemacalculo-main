// Recetas de dibujo aprendidas de los planos del ingeniero (aprender-recetas.mjs). Cada valor
// tiene un respaldo por defecto: si un proyecto no trae ejemplos, se dibuja como antes.
import {RECETAS} from "./recetasAprendidas.js";

// Valor aprendido en un rango razonable (un dato raro no rompe el dibujo); si no, el respaldo.
export function receta(ruta, respaldo, [min, max] = [-Infinity, Infinity]) {
  const v = ruta.split(".").reduce((o, k) => o?.[k], RECETAS);
  return typeof v === "number" && v >= min && v <= max ? v : respaldo;
}
