/**
 * Constante de torsión de St-Venant para secciones abiertas GRUESAS (L y T de
 * concreto).
 *
 * POR QUÉ EXISTE
 *   El importador venía usando la fórmula de pared DELGADA, `Σ b·t³/3`, que
 *   supone t ≪ b. En una columna de concreto eso no se cumple ni de lejos: la
 *   CL 70x70x30 tiene t/b = 0.43 y la fórmula sale **+43 %** sobre el valor que
 *   reporta ETABS; la CL 50x50x30 llega a +78 %.
 *
 * QUÉ HACE
 *   Suma dos rectángulos COMPLETOS que se solapan (uno por pata), cada uno con
 *   el β exacto de la serie de Saint-Venant en vez del 1/3 asintótico. El
 *   solape compensa aproximadamente el material del rincón, que la suma de
 *   rectángulos disjuntos se pierde.
 *
 * PRECISIÓN medida contra ETABS (CL 70x70x30 y CT 100x60x30) y contra una
 * solución numérica por diferencias finitas (las otras dos), en ese orden:
 *
 *   CL 70x70x30    +4.4 %     (antes +43.0 %)
 *   CT 100x60x30   −4.3 %     (antes  +1.7 %)
 *   Col70x70x20    +2.8 %     (antes +25.3 %)
 *   CL 50x50x30   +11.5 %     (antes +78.2 %)
 *
 *   O sea: el peor caso pasa de +78 % a +11.5 %, y el típico ronda el 4 %. No
 *   es exacto — ETABS resuelve St-Venant numéricamente — pero el error que
 *   queda es del orden del resto de las aproximaciones del importador.
 *
 *   El único caso que EMPEORA es la T, de +1.7 % a −4.3 %: la fórmula vieja
 *   acertaba ahí por casualidad (el ala 1000×300 es la menos gruesa de las
 *   cuatro) y erraba feo en todo lo demás.
 */

/**
 * β de la torsión de un rectángulo b×t: J = β·b·t³, con b el lado LARGO.
 * Serie exacta de Saint-Venant; 40 términos sobran (convergen como 1/n⁵).
 * β → 1/3 cuando b/t → ∞, que es de donde sale la fórmula de pared delgada.
 */
export function rectTorsionBeta(ratio) {
  const r = Number(ratio);
  if (!(r >= 1)) return 0;
  let s = 0;
  for (let k = 0; k < 40; k++) {
    const n = 2 * k + 1;
    s += Math.tanh((n * Math.PI * r) / 2) / n ** 5;
  }
  return 1 / 3 - (64 / (Math.PI ** 5 * r)) * s;
}

/** J de un rectángulo b×t (el orden de los lados da igual). */
export function rectTorsionConstant(b, t) {
  const lado1 = Math.abs(Number(b) || 0);
  const lado2 = Math.abs(Number(t) || 0);
  const largo = Math.max(lado1, lado2);
  const corto = Math.min(lado1, lado2);
  if (!(corto > 0)) return 0;
  return rectTorsionBeta(largo / corto) * largo * corto ** 3;
}

/**
 * J de una "Concrete L": alma de espesor TW sobre todo el peralte D, más ala de
 * espesor TF sobre todo el ancho B.
 */
export function lTorsionConstant(D, B, TF, TW) {
  return rectTorsionConstant(D, TW) + rectTorsionConstant(B, TF);
}

/**
 * J de una "Concrete Tee": ala B×TF más alma de espesor TW sobre TODO el
 * peralte D. Tomar solo el vástago (D−TF) en vez de D da −26 %: el alma llega
 * de punta a punta a efectos de torsión.
 */
export function teeTorsionConstant(D, B, TF, TW) {
  return rectTorsionConstant(B, TF) + rectTorsionConstant(D, TW);
}
