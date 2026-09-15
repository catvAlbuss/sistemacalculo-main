/**
 * Geometría de secciones POLIGONALES (L y T) — única fuente de verdad del lado
 * del navegador.
 *
 * POR QUÉ EXISTE
 *   La forma de la L la necesitan tres lugares: la huella en planta
 *   (canvas2d/renderer.js), la vista previa del modal de secciones y el
 *   diseñador de armado. Tenerla duplicada es justo lo que hizo que la
 *   orientación tardara tres intentos en calzar contra ETABS: se corregía en un
 *   lado y el otro seguía viejo.
 *
 *   Es el espejo de `python-backend/design/column_polygon.py`, que hace lo mismo
 *   para el motor. Si se toca una, hay que tocar la otra — y el contraste está
 *   en el ratio contra ETABS, que hoy da −0.47 % en la C11.
 *
 * EJES
 *   `u` = eje local 2 (peralte D), `v` = eje local 3 (ancho B).
 *
 * ORIENTACIÓN DE LA L — anclada con DOS verificaciones independientes
 *   1. PLANTA: con `MIRROR3 "Yes"` y ANG = 0, ETABS dibuja la L como "¬",
 *      esquina ARRIBA-DERECHA.
 *   2. SECCIÓN: el preview del diálogo de ETABS muestra la esquina
 *      ARRIBA-IZQUIERDA, que mapeada a planta (eje 2 → X, eje 3 → Y) da lo mismo.
 *   Como MIRROR3 niega `u`, la base sin espejo es esa forma con `u` invertido.
 *
 *   OJO: la vista de SECCIÓN (eje 2 arriba, eje 3 a la izquierda) está rotada
 *   90° respecto de la PLANTA. Comparar la forma en la vista equivocada es el
 *   error que costó las tres vueltas.
 */

/** Espejar SOBRE un eje niega la OTRA coordenada. */
function aplicarEspejos(pts, mirror2, mirror3) {
  let p = pts;
  if (mirror2) p = p.map(([u, v]) => [u, -v]);
  if (mirror3) p = p.map(([u, v]) => [-u, v]);
  return p;
}

/**
 * Vértices de una "Concrete L". `flangeThick` (TF) es el espesor de la pata
 * horizontal (corre sobre el eje 3, se mide sobre u); `webThick` (TW) el de la
 * vertical (corre sobre el eje 2, se mide sobre v). Devuelve [] si no cierra.
 */
export function lSectionVertices(depth, width, flangeThick, webThick, mirror2 = false, mirror3 = false) {
  const D = Number(depth) || 0, B = Number(width) || 0;
  const TF = Number(flangeThick) || 0, TW = Number(webThick) || 0;
  if (!(D > 0 && B > 0 && TF > 0 && TW > 0 && TF < D && TW < B)) return [];
  const hd = D / 2, hb = B / 2;
  return aplicarEspejos([
    [hd, hb], [-hd, hb], [-hd, -hb],
    [TF - hd, -hb], [TF - hd, hb - TW], [hd, hb - TW],
  ], mirror2, mirror3);
}

/** Vértices de una "Concrete Tee": ala en la parte alta del peralte, alma centrada. */
export function teeSectionVertices(depth, width, flangeThick, webThick) {
  const D = Number(depth) || 0, B = Number(width) || 0;
  const TF = Number(flangeThick) || 0, TW = Number(webThick) || 0;
  if (!(D > 0 && B > 0 && TF > 0 && TW > 0 && TF < D && TW < B)) return [];
  const hd = D / 2, hb = B / 2, ht = TW / 2, uf = hd - TF;
  return [[hd, -hb], [hd, hb], [uf, hb], [uf, ht], [-hd, ht], [-hd, -ht], [uf, -ht], [uf, -hb]];
}

/** Área por la fórmula del zapato (sin signo). */
export function polygonArea(pts) {
  if (!Array.isArray(pts) || pts.length < 3) return 0;
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
    s += x1 * y2 - x2 * y1;
  }
  return Math.abs(s) / 2;
}

