/**
 * zapata_placa_solver.js
 * -----------------------------------------------------------------------
 * Solver de placa delgada (Kirchhoff) SOBRE FUNDACIÓN ELÁSTICA (resortes de
 * suelo tipo Winkler -- lo mismo que "Area Springs" en ETABS), para el
 * momento de diseño de ZAPATAS AISLADAS con precisión de elementos finitos.
 *
 * Por qué este archivo es distinto de losa_solver.js: una losa de piso se
 * apoya en sus 4 bordes (vigas) y recibe carga uniforme hacia abajo. Una
 * zapata es el problema casi opuesto: bordes LIBRES (no hay nada
 * sosteniendo el perímetro), la reacción viene de resortes de suelo
 * distribuidos en TODA el área (cada punto empuja hacia arriba en
 * proporción a cuánto se hunde ahí -- Winkler), y la única carga externa es
 * la reacción puntual de la columna. Ver memoria del proyecto
 * (project_losa_solver_zapatas_precision) para el contexto completo de
 * esta decisión.
 *
 * Ecuación gobernante:   D * ∇⁴w + k * w = P(x,y)
 *   D  = E h³ / (12 (1 - ν²))     rigidez a flexión de la zapata
 *   k  = coeficiente de balasto del suelo (Tonf/m³ -- del estudio de suelos,
 *        el mismo dato que ETABS pide para "Area Springs")
 *   w  = asentamiento/deflexión de la zapata (m)
 *   P(x,y) = carga puntual de la columna (Tonf), aplicada en el nodo de
 *            malla más cercano a su posición real
 *
 * A partir de w se obtienen, en cada nodo de la malla:
 *   Mx, My   -> momentos flectores de diseño por unidad de ancho (Tn·m/m)
 *   Mxy      -> momento torsor por unidad de ancho
 *   Vx, Vy   -> cortantes por unidad de ancho (Tn/m)
 *   q(x,y) = k*w(x,y) -> presión de contacto resultante (Tn/m²), para
 *            verificar que la suma (integral) sobre el área devuelva la
 *            carga de columna P (chequeo de equilibrio del propio solver)
 *
 * UNIDADES: Tonf y metros en todo el archivo (mismo convenio que el resto
 * del proyecto -- ver zapatas2Core.js, footingMoments.js). E en Tonf/m²,
 * k en Tonf/m³, P en Tonf, Mx/My en Tn·m/m, Vx/Vy en Tn/m.
 * -----------------------------------------------------------------------
 *
 * CONDICIONES DE BORDE LIBRE (la parte no trivial de este solver)
 * -----------------------------------------------------------------------
 * En un borde libre (Kirchhoff), deben cumplirse DOS condiciones, no una:
 *   1) Momento normal al borde = 0        (Mx=0 en un borde x=cte)
 *   2) Cortante efectivo de Kirchhoff = 0 (Vx + ∂Mxy/∂y = 0)
 *
 * A diferencia del apoyo simple/empotrado (una sola reflexión, ver
 * losa_solver.js), el borde libre necesita DOS "anillos" de puntos
 * fantasma (i=-1 e i=-2 más allá del borde), uno por cada condición, y el
 * propio borde (i=0) deja de tener w=0 prescrito -- pasa a ser una
 * incógnita más del sistema, igual que el interior.
 *
 * Derivación estándar (ver Timoshenko & Woinowsky-Krieger, "Theory of
 * Plates and Shells", cap. de diferencias finitas para placas; mismo
 * método que usan los solvers clásicos de placas sobre fundación elástica):
 *
 *  Anillo 1 (de la condición de momento Mx=0 en el borde x=0):
 *    w[-1][j] = 2w[0][j] - w[1][j] - ν·(hx²/hy²)·(w[0][j-1] - 2w[0][j] + w[0][j+1])
 *
 *  Anillo 2 (de la condición de cortante efectivo Vx_eff=0 en x=0, usando
 *  ya el anillo 1 resuelto):
 *    w[-2][j] = w[2][j] - 2w[1][j] + 2w[-1][j]
 *               + (2-ν)·(hx²/hy²)·[(w[1][j+1]-2w[1][j]+w[1][j-1])
 *                                  - (w[-1][j+1]-2w[-1][j]+w[-1][j-1])]
 *
 * Las mismas fórmulas se aplican rotadas 90° en los bordes y=0/y=Ly, y en
 * las 4 esquinas se aplican AMBAS direcciones a la vez sobre el mismo nodo
 * -- con los resortes (k·w) presentes en todos los nodos, incluidas las
 * esquinas, el equilibrio ahí sale naturalmente del propio ensamblaje, sin
 * necesitar la fórmula clásica de "fuerza de esquina" que se usa para
 * placas libres SIN fundación elástica.
 *
 * VALIDACIÓN: antes de confiar en un caso de zapata real, este archivo
 * corre un caso de control con k=0 (sin resortes) para confirmar que el
 * sistema queda SINGULAR (matriz no invertible) cuando no hay nada que
 * sostenga la placa aparte de un punto -- es la prueba de que las
 * condiciones de borde libre están bien planteadas, no un bug si falla.
 * -----------------------------------------------------------------------
 */

