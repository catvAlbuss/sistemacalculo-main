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
                    { id: 1, nombre: "MÓDULO I", uso: "Grupo electrógeno, cuarto de tablero, maestranza, etc.", pisos: 1, sistemaX: "Sistema Dual", sistemaY: "Sistema de Albañilería confinada", elementosVerticales: "Placa L (PL 100x50x30x30 cm), Columnas CT (70x50x30x30cm), Muros de albañilería e=24cm", elementosHorizontales: "Vigas en X de V30xVar. cm, Vigas en Y de V30x50cm", techo: "Losa aligerada a dos aguas e=20cm", imagenes: [], subtitulosImagenes: [] },
                    { id: 2, nombre: "MÓDULO II", uso: "1° Piso: SUM., Comedor / 2° Piso: Módulo de conectividad, depósito AIP y AIP", pisos: 2, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x120x30x30 cm), Placa PT (100x50x30x30cm)", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                    { id: 3, nombre: "MÓDULO III", uso: "1° Piso: Biblioteca / 2° Piso: Taller creativo y depósito", pisos: 2, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x120x30x30 cm), Placa PT (100x50x30x30cm)", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                    { id: 4, nombre: "MÓDULO IV", uso: "Escalera", pisos: 3, sistemaX: "Sistema de Albañilería Confinada", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x100x30x30 cm), Muro Portante e=24cm", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x50 cm", techo: "Losa aligerada e=20cm (1° y 2° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                    { id: 5, nombre: "MÓDULO V", uso: "Aulas", pisos: 3, sistemaX: "Sistema de Albañilería Confinada", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x100x30x30 cm), Placa PT (50x100x30x30cm), Albañilería portante e=24cm", elementosHorizontales: "Vigas en X de V30x60 cm, Vigas en X de V30x50cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° y 2° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                    { id: 6, nombre: "MÓDULO VI", uso: "Aulas y Escalera", pisos: 3, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Albañilería Confinada", elementosVerticales: "Placa PL (50x50x30x30 cm), Placa PL (65x50x30x30 cm), Placa PT (100x50x30x30cm)", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° y 2° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                    { id: 7, nombre: "MÓDULO VII", uso: "Cocina, Almacén de alimentos, Cuarto de limpieza, Dep. combustible, etc.", pisos: 1, sistemaX: "Albañilería Confinada", sistemaY: "Albañilería Confinada", elementosVerticales: "Columnas (30x30 cm), Muro portante e=13cm, Placa e=13cm", elementosHorizontales: "Vigas en X de V30x40cm, Vigas en Y de V30x40cm", techo: "Losa aligerada a una sola agua e=20cm", imagenes: [], subtitulosImagenes: [] },
                    { id: 8, nombre: "MÓDULO VIII", uso: "1° Piso: Residuos sólidos, Sala de Docentes, Tópico, secretaria, dirección y SS.HH. / 2° Piso: Sala de Docentes, Sala de Reuniones", pisos: 2, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Columna CL (50x50x30x30 cm), Placa PT (100x50x30x30cm), Placa 20x200cm", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                    { id: 9, nombre: "MÓDULO IX", uso: "Aulas, deposito, almacén, SS.HH, etc.", pisos: 1, sistemaX: "Sistema Dual", sistemaY: "Albañilería confinada", elementosVerticales: "Placa PT (100x50x30x30 cm), Columnas CT (70x50x30x30cm)", elementosHorizontales: "Vigas en X de V30xVar. cm, Vigas en Y de V30x50cm", techo: "Losa aligerada a dos aguas e=20cm", imagenes: [], subtitulosImagenes: [] },
                    { id: 10, nombre: "MÓDULO X", uso: "Cocina, depósitos, Comedor, SS.HH, etc.", pisos: 1, sistemaX: "Sistema de Dual", sistemaY: "Sistema de Muros Estructurales", elementosVerticales: "Placas PL (100x50x30x30 cm), Columnas CT (70x50x30x30cm), Placas e=15cm", elementosHorizontales: "Vigas en X de V30xVar. cm, Vigas en Y de V30x50cm", techo: "Losa aligerada a dos aguas e=20cm", imagenes: [], subtitulosImagenes: [] },
                    { id: 11, nombre: "MÓDULO XI", uso: "Área de juego", pisos: 1, sistemaX: "Pórticos Ordinarios Resistentes a Momentos (OMF)", sistemaY: "Pórticos Especiales Resistentes a Momentos (SMF)", elementosVerticales: "Columna cuadrada metálico C30x30cm2 e=8mm.", elementosHorizontales: "Vigas W 10x45 en el eje Y y correas de 2x3x3mm. Tijerales en el eje X tubo HSS 4X4X3mm.", techo: "Cobertura parabólica de Aluzinc tipo TR4.", imagenes: [], subtitulosImagenes: [] },
                    { id: 12, nombre: "MÓDULO XII", uso: "Cuarto de bombas y/o tanque elevado", pisos: 4, sistemaX: "", sistemaY: "", elementosVerticales: "Columnas CL 60x60x25x25 cm", elementosHorizontales: "Vigas en X de V25x60cm, Vigas en Y de V25x60cm", techo: "Losa maciza e=20cm", imagenes: [], subtitulosImagenes: [] },
                    { id: 13, nombre: "MÓDULO XIII", uso: "Rampa", pisos: 3, sistemaX: "Muros estructurales", sistemaY: "Muros estructurales", elementosVerticales: "Columna rectangular (30x40cm), Placas e=30cm", elementosHorizontales: "Vigas en X de V30x60 cm, Vigas en Y de V30x60cm", techo: "Losa en rampa de 15cm, Losa aligerada de 20cm a dos aguas (Techo)", imagenes: [], subtitulosImagenes: [] },
                    { id: 14, nombre: "MÓDULO XIV", uso: "Guardianía y SS.HH.", pisos: 1, sistemaX: "Albañilería Confinada", sistemaY: "Albañilería Confinada", elementosVerticales: "Columnas CL (40x40x25x25 cm)", elementosHorizontales: "Vigas en X de V25x40cm, Vigas en Y de V25x40cm", techo: "Losa aligerada a un agua e=20cm", imagenes: [], subtitulosImagenes: [] },
                    { id: 15, nombre: "MÓDULO XV", uso: "SS.HH.", pisos: 3, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Albañilería Confinada", elementosVerticales: "Columna CL (50x50x30x30 cm), Placas e=20cm, Albañilería e=24cm", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa maciza e=20cm (1° y 2° Nivel), Losa aligerada en dos direcciones a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                    { id: 16, nombre: "MÓDULO XVI", uso: "SUM EXTERIOR", pisos: 1, sistemaX: "Pórticos", sistemaY: "Pórticos", elementosVerticales: "Columna cuadrada de concreto armado C30x30cm2", elementosHorizontales: "Viga de concreto de 30x40cm2 en X. Tijerales en el eje Y tubo HSS 4\"X6\"X3mm.", techo: "Cobertura parabólica de Aluzinc tipo TR4.", imagenes: [], subtitulosImagenes: [] }
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
                eleccionSistema: "El sistema estructural constituye el armazón o esqueleto de la estructura, que será capaz de soportar las cargas actuantes y transmitirlas al suelo de fundación. Tenemos sistemas estructurales como: pórticos, dual, de muros estructurales, muros de ductilidad limitada, albañilería confinada, de madera y mixto (pórtico y albañilería).\n\nEl sistema estructural que se considerará en este módulo considera en el proyecto, será de sistemas de muros estructurales o duales.",
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
                    zona: "2",
                    factorZ: "0.25",
                    perfilSuelo: "S3",
                    factorS: "1.40",
                    tp: "1.00",
                    tl: "1.60",
                    categoria: "A",
                    factorU: "1.50",
                    ro: "7",
                    irregularidades: { altura: false, planta: false },

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

                    textoSiendo: "Siendo:",
                    textoListaSiendo: ["T = periodo fundamental de la estructura."],

                    textoCategoria: "Este valor se obtiene de la Tabla N° 5 – Categoría de las Edificaciones y factor de uso. (NTE E.030).",

                    textoProyecto: "El proyecto en evaluación corresponde a la categoría A (edificaciones esenciales) tratándose de un centro educativo, por lo tanto, el factor de uso U = 1.5",

                    textoIrregularidadAltura: "Irregularidad en altura Ia",
                    textoIrregularidadPlanta: "Irregularidad en planta Ip",

                    textoCoeficienteReduccion: "Coeficiente de reducción de las fuerzas sísmicas (R)",

                    textoFormulaR: "R = R₀ * Ia * Ip",

                    textoDonde: "Donde:",

                    listaDonde: [
                        "R₀: Coeficiente básico de reducción de las fuerzas sísmica.",
                        "Ia: Factor de irregularidad en altura",
                        "Ip: Factor de irregularidad en planta"
                    ],

                    textoFuenteTabla: "El coeficiente básico obtenemos de la tabla N° 07 – Sistemas estructurales (NTE E.030)",

                    textoTanque: "Coeficiente de reducción de las fuerzas sísmicas (R) para tanque elevado",

                    textoFuenteTanque: "El coeficiente básico obtenemos de la tabla N° 4.1.1(b) – ACI 350.3-06"
                },
                verificaciones: {
                    textoCortante: "Para verificar la fuerza cortante mínima en la base en cada una de las direcciones, procedemos de la siguiente manera:",
                    textoCortanteNorma: "Según la Norma E.030, se debe cumplir que: V dinámico ≥ (80% o 90%) V estático",
                    textoDerivas: "Para estructuras regulares, los desplazamientos laterales se calculan multiplicando por 0.75R los resultados obtenidos del análisis lineal elástico con las solicitaciones sísmicas reducidas.",
                    textoDerivasTabla: "Los desplazamientos relativos de entrepiso se especifican a continuación:",
                    textoJunta: "La estructura debe estar separada de las estructuras vecinas, desde el nivel del terreno natural, una distancia mínima S para evitar el contacto durante un movimiento sísmico.",
                    textoJuntaFormula: "Esta distancia no será menor que los 2/3 de la suma de los desplazamientos máximos de los edificios adyacentes ni menor que:",
                    formulaJunta: "S = 0.006 h ≥ 0.03 m"
                }
            },
            consideraciones: {
                // ========== DATOS GLOBALES (para Módulos II al XVI) ==========

                // 2.X.3.1. RECUBRIMIENTOS DE ELEMENTOS - texto introductorio
                recubrimientosIntro: "Según lo descrito en la partida 2.1.3.1.",
                recubrimientosLista: [],  // vacío porque no hay lista

                // 2.X.3.2. MATERIALES DE DISEÑO - texto introductorio
                materialesIntro: "Según lo descrito en la partida 2.1.3.2.",
                materialesLista: [],  // vacío porque no hay lista

                // 2.X.3.3. SOBRECARGAS EMPLEADAS - texto introductorio
                sobrecargasIntro: "La estimación de cargas verticales se evaluará conforme a la norma de Cargas, E-020 que forma parte del Reglamento Nacional de Edificaciones.\n\nPara el metrado de cargas en el diseño se utilizará las siguientes cargas:",

                // Cargas muertas (comunes para todos)
                sobrecargasMuertas: [
                    "Concreto: 2400 kg/m3",
                    "Albañilería: 1800 kg/m3",
                    "Aligerado (h=20cm): 300 kg/m2",
                    "Carga muerta general: 200 kg/m2",
                    "Tarrajeo: 2000 kg/m3"
                ],

                // Cargas vivas BASE (luego cada módulo puede tener las suyas)
                sobrecargasVivasBase: [
                    "Sobrecarga de techos: 50 kg/m2"
                ],

                // Texto de Carga Sísmica (común para todos)
                cargaSismicaTexto: "El análisis sísmico contempla un análisis estático y un análisis dinámico empleando un modelo pseudotridimensional, formado por pórticos planos más placas de concreto o muros de albañilería confinada, en ambas direcciones los cuales están unidos entre sí por medio de un diafragma plano en cada entrepiso para compatibilizar desplazamientos. Además, unido a estos diafragmas de entrepiso se colocó la masa de cada nivel con tres coordenadas dinámicas por nivel. Para el modelo de los pórticos planos se tomó en cuenta las deformaciones por flexión, fuerza cortante y carga axial.\n\nPara el análisis dinámico se realizó el método de superposición espectral, considerando como criterio de superposición la combinación cuadrática completa (C.Q.C.) de los modos necesarios.\n\nEl valor de las fuerzas sísmicas que actúan sobre las estructuras se calculó considerando los siguientes parámetros:\n\nFactor de uso, U: La norma E-030 considera a este tipo de edificación como \"Edificaciones esencial\", correspondiéndole un factor de uso U = 1.5.",

                // 2.X.3.4. MÉTODO DE DISEÑO - texto para módulos II al XVI
                metodoDiseñoTexto: "Según lo descrito en la partida 2.1.3.4.",

                // ========== MÓDULO I (2.1) ==========
                1: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "0.50",
                        profundidad: "1.40",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    recubrimientosIntro: "Según el RNE 0.60 Concreto Armado, indica los recubrimientos mínimos en el Inciso 7.7:\n\nDebe proporcionarse el siguiente recubrimiento mínimo de concreto al refuerzo, excepto cuando se requieran recubrimientos mayores según 7.7.5.1 ó se requiera protección especial contra el fuego:",
                    recubrimientosLista: [
                        "Concreto colocado contra el suelo y expuesto permanentemente a él: 70 mm",
                        "Concreto en contacto permanente con el suelo o la intemperie:",
                        "  - Barras de 3/4\" y mayores .............................................................. 50 mm",
                        "  - Barras de 5/8\" y menores, mallas electrosoldadas ........................ 40 mm",
                        "Concreto no expuesto a la intemperie ni en contacto con el suelo:",
                        "  - Losas, muros, viguetas:",
                        "      • Barras de 1 11/16\" y 2 1/4\" ........................................................ 40 mm",
                        "      • Barras de 1 3/8\" y menores ........................................................ 20 mm",
                        "  - Vigas y columnas:",
                        "      • Armadura principal, estribos y espirales ....................................... 40 mm",
                        "  - Cáscaras y losas plegadas:",
                        "      • Barras de 3/4\" y mayores .................................................. 20 mm",
                        "      • Barras de 5/8\" y menores ..................................... 15 mm",
                        "      • Mallas electrosoldadas ....................................... 15 mm"
                    ],
                    materialesIntro: "Se consideró las siguientes características de los materiales que conforman esta estructura.",
                    materialesLista: [
                        "Resistencia del concreto: f'c = 210 kg/cm2, 175 kg/cm2",
                        "Resistencia de la albañilería: f'm = 85 kg/cm2",
                        "Acero corrugado: ASTM A615-GRADO 60",
                        "Cemento: Tipo I",
                        "Módulo de elasticidad del concreto: E = 15000√(f'c) kg/cm2",
                        "Resistencia de fluencia del acero: f'y = 4200 kg/cm2",
                        "Amortiguamiento para el concreto: 0.05"
                    ],
                    sobrecargasIntro: "La estimación de cargas verticales se evaluará conforme a la norma de Cargas, E-020 que forma parte del Reglamento Nacional de Edificaciones.\n\nPara el metrado de cargas en el diseño se utilizará las siguientes cargas:",
                    sobrecargasMuertas: [
                        "Concreto: 2400 kg/m3",
                        "Albañilería: 1800 kg/m3",
                        "Aligerado (h=20cm): 300 kg/m2",
                        "Carga muerta general: 200 kg/m2",
                        "Tarrajeo: 2000 kg/m3"
                    ],
                    sobrecargasVivas: [
                        "Sobrecarga de techos: 50 kg/m2"
                    ],
                    cargaSismicaTexto: "El análisis sísmico contempla un análisis estático y un análisis dinámico empleando un modelo pseudotridimensional, formado por pórticos planos más placas de concreto o muros de albañilería confinada, en ambas direcciones los cuales están unidos entre sí por medio de un diafragma plano en cada entrepiso para compatibilizar desplazamientos. Además, unido a estos diafragmas de entrepiso se colocó la masa de cada nivel con tres coordenadas dinámicas por nivel. Para el modelo de los pórticos planos se tomó en cuenta las deformaciones por flexión, fuerza cortante y carga axial.\n\nPara el análisis dinámico se realizó el método de superposición espectral, considerando como criterio de superposición la combinación cuadrática completa (C.Q.C.) de los modos necesarios.\n\nEl valor de las fuerzas sísmicas que actúan sobre las estructuras se calculó considerando los siguientes parámetros:\n\nFactor de uso, U: La norma E-030 considera a este tipo de edificación como \"Edificaciones esencial\", correspondiéndole un factor de uso U = 1.5.",
                    sismico: {
                        coeficienteR_X: "6",
                        coeficienteR_Y: "3",
                        sistemaX: "columnas y muros estructurales",
                        sistemaY: "albañilería confinada"
                    },
                    metodoDiseño: {
                        texto: "En el análisis por cargas verticales todos los elementos son capaces de resistir las cargas que se generan como consecuencia del uso requerido. Las cargas no exceden los esfuerzos según la norma de diseño correspondiente.\n\nLas vigas, así como las columnas y placas, han sido diseñadas para soportar las cargas de gravedad transmitidas por las losas de techo, así como las cargas sísmicas que eventualmente se les impongan.\n\nCONCRETO ARMADO\nPara el diseño de estructuras de concreto armado (COLUMNAS, VIGAS, ZAPATAS, VIGAS DE CIMENTACION, PLACAS, ETC.) se utilizará el Diseño por Resistencia.\n\nDeberá proporcionarse a todas las secciones de los elementos estructurales Resistencias de diseño (ΦRn) adecuadas, de acuerdo con las disposiciones de la Norma E.060, utilizando los factores de carga (amplificación) y los factores de reducción de resistencia, Φ, especificados en el Capítulo 9 de la RNE E.060.\n\nCombinaciones de carga:\nC1: 1.4D + 1.7L\nC2: 1.25(D + L) + SX\nC3: 1.25(D + L) – SX\nC4: 1.25(D + L) + SY\nC5: 1.25(D + L) – SY\nC6: 0.9D + SX\nC7: 0.9D – SX\nC8: 0.9D + SY\nC9: 0.9D – SY"
                    },
                    // 🔥 NUEVO - ANÁLISIS DIRECCIÓN X
                    analisisX: {
                        factorZ: "0.25",
                        factorU: "1.50",
                        factorS: "1.40",
                        tp: "1.00",
                        tl: "1.60",
                        c: "2.50",
                        t: "6.00",
                        r: "6.00",
                        cr: "0.2188"
                    },
                    // 🔥 NUEVO - ANÁLISIS DIRECCIÓN Y
                    analisisY: {
                        factorZ: "0.25",
                        factorU: "1.50",
                        factorS: "1.40",
                        tp: "1.00",
                        tl: "1.60",
                        c: "2.50",
                        t: "6.00",
                        r: "6.00",
                        cr: "0.359"
                    },
                    // 🔥 NUEVO - TABLA DE ZONAS
                    tablaZonas: {
                        title: "Tabla N° 1 - FACTORES DE ZONA \"Z\"",
                        rows: [
                            { zona: "4", z: "0,45" },
                            { zona: "3", z: "0,35" },
                            { zona: "2", z: "0,25" },
                            { zona: "1", z: "0,10" }
                        ]
                    }
                },

                // ========== MÓDULO II (2.2) ==========
                2: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "0.60",
                        profundidad: "1.40",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sobrecargasVivas: [
                        "Sobrecarga en AIP: 300 kg/m2",
                        "Sobrecarga en Depósito AIP: 500 kg/m2",
                        "Sobrecarga en corredor o pasadizo: 400 kg/m2",
                        "Sobrecarga de techos: 50 kg/m2"
                    ],
                    sismico: {
                        coeficienteR_X: "6",
                        coeficienteR_Y: "6",
                        sistemaX: "placas",
                        sistemaY: "placas"
                    },
                    analisisX: {
                        factorZ: "0.25",
                        factorU: "1.50",
                        factorS: "1.40",
                        tp: "1.00",
                        tl: "1.60",
                        c: "2.50",
                        t: "6.00",
                        r: "6.00",
                        cr: "0.2188"
                    },
                    analisisY: {
                        factorZ: "0.25",
                        factorU: "1.50",
                        factorS: "1.40",
                        tp: "1.00",
                        tl: "1.60",
                        c: "2.50",
                        t: "6.00",
                        r: "6.00",
                        cr: "0.359"
                    },
                    tablaZonas: {
                        title: "Tabla N° 1 - FACTORES DE ZONA \"Z\"",
                        rows: [
                            { zona: "4", z: "0,45" },
                            { zona: "3", z: "0,35" },
                            { zona: "2", z: "0,25" },
                            { zona: "1", z: "0,10" }
                        ]
                    }
                },

                // ========== MÓDULO III (2.3) ==========
                3: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "0.60",
                        profundidad: "1.40",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sobrecargasVivas: [
                        "Sobrecarga en taller creativo: 350 kg/m2",
                        "Sobrecarga en depósito: 500 kg/m2",
                        "Sobrecarga en corredor o pasadizo: 400 kg/m2",
                        "Sobrecarga de techos: 50 kg/m2"
                    ],
                    sismico: {
                        coeficienteR_X: "6",
                        coeficienteR_Y: "6",
                        sistemaX: "placas",
                        sistemaY: "placas"
                    },
                    analisisX: {
                        factorZ: "0.25",
                        factorU: "1.50",
                        factorS: "1.40",
                        tp: "1.00",
                        tl: "1.60",
                        c: "2.50",
                        t: "6.00",
                        r: "6.00",
                        cr: "0.2188"
                    },
                    analisisY: {
                        factorZ: "0.25",
                        factorU: "1.50",
                        factorS: "1.40",
                        tp: "1.00",
                        tl: "1.60",
                        c: "2.50",
                        t: "6.00",
                        r: "6.00",
                        cr: "0.359"
                    },
                    tablaZonas: {
                        title: "Tabla N° 1 - FACTORES DE ZONA \"Z\"",
                        rows: [
                            { zona: "4", z: "0,45" },
                            { zona: "3", z: "0,35" },
                            { zona: "2", z: "0,25" },
                            { zona: "1", z: "0,10" }
                        ]
                    }
                },

                // ========== MÓDULO IV (2.4) ==========
                4: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "0.60",
                        profundidad: "1.40",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sobrecargasVivas: [
                        "Sobrecarga en escaleras: 400 kg/m2",
                        "Sobrecarga en corredor o pasadizo: 400 kg/m2",
                        "Sobrecarga de techos: 50 kg/m2"
                    ],
                    sismico: {
                        coeficienteR_X: "3",
                        coeficienteR_Y: "6",
                        sistemaX: "albañilería confinada",
                        sistemaY: "placas"
                    },
                    analisisX: {
                        factorZ: "0.25",
                        factorU: "1.50",
                        factorS: "1.40",
                        tp: "1.00",
                        tl: "1.60",
                        c: "2.50",
                        t: "6.00",
                        r: "6.00",
                        cr: "0.2188"
                    },
                    analisisY: {
                        factorZ: "0.25",
                        factorU: "1.50",
                        factorS: "1.40",
                        tp: "1.00",
                        tl: "1.60",
                        c: "2.50",
                        t: "6.00",
                        r: "6.00",
                        cr: "0.359"
                    },
                    tablaZonas: {
                        title: "Tabla N° 1 - FACTORES DE ZONA \"Z\"",
                        rows: [
                            { zona: "4", z: "0,45" },
                            { zona: "3", z: "0,35" },
                            { zona: "2", z: "0,25" },
                            { zona: "1", z: "0,10" }
                        ]
                    }
                },

                // ========== MÓDULO V (2.5) ==========
                5: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "0.63",
                        profundidad: "1.40",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sobrecargasVivas: [
                        "Sobrecarga en Aulas: 250 kg/m2",
                        "Sobrecarga en corredor o pasadizo: 400 kg/m2",
                        "Sobrecarga de techos: 50 kg/m2"
                    ],
                    sismico: {
                        coeficienteR_X: "3",
                        coeficienteR_Y: "6",
                        sistemaX: "albañilería confinada",
                        sistemaY: "placas"
                    },
                    analisisX: {
                        factorZ: "0.25",
                        factorU: "1.50",
                        factorS: "1.40",
                        tp: "1.00",
                        tl: "1.60",
                        c: "2.50",
                        t: "6.00",
                        r: "6.00",
                        cr: "0.2188"
                    },
                    analisisY: {
                        factorZ: "0.25",
                        factorU: "1.50",
                        factorS: "1.40",
                        tp: "1.00",
                        tl: "1.60",
                        c: "2.50",
                        t: "6.00",
                        r: "6.00",
                        cr: "0.359"
                    },
                    tablaZonas: {
                        title: "Tabla N° 1 - FACTORES DE ZONA \"Z\"",
                        rows: [
                            { zona: "4", z: "0,45" },
                            { zona: "3", z: "0,35" },
                            { zona: "2", z: "0,25" },
                            { zona: "1", z: "0,10" }
                        ]
                    }
                },

                // ========== MÓDULO VI (2.6) ==========
                6: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "0.62",
                        profundidad: "1.40",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sobrecargasVivas: [
                        "Sobrecarga en Aulas: 250 kg/m2",
                        "Sobrecarga en escaleras: 400 kg/m2",
                        "Sobrecarga en corredor o pasadizo: 400 kg/m2",
                        "Sobrecarga de techos: 100 kg/m2"
                    ],
                    sismico: {
                        coeficienteR_X: "6",
                        coeficienteR_Y: "3",
                        sistemaX: "placas",
                        sistemaY: "albañilería confinada"
                    },
                    analisisX: {
                        factorZ: "0.25",
                        factorU: "1.50",
                        factorS: "1.40",
                        tp: "1.00",
                        tl: "1.60",
                        c: "2.50",
                        t: "6.00",
                        r: "6.00",
                        cr: "0.2188"
                    },
                    analisisY: {
                        factorZ: "0.25",
                        factorU: "1.50",
                        factorS: "1.40",
                        tp: "1.00",
                        tl: "1.60",
                        c: "2.50",
                        t: "6.00",
                        r: "6.00",
                        cr: "0.359"
                    },
                    tablaZonas: {
                        title: "Tabla N° 1 - FACTORES DE ZONA \"Z\"",
                        rows: [
                            { zona: "4", z: "0,45" },
                            { zona: "3", z: "0,35" },
                            { zona: "2", z: "0,25" },
                            { zona: "1", z: "0,10" }
                        ]
                    }
                },

                // ========== MÓDULO VII (2.7) ==========
                7: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "0.50",
                        profundidad: "1.40",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sobrecargasMuertas: [
                        "Concreto: 2400 kg/m3",
                        "Aligerado (h=20cm): 300 kg/m2",
                        "Carga muerta general: 200 kg/m2",
                        "Tarrajeo: 2000 kg/m3"
                    ],
                    sobrecargasVivas: [
                        "Sobrecarga de techos: 50 kg/m2"
                    ],
                    sismico: {
                        coeficienteR_X: "3",
                        coeficienteR_Y: "3",
                        sistemaX: "columnas y muros portantes",
                        sistemaY: "columnas y muros portantes"
                    },
                    analisisX: {
                        factorZ: "0.25",
                        factorU: "1.50",
                        factorS: "1.40",
                        tp: "1.00",
                        tl: "1.60",
                        c: "2.50",
                        t: "6.00",
                        r: "6.00",
                        cr: "0.2188"
                    },
                    analisisY: {
                        factorZ: "0.25",
                        factorU: "1.50",
                        factorS: "1.40",
                        tp: "1.00",
                        tl: "1.60",
                        c: "2.50",
                        t: "6.00",
                        r: "6.00",
                        cr: "0.359"
                    },
                    tablaZonas: {
                        title: "Tabla N° 1 - FACTORES DE ZONA \"Z\"",
                        rows: [
                            { zona: "4", z: "0,45" },
                            { zona: "3", z: "0,35" },
                            { zona: "2", z: "0,25" },
                            { zona: "1", z: "0,10" }
                        ]
                    }
                },

                // ========== MÓDULO VIII (2.8) ==========
                8: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "0.60",
                        profundidad: "1.40",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sobrecargasVivas: [
                        "Sobrecarga Sala: 250 kg/m2",
                        "Sobrecarga Estar y Bienestar: 250 kg/m2",
                        "Sobrecarga en Depósito y archivo: 500 kg/m2",
                        "Sobrecarga en corredor o pasadizo: 400 kg/m2",
                        "Sobrecarga de techos: 50 kg/m2"
                    ],
                    sismico: {
                        coeficienteR_X: "6",
                        coeficienteR_Y: "6",
                        sistemaX: "placas",
                        sistemaY: "placas"
                    },
                    analisisX: {
                        factorZ: "0.25",
                        factorU: "1.50",
                        factorS: "1.40",
                        tp: "1.00",
                        tl: "1.60",
                        c: "2.50",
                        t: "6.00",
                        r: "6.00",
                        cr: "0.2188"
                    },
                    analisisY: {
                        factorZ: "0.25",
                        factorU: "1.50",
                        factorS: "1.40",
                        tp: "1.00",
                        tl: "1.60",
                        c: "2.50",
                        t: "6.00",
                        r: "6.00",
                        cr: "0.359"
                    },
                    tablaZonas: {
                        title: "Tabla N° 1 - FACTORES DE ZONA \"Z\"",
                        rows: [
                            { zona: "4", z: "0,45" },
                            { zona: "3", z: "0,35" },
                            { zona: "2", z: "0,25" },
                            { zona: "1", z: "0,10" }
                        ]
                    }
                },

                // ========== MÓDULO IX (2.9) ==========
                9: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "0.50",
                        profundidad: "1.40",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sobrecargasVivas: [
                        "Sobrecarga de techos: 50 kg/m2"
                    ],
                    sismico: {
                        coeficienteR_X: "7",
                        coeficienteR_Y: "3",
                        sistemaX: "columnas y muros estructurales",
                        sistemaY: "albañilería confinada"
                    },
                    analisisX: {
                        factorZ: "0.25",
                        factorU: "1.50",
                        factorS: "1.40",
                        tp: "1.00",
                        tl: "1.60",
                        c: "2.50",
                        t: "6.00",
                        r: "6.00",
                        cr: "0.2188"
                    },
                    analisisY: {
                        factorZ: "0.25",
                        factorU: "1.50",
                        factorS: "1.40",
                        tp: "1.00",
                        tl: "1.60",
                        c: "2.50",
                        t: "6.00",
                        r: "6.00",
                        cr: "0.359"
                    },
                    tablaZonas: {
                        title: "Tabla N° 1 - FACTORES DE ZONA \"Z\"",
                        rows: [
                            { zona: "4", z: "0,45" },
                            { zona: "3", z: "0,35" },
                            { zona: "2", z: "0,25" },
                            { zona: "1", z: "0,10" }
                        ]
                    }
                },

                // ========== MÓDULO X (2.10) ==========
                10: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "0.50",
                        profundidad: "1.40",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sobrecargasVivas: [
                        "Sobrecarga de techos: 50 kg/m2"
                    ],
                    sismico: {
                        coeficienteR_X: "7",
                        coeficienteR_Y: "6",
                        sistemaX: "columnas y muros estructurales",
                        sistemaY: "muros estructurales"
                    },
                    analisisX: {
                        factorZ: "0.25",
                        factorU: "1.50",
                        factorS: "1.40",
                        tp: "1.00",
                        tl: "1.60",
                        c: "2.50",
                        t: "6.00",
                        r: "6.00",
                        cr: "0.2188"
                    },
                    analisisY: {
                        factorZ: "0.25",
                        factorU: "1.50",
                        factorS: "1.40",
                        tp: "1.00",
                        tl: "1.60",
                        c: "2.50",
                        t: "6.00",
                        r: "6.00",
                        cr: "0.359"
                    },
                    tablaZonas: {
                        title: "Tabla N° 1 - FACTORES DE ZONA \"Z\"",
                        rows: [
                            { zona: "4", z: "0,45" },
                            { zona: "3", z: "0,35" },
                            { zona: "2", z: "0,25" },
                            { zona: "1", z: "0,10" }
                        ]
                    }
                },

                // ========== MÓDULO XI (2.11) - ESTRUCTURA METÁLICA ==========
                11: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "0.50",
                        profundidad: "1.40",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sobrecargasMuertas: [
                        "Concreto armado: 2400 kg/m3"
                    ],
                    sobrecargasVivas: [
                        "Sobrecarga en techo: 30 kg/m2"
                    ],
                    metodoDiseñoTexto: "En el análisis por cargas verticales todos los elementos son capaces de resistir las cargas que se generan como consecuencia del uso requerido. Las cargas no exceden los esfuerzos según la norma de diseño correspondiente.\n\nLas vigas, así como las columnas, han sido diseñadas para soportar las cargas de gravedad transmitidas por las losas de techo, así como las cargas sísmicas que eventualmente se les impongan.\n\nCONCRETO ARMADO\nPara el diseño de estructuras de concreto armado (COLUMNAS, VIGAS, ZAPATAS, VIGAS DE CIMENTACION, PLACAS, ETC.) se utilizará el Diseño por Resistencia.\n\nDeberá proporcionarse a todas las secciones de los elementos estructurales Resistencias de diseño (ΦRn) adecuadas, de acuerdo con las disposiciones de la Norma E.060, utilizando los factores de carga (amplificación) y los factores de reducción de resistencia, Φ, especificados en el Capítulo 9 de la RNE E.060.\n\nESTRUCTURAS METALICAS\nPara el método LRFD la resistencia de diseño de cada sistema o componente estructural deberá ser igual o mayor a la resistencia requerida por las cargas factorizadas.\n\nLa resistencia de diseño ΦRn para cada estado limite se calculará multiplicando la resistencia nominal Rn por el factor de resistencia Φ.\n\nLa resistencia requerida se determinará para cada combinación de carga aplicable.\n\nPara el método ASD los esfuerzos debidos a las cargas externas en cada sistema o componente estructural no deberán exceder los esfuerzos admisibles que se presentan en los Capítulos 4 a 11. Los esfuerzos admisibles pueden incrementarse en 1/3 cuando actúan cargas de sismo o viento solas o en combinación con cargas vivas o de gravedad, de manera que la sección calculada bajo este criterio no sea menor que la requerida cuando no se hace el incremento de 1/3 de los esfuerzos admisibles."
                    // No tiene sismico porque es estructura metálica
                },

                // ========== MÓDULO XII (2.12) - TANQUE ELEVADO ==========
                12: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "1.50",
                        profundidad: "5.20",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sobrecargasMuertas: [
                        "Concreto armado: 2400 kg/m3",
                        "Carga muerta general: 200 kg/m2"
                    ],
                    sobrecargasVivas: [
                        "Sobrecarga en entrepiso: 100 kg/m2",
                        "Sobrecarga de techos: 50 kg/m2"
                    ]
                },

                // ========== MÓDULO XIII (2.13) - RAMPA ==========
                13: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "0.50",
                        profundidad: "1.40",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sobrecargasMuertas: [
                        "Concreto: 2400 kg/m3",
                        "Albañilería: 1800 kg/m3",
                        "Carga muerta general: 200 kg/m2",
                        "Carga muerta parapeto: 450 kg/m2",
                        "Tarrajeo: 2000 kg/m3"
                    ],
                    sobrecargasVivas: [
                        "Sobrecarga en rampa: 400 kg/m2"
                    ]
                },

                // ========== MÓDULO XIV (2.14) ==========
                14: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "0.60",
                        profundidad: "1.40",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sobrecargasVivas: [
                        "Sobrecarga de techos: 50 kg/m2"
                    ],
                    sismico: {
                        coeficienteR_X: "3",
                        coeficienteR_Y: "3",
                        sistemaX: "columnas y muros portantes",
                        sistemaY: "columnas y muros portantes"
                    }
                },

                // ========== MÓDULO XV (2.15) ==========
                15: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "0.66",
                        profundidad: "1.40",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sobrecargasMuertas: [
                        "Concreto: 2400 kg/m3",
                        "Albañilería: 1800 kg/m3",
                        "Aligerado 2D (h=20cm): 324 kg/m2",
                        "Carga muerta general: 200 kg/m2",
                        "Tarrajeo: 2000 kg/m3"
                    ],
                    sobrecargasVivas: [
                        "Sobrecarga en SS.HH.: 250 kg/m2",
                        "Sobrecarga en corredor o pasadizo: 400 kg/m2",
                        "Sobrecarga de techos: 50 kg/m2"
                    ],
                    sismico: {
                        coeficienteR_X: "6",
                        coeficienteR_Y: "3",
                        sistemaX: "placas",
                        sistemaY: "albañilería confinada"
                    }
                },

                // ========== MÓDULO XVI (2.16) - ESTRUCTURA METÁLICA ==========
                16: {
                    geotecnia: {
                        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                        capacidadPortante: "0.50",
                        profundidad: "1.40",
                        agresividadSulfatos: "Ataque no perjudicial",
                        profNF: "A 1.40m y 1.50m"
                    },
                    sobrecargasMuertas: [
                        "Concreto armado: 2400 kg/m3"
                    ],
                    sobrecargasVivas: [
                        "Sobrecarga en techo: 30 kg/m2"
                    ],
                    metodoDiseñoTexto: "En el análisis por cargas verticales todos los elementos son capaces de resistir las cargas que se generan como consecuencia del uso requerido. Las cargas no exceden los esfuerzos según la norma de diseño correspondiente.\n\nLas vigas, así como las columnas, han sido diseñadas para soportar las cargas de gravedad transmitidas por las losas de techo, así como las cargas sísmicas que eventualmente se les impongan.\n\nCONCRETO ARMADO\nPara el diseño de estructuras de concreto armado (COLUMNAS, VIGAS, ZAPATAS, VIGAS DE CIMENTACION, PLACAS, ETC.) se utilizará el Diseño por Resistencia.\n\nDeberá proporcionarse a todas las secciones de los elementos estructurales Resistencias de diseño (ΦRn) adecuadas, de acuerdo con las disposiciones de la Norma E.060, utilizando los factores de carga (amplificación) y los factores de reducción de resistencia, Φ, especificados en el Capítulo 9 de la RNE E.060.\n\nESTRUCTURAS METALICAS\nPara el método LRFD la resistencia de diseño de cada sistema o componente estructural deberá ser igual o mayor a la resistencia requerida por las cargas factorizadas.\n\nLa resistencia de diseño ΦRn para cada estado limite se calculará multiplicando la resistencia nominal Rn por el factor de resistencia Φ.\n\nLa resistencia requerida se determinará para cada combinación de carga aplicable.\n\nPara el método ASD los esfuerzos debidos a las cargas externas en cada sistema o componente estructural no deberán exceder los esfuerzos admisibles que se presentan en los Capítulos 4 a 11. Los esfuerzos admisibles pueden incrementarse en 1/3 cuando actúan cargas de sismo o viento solas o en combinación con cargas vivas o de gravedad, de manera que la sección calculada bajo este criterio no sea menor que la requerida cuando no se hace el incremento de 1/3 de los esfuerzos admisibles."
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
                ],
                modulosImagenes: {},
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
    normalizeConsideraciones(initialState);

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

        getModuleImage(idx) {
            return this.sections.demolicion.modulosImagenes?.[idx] || null;
        },

        triggerImageUpload(idx) {
            const input = document.getElementById(`modulo-img-${idx}`);
            if (input) input.click();
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

        getDefaultModulos() {
            return [
                { id: 1, nombre: "MÓDULO I", uso: "Grupo electrógeno, cuarto de tablero, maestranza, etc.", pisos: 1, sistemaX: "Sistema Dual", sistemaY: "Sistema de Albañilería confinada", elementosVerticales: "Placa L (PL 100x50x30x30 cm), Columnas CT (70x50x30x30cm), Muros de albañilería e=24cm", elementosHorizontales: "Vigas en X de V30xVar. cm, Vigas en Y de V30x50cm", techo: "Losa aligerada a dos aguas e=20cm", imagenes: [], subtitulosImagenes: [] },
                { id: 2, nombre: "MÓDULO II", uso: "1° Piso: SUM., Comedor / 2° Piso: Módulo de conectividad, depósito AIP y AIP", pisos: 2, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x120x30x30 cm), Placa PT (100x50x30x30cm)", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                { id: 3, nombre: "MÓDULO III", uso: "1° Piso: Biblioteca / 2° Piso: Taller creativo y depósito", pisos: 2, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x120x30x30 cm), Placa PT (100x50x30x30cm)", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                { id: 4, nombre: "MÓDULO IV", uso: "Escalera", pisos: 3, sistemaX: "Sistema de Albañilería Confinada", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x100x30x30 cm), Muro Portante e=24cm", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x50 cm", techo: "Losa aligerada e=20cm (1° y 2° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                { id: 5, nombre: "MÓDULO V", uso: "Aulas", pisos: 3, sistemaX: "Sistema de Albañilería Confinada", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x100x30x30 cm), Placa PT (50x100x30x30cm), Albañilería portante e=24cm", elementosHorizontales: "Vigas en X de V30x60 cm, Vigas en X de V30x50cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° y 2° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                { id: 6, nombre: "MÓDULO VI", uso: "Aulas y Escalera", pisos: 3, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Albañilería Confinada", elementosVerticales: "Placa PL (50x50x30x30 cm), Placa PL (65x50x30x30 cm), Placa PT (100x50x30x30cm)", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° y 2° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                { id: 7, nombre: "MÓDULO VII", uso: "Cocina, Almacén de alimentos, Cuarto de limpieza, Dep. combustible, etc.", pisos: 1, sistemaX: "Albañilería Confinada", sistemaY: "Albañilería Confinada", elementosVerticales: "Columnas (30x30 cm), Muro portante e=13cm, Placa e=13cm", elementosHorizontales: "Vigas en X de V30x40cm, Vigas en Y de V30x40cm", techo: "Losa aligerada a una sola agua e=20cm", imagenes: [], subtitulosImagenes: [] },
                { id: 8, nombre: "MÓDULO VIII", uso: "1° Piso: Residuos sólidos, Sala de Docentes, Tópico, secretaria, dirección y SS.HH. / 2° Piso: Sala de Docentes, Sala de Reuniones", pisos: 2, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Columna CL (50x50x30x30 cm), Placa PT (100x50x30x30cm), Placa 20x200cm", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                { id: 9, nombre: "MÓDULO IX", uso: "Aulas, deposito, almacén, SS.HH, etc.", pisos: 1, sistemaX: "Sistema Dual", sistemaY: "Albañilería confinada", elementosVerticales: "Placa PT (100x50x30x30 cm), Columnas CT (70x50x30x30cm)", elementosHorizontales: "Vigas en X de V30xVar. cm, Vigas en Y de V30x50cm", techo: "Losa aligerada a dos aguas e=20cm", imagenes: [], subtitulosImagenes: [] },
                { id: 10, nombre: "MÓDULO X", uso: "Cocina, depósitos, Comedor, SS.HH, etc.", pisos: 1, sistemaX: "Sistema de Dual", sistemaY: "Sistema de Muros Estructurales", elementosVerticales: "Placas PL (100x50x30x30 cm), Columnas CT (70x50x30x30cm), Placas e=15cm", elementosHorizontales: "Vigas en X de V30xVar. cm, Vigas en Y de V30x50cm", techo: "Losa aligerada a dos aguas e=20cm", imagenes: [], subtitulosImagenes: [] },
                { id: 11, nombre: "MÓDULO XI", uso: "Área de juego", pisos: 1, sistemaX: "Pórticos Ordinarios Resistentes a Momentos (OMF)", sistemaY: "Pórticos Especiales Resistentes a Momentos (SMF)", elementosVerticales: "Columna cuadrada metálico C30x30cm2 e=8mm.", elementosHorizontales: "Vigas W 10x45 en el eje Y y correas de 2x3x3mm. Tijerales en el eje X tubo HSS 4X4X3mm.", techo: "Cobertura parabólica de Aluzinc tipo TR4.", imagenes: [], subtitulosImagenes: [] },
                { id: 12, nombre: "MÓDULO XII", uso: "Cuarto de bombas y/o tanque elevado", pisos: 4, sistemaX: "", sistemaY: "", elementosVerticales: "Columnas CL 60x60x25x25 cm", elementosHorizontales: "Vigas en X de V25x60cm, Vigas en Y de V25x60cm", techo: "Losa maciza e=20cm", imagenes: [], subtitulosImagenes: [] },
                { id: 13, nombre: "MÓDULO XIII", uso: "Rampa", pisos: 3, sistemaX: "Muros estructurales", sistemaY: "Muros estructurales", elementosVerticales: "Columna rectangular (30x40cm), Placas e=30cm", elementosHorizontales: "Vigas en X de V30x60 cm, Vigas en Y de V30x60cm", techo: "Losa en rampa de 15cm, Losa aligerada de 20cm a dos aguas (Techo)", imagenes: [], subtitulosImagenes: [] },
                { id: 14, nombre: "MÓDULO XIV", uso: "Guardianía y SS.HH.", pisos: 1, sistemaX: "Albañilería Confinada", sistemaY: "Albañilería Confinada", elementosVerticales: "Columnas CL (40x40x25x25 cm)", elementosHorizontales: "Vigas en X de V25x40cm, Vigas en Y de V25x40cm", techo: "Losa aligerada a un agua e=20cm", imagenes: [], subtitulosImagenes: [] },
                { id: 15, nombre: "MÓDULO XV", uso: "SS.HH.", pisos: 3, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Albañilería Confinada", elementosVerticales: "Columna CL (50x50x30x30 cm), Placas e=20cm, Albañilería e=24cm", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa maciza e=20cm (1° y 2° Nivel), Losa aligerada en dos direcciones a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                { id: 16, nombre: "MÓDULO XVI", uso: "SUM EXTERIOR", pisos: 1, sistemaX: "Pórticos", sistemaY: "Pórticos", elementosVerticales: "Columna cuadrada de concreto armado C30x30cm2", elementosHorizontales: "Viga de concreto de 30x40cm2 en X. Tijerales en el eje Y tubo HSS 4\"X6\"X3mm.", techo: "Cobertura parabólica de Aluzinc tipo TR4.", imagenes: [], subtitulosImagenes: [] }
            ];
        },

        // ─── Módulos ───────────────────────────────────────────────────────────
        addModulo() {
            const store = this.$store.memoriaDescriptiva;
            const modulosActuales = store.sections.descripcionModulos.modulos;

            // Extraer números usando la nueva función
            const numerosExistentes = modulosActuales
                .map(m => this.extraerNumeroModulo(m.nombre))
                .filter(n => n !== null)
                .sort((a, b) => a - b);

            console.log('📊 Números existentes:', numerosExistentes);

            // Buscar primer número faltante entre 1 y 16
            let numeroFaltante = null;
            for (let i = 1; i <= 16; i++) {
                if (!numerosExistentes.includes(i)) {
                    numeroFaltante = i;
                    break;
                }
            }

            let nuevoNumero;
            let usarPredefinido = false;

            if (numeroFaltante !== null) {
                nuevoNumero = numeroFaltante;
                usarPredefinido = true;
                console.log(`🔍 Número faltante detectado: ${nuevoNumero}`);
            } else {
                let maxNumero = 0;
                for (const num of numerosExistentes) {
                    if (num > maxNumero) maxNumero = num;
                }
                nuevoNumero = maxNumero + 1;
                usarPredefinido = false;
                console.log(`📈 Todos los números existen, creando: ${nuevoNumero}`);
            }

            let nuevoModulo;

            if (usarPredefinido && nuevoNumero <= 16) {
                const moduloPredefinido = store.getDefaultModulos()[nuevoNumero - 1];
                if (moduloPredefinido) {
                    nuevoModulo = {
                        ...moduloPredefinido,
                        id: Date.now(),
                        imagenes: [],
                        subtitulosImagenes: []
                    };
                    console.log(`✅ Módulo ${nuevoNumero} recuperado (predefinido)`);
                } else {
                    nuevoModulo = {
                        id: Date.now(),
                        nombre: `MÓDULO ${this.numeroARomano(nuevoNumero)}`,
                        uso: "",
                        pisos: 1,
                        sistemaX: "",
                        sistemaY: "",
                        elementosVerticales: "",
                        elementosHorizontales: "",
                        techo: "",
                        imagenes: [],
                        subtitulosImagenes: []
                    };
                }
            } else {
                // Convertir número a romano para mantener consistencia
                nuevoModulo = {
                    id: Date.now(),
                    nombre: `MÓDULO ${this.numeroARomano(nuevoNumero)}`,
                    uso: "",
                    pisos: 1,
                    sistemaX: "",
                    sistemaY: "",
                    elementosVerticales: "",
                    elementosHorizontales: "",
                    techo: "",
                    imagenes: [],
                    subtitulosImagenes: []
                };
                console.log(`✅ Nuevo módulo ${nuevoNumero} (${this.numeroARomano(nuevoNumero)}) creado vacío`);
            }

            modulosActuales.push(nuevoModulo);

            // Ordenar por número
            modulosActuales.sort((a, b) => {
                const numA = this.extraerNumeroModulo(a.nombre);
                const numB = this.extraerNumeroModulo(b.nombre);
                return numA - numB;
            });

            store.save();

            // Sincronizar imágenes
            const nuevoIndice = modulosActuales.findIndex(m => m.id === nuevoModulo.id);
            if (nuevoIndice !== -1 && store.sincronizarImagenesPorPisos) {
                store.sincronizarImagenesPorPisos(nuevoIndice);
            }
        },

        // Convertir número a romano (para módulos > 16)
        numeroARomano(num) {
            const romanos = {
                1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
                6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X',
                11: 'XI', 12: 'XII', 13: 'XIII', 14: 'XIV', 15: 'XV', 16: 'XVI'
            };
            if (num <= 16) return romanos[num];
            // Para números mayores a 16, usar número arábigo
            return String(num).padStart(2, '0');
        },

        sincronizarImagenesPorPisos(moduloIndex) {
            console.log('🔧 Método llamado - índice:', moduloIndex);

            const modulos = this.sections.descripcionModulos.modulos;
            const modulo = modulos[moduloIndex];

            if (!modulo) {
                console.error('❌ Módulo no encontrado');
                return;
            }

            // 🔥 CONVERTIR PISOS A NÚMERO
            const pisos = parseInt(modulo.pisos) || 1;
            modulo.pisos = pisos;  // Guardar como número

            const mapeoImagenes = this.sections.descripcionModulos.mapeoImagenes || {};
            const imagenesOriginales = mapeoImagenes[modulo.id]?.archivos?.length || 0;

            console.log('📸 Originales:', imagenesOriginales, 'Pisos:', pisos);

            const adicionalesNecesarias = Math.max(0, pisos - imagenesOriginales);
            console.log('➕ Adicionales:', adicionalesNecesarias);

            if (!modulo.imagenes) modulo.imagenes = [];
            if (!modulo.subtitulosImagenes) modulo.subtitulosImagenes = [];

            // Ajustar arrays
            while (modulo.imagenes.length < adicionalesNecesarias) modulo.imagenes.push(null);
            while (modulo.imagenes.length > adicionalesNecesarias) modulo.imagenes.pop();

            while (modulo.subtitulosImagenes.length < adicionalesNecesarias) modulo.subtitulosImagenes.push("");
            while (modulo.subtitulosImagenes.length > adicionalesNecesarias) modulo.subtitulosImagenes.pop();

            console.log('✅ Resultado - imagenes:', modulo.imagenes);

            this.save();
        },

        // ========== MÉTODOS PARA ANÁLISIS SÍSMICO DINÁMICO ==========

        agregarParametroAnalisis(moduloId, direccion) {
            const modulo = this.sections.consideraciones[moduloId];
            if (!modulo) return;

            const nuevoParametro = {
                nombre: "Nuevo parámetro",
                valor: "",
                unidad: ""
            };

            if (direccion === 'X') {
                if (!modulo.analisisX) modulo.analisisX = [];
                modulo.analisisX.push(nuevoParametro);
            } else if (direccion === 'Y') {
                if (!modulo.analisisY) modulo.analisisY = [];
                modulo.analisisY.push(nuevoParametro);
            }

            this.save();
        },

        eliminarParametroAnalisis(moduloId, direccion, index) {
            const modulo = this.sections.consideraciones[moduloId];
            if (!modulo) return;

            if (direccion === 'X' && modulo.analisisX) {
                modulo.analisisX.splice(index, 1);
            } else if (direccion === 'Y' && modulo.analisisY) {
                modulo.analisisY.splice(index, 1);
            }

            this.save();
        },

        // Inicializar parámetros por defecto para cada módulo
        inicializarAnalisisModulo(moduloId) {
            const modulo = this.sections.consideraciones[moduloId];
            if (!modulo) return;

            // Parámetros por defecto para Dirección X
            if (!modulo.analisisX || modulo.analisisX.length === 0) {
                modulo.analisisX = [
                    { nombre: "Factor Z", valor: "0.25", unidad: "" },
                    { nombre: "Factor U", valor: "1.50", unidad: "" },
                    { nombre: "Factor S", valor: "1.40", unidad: "" },
                    { nombre: "Tp", valor: "1.00", unidad: "s" },
                    { nombre: "Tl", valor: "1.60", unidad: "s" },
                    { nombre: "C", valor: "2.50", unidad: "" },
                    { nombre: "T", valor: "6.00", unidad: "s" },
                    { nombre: "R", valor: "6.00", unidad: "" },
                    { nombre: "C/R", valor: "0.2188", unidad: "" }
                ];
            }

            // Parámetros por defecto para Dirección Y
            if (!modulo.analisisY || modulo.analisisY.length === 0) {
                modulo.analisisY = [
                    { nombre: "Factor Z", valor: "0.25", unidad: "" },
                    { nombre: "Factor U", valor: "1.50", unidad: "" },
                    { nombre: "Factor S", valor: "1.40", unidad: "" },
                    { nombre: "Tp", valor: "1.00", unidad: "s" },
                    { nombre: "Tl", valor: "1.60", unidad: "s" },
                    { nombre: "C", valor: "2.50", unidad: "" },
                    { nombre: "T", valor: "6.00", unidad: "s" },
                    { nombre: "R", valor: "6.00", unidad: "" },
                    { nombre: "C/R", valor: "0.359", unidad: "" }
                ];
            }

            this.save();
        },

        async subirImagenModulo(moduloIndex, nivelIndex, event) {
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

            const modulos = this.sections.descripcionModulos.modulos;
            const modulo = modulos[moduloIndex];
            if (!modulo.imagenes) modulo.imagenes = [];

            const reader = new FileReader();
            reader.onload = (e) => {
                modulo.imagenes[nivelIndex] = e.target.result;
                this.save();
            };
            reader.readAsDataURL(file);
        },

        eliminarImagenModulo(moduloIndex, nivelIndex) {
            const modulos = this.sections.descripcionModulos.modulos;
            const modulo = modulos[moduloIndex];
            if (modulo && modulo.imagenes) {
                modulo.imagenes[nivelIndex] = null;
                this.save();
            }
        },


        // ─── Demolición ────────────────────────────────────────────────────────
        addModuloADemoler() {
            if (!this.sections.demolicion.modulosADemoler) {
                this.sections.demolicion.modulosADemoler = [];
            }
            if (!this.sections.demolicion.modulosImagenes) {
                this.sections.demolicion.modulosImagenes = {};
            }
            this.sections.demolicion.modulosADemoler.push("");
            this.save();
        },

        removeModuloADemoler(idx) {
            if (this.sections.demolicion.modulosADemoler) {
                this.sections.demolicion.modulosADemoler.splice(idx, 1);

                if (this.sections.demolicion.modulosImagenes) {
                    delete this.sections.demolicion.modulosImagenes[idx];
                    this.reindexModuleImages();
                }
                this.save();
            }
        },

        reindexModuleImages() {
            const oldImages = { ...(this.sections.demolicion.modulosImagenes || {}) };
            const newImages = {};
            const modulesLength = this.sections.demolicion.modulosADemoler?.length || 0;

            Object.keys(oldImages).forEach(key => {
                const newKey = parseInt(key);
                if (newKey < modulesLength) {
                    newImages[newKey] = oldImages[key];
                }
            });
            this.sections.demolicion.modulosImagenes = newImages;
            this.save();
        },

        triggerImageUpload(idx) {
            const input = document.getElementById(`modulo-img-${idx}`);
            if (input) input.click();
        },

        handleModuleImageUpload(idx, event) {
            const file = event.target.files?.[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                alert('Selecciona una imagen válida');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert('La imagen no puede superar los 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                if (!this.sections.demolicion.modulosImagenes) {
                    this.sections.demolicion.modulosImagenes = {};
                }
                this.sections.demolicion.modulosImagenes[idx] = e.target.result;
                this.save();
                event.target.value = '';
            };
            reader.readAsDataURL(file);
        },

        addObraExteriorADemoler() {
            if (!this.sections.demolicion.obrasExterioresADemoler) {
                this.sections.demolicion.obrasExterioresADemoler = [];
            }
            this.sections.demolicion.obrasExterioresADemoler.push("");
            this.save();
        },

        removeObraExteriorADemoler(idx) {
            if (this.sections.demolicion.obrasExterioresADemoler) {
                this.sections.demolicion.obrasExterioresADemoler.splice(idx, 1);
                this.save();
            }
        },


        // Elimina la imagen de un módulo
        removeModuleImage(idx) {
            if (confirm('¿Eliminar esta imagen?')) {
                if (this.sections.demolicion.modulosImagenes) {
                    delete this.sections.demolicion.modulosImagenes[idx];
                    this.save();
                }
            }
        },
        // Obtiene la imagen de un módulo de demolición
        getModuleImage(idx) {
            return this.sections.demolicion.modulosImagenes?.[idx] || null;
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


        // ============================================
        // FUNCIONES AUXILIARES PARA MÓDULOS
        // ============================================

        romanoANumero(romano) {
            const romanos = {
                'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5,
                'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10,
                'XI': 11, 'XII': 12, 'XIII': 13, 'XIV': 14, 'XV': 15, 'XVI': 16
            };
            return romanos[romano.toUpperCase()] || null;
        },

        extraerNumeroModulo(nombre) {
            if (!nombre) return null;
            const partes = nombre.split(' ');
            const ultimo = partes[partes.length - 1];
            if (!isNaN(parseInt(ultimo))) {
                return parseInt(ultimo, 10);
            }
            return this.romanoANumero(ultimo);
        },

        numeroARomano(num) {
            const romanos = {
                1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
                6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X',
                11: 'XI', 12: 'XII', 13: 'XIII', 14: 'XIV', 15: 'XV', 16: 'XVI'
            };
            if (num <= 16) return romanos[num];
            return String(num).padStart(2, '0');
        },

        addModulo() {
            const modulosActuales = this.sections.descripcionModulos.modulos;

            // Función para convertir romano a número
            const romanoANumero = (romano) => {
                const romanos = {
                    'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5,
                    'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10,
                    'XI': 11, 'XII': 12, 'XIII': 13, 'XIV': 14, 'XV': 15, 'XVI': 16
                };
                return romanos[romano.toUpperCase()] || null;
            };

            // Función para extraer número del nombre
            const extraerNumero = (nombre) => {
                if (!nombre) return null;
                const partes = nombre.split(' ');
                const ultimo = partes[partes.length - 1];
                if (!isNaN(parseInt(ultimo))) {
                    return parseInt(ultimo, 10);
                }
                return romanoANumero(ultimo);
            };

            // Extraer números existentes
            const numerosExistentes = modulosActuales
                .map(m => extraerNumero(m.nombre))
                .filter(n => n !== null)
                .sort((a, b) => a - b);

            // Buscar número faltante entre 1 y 16
            let numeroFaltante = null;
            for (let i = 1; i <= 16; i++) {
                if (!numerosExistentes.includes(i)) {
                    numeroFaltante = i;
                    break;
                }
            }

            let nuevoNumero;
            let usarPredefinido = false;

            if (numeroFaltante !== null) {
                nuevoNumero = numeroFaltante;
                usarPredefinido = true;
            } else {
                let maxNumero = 0;
                for (const num of numerosExistentes) {
                    if (num > maxNumero) maxNumero = num;
                }
                nuevoNumero = maxNumero + 1;
                usarPredefinido = false;
            }

            let nuevoModulo;

            if (usarPredefinido && nuevoNumero <= 16 && this.getDefaultModulos) {
                const moduloPredefinido = this.getDefaultModulos()[nuevoNumero - 1];
                if (moduloPredefinido) {
                    nuevoModulo = {
                        ...moduloPredefinido,
                        id: Date.now(),
                        imagenes: [],
                        subtitulosImagenes: []
                    };
                } else {
                    nuevoModulo = {
                        id: Date.now(),
                        nombre: `MÓDULO ${nuevoNumero}`,
                        uso: "",
                        pisos: 1,
                        sistemaX: "",
                        sistemaY: "",
                        elementosVerticales: "",
                        elementosHorizontales: "",
                        techo: "",
                        imagenes: [],
                        subtitulosImagenes: []
                    };
                }
            } else {
                nuevoModulo = {
                    id: Date.now(),
                    nombre: `MÓDULO ${nuevoNumero}`,
                    uso: "",
                    pisos: 1,
                    sistemaX: "",
                    sistemaY: "",
                    elementosVerticales: "",
                    elementosHorizontales: "",
                    techo: "",
                    imagenes: [],
                    subtitulosImagenes: []
                };
            }

            modulosActuales.push(nuevoModulo);

            // Ordenar
            modulosActuales.sort((a, b) => {
                const numA = extraerNumero(a.nombre);
                const numB = extraerNumero(b.nombre);
                return numA - numB;
            });

            this.save();

            // Sincronizar imágenes
            const nuevoIndice = modulosActuales.findIndex(m => m.id === nuevoModulo.id);
            if (nuevoIndice !== -1 && this.sincronizarImagenesPorPisos) {
                this.sincronizarImagenesPorPisos(nuevoIndice);
            }
        },

        removeModulo(index) {
            this.$store.memoriaDescriptiva.sections.descripcionModulos.modulos.splice(index, 1);
        },

        // ─── Imágenes de módulos ───────────────────────────────────────────────


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

        removeModulo(idx) {
            if (this.sections?.descripcionModulos?.modulos?.[idx]) {

                // 1. Borramos el módulo de la lista
                this.sections.descripcionModulos.modulos.splice(idx, 1);

                // 2. Borramos sus carpetas de imágenes en la misma posición indexada
                if (Array.isArray(this.images?.moduloImages)) {
                    this.images.moduloImages.splice(idx, 1);
                }
                if (Array.isArray(this.previews?.moduloImages)) {
                    this.previews.moduloImages.splice(idx, 1);
                }

                // 3. Guardamos los cambios
                this.save();
            }
        },


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

function normalizeConsideraciones(state) {
    if (!state.sections) state.sections = {};
    if (!isObject(state.sections.consideraciones)) {
        state.sections.consideraciones = {};
    }

    const defaultGeotecnia = {
        perfilSuelo: "TIPO III -- SUELOS BLANDOS",
        capacidadPortante: "0.50",
        profundidad: "1.40",
        agresividadSulfatos: "Ataque no perjudicial",
        profNF: "A 1.40m y 1.50m"
    };
    const defaultSismico = {
        zona: "2",
        factorZ: "0.25",
        perfilSuelo: "S3",
        factorS: "1.40",
        factorSuelo: "S1",
        tp: "1.00",
        tl: "1.60",
        categoria: "A",
        factorU: "1.50",
        coeficienteR: "6",
        coeficienteR_X: "6",
        coeficienteR_Y: "6",
        sistemaEstructural: "Muros de Concreto Armado",
        sistemaX: "placas",
        sistemaY: "placas"
    };
    const defaultAnalisis = {
        factorZ: "0.25",
        factorU: "1.50",
        factorS: "1.40",
        tp: "1.00",
        tl: "1.60",
        c: "2.50",
        t: "6.00",
        r: "6.00",
        cr: "0.2188"
    };
    const defaultCombinaciones = {
        comb1: true, comb2: true, comb3: true, comb4: true, comb5: true,
        comb6: true, comb7: true, comb8: true, comb9: true
    };

    for (let i = 1; i <= 16; i++) {
        const actual = isObject(state.sections.consideraciones[i])
            ? state.sections.consideraciones[i]
            : {};

        actual.geotecnia = deepMerge(defaultGeotecnia, actual.geotecnia || {});
        actual.sismico = deepMerge(defaultSismico, actual.sismico || {});
        actual.analisisX = isObject(actual.analisisX)
            ? deepMerge(defaultAnalisis, actual.analisisX)
            : { ...defaultAnalisis };
        actual.analisisY = isObject(actual.analisisY)
            ? deepMerge({ ...defaultAnalisis, cr: "0.359" }, actual.analisisY)
            : { ...defaultAnalisis, cr: "0.359" };
        actual.combinaciones = deepMerge(defaultCombinaciones, actual.combinaciones || {});
        actual.sobrecargas = actual.sobrecargas || "- Sobrecarga en Aulas: 250 kg/m2\n- Sobrecarga en corredores: 400 kg/m2\n- Sobrecarga en techos: 50 kg/m2";
        actual.recubrimientos = actual.recubrimientos || "- Vigas y columnas: 40 mm\n- Losas: 20 mm\n- Zapatas: 70 mm";
        actual.materiales = actual.materiales || "- Concreto: f'c = 210 kg/cm2\n- Acero: fy = 4200 kg/cm2";

        state.sections.consideraciones[i] = actual;
    }
}