/**
 * Reparto de varillas de una L o una T tal como lo hace ETABS.
 *
 * ETABS usa en L y T el MISMO patrón "R-n2-n3" que en una rectangular — su
 * diálogo "Frame Section Property Reinforcement Data" es idéntico para las tres
 * formas — y lo interpreta pata por pata, según su dibujo de la sección:
 *
 *   · la pata que corre sobre el EJE 3 lleva `n3` varillas a lo largo,
 *     en 2 hileras (una por cara de su espesor);
 *   · la pata que corre sobre el EJE 2 lleva `n2` a lo largo, en 2 hileras;
 *   · las patas se SOLAPAN, y solo se descarta la varilla que cae EXACTAMENTE
 *     en la misma posición en las dos.
 *
 * Los dos totales están confirmados contra el `Rebar %` del Column Element
 * Details de ETABS:
 *   CL 70x70x30, R-4-4  → 15 varillas (ρ 1.4273 % ≈ 1.43, con Ø20 sobre
 *     Ag 330 000 mm²). El solape de la L cae en un vértice EXACTO, así que
 *     descarta una: 2·4 + 2·4 − 1 = 15.
 *   CT 100x60x30, R-4-6 → 20 varillas (ρ 1.0256 % ≈ 1.03, con #5 sobre
 *     Ag 390 000 mm²). En la T las dos patas nunca coinciden exacto (lo más
 *     cerca que quedan es 1.12 mm), así que no se descarta ninguna: 2·6 + 2·4.
 *
 * LA TOLERANCIA IMPORTA: con `dc` como tolerancia salen 12 y 16, y con patas
 * disjuntas salen 16 y 20. Solo la coincidencia EXACTA reproduce 15 y 20.
 *
 * `dc` (recubrimiento + estribo + media varilla) se mide desde la cara de cada
 * pata, igual que en una rectangular.
 *
 * Devuelve [[u,v], ...] en las MISMAS unidades que entran, con el origen en el
 * centro de la caja envolvente.
 */
export function etabsPolygonBarPositions(forma, dims, n2, n3, cover, barDiameter, confineBarDiameter = 0) {
  const D = Number(dims?.depth) || 0;      // peralte, sobre el eje 2
  const B = Number(dims?.width) || 0;      // ancho, sobre el eje 3
  const TF = Number(dims?.flangeThick) || 0;
  const TW = Number(dims?.webThick) || 0;
  const N2 = Math.max(2, Math.round(Number(n2) || 0));
  const N3 = Math.max(2, Math.round(Number(n3) || 0));
  if (!(D > 0 && B > 0 && TF > 0 && TW > 0 && TF < D && TW < B)) return [];

  const dc = (Number(cover) || 0) + (Number(confineBarDiameter) || 0) + (Number(barDiameter) || 0) / 2;
  const hd = D / 2, hb = B / 2;

  // Las dos patas como rectángulos [u0,u1] x [v0,v1] que SE SOLAPAN: cada una
  // recorre la sección de punta a punta.
  const esTee = String(forma).toLowerCase() === "tee";
  const pataEje3 = esTee                                  // ala: corre sobre el eje 3
    ? { u0: hd - TF, u1: hd, v0: -hb, v1: hb }
    : { u0: -hd, u1: TF - hd, v0: -hb, v1: hb };
  const pataEje2 = esTee                                  // alma: corre sobre el eje 2
    ? { u0: -hd, u1: hd, v0: -TW / 2, v1: TW / 2 }
    : { u0: -hd, u1: hd, v0: hb - TW, v1: hb };

  /** `n` posiciones repartidas entre a+dc y b-dc (o el centro si no entran). */
  const reparto = (a, b, n) => {
    const i = a + dc, f = b - dc;
    if (f <= i) return [(a + b) / 2];
    if (n < 2) return [(i + f) / 2];
    return Array.from({ length: n }, (_, k) => i + ((f - i) * k) / (n - 1));
  };

  const out = [];
  // Tolerancia RELATIVA y muy chica: solo fusiona la varilla que las dos patas
  // ponen en el MISMO punto. En la T hay un par a 1.12 mm que NO se debe
  // fusionar, así que no puede ser un valor grande como `dc`.
  const tol = 1e-6 * Math.max(D, B);
  const agregar = (u, v) => {
    if (out.some(([a, b]) => Math.abs(a - u) < tol && Math.abs(b - v) < tol)) return;
    out.push([u, v]);
  };

  // Pata del eje 3: n3 a lo largo de v, 2 hileras sobre u.
  for (const u of [pataEje3.u0 + dc, pataEje3.u1 - dc]) {
    for (const v of reparto(pataEje3.v0, pataEje3.v1, N3)) agregar(u, v);
  }
  // Pata del eje 2: n2 a lo largo de u, 2 hileras sobre v.
  for (const v of [pataEje2.v0 + dc, pataEje2.v1 - dc]) {
    for (const u of reparto(pataEje2.u0, pataEje2.u1, N2)) agregar(u, v);
  }

  return aplicarEspejos(out, !!dims?.mirror2, !!dims?.mirror3);
}
