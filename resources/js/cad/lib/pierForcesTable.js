/**
 * Tabla de **Pier Forces**: filtrado y paso a demandas de diseño.
 *
 * QUÉ ES ESTO
 *   El motor devuelve una fila por (pier, piso, Top/Bottom, caso) en N y N·m.
 *   Acá se pasa a tonf, se ordena como la tabla de ETABS y se arma la lista de
 *   demandas que consume el diseño de la placa.
 *
 * POR QUÉ SEPARADO DEL MIXIN
 *   Lo único que puede salir mal acá es silencioso y numérico: una unidad sin
 *   convertir, un signo de P al revés, o mezclar el Bottom de un piso con el
 *   Top del de abajo. Nada de eso se ve en pantalla — se ve en el ratio D/C.
 *   Sin DOM ni Alpine, se puede probar con node.
 */

const TONF = 9806.65; // N

/** Componentes que se muestran, en el orden de la tabla de ETABS. */
export const COLUMNAS = ["P", "V2", "V3", "T", "M2", "M3"];

/**
 * Pasa las filas crudas del motor a tonf y tonf·m, con el nombre de caso
 * limpio. Devuelve [] si no hay nada (modelo sin muros, o sin piers).
 */
export function filasDePier(crudas) {
  if (!Array.isArray(crudas)) return [];
  return crudas.map((f) => {
    const fila = {
      pier: String(f.pier ?? ""),
      story: f.story == null ? "" : String(f.story),
      location: String(f.location ?? ""),
      case: String(f.case ?? ""),
      caseType: String(f.caseType ?? ""),
      // "Max" / "Min" de la rama ± del término sísmico, o "" si el combo no
      // lleva sismo. Se muestra como columna aparte, igual que ETABS.
      stepType: String(f.stepType ?? ""),
      // Con qué ordenar y numerar. El motor no puede numerar: cada payload es
      // UN caso espectral y solo ve los combos de ese caso.
      comboRank: Number(f.comboRank) || 0,
      comboCase: String(f.comboCase ?? ""),
      comboSign: String(f.comboSign ?? ""),
      length: Number(f.length) || 0,
    };
    for (const c of COLUMNAS) fila[c] = (Number(f[c]) || 0) / TONF;
    return fila;
  });
}

/**
 * Ordena como ETABS y numera los combos: 01 el de gravedad, después los
 * `1.25(CM+CV)±S` de cada caso sísmico y al final los `0.9CM±S`.
 *
 * POR QUÉ ACÁ Y NO EN EL MOTOR: cada Response Spectrum Case se corre en su
 * propio request, así que el motor solo ve los combos de SU caso. Numerando
 * allá salían dos "02" y ningún "06". Acá se ve la lista completa.
 *
 * El número va en el nombre porque es lo que el ingeniero cruza contra su
 * tabla de ETABS fila por fila.
 */
export function numerarEstiloEtabs(filas) {
  const combos = (filas || []).filter((f) => f.caseType === "Combination");
  const otras = (filas || []).filter((f) => f.caseType !== "Combination");

  const clave = (f) => `${f.comboRank}|${f.comboCase}|${f.comboSign}|${f.case}`;
  const orden = [...new Set(combos.map(clave))].sort((a, b) => {
    const [ra, ca, sa] = a.split("|");
    const [rb, cb, sb] = b.split("|");
    return Number(ra) - Number(rb) || ca.localeCompare(cb) || sb.localeCompare(sa);
  });
  const numero = new Map(orden.map((k, i) => [k, i + 1]));

  // Se devuelven EN ORDEN de numeración (y Max antes que Min dentro de cada
  // combo): la tabla se lee de arriba a abajo contra la de ETABS.
  const numerados = combos
    .map((f) => ({ ...f, _n: numero.get(clave(f)) || 0 }))
    .sort((a, b) => a._n - b._n || a.stepType.localeCompare(b.stepType))
    .map(({ _n, ...f }) => ({ ...f, case: `${String(_n).padStart(2, "0")} ${f.case}` }));

  return [...otras, ...numerados];
}

/** Los piers presentes, sin repetir y ordenados. */
export function piersDe(filas) {
  return [...new Set((filas || []).map((f) => f.pier).filter(Boolean))].sort();
}

/**
 * Los pisos de un pier, del más alto al más bajo — el orden en que ETABS los
 * lista. Sin nombre de piso (modelo dibujado a mano) queda una sola entrada
 * vacía, que es lo correcto: no hay pisos que distinguir.
 */
export function pisosDe(filas, pier = null) {
  const vistos = new Map();
  for (const f of filas || []) {
    if (pier && f.pier !== pier) continue;
    if (!vistos.has(f.story)) vistos.set(f.story, f);
  }
  return [...vistos.keys()].sort().reverse();
}

/**
 * Filtra por pier, piso y ubicación. Cualquiera en null no filtra.
 *
 * `soloCombos` deja fuera los casos sueltos (CM, CV, SDX...) y se queda con las
 * combinaciones, que es contra lo que se diseña. OJO que no es cosmético: un
 * caso espectral suelto viene de una CQC, sin gravedad ni factores, y si entra
 * a la lista puede salir gobernante sin significar nada — ya pasó en columnas
 * (ver [[project_seismic_case_not_governing]]).
 */
export function filtrar(filas, { pier = null, story = null, location = null, soloCombos = false } = {}) {
  return (filas || []).filter(
    (f) =>
      (!pier || f.pier === pier) &&
      (story === null || f.story === story) &&
      (!location || f.location === location) &&
      (!soloCombos || f.caseType === "Combination"),
  );
}

/**
 * Pasa las filas a demandas del diseño de placa: {nombre, P, M2, M3}.
 *
 * EL SIGNO DE P. El motor reporta con TRACCIÓN POSITIVA, igual que la tabla de
 * ETABS: una placa comprimida sale con P negativo. La superficie de interacción
 * es al revés (compresión positiva). Sin invertir, cada demanda se verifica
 * contra el lado de tracción de la superficie y el D/C no significa nada — es
 * exactamente la misma trampa que ya está anotada en `parsearDemandasDePlaca`.
 */
export function aDemandas(filas) {
  return (filas || []).map((f) => ({
    nombre: [f.story, f.case, f.stepType, f.location].filter(Boolean).join(" · "),
    P: -f.P,
    M2: f.M2,
    M3: f.M3,
  }));
}

/**
 * Texto tabulado equivalente, para el cuadro de pegar a mano — así lo pegado y
 * lo calculado son la misma cosa y se pueden comparar de un vistazo.
 */
export function aTexto(filas) {
  return (filas || [])
    .map((f) =>
      [f.story, f.pier, f.case, f.stepType, f.location,
       ...COLUMNAS.map((c) => f[c].toFixed(4))]
        .filter((x) => x !== "")
        .join("\t"),
    )
    .join("\n");
}