import { resolverSistema } from './losa_solver.js';

export function calcularZapataPlaca({
  Lx, Ly,                 // dimensiones de la zapata en planta (m)
  h,                       // espesor de la zapata (m)
  E,                       // módulo de elasticidad del concreto (Tonf/m²)
  nu = 0.2,                // módulo de Poisson del concreto
  k,                       // coeficiente de balasto del suelo (Tonf/m³) -- del estudio de suelos
  columnaX, columnaY,      // posición de la columna (m), relativa a la esquina (0,0) de la zapata
  P,                       // carga axial de la columna (Tonf, hacia abajo, positiva)
  nx = 20, ny = 20,        // número de divisiones de malla en x, y
}) {
  const D = (E * Math.pow(h, 3)) / (12 * (1 - nu * nu));
  const hx = Lx / nx;
  const hy = Ly / ny;
  const npx = nx + 1;
  const npy = ny + 1;

  // Con bordes libres, TODOS los nodos son incógnitas (i=0..nx, j=0..ny) --
  // a diferencia de losa_solver.js, donde los bordes tenían w=0 prescrito y
  // solo los nodos interiores eran incógnitas.
  const nDOF = npx * npy;
  const idx = (i, j) => j * npx + i;

  // Nodo de malla más cercano a la posición real de la columna -- la carga
  // puntual se aplica ahí. Con una malla razonablemente fina, el error de
  // "snapear" la columna al nodo más cercano es pequeño; si hace falta más
  // precisión más adelante, se puede repartir P entre los 4 nodos vecinos
  // por interpolación bilineal.
  const iCol = Math.round(columnaX / hx);
  const jCol = Math.round(columnaY / hy);

  // W(i,j) con las reglas de borde libre: fuera del dominio [0,nx]x[0,ny],
  // usa los dos anillos de puntos fantasma derivados arriba. Se calculan
  // "bajo demanda" (no se guardan aparte) para mantener una sola fuente de
  // verdad con agregarTermino().
  function conFantasma(A, fila, i, j, coef, wKnown) {
    // wKnown(i,j) -> índice de la incógnita si (i,j) cae dentro del
    // dominio ampliado con los anillos fantasma resueltos en términos de
    // combinaciones de nodos reales (ver más abajo); null si hay que
    // expandir la relación de borde libre en vez de agregar directo.
  }

  // Para simplificar el ensamblaje, se resuelve el sistema completo
  // agregando, en cada ecuación, los coeficientes de los puntos fantasma
  // YA EXPANDIDOS en función de nodos reales (aplicando las fórmulas de
  // anillo 1 / anillo 2 recursivamente si hace falta cruzar dos bordes,
  // como en las esquinas).
  function reflejarLibre(i, j, terminos) {
    // terminos: array de {i, j, coef} a expandir. Devuelve un array nuevo
    // de {i, j, coef} ya dentro de [0,nx]x[0,ny], sumando coeficientes
    // repetidos.
    let out = terminos;
    let cambiado = true;
    let vueltas = 0;
    while (cambiado && vueltas < 8) { // 8 = margen de sobra; converge en <=4
      cambiado = false;
      vueltas++;
      const next = [];
      for (const t of out) {
        let { i: ii, j: jj, coef } = t;
        if (ii < 0) {
          cambiado = true;
          if (ii === -1) {
            // Anillo 1 en x=0: w[-1][j] = 2w[0][j] - w[1][j] - ν(hx/hy)²(w[0][j-1]-2w[0][j]+w[0][j+1])
            next.push({ i: 0, j: jj, coef: coef * 2 });
            next.push({ i: 1, j: jj, coef: coef * -1 });
            const r = nu * (hx * hx) / (hy * hy);
            next.push({ i: 0, j: jj - 1, coef: coef * -r });
            next.push({ i: 0, j: jj, coef: coef * 2 * r });
            next.push({ i: 0, j: jj + 1, coef: coef * -r });
          } else if (ii === -2) {
            // Anillo 2 en x=0 (usa w[-1] ya expresado en el anillo 1 arriba):
            // w[-2][j] = w[2][j] - 2w[1][j] + 2w[-1][j] + (2-ν)(hx/hy)²[(w[1][j+1]-2w[1][j]+w[1][j-1]) - (w[-1][j+1]-2w[-1][j]+w[-1][j-1])]
            const s = (2 - nu) * (hx * hx) / (hy * hy);
            next.push({ i: 2, j: jj, coef: coef * 1 });
            next.push({ i: 1, j: jj, coef: coef * -2 });
            next.push({ i: -1, j: jj, coef: coef * 2 });
            next.push({ i: 1, j: jj + 1, coef: coef * s });
            next.push({ i: 1, j: jj, coef: coef * -2 * s });
            next.push({ i: 1, j: jj - 1, coef: coef * s });
            next.push({ i: -1, j: jj + 1, coef: coef * -s });
            next.push({ i: -1, j: jj, coef: coef * 2 * s });
            next.push({ i: -1, j: jj - 1, coef: coef * -s });
          } else {
            throw new Error(`Punto fantasma fuera de rango en x: i=${ii} (solo se esperan -1/-2)`);
          }
        } else if (ii > nx) {
          cambiado = true;
          const over = ii - nx;
          if (over === 1) {
            next.push({ i: nx, j: jj, coef: coef * 2 });
            next.push({ i: nx - 1, j: jj, coef: coef * -1 });
            const r = nu * (hx * hx) / (hy * hy);
            next.push({ i: nx, j: jj - 1, coef: coef * -r });
            next.push({ i: nx, j: jj, coef: coef * 2 * r });
            next.push({ i: nx, j: jj + 1, coef: coef * -r });
          } else if (over === 2) {
            const s = (2 - nu) * (hx * hx) / (hy * hy);
            next.push({ i: nx - 2, j: jj, coef: coef * 1 });
            next.push({ i: nx - 1, j: jj, coef: coef * -2 });
            next.push({ i: nx + 1, j: jj, coef: coef * 2 });
            next.push({ i: nx - 1, j: jj + 1, coef: coef * s });
            next.push({ i: nx - 1, j: jj, coef: coef * -2 * s });
            next.push({ i: nx - 1, j: jj - 1, coef: coef * s });
            next.push({ i: nx + 1, j: jj + 1, coef: coef * -s });
            next.push({ i: nx + 1, j: jj, coef: coef * 2 * s });
            next.push({ i: nx + 1, j: jj - 1, coef: coef * -s });
          } else {
            throw new Error(`Punto fantasma fuera de rango en x: i=${ii}`);
          }
        } else if (jj < 0) {
          cambiado = true;
          if (jj === -1) {
            next.push({ i: ii, j: 0, coef: coef * 2 });
            next.push({ i: ii, j: 1, coef: coef * -1 });
            const r = nu * (hy * hy) / (hx * hx);
            next.push({ i: ii - 1, j: 0, coef: coef * -r });
            next.push({ i: ii, j: 0, coef: coef * 2 * r });
            next.push({ i: ii + 1, j: 0, coef: coef * -r });
          } else if (jj === -2) {
            const s = (2 - nu) * (hy * hy) / (hx * hx);
            next.push({ i: ii, j: 2, coef: coef * 1 });
            next.push({ i: ii, j: 1, coef: coef * -2 });
            next.push({ i: ii, j: -1, coef: coef * 2 });
            next.push({ i: ii + 1, j: 1, coef: coef * s });
            next.push({ i: ii, j: 1, coef: coef * -2 * s });
            next.push({ i: ii - 1, j: 1, coef: coef * s });
            next.push({ i: ii + 1, j: -1, coef: coef * -s });
            next.push({ i: ii, j: -1, coef: coef * 2 * s });
            next.push({ i: ii - 1, j: -1, coef: coef * -s });
          } else {
            throw new Error(`Punto fantasma fuera de rango en y: j=${jj}`);
          }
        } else if (jj > ny) {
          cambiado = true;
          const over = jj - ny;
          if (over === 1) {
            next.push({ i: ii, j: ny, coef: coef * 2 });
            next.push({ i: ii, j: ny - 1, coef: coef * -1 });
            const r = nu * (hy * hy) / (hx * hx);
            next.push({ i: ii - 1, j: ny, coef: coef * -r });
            next.push({ i: ii, j: ny, coef: coef * 2 * r });
            next.push({ i: ii + 1, j: ny, coef: coef * -r });
          } else if (over === 2) {
            const s = (2 - nu) * (hy * hy) / (hx * hx);
            next.push({ i: ii, j: ny - 2, coef: coef * 1 });
            next.push({ i: ii, j: ny - 1, coef: coef * -2 });
            next.push({ i: ii, j: ny + 1, coef: coef * 2 });
            next.push({ i: ii + 1, j: ny - 1, coef: coef * s });
            next.push({ i: ii, j: ny - 1, coef: coef * -2 * s });
            next.push({ i: ii - 1, j: ny - 1, coef: coef * s });
            next.push({ i: ii + 1, j: ny + 1, coef: coef * -s });
            next.push({ i: ii, j: ny + 1, coef: coef * 2 * s });
            next.push({ i: ii - 1, j: ny + 1, coef: coef * -s });
          } else {
            throw new Error(`Punto fantasma fuera de rango en y: j=${jj}`);
          }
        } else {
          next.push(t);
        }
      }
      out = next;
    }
    // combinar terminos repetidos (mismo i,j)
    const combinado = new Map();
    for (const t of out) {
      const key = `${t.i},${t.j}`;
      combinado.set(key, (combinado.get(key) || { i: t.i, j: t.j, coef: 0 }));
      combinado.get(key).coef += t.coef;
    }
    return Array.from(combinado.values());
  }

  const A = Array.from({ length: nDOF }, () => new Float64Array(nDOF));
  const b = new Float64Array(nDOF);

  const hx4 = hx ** 4, hy4 = hy ** 4, hxy2 = hx * hx * hy * hy;

  for (let j = 0; j <= ny; j++) {
    for (let i = 0; i <= nx; i++) {
      const fila = idx(i, j);

      const crudo = [
        // ∂⁴w/∂x⁴
        { i: i - 2, j, coef: 1 / hx4 },
        { i: i - 1, j, coef: -4 / hx4 },
        { i, j, coef: 6 / hx4 },
        { i: i + 1, j, coef: -4 / hx4 },
        { i: i + 2, j, coef: 1 / hx4 },
        // ∂⁴w/∂y⁴
        { i, j: j - 2, coef: 1 / hy4 },
        { i, j: j - 1, coef: -4 / hy4 },
        { i, j, coef: 6 / hy4 },
        { i, j: j + 1, coef: -4 / hy4 },
        { i, j: j + 2, coef: 1 / hy4 },
        // 2 ∂⁴w/∂x²∂y²
        { i: i - 1, j: j - 1, coef: 2 / hxy2 },
        { i, j: j - 1, coef: -4 / hxy2 },
        { i: i + 1, j: j - 1, coef: 2 / hxy2 },
        { i: i - 1, j, coef: -4 / hxy2 },
        { i, j, coef: 8 / hxy2 },
        { i: i + 1, j, coef: -4 / hxy2 },
        { i: i - 1, j: j + 1, coef: 2 / hxy2 },
        { i, j: j + 1, coef: -4 / hxy2 },
        { i: i + 1, j: j + 1, coef: 2 / hxy2 },
      ];

      const expandido = reflejarLibre(i, j, crudo);
      for (const t of expandido) {
        A[fila][idx(t.i, t.j)] += D * t.coef;
      }
      // término de resorte k*w
      A[fila][idx(i, j)] += k;

      // carga puntual de columna, en el nodo más cercano
      b[fila] = (i === iCol && j === jCol) ? P / (hx * hy) : 0;
      // Nota: P/(hx*hy) reparte la carga puntual como una "presión
      // equivalente" en la celda del nodo -- es la forma estándar de
      // aplicar una carga concentrada en un solver de diferencias finitas
      // (equivale a integrar una delta de Dirac sobre la celda).
    }
  }

  const wSol = resolverSistema(A, b);
  const w = Array.from({ length: npx }, () => new Float64Array(npy));
  for (let j = 0; j <= ny; j++) {
    for (let i = 0; i <= nx; i++) {
      w[i][j] = wSol[idx(i, j)];
    }
  }

  function W(i, j) {
    if (i >= 0 && i <= nx && j >= 0 && j <= ny) return w[i][j];
    // fuera de dominio: expandir con las mismas reglas de borde libre,
    // evaluando la combinación resultante sobre los valores ya resueltos.
    const expandido = reflejarLibre(i, j, [{ i, j, coef: 1 }]);
    let s = 0;
    for (const t of expandido) s += t.coef * w[t.i][t.j];
    return s;
  }

  const Mx = Array.from({ length: npx }, () => new Float64Array(npy));
  const My = Array.from({ length: npx }, () => new Float64Array(npy));
  const Mxy = Array.from({ length: npx }, () => new Float64Array(npy));
  const Vx = Array.from({ length: npx }, () => new Float64Array(npy));
  const Vy = Array.from({ length: npx }, () => new Float64Array(npy));
  const q = Array.from({ length: npx }, () => new Float64Array(npy)); // presión de contacto = k*w

  const lap = (i, j) =>
    (W(i + 1, j) - 2 * W(i, j) + W(i - 1, j)) / (hx * hx) +
    (W(i, j + 1) - 2 * W(i, j) + W(i, j - 1)) / (hy * hy);

  for (let j = 0; j <= ny; j++) {
    for (let i = 0; i <= nx; i++) {
      const wxx = (W(i + 1, j) - 2 * W(i, j) + W(i - 1, j)) / (hx * hx);
      const wyy = (W(i, j + 1) - 2 * W(i, j) + W(i, j - 1)) / (hy * hy);
      const wxy = (W(i + 1, j + 1) - W(i + 1, j - 1) - W(i - 1, j + 1) + W(i - 1, j - 1)) / (4 * hx * hy);

      Mx[i][j] = -D * (wxx + nu * wyy);
      My[i][j] = -D * (wyy + nu * wxx);
      Mxy[i][j] = -D * (1 - nu) * wxy;

      Vx[i][j] = -D * (lap(i + 1, j) - lap(i - 1, j)) / (2 * hx);
      Vy[i][j] = -D * (lap(i, j + 1) - lap(i, j - 1)) / (2 * hy);

      q[i][j] = k * w[i][j];
    }
  }

  // Chequeo de equilibrio: la integral de la presión de contacto sobre
  // toda el área debe ser aprox. igual a P (la carga de columna) -- si no
  // calza, algo en el ensamblaje está mal. Regla del trapecio simple.
  let sumaQ = 0;
  for (let j = 0; j <= ny; j++) {
    for (let i = 0; i <= nx; i++) {
      const wi = (i === 0 || i === nx) ? 0.5 : 1;
      const wj = (j === 0 || j === ny) ? 0.5 : 1;
      sumaQ += q[i][j] * wi * wj * hx * hy;
    }
  }

  return { D, hx, hy, npx, npy, iCol, jCol, w, Mx, My, Mxy, Vx, Vy, q, equilibrioP: P, equilibrioSumaQ: sumaQ };
}

