// engine/modeloRapido.js — Análisis Estructural "en una frase": «edificio de 3 pisos, 4x3 vanos de 5 m,
// zona 4 suelo S2, vivienda» → modelo completo (ejes, columnas, vigas, losas, cargas E.020, masa y
// espectro E.030, combinaciones E.060) con el MISMO generador .e2k que usa NovaCad
// (ingenieria/analisis/modeloE2k.js). Lo que la frase no dice sale del predimensionamiento usual
// (Blanco Blasco, E.060) y queda en `supuestos`, a la vista del ingeniero.
import {modeloE2k} from "../../ingenieria/analisis/modeloE2k.js";
import {espesorPorLuz} from "../../ingenieria/criterios/criteriosEstructurales.js";

const sinTildes = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const num = (s) => Number(String(s).replace(",", "."));
const r2 = (v) => Math.round(v * 100) / 100;
const arriba = (v, paso) => Math.ceil(v / paso - 1e-9) * paso;
const seccion = (s) => {
  const m = /(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)/.exec(s);
  if (!m) return null;
  const a = num(m[1]), b = num(m[2]);
  const aM = (v) => (v > 3 ? v / 100 : v); // 40x40 (cm) o 0.40x0.40 (m)
  return {b: aM(a), h: aM(b)};
};

// ¿El pedido es armar un modelo nuevo?
export const esPedidoDeModelo = (texto) => {
  const t = sinTildes(texto);
  return /\b(crea|crear|arma|armar|genera|generar|modela|modelar|haz|hazme|construye)\b.*\b(edificio|modelo|portico\w*|estructura|vivienda|casa|bloque|modulo|colegio|escuela|aula\w*|pabellon|hospital|clinica|oficina\w*|hotel|local|mercado|nave|almacen|multifamiliar|departamento\w*)\b/.test(t) && /\d/.test(t);
};

// Lo que dice la frase (lo que no dice queda null).
export function leerPedidoDeModelo(texto) {
  const t = sinTildes(texto);
  const pisos = /(\d+)\s*(pisos?|niveles?|plantas?)\b/.exec(t);
  // Sin las secciones («columnas 40x50», «vigas de 0.30x0.60»): lo que queda con NxM son los vanos.
  const sinSecciones = t.replace(/(columnas?|vigas?)\s*(de\s*)?\d+(?:[.,]\d+)?\s*[x×]\s*\d+(?:[.,]\d+)?\s*(cm|m)?/g, " ");
  const vanos = /(\d+)\s*[x×]\s*(\d+)\s*(vanos|crujias|paños|panos)?/.exec(sinSecciones);
  const vanosX = /(\d+)\s*vanos?\s*(en\s*)?x\b/.exec(t), vanosY = /(\d+)\s*vanos?\s*(en\s*)?y\b/.exec(t);
  const luces = /(?:vanos?|luces?|crujias?)\s*(?:de\s*)?(\d+(?:[.,]\d+)?)\s*(?:m|metros)?(?:\s*(?:y|x|por)\s*(\d+(?:[.,]\d+)?)\s*(?:m|metros)?)?/.exec(t);
  const altura = /(?:altura|entrepiso|alto)\s*(?:de\s*(?:piso\s*)?)?(?:de\s*)?(\d+(?:[.,]\d+)?)\s*m?/.exec(t);
  const zona = /zona\s*(\d)/.exec(t), suelo = /\b(?:suelo|perfil)\s*(s[0-4])\b|\b(s[0-4])\b/.exec(t);
  const columnas = /columnas?\s*(?:de\s*)?(\d+(?:[.,]\d+)?\s*[x×]\s*\d+(?:[.,]\d+)?)/.exec(t);
  const vigas = /vigas?\s*(?:de\s*)?(\d+(?:[.,]\d+)?\s*[x×]\s*\d+(?:[.,]\d+)?)/.exec(t);
  const losa = /losa\s*(?:aligerada\s*)?(?:de\s*)?(?:e\s*=\s*)?(\d+(?:[.,]\d+)?)\s*(cm|m)?/.exec(t);
  const categoria = /\bcategoria\s*(a2|b|c)\b/.exec(t)?.[1]?.toUpperCase()
    ?? (/colegio|escuela|hospital|clinica|posta|centro de salud|comisaria|bomberos/.test(t) ? "A2" : /cine|teatro|estadio|centro comercial|mercado|iglesia|museo|biblioteca/.test(t) ? "B" : /vivienda|casa|oficina|departamento|multifamiliar|hotel/.test(t) ? "C" : null);
  const nx = vanos ? Number(vanos[1]) : vanosX ? Number(vanosX[1]) : null, ny = vanos ? Number(vanos[2]) : vanosY ? Number(vanosY[1]) : null;
  const losaE = losa ? (losa[2] === "cm" || num(losa[1]) > 1 ? num(losa[1]) / 100 : num(losa[1])) : null;
  return {
    pisos: pisos ? Number(pisos[1]) : null, nx, ny,
    luzX: luces ? num(luces[1]) : null, luzY: luces ? num(luces[2] ?? luces[1]) : null,
    altura: altura ? num(altura[1]) : null,
    zona: zona ? Number(zona[1]) : null, suelo: (suelo?.[1] ?? suelo?.[2])?.toUpperCase() ?? null, categoria,
    columna: columnas ? seccion(columnas[1]) : null, viga: vigas ? seccion(vigas[1]) : null, losa: losaE,
  };
}

