/**
 * losa_solver.js
 * -----------------------------------------------------------------------
 * Solver de losa (placa delgada de Kirchhoff) sometida a una presión
 * PERPENDICULAR uniforme (q), por el Método de Diferencias Finitas (MDF).
 *
 * Ecuación gobernante:   D * ∇⁴w = q         (Lagrange, placas delgadas)
 *   D  = E h³ / (12 (1 - ν²))     rigidez a flexión de la losa
 *   w  = deflexión perpendicular al plano de la losa
 *
 * A partir de w se obtienen, en cada nodo de la malla:
 *   Mx, My   -> momentos flectores por unidad de ancho
 *   Mxy      -> momento torsor por unidad de ancho
 *   Vx, Vy   -> fuerzas cortantes por unidad de ancho (lo que ETABS llama
 *               "Shear Vx / Vy" en el diagrama de la losa)
 *
 * Estos son los mismos esfuerzos internos que reporta ETABS para un
 * elemento shell/losa bajo carga de área uniforme (load case "Area Load -
 * Uniform (perpendicular al plano)"), calculados aquí con un método
 * numérico equivalente (MDF en vez de MEF), por lo que los resultados
 * convergen a los mismos valores al refinar la malla.
 * -----------------------------------------------------------------------
 */

export function calcularLosa({
  Lx, Ly,                 // dimensiones de la losa en planta (m)
  h,                       // espesor de la losa (m)
  E,                       // módulo de elasticidad del concreto (kN/m2, T/m2, etc.)
  nu = 0.2,                // módulo de Poisson del concreto
  q,                       // presión perpendicular uniforme (misma unidad que E * long, ej. kN/m2)
  nx = 20, ny = 20,        // número de divisiones de malla en x, y
  borde = 'simple',        // 'simple' (apoyada) o 'empotrado' en los 4 bordes
}) {
  const D = (E * Math.pow(h, 3)) / (12 * (1 - nu * nu));
  const hx = Lx / nx;
  const hy = Ly / ny;
  const npx = nx + 1;
  const npy = ny + 1;

  // signo de reflexión para el punto "fantasma" fuera del dominio:
  //   apoyo simple -> w(-1,j) = -w(1,j)   (sign = -1)
  //   empotrado    -> w(-1,j) = +w(1,j)   (sign = +1)
  const signo = borde === 'empotrado' ? 1 : -1;

  // índice lineal de las incógnitas interiores (i=1..nx-1 , j=1..ny-1)
  const nIx = nx - 1;
  const nIy = ny - 1;
  const nDOF = nIx * nIy;
  const idx = (i, j) => (j - 1) * nIx + (i - 1);

  // W(i,j,coefAcc, target) -> agrega el coeficiente 'coefAcc' a la ecuación
  // 'target' (fila) sobre la incógnita w(i,j), resolviendo bordes/fantasmas.
  function agregarTermino(A, b, fila, i, j, coef) {
    let s = 1;
    let ii = i, jj = j;
    if (ii < 0) { s *= signo; ii = -ii; }
    else if (ii > nx) { s *= signo; ii = 2 * nx - ii; }
    if (jj < 0) { s *= signo; jj = -jj; }
    else if (jj > ny) { s *= signo; jj = 2 * ny - jj; }

    // si cae exactamente en el borde -> w = 0, no aporta nada
    if (ii === 0 || ii === nx || jj === 0 || jj === ny) return;

    A[fila][idx(ii, jj)] += s * coef;
  }

  // Ensamblaje del sistema  A * w = b   con  b = q/D en cada nodo interior
  const A = Array.from({ length: nDOF }, () => new Float64Array(nDOF));
  const b = new Float64Array(nDOF);

  const hx4 = hx ** 4, hy4 = hy ** 4, hxy2 = hx * hx * hy * hy;

  for (let j = 1; j <= nIy; j++) {
    for (let i = 1; i <= nIx; i++) {
      const fila = idx(i, j);
      b[fila] = q / D;

      // termino  ∂⁴w/∂x⁴  (1/hx^4)[w(i-2)-4w(i-1)+6w(i)-4w(i+1)+w(i+2)]
      agregarTermino(A, b, fila, i - 2, j, 1 / hx4);
      agregarTermino(A, b, fila, i - 1, j, -4 / hx4);
      agregarTermino(A, b, fila, i, j, 6 / hx4);
      agregarTermino(A, b, fila, i + 1, j, -4 / hx4);
      agregarTermino(A, b, fila, i + 2, j, 1 / hx4);

      // termino  ∂⁴w/∂y⁴
      agregarTermino(A, b, fila, i, j - 2, 1 / hy4);
      agregarTermino(A, b, fila, i, j - 1, -4 / hy4);
      agregarTermino(A, b, fila, i, j, 6 / hy4);
      agregarTermino(A, b, fila, i, j + 1, -4 / hy4);
      agregarTermino(A, b, fila, i, j + 2, 1 / hy4);

      // termino  2 ∂⁴w/∂x²∂y²
      const c2 = 2 / hxy2;
      agregarTermino(A, b, fila, i - 1, j - 1, c2 * 1);
      agregarTermino(A, b, fila, i, j - 1, c2 * -2);
      agregarTermino(A, b, fila, i + 1, j - 1, c2 * 1);
      agregarTermino(A, b, fila, i - 1, j, c2 * -2);
      agregarTermino(A, b, fila, i, j, c2 * 4);
      agregarTermino(A, b, fila, i + 1, j, c2 * -2);
      agregarTermino(A, b, fila, i - 1, j + 1, c2 * 1);
      agregarTermino(A, b, fila, i, j + 1, c2 * -2);
      agregarTermino(A, b, fila, i + 1, j + 1, c2 * 1);
    }
  }

  // ---- Eliminación gaussiana con pivoteo parcial ----
  const wSol = resolverSistema(A, b);

  // reconstruir matriz completa de deflexiones w[i][j], i=0..nx, j=0..ny
  const w = Array.from({ length: npx }, () => new Float64Array(npy));
  for (let j = 1; j <= nIy; j++) {
    for (let i = 1; i <= nIx; i++) {
      w[i][j] = wSol[idx(i, j)];
    }
  }

  // función genérica W(i,j) usando las mismas reglas de borde/reflexión
  function W(i, j) {
    let s = 1, ii = i, jj = j;
    if (ii < 0) { s *= signo; ii = -ii; }
    else if (ii > nx) { s *= signo; ii = 2 * nx - ii; }
    if (jj < 0) { s *= signo; jj = -jj; }
    else if (jj > ny) { s *= signo; jj = 2 * ny - jj; }
    if (ii === 0 || ii === nx || jj === 0 || jj === ny) return 0;
    return s * w[ii][jj];
  }

  // ---- Post-proceso: momentos y cortantes en cada nodo ----
  const Mx = Array.from({ length: npx }, () => new Float64Array(npy));
  const My = Array.from({ length: npx }, () => new Float64Array(npy));
  const Mxy = Array.from({ length: npx }, () => new Float64Array(npy));
  const Vx = Array.from({ length: npx }, () => new Float64Array(npy));
  const Vy = Array.from({ length: npx }, () => new Float64Array(npy));

  const lap = (i, j) => // ∇²w en (i,j)
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
    }
  }

  return { D, hx, hy, npx, npy, w, Mx, My, Mxy, Vx, Vy };
}

