// Ningún rótulo encima de otro: los textos fijos (ejes, cotas, niveles, títulos) se
// quedan donde están; los rótulos de elementos (vigas, losas, canaletas, cimiento,
// códigos, acero) que pisan otro texto se corren a la posición libre más cercana.
// Las cajas usan el ancho real de la fuente del visor (rotulo.js → anchoTexto).

import {L} from "./primitives.js";
import {anchoTexto} from "./rotulo.js";

const MOVIBLES = new Set([L.TEXTO, L.TEXTO_LOSA, L.LETRAS, L.VIGAS, L.CIMIENTO, L.CODIGOS, L.VIGUETAS, L.COLUMNAS_ID, L.ESTRIBOS, L.VIGAS_CIM, L.LAMINA, L.PLATEA, L.MUROS_E, L.COBERTURA]);

// Caja (alineada a los ejes) de un texto, con su rotación y sus renglones.
export function cajaTexto(p) {
  const lineas = String(p.value).split("\\P");
  const w = Math.max(...lineas.map((l) => anchoTexto(l, p.h))), hh = p.h * (1 + (lineas.length - 1) * 1.45);
  const a = ((p.rot ?? 0) * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  // Esquinas locales: centrado o apoyado a la izquierda en su base.
  const [x0, x1] = p.align === "izq" ? [0, w] : [-w / 2, w / 2];
  const [y0, y1] = p.align === "izq" ? [0, hh] : [-hh / 2, hh / 2];
  const pts = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y]) => [p.at[0] + x * c - y * s, p.at[1] + x * s + y * c]);
  return {x0: Math.min(...pts.map((q) => q[0])), y0: Math.min(...pts.map((q) => q[1])), x1: Math.max(...pts.map((q) => q[0])), y1: Math.max(...pts.map((q) => q[1]))};
}

const pisa = (a, b, holgura) => a.x0 < b.x1 + holgura && a.x1 > b.x0 - holgura && a.y0 < b.y1 + holgura && a.y1 > b.y0 - holgura;

export function separarTextos(primitivas) {
  const textos = primitivas.filter((p) => p.type === "text" && String(p.value ?? "").trim());
  const fijos = textos.filter((p) => !MOVIBLES.has(p.layer));
  const colocadas = fijos.map(cajaTexto);
  let movidos = 0;
  // Los rótulos más grandes primero (CANALETA, VCUMBRERA) y los chicos se acomodan.
  const movibles = textos.filter((p) => MOVIBLES.has(p.layer)).sort((a, b) => b.h - a.h);
  for (const p of movibles) {
    let caja = cajaTexto(p);
    const holgura = p.h * 0.15;
    if (colocadas.some((c) => pisa(caja, c, holgura))) {
      // Direcciones: perpendicular al texto primero (sube/baja), luego a lo largo y diagonales.
      const a = ((p.rot ?? 0) * Math.PI) / 180, u = [Math.cos(a), Math.sin(a)], n = [-Math.sin(a), Math.cos(a)];
      const dirs = [n, [-n[0], -n[1]], u, [-u[0], -u[1]], [n[0] + u[0], n[1] + u[1]], [n[0] - u[0], n[1] - u[1]], [-n[0] + u[0], -n[1] + u[1]], [-n[0] - u[0], -n[1] - u[1]]];
      let hecho = false;
      for (let k = 1; k <= 12 && !hecho; k++) {
        for (const d of dirs) {
          const paso = p.h * 0.6 * k;
          const at = [p.at[0] + d[0] * paso, p.at[1] + d[1] * paso];
          const prueba = cajaTexto({...p, at});
          if (!colocadas.some((c) => pisa(prueba, c, holgura))) { p.at = [Math.round(at[0] * 10000) / 10000, Math.round(at[1] * 10000) / 10000]; caja = prueba; hecho = true; movidos++; break; }
        }
      }
    }
    colocadas.push(caja);
  }
  return {primitivas, movidos};
}
