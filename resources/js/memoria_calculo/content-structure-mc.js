import { type } from "jquery";

// content-structure-mc.js - Estructura base para Memoria de Calculo
export const DEFAULT_MC_STRUCTURE = {
    document: {
        title: "MEMORIA DE CÁLCULO",
        sections: [
            {
                id: "generalidades",
                title: "1. GENERALIDADES",
                level: 1,
                content: [
                    {
                        type: "heading",
                        level: 2,
                        text: "1.1. ALCANCE DE DOCUMENTOS"
                    },
                    {
                        type: "paragraph",
                        text: {
                            parts: [
                                { text: "En el presente documento se establecen los criterios de diseño a seguir para las estructuras del proyecto: " },
                                { text: "{{cover.project}}", bold: true },
                                { text: "\n\nEl proyecto estructural para desarrollar se basará en proponer medidas óptimas para el buen desempeño de las estructuras proyectadas, sometida a cargas de gravedad, solicitaciones por viento y solicitaciones sísmicas. Esta estructura será modelada según los parámetros de la actual Norma de Estructuras vigente y teniendo en consideración la hipótesis de análisis siguiente: El análisis estructural y sismico de la estructura se realizó mediante un modelo tridimensional." }
                            ]
                        },
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "list",
                        listType: "bullet",
                        items: [
                            "Norma Técnica de Edificación E.020: Cargas\nReglamento Nacional de Edificaciones (RNE)",
                            "Norma Técnica de Edificación E.030: Diseño Sismo resistente\nReglamento Nacional de Edificaciones (RNE)",
                            "Norma Técnica de Edificación E.050: Suelos y Cimentaciones\nReglamento Nacional de Edificaciones (RNE)",
                            "Norma Técnica de Edificación E.060: Concreto Armado\nReglamento Nacional de Edificaciones (RNE)",
                            "Norma Técnica de Edificación E.090: Estructura Metálica\nReglamento Nacional de Edificaciones (RNE)"
                        ]
                    },
                    {
                        type: "heading",
                        level: 2,
                        text: "1.2. UBICACIÓN DEL PROYECTO"
                    },
                    {
                        type: "paragraph",
                        text: {
                            parts: [
                                { text: "La zona de estudio del proyecto " },
                                { text: "{{cover.project}}", bold: true }
                            ]
                        },
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "image",
                        src: "/assets/img/memoriacalculos/ubicacionzonaNorma.png",
                        alignment: "CENTER",
                        width: 500,
                        height: 250
                    },
                    {
                        type: "heading",
                        level: 2,
                        text: "1.3. CONSIDERACIONES SÍSMICAS"
                    },
                    {
                        type: "heading",
                        level: 3,
                        text: "1.3.1. ZONIFICACIÓN (Z)"
                    },
                    {
                        type: "paragraph",
                        text: "De acuerdo con el mapa del Reglamento Nacional de Edificaciones-Norma E.030, el área de estudio se localiza en la zona {{cover.seismicZone}}, correspondiéndole un factor de Z={{cover.seismicZoneFactor}}.",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "image",
                        src: "/assets/img/memoriacalculos/mapazonificacion.png",
                        alignment: "CENTER",
                        width: 500,
                        height: 350
                    },
                    {
                        type: "heading",
                        level: 3,
                        text: "1.3.2. PARÁMETROS DE SUELO"
                    },
                    {
                        type: "paragraph",
                        text: "Para efectos de la aplicación de la norma E-0.30 de diseño sismo-resistente, se adopta el perfil de suelo {{cover.soilFactor}}. Para la zona {{cover.seismicZone}}, el factor de suelo correspondiente es {{cover.soilValue}}. Asimismo, para el periodo seleccionado {{cover.soilPeriod}}, el valor correspondiente es {{cover.soilPeriodValue}}s según la Tabla N°4. Los valores de S, Tp y Tl se muestran en las Tablas N°3 y N°4 (NORMA E-030 - DISEÑO SISMORESISTENTE).",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "image",
                        src: "/assets/img/memoriacalculos/factorsuelo.png",
                        alignment: "CENTER",
                        width: 500,
                        height: 200
                    },
                    {
                        type: "image",
                        src: "/assets/img/memoriacalculos/periodos.png",
                        alignment: "CENTER",
                        width: 500,
                        height: 150
                    },
                    {
                        type: "heading",
                        level: 3,
                        text: "1.3.3. FACTOR DE AMPLIACIONES SÍSMICAS"
                    },
                    {
                        type: "paragraph",
                        text: "De acuerdo con las características de sitio, se define el factor de amplificación sísmica (C) por las siguientes expresiones:",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "image",
                        src: "/assets/img/memoriacalculos/factorampliaciones.png",
                        alignment: "CENTER",
                        width: 200,
                        height: 100
                    },
                    {
                        type: "paragraph",
                        text: "T es el período de acuerdo con el numeral 4.5.4, concordado con el numeral 4.6.1 de la E.030. Este coeficiente se interpreta como el factor de amplificación de la aceleración estructural respecto de la aceleración en el suelo.:",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "heading",
                        level: 3,
                        text: "1.3.4. CATEGORÍAS DE LAS EDIFICACIONES"
                    },
                    {
                        type: "paragraph",
                        text: "Cada estructura debe ser clasificada de acuerdo con la categoría de uso. Para la categoría {{cover.buildingCategory}}, corresponde el factor de importancia U = {{cover.importanceFactorU}}.",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "image",
                        src: "/assets/img/memoriacalculos/categoriaEdificaciones.png",
                        caption: "Categoría de las Edificaciones",
                        alignment: "CENTER",
                        width: 500,
                        height: 350
                    },
                    {
                        type: "heading",
                        level: 3,
                        text: "1.3.5. SISTEMAS ESTRUCTURALES ( R )"
                    },
                    {
                        type: "paragraph",
                        text: "Los sistemas estructurales se clasifican según los materiales usados y el sistema de estructuración Sismo Resistente predominante en cada dirección. De acuerdo con la clasificación de una estructura se elige un factor de reducción de la fuerza sísmica (R).",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "paragraph",
                        text: "Para la Categoría {{cover.buildingCategory}} y la zona {{cover.seismicZone}}, en la que se ubica el proyecto, está permitido proyectar los Sistemas Estructurales: {{cover.structuralSystemDescription}}",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "image",
                        src: "/assets/img/memoriacalculos/sistemaestructurales.png",
                        caption: "Sistemas Estructurales",
                        alignment: "CENTER",
                        width: 500,
                        height: 480
                    },
                    {
                        type: "paragraph",
                        text: "Se realizó la verificación del aporte de la cortante en los elementos participantes por eje estructural, para la definición del sistema estructural, los cuales se establecen en la tabla resumen que se adjunta.",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "heading",
                        level: 2,
                        text: "1.4. DESCRIPCIÓN DE ELEMENTOS ESTRUCTURALES"
                    },
                    {
                        type: "paragraph",
                        text: "La presente infraestructura ha sido diseñada considerando criterios de seguridad estructural, funcionalidad y cumplimiento normativo, en concordancia con la Norma Técnica E.060 (Diseño de Concreto Armado) y E.030 (Norma Sismorresistente).",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "heading",
                        level: 2,
                        text: "1.5. MATERIAL DE DISEÑO"
                    },
                    {
                        type: "paragraph",
                        text: "Se consideraron las siguientes característica de los materiales que conforman esta estructura",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "paragraph",
                        text: "Acero estructural (ASTM A36)",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "list",
                        listType: "bullet",
                        items: [
                            "Fluencia: fy = 4,200 kg/cm2, Grado 60",
                            "Módulo de elasticidad: E = 2,038,901.92 kg/cm2",
                        ]
                    },
                    {
                        type: "paragraph",
                        text: "Acero Corrugado (ASTM A605)",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "list",
                        listType: "bullet",
                        items: [
                            "Fluencia: fy = 4,200 kg/cm2, Grado 60.",
                            "Módulo de elasticidad: E = 2,038,901.92 kg/cm2",
                        ]
                    },
                    {
                        type: "paragraph",
                        text: "Concreto",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "list",
                        listType: "bullet",
                        items: [
                            "Resistencia nominal: :f´c = 210 kg/cm2",
                            "Módulo de elasticidad: E = 253,456.4kg/cm2",
                            "Peso específico: 2.4 ton/m3",
                            "Coeficiente de Poisson: u = 0.2",
                        ]
                    }
                ]
            },
            {
                id: "analisis_cargas",
                title: "2. ANÁLISIS DE CARGAS POR GRAVEDAD",
                level: 1,
                content: [
                    {
                        type: "heading",
                        level: 2,
                        text: "2.1 MODELO ESTRUCTURAL"
                    },
                    {
                        type: "paragraph",
                        text: "En el análisis sísmico de las Edificaciones del proyecto se utilizó el programa ETABS. Las diversas edificaciones fueron analizadas con modelos tridimensionales, suponiendo losas infinitamente rígidas frente a acciones en su plano. En el análisis de la estructura se supuso un comportamiento lineal y elástico. Los elementos de concreto armado se representaron con elementos lineales. Los muros de albañilería se modelaron con elementos tipo Shell, con rigideces de membrana y de flexión, aun cuando estas últimas son poco significativas. Los modelos se analizaron considerando sólo los elementos estructurales, sin embargo, los elementos no estructurales han sido ingresados en el modelo como solicitaciones de carga debido a que aquellos no son importantes en la contribución de la rigidez y resistencia de la edificación.",
                        alignment: "JUSTIFIED"
                    },
                    /**Imgen estructural */
                    {
                        type: "heading",
                        level: 2,
                        text: "2.2 CASOS DE CARGA"
                    },
                    {
                        type: "paragraph",
                        text: "Para el diseño estructural de la edificación del presente proyecto se utilizaron las siguientes cargas acordes al RNE. E060 (Concreto Armado).",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "image",
                        src: "/assets/img/memoriacalculos/casoscarga.png",
                        alignment: "CENTER",
                        width: 500,
                        height: 250
                    },
                    {
                        type: "list",
                        listType: "bullet",
                        items: [
                            "CM: CARGA MUERTA.",
                            "CV: CARGA VIVA ENTRE PISOS.",
                            "CVT: CARGA VIVA TECHO.",
                            "SEX: CARGA SÍSMICA ESTATICA EN DIRECCION X.",
                            "SEY: CARGA SÍSMICA ESTATICA EN DIRECCION Y.",
                            "SDX: CARGA SÍSMICA DINÁMICA EN DIRECCION X.",
                            "SDY: CARGA SÍSMICA DINÁMICA EN DIRECCION Y."
                        ]
                    },
                    /*/*Imagen casos de carga ETABS     ESPECTRO XX*/
                    {
                        type: "paragraph",
                        text: "Para el desarrollo del análisis dinámico modal espectral, se ha definido la función de espectro denominada “ESPECTRO XX”, la cual representa la acción sísmica de diseño correspondiente a las condiciones del sitio del proyecto, conforme a los criterios establecidos por la Norma E.030 “Diseño Sismorresistente”.",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "paragraph",
                        text: "Los parámetros adoptados para la generación del espectro son los siguientes:",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "list",
                        listType: "bullet",
                        items: [
                            "Zona sísmica: 2",
                            "Categoría de ocupación (C): Edificación de uso general o de baja importancia, según clasificación de la norma.",
                            "Tipo de suelo (S2): Suelo intermedio, con propiedades de rigidez media y comportamiento predominante en periodos intermedios.",
                            "Factor de irregularidad en altura (Ia): 1.00",
                            "Factor de irregularidad en planta (Ip): 1.00",
                            "Factor de modificación de la respuesta básica (R₀): 7.00",
                            "Amortiguamiento crítico considerado (ξ): 5%",
                        ]
                    },
                    {
                        type: "paragraph",
                        text: "El espectro definido presenta una aceleración máxima efectiva de 0.1071 g, la cual se mantiene constante para periodos cortos (hasta aproximadamente T = 0.20 s) y disminuye progresivamente para valores mayores de periodo, reflejando el comportamiento típico de un espectro elástico reducido por el factor de amortiguamiento",
                        alignment: "JUSTIFIED"
                    },
                    /*/*Imagen casos de carga ETABS     ESPECTRO XX*/
                    {
                        type: "paragraph",
                        text: "Para el desarrollo del análisis dinámico modal espectral, se ha definido la función de espectro denominada “ESPECTRO YY”, la cual representa la acción sísmica de diseño correspondiente a las condiciones del sitio del proyecto, conforme a los criterios establecidos por la Norma E.030 “Diseño Sismorresistente”.",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "paragraph",
                        text: "Los parámetros adoptados para la generación del espectro son los siguientes:",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "list",
                        listType: "bullet",
                        items: [
                            "Zona sísmica: 2",
                            "Categoría de ocupación (C): Edificación de uso general o de baja importancia, según clasificación de la norma.",
                            "Tipo de suelo (S2): Suelo intermedio, con propiedades de rigidez media y comportamiento predominante en periodos intermedios",
                            "Factor de irregularidad en altura (Ia): 1.00",
                            "Factor de irregularidad en planta (Ip): 1.00",
                            "Factor de modificación de la respuesta básica (R₀): 7.00",
                            "Amortiguamiento crítico considerado (ξ): 5%",
                        ]
                    },
                    {
                        type: "paragraph",
                        text: "El espectro definido presenta una aceleración máxima efectiva de 0.1071 g, la cual se mantiene constante para periodos cortos (hasta aproximadamente T = 0.20 s) y disminuye progresivamente para valores mayores de periodo, reflejando el comportamiento típico de un espectro elástico reducido por el factor de amortiguamiento.",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "heading",
                        level: 2,
                        text: "2.3 COMBINACIONES DE CARGA"
                    },
                    {
                        type: "paragraph",
                        text: "Para el diseño estructural de la edificación del presente proyecto se utilizaron las siguientes combinaciones acordes al RNE. E.060 (Concreto Armado).",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "image",
                        src: "/assets/img/memoriacalculos/combinacionescarga.png",
                        point: "Combinaciones de Carga",
                        alignment: "CENTER",
                        width: 500,
                        height: 250
                    },
                    {
                        type: "heading",
                        level: 2,
                        text: "2.4 METRADO DE CARGAS"
                    },
                    {
                        type: "paragraph",
                        text: "Cargas muertas",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "list",
                        listType: "bullet",
                        items: [
                            "Concreto :2400 kgf/m3",
                            "Albañilería : 1800 kgf/m3",
                            "Aligerado (h=20 cm) : 300 kgf/m3",
                            "Carga muerta general : 175 kgf/m3",
                            "Targa muerta general : 175 kgf/m3",
                        ]
                    },
                    /**Asignacionn de cargas por nivel (pisos) */
                ]
            },
            {
                id: "analisis_sismico",
                title: "3. ANÁLISIS SÍSMICO",
                level: 1,
                content: [
                    {
                        type: "heading",
                        level: 2,
                        text: "3.1 PARÁMETROS SÍSMICOS (Norma E.030)"
                    },
                    {
                        type: "heading",
                        level: 3,
                        text: "3.1.1. CÁLCULO DE IRREGULARIDADES EN ALTURA"
                    },
                    {
                        type: "list",
                        listType: "bullet",
                        items: [
                            "Irregularidad de rigidez – piso blando: No aplica: \n" + {
                                type: "image",
                                src: "/assets/img/memoriacalculos/ubicacionzonaNorma.png",
                                alignment: "CENTER",
                                width: 200,
                                height: 200
                            },
                            "Altura de los pisos: 3 metros",
                            "Altura de la targa: 2 metros",
                        ]
                    },
                    {
                        type: "paragraph",
                        text: "Se considera que la altura total de la estructura es de 12 metros, la altura de los pisos es de 3 metros y la altura de la targa es de 2 metros.",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "heading",
                        level: 3,
                        text: "3.1.2. CÁLCULO DE IRREGULARIDADES EN PLANTA"
                    },
                    {
                        type: "heading",
                        level: 3,
                        text: "3.1.3. RESUMEN DE IRREGULARIDADES"
                    },
                    {
                        type: "heading",
                        level: 2,
                        text: "3.2 ANÁLISIS SÍSMICO ESTATICO"
                    },
                    {
                        type: "paragraph",
                        text: "El análisis sísmico estático, realizado mediante el software ETABS. Se emplea el método de fuerza lateral equivalente, de acuerdo con las disposiciones establecidas en la normativa sísmica aplicable. Este método permite estimar la respuesta estructural ante acciones sísmicas mediante la aplicación de fuerzas horizontales distribuidas en altura.",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "paragraph",
                        text: "Consideraciones en ETABS",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "image",
                        src: "{{analisis_sismico.figura26}}",
                        caption: 'figura 26-Patrón de cargas sísmicas en "X"',
                        alignment: "CENTER",
                        width: 500,
                        height: 300
                    },
                    {
                        type: "image",
                        src: "{{analisis_sismico.figura27}}",
                        caption: 'figura 27-Patrón de cargas sísmicas en "Y"',
                        alignment: "CENTER",
                        width: 500,
                        height: 300
                    },
                    {
                        type: "list",
                        listType: "bullet",
                        items: [
                            "DEFINICIÓN DEL PESO SÍSMICO \n En ETABS, el peso sísmico se define a través del 'Mass Source', que determina cómo se genera la masa sísmica equivalente a partir de las cargas gravitacionales aplicadas en el modelo. Esta masa es la que se utiliza para calcular las fuerzas de inercia sísmica mediante el análisis estático o dinámico",
                        ]
                    },
                    {
                        type: "image",
                        src: "{{analisis_sismico.figura28}}",
                        caption: "figura 28-Peso sísmico",
                        alignment: "CENTER",
                        width: 500,
                        height: 350
                    },
                    {
                        type: "heading",
                        level: 2,
                        text: "3.3 ANÁLISIS SÍSMICO DINÁMICO"
                    },
                    {
                        type: "paragraph",
                        text: "El análisis sísmico dinámico modal espectral permite evaluar la respuesta estructural considerando los modos de vibración, la masa y la rigidez de la estructura. Es más preciso que el análisis estático y se usa cuando lo exige la norma o en estructuras irregulares.",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "list",
                        listType: "bullet",
                        items: [
                            "CONSIDERACIONES EN ETABS"
                        ]
                    },
                    {
                        type: "image",
                        src: "{{analisis_sismico.figura29}}",
                        caption: 'figura 29-Datos del caso de carga en "X"',
                        alignment: "CENTER",
                        width: 500,
                        height: 300
                    },
                    {
                        type: "image",
                        src: "{{analisis_sismico.figura30}}",
                        caption: 'figura 30-Datos del caso de carga en "Y"',
                        alignment: "CENTER",
                        width: 500,
                        height: 300
                    },
                    {
                        type: "list",
                        listType: "bullet",
                        items: [
                            "MODOS DE VIBRACIÓN Artículo 26.1.2 E-0.30"
                        ]
                    },
                    {
                        type: "paragraph",
                        text: "En cada dirección se consideran aquellos modos de vibración cuya suma de masas efectivas sea por lo menos el 90% de la masa de la estructura. A continuación, se muestran los periodos de los modos de vibración y sus respectivas masas de participación:",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "image",
                        src: "{{analisis_sismico.figura31}}",
                        caption: "figura 31-Datos de modos a su períodos",
                        alignment: "CENTER",
                        width: 500,
                        height: 350
                    },
                    {
                        type: "image",
                        src: "{{analisis_sismico.figura32}}",
                        caption: 'figura 32-Modo de vibración 2-desplazamiento en "Y"',
                        alignment: "CENTER",
                        width: 400,
                        height: 450
                    },
                    {
                        type: "image",
                        src: "{{analisis_sismico.figura33}}",
                        caption: 'figura 33-Modo de vibración 1-desplazamiento en "X"',
                        alignment: "CENTER",
                        width: 400,
                        height: 450
                    },
                    {
                        type: "list",
                        listType: "bullet",
                        items: [
                            "FUERZA CORTANTE BASAL DINÁMICA"
                        ]
                    },
                    {
                        type: "paragraph",
                        text: "Utilizando el espectro de seudo aceleraciones para el análisis sísmico, se tienen las siguientes cortantes basales dinámicas:",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "image",
                        src: "{{analisis_sismico.figura34}}",
                        caption: "figura 34-Fuerza cortante en la base obtenida",
                        alignment: "CENTER",
                        width: 500,
                        height: 200
                    },
                    {
                        type: "list",
                        listType: "bullet",
                        items: [
                            "DESPLAZAMIENTO PERMISIBLE Artículo 28 E-030"
                        ]
                    },
                    {
                        type: "paragraph",
                        text: "En el cuadro siguiente indica los desplazamientos y derivas de entrepisos de los diafragmas de cada nivel. Estos valores fueron determinados multiplicando los resultados obtenidos del programa por el coeficiente 0.75R, conforme se especifica en la Norma E.030 de Diseño Sismorresistente.",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "image",
                        src: "{{analisis_sismico.figura35}}",
                        caption: 'figura 35-Sismo Dinámico en dirección "X" Escalado',
                        alignment: "CENTER",
                        width: 500,
                        height: 200
                    },
                    {
                        type: "image",
                        src: "{{analisis_sismico.figura36}}",
                        caption: 'figura 36-Sismo Dinámico en dirección "Y" Escalado',
                        alignment: "CENTER",
                        width: 500,
                        height: 200
                    },
                    {
                        type: "paragraph",
                        text: "De acuerdo con lo que establece el Artículo 28.4 de la Norma E.030 de Diseño Sismorresistente, la fuerza cortante en la base obtenida del análisis dinámico no puede ser menor que el 80 % de la fuerza cortante en la base obtenida del análisis estático para estructuras regulares, ni menor que el 90% para estructuras irregulares. En los casos donde se muestran las fuerzas cortantes obtenidas en los análisis estático y dinámico:",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "image",
                        src: "{{analisis_sismico.figura37}}",
                        caption: 'figura 37-Sismo Dinámico en dirección "X"',
                        alignment: "CENTER",
                        width: 500,
                        height: 300
                    },
                    {
                        type: "image",
                        src: "{{analisis_sismico.figura38}}",
                        caption: 'figura 38-Sismo Dinámico en dirección "Y"',
                        alignment: "CENTER",
                        width: 500,
                        height: 300
                    },
                    {
                        type: "paragraph",
                        text: "De los resultados mostrados se puede concluir que las derivas obtenidas se encuentran dentro de lo permitido por la normativa E.030 de diseño sismorresistente.",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "paragraph",
                        text: "A continuación se muestran las deformadas de la estructura ante cargas sísmicas:",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "image",
                        src: "{{analisis_sismico.figura39}}",
                        caption: 'figura 39-Deformada en "X" debido a carga sísmica (mm)',
                        alignment: "CENTER",
                        width: 400,
                        height: 450
                    },
                    {
                        type: "image",
                        src: "{{analisis_sismico.figura40}}",
                        caption: 'figura 40-Deformada en "Y" debido a carga sísmica (mm)',
                        alignment: "CENTER",
                        width: 400,
                        height: 450
                    }
                ]
            },
            {
                id: "diseno_elementos",
                title: "4. DISEÑO DE ELEMENTOS ESTRUCTURALES",
                level: 1,
                content: [
                    {
                        type: "paragraph",
                        text: "El cálculo estructural se realiza utilizando software de análisis estructural, validando que todos los elementos cumplan con los factores de seguridad requeridos. Se busca un diseño económico y eficiente, pero principalmente que garantice la seguridad de los ocupantes ante eventos sísmicos, debido a la ubicación del Perú en una zona de alta sismicidad.",
                        alignment: "JUSTIFIED"
                    },
                    {
                        type: "subsection",
                        title: "4.1 PREDISIONAMIENTO DE LOS ELEMENTOS ESTRUCTURALES",
                        content: [
                            {
                                type: "paragraph",
                                text: "El predimensionamiento es una etapa preliminar en el diseño estructural, donde se establecen las dimensiones iniciales de los elementos que conforman una estructura (como vigas, columnas, losas, zapatas, etc.), antes de realizar un análisis estructural detallado.",
                                alignment: "JUSTIFIED"
                            },
                            {
                                type: "paragraph",
                                text: "Este proceso se basa en criterios empíricos y reglas generales, obtenidas de la experiencia y de normas técnicas, que permiten proponer medidas aproximadas que aseguren estabilidad, funcionalidad y seguridad desde el inicio del proyecto.",
                                alignment: "JUSTIFIED"
                            },
                            {
                                type: "paragraph",
                                text: "Se utiliza especialmente durante la fase de anteproyecto, cuando aún no se conocen todas las cargas exactas, pero es necesario definir la forma general de la estructura para avanzar con el diseño arquitectónico, estructural y presupuestal",
                                alignment: "JUSTIFIED"
                            }
                        ]
                    },
                    {
                        type: "subsection",
                        title: "4.2 DISEÑO DE VIGAS Y COLUMNAS",
                        content: [
                            {
                                type: "paragraph",
                                text: "Los elementos de pórticos se diseñaron bajo los lineamientos del Diseño por Resistencia, garantizando la ductilidad necesaria para el comportamiento sismorresistente.",
                                alignment: "JUSTIFIED"
                            }
                        ]
                    }
                ]
            },
            {
                id: "conclusiones",
                title: "5. CONCLUSIONES",
                level: 1,
                content: [
                    {
                        type: "list",
                        listType: "bullet",
                        items: [
                            "La estructura proyectada cumple con los requerimientos de seguridad y estabilidad normados.",
                            "Los desplazamientos laterales (drifts) se encuentran dentro de los límites admisibles.",
                            "Se garantiza la resistencia de todos los elementos estructurales ante las solicitaciones de diseño."
                        ]
                    }
                ]
            }
        ]
    }
};

export function buildContentStructure(data) {
    return {
        cover: data?.cover || {},
        document: data?.document || DEFAULT_MC_STRUCTURE.document
    };
}
