// Exporta inventarios documentados; nunca deduce papel, cargas ni cantidades nuevas.
import {existsSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {CASOS} from '../../resources/js/ingenieria/aprendizaje/casosAprendidos.js';
import {PLANOS} from './planos.mjs';
import {paresDelManifiesto} from './pares-entrenamiento.mjs';
import {leerCache} from './volcar-planos.mjs';
import {PERFILES_LAMINAS as ANTERIORES} from '../../resources/js/ingenieria/aprendizaje/perfilesLaminasAprendidos.js';

const base = new URL('../../docs/agentes/agente-predim/conocimiento/expedientes/', import.meta.url);
const docs = readdirSync(base).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(new URL(f, base), 'utf8')));
const manifiesto = join(PLANOS, 'estructuras', 'pares.json');
const pares = process.argv.includes('--desde-cache') && existsSync(manifiesto)
  ? paresDelManifiesto(join(PLANOS, 'estructuras'), JSON.parse(readFileSync(manifiesto, 'utf8')), existsSync) : [];
// Tipo de contenido de un título de lámina (las mismas familias que reparte componerPaquete.js).
function tipoDeContenido(t) {
  if (/CIMIENTO\s+CORRIDO/i.test(t)) return 'cimiento';
  if (/CIMENTACI|PLATEA|ZAPATA/i.test(t)) return 'cimentacion';
  if (/TABIQUER/i.test(t)) return 'tabiqueria';
  if (/LOSA|ALIGERAD/i.test(t)) return /TECHO/i.test(t) ? 'losaTecho' : 'losa';
  if (/P[OÓ]RTICO/i.test(t)) return 'portico';
  if (/ESCALERA/i.test(t)) return 'escalera';
  if (/CUADRO\s+DE\s+COLUMNETA/i.test(t)) return 'cuadroColumnetas';
  if (/CUADRO\s+DE\s+COLUMNA/i.test(t)) return 'cuadroColumnas';
  return null;
}
function inventarioActual(caso) {
  const par = pares.find((p) => p.grupo === caso.grupo && p.id === caso.id);
  const cache = par ? leerCache(par.rutaEstructura) : null;
  if (!cache) return null;
  const textos = cache.items.filter((it) => it.tipo === 'texto' && it.texto);
  const radios = cache.items.filter((it) => it.tipo === 'circulo' && /eje/i.test(it.capa) && it.radio > 0).map((it) => it.radio).sort((a, b) => a - b);
  const radio = radios[Math.floor(radios.length / 2)] ?? 0;
  const unidad = radio >= 40 ? 1000 : radio >= 4 ? 100 : 1;
  const codigos = textos.filter((it) => /^E\s*-\s*\d{1,3}$/i.test(it.texto.trim()));
  const laminas = [...new Set(codigos.map((it) => it.texto.trim().replace(/\s+/g, '').toUpperCase()))].sort((a, b) => a.localeCompare(b, 'es', {numeric: true}));
  const rectangulos = cache.items.filter((it) => it.tipo === 'poli' && it.puntos?.length >= 4 && it.puntos.length <= 5).map((it) => {
    const x = it.puntos.map((p) => p.x), y = it.puntos.map((p) => p.y);
    const m = {x0: Math.min(...x), y0: Math.min(...y), x1: Math.max(...x), y1: Math.max(...y)};
    return it.puntos.every((p) => [m.x0, m.x1].includes(p.x) && [m.y0, m.y1].includes(p.y)) ? m : null;
  }).filter((m) => m && m.x1 - m.x0 >= 10 && m.y1 - m.y0 >= 10);
  const marcos = [];
  for (const c of codigos) {
    if (!c.centro) continue;
    const r = rectangulos.filter((m) => c.centro.x >= m.x0 && c.centro.x <= m.x1 && c.centro.y >= m.y0 && c.centro.y <= m.y1)
      .sort((a, b) => (a.x1 - a.x0) * (a.y1 - a.y0) - (b.x1 - b.x0) * (b.y1 - b.y0))[0];
    if (r) marcos.push({lamina: c.texto.trim(), ancho: Math.round((r.x1 - r.x0) / unidad * 1000) / 1000, alto: Math.round((r.y1 - r.y0) / unidad * 1000) / 1000, unidades: 'metros de dibujo', revision: 'marco candidato; confirmar formato físico'});
  }
  // Reparto: qué tipo de contenido puso el ingeniero en cada lámina (por los títulos que caen
  // dentro de su marco), en el orden de sus códigos. Sirve para repartir un proyecto nuevo.
  const reparto = [];
  const vistos = new Set();
  for (const c of codigos) {
    if (!c.centro) continue;
    const r = rectangulos.filter((m) => c.centro.x >= m.x0 && c.centro.x <= m.x1 && c.centro.y >= m.y0 && c.centro.y <= m.y1)
      .sort((a, b) => (a.x1 - a.x0) * (a.y1 - a.y0) - (b.x1 - b.x0) * (b.y1 - b.y0))[0];
    if (!r || vistos.has(r)) continue;
    vistos.add(r);
    const contenido = [...new Set(textos.filter((t) => t.centro && t.centro.x >= r.x0 && t.centro.x <= r.x1 && t.centro.y >= r.y0 && t.centro.y <= r.y1 && t.texto.length < 90
      && /^(.*-\s*)?(PLANO|CUADRO|DETALLE)\b/i.test(t.texto.trim())).map((t) => tipoDeContenido(t.texto)).filter(Boolean))].sort();
    if (contenido.some((k) => !/^cuadro/.test(k))) reparto.push({lamina: c.texto.trim().replace(/\s+/g, '').toUpperCase(), x: r.x0, contenido});
  }
  reparto.sort((a, b) => Number(/\d+/.exec(a.lamina)) - Number(/\d+/.exec(b.lamina)) || a.x - b.x);
  return {laminas, reparto: reparto.map(({lamina, contenido}) => ({lamina, contenido})), marcos: [...new Map(marcos.map((m) => [m.lamina, m])).values()],
    titulos: [...new Set(textos.map((it) => it.texto.trim()).filter((t) => /^PLANO\s+(DE\s+)?/i.test(t) && t.length < 100))],
    detalles: [...new Set(textos.map((it) => it.texto.trim()).filter((t) => /^DETALLE\b/i.test(t) && t.length < 100))]};
}
const perfiles = CASOS.map((caso) => {
  const d = docs.find((d) => d.nombre === caso.id && String(d.expediente).toLowerCase().includes(caso.grupo.toLowerCase()));
  const actual = inventarioActual(caso);
  const anterior = ANTERIORES.find((p) => p.nombre === caso.nombre);
  return {nombre: caso.nombre, grupo: caso.grupo, serie: [...new Set(CASOS.map((c) => c.grupo))].indexOf(caso.grupo) + 1, id: caso.id, laminas: d?.planos?.laminas ?? actual?.laminas ?? anterior?.laminas ?? null,
    titulos: d?.planos?.titulos ?? actual?.titulos ?? anterior?.titulos ?? [], detalles: d?.planos?.detalles ?? actual?.detalles ?? anterior?.detalles ?? [], cortes: d?.planos?.cortes ?? anterior?.cortes ?? [],
    marcos: actual?.marcos ?? anterior?.marcos ?? [], reparto: actual?.reparto ?? anterior?.reparto ?? [], formato: null, cargas: null, inventarioDocumentado: Boolean(d || actual || anterior?.inventarioDocumentado), fuente: actual ? 'inventario CAD local' : anterior?.fuente ?? (d ? 'expediente documentado' : 'caso geométrico sin inventario de láminas')};
});
const output = new URL('../../resources/js/ingenieria/aprendizaje/perfilesLaminasAprendidos.js', import.meta.url);
writeFileSync(output, '// Generado por scripts/agente/exportar-perfiles-laminas.mjs. No editar a mano.\nexport const PERFILES_LAMINAS = '+JSON.stringify(perfiles, null, 1)+';\n');
console.log(`${perfiles.length} perfiles; ${perfiles.filter((p) => p.inventarioDocumentado).length} inventarios de láminas documentados. ${fileURLToPath(output)}`);
