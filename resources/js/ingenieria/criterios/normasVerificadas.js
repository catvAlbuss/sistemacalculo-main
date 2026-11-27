// Citas verificadas contra el texto de la norma (no de memoria ni de resúmenes): artículo, lo que dice
// y de qué copia del texto sale. Verificado el 27/11/2026 leyendo los PDF guardados en
// storage/app/private/normas/ (privado, fuera de git):
//   - E.060 Concreto Armado, DS 010-2009-VIVIENDA: copia publicada en gob.pe (Municipalidad de Santa
//     María del Mar, colección "Reglamento Nacional de Edificaciones – licencia de edificación").
//   - E.050 Suelos y Cimentaciones: copia publicada en el mismo sitio de gob.pe; el documento no indica
//     si es la versión 2006 o la modificada por la RM 406-2018-VIVIENDA: confirmar la numeración.
//   - E.030-2018 (tablas 5 y 11): docs/agentes/normativas-estructurales.md, tabla 1.2.
// La E.060-2019 que circula en internet es una PROPUESTA de SENCICO, no la norma vigente: no se usa.

export const FUENTE_TEXTO = {
  "E.060": "E.060 DS 010-2009-VIVIENDA (texto publicado en gob.pe)",
  "E.050": "E.050 (texto publicado en gob.pe; versión del documento por confirmar)",
  "E.030": "E.030-2018 (RM 355-2018-VIVIENDA), tablas verificadas en el estudio de normativa del agente",
};

// clave → {norma, dice}
export const VERIFICADAS = {
  planos: {norma: "E.060 1.2.4", dice: "Los planos del proyecto estructural deben contener como mínimo: normas empleadas, cargas vivas, f'c, tipo de acero, tamaño, localización y refuerzo de todos los elementos estructurales, detalles de anclajes y empalmes y las juntas de separación."},
  firma: {norma: "E.060 1.2.1.2", dice: "Los cálculos, planos, detalles y especificaciones deben llevar la firma de un Ingeniero Civil Colegiado, único autorizado a aprobar modificaciones."},
  recubrimientos: {norma: "E.060 7.7.1", dice: "Recubrimiento mínimo: 70 mm en concreto colocado contra el suelo; 40 mm en vigas y columnas; 20 mm en losas y viguetas (barras de 1 3/8\" y menores)."},
  ganchos: {norma: "E.060 7.1", dice: "Gancho estándar: doblez de 180° más 4 db (≥ 65 mm) o doblez de 90° más 12 db."},
  combinaciones: {norma: "E.060 9.2.1 y 9.2.3", dice: "U = 1.4 CM + 1.7 CV; con sismo U = 1.25 (CM + CV) ± CS y U = 0.9 CM ± CS."},
  espesorAligerado: {norma: "E.060 9.6.2.1 y Tabla 9.1", dice: "Peraltes mínimos de aligerados, losas y vigas en una dirección para no verificar deflexiones."},
  cuantiaColumnas: {norma: "E.060 10.9.1", dice: "El refuerzo longitudinal de columnas no debe ser menor que 0.01 ni mayor que 0.06 de Ag."},
  desarrollo: {norma: "E.060 12.2", dice: "Longitud de desarrollo de barras corrugadas."},
  empalmes: {norma: "E.060 12.15", dice: "Empalmes de barras corrugadas a tracción."},
  concretoSismico: {norma: "E.060 21.3.2.1", dice: "En elementos resistentes a sismo, f'c no debe ser menor que 21 MPa (≈ 210 kg/cm²)."},
  aceroSismico: {norma: "E.060 21.3.3", dice: "El refuerzo de elementos con responsabilidad sísmica es corrugado ASTM A706M; se permite ASTM A615M grados 280 y 420 si cumple las condiciones del artículo."},
  anchoVigas: {norma: "E.060 21.5.1.3", dice: "En vigas de pórticos el ancho bw no debe ser menor de 0.25 veces el peralte ni de 250 mm."},
  aceroVigas: {norma: "E.060 21.5.2.1", dice: "Refuerzo continuo a todo lo largo de la viga: 2 barras arriba y 2 abajo como mínimo."},
  empalmesVigas: {norma: "E.060 21.5.2.3", dice: "No se empalma por traslape dentro de los nudos ni a menos de dos veces el peralte de la cara del nudo."},
  estribosVigas: {norma: "E.060 21.5.3", dice: "Estribos cerrados de confinamiento en 2h desde la cara del apoyo; el primero a no más de 50 mm; separación ≤ d/4, 8 db, 24 de y 300 mm; fuera de esa zona ≤ d/2 (21.5.3.4)."},
  estribosColumnas: {norma: "E.060 21.6.4", dice: "Confinamiento de columnas con separación no mayor que la menor de: un tercio de la dimensión mínima, 6 veces el diámetro longitudinal y 100 mm (21.6.4.2); fuera de esa zona ≤ 10 db y 250 mm (21.6.4.5)."},
  ems: {norma: "E.050 art. 3 y 12", dice: "El EMS es obligatorio en los casos del art. 3 y su informe da las condiciones de cimentación (art. 12)."},
  profundidad: {norma: "E.050 art. 19", dice: "La profundidad de cimentación la define el profesional del EMS y no debe ser menor de 0.80 m en zapatas y cimientos corridos; la platea es una losa rígida armada en dos direcciones con viga perimetral a 0.40 m como mínimo."},
  presionAdmisible: {norma: "E.050 art. 17", dice: "La presión admisible depende de la profundidad, las dimensiones de la cimentación y el suelo de la zona activa."},
  deriva: {norma: "E.030-2018 tabla 11", dice: "Distorsión máxima de entrepiso 0.007 en concreto armado."},
  categoriaU: {norma: "E.030-2018 tabla 5", dice: "Factor de uso U: 1.5 (A1, A2), 1.3 (B), 1.0 (C)."},
};

export const fuenteDeCita = (norma) => FUENTE_TEXTO[Object.keys(FUENTE_TEXTO).find((k) => String(norma).startsWith(k))] ?? null;