// Completa con valores por defecto y predimensionamiento; devuelve lo que armará el modelo.
export function completarPedido(p) {
  const supuestos = [];
  const usar = (valor, porDefecto, texto) => { if (valor !== null && valor !== undefined) return valor; supuestos.push(texto); return porDefecto; };
  const pisos = Math.min(20, Math.max(1, usar(p.pisos, 3, "3 pisos (no indicaste los pisos).")));
  const nx = Math.min(10, Math.max(1, usar(p.nx, 3, "3 vanos en X."))), ny = Math.min(10, Math.max(1, usar(p.ny, 2, "2 vanos en Y.")));
  const luzX = usar(p.luzX, 5, "Luces de 5.00 m en X."), luzY = usar(p.luzY, p.luzX ?? 5, `Luces de ${(p.luzX ?? 5).toFixed(2)} m en Y.`);
  const altura = usar(p.altura, 3, "Altura de entrepiso 3.00 m.");
  const zona = usar(p.zona, 4, "Zona sísmica 4 (costa): confírmala con la ubicación.");
  const suelo = usar(p.suelo, "S2", "Suelo S2 (intermedio): confírmalo con el estudio de suelos.");
  const categoria = usar(p.categoria, "C", "Categoría C (vivienda u oficina).");
  // Predimensionamiento (Blanco Blasco): losa por luz, vigas L/12 con b = 0.25 m (E.060 21.5),
  // columnas A = P / (0.45 f'c) con P = 1 t/m² × área tributaria × pisos (columna central).
  const lMax = Math.max(luzX, luzY), lMin = Math.min(luzX, luzY);
  const losa = p.losa ?? (supuestos.push(`Losa aligerada de ${espesorPorLuz(lMin).toFixed(2)} m por la luz de ${lMin.toFixed(2)} m (Blanco Blasco).`), espesorPorLuz(lMin));
  const viga = p.viga ?? (() => { const h = Math.max(0.4, arriba(lMax / 12, 0.05)); supuestos.push(`Vigas 0.25x${h.toFixed(2)} m (h ≈ L/12 = ${(lMax / 12).toFixed(2)} m).`); return {b: 0.25, h}; })();
  const columna = p.columna ?? (() => {
    const area = (1.0 * luzX * luzY * pisos) / (0.45 * 2100); // t / (t/m²) con f'c = 210 kg/cm² = 2100 t/m²
    const lado = Math.max(0.3, arriba(Math.sqrt(area), 0.05));
    supuestos.push(`Columnas ${lado.toFixed(2)}x${lado.toFixed(2)} m (A = P/(0.45 f'c) = ${(area * 1e4).toFixed(0)} cm² con 1 t/m² × ${(luzX * luzY).toFixed(1)} m² × ${pisos} pisos).`);
    return {b: lado, h: lado};
  })();
  return {pisos, nx, ny, luzX, luzY, altura, zona, suelo, categoria, losa, viga, columna, supuestos};
}

