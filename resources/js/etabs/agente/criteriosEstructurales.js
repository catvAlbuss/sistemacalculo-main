// Criterios de diseño y dibujo de estructuras que usa el Agente Predim, tomados de
// los expedientes de referencia (storage/app/private/entrenamiento/estructuras/, fuera de git). Cada valor dice de dónde
// sale. Al estudiar más módulos (3, 09…) se comparan aquí y se ajustan.
//
// Ver docs/agentes/criterios-estructuras.md.

export const CRITERIOS = {
  referencia: "Módulo XIV, I.E. Churubamba (láminas E-64 cimentación/aligerado y E-65 pórticos)",

  concreto: {
    columnas: 210,              // kg/cm² — cuadro de columnas
    vigas: 210,                 // kg/cm² — detalle de canaleta y vigas
    columnetas: 175,            // kg/cm² — cuadro de columnetas
    cimientoCorrido: "Concreto ciclópeo f'c=100 kg/cm² + 30% PG",
    sobrecimiento: "Concreto f'c=140 kg/cm² + 25% PM",   // pórtico 8-8 "SC f'c=140kg/cm2+25%PM"
    falsaZapata: "Falsa zapata f'c=100 kg/cm²",
  },

  terreno: {
    relleno: "Terreno natural compactado al 95% M.D.S. según Próctor modificado",
    npt: 0.15,                  // m — N.P.T. = +0.15 (cortes 1-1, 2-2, 3-3)
    ntn: 0,                     // m — N.T.N. = +0.00
  },

  cimientoCorrido: {
    ancho: 0.6,                 // m — cortes: 0.60
    alto: 0.8,                  // m — N.F.C. = -0.80
    sobrecimientoAlto: 0.4,     // m — cota 0.40 en los cortes
  },

  platea: {
    espesor: 0.7,               // m — "ZAPATA CORRIDA Hz = 0.70 m"
    df: 2.0,                    // m — "Df = -2.00 m", "NFZ = -2.00 m"
    malla: 0.2,                 // m — separación de la malla dibujada en planta (≈0.20 en el plano)
    acero: 'Ø3/4" @0.15',       // "Ø3/4\"@15cm SUPERIOR" e "INFERIOR" (llamadas del plano de platea)
    // Los tres expedientes (módulos 3, 09 y 14, suelo S3) usan platea con zapata corrida
    // perimetral: es la cimentación por defecto; "con zapatas" la cambia.
    preferida: true,
  },

  columnas: {
    cuantiaMinima: 0.01,        // E.060: 1 % de Ag
    barra: '5/8"', areaBarra: 1.99,
    estribo: '3/8"',
    distribucion: "1@0.05, 9@0.10, Rto.@0.20 C/E",
    recubrimiento: 0.04,        // m
    // Estribos de confinamiento según la sección (cuadros de los módulos 3, 09 y 14):
    // columna T (CT 1.00x0.60) 12@0.10; placas y columnas de 0.50 m o más 10@0.10;
    // columnas menores (L 0.40x0.40) 9@0.10.
    distribucionPorSeccion: (c) => `1@0.05, ${c.prefijo === "CT" ? 12 : c.clase === "placa" || Math.max(c.b, c.h) >= 0.5 ? 10 : 9}@0.10, Rto.@0.20 C/E`,
  },

  columnetas: {
    estribo: '1/4"',
    distribucion: "1@0.05, 4@0.10, Rto.@0.20 C/E",
    barra: '3/8"',
    recubrimiento: 0.025,       // m
    // Varillas por cara larga: 2 hasta 0.21 m; desde ahí una cada 0.11 m
    // (cuadro de columnetas: 0.20→4, 0.22→6, 0.26→6, 0.65→12 varillas).
    varillasPorCara: (largo) => (largo <= 0.21 ? 2 : Math.floor(largo / 0.11) + 1),
  },


  vigas: {
    ancho: 0.25,
    peraltaMinimo: 0.4,         // V(0.25x0.40)
    estribo: '3/8"',
    distribucion: "1@0.05, 8@0.10, Rto.@0.20 C/E",
    recubrimiento: 0.04,        // "Recubrimiento: 4cm"
  },

  aligerado: {
    espesor: 0.2,               // "LOSA ALIGERADA E=20CM"
    separacionViguetas: 0.4,    // vigueta 0.10 + ladrillo 0.30
    alero: 0.6,                 // cotas 0.600 a cada lado (4.921 = 3.726 + 2 x 0.60)
    aceroTemperatura: 'Ø1/4" @0.25',
    ladrillo: "Ladrillo de techo 0.30x0.30x0.15",
  },

  techo: {
    pendiente: 0.33,            // "PLANCHA DE ALUZINC … TR4 … PTE=33%" (arquitectura, techo); cumbrera +4.12 con alero +3.57
    cobertura: "Cobertura plancha de aluzinc TIPO TR4 e=5mm",
    canaleta: {ancho: 0.2, alto: 0.15}, // detalle de canaleta f'c=210 en los extremos del pórtico
  },

  vanos: {
    alturaPuerta: 2.1,          // m — dintel sobre puertas (criterio usual; la arquitectura no acota el vano)
    alfeizar: 0.9,              // m — alféizar de ventanas
    alturaVentana: 2.1,         // m — viga solera (VSa) sobre ventanas
    dintel: 0.2,                // m — peralte del dintel / VSa
  },

  muro: "Muro de soga de ladrillo King Kong Tipo V - 23x12.5x9cm",   // pórtico 8-8

  dibujo: {
    escalaPlanos: "1/25",       // planos de la lámina al doble de la arquitectura 1/50
    cotasEnCadena: true,        // columna + luz libre + columna, y total entre ejes
  },
};

// Texto de estribos tal como lo escribe el expediente.
export const textoEstribos = (estribo, distribucion, cantidad = 1) => `${cantidad > 1 ? `${cantidad} ` : ""}□ ${estribo}Ø: ${distribucion}`;

// Posiciones de estribos a lo largo de un elemento de largo `largo` (m), desde cada
// extremo según la distribución del expediente ("1@0.05, 9@0.10, Rto.@0.20"):
// el primero a 0.05, luego los de confinamiento, y el resto al centro.
export function posicionesEstribos(distribucion, largo) {
  const tramos = [...String(distribucion).matchAll(/(\d+|Rto\.?)\s*@\s*(\d+(?:\.\d+)?)/gi)].map((m) => ({n: /rto/i.test(m[1]) ? Infinity : Number(m[1]), s: Number(m[2])}));
  const lado = [];
  let x = 0;
  for (const {n, s} of tramos) {
    for (let i = 0; i < n && x + s <= largo / 2 + 1e-9; i++) { x += s; lado.push(x); }
  }
  const todos = [...lado, ...lado.map((p) => largo - p)].filter((p) => p > 0.01 && p < largo - 0.01).sort((a, b) => a - b);
  return todos.filter((p, i) => i === 0 || p - todos[i - 1] > 0.03);
}
