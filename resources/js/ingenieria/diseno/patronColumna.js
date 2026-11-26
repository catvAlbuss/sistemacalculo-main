// Reparto de n varillas de una columna en el patrón "R-n2-n3" de ETABS, el que leen el .e2k, el
// diseño de columnas de Análisis Estructural y el motor de interacción:
//  - rectangular: n2 varillas por cara sobre el lado b y n3 sobre el lado h (2·n2 + 2·n3 − 4);
//  - L: pata sobre el eje 3 (ancho B) con n3 y pata sobre el eje 2 (peralte D) con n2, dos hileras
//    cada una; solo se funde la varilla del vértice común (2·n2 + 2·n3 − 1);
//  - T: igual, sin varillas comunes (2·n2 + 2·n3).
// Ver python-backend/design/column_interaction.py y column_polygon.py. Sin dependencias: lo
// importan la app del agente (NovaCad) y el CAD.

const esLT = (forma) => /^(l|lconc|t|tee)$/i.test(String(forma || ""));
const esL = (forma) => /^(l|lconc)$/i.test(String(forma || ""));

export function patronColumna({b, h, forma = null, n}) {
  const reparte = (suma, lado, otro) => {
    const k = Math.min(suma - 2, Math.max(2, Math.round((suma * lado) / (lado + otro))));
    return [k, suma - k];
  };
  if (esLT(forma)) {
    const funde = esL(forma) ? 1 : 0;
    const suma = Math.max(4, Math.ceil((n + funde) / 2));
    const [n3, n2] = reparte(suma, b, h);
    return {n2, n3, total: 2 * suma - funde, patron: `R-${n2}-${n3}`};
  }
  const suma = Math.max(4, Math.ceil(n / 2) + 2);
  const [n2, n3] = reparte(suma, b, h);
  return {n2, n3, total: 2 * n2 + 2 * n3 - 4, patron: `R-${n2}-${n3}`};
}

// Área bruta (m²): en L y T las patas sin duplicar el cruce.
export const areaColumna = ({b, h, forma = null, espesor = null}) => {
  const e = Number(espesor) || 0;
  return esLT(forma) && e > 0 && e < Math.min(b, h) ? e * (b + h - e) : b * h;
};

// Siguientes armados a probar cuando una columna no cumple: dos varillas más cada vez (mismo
// diámetro, como el cuadro del despacho) hasta la cuantía máxima práctica (4 %; E.060 admite 6 %,
// pero con más de 4 % el congestionamiento obliga a agrandar la sección).
export function armadosMayores({b, h, forma = null, espesor = null, n, areaBarra, cuantiaMaxima = 0.04}) {
  const Ag = areaColumna({b, h, forma, espesor});
  const out = [];
  let previo = patronColumna({b, h, forma, n}).total;
  for (let k = n + 2; out.length < 30; k += 2) {
    const p = patronColumna({b, h, forma, n: k});
    if (p.total <= previo) continue;
    if ((p.total * areaBarra) / Ag > cuantiaMaxima + 1e-9) break;
    out.push({...p, cuantia: (p.total * areaBarra) / Ag});
    previo = p.total;
  }
  return out;
}