// Rigidez por deriva: deriva ∝ 1 / lado^n. Solo con columnas flexibles n ≈ 4 (inercia ∝ lado⁴); con
// vigas que también se deforman n baja (medido en un pórtico de 3 pisos con vigas 0.25x0.45: n ≈ 1).
// Primera vuelta con n = 2 (punto medio); después, n medido con las dos últimas vueltas. Lado nuevo =
// lado · (deriva/límite · 1.05)^(1/n), redondeado a 5 cm.
export function exponenteDeriva(historial) {
  if (historial.length < 2) return 2;
  const [a, b] = historial.slice(-2);
  const n = Math.log(a.deriva / b.deriva) / Math.log(b.lado / a.lado);
  return Number.isFinite(n) ? Math.min(4, Math.max(0.7, n)) : 2;
}
// Siguiente lado a probar para quedar justo bajo el límite, con el historial [{lado, deriva}] de vueltas:
// horquilla entre el mayor lado que no cumple y el menor que sí, paso secante en escala logarítmica hacia
// el 95 % del límite (puede bajar si se pasó). listo = el menor que cumple, cuando la horquilla es de 5 cm.
export function siguienteLado(historial, limite, {paso = 0.05, maximo = 1.2} = {}) {
  const fallan = historial.filter((h) => h.deriva > limite), cumplen = historial.filter((h) => h.deriva <= limite);
  const bajo = fallan.length ? Math.max(...fallan.map((h) => h.lado)) : null;
  const alto = cumplen.length ? Math.min(...cumplen.map((h) => h.lado)) : null;
  if (alto !== null && (bajo === null ? alto <= 0.3 : alto - bajo <= paso + 1e-9)) return {listo: alto};
  const ultimo = historial.at(-1);
  const n = exponenteDeriva(historial);
  let lado = arriba(ultimo.lado * ((ultimo.deriva / (0.95 * limite))) ** (1 / n), paso);
  const min = bajo !== null ? bajo + paso : 0.3, max = alto !== null ? alto - paso : maximo;
  lado = Math.min(max, Math.max(min, lado));
  if (lado > maximo) return {listo: alto, sinSolucion: alto === null};
  if (historial.some((h) => Math.abs(h.lado - lado) < 1e-9)) return alto !== null ? {listo: alto} : {sinSolucion: true};
  return {lado: Math.round(lado * 100) / 100};
}

export function ladoParaDeriva(lado, deriva, limite, n = 4) {
  if (!(deriva > limite)) return lado;
  return Math.min(1.2, arriba(lado * ((deriva / limite) * 1.05) ** (1 / n), 0.05));
}

const letra = (i) => (i < 26 ? String.fromCharCode(65 + i) : `A${String.fromCharCode(65 + i - 26)}`);

// Modelo .e2k a partir del pedido completo.
// ajustes: {columna: {b, h}} reemplaza la sección (la usa el agente al rigidizar por deriva).
export function modeloRapido(texto, {R0 = 8, ajustes = {}} = {}) {
  const leido = leerPedidoDeModelo(texto);
  const c = completarPedido({...leido, ...(ajustes.columna ? {columna: ajustes.columna} : {})});
  if (ajustes.columna) c.supuestos.push(`Columnas ${ajustes.columna.b.toFixed(2)}x${ajustes.columna.h.toFixed(2)} m, agrandadas por el agente para cumplir la deriva.`);
  const xs = Array.from({length: c.nx + 1}, (_, i) => r2(i * c.luzX)), ys = Array.from({length: c.ny + 1}, (_, j) => r2(j * c.luzY));
  const ejesNombrados = [
    ...xs.map((x, i) => ({nombre: letra(i), p: {x, y: -1}, q: {x, y: ys.at(-1) + 1}})),
    ...ys.map((y, j) => ({nombre: String(j + 1), p: {x: -1, y}, q: {x: xs.at(-1) + 1, y}})),
  ];
  const columnas = xs.flatMap((x) => ys.map((y) => ({x, y, nodo: {x, y}, b: c.columna.b, h: c.columna.h, tipo: "C1", area: c.columna.b * c.columna.h})));
  const elev = Array.from({length: c.pisos}, (_, i) => r2((i + 1) * c.altura));
  const modelo = {
    niveles: c.pisos, entrepisos: elev.slice(0, -1), techo: elev.at(-1), losaTecho: true, losa: {espesor: c.losa},
    vigas: ejesNombrados.map((e) => ({eje: e.nombre, b: c.viga.b, h: c.viga.h})),
  };
  const nombre = `modelo_${c.pisos}p_${c.nx}x${c.ny}`;
  const g = modeloE2k({estructura: {escala: 1, columnas, ejesNombrados}, modelo, datos: {zona: String(c.zona), suelo: c.suelo, categoria: c.categoria}, nombre, R0});
  return {...g, nombre, pedido: c, supuestos: [...c.supuestos, ...g.supuestos]};
}
