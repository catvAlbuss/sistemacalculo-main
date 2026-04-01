import { type } from "jquery";
import { list } from "postcss";

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
            text: "1.1. ALCANCE DE DOCUMENTOS",
          },
          {
            type: "paragraph",
            text: {
              parts: [
                {
                  text: "En el presente documento se establecen los criterios de diseño a seguir para las estructuras del proyecto: ",
                },
                { text: "{{cover.project}}", bold: true },
                {
                  text: "\n\nEl proyecto estructural para desarrollar se basará en proponer medidas óptimas para el buen desempeño de las estructuras proyectadas, sometida a cargas de gravedad, solicitaciones por viento y solicitaciones sísmicas. Esta estructura será modelada según los parámetros de la actual Norma de Estructuras vigente y teniendo en consideración la hipótesis de análisis siguiente: El análisis estructural y sismico de la estructura se realizó mediante un modelo tridimensional.",
                },
              ],
            },
            alignment: "JUSTIFIED",
          },
          {
            type: "list",
            listType: "bullet",
            items: [
              "Norma Técnica de Edificación E.020: Cargas\nReglamento Nacional de Edificaciones (RNE)",
              "Norma Técnica de Edificación E.030: Diseño Sismo resistente\nReglamento Nacional de Edificaciones (RNE)",
              "Norma Técnica de Edificación E.050: Suelos y Cimentaciones\nReglamento Nacional de Edificaciones (RNE)",
              "Norma Técnica de Edificación E.060: Concreto Armado\nReglamento Nacional de Edificaciones (RNE)",
              "Norma Técnica de Edificación E.090: Estructura Metálica\nReglamento Nacional de Edificaciones (RNE)",
            ],
          },
          {
            type: "heading",
            level: 2,
            text: "1.2. UBICACIÓN DEL PROYECTO",
          },
          {
            type: "paragraph",
            text: {
              parts: [{ text: "La zona de estudio del proyecto " }, { text: "{{cover.project}}", bold: true }],
            },
            alignment: "JUSTIFIED",
          },
          {
            type: "image",
            src: "/assets/img/memoriacalculos/ubicacionzonaNorma.png",
            alignment: "CENTER",
            width: 500,
            height: 250,
          },
          {
            type: "heading",
            level: 2,
            text: "1.3. CONSIDERACIONES SÍSMICAS",
          },
          {
            type: "heading",
            level: 3,
            text: "1.3.1. ZONIFICACIÓN (Z)",
          },
          {
            type: "paragraph",
            text: "De acuerdo con el mapa del Reglamento Nacional de Edificaciones-Norma E.030, el área de estudio se localiza en la zona {{cover.seismicZone}}, correspondiéndole un factor de Z={{cover.seismicZoneFactor}}.",
            alignment: "JUSTIFIED",
          },
          {
            type: "image",
            src: "/assets/img/memoriacalculos/mapazonificacion.png",
            alignment: "CENTER",
            width: 500,
            height: 350,
          },
          {
            type: "heading",
            level: 3,
            text: "1.3.2. PARÁMETROS DE SUELO",
          },
          {
            type: "paragraph",
            text: "Para efectos de la aplicación de la norma E-0.30 de diseño sismo-resistente, se adopta el perfil de suelo {{cover.soilFactor}}. Para la zona {{cover.seismicZone}}, el factor de suelo correspondiente es {{cover.soilValue}}. Asimismo, para el periodo seleccionado {{cover.soilPeriod}}, el valor correspondiente es {{cover.soilPeriodValue}}s según la Tabla N°4. Los valores de S, Tp y Tl se muestran en las Tablas N°3 y N°4 (NORMA E-030 - DISEÑO SISMORESISTENTE).",
            alignment: "JUSTIFIED",
          },
          {
            type: "image",
            src: "/assets/img/memoriacalculos/factorsuelo.png",
            alignment: "CENTER",
            width: 500,
            height: 200,
          },
          {
            type: "image",
            src: "/assets/img/memoriacalculos/periodos.png",
            alignment: "CENTER",
            width: 500,
            height: 150,
          },
          {
            type: "heading",
            level: 3,
            text: "1.3.3. FACTOR DE AMPLIACIONES SÍSMICAS",
          },
          {
            type: "paragraph",
            text: "De acuerdo con las características de sitio, se define el factor de amplificación sísmica (C) por las siguientes expresiones:",
            alignment: "JUSTIFIED",
          },
          {
            type: "image",
            src: "/assets/img/memoriacalculos/factorampliaciones.png",
            alignment: "CENTER",
            width: 200,
            height: 100,
          },
          {
            type: "paragraph",
            text: "T es el período de acuerdo con el numeral 4.5.4, concordado con el numeral 4.6.1 de la E.030. Este coeficiente se interpreta como el factor de amplificación de la aceleración estructural respecto de la aceleración en el suelo.:",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 3,
            text: "1.3.4. CATEGORÍAS DE LAS EDIFICACIONES",
          },
          {
            type: "paragraph",
            text: "Cada estructura debe ser clasificada de acuerdo con la categoría de uso. Para la categoría {{cover.buildingCategory}}, corresponde el factor de importancia U = {{cover.importanceFactorU}}.",
            alignment: "JUSTIFIED",
          },
          {
            type: "image",
            src: "/assets/img/memoriacalculos/categoriaEdificaciones.png",
            caption: "Categoría de las Edificaciones",
            alignment: "CENTER",
            width: 500,
            height: 350,
          },
          {
            type: "heading",
            level: 3,
            text: "1.3.5. SISTEMAS ESTRUCTURALES ( R )",
          },
          {
            type: "paragraph",
            text: "Los sistemas estructurales se clasifican según los materiales usados y el sistema de estructuración Sismo Resistente predominante en cada dirección. De acuerdo con la clasificación de una estructura se elige un factor de reducción de la fuerza sísmica (R).",
            alignment: "JUSTIFIED",
          },
          {
            type: "paragraph",
            text: "Para la Categoría {{cover.buildingCategory}} y la zona {{cover.seismicZone}}, en la que se ubica el proyecto, está permitido proyectar los Sistemas Estructurales: {{cover.structuralSystemDescription}}",
            alignment: "JUSTIFIED",
          },
          {
            type: "image",
            src: "/assets/img/memoriacalculos/sistemaestructurales.png",
            caption: "Sistemas Estructurales",
            alignment: "CENTER",
            width: 500,
            height: 480,
          },
          {
            type: "paragraph",
            text: "Se realizó la verificación del aporte de la cortante en los elementos participantes por eje estructural, para la definición del sistema estructural, los cuales se establecen en la tabla resumen que se adjunta.",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 2,
            text: "1.4. DESCRIPCIÓN DE ELEMENTOS ESTRUCTURALES",
          },
          {
            type: "paragraph",
            text: "La presente infraestructura ha sido diseñada considerando criterios de seguridad estructural, funcionalidad y cumplimiento normativo, en concordancia con la Norma Técnica E.060 (Diseño de Concreto Armado) y E.030 (Norma Sismorresistente).",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 2,
            text: "1.5. MATERIAL DE DISEÑO",
          },
          {
            type: "paragraph",
            text: "Se consideraron las siguientes característica de los materiales que conforman esta estructura",
            alignment: "JUSTIFIED",
          },
          {
            type: "paragraph",
            text: "Acero estructural (ASTM A36)",
            alignment: "JUSTIFIED",
          },
          {
            type: "list",
            listType: "bullet",
            items: ["Fluencia: fy = 4,200 kg/cm2, Grado 60", "Módulo de elasticidad: E = 2,038,901.92 kg/cm2"],
          },
          {
            type: "paragraph",
            text: "Acero Corrugado (ASTM A605)",
            alignment: "JUSTIFIED",
          },
          {
            type: "list",
            listType: "bullet",
            items: ["Fluencia: fy = 4,200 kg/cm2, Grado 60.", "Módulo de elasticidad: E = 2,038,901.92 kg/cm2"],
          },
          {
            type: "paragraph",
            text: "Concreto",
            alignment: "JUSTIFIED",
          },
          {
            type: "list",
            listType: "bullet",
            items: [
              "Resistencia nominal: :f´c = 210 kg/cm2",
              "Módulo de elasticidad: E = 253,456.4kg/cm2",
              "Peso específico: 2.4 ton/m3",
              "Coeficiente de Poisson: u = 0.2",
            ],
          },
        ],
      },
      {
        id: "analisis_cargas",
        title: "2. ANÁLISIS DE CARGAS POR GRAVEDAD",
        level: 1,
        content: [
          {
            type: "heading",
            level: 2,
            text: "2.1 MODELO ESTRUCTURAL",
          },
          {
            type: "paragraph",
            text: "En el análisis sísmico de las Edificaciones del proyecto se utilizó el programa ETABS. Las diversas edificaciones fueron analizadas con modelos tridimensionales, suponiendo losas infinitamente rígidas frente a acciones en su plano. En el análisis de la estructura se supuso un comportamiento lineal y elástico. Los elementos de concreto armado se representaron con elementos lineales. Los muros de albañilería se modelaron con elementos tipo Shell, con rigideces de membrana y de flexión, aun cuando estas últimas son poco significativas. Los modelos se analizaron considerando sólo los elementos estructurales, sin embargo, los elementos no estructurales han sido ingresados en el modelo como solicitaciones de carga debido a que aquellos no son importantes en la contribución de la rigidez y resistencia de la edificación.",
            alignment: "JUSTIFIED",
          },
          /**Imgen estructural */
          {
            type: "heading",
            level: 2,
            text: "2.2 CASOS DE CARGA",
          },
          {
            type: "paragraph",
            text: "Para el diseño estructural de la edificación del presente proyecto se utilizaron las siguientes cargas acordes al RNE. E060 (Concreto Armado).",
            alignment: "JUSTIFIED",
          },
          {
            type: "image",
            src: "/assets/img/memoriacalculos/casoscarga.png",
            alignment: "CENTER",
            width: 500,
            height: 250,
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
              "SDY: CARGA SÍSMICA DINÁMICA EN DIRECCION Y.",
            ],
          },
          /*/*Imagen casos de carga ETABS     ESPECTRO XX*/
          {
            type: "paragraph",
            text: "Para el desarrollo del análisis dinámico modal espectral, se ha definido la función de espectro denominada “ESPECTRO XX”, la cual representa la acción sísmica de diseño correspondiente a las condiciones del sitio del proyecto, conforme a los criterios establecidos por la Norma E.030 “Diseño Sismorresistente”.",
            alignment: "JUSTIFIED",
          },
          {
            type: "paragraph",
            text: "Los parámetros adoptados para la generación del espectro son los siguientes:",
            alignment: "JUSTIFIED",
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
            ],
          },
          {
            type: "paragraph",
            text: "El espectro definido presenta una aceleración máxima efectiva de 0.1071 g, la cual se mantiene constante para periodos cortos (hasta aproximadamente T = 0.20 s) y disminuye progresivamente para valores mayores de periodo, reflejando el comportamiento típico de un espectro elástico reducido por el factor de amortiguamiento",
            alignment: "JUSTIFIED",
          },
          /*/*Imagen casos de carga ETABS     ESPECTRO XX*/
          {
            type: "paragraph",
            text: "Para el desarrollo del análisis dinámico modal espectral, se ha definido la función de espectro denominada “ESPECTRO YY”, la cual representa la acción sísmica de diseño correspondiente a las condiciones del sitio del proyecto, conforme a los criterios establecidos por la Norma E.030 “Diseño Sismorresistente”.",
            alignment: "JUSTIFIED",
          },
          {
            type: "paragraph",
            text: "Los parámetros adoptados para la generación del espectro son los siguientes:",
            alignment: "JUSTIFIED",
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
            ],
          },
          {
            type: "paragraph",
            text: "El espectro definido presenta una aceleración máxima efectiva de 0.1071 g, la cual se mantiene constante para periodos cortos (hasta aproximadamente T = 0.20 s) y disminuye progresivamente para valores mayores de periodo, reflejando el comportamiento típico de un espectro elástico reducido por el factor de amortiguamiento.",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 2,
            text: "2.3 COMBINACIONES DE CARGA",
          },
          {
            type: "paragraph",
            text: "Para el diseño estructural de la edificación del presente proyecto se utilizaron las siguientes combinaciones acordes al RNE. E.060 (Concreto Armado).",
            alignment: "JUSTIFIED",
          },
          {
            type: "image",
            src: "/assets/img/memoriacalculos/combinacionescarga.png",
            point: "Combinaciones de Carga",
            alignment: "CENTER",
            width: 500,
            height: 250,
          },
          {
            type: "heading",
            level: 2,
            text: "2.4 METRADO DE CARGAS",
          },
          {
            type: "paragraph",
            text: "Cargas muertas",
            alignment: "JUSTIFIED",
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
            ],
          },
          /**Asignacionn de cargas por nivel (pisos) */
        ],
      },
      {
        id: "analisis_sismico",
        title: "3. ANÁLISIS SÍSMICO",
        level: 1,
        content: [
          {
            type: "heading",
            level: 2,
            text: "3.1 ANÁLISIS ESTRUCTURAL",
          },
          {
            type: "heading",
            level: 3,
            text: "3.1.1. Sistema Estructural",
          },
          {
            type: "paragraph",
            text: "Se determina el sistema estructural de acuerdo a las definiciones que aparecen en el artículo 16",
            alignment: "JUSTIFIED",
          },
          {
            type: "paragraph",
            text: "En la tabla N° 6 se definen los sistemas estructurales permitidos de acuerdo a la categoria de las edificaciones y a la zona sismica en la que se encuentra.",
            alignment: "JUSTIFIED",
          },
          // Insertar La tabla n° 6
          {
            type: "heading",
            level: 3,
            text: "3.1.2. Coeficiente Básico de Reducción de Fuerzas Sísmicas, Ro",
          },
          {
            type: "paragraph",
            text: "De la tabla N° 7 se obtiene el valor del coeficiente Ro, que depende unicamente del sistema estructural",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 3,
            text: "3.1.3. Factores de Irregularidad (La, Lp)",
          },
          {
            type: "paragraph",
            text: "El factor la se determina como el menor de los valores de la tabla N° 8 correspondiente a las irregularidades existentes en altura. El factor lp se determina como el menor de valores de la tabla N° 9 correspondiente a las irregularidades existentes en planta.",
            alignment: "JUSTIFIED",
          },
          {
            type: "paragraph",
            text: "La mayoría de los casos se puede determinar si una estructura es regular o irregular a partir de su configuración estructural, pero en los casos de irregularidad de Rigidez e Irregularidad Torsional se comprueba con los resultados del análisis sísmico según se indica en la descripción de irregularidades",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 3,
            text: "3.1.4. Restricciones a la Irregularidad",
          },
          {
            type: "paragraph",
            text: "Verificar las restricciones a la irregularidad de acuerdo a la categoría y zona de la edificación en la Tabla N° 10. Modificar la estructuración en caso que no se cumplan las restricciones de esta Tabla.",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 3,
            text: "3.1.5. Coeficiente de Reducción de la Fuerza Sísmica (R)",
          },
          {
            type: "paragraph",
            text: "Se determina R = Ro.la.lp",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 3,
            text: "3.1.6. Modelos de Análisis",
          },
          {
            type: "paragraph",
            text: "Desarrollar el modelo matemático de la estructura. Para estructuras de concreto armado y albañilería considerar las propiedades de las secciones brutas ignorando la fisuración y el refuerzo.",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 3,
            text: "3.1.7. Estimación del Peso (P)",
          },
          {
            type: "paragraph",
            text: "Se determina el peso (P) para el cálculo de la fuerza sísmica adicionando a la carga permanente total un porcentaje de la carga viva que depende del uso y la categoría de la edificación, definido de acuerdo a lo indicado en este numeral.",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 3,
            text: "3.1.8. Procedimientos de Análisis Sísmico",
          },
          {
            type: "paragraph",
            text: "Se definen los procedimientos de análisis considerados en esta Norma, que son análisis estático (artículo 28) y análisis dinámico modal espectral (artículo 29).",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 3,
            text: "3.1.9. Determinación de Desplazamientos Laterales",
          },
          {
            type: "paragraph",
            text: "Se calculan los desplazamientos laterales de acuerdo a las indicaciones de este numeral.",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 3,
            text: "3.1.10. Distorsión Admisible",
          },
          {
            type: "paragraph",
            text: "Verifique que la distorsión máxima de entrepiso que se obtiene en la estructura con los desplazamientos calculados en el paso anterior sea menor que lo indicado en la Tabla N° 11. De no cumplir se revisa la estructuración y repite el análisis hasta cumplir con el requerimiento.",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 3,
            text: "3.1.11. Separacion entre edificios",
          },
          {
            type: "paragraph",
            text: "Determinar la separación mínima a otras edificaciones o al límite de propiedad de acuerdo a las indicaciones de este numeral.",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 2,
            text: "3.2 PARÁMETROS SÍSMICOS (Norma E.030)",
          },
          {
            type: "heading",
            level: 3,
            text: "3.2.1. CÁLCULO DE IRREGULARIDADES EN ALTURA",
          },
          {
            type: "list",
            listType: "bullet",
            items: ["Irregularidades en altura (IA. \"K\", \"V\") "],
          },
          {
            type: "list",
            listType: "bullet",
            items: ["Irregularidades en altura (MASA O PESO / Según NTE E.030 - 2018)"],
          },
          {
            type: "list",
            listType: "bullet",
            items: ["Irregularidades en altura (IGV, DSR/ Según NTE E.030 - 2018)"],
          },
          {
            type: "heading",
            level: 3,
            text: "3.2.2. CÁLCULO DE IRREGULARIDADES EN PLANTA",
          },
          {
            type: "list",
            listType: "bullet",
            items: ["Irregularidades en planta (IGV, DSR/ Según NTE E.030 - 2018)"],
          },
          {
            type: "list",
            listType: "bullet",
            items: ["Irregularidades en planta (Sistemas No Paralelos / Según NTE E.030 - 2018)"],
          },
          {
            type: "list",
            listType: "bullet",
            items: ["Irregularidades en planta (TORSIÓN - Según NTE E.030 - 2018)"],
          },
          {
            type: "list",
            listType: "bullet",
            items: ["Irregularidades en planta (Irregularidad Torsional)"],
          },
          {
            type: "heading",
            level: 3,
            text: "3.2.3. RESUMEN DE IRREGULARIDADES",
          },
          {
            type: "paragraph",
            text: "estructura es regular en altura e irregular en planta: ",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 2,
            text: "3.3 ANÁLISIS SÍSMICO ESTATICO",
          },
          {
            type: "paragraph",
            text: "El análisis sísmico estático, realizado mediante el software ETABS. Se emplea el método de fuerza lateral equivalente, de acuerdo con las disposiciones establecidas en la normativa sísmica aplicable. Este método permite estimar la respuesta estructural ante acciones sísmicas mediante la aplicación de fuerzas horizontales distribuidas en altura.",
            alignment: "JUSTIFIED",
          },
          {
            type: "paragraph",
            text: "Consideraciones en ETABS",
            alignment: "JUSTIFIED",
          },
          {
            type: "list",
            listType: "bullet",
            items: [
              "DEFINICIÓN DEL PESO SÍSMICO: En ETABS, el peso sísmico se define a través del 'Mass Source', que determina cómo se genera la masa sísmica equivalente a partir de las cargas gravitacionales aplicadas en el modelo. Esta masa es la que se utiliza para calcular las fuerzas de inercia sísmica mediante el análisis estático o dinámico",
            ],
          },
          {
            type: "heading",
            level: 2,
            text: "3.4 ANÁLISIS SÍSMICO DINÁMICO",
          },
          {
            type: "paragraph",
            text: "El análisis sísmico dinámico modal espectral permite evaluar la respuesta estructural considerando los modos de vibración, la masa y la rigidez de la estructura. Es más preciso que el análisis estático y se usa cuando lo exige la norma o en estructuras irregulares.",
            alignment: "JUSTIFIED",
          },
          {
            type: "list",
            listType: "bullet",
            items: ["CONSIDERACIONES EN ETABS"],
          },
          {
            type: "list",
            listType: "bullet",
            items: [
              "MODOS DE VIBRACIÓN Artículo 26.1.2 E-0.30: En cada dirección se consideran aquellos modos de vibración cuya suma de masas efectivas sea por lo menos el 90% de la masa de la estructura. A continuación, se muestran los periodos de los modos de vibración y sus respectivas masas de participación:",
            ],
          },
          {
            type: "paragraph",
            text: "Se observa que la participación de masas en el análisis modal espectral supera el 90% en las dos direcciones de análisis (UX, UY) en el modal 6 respectivamente; por lo tanto, se concluye la validez del análisis dinámico modal espectral, según norma E.030. Las tablas mostradas verifican la norma E.030 Vigente",
            alignment: "JUSTIFIED",
          },
          {
            type: "list",
            listType: "bullet",
            items: [
              "FUERZA CORTANTE BASAL DINÁMICA: Utilizando el espectro de seudo aceleraciones para el análisis sísmico, se tienen las siguientes cortantes basales dinámicas:",
            ],
          },
          {
            type: "paragraph",
            text: "De acuerdo con lo que establece el Artículo 26.4 de la Norma E.030 de Diseño Sismorresistente, la fuerza cortante en la base obtenida del análisis dinámico no puede ser menor que el 80 % de la fuerza cortante en la base obtenida del análisis estático para estructuras regulares, ni menor que el 90% para estructuras irregulares. En los cuadros siguientes se muestran las fuerzas cortantes obtenidas en los edificacións analizados bajo los análisis estático y dinámico:",
          },
          {
            type: "list",
            listType: "bullet",
            items: [
              "DESPLAZAMIENTO PERMISIBLE Artículo 28 E-030: En el cuadro siguiente indica los desplazamientos y derivas de entrepisos de los diafragmas de cada nivel. Estos valores fueron determinados multiplicando los resultados obtenidos en el programa de análisis por 0.75R, conforme se especifica en la Norma E.030 de Diseño Sismorresistente.",
            ],
          },
          {
            type: "paragraph",
            text: "De los resultados mostrados se puede concluir que las derivas obtenidas se encuentran dentro de lo permitido por la normativa E.030 de diseño sismorresistente.",
            alignment: "JUSTIFIED",
          },
        ],
      },
      {
        id: "diseno_elementos",
        title: "4. DISEÑO DE ELEMENTOS ESTRUCTURALES",
        level: 1,
        content: [
          {
            type: "paragraph",
            text: "El cálculo estructural se realiza utilizando software de análisis estructural, validando que todos los elementos cumplan con los factores de seguridad requeridos. Se busca un diseño económico y eficiente, pero principalmente que garantice la seguridad de los ocupantes ante eventos sísmicos, debido a la ubicación del Perú en una zona de alta sismicidad.",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 2,
            text: "4.1 PREDISIONAMIENTO DE LOS ELEMENTOS ESTRUCTURALES",
          },
          {
            type: "paragraph",
            text: "El predimensionamiento es una etapa preliminar en el diseño estructural, donde se establecen las dimensiones iniciales de los elementos que conforman una estructura (como vigas, columnas, losas, zapatas, etc.), antes de realizar un análisis estructural detallado.",
            alignment: "JUSTIFIED",
          },
          {
            type: "paragraph",
            text: "Este proceso se basa en criterios empíricos y reglas generales, obtenidas de la experiencia y de normas técnicas, que permiten proponer medidas aproximadas que aseguren estabilidad, funcionalidad y seguridad desde el inicio del proyecto.",
            alignment: "JUSTIFIED",
          },
          {
            type: "paragraph",
            text: "Se utiliza especialmente durante la fase de anteproyecto, cuando aún no se conocen todas las cargas exactas, pero es necesario definir la forma general de la estructura para avanzar con el diseño arquitectónico, estructural y presupuestal",
            alignment: "JUSTIFIED",
          },
          // img 41-44
          {
            type: "heading",
            level: 2,
            text: "4.2 DISEÑO DE LA LOSA ALIGERADA",
          },
          {
            type: "paragraph",
            text: "Una losa aligerada es un tipo de techo o piso que usamos en construcción, hecha con concreto y varillas de acero, pero con materiales livianos en su interior, como bloques de poliestireno o ladrillos huecos. Esto permite que sea más liviana, pero igual de resistente.",
            alignment: "JUSTIFIED",
          },
          // img 45

          // 👇 METRADO DE CARGA
          {
            type: "list",
            listType: "bullet",
            items: ["METRADO DE CARGAS"],
          },
          // aqui se ingresan las listas de losas aligeradas con sus imagenes
          {
            type: "heading",
            level: 2,
            text: "4.3 DISEÑO DE LA LOSA MACIZA",
          },
          {
            type: "paragraph",
            text: "La losa maciza es un elemento estructural plano de concreto armado, que se utiliza para formar pisos y techos en edificaciones. Se caracteriza por tener un espesor uniforme en toda su superficie y estar completamente lleno de concreto, sin vacíos ni aligeramientos.",
            alignment: "JUSTIFIED",
          },
          {
            type: "paragraph",
            text: "Este tipo de losa transmite las cargas que recibe (como el peso propio, personas, muebles u otras estructuras) hacia las vigas, muros o columnas que la soportan. Su diseño puede ser unidireccional, cuando la losa se apoya en dos lados opuestos y las cargas se reparten principalmente en una dirección; o bidireccional, cuando se apoya en los cuatro lados y las cargas se distribuyen en dos direcciones.",
            alignment: "JUSTIFIED",
          },
          {
            type: "paragraph",
            text: "Las losas macizas son comunes en edificaciones de uno o varios niveles, gracias a su buena resistencia y facilidad constructiva. Su espesor varía generalmente entre 20 cm, dependiendo del uso, la luz entre apoyos y la carga que debe soportar.",
            alignment: "JUSTIFIED",
          },
          {
            type: "paragraph",
            text: "A pesar de tener un mayor peso propio que otros tipos de losas como las aligeradas, ofrecen una mayor rigidez y menor deformación. Son ideales para estructuras donde se requiere un alto grado de estabilidad y resistencia",
            alignment: "JUSTIFIED",
          },
          //  img 52 -55
          {
            type: "heading",
            level: 2,
            text: "4.4 DISEÑO DE LOSA NERVADA",
          },
          {
            type: "paragraph",
            text: "La losa nervada es un elemento estructural de concreto armado formado por una losa superior delgada apoyada sobre nervios longitudinales o transversales. Estos nervios concentran la resistencia y permiten aligerar el sistema mediante espacios vacíos o elementos de relleno, reduciendo significativamente el peso propio de la estructura.",
            alignment: "JUSTIFIED",
          },
          {
            type: "paragraph",
            text: "Las cargas que recibe la losa se transmiten hacia los nervios, los cuales trabajan a flexión y conducen los esfuerzos hacia las vigas, muros o columnas que los soportan. Su diseño puede ser unidireccional, cuando los nervios se disponen en una sola dirección, o bidireccional, cuando los nervios forman una retícula que distribuye las cargas en dos sentidos",
            alignment: "JUSTIFIED",
          },
          {
            type: "paragraph",
            text: "Este tipo de losa se emplea en edificaciones donde se requiere cubrir mayores luces con menor consumo de concreto y menor deformación. La separación entre nervios, su altura y el espesor de la losa superior se definen según las cargas actuantes, uso de la edificación y criterios de rigidez.",
            alignment: "JUSTIFIED",
          },
          {
            type: "paragraph",
            text: "La losa nervada destaca por su eficiencia estructural, su capacidad para optimizar materiales y su buen comportamiento en estructuras de varios niveles, talleres, auditorios o ambientes amplios donde se necesita ligereza y resistencia.",
            alignment: "JUSTIFIED",
          },
          {
            type: "paragraph",
            text: "Diseño de losa nervada 1 e=0.25",
            alignment: "JUSTIFIED",
          },
          // img (ubicacion de la losa para diseñar)
          {
            type: "paragraph",
            text: "Diseño de Losa Nervada – Dirección Vertical",
            alignment: "JUSTIFIED",
          },
          // 4 imagenes
          {
            type: "paragraph",
            text: "Diseño de Losa Nervada – Dirección Horizontal",
            alignment: "JUSTIFIED",
          },
          // isertar 4 imagenes
          {
            type: "paragraph",
            text: "Diseño de losa nervada 2 e=0.25",
            alignment: "JUSTIFIED",
          },
          // img (ubicacion de la losa para diseñar)
          {
            type: "paragraph",
            text: "Diseño de Losa Nervada – Dirección Vertical",
            alignment: "JUSTIFIED",
          },
          // 4 imagenes
          {
            type: "paragraph",
            text: "Diseño de Losa Nervada – Dirección Horizontal",
            alignment: "JUSTIFIED",
          },
          // 4 imagenes
          {
            type: "heading",
            level: 2,
            text: "4.5 DISEÑO DE VIGAS",
          },
          {
            type: "paragraph",
            text: "Es un elemento estructural lineal que trabaja a flexión, cortante. En las vigas, la longitud predomina sobre las otras dos dimensiones y suele ser horizontal",
            alignment: "JUSTIFIED",
          },
          {
            type: "list",
            listType: "bullet",
            items: [
              "Diseño por Flexión Artículo 9.2.3.1 de E.060: El artículo 9.2.3.1 de la norma E.060 establece que los elementos de concreto armado sometidos principalmente a momentos flectores (como vigas y losas) deben ser diseñados para resistir estos esfuerzos mediante el uso adecuado de acero de refuerzo.",
            ],
          },
          // insertar una imagen de diseño por flexion

          {
            type: "list",
            listType: "bullet",
            items: ["Diseño de Viga de 25x45"],
          },
          {
            type: "heading",
            level: 2,
            text: "4.6 DISEÑO DE COLUMNA",
          },
          {
            type: "paragraph",
            text: "Las columnas se deben diseñar para resistir las fuerzas axiales que provienen de las cargas amplificadas de todos los pisos, y el momento máximo debido a las cargas amplificadas, considerando la carga viva actuando en solo uno de los tramos adyacentes del piso o techo bajo consideración. También debe considerarse la condición de carga que produzca la máxima relación (excentricidad) entre el momento y carga axial.",
            alignment: "JUSTIFIED",
          },
          {
            type: "paragraph",
            text: "En pórticos o en elementos continuos deberá prestarse atención al efecto de las cargas no balanceadas de los pisos, tanto en las columnas exteriores como en las interiores, y a la carga excéntrica debida a otras causas",
            alignment: "JUSTIFIED",
          },
          // Aqui se inserta la lista de diseño de columna con sus repectivas imagenes
          {
            type: "heading",
            level: 2,
            text: "4.7 DISEÑO DE PLACA",
          },
          {
            type: "paragraph",
            text: "El funcionamiento de las placas se centra en su capacidad para distribuir y transferir cargas de manera segura y eficiente, reforzando la integración de los diferentes elementos de la edificación. Su diseño, materialidad y método de conexión son fundamentales para asegurar que la estructura pueda responder adecuadamente ante esfuerzos verticales y laterales, lo que contribuye de forma decisiva a la estabilidad, durabilidad y seguridad de la construcción. Este enfoque integral resulta fundamental en la ingeniería moderna, especialmente en contextos donde la exigencia sísmica y la optimización de recursos son prioritarias.",
            alignment: "JUSTIFIED",
          },
          // aqui esta las listas dinamicas de diseño de placa
          {
            type: "heading",
            level: 2,
            text: "4.8 DISEÑO DE MURO CONCRETO",
          },
          {
            type: "paragraph",
            text: "Los muros de concreto son elementos estructurales verticales fabricados con concreto armado (concreto más acero de refuerzo). Se utilizan en construcciones para soportar cargas, dividir espacios, resistir empujes laterales o retener terrenos.",
            alignment: "JUSTIFIED",
          },
          {
            type: "paragraph",
            text: "Estos muros se diseñan siguiendo normas técnicas como la Norma E.060 (Concreto Armado) y la Norma E.030 (Diseño Sismorresistente) del Reglamento Nacional de Edificaciones del Perú. Están hechos con concreto de alta resistencia (f'c ≥ 210 kg/cm²) y acero de refuerzo, lo que les permite resistir cargas importantes, durar muchos años y comportarse bien frente a sismos y condiciones climáticas adversas.",
            alignment: "JUSTIFIED",
          },
          // IMG 1

          {
            type: "heading",
            level: 2,
            text: "4.9 DISEÑO DE ESCALERA",
          },
          {
            type: "paragraph",
            text: "El diseño estructural de una escalera tiene como finalidad garantizar la resistencia, estabilidad y seguridad del sistema de circulación vertical frente a las cargas que actúan sobre ella. Las escaleras deben ser capaces de soportar tanto cargas muertas como cargas vivas, además de considerar acciones sísmicas si la edificación lo requiere.",
            alignment: "JUSTIFIED",
          },
          // aqui se insertan las imagenes
          {
            type: "heading",
            level: 2,
            text: "4.10 DISEÑO DE CISTERNA",
          },

          {
            type: "heading",
            level: 2,
            text: "4.11 DISEÑO DE CIMIENTO CORRIDO",
          },
          {
            type: "paragraph",
            text: "El cimiento corrido es un tipo de cimentación superficial que se utiliza principalmente en edificaciones ligeras y viviendas de uno o dos pisos. Su función es distribuir las cargas de los muros sobre el terreno de forma continua, reduciendo la presión ejercida sobre el suelo y evitando asentamientos diferenciales.",
            alignment: "JUSTIFIED",
          },
          //aqui se insertan mas imagenes
          {
            type: "heading",
            level: 2,
            text: "4.12 DISEÑO DE CIMENTACIÓN",
          },
          {
            type: "paragraph",
            text: "Las cargas sobre la estructura son transmitidas al suelo de fundación mediante una zapata conectada, las mismas que han sido dimensionadas con base a la carga que transmiten cada columna en su área tributaria; y la capacidad portante de los suelos. El método de diseño adoptado conlleva el dimensionamiento a través de la capacidad de soporte del suelo y la fuerza transmitida por la columna a la cimentación. Luego de realizado el pre-dimensionamiento, se procede a la verificación por cortante, por flexión y por punzonamiento; para finalmente realizar el diseño de la misma",
            alignment: "JUSTIFIED",
          },
          {
            type: "paragraph",
            text: "Verificación de presiones",
            alignment: "JUSTIFIED",
          },
          {
            type: "paragraph",
            text: "Lo siguiente es verificar que la presión en el suelo ante cargas de servicio no exceda la 𝑞𝑛𝑒𝑡𝑎−𝑎𝑑𝑚. Las combinaciones de carga para tal verificación son:",
            alignment: "JUSTIFIED",
          },
          {
            type: "list",
            listType: "bullet",
            items: [
              "SERVICIO 1: (peso propio (CM)+carga viva (CV)+carga viva de techo (CVT)",
              "SERVICIO 2: (peso propio (CM)+carga viva (CV)+carga viva de techo (CVT)+/-0.8Sx): la norma en mención indica que para el diseño la combinación mencionada. Se utiliza para una la verificación de un (1.30qadm) como indica el anterior párrafo de la norma en mención.",
              "SERVICIO 3: peso propio (CM)+carga viva (CV)+carga viva de techo (CVT)+/-0.8Sy: Se utiliza para una la verificación de un (1.30qa) como indica el anterior párrafo de la norma en mención.",
            ],
          },
          {
            type: "paragraph",
            text: "De la norma E.060 en su ítem 15.2.1 las zapatas deben diseñarse para resistir la carga amplificada (diseño por resistencia) y las reacciones incluidas, de acuerdo con los requisitos de diseño apodado de esta norma.",
            alignment: "JUSTIFIED",
          },
          {
            type: "paragraph",
            text: "El área de la zapata debe determinarse a partir de la resistencia admisible del suelo o de la capacidad admisible de los pilotes, establecida en el estudio de mecánica de suelos. De este ítem se deduce que el servicio 01 y del ítem anterior y según el ítem 9 de la norma en mención se tiene el servicio 02 y el servicio 03",
            alignment: "JUSTIFIED",
          },
          {
            type: "paragraph",
            text: "Del ítem 15.2.4 de la norma E.060. Se podrá considerar un incremento del 30% en el valor de la presión admisible del suelo para los estados de cargas en los que intervengan cargas temporales, tales como sismo o viento.",
            alignment: "JUSTIFIED",
          },
          {
            type: "paragraph",
            text: "Del ítem 15.2.5 de la norma E.060. Para determinar los esfuerzos en el suelo o las fuerzas en pilotes, las acciones sísmicas podrán reducirse al 80% de los valores provenientes del análisis, ya que las solicitaciones sísmicas especificadas en la NTE E.030 Diseño Sismorresistente están especificadas al nivel de resistencia de la estructura.",
            alignment: "JUSTIFIED",
          },
          // Aqui esta la lista de zapatas con sus respectivas imagenes
          {
            type: "heading",
            level: 2,
            text: "4.13 DISEÑO DE ALBAÑILERIA",
          },
        ],
      },
      {
        id: "diseno_estructura",
        title: "5. DISEÑO DE ESTRUCTURA METÁLICA",
        level: 1,
        content: [
          {
            type: "heading",
            level: 2,
            text: "5.1 Modelo Matemático",
          },
          {
            type: "paragraph",
            text: "La estructura metálica por proyectar será del tipo V invertida apoyada en sus extremos.",
            alignment: "JUSTIFIED",
          },
          {
            type: "heading",
            level: 2,
            text: "5.2 Análisis Estructural",
          },
          {
            type: "paragraph",
            text: "Para el análisis estructural de la estructura metálica usamos el programa ETABS 2016 en la cual colocaremos las cargas al modelo matemático idealizado.",
            alignment: "JUSTIFIED",
          },
          // IMG X
          {
            type: "paragraph",
            text: "Tomando los máximos esfuerzos, se verificará el diseño de los elementos más esforzados para el diseño de la cobertura.",
            alignment: "JUSTIFIED",
          },
          // IMGs Y
          {
            type: "list",
            listType: "bullet",
            items: ["Diseño de Columna Metálica"],
          },
          // IMGs de Columna Metálica
          {
            type: "list",
            listType: "bullet",
            items: ["Diseño de Brida Superior"],
          },
          // IMGs de Brida Superior
          {
            type: "list",
            listType: "bullet",
            items: ["Diseño de Brida Inferior"],
          },
          // IMGs de Brida Inferior
          {
            type: "list",
            listType: "bullet",
            items: ["Diseño de Parante"],
          },
          // IMGs de Diseño de Parante
          {
            type: "list",
            listType: "bullet",
            items: ["Diseño de Diagonal"],
          },
          // IMGs de Diseño de Diagonal
          {
            type: "list",
            listType: "bullet",
            items: ["Diseño de Correa Metálica"],
          },
          // IMGs de Correa Metálica
        ],
      },

      // ============================================
      // Sección 6
      // ============================================

      {
        id: "conclusiones",
        title: "6. CONCLUSIONES",
        level: 1,
        content: [
          {
            type: "list",
            listType: "bullet",
            items: [
              "De la edificación se asumió que la estructura es regular, ya que según la NTE.030 este tipo de edificaciones y por el lugar de ubicación debe ser una estructura regular. Se consideró tanto el análisis estático y dinámico, siendo este último de gran ayuda para la distribución espacial de masas y rigideces que nos permita conocer el comportamiento de la estructura.",
              "Se analizó las distorsiones máximas alcanzadas de cada edificación en las direcciones de análisis X ó Y, y que no superen el valor de la distorsión permitida por la NTE.030, tanto para la deriva de 0.006 para sistemas de Muros Estructurales respectivamente ",
              "Se analizó y diseño las dimensiones de las secciones de los diferentes elementos estructurales, así mismo se ha colocado el acero en los elementos estructurales acorde a los requerimientos del análisis y considerando lo mínimo que deben de poseer según la normatividad. De la misma manera se procedió con los elementos no estructurales.",
              "El Proyecto Estructural cumple con lo indicado en la Norma Sísmica vigente y con las Normas Técnicas correspondientes por lo que concluimos que la Estructura tiene una buena rigidez y resistencia sísmica.",
            ],
          },
        ],
      },

      // ============================================
      // Sección 7
      // ============================================

      {
        id: "recomendaciones",
        title: "7. RECOMENDACIONES",
        level: 1,
        content: [
          {
            type: "list",
            listType: "bullet",
            items: [
              "Hoy en día al tener una variedad de programas y aplicativos para el cálculo estructural, en el presente proyecto se ha utilizado de la mejor manera para representar estructuralmente el proyecto arquitectónico propuesto y que cumplan con la normatividad, bien local y de ser el caso extranjera, dando resultados aceptables y que cumplan con las consideraciones estipuladas para este tipo de edificaciones esenciales.",
              "A su vez, se recomienda tener en cuenta y respetar las juntas de separación establecidas por la normativa para evitar daños contiguos entre la edificación que se encuentren cercanos cuando se presenten fuerzas sísmicas. Asimismo, contemplar todos los protocolos de calidad para la edificación a construir y de esta forma garantizar un adecuado servicio.",
            ],
          },
        ],
      },
    ],
  },
};

export function buildContentStructure(data) {
  return {
    cover: data?.cover || {},
    document: data?.document || DEFAULT_MC_STRUCTURE.document,
  };
}
