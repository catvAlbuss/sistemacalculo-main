// content-structure.js - Estructura del contenido para generar documentos Word
const predimImg = "/assets/img/predim.jpg";

export const CONTENT_STRUCTURE = {
    // Configuración global del documento
    document: {
        title: "MEMORIA DE CALCULO DE MURO DE CONTENCIÓN",
        sections: [
            {
                id: "generalidades",
                title: "1. GENERALIDADES",
                level: 1,
                content: [
                    {
                        type: "heading",
                        level: 2,
                        text: "1.1. ALCANCES DE DOCUMENTOS"
                    },
                    {
                        type: "paragraph",
                        text: "El proyecto estructural desarrollado se basó en proponer las medidas óptimas más adecuadas para el buen desempeño de las Edificaciones del proyecto, sometidas a cargas de gravedad y a solicitaciones sísmicas. Estas edificaciones han sido modeladas según los parámetros indicados en las actuales normas estructurales vigentes y teniendo en cuenta las hipótesis de análisis estructural.",
                        alignment: "JUSTIFIED"
                    }
                ]
            },
            {
                id: "normas",
                title: "2. NORMAS Y CÓDIGOS DE REFERENCIA",
                level: 1,
                content: [
                    {
                        type: "heading",
                        level: 2,
                        text: "2.1. NORMAS"
                    },
                    {
                        type: "list",
                        listType: "bullet",
                        items: [
                            "Presentar instrucciones detalladas para realizar cálculos de diseño de muros de contención en voladizo, cumpliendo con las normativas relevantes, como AASHTO, CCP 14 y NSR10",
                            "AASHTO LRFD Bridge Design Specifications (2020): Es una normativa creada por la Asociación Americana de funcionarios de Carreteras y Transporte (American Association of state Highways and Transportation Officials -- AASHTO). Guía el diseño estructural de puentes en Estados unidos. Su enfoque es LRFD, se utilizan factores de carga y resistencia en lugar de factores de seguridad. Abreviada en manual como AASHTO LRFD o AASHTO LRFD de 2020"
                        ]
                    }
                ]
            },
            {
                id: "muros-contencion",
                title: "3. MUROS DE CONTENCIÓN",
                level: 1,
                content: [
                    {
                        type: "paragraph",
                        text: "Los muros de contención se utilizan para detener masas de tierra u otros materiales sueltos cuando las condiciones no permiten que estas masas asuman sus pendientes naturales. Estas condiciones se presentan cuando el ancho de una excavación, corte o terraplén está restringido por condiciones de propiedad, utilización de la estructura o economía.",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "heading",
                        level: 2,
                        text: "MURO TIPO MENSULA",
                        underline: true
                    },
                    {
                        type: "paragraph",
                        text: "Son muros de hormigón fuertemente armados. Presentan ligeros movimientos de flexión y dado que el cuerpo trabaja como un voladizo vertical, su espesor requerido aumenta rápidamente con el incremento de la altura del muro. Presentan un saliente o talón sobre el que se apoya parte del terreno, de manera que el muro y terreno trabajen en conjunto.",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "paragraph",
                        text: "Siempre que sea posible, una extensión en el puntal o la punta con una dimensión entre un tercio y un cuarto del ancho de la base suministra una solución más económica.",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "paragraph",
                        text: "Tipos distintos de muros estructurales son los muros \"en L\", \"en T invertida\".",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "paragraph",
                        text: "En algunos casos, los límites de la propiedad u otras restricciones obligan a colocar el muro en el borde delantero de la base, es decir, a omitir el puntal. Es en estas ocasiones que se utilizan los muros en L.",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "image",
                        src: predimImg,
                        width: 350,
                        height: 233,
                        alignment: "CENTER"
                    }
                ]
            },
            {
                id: "diseno-muro-315",
                title: "3.1. DISEÑO DE MURO H= {{geometria.altura}} m",
                level: 2,
                content: [
                    {
                        type: "paragraph",
                        text: "Para el cálculo del muro de contención se procede a calcular las fuerzas a las que estará sometido, a continuación, se detallan dichas presiones.",
                        alignment: "JUSTIFIED"
                    },
                    // {
                    //     type: "dynamic-content",
                    //     generator: "generateMuroCalculation",
                    //     params: {
                    //         //altura: "{{altura_muro}}",
                    //         altura: "{{geometria.altura}}",
                    //         tipo: "muro315"
                    //     }
                    // },
                    {
                        type: "table",
                        title: "Datos:",
                        columns: [
                            { header: "Parámetro", width: 50 },
                            { header: "Simbología", width: 20 },
                            { header: "Valor", width: 30 },
                            { header: "Unidad", width: 40 }
                        ],
                        rows: [
                            ["Altura del muro", "H", "{{geometria.altura}}", "m"],
                            ["Capacidad Portante del suelo", "σADM", "{{geometria.adm}}", "Tn/m²"]
                        ]
                    },
                    {
                        type: "table",
                        title: "Predimensionamiento:",
                        columns: [
                            { header: "Parámetro", width: 50 },
                            { header: "Simbología", width: 20 },
                            { header: "Valor", width: 30 },
                            { header: "Unidad", width: 40 }
                        ],
                        rows: [
                            ["Punta", "", "{{geometria.punta}}", "m"],
                            ["Base de la pantalla", "k", "{{geometria.bpantalla}}", ""],
                            ["Peralte de la zapata", "k", "{{geometria.pzapata}}", ""],
                            ["Ancho de la zapata", "k", "{{geometria.azapata}}", ""],
                        ]
                    },
                    {
                        type: "table",
                        title: "Presión del Suelo",
                        columns: [
                            { header: "Parámetro", width: 50 },
                            { header: "Simbología", width: 20 },
                            { header: "Valor", width: 30 },
                            { header: "Unidad", width: 40 }
                        ],
                        rows: [
                            ["Peso Específico Concreto", "yc", "{{materiales.yc}}", "Tn/m³"],
                            ["Peso Específico Suelo", "ys", "{{materiales.ys}}", "Tn/m³"],
                            ["Ángulo de Fricción", "θ", "{{materiales.B12}}", "°"],
                            ["Cohesión", "c", "{{materiales.B13}}", ""],
                            ["Inclinación Terreno", "β", "{{materiales.B20}}", "°"],

                            ["Altura de sobrecarga", "ha", "{{materiales.B98}}", ""],
                            ["Coeficiente activo", "ka", "{{materiales.B99}}", ""],
                            ["Coeficiente pasivo", "kp", "{{materiales.B100}}", ""],
                            ["Coeficiente reposo", "ko", "{{materiales.B101}}", ""],
                        ]
                    },
                    {
                        type: "paragraph",
                        text: "Con estos valores se genera el gráfico de fuerzas actuantes",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "heading",
                        level: 3,
                        text: "VERIFICACIÓN DEL CÁLCULO",
                        underline: true
                    },
                    {
                        type: "paragraph",
                        text: "Para el cálculo de un muro de contención de tierras es necesario tener en cuenta las fuerzas que actúan sobre él, como son la presión lateral del suelo y aquellas que provienen de éste, como son el peso propio. Con estos datos podemos verificar los siguientes parámetros:",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "paragraph",
                        text: {
                            parts: [
                                { text: "Verificación de deslizamiento:", bold: true },
                                { text: "\n\nSe verifica que la componente horizontal del empuje de la tierra (Fh) no supere la fuerza de retención (Fr) debido a la fricción entre la cimentación y el suelo, proporcional al peso del muro. En algunos casos, puede incrementarse (Fr) con el empuje pasivo del suelo en la parte baja del muro. Normalmente se acepta como seguro un muro si se da la relación: Fr/Fh > 1.5 (esta relación se puede llamar también coeficiente de seguridad al deslizamiento)." }
                            ]
                        },
                        alignment: "JUSTIFIED"
                    },
                    // {
                    //     type: "calculation-result",
                    //     template: "Durante el análisis se determinó que el factor de seguridad al deslizamiento es {{fs_deslizamiento}}, cumpliendo con el criterio mínimo de 1.5.",
                    //     variables: {
                    //         "fs_deslizamiento": "calcularFactorDeslizamiento"
                    //     }
                    // },
                    {
                        type: "paragraph",
                        text: {
                            parts: [
                                { text: "Verificación de volteo o vuelto:", bold: true },
                                { text: "\n\nSe verifica que el momento de las fuerzas (Mv) que tienden a voltear el muro sea menor al momento que tienden a estabilizar el muro (Me) en una relación de por lo menos 1.5. Es decir: Me/Mv > 1.5 (coeficiente de seguridad al volteo)." }
                            ]
                        },
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "paragraph",
                        text: {
                            parts: [
                                { text: "Verificación de la capacidad de sustentación:", bold: true },
                                { text: "\n\nSe determina la carga total que actúa sobre la cimentación con el respectivo diagrama de tensiones y se verifica que la carga transmitida al suelo (Ta) sea inferior a la capacidad portante (Tp), o en otras palabras que la máxima tensión producida por el muro sea inferior a la tensión admisible en el terreno. Es decir: ", bold: false },
                                { text: "Tp/Ta > 1.0", bold: true },
                                { text: " (coeficiente de seguridad a la sustentación)." }
                            ]
                        },
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "paragraph",
                        text: "A continuación, se presentan las verificaciones de estabilidad del muro.",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "verification-table",
                        generator: "generateVerificationTable",
                        params: {
                            tipo_muro: "muro315"
                        }
                    },
                    {
                        type: "captured-image",
                        elementId: "tabla-dimensionamiento-resultado",
                        width: 400,
                        height: 400,
                        alignment: "CENTER"
                    },
                    {
                        type: "heading",
                        level: 3,
                        text: "VERIFICACIÓN DE ANÁLISIS SÍSMICO",
                        underline: true
                    },
                    {
                        type: "paragraph",
                        text: "El análisis sísmico de muros de contención es el conjunto de procedimientos técnicos encaminados a cuantificar y verificar la estabilidad de la estructura frente a las cargas dinámicas generadas por un terremoto. A diferencia del empuje estático que considera únicamente el peso propio de los materiales y cargas permanentes, el análisis sísmico introduce esfuerzos adicionales (empuje sísmico) que pueden reducir la capacidad de resistencia al volteo, al deslizamiento y a la capacidad portante del terreno.",
                        alignment: "JUSTIFIED"
                    },
                    // {
                    //     type: "seismic-analysis-table",
                    //     generator: "generateSeismicAnalysisTable",
                    //     params: {
                    //         tipo_muro: "muro315"
                    //     }
                    // },
                    {
                        type: "heading",
                        level: 3,
                        text: "VERIFICACIÓN POR ESFUERZOS DEL TERRENO",
                        underline: true
                    },
                    {
                        type: "paragraph",
                        text: "La verificación por esfuerzos del terreno consiste en comprobar que las presiones ejercidas por el suelo sobre el muro de contención, bajo condiciones estáticas, no provoquen fallas por deslizamiento, volteo o exceso de asientos en la cimentación.",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "captured-image",
                        elementId: "grafico-verificaciones",
                        width: 600,
                        height: 400,
                        alignment: "CENTER"
                    },
                    // {
                    //     type: "soil-stress-table",
                    //     generator: "generateSoilStressTable",
                    //     params: {
                    //         tipo_muro: "muro315"
                    //     }
                    // },
                    {
                        type: "heading",
                        level: 3,
                        text: "DISEÑO DE CONCRETO ARMADO",
                        underline: true
                    },
                    {
                        type: "paragraph",
                        text: "La mecánica de suelos, la resistencia de materiales y las exigencias normativas. En su esencia, consiste en transformar las cargas (peso propio, empuje de tierras, sobrecargas y, cuando procede, acciones sísmicas) en esfuerzos de flexión, cortante y esfuerzo axial.",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "subsection",
                        title: "PANTALLA",
                        content: [
                            {
                                type: "paragraph",
                                text: "La Pantalla es un sistema de contención que retiene el terreno y controla filtraciones permitiendo excavaciones progresivas tiene la profundidades de 3m hasta más de 20 m",
                                alignment: "JUSTIFIED"
                            },
                            {
                                type: "captured-image",
                                elementId: "content-pantalla",
                                width: 700,        // Ancho fijo
                                height: null,      // Altura automática
                                alignment: "CENTER",
                                allowLongContent: true  // Flag para contenido largo
                            },
                            // {
                            //     type: "reinforcement-tables",
                            //     generator: "generateReinforcementTables",
                            //     params: {
                            //         element: "pantalla",
                            //         tipo_muro: "muro315"
                            //     }
                            // }
                        ]
                    },
                    {
                        type: "subsection",
                        title: "PUNTA",
                        content: [
                            {
                                type: "paragraph",
                                text: "La punta o puntera es la prolongación de la zapata del muro de contención hacia el lado del terreno retenido. Su misión principal es mejorar la estabilidad frente a deslizamiento y aumentar el brazo de palanca que resiste el vuelco.",
                                alignment: "JUSTIFIED"
                            },
                            {
                                type: "captured-image",
                                elementId: "content-punta",
                                width: 700,        // Ancho fijo
                                height: null,      // Altura automática
                                alignment: "CENTER",
                                allowLongContent: true  // Flag para contenido largo
                            },
                            // {
                            //     type: "reinforcement-tables",
                            //     generator: "generateReinforcementTables",
                            //     params: {
                            //         element: "punta",
                            //         tipo_muro: "muro315"
                            //     }
                            // }
                        ]
                    },
                    {
                        type: "subsection",
                        title: "TALÓN",
                        content: [
                            {
                                type: "paragraph",
                                text: "El talón es la parte de la base o zapata de un muro de contención que se extiende hacia el lado del terreno retenido. Es un elemento fundamental que contribuye a la estabilidad global del muro, ya que mejora el equilibrio frente al vuelco, deslizamiento, y distribuye mejor las presiones al terreno.",
                                alignment: "JUSTIFIED"
                            },
                            {
                                type: "captured-image",
                                elementId: "content-talon",
                                width: 700,        // Ancho fijo
                                height: null,      // Altura automática
                                alignment: "CENTER",
                                allowLongContent: true  // Flag para contenido largo
                            },
                            // {
                            //     type: "reinforcement-tables",
                            //     generator: "generateReinforcementTables",
                            //     params: {
                            //         element: "talon",
                            //         tipo_muro: "muro315"
                            //     }
                            // }
                        ]
                    },
                    {
                        type: "subsection",
                        title: "Graficos",
                        content: [
                            {
                                type: "paragraph",
                                text: "Muros de contencion",
                                alignment: "JUSTIFIED"
                            },
                            {
                                type: "captured-image",
                                elementId: "predimsMC",
                                width: 700,        // Ancho fijo
                                height: null,      // Altura automática
                                alignment: "CENTER",
                                allowLongContent: true  // Flag para contenido largo
                            },
                            {
                                type: "captured-image",
                                elementId: "grafico-dimensionamiento",
                                width: 700,        // Ancho fijo
                                height: 800,      // Altura automática
                                alignment: "CENTER",
                                allowLongContent: true  // Flag para contenido largo
                            },
                        ]
                    },
                ]
            },
            // {
            //     id: "diseno-muro-425",
            //     title: "3.2. DISEÑO DE MURO H=4.25m",
            //     level: 2,
            //     content: [
            //         // Similar structure to muro 3.15m but with different parameters
            //         {
            //             type: "paragraph",
            //             text: "Para el cálculo del muro de contención se procede a calcular las fuerzas a las que estará sometido, a continuación, se detallan dichas presiones.",
            //             alignment: "JUSTIFIED"
            //         },
            //         // ... rest of the content following the same pattern
            //     ]
            // },
            // {
            //     id: "diseno-muro-575",
            //     title: "3.3. DISEÑO DE MURO H=5.75m",
            //     level: 2,
            //     content: [
            //         // Similar structure to previous muros
            //     ]
            // },
            {
                id: "conclusiones",
                title: "4. CONCLUSIONES Y RECOMENDACIONES",
                level: 1,
                content: [
                    {
                        type: "list",
                        listType: "bullet",
                        items: [
                            "Los muros de contención están diseñados por verificación de estabilidad y por diseño en concreto armado, verificando todas las consideraciones normadas",
                            "Se recomienda hacer un tratamiento de drenaje en la parte enterrada del muro para que así no exista presión hidrostática, colocar un dren francés de 40 cm detrás del muro con material granular seleccionado.",
                            "Se recomienda generar lloraderas con tubos de 2'' que estén separados como máximo 1m en la vertical y la horizontal.",
                            "De existir juntas de construcción se deberá realizar un tratamiento con aditivos epóxidos.",
                            "Se debe de considerar que el concreto a usar esté con aditivos plastificantes",
                            "Las juntas de dilatación deberán ser de 1 pulg cada 20m, cortando toda la pantalla."
                        ]
                    }
                ]
            }
        ]
    }
};

