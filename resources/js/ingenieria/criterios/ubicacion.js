// Ubicación del proyecto → zona sísmica (E.030, anexo de zonificación por distrito), y uso →
// categoría de la edificación. Sin IA: tabla del repositorio (resources/data/ubigeo.js, la misma
// del espectro sísmico) y reglas del uso. Si el texto es ambiguo o contradictorio (un distrito que
// no está en el departamento nombrado), NO se elige: se devuelven las opciones para preguntar.

const sinTildes = (t) => String(t ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
const palabras = (t) => ` ${sinTildes(t).replace(/[^A-Z0-9Ñ ]+/g, " ").replace(/\s+/g, " ").trim()} `;

let tabla = null;
export async function cargarUbigeo() {
  tabla ??= (await import("../../../data/ubigeo.js")).default;
  return tabla;
}

// Candidatos de distrito nombrados en el texto, con su departamento, provincia y zona.
// ubigeo: la tabla (para pruebas); si no se pasa, se carga.
export async function buscarUbicacion(texto, ubigeo = null) {
  const datos = ubigeo ?? await cargarUbigeo();
  const t = palabras(texto);
  const nombra = (n) => n.length >= 4 && t.includes(` ${sinTildes(n)} `);
  const departamentos = datos.filter((d) => nombra(d.name)).map((d) => d.name);
  const provincias = datos.flatMap((d) => d.provinces.filter((p) => nombra(p.name)).map((p) => `${d.name}/${p.name}`));
  const candidatos = [];
  for (const d of datos) for (const p of d.provinces) for (const x of p.districts) {
    if (!nombra(x.name)) continue;
    // Un distrito que se llama igual que su provincia o departamento ("HUANUCO") solo cuenta
    // como distrito si no hay otro distrito nombrado (si no, es la región que se mencionó).
    candidatos.push({departamento: d.name, provincia: p.name, distrito: x.name, zona: Number(x.zone), Z: Number(x.zFactor),
      comoRegion: x.name === d.name || x.name === p.name});
  }
  const propios = candidatos.filter((c) => !c.comoRegion);
  let lista = propios.length ? propios : candidatos;
  // Con departamento o provincia nombrados, se prefieren los distritos que están ahí.
  const enRegion = lista.filter((c) => departamentos.includes(c.departamento) || provincias.includes(`${c.departamento}/${c.provincia}`));
  const contradice = departamentos.length > 0 && lista.length > 0 && !enRegion.length;
  if (enRegion.length) lista = enRegion;
  // Contradicción: el distrito nombrado no está en el departamento nombrado → se ofrecen ambos.
  if (contradice) lista = [...lista, ...candidatos.filter((c) => c.comoRegion && departamentos.includes(c.departamento))];
  const unicos = [...new Map(lista.map((c) => [`${c.departamento}/${c.provincia}/${c.distrito}`, c])).values()];
  return {
    candidatos: unicos.slice(0, 4),
    unico: unicos.length === 1 && !contradice ? unicos[0] : null,
    contradice,
    departamentos,
  };
}

// Texto corto de un candidato, para botones y mensajes.
export const textoUbicacion = (c) => `${c.distrito[0]}${c.distrito.slice(1).toLowerCase()} (${c.departamento[0]}${c.departamento.slice(1).toLowerCase()} / ${c.provincia[0]}${c.provincia.slice(1).toLowerCase()}) — zona ${c.zona}, Z=${c.Z}`;

// Categoría E.030 por el uso que anota la arquitectura (ambientes). Es una propuesta: el
// ingeniero la confirma. null si no hay pistas.
const USOS = [
  {re: /\bAULA|\bSUM\b|INICIAL|PRIMARIA|SECUNDARIA|COLEGIO|ESCUELA|I\s?\.?\s?E\b|INSTITUCION EDUCATIVA|LABORATORIO|BIBLIOTECA|DIRECCION\b|PSICOMOTRICIDAD/, categoria: "A2", uso: "educativo (colegio)"},
  {re: /HOSPITAL|POSTA|CENTRO DE SALUD|TOPICO|CONSULTORIO|EMERGENCIA|OBSTETRICIA/, categoria: "A2", uso: "salud"},
  {re: /COMISARIA|BOMBEROS/, categoria: "A2", uso: "seguridad"},
  {re: /AUDITORIO|COLISEO|IGLESIA|TEMPLO|MERCADO|TRIBUNA|ESTADIO|CINE|TEATRO|MUSEO/, categoria: "B", uso: "reunión de personas"},
  {re: /DORMITORIO|SALA COMEDOR|COCINA|LAVANDERIA|VIVIENDA/, categoria: "C", uso: "vivienda"},
  {re: /OFICINA|ALMACEN|DEPOSITO/, categoria: "C", uso: "oficinas o depósito"},
];
export function categoriaPorUso(textos = []) {
  const todo = palabras(textos.join(" "));
  const votos = USOS.map((u) => ({...u, n: (todo.match(new RegExp(u.re.source, "g")) ?? []).length})).filter((u) => u.n > 0);
  if (!votos.length) return null;
  // La categoría más exigente con evidencia manda (un colegio con cocina sigue siendo A2).
  const orden = {A2: 0, B: 1, C: 2};
  const elegido = votos.sort((a, b) => orden[a.categoria] - orden[b.categoria] || b.n - a.n)[0];
  return {categoria: elegido.categoria, porque: `la arquitectura es de uso ${elegido.uso} (${elegido.n} rótulo(s) de ambientes)`};
}

// Datos del proyecto dichos en un mensaje ("hz es de 0.6, mi df es 2.50, zona 3, suelo S2,
// categoría A2, en Vinchos"): sin IA. Solo lo que está escrito; nada se adivina.
export function datosDelTexto(texto) {
  const t = sinTildes(texto).toLowerCase();
  const num = (re) => { const m = re.exec(t); return m ? m[1].replace(",", ".") : undefined; };
  const out = {};
  const hz = num(/\bhz\b[^0-9]{0,18}(\d+(?:[.,]\d+)?)/);
  const df = num(/\bdf\b[^0-9]{0,18}(\d+(?:[.,]\d+)?)/);
  const zona = num(/\bzona\b(?:\s+sismica)?[^0-9a-z]{0,6}(?:es\s+|de\s+|la\s+)?([1-4])\b/);
  const suelo = /\b(?:suelo|perfil)\b[^a-z0-9]{0,12}(?:es\s+|de\s+|tipo\s+)?(s[0-3])\b/.exec(t)?.[1];
  const categoria = /\bcategoria\b[^a-z0-9]{0,8}(?:es\s+|de\s+)?(a1|a2|b|c)\b/.exec(t)?.[1];
  if (hz) out.hz = hz;
  if (df) out.df = df;
  if (zona) out.zona = zona;
  if (suelo) out.suelo = suelo.toUpperCase();
  if (categoria) out.categoria = categoria.toUpperCase();
  // Ubicación: "ubicados en…", "localidad de…", "distrito de…", "en <lugar>".
  if (/\b(ubicad[oa]s?|ubicacion|localidad|distrito|provincia|departamento|region)\b/.test(t)) out.ubicacion = String(texto).slice(0, 200);
  return out;
}