// Eliminación gaussiana con pivoteo parcial (matriz densa, suficiente para
// mallas de hasta ~40x40; para mallas más finas conviene un solver sparse).
function resolverSistema(Aorig, borig) {
  const n = borig.length;
  const A = Aorig.map(row => Float64Array.from(row));
  const b = Float64Array.from(borig);

  for (let k = 0; k < n; k++) {
    let piv = k;
    for (let i = k + 1; i < n; i++) if (Math.abs(A[i][k]) > Math.abs(A[piv][k])) piv = i;
    if (piv !== k) { [A[k], A[piv]] = [A[piv], A[k]]; [b[k], b[piv]] = [b[piv], b[k]]; }

    const pivVal = A[k][k];
    for (let i = k + 1; i < n; i++) {
      const f = A[i][k] / pivVal;
      if (f === 0) continue;
      for (let j = k; j < n; j++) A[i][j] -= f * A[k][j];
      b[i] -= f * b[k];
    }
  }

  const x = new Float64Array(n);
  for (let i = n - 1; i >= 0; i--) {
    let s = b[i];
    for (let j = i + 1; j < n; j++) s -= A[i][j] * x[j];
    x[i] = s / A[i][i];
  }
  return x;
}

/**
 * Extrae los valores máximos/mínimos de diseño (los que normalmente se leen
 * de los diagramas de ETABS): momentos positivos y negativos, y cortantes
 * máximos en cada dirección.
 */
export function extraerEnvolventes({ Mx, My, Mxy, Vx, Vy, npx, npy }) {
  const flat = (m) => {
    let max = -Infinity, min = Infinity, iMax = 0, jMax = 0, iMin = 0, jMin = 0;
    for (let i = 0; i < npx; i++) {
      for (let j = 0; j < npy; j++) {
        if (m[i][j] > max) { max = m[i][j]; iMax = i; jMax = j; }
        if (m[i][j] < min) { min = m[i][j]; iMin = i; jMin = j; }
      }
    }
    return { max, min, nodoMax: [iMax, jMax], nodoMin: [iMin, jMin] };
  };
  return {
    Mx: flat(Mx), My: flat(My), Mxy: flat(Mxy),
    Vx: flat(Vx), Vy: flat(Vy),
  };
}

export { resolverSistema };

// -----------------------------------------------------------------------
// Ejemplo de uso (se ejecuta solo si corres:  node losa_solver.js)
// -----------------------------------------------------------------------
import { fileURLToPath } from 'url';
const esArchivoPrincipal = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (esArchivoPrincipal) {
  const datos = {
    Lx: 6,          // m
    Ly: 5,          // m
    h: 0.20,        // m  (espesor de losa)
    E: 2173706.5,   // kN/m2 aprox. para f'c=210 kg/cm2 (Ec=15000*sqrt(f'c) kg/cm2)
    nu: 0.2,
    q: 10,          // kN/m2 (carga perpendicular: peso propio + sobrecarga, ya factorizada o de servicio)
    nx: 24, ny: 20,
    borde: 'simple',// 'simple' o 'empotrado'
  };

  const resultado = calcularLosa(datos);
  const env = extraerEnvolventes(resultado);

  console.log('--- Losa', datos.Lx, 'x', datos.Ly, 'm, h=', datos.h, 'm, q=', datos.q, 'kN/m2 ---');
  console.log('Mx  max/min (kN.m/m):', env.Mx.max.toFixed(2), '/', env.Mx.min.toFixed(2));
  console.log('My  max/min (kN.m/m):', env.My.max.toFixed(2), '/', env.My.min.toFixed(2));
  console.log('Vx  max/min (kN/m)  :', env.Vx.max.toFixed(2), '/', env.Vx.min.toFixed(2));
  console.log('Vy  max/min (kN/m)  :', env.Vy.max.toFixed(2), '/', env.Vy.min.toFixed(2));
}