// Generadores de contenido dinámico
export const CONTENT_GENERATORS = {
    generateMuroCalculation: (params, data) => {
        // Generar cálculos específicos del muro
        return {
            type: "calculation-block",
            title: `Cálculos para Muro H=${params.altura}m`,
            calculations: [
                {
                    formula: "Pa = 0.5 × γ × H² × Ka",
                    description: "Empuje activo del suelo",
                    result: data.empuje_activo || "Calculando..."
                },
                {
                    formula: "Ws = γc × Volumen_muro",
                    description: "Peso del muro",
                    result: data.peso_muro || "Calculando..."
                }
            ]
        };
    },

    generateVerificationTable: (params, data) => {
        // 1. --- DEFINICIÓN DE COLUMNAS ---
        const columnas = [
            { header: 'COMPONENTE', width: 15 },
            { header: 'AREA(m²)', width: 15 },
            { header: 'Fy PESO(Tn)', width: 15 },
            { header: 'Fx(Tn)', width: 15 },
            { header: 'Brazo (y) m', width: 15 },
            { header: 'Brazo (x) m', width: 15 },
            { header: 'MOMENTO(Tn·m)', width: 20 },
            { header: 'P Friccion', width: 15 },
            { header: 'DESCRIPCION', width: 30 }
        ];

        // Función para formatear los valores
        const formatValue = (val) => {
            if (val === null || val === undefined) return "";
            const num = parseFloat(val);
            if (isNaN(num)) return "";
            if (Math.abs(num) < 0.005) return ""; // Cubre 0 y 0.00 pero no 0.02
            return num.toFixed(2);
        };

        const filas = [];
        if (data && data.verificaciones) {
            const ordenFilas = [2, 3, 0, 5, 4, 0, 1, 6, 7, 8, 9, 10, 11, 12, 0];
            const descripciones = [
                'Empuje sismico',
                'Empuje ACTIVO',
                'Emp ACTI COH',
                'Empuje s/c',
                'EMPUJE PASIVO',
                'Emp PASI COH',
                'CARGA PUNTUAL',
                'S/C',
                'SUELO TALUD',
                'SUELO',
                'BASE',
                'CUÑA',
                'PANTALLA',
                'DIENTE',
                'Cof. Cohes'
            ];

            for (let idx = 0; idx < ordenFilas.length; idx++) {
                const orden = ordenFilas[idx];
                if (orden === 0) continue; // Saltar si no hay dato válido

                const filaIndex = 170 + orden; // 171, 172, etc.
                const ver = data.verificaciones;

                const fila = [
                    formatValue(orden), // Componente
                    formatValue(ver[`B${filaIndex}`]),
                    formatValue(ver[`C${filaIndex}`]),
                    formatValue(ver[`D${filaIndex}`]),
                    formatValue(ver[`G${filaIndex}`]),
                    formatValue(ver[`H${filaIndex}`]),
                    formatValue(ver[`E${filaIndex}`]),
                    formatValue(ver[`F${filaIndex}`]),
                    descripciones[idx] || ''
                ];
                filas.push(fila);
            }
        }

        return {
            type: "table",
            title: "Tabla de Cargas y Momentos",
            columns: columnas,
            rows: filas
        };
    },

    generateSeismicAnalysisTable: (params, data) => {
        return {
            type: "table",
            title: "Análisis Sísmico",
            columns: [
                { header: "Parámetro", width: 50 },
                { header: "Valor", width: 50 }
            ],
            rows: [
                ["Coeficiente sísmico horizontal (Kh)", data.kh || "{{kh}}"],
                ["Empuje sísmico (ΔPae)", data.empuje_sismico || "{{empuje_sismico}}"],
                ["Factor de seguridad sísmico", data.fs_sismico || "{{fs_sismico}}"]
            ]
        };
    },

    generateSoilStressTable: (params, data) => {
        return {
            type: "table",
            title: "Esfuerzos en el Terreno",
            columns: [
                { header: "Ubicación", width: 40 },
                { header: "Esfuerzo (kPa)", width: 30 },
                { header: "Admisible (kPa)", width: 30 }
            ],
            rows: [
                ["Punta", data.esfuerzo_punta || "{{esfuerzo_punta}}", data.admisible_punta || "{{admisible_punta}}"],
                ["Talón", data.esfuerzo_talon || "{{esfuerzo_talon}}", data.admisible_talon || "{{admisible_talon}}"]
            ]
        };
    },

    generateReinforcementTables: (params, data) => {
        const element = params.element;
        const reinforcementData = data.reinforcement?.[element] || {};

        return [
            {
                type: "table",
                title: `Refuerzo Principal - ${element.toUpperCase()}`,
                columns: [
                    { header: "Dirección", width: 30 },
                    { header: "Acero Calculado", width: 25 },
                    { header: "Acero Mínimo", width: 25 },
                    { header: "Acero Adoptado", width: 20 }
                ],
                rows: [
                    ["Horizontal", reinforcementData.as_horizontal || "{{as_horizontal}}", reinforcementData.as_min_h || "{{as_min_h}}", reinforcementData.as_adopt_h || "{{as_adopt_h}}"],
                    ["Vertical", reinforcementData.as_vertical || "{{as_vertical}}", reinforcementData.as_min_v || "{{as_min_v}}", reinforcementData.as_adopt_v || "{{as_adopt_v}}"]
                ]
            },
            {
                type: "table",
                title: `Distribución de Barras - ${element.toUpperCase()}`,
                columns: [
                    { header: "Cara", width: 25 },
                    { header: "Diámetro", width: 25 },
                    { header: "Separación", width: 25 },
                    { header: "Longitud", width: 25 }
                ],
                rows: [
                    ["Interior", reinforcementData.diam_int || "{{diam_int}}", reinforcementData.sep_int || "{{sep_int}}", reinforcementData.long_int || "{{long_int}}"],
                    ["Exterior", reinforcementData.diam_ext || "{{diam_ext}}", reinforcementData.sep_ext || "{{sep_ext}}", reinforcementData.long_ext || "{{long_ext}}"]
                ]
            }
        ];
    }
};

