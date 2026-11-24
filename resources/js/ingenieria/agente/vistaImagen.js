// Imagen de una zona del dibujo para que el modelo de IA con visión la MIRE (no solo cuente
// entidades): SVG en blanco y negro con los textos en rojo, a partir de los objetos aplanados
// del plano. El panel la pasa a JPEG (los proveedores no aceptan SVG). Sin dependencias.

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function svgDeCaja(items = [], caja, {ancho = 1600, maxObjetos = 60000} = {}) {
  const {x0, y0, x1, y1} = caja;
  const W = ancho, f = W / Math.max(1e-9, x1 - x0), H = Math.max(1, Math.ceil((y1 - y0) * f));
  const X = (x) => ((x - x0) * f).toFixed(1), Y = (y) => ((y1 - y) * f).toFixed(1);
  const dentro = (p) => p && p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1;
  const lin = [], txt = [];
  let n = 0;
  for (const it of items) {
    if (n >= maxObjetos) break;
    const pts = it.puntos ?? (it.centro ? [it.centro] : []);
    if (!pts.some(dentro)) continue;
    n++;
    if ((it.tipo === "linea" || it.tipo === "poli") && it.puntos?.length) lin.push(`<polyline points="${it.puntos.map((p) => `${X(p.x)},${Y(p.y)}`).join(" ")}${it.cerrada ? ` ${X(it.puntos[0].x)},${Y(it.puntos[0].y)}` : ""}"/>`);
    else if (it.tipo === "circulo") lin.push(`<circle cx="${X(it.centro.x)}" cy="${Y(it.centro.y)}" r="${(it.radio * f).toFixed(1)}"/>`);
    else if (it.tipo === "texto" && it.texto) txt.push(`<text x="${X(it.centro.x)}" y="${Y(it.centro.y)}" font-size="${Math.max(6, (it.alto ?? 0.1) * f).toFixed(1)}" text-anchor="middle">${esc(it.texto)}</text>`);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="100%" height="100%" fill="#fff"/><g fill="none" stroke="#000" stroke-width="0.8">${lin.join("")}</g><g font-family="Arial" fill="#c00">${txt.join("")}</g></svg>`;
  return {svg, ancho: W, alto: H, objetos: n};
}

// Elige qué mirar: una lámina generada por el agente, una vista de la arquitectura o todo.
export function zonaAMirar(ctx, que = "") {
  const q = String(que ?? "").toLowerCase().trim();
  const laminas = (ctx.memoria?.ubicacionesPlanos ?? []).filter((u) => u.caja);
  const {vistas = []} = ctx.readPlan();
  const porTitulo = (lista) => lista.find((v) => q && String(v.titulo ?? "").toLowerCase().includes(q));
  const lamina = porTitulo(laminas) ?? (/l[aá]mina|generad|resultado|estructura/.test(q) || (!q && laminas.length) ? laminas[0] : null);
  if (lamina) return {titulo: lamina.titulo ?? "lámina generada", caja: lamina.caja, origen: "lamina"};
  const numero = Number.parseInt(q, 10);
  const vista = (Number.isInteger(numero) ? vistas[numero - 1] : null) ?? porTitulo(vistas) ?? vistas[0];
  if (vista) return {titulo: vista.titulo || "vista principal", caja: vista.caja, origen: "arquitectura"};
  return null;
}