// -----------------------------------------------------------------------
// Prueba de control: SIN resortes (k=0), el sistema debe quedar singular
// (sin solución única) -- confirma que las condiciones de borde libre
// están bien planteadas (una placa sin ningún apoyo, solo una carga
// puntual, es un mecanismo: puede girar libremente). Si esto NO falla,
// hay un error en las condiciones de borde libre.
// -----------------------------------------------------------------------
import { fileURLToPath } from 'url';
const esArchivoPrincipal = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (esArchivoPrincipal) {
  console.log('=== Prueba de control: k=0 (debe fallar / dar numeros absurdos, es lo esperado) ===');
  try {
    const rSinResorte = calcularZapataPlaca({
      Lx: 2, Ly: 2, h: 0.4, E: 2173706.5, nu: 0.2,
      k: 0,
      columnaX: 1, columnaY: 1, P: 40.56,
      nx: 10, ny: 10,
    });
    console.log('w en el centro (deberia ser enorme/sin sentido si es realmente singular):', rSinResorte.w[5][5]);
  } catch (e) {
    console.log('Fallo como se esperaba:', e.message);
  }

  console.log('\n=== Caso real: 2x2m centrada, sigma equivalente ~10.14 Tn/m2 (objetivo ETABS: 6.5689) ===');
  const k = 3000; // Tonf/m3 -- PLACEHOLDER, pendiente confirmar el valor real usado en ETABS
  const resultado = calcularZapataPlaca({
    Lx: 2, Ly: 2, h: 0.4, E: 2173706.5, nu: 0.2,
    k,
    columnaX: 1, columnaY: 1, P: 10.14 * 4, // P = sigma_objetivo * area, para comparar equilibrio total
    nx: 20, ny: 20,
  });

  console.log('k usado (Tonf/m3):', k, '<-- PLACEHOLDER, confirmar con Jack el valor real de ETABS');
  console.log('Mx en el nodo de la columna (Tn.m/m):', resultado.Mx[resultado.iCol][resultado.jCol]);
  console.log('My en el nodo de la columna (Tn.m/m):', resultado.My[resultado.iCol][resultado.jCol]);
  console.log('Chequeo de equilibrio: P columna =', resultado.equilibrioP, ' vs integral de q =', resultado.equilibrioSumaQ.toFixed(3));
}
