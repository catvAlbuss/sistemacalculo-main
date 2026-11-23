import {PERFILES_LAMINAS} from '../aprendizaje/perfilesLaminasAprendidos.js';

const normalizar = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const romanos = {i: 1, v: 5, x: 10, l: 50, c: 100, d: 500, m: 1000};
export function numeroModulo(texto) {
  const limpio = String(texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const m = /\bmodulo[\s._-]*(\d{1,3}|[ivxlcdm]+)\b/i.exec(limpio);
  if (!m) return null;
  if (/^\d+$/.test(m[1])) return Number(m[1]);
  // Algunos rótulos CAD usan una ele minúscula en lugar de I ("lV", "lX").
  // Conservar la caja permite corregirlos sin convertir el número romano LV=55.
  const romano = m[1].replace(/^l(?=[VX]$)/, 'I').toLowerCase();
  return [...romano].reduce((n, c, i, a) => n + (romanos[c] < (romanos[a[i + 1]] ?? 0) ? -romanos[c] : romanos[c]), 0);
}

export function referenciaDelDocumento(nombre, perfiles = PERFILES_LAMINAS, vista = '') {
  const modulo = numeroModulo(vista) ?? numeroModulo(nombre);
  if (!modulo) return {modulo: null, referencia: null, candidatos: [], motivo: 'El documento no identifica un módulo; no se asigna un expediente por defecto.'};
  const t = normalizar(nombre);
  const grupos = [...new Set(perfiles.map((p) => p.grupo))].filter((g) => t.split(/[^a-z0-9]+/).includes(normalizar(g)));
  const candidatos = perfiles.filter((p) => numeroModulo(p.id) === modulo && (!grupos.length || grupos.includes(p.grupo)));
  return {modulo, referencia: candidatos.length === 1 ? candidatos[0] : null, candidatos,
    motivo: candidatos.length === 1 ? 'Coincide la identidad del documento; sus cantidades siguen siendo una referencia histórica.'
      : candidatos.length ? 'Hay más de una serie con ese módulo; confirma la referencia, no asumas una.' : 'No hay inventario de referencia para este módulo.'};
}

export function vistasDelModulo(vistas, identidad) {
  const modulo = numeroModulo(identidad);
  const identificados = new Set(vistas.map((v) => numeroModulo(v.titulo)).filter(Boolean));
  if (!modulo || !identificados.size) return vistas;
  // Si el archivo solo contiene ese módulo, sus plantas pueden tener títulos
  // genéricos (por ejemplo, "PISO DE CEMENTO" en XV); siguen siendo de ese módulo.
  if (identificados.size === 1 && identificados.has(modulo)) return vistas;
  return vistas.filter((v) => numeroModulo(v.titulo) === modulo);
}

export function formatoDeReferencia(referencia) {
  const grupos = new Map();
  for (const m of referencia?.marcos ?? []) {
    if (m.unidades !== 'metros de dibujo') continue;
    const razon = Math.max(m.ancho, m.alto) / Math.min(m.ancho, m.alto);
    if (razon < 1.25 || razon > 1.65) continue;
    const clave = `${m.ancho.toFixed(1)}x${m.alto.toFixed(1)}`;
    const g = grupos.get(clave) ?? {m, n: 0};
    g.n++; grupos.set(clave, g);
  }
  const elegido = [...grupos.values()].sort((a, b) => b.n - a.n)[0];
  if (!elegido || elegido.n < 2) return null;
  return {x0: 0, y0: 0, x1: elegido.m.ancho, y1: elegido.m.alto, origen: 'marco observado en la referencia identificada', referencia: `serie ${referencia.serie}, ${referencia.id}`};
}

export function memoriaParaModulo(memoria, identidad) {
  const actual = numeroModulo(identidad);
  const anterior = memoria?.moduloActivo ?? numeroModulo(memoria?.estructura?.titulo);
  if (anterior && actual && anterior !== actual) return {ultimoPedido: memoria.ultimoPedido, moduloActivo: actual};
  if (actual) memoria.moduloActivo = actual;
  return memoria;
}

export function resumenReferenciasAprendidas() {
  return ['### Variantes de láminas estudiadas (referencias históricas, no requisitos del plano actual)',
    ...PERFILES_LAMINAS.filter((p) => p.inventarioDocumentado).map((p) => `- Serie ${p.serie}, ${p.id}: ${p.laminas.length} láminas en la referencia, ${p.titulos.length} títulos inventariados; ${p.detalles.length} detalles. Marcos candidatos en metros de dibujo: ${[...new Set((p.marcos ?? []).map((m) => `${m.ancho}x${m.alto}`))].slice(0, 3).join(', ') || 'sin medir'}. Papel físico y cargas no confirmados.`),
    '- Un caso parecido no identifica el módulo actual. No copies sus láminas, cantidades, cargas, rótulo o geometría. Confirma identidad y utiliza lo leído en el documento actual.',
  ].join('\n');
}
