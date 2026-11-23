import {datosTecnicos} from '../criterios/datosProyecto.js';

const normalizar = (texto) => String(texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// Estas capacidades no existen en el generador: cambiar de modelo no las añade.
export function limitacionDelPedido(texto, history = [], memoria = {}) {
  const despiece = /\b(barras? superiores?|planilla de acero|longitudes? de (?:las? )?barras?)\b/;
  const actual = normalizar(texto);
  const seguimiento = /^(si\b|adelante\b|hazlo\b|rehazlo\b|necesito (eso|ello)\b)/.test(actual);
  const ultimo = history.findLast((m) => m.role === 'user');
  const anterior = memoria.pedidoNoImplementado || (despiece.test(normalizar(ultimo?.content)) ? ultimo.content : null);
  if (!despiece.test(actual) && !(seguimiento && anterior)) {
    delete memoria.pedidoNoImplementado;
    return null;
  }
  memoria.pedidoNoImplementado = despiece.test(actual) ? texto : anterior;
  return 'El generador no implementa el despiece de barras superiores con longitudes de corte, anclajes y traslapes. No modifiqué ni borré las láminas. Este pedido requiere implementar ese detalle y verificarlo con el diseño estructural; regenerar el mismo plano o cambiar de modelo no lo añade.';
}

export function datosTecnicosFaltantes(datos) {
  const t = datosTecnicos(datos);
  return ['hz', 'df', 'zona', 'suelo', 'categoria'].filter((k) => t[k] === null);
}

export function firmaDeGeneracion(entradas) {
  const ordenar = (v) => Array.isArray(v) ? v.map(ordenar) : v && typeof v === 'object'
    ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, ordenar(v[k])])) : v;
  return JSON.stringify(ordenar(entradas));
}
