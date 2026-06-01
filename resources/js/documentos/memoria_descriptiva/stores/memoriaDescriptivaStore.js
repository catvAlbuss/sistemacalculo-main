// stores/memoriaDescriptivaStore.js - Store central para Memoria Descriptiva
// CON PERSISTENCIA EN localStorage PARA NAVEGACIÓN MULTI-PÁGINA

const STORAGE_KEY = 'memoriaDescriptiva_v1';

/**
 * Lee el estado guardado en localStorage.
 * Retorna null si no existe o si hay error de parseo.
 */
function loadFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        console.warn('⚠️ Error leyendo store desde localStorage:', e);
        return null;
    }
}

/**
 * Guarda el estado actual en localStorage.
 * Se llama automáticamente desde el proxy de Alpine.
 */
function saveToStorage(state) {
    try {
        // No guardamos archivos File() — sólo las previews (dataURL strings)
        const toSave = {
            cover: state.cover,
            sections: state.sections,
            previews: state.previews,
            // images contiene objetos File() que no son serializables; omitir
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
        console.warn('⚠️ Error guardando store en localStorage:', e);
    }
}

export function createMemoriaDescriptivaStore() {

    // ─── Estado inicial (valores por defecto) ───────────────────────────────
    const defaults = {
        cover: {
            title: "MEMORIA DESCRIPTIVA",
            subtitle: "ESPECIALIDAD ESTRUCTURAS",
            project: "",
            uei: "",
            unifiedCode: "",
            ieName: "",
            localCode: "",
            modularCodes: "",
            region: "",
            province: "",
            district: "",
            centerTown: "",
            este: "",
            norte: "",
            altitud: "",
            colindanciaNorte: "",
            colindanciaSur: "",
            colindanciaEste: "",
            colindanciaOeste: "",
            ubigeo: { department: "", province: "", district: "" },
            date: new Date().toISOString().split("T")[0],
            preparedBy: "",
            reportType: "MODULOS",
        },

        sections: {
            generalidades: {
                antecedentes: {
                    history: "",
                    demandInitial: "",
                    demandPrimary: "",
                    accessRoads: "",
                    textoCompleto: "",
                    viasAccesoTexto: "",
                },
                datosProyecto: {
                    uei: "",
                    localidad: "",
                    distrito: "",
                    provincia: "",
                    region: "",
                    este: "",
                    norte: "",
                    altitud: "",
                    colindanciaNorte: "",
                    colindanciaSur: "",
                    colindanciaEste: "",
                    colindanciaOeste: "",
                    nombre: "",
                },
                acceso: {
                    limaHuanuco: { distancia: "410", tiempo: "8:00:00" },
                    huanucoTingo: { distancia: "120", tiempo: "3:00:00" },
                    tingoPucallpa: { distancia: "254", tiempo: "5:45:00" },
                    pucallpaContamana: { distancia: "248", tiempo: "8:00:00" },
                    total: { distancia: "1032", tiempo: "24h y 45 min" },
                },
                objetivos: { general: "", especificos: [] },
                marcoNormativo: [],
            },

            documentosPlanos: {
                documentos: [],
                planos: [
                    { descripcion: "ESTRUCTURA", lamina: "", esEncabezado: true },
                    { descripcion: "PLANO GENERAL DE CIMENTACION GENERAL", lamina: "PG-1" },
                    { descripcion: "PLANO GENERAL DE CIMENTACION GENERAL", lamina: "PG-2" },
                    { descripcion: "PLANO GENERAL DE ALIGERADOS PRIMER NIVEL", lamina: "PG-3" },
                    { descripcion: "PLANO GENERAL DE ALIGERADOS SEGUNDO NIVEL", lamina: "PG-4" },
                    { descripcion: "PLANO GENERAL DE ALIGERADOS TERCER NIVEL", lamina: "PG-5" },
                    { descripcion: "PLANO GENERAL DE ALIGERADOS CUARTO NIVEL", lamina: "PG-6" },
                    { descripcion: "PLANTA GENERAL DE EXPLANACIONES", lamina: "PG-7" },
                    { descripcion: "DETALLES GENERALES MODULO I", lamina: "E-01" },
                    { descripcion: "PLANO DE CIMENTACION MODULO I", lamina: "E-02" },
                    { descripcion: "DETALLE DE CIMENTACION MODULO I", lamina: "E-03" },
                    { descripcion: "PLANO DE ALIGERADO MODULO I", lamina: "E-04" },
                    { descripcion: "PLANO DE PORTICO MODULO I", lamina: "E-05" },
                    { descripcion: "PLANO DE PORTICO MODULO I", lamina: "E-06" },
                    { descripcion: "PLANO DE PORTICO MODULO I", lamina: "E-07" },
                    { descripcion: "PLANO DE PORTICO MODULO I", lamina: "E-08" },
                    { descripcion: "PLANO DE PORTICO MODULO I", lamina: "E-09" },
                    { descripcion: "DETALLES GENERALES MODULO II", lamina: "E-10" },
                    { descripcion: "PLANO DE CIMENTACION MODULO II", lamina: "E-11" },
                    { descripcion: "PLANO DE CIMENTACION MODULO II", lamina: "E-12" },
                    { descripcion: "PLANO DE ALIGERADO MODULO II", lamina: "E-13" },
                    // ... continuar hasta 139 filas si quieres
                ]
            },
            descripcionModulos: {
                modulos: [
                    { id: 1, nombre: "MÓDULO I", uso: "Grupo electrógeno, cuarto de tablero, maestranza, etc.", pisos: 1, sistemaX: "Sistema Dual", sistemaY: "Sistema de Albañilería confinada", elementosVerticales: "Placa L (PL 100x50x30x30 cm), Columnas CT (70x50x30x30cm), Muros de albañilería e=24cm", elementosHorizontales: "Vigas en X de V30xVar. cm, Vigas en Y de V30x50cm", techo: "Losa aligerada a dos aguas e=20cm", imagenes: [] },
                    { id: 2, nombre: "MÓDULO II", uso: "1° Piso: SUM., Comedor / 2° Piso: Módulo de conectividad, depósito AIP y AIP", pisos: 2, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x120x30x30 cm), Placa PT (100x50x30x30cm)", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [] },
                    { id: 3, nombre: "MÓDULO III", uso: "1° Piso: Biblioteca / 2° Piso: Taller creativo y depósito", pisos: 2, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x120x30x30 cm), Placa PT (100x50x30x30cm)", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [] },
                    { id: 4, nombre: "MÓDULO IV", uso: "Escalera", pisos: 3, sistemaX: "Sistema de Albañilería Confinada", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x100x30x30 cm), Muro Portante e=24cm", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x50 cm", techo: "Losa aligerada e=20cm (1° y 2° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [] },
                    { id: 5, nombre: "MÓDULO V", uso: "Aulas", pisos: 3, sistemaX: "Sistema de Albañilería Confinada", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x100x30x30 cm), Placa PT (50x100x30x30cm), Albañilería portante e=24cm", elementosHorizontales: "Vigas en X de V30x60 cm, Vigas en X de V30x50cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° y 2° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [] },
                    { id: 6, nombre: "MÓDULO VI", uso: "Aulas y Escalera", pisos: 3, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Albañilería Confinada", elementosVerticales: "Placa PL (50x50x30x30 cm), Placa PL (65x50x30x30 cm), Placa PT (100x50x30x30cm)", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° y 2° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [] },
                    { id: 7, nombre: "MÓDULO VII", uso: "Cocina, Almacén de alimentos, Cuarto de limpieza, Dep. combustible, etc.", pisos: 1, sistemaX: "Albañilería Confinada", sistemaY: "Albañilería Confinada", elementosVerticales: "Columnas (30x30 cm), Muro portante e=13cm, Placa e=13cm", elementosHorizontales: "Vigas en X de V30x40cm, Vigas en Y de V30x40cm", techo: "Losa aligerada a una sola agua e=20cm", imagenes: [] },
                    { id: 8, nombre: "MÓDULO VIII", uso: "1° Piso: Residuos sólidos, Sala de Docentes, Tópico, secretaria, dirección y SS.HH. / 2° Piso: Sala de Docentes, Sala de Reuniones", pisos: 2, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Columna CL (50x50x30x30 cm), Placa PT (100x50x30x30cm), Placa 20x200cm", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [] },
                    { id: 9, nombre: "MÓDULO IX", uso: "Aulas, deposito, almacén, SS.HH, etc.", pisos: 1, sistemaX: "Sistema Dual", sistemaY: "Albañilería confinada", elementosVerticales: "Placa PT (100x50x30x30 cm), Columnas CT (70x50x30x30cm)", elementosHorizontales: "Vigas en X de V30xVar. cm, Vigas en Y de V30x50cm", techo: "Losa aligerada a dos aguas e=20cm", imagenes: [] },
                    { id: 10, nombre: "MÓDULO X", uso: "Cocina, depósitos, Comedor, SS.HH, etc.", pisos: 1, sistemaX: "Sistema de Dual", sistemaY: "Sistema de Muros Estructurales", elementosVerticales: "Placas PL (100x50x30x30 cm), Columnas CT (70x50x30x30cm), Placas e=15cm", elementosHorizontales: "Vigas en X de V30xVar. cm, Vigas en Y de V30x50cm", techo: "Losa aligerada a dos aguas e=20cm", imagenes: [] },
                    { id: 11, nombre: "MÓDULO XI", uso: "Área de juego", pisos: 1, sistemaX: "Pórticos Ordinarios Resistentes a Momentos (OMF)", sistemaY: "Pórticos Especiales Resistentes a Momentos (SMF)", elementosVerticales: "Columna cuadrada metálico C30x30cm2 e=8mm.", elementosHorizontales: "Vigas W 10x45 en el eje Y y correas de 2x3x3mm. Tijerales en el eje X tubo HSS 4X4X3mm.", techo: "Cobertura parabólica de Aluzinc tipo TR4.", imagenes: [] },
                    { id: 12, nombre: "MÓDULO XII", uso: "Cuarto de bombas y/o tanque elevado", pisos: 4, sistemaX: "", sistemaY: "", elementosVerticales: "Columnas CL 60x60x25x25 cm", elementosHorizontales: "Vigas en X de V25x60cm, Vigas en Y de V25x60cm", techo: "Losa maciza e=20cm", imagenes: [] },
                    { id: 13, nombre: "MÓDULO XIII", uso: "Rampa", pisos: 3, sistemaX: "Muros estructurales", sistemaY: "Muros estructurales", elementosVerticales: "Columna rectangular (30x40cm), Placas e=30cm", elementosHorizontales: "Vigas en X de V30x60 cm, Vigas en Y de V30x60cm", techo: "Losa en rampa de 15cm, Losa aligerada de 20cm a dos aguas (Techo)", imagenes: [] },
                    { id: 14, nombre: "MÓDULO XIV", uso: "Guardianía y SS.HH.", pisos: 1, sistemaX: "Albañilería Confinada", sistemaY: "Albañilería Confinada", elementosVerticales: "Columnas CL (40x40x25x25 cm)", elementosHorizontales: "Vigas en X de V25x40cm, Vigas en Y de V25x40cm", techo: "Losa aligerada a un agua e=20cm", imagenes: [] },
                    { id: 15, nombre: "MÓDULO XV", uso: "SS.HH.", pisos: 3, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Albañilería Confinada", elementosVerticales: "Columna CL (50x50x30x30 cm), Placas e=20cm, Albañilería e=24cm", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa maciza e=20cm (1° y 2° Nivel), Losa aligerada en dos direcciones a dos aguas e=20cm (Techo)", imagenes: [] },
                    { id: 16, nombre: "MÓDULO XVI", uso: "SUM EXTERIOR", pisos: 1, sistemaX: "Pórticos", sistemaY: "Pórticos", elementosVerticales: "Columna cuadrada de concreto armado C30x30cm2", elementosHorizontales: "Viga de concreto de 30x40cm2 en X. Tijerales en el eje Y tubo HSS 4\"X6\"X3mm.", techo: "Cobertura parabólica de Aluzinc tipo TR4.", imagenes: [] }
                ],

                // 🔥 MAPEO DE IMÁGENES PARA MÓDULOS 01 AL 16
                mapeoImagenes: {
                    1: { archivos: ["figura32M1.png"], figuras: [33], subtitulos: [""] },
                    2: { archivos: ["figura33.png", "figura34M2.png"], figuras: [33, 34], subtitulos: [" (Planta)", " (Elevación)"] },
                    3: { archivos: ["figura35.png", "figura36.png"], figuras: [35, 36], subtitulos: [" (Planta)", " (Elevación)"] },
                    4: { archivos: ["figura37.png", "figura38.png", "figura39.png"], figuras: [37, 38, 39], subtitulos: [" (Planta)", " (Elevación)", " (Sección)"] },
                    5: { archivos: ["figura10M5.png", "figura11M5.png", "figura12M5.png"], figuras: [38, 39, 40], subtitulos: [" (Planta)", " (Elevación)", " (Sección)"] },
                    6: { archivos: ["figura13M6.png", "figura14M6.png", "figura15M6.png"], figuras: [39, 40, 41], subtitulos: [" (Planta)", " (Elevación)", " (Sección)"] },
                    7: { archivos: ["figura39.png"], figuras: [40], subtitulos: [""] },
                    8: { archivos: ["figura417M8.png", "figura418M8.png"], figuras: [41, 42], subtitulos: [" (Planta)", " (Elevación)"] },
                    9: { archivos: ["figura19M9.png"], figuras: [43], subtitulos: [""] },
                    10: { archivos: ["figura20M10.png"], figuras: [44], subtitulos: [""] },
                    11: { archivos: ["figura21M11.png"], figuras: [45], subtitulos: [""] },
                    12: { archivos: ["figura22M12.png"], figuras: [46], subtitulos: [""] },
                    13: { archivos: ["figura23M13.png", "figura24M13.png", "figura25M13.png"], figuras: [47, 48, 49], subtitulos: [" (Vista 1)", " (Vista 2)", " (Vista 3)"] },
                    14: { archivos: ["figura26M14.png"], figuras: [50], subtitulos: [""] },
                    15: { archivos: ["figura27M15.png", "figura28M15.png", "figura29M15.png"], figuras: [51, 52, 53], subtitulos: [" (Vista 1)", " (Vista 2)", " (Vista 3)"] },
                    16: { archivos: ["figura30M16.png"], figuras: [54], subtitulos: [""] }
                },

                // 🔥 DATOS DE OBRAS EXTERIORES E INTERIORES (17 AL 23)
                obrasExtInt: [
                    {
                        numero: 17,
                        nombre: "OBRAS EXTERIORES I - CERCO PERIMETRICO",
                        tipoTabla: "cincoFilas",
                        uso: "Cerco Perimetral",
                        nropisos: "1 piso",
                        sistemaEstructural: "Albañilería Confinada",
                        descripcion: "Conformado por muros de contención, columnas, vigas y ladrillo.",
                        techo: "No cuenta con techo.",
                        tieneImagen: true,
                        archivos: ["figura31PlanoElevacion.png"],
                        figuras: [55],
                        subtitulos: [""]
                    },
                    {
                        numero: 18,
                        nombre: "OBRAS EXTERIORES II - PORTADA PRIMARIA",
                        tipoTabla: "cuatroFilas",
                        uso: "Portada principal primaria",
                        nropisos: "1 piso",
                        descripcion: "Conformación por muros y columnas",
                        techo: "No cuenta con techo.",
                        tieneImagen: true,
                        archivos: ["figura32PlanoPortico.png"],
                        figuras: [56],
                        subtitulos: [""]
                    },
                    {
                        numero: 19,
                        nombre: "OBRAS EXTERIORES III - PORTADA INICIAL",
                        tipoTabla: "cuatroFilas",
                        uso: "Portada principal inicial",
                        nropisos: "1 piso",
                        descripcion: "Conformación por muros y columnas",
                        techo: "No cuenta con techo",
                        tieneImagen: true,
                        archivos: ["figura33PlanoPortico.png"],
                        figuras: [57],
                        subtitulos: [""]
                    },
                    {
                        numero: 20,
                        nombre: "OBRAS EXTERIORES IV - DETALLE DE SARDINEL",
                        tipoTabla: "unaFila",
                        uso: "Sardinel: Soportes o cerco de jardinería",
                        tieneImagen: true,
                        archivos: ["figura34PlanoPlanta.png", "figura35PlanoPlanta.png", "figura36PlanoPlanta.png"],
                        figuras: [58, 59, 60],
                        subtitulos: [" (Vista 1)", " (Vista 2)", " (Vista 3)"]
                    },
                    {
                        numero: 21,
                        nombre: "OBRAS EXTERIORES V - DETALLE DE RAMPA EL SUELO",
                        tipoTabla: "dosFilas",
                        uso: "Ingreso, paso peatonal (rampas)",
                        nropisos: "Apoyado sobre el suelo.",
                        tieneImagen: true,
                        archivos: ["figura37PlanoPlanta.png"],
                        figuras: [61],
                        subtitulos: [""]
                    },
                    {
                        numero: 22,
                        nombre: "OBRAS INTERIORES I - DETALLE DE COCINA",
                        tipoTabla: "unaFila",
                        uso: "Detalles de concreto armado\n-Mesa de concreto: Mesada de concreto armado f´c=140 kg/cm2 con acabados el espesor será e=10cm en Cocina Primaria e Inicial.",
                        tieneImagen: true,
                        archivos: ["figura38PlanoPlanta.png", "figura39PlanoPlanta.png"],
                        figuras: [62, 63],
                        subtitulos: [" (Vista 1)", " (Vista 2)"]
                    },
                    {
                        numero: 23,
                        nombre: "OBRAS INTERIORES II - DETALLE DE LAVADERO",
                        tipoTabla: "unaFila",
                        uso: "Detalles de concreto armado\n-Lavandería de concreto armado: estos lavatorios armados se encuentran en el Módulo XV-1º,2ºy3º nivel, Módulo VII, Modulo X-1, Modulo X-2.\n-Servicio higiénico de concreto armado: Se ubican en el Módulo XV-1º Y 2º",
                        tieneImagen: true,
                        archivos: ["figura40PlanoCuarta.png", "figura41PlanoCuarta.png", "figura42PlanoServicio.png"],
                        figuras: [64, 65, 66],
                        subtitulos: [" (Vista 1)", " (Vista 2)", " (Vista 3)"]
                    }
                ]
            },
            marcoTeorico: {
                conceptosBasicos: "Las edificaciones de los centros educativos, considerada una estructura esencial de clase A, deben distribuirse los elementos estructurales; ya sean columnas, placas, muros de albañilería, vigas, losas, escaleras, etc. de manera adecuada. Por ende, la estructura pueda soportar y tener un buen comportamiento frente a las solicitaciones gravitacionales y, principalmente, frente a los sismos. Teniendo en cuenta que la edificación sea económica, segura, funcional y estéticamente atractiva.",
                criteriosEstructurales: [
                    "Simplicidad y simetría: Las edificaciones como los centros educativos, tratándose de una edificación esencial de clase A1, deben ser regulares y simples estructuralmente, ya que, ante solicitaciones sísmicas se puedan prever su comportamiento adecuado. Así mismo, debe tener una buena distribución de los elementos resistentes a los sismos; por ende, el centro de rigidez y el centro de masa estén lo más cercana posibles para evitar momentos torsionales considerables.",
                    "Resistencia y ductilidad: Las estructuras, como las mostradas de clase A1, deben tener una resistencia adecuada, en las dos direcciones, frente a las solicitaciones gravitacionales y, más importantes, frente a las acciones sísmicas. Cuando la estructura incurre en el rango plástico, se aprovecha su capacidad de ductilidad, formándose rótulas plásticas; el cual, permitirá dar tiempo de evacuación sin dañar a las personas.",
                    "Hiperestaticidad y monolitismo: La hiperestaticidad en las estructuras nos permite mayor estabilidad, resistencia y redistribución de esfuerzos, la cual, podrá formarse mayor cantidad rótulas plásticas. El monolitismo en las estructuras se concibe como si fuera un solo elemento, tal como se modela la estructura.",
                    "Uniformidad y continuidad estructural: Las estructuras deben tener uniformidad y continuidad de los elementos resistentes verticales, sin generar cambios bruscos, el cual, puede traer concentración de esfuerzos indeseables.",
                    "Rigidez lateral: Los elementos estructurales verticales como los muros, placas o columnas (aporticado) controlan las deformaciones laterales. Las cuales, son las responsables de daños en los elementos estructurales.",
                    "Influencia de elementos no estructurales: Los elementos estructurales proveen efectos positivos durante el comportamiento sísmico de las estructuras, esto es, contribución al amortiguamiento dinámico y al agrietarse ayuda a la disipación de energía, sin antes comprometer considerablemente a los elementos estructurales."
                ],
                eleccionSistema: "El sistema estructural que se considerará en este módulo considera en el proyecto, será de sistemas de muros estructurales o duales, dependiendo de la configuración arquitectónica de cada módulo.",
                elementosEstructurales: [
                    "Losa aligerada: Elemento estructural plano donde las cargas son perpendiculares a su plano, siendo las cargas muertas y vivas. Este elemento estructural trabaja principalmente a flexión.",
                    "Vigas: Elementos estructurales lineales que soportan cargas lineales y puntuales provenientes de cargas muertas, vivas y sismo. Trabajan a flexión, cortante y eventualmente a torsión.",
                    "Columnas: Elementos estructurales lineales verticales o con cierta inclinación. Estos elementos trabajan principalmente a compresión, así como a tracción, corte, flexión y eventualmente a flexo compresión o flexo tracción.",
                    "Muros estructurales o placas de concreto armado: También denominados muros de corte debido a que, su función principal es de absorber los esfuerzos cortantes producidos por la fuerza sísmica. Asimismo, son consideradas como elementos estructurales bidimensionales planos. Su espesor es pequeño en comparación a su largo y alto.",
                    "Vigas de cimentación: Elementos estructurales lineales que conectan zapatas para controlar asentamientos diferenciales. Trabajan a flexión y cortante.",
                    "Zapatas: Elementos estructurales que permiten transmitir las cargas al suelo de cimentación, donde los esfuerzos generados en contacto con el suelo no superen la capacidad admisible del suelo. Estos elementos trabajan a flexión y a corte."
                ],
                materiales: {
                    concreto: {
                        fc: "210",
                        ec: "217370.65",
                        peso: "2.4",
                        poisson: "0.20",
                        descripcionGeneral: "El concreto es un producto artificial compuesto adecuadamente (ACI 211.1R y ajustes en obra) de cemento, agregados, agua, aire y eventualmente aditivos o adiciones. Es un material versátil muy usado en estructuras por su resistencia principalmente a la compresión. Sus principales propiedades físicas y mecánicas son:",
                        descripcionResistencia: "Propiedad mecánica del concreto que se determina por ensayos a la compresión de probetas a la edad de 28 días de acuerdo con la Norma ASTM C 172 o NTP 339.034.",
                        descripcionModulo: "Viene a ser la tangente en la zona elástica de la curva esfuerzo – deformación unitaria.",
                        descripcionFormula: "De acuerdo con la NTE E.060 en el art. 8.5.2 especifica la determinación del módulo elasticidad del concreto, con un peso específico aproximado de 2300 kg/m3, mediante la siguiente fórmula:"
                    },
                    acero: {
                        fy: "4200",
                        es: "2000000",
                        peso: "7.85",
                        descripcionGeneral: "Es un acero corrugado laminado en caliente que posee una gran ductilidad, así mismo posee corrugas o resaltes que tienen la finalidad de adherirse mejor al concreto.",
                        descripcionFluencia: "Es aquel esfuerzo donde, partir del cual el acero llega a una deformación unitaria de 0.0035, continúa deformándose sin necesidad de incrementar la fuerza de tensión. A continuación, mostramos el diagrama de esfuerzo – deformación del acero.",
                        descripcionModulo: "Viene a ser la pendiente de la curva en la zona lineal del diagrama esfuerzo - deformación del acero."
                    },
                    cargaMuerta: {
                        descripcion: "Es aquella carga permanente y fija que ejerce sobre la estructura. Las cuales están conformadas por el peso propio de los elementos estructurales y no estructurales, su cálculo se determina por la multiplicación de su peso unitario y volumen o área (losas, cobertura, etc).",
                        items: [
                            "Peso carga general (acabados) : 200 kg/m2",
                            "Peso del aligerado : 300 kg/m2 (h=0.20 m)",
                            "Concreto Armado : 2400 kg/m3",
                            "Tabiquería : 1800 kg/m3",
                            "CM en techo metálico : 30 kg/m2"
                        ]
                    },
                    cargaViva: {
                        descripcion: "La carga viva o sobrecarga actuante en las estructuras es debido a los ocupantes, muebles u otras cargas móviles. Esta carga depende del uso de la edificación y están especificadas en la Norma E.020.",
                        items: [
                            "S/C Ambientes : (De acuerdo con la Norma E.020)",
                            "S/C Corredores y escaleras : 400 kg/m2",
                            "S/C Techos metálicos : 30 kg/m2"
                        ]
                    },
                    albanileria: {
                        fm: "85",
                        vm: "9.2",
                        em: "500",
                        poisson: "0.25"
                    }
                },
                software: "El programa que se va a usar para el análisis y diseño de la superestructura es el ETABS V16 y SAP 2000. El cual nos permitirá modelar, analizar y diseñar la estructura de la edificación. Asimismo, para el diseño de las cimentaciones se usará el programa SAFE 2016.",
                parametrosSismicos: {
                    zona: "2", factorZ: "0.25", perfilSuelo: "S3", factorS: "1.40",
                    tp: "1.00", tl: "1.60", categoria: "A", factorU: "1.50",
                    ro: "7", irregularidades: { altura: false, planta: false }
                },
                parametrosSismicos: {
                    textoIntro: "La norma E.030 nos especifica los parámetros para el análisis sísmico de la estructura, la cual nos servirá para el diseño estructural de los elementos estructurales.",
                    textoFactorZona: "A cada zona se asigna un factor Z según se indica en la Tabla N°1 de la NTE E.030. Este factor se interpreta como la aceleración máxima horizontal del suelo rígido con una probabilidad de 10 % de ser excedida en 50 años.",
                    textoZonaUbicacion: "En el mapa de zonificación sísmica ubicamos la región Loreto, provincia de Ucayali y distrito de Contamana, de donde observamos que pertenece a la Zona 2, a la cual le corresponde el valor de Z = 0.25 (Anexo N° 01 NTE E.030).",
                    textoGeotecnico: "Este valor lo obtenemos de la Tabla N° 3 – factor de suelo (NTE E.030) en base a las características del estudio del suelo, donde se cimentará la edificación. Siendo en nuestro caso un suelo tipo \"S3\", obtenemos un S = 1.40 y los periodos de acuerdo con la tabla N° 04 (NTE E.030) Tp = 1.00 s y TL = 1.60 s.",
                    textoPeriodo: "El periodo fundamental de la estructura se determina de acuerdo con el análisis dinámico modal espectral que se realizó para cada módulo en cada dirección de análisis.",
                    textoCoeficiente: "Representa la amplificación de la respuesta estructural respecto a la aceleración de suelo. De acuerdo con las características de sitio, se define el factor de amplificación sísmica por las siguientes expresiones (NTE E.030):",
                    formulas: [
                        "C = 2.5 si: T < Tp",
                        "C = 2.5(Tp/T) si: Tp < T < Tl",
                        "C = 2.5(Tp.Tl/T²) si: Tl < T"
                    ],
                    textoCategoria: "Este valor se obtiene de la Tabla N° 5 – Categoría de las Edificaciones y factor de uso. (NTE E.030).",
                    textoProyecto: "El proyecto en evaluación corresponde a la categoría A (edificaciones esenciales) tratándose de un centro educativo, por lo tanto, el factor de uso U = 1.5",
                    textoIrregularidadAltura: "Irregularidad en altura Ia",
                    textoIrregularidadPlanta: "Irregularidad en planta Ip"
                }
            },


            consideraciones: {
                1: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "0.50",
                        profundidad: "1.40",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sismico: {
                        zona: "2", factorZ: "0.25", perfilSuelo: "S3", factorS: "1.40",
                        tp: "1.00", tl: "1.60", categoria: "A", factorU: "1.50", coeficienteR: "6"
                    },
                    sobrecargas: "- Sobrecarga en Aulas: 250 kg/m2\n- Sobrecarga en corredores: 400 kg/m2\n- Sobrecarga en techos: 50 kg/m2",
                    recubrimientos: "- Vigas y columnas: 40 mm\n- Losas: 20 mm\n- Zapatas: 70 mm",
                    materiales: "- Concreto: f'c = 210 kg/cm2\n- Acero: fy = 4200 kg/cm2",
                    combinaciones: { comb1: true, comb2: true, comb3: true, comb4: true, comb5: true, comb6: true, comb7: true, comb8: true, comb9: true }
                },
                2: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "0.60",
                        profundidad: "1.40",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sismico: {
                        zona: "2", factorZ: "0.25", perfilSuelo: "S3", factorS: "1.40",
                        tp: "1.00", tl: "1.60", categoria: "A", factorU: "1.50", coeficienteR: "6"
                    },
                    sobrecargas: "- Sobrecarga en AIP: 300 kg/m2\n- Sobrecarga en Depósito AIP: 500 kg/m2\n- Sobrecarga en corredores: 400 kg/m2\n- Sobrecarga en techos: 50 kg/m2",
                    recubrimientos: "- Vigas y columnas: 40 mm\n- Losas: 20 mm\n- Zapatas: 70 mm",
                    materiales: "- Concreto: f'c = 210 kg/cm2\n- Acero: fy = 4200 kg/cm2",
                    combinaciones: { comb1: true, comb2: true, comb3: true, comb4: true, comb5: true, comb6: true, comb7: true, comb8: true, comb9: true }
                },
                3: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "0.60",
                        profundidad: "1.40",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sismico: {
                        zona: "2", factorZ: "0.25", perfilSuelo: "S3", factorS: "1.40",
                        tp: "1.00", tl: "1.60", categoria: "A", factorU: "1.50", coeficienteR: "6"
                    },
                    sobrecargas: "- Sobrecarga en Taller creativo: 350 kg/m2\n- Sobrecarga en Depósito: 500 kg/m2\n- Sobrecarga en corredores: 400 kg/m2\n- Sobrecarga en techos: 50 kg/m2",
                    recubrimientos: "- Vigas y columnas: 40 mm\n- Losas: 20 mm\n- Zapatas: 70 mm",
                    materiales: "- Concreto: f'c = 210 kg/cm2\n- Acero: fy = 4200 kg/cm2",
                    combinaciones: { comb1: true, comb2: true, comb3: true, comb4: true, comb5: true, comb6: true, comb7: true, comb8: true, comb9: true }
                },
                4: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "0.60",
                        profundidad: "1.40",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sismico: {
                        zona: "2", factorZ: "0.25", perfilSuelo: "S3", factorS: "1.40",
                        tp: "1.00", tl: "1.60", categoria: "A", factorU: "1.50", coeficienteR: "3"
                    },
                    sobrecargas: "- Sobrecarga en escaleras: 400 kg/m2\n- Sobrecarga en corredores: 400 kg/m2\n- Sobrecarga en techos: 50 kg/m2",
                    recubrimientos: "- Vigas y columnas: 40 mm\n- Losas: 20 mm\n- Zapatas: 70 mm",
                    materiales: "- Concreto: f'c = 210 kg/cm2\n- Acero: fy = 4200 kg/cm2",
                    combinaciones: { comb1: true, comb2: true, comb3: true, comb4: true, comb5: true, comb6: true, comb7: true, comb8: true, comb9: true }
                },
                5: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "0.63",
                        profundidad: "1.40",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sismico: {
                        zona: "2", factorZ: "0.25", perfilSuelo: "S3", factorS: "1.40",
                        tp: "1.00", tl: "1.60", categoria: "A", factorU: "1.50", coeficienteR: "3"
                    },
                    sobrecargas: "- Sobrecarga en Aulas: 250 kg/m2\n- Sobrecarga en corredores: 400 kg/m2\n- Sobrecarga en techos: 50 kg/m2",
                    recubrimientos: "- Vigas y columnas: 40 mm\n- Losas: 20 mm\n- Zapatas: 70 mm",
                    materiales: "- Concreto: f'c = 210 kg/cm2\n- Acero: fy = 4200 kg/cm2",
                    combinaciones: { comb1: true, comb2: true, comb3: true, comb4: true, comb5: true, comb6: true, comb7: true, comb8: true, comb9: true }
                },
                6: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "0.62",
                        profundidad: "1.40",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sismico: {
                        zona: "2", factorZ: "0.25", perfilSuelo: "S3", factorS: "1.40",
                        tp: "1.00", tl: "1.60", categoria: "A", factorU: "1.50", coeficienteR: "6"
                    },
                    sobrecargas: "- Sobrecarga en Aulas: 250 kg/m2\n- Sobrecarga en escaleras: 400 kg/m2\n- Sobrecarga en corredores: 400 kg/m2\n- Sobrecarga en techos: 100 kg/m2",
                    recubrimientos: "- Vigas y columnas: 40 mm\n- Losas: 20 mm\n- Zapatas: 70 mm",
                    materiales: "- Concreto: f'c = 210 kg/cm2\n- Acero: fy = 4200 kg/cm2",
                    combinaciones: { comb1: true, comb2: true, comb3: true, comb4: true, comb5: true, comb6: true, comb7: true, comb8: true, comb9: true }
                },
                7: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "0.50",
                        profundidad: "1.40",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sismico: {
                        zona: "2", factorZ: "0.25", perfilSuelo: "S3", factorS: "1.40",
                        tp: "1.00", tl: "1.60", categoria: "A", factorU: "1.50", coeficienteR: "3"
                    },
                    sobrecargas: "- Sobrecarga de techos: 50 kg/m2",
                    recubrimientos: "- Vigas y columnas: 40 mm\n- Losas: 20 mm\n- Zapatas: 70 mm",
                    materiales: "- Concreto: f'c = 210 kg/cm2\n- Acero: fy = 4200 kg/cm2",
                    combinaciones: { comb1: true, comb2: true, comb3: true, comb4: true, comb5: true, comb6: true, comb7: true, comb8: true, comb9: true }
                },
                8: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "0.60",
                        profundidad: "1.40",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sismico: {
                        zona: "2", factorZ: "0.25", perfilSuelo: "S3", factorS: "1.40",
                        tp: "1.00", tl: "1.60", categoria: "A", factorU: "1.50", coeficienteR: "6"
                    },
                    sobrecargas: "- Sobrecarga en Sala: 250 kg/m2\n- Sobrecarga en Estar y Bienestar: 250 kg/m2\n- Sobrecarga en Depósito y archivo: 500 kg/m2\n- Sobrecarga en corredores: 400 kg/m2\n- Sobrecarga en techos: 50 kg/m2",
                    recubrimientos: "- Vigas y columnas: 40 mm\n- Losas: 20 mm\n- Zapatas: 70 mm",
                    materiales: "- Concreto: f'c = 210 kg/cm2\n- Acero: fy = 4200 kg/cm2",
                    combinaciones: { comb1: true, comb2: true, comb3: true, comb4: true, comb5: true, comb6: true, comb7: true, comb8: true, comb9: true }
                },
                9: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "0.50",
                        profundidad: "1.40",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sismico: {
                        zona: "2", factorZ: "0.25", perfilSuelo: "S3", factorS: "1.40",
                        tp: "1.00", tl: "1.60", categoria: "A", factorU: "1.50", coeficienteR: "7"
                    },
                    sobrecargas: "- Sobrecarga de techos: 50 kg/m2",
                    recubrimientos: "- Vigas y columnas: 40 mm\n- Losas: 20 mm\n- Zapatas: 70 mm",
                    materiales: "- Concreto: f'c = 210 kg/cm2\n- Acero: fy = 4200 kg/cm2",
                    combinaciones: { comb1: true, comb2: true, comb3: true, comb4: true, comb5: true, comb6: true, comb7: true, comb8: true, comb9: true }
                },
                10: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "0.50",
                        profundidad: "1.40",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sismico: {
                        zona: "2", factorZ: "0.25", perfilSuelo: "S3", factorS: "1.40",
                        tp: "1.00", tl: "1.60", categoria: "A", factorU: "1.50", coeficienteR: "7"
                    },
                    sobrecargas: "- Sobrecarga de techos: 50 kg/m2",
                    recubrimientos: "- Vigas y columnas: 40 mm\n- Losas: 20 mm\n- Zapatas: 70 mm",
                    materiales: "- Concreto: f'c = 210 kg/cm2\n- Acero: fy = 4200 kg/cm2",
                    combinaciones: { comb1: true, comb2: true, comb3: true, comb4: true, comb5: true, comb6: true, comb7: true, comb8: true, comb9: true }
                },
                11: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "0.50",
                        profundidad: "1.40",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sismico: {
                        zona: "2", factorZ: "0.25", perfilSuelo: "S3", factorS: "1.40",
                        tp: "1.00", tl: "1.60", categoria: "A", factorU: "1.50", coeficienteR: "8"
                    },
                    sobrecargas: "- Sobrecarga en techo: 30 kg/m2",
                    recubrimientos: "- Vigas y columnas: 40 mm\n- Losas: 20 mm\n- Zapatas: 70 mm",
                    materiales: "- Acero estructural: ASTM A36\n- Concreto: f'c = 210 kg/cm2\n- Acero de refuerzo: fy = 4200 kg/cm2",
                    combinaciones: { comb1: true, comb2: true, comb3: true, comb4: true, comb5: true, comb6: true, comb7: true, comb8: true, comb9: true }
                },
                12: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "1.50",
                        profundidad: "5.20",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sismico: {
                        zona: "2", factorZ: "0.25", perfilSuelo: "S3", factorS: "1.40",
                        tp: "1.00", tl: "1.60", categoria: "A", factorU: "1.50", coeficienteR: "3"
                    },
                    sobrecargas: "- Sobrecarga en entrepiso: 100 kg/m2\n- Sobrecarga de techos: 50 kg/m2",
                    recubrimientos: "- Vigas y columnas: 40 mm\n- Losas: 20 mm\n- Zapatas: 70 mm",
                    materiales: "- Concreto: f'c = 280 kg/cm2 (cisterna)\n- Acero: fy = 4200 kg/cm2",
                    combinaciones: { comb1: true, comb2: true, comb3: true, comb4: true, comb5: true, comb6: true, comb7: true, comb8: true, comb9: true }
                },
                13: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "0.50",
                        profundidad: "1.40",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sismico: {
                        zona: "2", factorZ: "0.25", perfilSuelo: "S3", factorS: "1.40",
                        tp: "1.00", tl: "1.60", categoria: "A", factorU: "1.50", coeficienteR: "6"
                    },
                    sobrecargas: "- Sobrecarga en rampa: 400 kg/m2",
                    recubrimientos: "- Vigas y columnas: 40 mm\n- Losas: 20 mm\n- Zapatas: 70 mm",
                    materiales: "- Concreto: f'c = 210 kg/cm2\n- Acero: fy = 4200 kg/cm2",
                    combinaciones: { comb1: true, comb2: true, comb3: true, comb4: true, comb5: true, comb6: true, comb7: true, comb8: true, comb9: true }
                },
                14: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "0.60",
                        profundidad: "1.40",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sismico: {
                        zona: "2", factorZ: "0.25", perfilSuelo: "S3", factorS: "1.40",
                        tp: "1.00", tl: "1.60", categoria: "A", factorU: "1.50", coeficienteR: "3"
                    },
                    sobrecargas: "- Sobrecarga de techos: 50 kg/m2",
                    recubrimientos: "- Vigas y columnas: 40 mm\n- Losas: 20 mm\n- Zapatas: 70 mm",
                    materiales: "- Concreto: f'c = 210 kg/cm2\n- Acero: fy = 4200 kg/cm2",
                    combinaciones: { comb1: true, comb2: true, comb3: true, comb4: true, comb5: true, comb6: true, comb7: true, comb8: true, comb9: true }
                },
                15: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "0.66",
                        profundidad: "1.40",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sismico: {
                        zona: "2", factorZ: "0.25", perfilSuelo: "S3", factorS: "1.40",
                        tp: "1.00", tl: "1.60", categoria: "A", factorU: "1.50", coeficienteR: "6"
                    },
                    sobrecargas: "- Sobrecarga en SS.HH.: 250 kg/m2\n- Sobrecarga en corredores: 400 kg/m2\n- Sobrecarga en techos: 50 kg/m2",
                    recubrimientos: "- Vigas y columnas: 40 mm\n- Losas: 20 mm\n- Zapatas: 70 mm",
                    materiales: "- Concreto: f'c = 210 kg/cm2\n- Acero: fy = 4200 kg/cm2",
                    combinaciones: { comb1: true, comb2: true, comb3: true, comb4: true, comb5: true, comb6: true, comb7: true, comb8: true, comb9: true }
                },
                16: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "0.50",
                        profundidad: "1.40",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sismico: {
                        zona: "2", factorZ: "0.25", perfilSuelo: "S3", factorS: "1.40",
                        tp: "1.00", tl: "1.60", categoria: "A", factorU: "1.50", coeficienteR: "8"
                    },
                    sobrecargas: "- Sobrecarga en techo: 30 kg/m2",
                    recubrimientos: "- Vigas y columnas: 40 mm\n- Losas: 20 mm\n- Zapatas: 70 mm",
                    materiales: "- Concreto: f'c = 210 kg/cm2\n- Acero estructural: ASTM A36\n- Acero de refuerzo: fy = 4200 kg/cm2",
                    combinaciones: { comb1: true, comb2: true, comb3: true, comb4: true, comb5: true, comb6: true, comb7: true, comb8: true, comb9: true }
                }
            },

            predimensionamiento: {
                1: {
                    techos: { tipo: "Losa aligerada e=20cm", luz: "5.20", espesor: "0.20" },
                    vigas: {
                        principal: {
                            ejeA: { b: "25", h: "45", luz: "5.00" },
                            ejeB: { b: "25", h: "45", luz: "5.00" },
                            ejeC: { b: "25", h: "45", luz: "5.00" }
                        }
                    },
                    columnas: { c1: { b: "25", h: "25", obs: "ok" }, c2: { b: "25", h: "45", obs: "ok" }, c3: { b: "30", h: "50", obs: "ok" } },
                    observaciones: "El espesor de losa aligerada no debe permitir deflexiones fuera de los límites establecidos. La relación b/h debe estar entre 0.4 y 0.6 para vigas principales."
                },
                2: {
                    techos: { tipo: "Losa aligerada e=20cm (1° Nivel) / Losa aligerada a dos aguas e=20cm (Techo)", luz: "6.00", espesor: "0.20" },
                    vigas: {
                        principal: {
                            ejeA: { b: "30", h: "50", luz: "6.00" },
                            ejeB: { b: "30", h: "50", luz: "6.00" },
                            ejeC: { b: "30", h: "50", luz: "6.00" }
                        }
                    },
                    columnas: { c1: { b: "30", h: "30", obs: "ok" }, c2: { b: "30", h: "50", obs: "ok" }, c3: { b: "35", h: "55", obs: "ok" } },
                    observaciones: "Para luces de 6m, se recomienda vigas de 30x50cm. Columnas centrales de 35x55cm para cumplir con requisitos de rigidez."
                },
                3: {
                    techos: { tipo: "Losa aligerada e=20cm (1° Nivel) / Losa aligerada a dos aguas e=20cm (Techo)", luz: "6.00", espesor: "0.20" },
                    vigas: {
                        principal: {
                            ejeA: { b: "30", h: "50", luz: "6.00" },
                            ejeB: { b: "30", h: "50", luz: "6.00" },
                            ejeC: { b: "30", h: "50", luz: "6.00" }
                        }
                    },
                    columnas: { c1: { b: "30", h: "30", obs: "ok" }, c2: { b: "30", h: "50", obs: "ok" }, c3: { b: "35", h: "55", obs: "ok" } },
                    observaciones: "Similar al Módulo II, con luces de 6m."
                },
                4: {
                    techos: { tipo: "Losa aligerada e=20cm", luz: "4.50", espesor: "0.20" },
                    vigas: {
                        principal: {
                            ejeA: { b: "25", h: "40", luz: "4.50" },
                            ejeB: { b: "25", h: "40", luz: "4.50" },
                            ejeC: { b: "25", h: "40", luz: "4.50" }
                        }
                    },
                    columnas: { c1: { b: "25", h: "25", obs: "ok" }, c2: { b: "25", h: "40", obs: "ok" }, c3: { b: "30", h: "45", obs: "ok" } },
                    observaciones: "Módulo de escaleras, luces más pequeñas. Vigas de 25x40cm suficientes."
                },
                5: {
                    techos: { tipo: "Losa aligerada e=20cm", luz: "5.50", espesor: "0.20" },
                    vigas: {
                        principal: {
                            ejeA: { b: "25", h: "50", luz: "5.50" },
                            ejeB: { b: "25", h: "50", luz: "5.50" },
                            ejeC: { b: "25", h: "50", luz: "5.50" }
                        }
                    },
                    columnas: { c1: { b: "25", h: "25", obs: "ok" }, c2: { b: "25", h: "50", obs: "ok" }, c3: { b: "30", h: "55", obs: "ok" } },
                    observaciones: "Módulo de aulas de 3 pisos. Vigas de 25x50cm."
                },
                6: {
                    techos: { tipo: "Losa aligerada e=20cm", luz: "5.50", espesor: "0.20" },
                    vigas: {
                        principal: {
                            ejeA: { b: "25", h: "50", luz: "5.50" },
                            ejeB: { b: "25", h: "50", luz: "5.50" },
                            ejeC: { b: "25", h: "50", luz: "5.50" }
                        }
                    },
                    columnas: { c1: { b: "25", h: "25", obs: "ok" }, c2: { b: "25", h: "50", obs: "ok" }, c3: { b: "30", h: "55", obs: "ok" } },
                    observaciones: "Módulo de aulas con escalera integrada."
                },
                7: {
                    techos: { tipo: "Losa aligerada a una sola agua e=20cm", luz: "4.00", espesor: "0.20" },
                    vigas: {
                        principal: {
                            ejeA: { b: "25", h: "35", luz: "4.00" },
                            ejeB: { b: "25", h: "35", luz: "4.00" },
                            ejeC: { b: "25", h: "35", luz: "4.00" }
                        }
                    },
                    columnas: { c1: { b: "25", h: "25", obs: "ok" }, c2: { b: "25", h: "35", obs: "ok" }, c3: { b: "25", h: "40", obs: "ok" } },
                    observaciones: "Módulo de cocina y almacenes. Luces pequeñas, vigas de 25x35cm."
                },
                8: {
                    techos: { tipo: "Losa aligerada e=20cm (1° Nivel) / Losa aligerada a dos aguas e=20cm (Techo)", luz: "5.50", espesor: "0.20" },
                    vigas: {
                        principal: {
                            ejeA: { b: "30", h: "50", luz: "5.50" },
                            ejeB: { b: "30", h: "50", luz: "5.50" },
                            ejeC: { b: "30", h: "50", luz: "5.50" }
                        }
                    },
                    columnas: { c1: { b: "30", h: "30", obs: "ok" }, c2: { b: "30", h: "50", obs: "ok" }, c3: { b: "35", h: "55", obs: "ok" } },
                    observaciones: "Módulo administrativo de 2 pisos."
                },
                9: {
                    techos: { tipo: "Losa aligerada a dos aguas e=20cm", luz: "5.00", espesor: "0.20" },
                    vigas: {
                        principal: {
                            ejeA: { b: "25", h: "45", luz: "5.00" },
                            ejeB: { b: "25", h: "45", luz: "5.00" },
                            ejeC: { b: "25", h: "45", luz: "5.00" }
                        }
                    },
                    columnas: { c1: { b: "25", h: "25", obs: "ok" }, c2: { b: "25", h: "45", obs: "ok" }, c3: { b: "30", h: "50", obs: "ok" } },
                    observaciones: "Módulo de aulas de 1 piso."
                },
                10: {
                    techos: { tipo: "Losa aligerada a dos aguas e=20cm", luz: "5.00", espesor: "0.20" },
                    vigas: {
                        principal: {
                            ejeA: { b: "25", h: "45", luz: "5.00" },
                            ejeB: { b: "25", h: "45", luz: "5.00" },
                            ejeC: { b: "25", h: "45", luz: "5.00" }
                        }
                    },
                    columnas: { c1: { b: "25", h: "25", obs: "ok" }, c2: { b: "25", h: "45", obs: "ok" }, c3: { b: "30", h: "50", obs: "ok" } },
                    observaciones: "Módulo de cocina y comedor de 1 piso."
                },
                11: {
                    techos: { tipo: "Cobertura parabólica de Aluzinc tipo TR4", luz: "8.00", espesor: "0.00" },
                    vigas: {
                        principal: {
                            ejeA: { b: "W10x45", h: "25.4", luz: "8.00" },
                            ejeB: { b: "W10x45", h: "25.4", luz: "8.00" },
                            ejeC: { b: "W10x45", h: "25.4", luz: "8.00" }
                        }
                    },
                    columnas: { c1: { b: "30", h: "30", obs: "metálica" }, c2: { b: "30", h: "30", obs: "metálica" }, c3: { b: "30", h: "30", obs: "metálica" } },
                    observaciones: "Estructura metárica para área de juegos. Columnas tubulares C30x30x8mm."
                },
                12: {
                    techos: { tipo: "Losa maciza e=20cm", luz: "4.00", espesor: "0.20" },
                    vigas: {
                        principal: {
                            ejeA: { b: "25", h: "60", luz: "4.00" },
                            ejeB: { b: "25", h: "60", luz: "4.00" },
                            ejeC: { b: "25", h: "60", luz: "4.00" }
                        }
                    },
                    columnas: { c1: { b: "25", h: "25", obs: "ok" }, c2: { b: "60", h: "60", obs: "para tanque" }, c3: { b: "60", h: "60", obs: "para tanque" } },
                    observaciones: "Módulo de cisterna y tanque elevado de 4 niveles. Vigas de 25x60cm reforzadas."
                },
                13: {
                    techos: { tipo: "Losa en rampa de 15cm / Losa aligerada e=20cm (Techo)", luz: "6.00", espesor: "0.15" },
                    vigas: {
                        principal: {
                            ejeA: { b: "30", h: "60", luz: "6.00" },
                            ejeB: { b: "30", h: "60", luz: "6.00" },
                            ejeC: { b: "30", h: "60", luz: "6.00" }
                        }
                    },
                    columnas: { c1: { b: "30", h: "40", obs: "ok" }, c2: { b: "30", h: "40", obs: "ok" }, c3: { b: "30", h: "40", obs: "ok" } },
                    observaciones: "Módulo de rampa vehicular/peatonal. Vigas de 30x60cm para soportar cargas dinámicas."
                },
                14: {
                    techos: { tipo: "Losa aligerada a un agua e=20cm", luz: "3.50", espesor: "0.20" },
                    vigas: {
                        principal: {
                            ejeA: { b: "25", h: "35", luz: "3.50" },
                            ejeB: { b: "25", h: "35", luz: "3.50" },
                            ejeC: { b: "25", h: "35", luz: "3.50" }
                        }
                    },
                    columnas: { c1: { b: "25", h: "25", obs: "ok" }, c2: { b: "25", h: "35", obs: "ok" }, c3: { b: "25", h: "35", obs: "ok" } },
                    observaciones: "Módulo de guardianía, luces pequeñas. Vigas de 25x35cm."
                },
                15: {
                    techos: { tipo: "Losa maciza e=20cm (1° y 2° Nivel) / Losa aligerada dos aguas e=20cm (Techo)", luz: "5.00", espesor: "0.20" },
                    vigas: {
                        principal: {
                            ejeA: { b: "30", h: "50", luz: "5.00" },
                            ejeB: { b: "30", h: "50", luz: "5.00" },
                            ejeC: { b: "30", h: "50", luz: "5.00" }
                        }
                    },
                    columnas: { c1: { b: "30", h: "30", obs: "ok" }, c2: { b: "30", h: "50", obs: "ok" }, c3: { b: "35", h: "55", obs: "ok" } },
                    observaciones: "Módulo de SS.HH. de 3 pisos. Vigas de 30x50cm."
                }
            },

            demolicion: {
                alcance: "Las edificaciones a intervenir son todas las existentes en el terreno de la I.E.I.P. N° 64193 Contamana. Las estructuras actuales presentan patologías constructivas, antigüedad avanzada (11 a 34 años) y no cumplen con los requisitos estructurales ni arquitectónicos establecidos en el Reglamento Nacional de Edificaciones. Se procederá a la demolición total de todas las edificaciones existentes para dar paso a la nueva infraestructura educativa.",
                modulosADemoler: [
                    "MÓDULO I (Biblioteca, Almacén de Alimentos, Dirección y Servicio Higiénico) - DEMOLICIÓN TOTAL - Antigüedad: 34 años",
                    "MÓDULO II (ALMACÉN) - DEMOLICIÓN TOTAL - Antigüedad: 11 años",
                    "MÓDULO III (AULAS DE SEGUNDO, TERCERO Y CUARTO GRADO DE PRIMARIA) - DEMOLICIÓN TOTAL - Antigüedad: 34 años",
                    "MÓDULO IV (AULA INICIAL DE 5 AÑOS) - DEMOLICIÓN TOTAL - Antigüedad: 11 años",
                    "MÓDULO V (DEPÓSITO DE MOBILIARIOS EN MAL ESTADO) - DEMOLICIÓN TOTAL - Antigüedad: 11 años",
                    "MÓDULO VI (AULAS DE INICIAL DE 3 Y 4 AÑOS) - DEMOLICIÓN TOTAL - Antigüedad: 34 años",
                    "MÓDULO VII (SERVICIOS HIGIÉNICOS PARA AULAS DE INICIAL) - DEMOLICIÓN TOTAL - Antigüedad: 11 años",
                    "PATIO DE FORMACIÓN (Losa de concreto simple) - DEMOLICIÓN TOTAL - Antigüedad: 34 años",
                    "LOSA DEPORTIVA - DEMOLICIÓN TOTAL - Antigüedad: 34 años",
                    "SARDINELES, CUNETAS Y VEREDAS DE INGRESO - DEMOLICIÓN TOTAL - Antigüedad: 34 años",
                    "CERCO PERIMÉTRICO - DEMOLICIÓN TOTAL - Antigüedad: 11 años"
                ],
                obrasExterioresADemoler: [
                    "OBRAS EXTERIORES N°1 (PATIO DE FORMACIÓN) - Losa de concreto simple con fallas estructurales - DEMOLICIÓN TOTAL",
                    "OBRAS EXTERIORES N°2 (LOSA DEPORTIVA) - Concreto simple con grietas y deterioro - DEMOLICIÓN TOTAL",
                    "OBRAS EXTERIORES N°3 (SARDINELES, CUNETAS Y VEREDAS) - Concreto simple deteriorado - DEMOLICIÓN TOTAL",
                    "OBRAS EXTERIORES N°4 (CERCO PERIMÉTRICO) - Muros de soga con patologías por humedad - DEMOLICIÓN TOTAL",
                    "OBRAS EXTERIORES N°5 (ANTENA METÁLICA) - REUBICACIÓN según nuevo diseño arquitectónico"
                ]
            },
        },

        // Sólo dataURLs — los objetos File() se reconstruyen en memoria al subir
        previews: {
            coverImage: null,
            coverImage2: null,
            ubicacionImage: null,
            ubicacionImage1: null,
            ubicacionImage2: null,
            demandaInicialImage: null,
            demandaPrimariaImage: null,
            marcoTeoricoImages: [null, null, null, null],

            // 🔥 IMÁGENES DE MÓDULOS - Inicializado con 16 módulos, cada uno con 2 slots
            moduloImages: [
                [null, null],  // Módulo 01 - 2 slots
                [null, null],  // Módulo 02 - 2 slots
                [null, null],  // Módulo 03 - 2 slots
                [null, null],  // Módulo 04 - 2 slots
                [null, null],  // Módulo 05 - 2 slots
                [null, null],  // Módulo 06 - 2 slots
                [null, null],  // Módulo 07 - 2 slots
                [null, null],  // Módulo 08 - 2 slots
                [null, null],  // Módulo 09 - 2 slots
                [null, null],  // Módulo 10 - 2 slots
                [null, null],  // Módulo 11 - 2 slots
                [null, null],  // Módulo 12 - 2 slots
                [null, null],  // Módulo 13 - 2 slots
                [null, null],  // Módulo 14 - 2 slots
                [null, null],  // Módulo 15 - 2 slots
                [null, null],  // Módulo 16 - 2 slots
            ],

            demolicionImages: [],
            predimLosaImage: {},
            predimVigaImage: {},
            predimColumnaImage: {},
        },

        ui: {
            activeSection: "section-generalidades",
            isExporting: false,
            errors: [],
        },
    };

    // ─── Fusionar con datos guardados ────────────────────────────────────────
    const saved = loadFromStorage();
    const initialState = saved
        ? deepMerge(defaults, saved)
        : defaults;

    // ─── El store real ────────────────────────────────────────────────────────
    const store = {
        ...initialState,

        // images guarda objetos File() — NO se persisten, se reconstruyen al subir
        images: {
            coverImage: null,
            coverImage2: null,
            ubicacionImage: null,
            ubicacionImage1: null,
            ubicacionImage2: null,
            demandaInicialImage: null,
            demandaPrimariaImage: null,

            // 🔥 IMÁGENES DE MÓDULOS - Misma estructura que previews
            moduloImages: [
                [null, null],  // Módulo 01 - 2 slots
                [null, null],  // Módulo 02 - 2 slots
                [null, null],  // Módulo 03 - 2 slots
                [null, null],  // Módulo 04 - 2 slots
                [null, null],  // Módulo 05 - 2 slots
                [null, null],  // Módulo 06 - 2 slots
                [null, null],  // Módulo 07 - 2 slots
                [null, null],  // Módulo 08 - 2 slots
                [null, null],  // Módulo 09 - 2 slots
                [null, null],  // Módulo 10 - 2 slots
                [null, null],  // Módulo 11 - 2 slots
                [null, null],  // Módulo 12 - 2 slots
                [null, null],  // Módulo 13 - 2 slots
                [null, null],  // Módulo 14 - 2 slots
                [null, null],  // Módulo 15 - 2 slots
                [null, null],  // Módulo 16 - 2 slots
            ],

            demolicionImages: [],
        },

        // ── PERSISTENCIA: llamar save() en cada mutación importante ───────────
        save() {
            saveToStorage(this);
        },

        /** Borra todos los datos guardados y recarga la página */
        resetAll() {
            localStorage.removeItem(STORAGE_KEY);
            window.location.reload();
        },

        // ─── Cover ─────────────────────────────────────────────────────────────
        updateCover(data) {
            this.cover = { ...this.cover, ...data };
            this.save();
        },

        // ─── Secciones ─────────────────────────────────────────────────────────
        updateSection(sectionId, data) {
            if (this.sections[sectionId]) {
                this.sections[sectionId] = { ...this.sections[sectionId], ...data };
                this.save();
            }
        },

        // ─── Objetivos ─────────────────────────────────────────────────────────
        addObjetivoEspecifico() {
            this.sections.generalidades.objetivos.especificos.push("");
            this.save();
        },
        removeObjetivoEspecifico(index) {
            this.sections.generalidades.objetivos.especificos.splice(index, 1);
            this.save();
        },

        // ─── Marco Normativo ───────────────────────────────────────────────────
        addMarcoNormativo() {
            this.sections.generalidades.marcoNormativo.push("");
            this.save();
        },
        removeMarcoNormativo(index) {
            this.sections.generalidades.marcoNormativo.splice(index, 1);
            this.save();
        },

        // ─── Módulos ───────────────────────────────────────────────────────────
        addModulo() {
            this.sections.descripcionModulos.modulos.push({
                id: Date.now(),
                nombre: `MÓDULO ${String(this.sections.descripcionModulos.modulos.length + 1).padStart(2, '0')}`,
                uso: "", pisos: 1, sistemaX: "", sistemaY: "",
                elementosVerticales: "", elementosHorizontales: "", techo: "", imagenes: [],
            });
            this.save();
        },
        removeModulo(index) {
            this.sections.descripcionModulos.modulos.splice(index, 1);
            this.save();
        },

        // ─── Demolición ────────────────────────────────────────────────────────
        addModuloADemoler() {
            this.sections.demolicion.modulosADemoler.push("");
            this.save();
        },
        addObraExteriorADemoler() {
            this.sections.demolicion.obrasExterioresADemoler.push("");
            this.save();
        },

        // ─── Imágenes simples (dataURL) ────────────────────────────────────────
        updateImage(key, file, preview) {
            this.images[key] = file;      // File() — no persiste
            this.previews[key] = preview;   // dataURL — sí persiste
            this.save();
        },
        removeImage(key) {
            this.images[key] = null;
            this.previews[key] = null;
            this.save();
        },

        /** Handler genérico para inputs tipo file */
        async handleImageChange(key, event) {
            const file = event.target.files?.[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) { alert('Seleccione una imagen válida'); return; }
            if (file.size > 10 * 1024 * 1024) { alert('El archivo excede 10 MB'); return; }
            const reader = new FileReader();
            reader.onload = (e) => { this.updateImage(key, file, e.target.result); };
            reader.readAsDataURL(file);
        },

        // ─── Imágenes de módulos ───────────────────────────────────────────────
        // ─── Imágenes de módulos ───────────────────────────────────────────────
        updateModuloImage(moduloIndex, imageIndex, file, preview) {
            // Asegurar que el array existe
            if (!Array.isArray(this.images.moduloImages)) {
                this.images.moduloImages = [];
            }
            if (!Array.isArray(this.previews.moduloImages)) {
                this.previews.moduloImages = [];
            }

            // Asegurar que el módulo existe
            if (!Array.isArray(this.images.moduloImages[moduloIndex])) {
                this.images.moduloImages[moduloIndex] = [null, null];
            }
            if (!Array.isArray(this.previews.moduloImages[moduloIndex])) {
                this.previews.moduloImages[moduloIndex] = [null, null];
            }

            // Guardar la imagen
            this.images.moduloImages[moduloIndex][imageIndex] = file;
            this.previews.moduloImages[moduloIndex][imageIndex] = preview;
            this.save();
        },

        removeModuloImage(moduloIndex, imageIndex) {
            if (Array.isArray(this.images.moduloImages[moduloIndex])) {
                this.images.moduloImages[moduloIndex][imageIndex] = null;
            }
            if (Array.isArray(this.previews.moduloImages[moduloIndex])) {
                this.previews.moduloImages[moduloIndex][imageIndex] = null;
            }
            this.save();
        },
        // ─── Imágenes de módulos ───────────────────────────────────────────────
        updateModuloImage(moduloIndex, imageIndex, file, preview) {
            if (!Array.isArray(this.images.moduloImages[moduloIndex])) {
                this.images.moduloImages[moduloIndex] = [];
                this.previews.moduloImages[moduloIndex] = [];
            }
            this.images.moduloImages[moduloIndex][imageIndex] = file;
            this.previews.moduloImages[moduloIndex][imageIndex] = preview;
            this.save();
        },
        removeModuloImage(moduloIndex, imageIndex) {
            if (Array.isArray(this.images.moduloImages[moduloIndex]))
                this.images.moduloImages[moduloIndex][imageIndex] = null;
            if (Array.isArray(this.previews.moduloImages[moduloIndex]))
                this.previews.moduloImages[moduloIndex][imageIndex] = null;
            this.save();
        },

        // 🔥 AGREGAR ESTE NUEVO MÉTODO AQUÍ 🔥
        initModuloImages() {
            const targetLength = 16;
            const slotsPerModule = 2;

            // Inicializar images.moduloImages
            if (!Array.isArray(this.images.moduloImages)) {
                this.images.moduloImages = [];
            }
            while (this.images.moduloImages.length < targetLength) {
                this.images.moduloImages.push([null, null]);
            }
            for (let i = 0; i < targetLength; i++) {
                if (!Array.isArray(this.images.moduloImages[i])) {
                    this.images.moduloImages[i] = [null, null];
                }
                while (this.images.moduloImages[i].length < slotsPerModule) {
                    this.images.moduloImages[i].push(null);
                }
            }

            // Inicializar previews.moduloImages
            if (!Array.isArray(this.previews.moduloImages)) {
                this.previews.moduloImages = [];
            }
            while (this.previews.moduloImages.length < targetLength) {
                this.previews.moduloImages.push([null, null]);
            }
            for (let i = 0; i < targetLength; i++) {
                if (!Array.isArray(this.previews.moduloImages[i])) {
                    this.previews.moduloImages[i] = [null, null];
                }
                while (this.previews.moduloImages[i].length < slotsPerModule) {
                    this.previews.moduloImages[i].push(null);
                }
            }

            console.log('✅ Módulos de imágenes inicializados:', this.previews.moduloImages.length);
        },

        // Método para agregar más slots de imagen a un módulo
        addModuloImageSlot(moduloIndex) {
            if (!Array.isArray(this.images.moduloImages[moduloIndex])) {
                this.images.moduloImages[moduloIndex] = [];
            }
            if (!Array.isArray(this.previews.moduloImages[moduloIndex])) {
                this.previews.moduloImages[moduloIndex] = [];
            }

            this.images.moduloImages[moduloIndex].push(null);
            this.previews.moduloImages[moduloIndex].push(null);
            this.save();
        },

        // Método para eliminar el último slot de imagen de un módulo
        removeModuloImageSlot(moduloIndex) {
            if (Array.isArray(this.images.moduloImages[moduloIndex]) &&
                this.images.moduloImages[moduloIndex].length > 1) {
                this.images.moduloImages[moduloIndex].pop();
                this.previews.moduloImages[moduloIndex].pop();
                this.save();
            }
        },

        // Handler para input file de módulo
        async handleModuloImageChange(moduloIndex, imageIndex, event) {
            const file = event.target.files?.[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                alert('Seleccione una imagen válida');
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                alert('El archivo excede 10 MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                this.updateModuloImage(moduloIndex, imageIndex, file, e.target.result);
            };
            reader.readAsDataURL(file);
        },
        removeModuloImage(moduloIndex, imageIndex) {
            if (Array.isArray(this.images.moduloImages[moduloIndex]))
                this.images.moduloImages[moduloIndex][imageIndex] = null;
            if (Array.isArray(this.previews.moduloImages[moduloIndex]))
                this.previews.moduloImages[moduloIndex][imageIndex] = null;
            this.save();
        },

        // ─── Imágenes de demolición ────────────────────────────────────────────
        async handleDemolicionImageChange(index, event) {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                if (!this.previews.demolicionImages) this.previews.demolicionImages = [];
                this.previews.demolicionImages[index] = e.target.result;
                this.save();
            };
            reader.readAsDataURL(file);
        },
        removeDemolicionImage(index) {
            if (this.previews.demolicionImages) {
                this.previews.demolicionImages[index] = null;
                this.save();
            }
        },
        addDemolicionImage() {
            if (!this.previews.demolicionImages) this.previews.demolicionImages = [];
            this.previews.demolicionImages.push(null);
            this.save();
        },

        // ─── Imágenes de predimensionamiento ──────────────────────────────────
        async handlePredimLosaImageChange(modulo, event) {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                if (!this.previews.predimLosaImage) this.previews.predimLosaImage = {};
                this.previews.predimLosaImage[modulo] = e.target.result;
                this.save();
            };
            reader.readAsDataURL(file);
        },
        removePredimLosaImage(modulo) {
            if (this.previews.predimLosaImage) { delete this.previews.predimLosaImage[modulo]; this.save(); }
        },
        async handlePredimVigaImageChange(modulo, event) {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                if (!this.previews.predimVigaImage) this.previews.predimVigaImage = {};
                this.previews.predimVigaImage[modulo] = e.target.result;
                this.save();
            };
            reader.readAsDataURL(file);
        },
        removePredimVigaImage(modulo) {
            if (this.previews.predimVigaImage) { delete this.previews.predimVigaImage[modulo]; this.save(); }
        },

        // ─── Errores UI ────────────────────────────────────────────────────────
        addError(category, message) {
            this.ui.errors.push({ category, message, timestamp: Date.now() });
        },
        clearErrors() { this.ui.errors = []; },

        // ─── Export ────────────────────────────────────────────────────────────
        startExport() { this.ui.isExporting = true; this.clearErrors(); },
        endExport() { this.ui.isExporting = false; },
        getExportData() {
            return {
                cover: this.cover,
                sections: this.sections,
                images: this.images,
                previews: this.previews,
            };
        },
    };
    store.initModuloImages();

    return store;
}

// ─── Utilidad: deep merge (saved sobre defaults) ────────────────────────────
function deepMerge(target, source) {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    output[key] = source[key];
                } else {
                    output[key] = deepMerge(target[key], source[key]);
                }
            } else if (Array.isArray(source[key]) && source[key].length > 0) {
                // Arrays con datos del usuario tienen prioridad
                output[key] = source[key];
            } else if (source[key] !== null && source[key] !== undefined && source[key] !== "") {
                output[key] = source[key];
            }
        });
    }
    return output;
}

function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}