// Plantillas de variables dinámicas
export const VARIABLE_TEMPLATES = {
    // Variables de entrada
    altura_muro: "data.geometria.altura",
    peso_especifico_suelo: "data.suelo.peso_especifico",
    angulo_friccion: "data.suelo.angulo_friccion",
    cohesion: "data.suelo.cohesion",

    // Variables calculadas
    fs_deslizamiento: "calculations.factorSeguridadDeslizamiento()",
    fs_volteo: "calculations.factorSeguridadVolteo()",
    fs_sustentacion: "calculations.factorSeguridadSustentacion()",

    // Estados de verificación
    estado_deslizamiento: "verifications.estadoDeslizamiento()",
    estado_volteo: "verifications.estadoVolteo()",
    estado_sustentacion: "verifications.estadoSustentacion()",

    // Análisis sísmico
    kh: "data.sismo.coeficiente_horizontal",
    empuje_sismico: "calculations.empujeSismico()",
    fs_sismico: "calculations.factorSeguridadSismico()",

    // Esfuerzos
    esfuerzo_punta: "calculations.esfuerzoPunta()",
    esfuerzo_talon: "calculations.esfuerzoTalon()",
    admisible_punta: "data.suelo.capacidad_portante",
    admisible_talon: "data.suelo.capacidad_portante",

    // Refuerzo
    as_horizontal: "reinforcement.aceroHorizontal()",
    as_vertical: "reinforcement.aceroVertical()",
    as_min_h: "reinforcement.aceroMinimoHorizontal()",
    as_min_v: "reinforcement.aceroMinimoVertical()",
    as_adopt_h: "reinforcement.aceroAdoptadoHorizontal()",
    as_adopt_v: "reinforcement.aceroAdoptadoVertical()"
};