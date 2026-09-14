/**
 * Cadena de cotas entre líneas de grilla, al estilo de ETABS.
 *
 * POR QUÉ EXISTE
 *   Las burbujas con el NOMBRE de cada eje ya las dibuja `drawGridBubble` en
 *   renderer.js. Lo que faltaba para que la planta se lea como la de ETABS es
 *   la acotación: la distancia entre ejes contiguos, rotulada "7.13 (m)".
 *
 *   Va en archivo aparte porque renderer.js ya pasa las 4900 líneas y esto es
 *   autocontenido: recibe las líneas ya filtradas y la función de proyección,
 *   y solo dibuja. No conoce el modelo ni el estado de la app.
 *
 * CONVENCIÓN
 *   - Ejes VERTICALES  (x1 === x2): se acotan en horizontal, ARRIBA del dibujo.
 *   - Ejes HORIZONTALES (y1 === y2): se acotan en vertical, a la IZQUIERDA.
 *   Igual que la planta de ETABS.
 */

const TOL = 1e-6;        // m: dos ejes más cerca que esto son el mismo
const HOLGURA = 34;      // px libres entre el dibujo y la cadena (burbuja r=10)
const GARRA = 4;         // px: media longitud del tick en cada extremo
const PROLONGA = 6;      // px que la línea auxiliar se pasa de la cadena

function unicos(valores) {
  const orden = [...valores].sort((a, b) => a - b);
  return orden.filter((v, i) => i === 0 || Math.abs(v - orden[i - 1]) > TOL);
}

function texto(ctx, s, x, y, color) {
  ctx.fillStyle = color;
  ctx.font = "10px 'Segoe UI', Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(s, x, y);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} lines  líneas de grilla en coordenadas de MUNDO {x1,y1,x2,y2,visible}
 * @param {{worldToScreen:(p:{x:number,y:number})=>{x:number,y:number}}} grid
 * @param {{color?:string, decimales?:number}} [opts]
 * @returns {Map<string,{x:number,y:number}>} ancla de burbuja por id de eje.
 *   El nombre del eje se dibuja EN el vértice de la cadena (como ETABS), no en
 *   la punta de la línea de grilla, donde se perdía entre el modelo.
 */
export function drawGridDimensionChains(ctx, lines, grid, opts = {}) {
  const anclas = new Map();
  const visibles = (lines || []).filter((l) => l && l.visible !== false);
  if (visibles.length < 2) return anclas;

  const color = opts.color || "#94a3b8";
  const dec = opts.decimales ?? 2;

  const verticales = visibles.filter((l) => Math.abs(l.x1 - l.x2) <= TOL);
  const horizontales = visibles.filter((l) => Math.abs(l.y1 - l.y2) <= TOL);

  // Extremos del dibujo en pantalla, para saber dónde apoyar cada cadena.
  const pts = visibles.flatMap((l) => [
    grid.worldToScreen({ x: l.x1, y: l.y1 }),
    grid.worldToScreen({ x: l.x2, y: l.y2 }),
  ]);
  const top = Math.min(...pts.map((p) => p.y));
  const left = Math.min(...pts.map((p) => p.x));

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.8;
  ctx.setLineDash([]);

  // --- ejes verticales -> cadena HORIZONTAL arriba ---
  const xs = unicos(verticales.map((l) => l.x1));
  if (xs.length >= 2) {
    const yCad = top - HOLGURA;
    const yTope = verticales.length
      ? Math.min(
          ...verticales.map((l) =>
            Math.min(
              grid.worldToScreen({ x: l.x1, y: l.y1 }).y,
              grid.worldToScreen({ x: l.x2, y: l.y2 }).y
            )
          )
        )
      : top;

    for (const x of xs) {
      const sx = grid.worldToScreen({ x, y: 0 }).x;
      ctx.beginPath();                       // auxiliar: del dibujo a la cadena
      ctx.moveTo(sx, yTope);
      ctx.lineTo(sx, yCad - PROLONGA);
      ctx.stroke();
      for (const l of verticales) {
        if (Math.abs(l.x1 - x) <= TOL) anclas.set(String(l.id), { x: sx, y: yCad - PROLONGA - 11 });
      }
    }
    for (let i = 1; i < xs.length; i++) {
      const a = grid.worldToScreen({ x: xs[i - 1], y: 0 }).x;
      const b = grid.worldToScreen({ x: xs[i], y: 0 }).x;
      ctx.beginPath();
      ctx.moveTo(a, yCad);
      ctx.lineTo(b, yCad);
      ctx.moveTo(a, yCad - GARRA); ctx.lineTo(a, yCad + GARRA);
      ctx.moveTo(b, yCad - GARRA); ctx.lineTo(b, yCad + GARRA);
      ctx.stroke();
      texto(ctx, `${(xs[i] - xs[i - 1]).toFixed(dec)} (m)`, (a + b) / 2, yCad - 3, color);
    }
  }

  // --- ejes horizontales -> cadena VERTICAL a la izquierda ---
  const ys = unicos(horizontales.map((l) => l.y1));
  if (ys.length >= 2) {
    const xCad = left - HOLGURA;
    const xTope = horizontales.length
      ? Math.min(
          ...horizontales.map((l) =>
            Math.min(
              grid.worldToScreen({ x: l.x1, y: l.y1 }).x,
              grid.worldToScreen({ x: l.x2, y: l.y2 }).x
            )
          )
        )
      : left;

    for (const y of ys) {
      const sy = grid.worldToScreen({ x: 0, y }).y;
      ctx.beginPath();
      ctx.moveTo(xTope, sy);
      ctx.lineTo(xCad - PROLONGA, sy);
      ctx.stroke();
      for (const l of horizontales) {
        if (Math.abs(l.y1 - y) <= TOL) anclas.set(String(l.id), { x: xCad - PROLONGA - 11, y: sy });
      }
    }
    for (let i = 1; i < ys.length; i++) {
      const a = grid.worldToScreen({ x: 0, y: ys[i - 1] }).y;
      const b = grid.worldToScreen({ x: 0, y: ys[i] }).y;
      ctx.beginPath();
      ctx.moveTo(xCad, a);
      ctx.lineTo(xCad, b);
      ctx.moveTo(xCad - GARRA, a); ctx.lineTo(xCad + GARRA, a);
      ctx.moveTo(xCad - GARRA, b); ctx.lineTo(xCad + GARRA, b);
      ctx.stroke();
      // Rotado 90°, como ETABS: se lee de abajo hacia arriba.
      ctx.save();
      ctx.translate(xCad - 3, (a + b) / 2);
      ctx.rotate(-Math.PI / 2);
      texto(ctx, `${Math.abs(ys[i] - ys[i - 1]).toFixed(dec)} (m)`, 0, 0, color);
      ctx.restore();
    }
  }

  ctx.restore();
  return anclas;
}
