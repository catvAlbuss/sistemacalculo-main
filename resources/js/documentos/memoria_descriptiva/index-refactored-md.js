// index-refactored-md.js - Componente principal para Memoria Descriptiva

import { buildContentStructure, DEFAULT_MD_STRUCTURE } from "./content-structure-md.js";
import { ContentProcessorMD } from "./content-processor-md.js";
import { DocumentTransformerMD } from "./processors/documentTransformer-md.js";
import ubigeoData from "./ubigeo.json";
import { createMemoriaDescriptivaStore } from "./stores/memoriaDescriptivaStore.js";

// Inicializar store globalmente
if (typeof Alpine !== 'undefined' && !Alpine.store('memoriaDescriptiva')) {
    Alpine.store('memoriaDescriptiva', createMemoriaDescriptivaStore());
}

/**
 * Componente principal Alpine.js para Memoria Descriptiva
 */
function memoriaDescriptiva() {
    return {
        // ============================================
        // GETTERS PARA COMPATIBILIDAD CON VISTAS
        // ============================================
        get cover() { return this.$store?.memoriaDescriptiva?.cover || {}; },
        get sections() { return this.$store?.memoriaDescriptiva?.sections || {}; },
        get images() { return this.$store?.memoriaDescriptiva?.images || {}; },
        get previews() { return this.$store?.memoriaDescriptiva?.previews || {}; },
        get ui() { return this.$store?.memoriaDescriptiva?.ui || { errors: [] }; },
        get errors() { return this.ui.errors; },
        get isExporting() { return this.ui.isExporting; },

        // Documento base
        document: JSON.parse(JSON.stringify(DEFAULT_MD_STRUCTURE.document)),

        // Estado del modal
        showErrorModal: false,
        validationErrors: [],

        // ============================================
        // INICIALIZACIÓN
        // ============================================
        // PARCHE para index-refactored-md.js
        // Agregar este bloque dentro de la función init() del componente memoriaDescriptiva,
        // DESPUÉS de la línea: this.initDefaultData();
        //
        // ─────────────────────────────────────────────────────────────────────────────
        // REEMPLAZA el método init() existente con este:
        // ─────────────────────────────────────────────────────────────────────────────

        init() {
            console.log('🚀 Inicializando Memoria Descriptiva');

            if (this.$store.memoriaDescriptiva && ubigeoData) {
                this.$store.memoriaDescriptiva.ubigeoData = ubigeoData;
            }

            this.initDefaultArrays();
            this.initDefaultData();

            // ── AUTO-SAVE: cada vez que cualquier dato del store cambia, persistir ──
            // Observamos cover
            this.$watch('$store.memoriaDescriptiva.cover', () => {
                this.$store.memoriaDescriptiva.save();
            }, { deep: true });

            // Observamos sections
            this.$watch('$store.memoriaDescriptiva.sections', () => {
                this.$store.memoriaDescriptiva.save();
            }, { deep: true });

            // Observamos previews (dataURLs de imágenes)
            this.$watch('$store.memoriaDescriptiva.previews', () => {
                this.$store.memoriaDescriptiva.save();
            }, { deep: true });

            console.log('✅ Inicialización completa — auto-save activado');
        },
        initDefaultData() {
            console.log('🔄 Inicializando datos por defecto');

            const store = this.$store.memoriaDescriptiva;

            // Datos de ejemplo para la portada (basados en tu Word)
            if (!store.cover.project || store.cover.project === "") {
                store.cover.project = "MEJORAMIENTO DE LOS SERVICIOS DE EDUCACION INICIAL Y PRIMARIA DE LA I.E.I.P. N° 64193 CONTAMANA DEL DISTRITO DE CONTAMANA- PROVINCIA DE UCAYALI -- DEPARTAMENTO DE LORETO";
            }
            if (!store.cover.uei) store.cover.uei = "MUNICIPALIDAD PROVINCIAL DE UCAYALI";
            if (!store.cover.unifiedCode) store.cover.unifiedCode = "2484411";
            if (!store.cover.ieName) store.cover.ieName = "64193";
            if (!store.cover.localCode) store.cover.localCode = "391051";
            if (!store.cover.modularCodes) store.cover.modularCodes = "INICIAL:1307156/PRIMARIA:03004881";
            if (!store.cover.region) store.cover.region = "LORETO";
            if (!store.cover.province) store.cover.province = "UCAYALI";
            if (!store.cover.district) store.cover.district = "CONTAMANA";
            if (!store.cover.centerTown) store.cover.centerTown = "CONTAMANA";

            // Datos de ubicación
            if (!store.cover.ubigeo.department) store.cover.ubigeo.department = "LORETO";
            if (!store.cover.ubigeo.province) store.cover.ubigeo.province = "UCAYALI";
            if (!store.cover.ubigeo.district) store.cover.ubigeo.district = "CONTAMANA";

            // Módulos por defecto (si está vacío)

            // Módulos por defecto (si está vacío)
            if (store.sections.descripcionModulos.modulos.length === 0) {
                const modulosPredefinidos = store.getDefaultModulos();  // ← CAMBIAR A store.getDefaultModulos()
                store.sections.descripcionModulos.modulos = [];
                for (let i = 0; i < modulosPredefinidos.length; i++) {
                    store.sections.descripcionModulos.modulos.push({
                        ...modulosPredefinidos[i],
                        imagenes: [],
                        subtitulosImagenes: []
                    });
                }
                console.log('✅ 16 módulos cargados en initDefaultData');
            }

            // ==================== OBJETIVOS ====================
            if (!store.sections.generalidades.objetivos.general) {
                store.sections.generalidades.objetivos.general = "Realizar el modelamiento, análisis y cálculo estructural de la estructura correspondiente al proyecto, así como verificaciones posteriores: para lo cual se presenta a continuación los objetivos específicos de la memoria de cálculo.";
            }

            if (store.sections.generalidades.objetivos.especificos.length === 0) {
                store.sections.generalidades.objetivos.especificos = [
                    "Dimensionar los elementos estructurales.",
                    "Calcular las cargas actuantes en la estructura y su masa.",
                    "Realizar el modelamiento estructural del Proyecto con el Software ETABS, SAP 2000 y SAFE.",
                    "Realizar el análisis estático de la estructura.",
                    "Realizar el análisis dinámico modal espectral de la estructura.",
                    "Realizar la verificación de la participación del 90% de la masa como mínimo, para la validez del análisis dinámico, según disposiciones de la norma E030.",
                    "Realizar la verificación de la fuerza cortante mínima en la base (relación entre cortante dinámica y estática) y su correspondiente factor de escala, para el diseño de los elementos, según disposiciones de la norma E030.",
                    "Realizar la verificación de las distorsiones laterales en los entrepisos, según disposiciones de la norma E030.",
                    "Realizar el diseño de los elementos estructurales.",
                    "Verificar el análisis y diseño con normas internacionales."
                ];
            }

            if (!store.sections.generalidades.objetivos.tipoTerreno) {
                store.sections.generalidades.objetivos.tipoTerreno = "El terreno es de tipología de TIPO I (sin posibilidad de expansión) que contempla dentro de sus linderos parte de su programa arquitectónico. Con la finalidad de atender la totalidad del servicio educativo, se hará uso del equipamiento de Losa deportiva del entorno que se encuentra disponible.";
            }


            if (!store.sections.generalidades.objetivos.proyectoDetalle) {
                store.sections.generalidades.objetivos.proyectoDetalle = "• El proyecto será elaborado de un Colegio Inicial Ciclo II de tres aulas de 20 y Primaria Polidocente completo de 15 aulas de 30 alumnos cada uno, según lo establecido en el RVM N°208-2019 -- MINEDU.";
            }

            // ==================== ANTECEDENTES ====================
            const textoAntecedentes = `La I.E 64193 es un centro educativo en Loreto que pertenece a la población Urbana, una institución educativa Escolarizada perteneciente a la DRE Loreto con código 160007 y que está supervisada por la UGEL Ucayali-Contamana.

            La Institución Educativa Inicial y Primaria N°64193, donde la fecha de incorporación al registro de servicios educativos del nivel inicial es el 10-03-2006 y del nivel primaria el 01-04-1911, año de su creación. En sus inicios los pobladores y autoridades, realizaron la donación de un terreno a la Dirección Regional de Educación de Loreto, con la única finalidad de que se construya una infraestructura educativa para el nivel primaria y posteriormente el inicial, con el fin de que los alumnos y el personal docente pueda contar con adecuados espacios pedagógicos, administrativos, complementarios y áreas de recreación, mejorando la calidad educativa de los alumnos. En la actualidad la I.E cuenta con 23 niños y dos docentes.

            Según el último censo educativo la institución educativa en el nivel Inicial - Jardín cuenta con clases en turno Mañana, con unas 3 secciones y tiene un total aproximado de 38 alumnos, contando con 20 varones y 18 mujeres. Con 3 docentes.

            Así mismo la institución educativa en el nivel Primaria cuenta con clases en turno Mañana, con unas 6 secciones y tiene un total aproximado de 138 alumnos, contando con 74 varones y 64 mujeres. Con 7 docentes.`;

            if (!store.sections.generalidades.antecedentes.history) {
                store.sections.generalidades.antecedentes.history = textoAntecedentes;
            }

            if (!store.sections.generalidades.antecedentes.textoCompleto) {
                store.sections.generalidades.antecedentes.textoCompleto = textoAntecedentes;
            }

            // Parámetros sísmicos por defecto
            if (!store.sections.marcoTeorico.parametrosSismicos.zona) {
                store.sections.marcoTeorico.parametrosSismicos.zona = "2";
                store.sections.marcoTeorico.parametrosSismicos.factorZ = "0.25";
                store.sections.marcoTeorico.parametrosSismicos.perfilSuelo = "S3";
                store.sections.marcoTeorico.parametrosSismicos.factorS = "1.40";
                store.sections.marcoTeorico.parametrosSismicos.tp = "1.00";
                store.sections.marcoTeorico.parametrosSismicos.tl = "1.60";
                store.sections.marcoTeorico.parametrosSismicos.categoria = "A";
                store.sections.marcoTeorico.parametrosSismicos.factorU = "1.50";
            }

            // Software por defecto
            if (!store.sections.marcoTeorico.software) {
                store.sections.marcoTeorico.software = "ETABS V16, SAP 2000 y SAFE 2016";
            }

            // ==================== NUEVO: Inicializar consideraciones para 16 módulos ====================
            if (Object.keys(store.sections.consideraciones).length === 0) {
                for (let i = 1; i <= 16; i++) {
                    store.sections.consideraciones[i] = {
                        geotecnia: {
                            perfilSuelo: "TIPO III -- SUELOS BLANDOS",
                            capacidadPortante: "0.50",
                            profundidad: "1.40",
                            agresividadSulfatos: "Ataque no perjudicial",
                            profNF: "A 1.40m y 1.50m"
                        },
                        sismico: {
                            zona: "2",
                            factorZ: "0.25",
                            perfilSuelo: "S3",
                            factorS: "1.40",
                            tp: "1.00",
                            tl: "1.60",
                            categoria: "A",
                            factorU: "1.50",
                            coeficienteR: "6"
                        },
                        sobrecargas: "- Sobrecarga en Aulas: 250 kg/m2\n- Sobrecarga en corredores: 400 kg/m2\n- Sobrecarga en techos: 50 kg/m2",
                        recubrimientos: "- Vigas y columnas: 40 mm\n- Losas: 20 mm\n- Zapatas: 70 mm",
                        materiales: "- Concreto: f'c = 210 kg/cm2\n- Acero: fy = 4200 kg/cm2",
                        combinaciones: {
                            comb1: true, comb2: true, comb3: true, comb4: true, comb5: true,
                            comb6: true, comb7: true, comb8: true, comb9: true
                        }
                    };
                }
                // ==================== INCOMPATIBILIDADES DEL TERRENO ====================
                if (!store.sections.generalidades.incompatibilidades) {
                    store.sections.generalidades.incompatibilidades = [
                        { num: "1", descripcion: "No pueden ubicarse a una distancia menor de 150 m en línea recta de velatorios y/o cementerios.", dispositivoLegal: "DS Nº 003-94-SA", compatibilizacion: "Compatible: La IE se encuentra a 771m del cementerio" },
                        { num: "2", descripcion: "No pueden ubicarse a una distancia menor de 1,000 m de rellenos sanitarios y rellenos de seguridad.", dispositivoLegal: "DS Nº 057-2004-PCM", compatibilizacion: "Compatible: No existe rellenos de ese tipo a 3000 metros" },
                        { num: "3", descripcion: "Se prohíbe la construcción de los locales educativos en áreas que fueron utilizadas como infraestructura de disposición final de residuos sólidos.", dispositivoLegal: "DS Nº 057-2004-PCM", compatibilizacion: "Compatible" },
                        { num: "4", descripcion: "No pueden ubicarse a una distancia menor de 100 m de cualquier Establecimiento de Salud.", dispositivoLegal: "RM N° 045-2015/MINSA", compatibilizacion: "Compatible: La IE se encuentra a 758m del establecimiento de salud" }
                        // ... continuar hasta 26 filas
                    ];
                }
                console.log('✅ Consideraciones inicializadas para 16 módulos');
            }

            // ==================== NUEVO: Inicializar predimensionamiento para 15 módulos ====================
            if (Object.keys(store.sections.predimensionamiento).length === 0) {
                for (let i = 1; i <= 15; i++) {
                    store.sections.predimensionamiento[i] = {
                        techos: {
                            tipo: "Losa aligerada e=20cm",
                            luz: "5.20",
                            espesor: "0.20"
                        },
                        vigas: {
                            principal: {
                                ejeA: { b: "25", h: "45", luz: "5.00" },
                                ejeB: { b: "25", h: "45", luz: "5.00" },
                                ejeC: { b: "25", h: "45", luz: "5.00" }
                            }
                        },
                        columnas: {
                            c1: { b: "25", h: "25", obs: "ok" },
                            c2: { b: "25", h: "45", obs: "ok" },
                            c3: { b: "30", h: "50", obs: "ok" }
                        },
                        observaciones: "El espesor de losa aligerada no debe permitir deflexiones fuera de los límites establecidos."
                    };
                }
                console.log('✅ Predimensionamiento inicializado para 15 módulos');
            }

            // ==================== DOCUMENTOS Y PLANOS POR DEFECTO ====================
            // Forzar carga de documentos si están vacíos o tienen menos de 20
            if (store.sections.documentosPlanos.documentos.length < 20) {
                store.sections.documentosPlanos.documentos = [
                    "Memoria descriptiva general",
                    "Especificaciones Técnicas Estructuras",
                    "Especificaciones Técnicas Obras Provisionales",
                    "Memoria de cálculo del Módulo I",
                    "Memoria de cálculo del Módulo II",
                    "Memoria de cálculo del Módulo III",
                    "Memoria de cálculo del Módulo IV",
                    "Memoria de cálculo del Módulo V",
                    "Memoria de cálculo del Módulo VI",
                    "Memoria de cálculo del Módulo VII",
                    "Memoria de cálculo del Módulo VIII",
                    "Memoria de cálculo del Módulo IX",
                    "Memoria de cálculo del Módulo X",
                    "Memoria de cálculo del Módulo XI",
                    "Memoria de cálculo del Módulo XII",
                    "Memoria de cálculo del Módulo XIII",
                    "Memoria de cálculo del Módulo XIV",
                    "Memoria de cálculo del Módulo XV",
                    "Memoria de cálculo del Módulo XVI",
                    "Memoria de cálculo de Obras Exteriores-I Cerco Perimétrico",
                    "Memoria de cálculo de Obras Exteriores-II Portada Primaria",
                    "Memoria de cálculo de Obras Exteriores-III Portada Inicial"
                ];
                console.log('✅ Documentos inicializados:', store.sections.documentosPlanos.documentos.length);
            }

            // Forzar carga de planos si están vacíos o tienen menos de 20
            if (store.sections.documentosPlanos.planos.length < 20) {
                store.sections.documentosPlanos.planos = [
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
                ];
                console.log('✅ Planos inicializados:', store.sections.documentosPlanos.planos.length);
            }
            // ==================== DATOS DEL PROYECTO (1.2) ====================
            const dp = store.sections.generalidades.datosProyecto;

            if (!dp.nombre || dp.nombre === "") {
                dp.nombre = store.cover.project;
            }
            if (!dp.localidad || dp.localidad === "") {
                dp.localidad = "Contamana";
                dp.distrito = "Contamana";
                dp.provincia = "Ucayali";
                dp.region = "Loreto";
                dp.este = "499311.54";
                dp.norte = "9188568.58";
                dp.altitud = "134";
                dp.colindanciaNorte = "Vivienda aledaña";
                dp.colindanciaSur = "Vivienda aledaña";
                dp.colindanciaEste = "Vivienda aledaña";
                dp.colindanciaOeste = "Av. Victor Raul Haya de la Torre";
            }
            if (!dp.uei || dp.uei === "") {
                dp.uei = store.cover.uei || "Municipalidad Provincial de Ucayali";
            }

            // Guardar los cambios en localStorage
            store.save();

        },
        initDefaultArrays() {
            const store = this.$store.memoriaDescriptiva;

            // Inicializar módulos si está vacío
            if (!store.sections.descripcionModulos.modulos.length) {
                const modulosPredefinidos = store.getDefaultModulos();  // ← CAMBIAR A store.getDefaultModulos()
                store.sections.descripcionModulos.modulos = [];
                for (let i = 0; i < modulosPredefinidos.length; i++) {
                    store.sections.descripcionModulos.modulos.push({
                        ...modulosPredefinidos[i],
                        imagenes: [],
                        subtitulosImagenes: []
                    });
                }
                console.log('✅ 16 módulos cargados con subtitulosImagenes');
            } else {
                // MIGRAR MÓDULOS EXISTENTES
                for (let i = 0; i < store.sections.descripcionModulos.modulos.length; i++) {
                    const modulo = store.sections.descripcionModulos.modulos[i];
                    if (!modulo.subtitulosImagenes) {
                        modulo.subtitulosImagenes = [];
                    }
                    if (!modulo.imagenes) {
                        modulo.imagenes = [];
                    }
                }
            }

            // Inicializar marcos normativos (estos métodos están en el componente)
            if (!store.sections.generalidades.marcoNormativo.length) {
                store.sections.generalidades.marcoNormativo = this.getDefaultMarcoNormativo();
            }

            if (!store.sections.marcoTeorico.criteriosEstructurales.length) {
                store.sections.marcoTeorico.criteriosEstructurales = this.getDefaultCriteriosEstructurales();
            }

            if (!store.sections.marcoTeorico.elementosEstructurales.length) {
                store.sections.marcoTeorico.elementosEstructurales = this.getDefaultElementosEstructurales();
            }

            store.save();
        },

        getDefaultModulos() {
            return [
                { id: 1, nombre: "MÓDULO I", uso: "Grupo electrógeno, cuarto de tablero, maestranza", pisos: 1, sistemaX: "Sistema Dual", sistemaY: "Sistema de Albañilería confinada", elementosVerticales: "Placa L (100x50x30x30 cm), Columnas CT (70x50x30x30cm), Muros de albañilería e=24cm", elementosHorizontales: "Vigas en X de V30xVar. cm, Vigas en Y de V30x50cm", techo: "Losa aligerada a dos aguas e=20cm", imagenes: [], subtitulosImagenes: [] },
                { id: 2, nombre: "MÓDULO II", uso: "1° Piso: SUM., Comedor / 2° Piso: Módulo de conectividad, depósito AIP y AIP", pisos: 2, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x120x30x30 cm), Placa PT (100x50x30x30cm)", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                { id: 3, nombre: "MÓDULO III", uso: "1° Piso: Biblioteca / 2° Piso: Taller creativo y depósito", pisos: 2, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x120x30x30 cm), Placa PT (100x50x30x30cm)", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                { id: 4, nombre: "MÓDULO IV", uso: "Escalera", pisos: 3, sistemaX: "Sistema de Albañilería Confinada", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x100x30x30 cm), Muro Portante e=24cm", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x50 cm", techo: "Losa aligerada e=20cm (1° y 2° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                { id: 5, nombre: "MÓDULO V", uso: "Aulas", pisos: 3, sistemaX: "Sistema de Albañilería Confinada", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x100x30x30 cm), Placa PT (50x100x30x30cm), Albañilería portante e=24cm", elementosHorizontales: "Vigas en X de V30x60 cm, Vigas en X de V30x50cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° y 2° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                { id: 6, nombre: "MÓDULO VI", uso: "Aulas y Escalera", pisos: 3, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Albañilería Confinada", elementosVerticales: "Placa PL (50x50x30x30 cm), Placa PL (65x50x30x30 cm), Placa PT (100x50x30x30cm)", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° y 2° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                { id: 7, nombre: "MÓDULO VII", uso: "Cocina, Almacén de alimentos, Cuarto de limpieza, Dep. combustible", pisos: 1, sistemaX: "Albañilería Confinada", sistemaY: "Albañilería Confinada", elementosVerticales: "Columnas (30x30 cm), Muro portante e=13cm, Placa e=13cm", elementosHorizontales: "Vigas en X de V30x40cm, Vigas en Y de V30x40cm", techo: "Losa aligerada a una sola agua e=20cm", imagenes: [], subtitulosImagenes: [] },
                { id: 8, nombre: "MÓDULO VIII", uso: "1° Piso: Residuos sólidos, Sala de Docentes, Tópico, secretaria, dirección / 2° Piso: Sala de Docentes, Sala de Reuniones", pisos: 2, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Columna CL (50x50x30x30 cm), Placa PT (100x50x30x30cm), Placa 20x200cm", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                { id: 9, nombre: "MÓDULO IX", uso: "Aulas, deposito, almacén, SS.HH", pisos: 1, sistemaX: "Sistema Dual", sistemaY: "Albañilería confinada", elementosVerticales: "Placa PT (100x50x30x30 cm), Columnas CT (70x50x30x30cm)", elementosHorizontales: "Vigas en X de V30xVar. cm, Vigas en Y de V30x50cm", techo: "Losa aligerada a dos aguas e=20cm", imagenes: [], subtitulosImagenes: [] },
                { id: 10, nombre: "MÓDULO X", uso: "Cocina, depósitos, Comedor, SS.HH", pisos: 1, sistemaX: "Sistema de Dual", sistemaY: "Sistema de Muros Estructurales", elementosVerticales: "Placas PL (100x50x30x30 cm), Columnas CT (70x50x30x30cm), Placas e=15cm", elementosHorizontales: "Vigas en X de V30xVar. cm, Vigas en Y de V30x50cm", techo: "Losa aligerada a dos aguas e=20cm", imagenes: [], subtitulosImagenes: [] },
                { id: 11, nombre: "MÓDULO XI", uso: "Área de juego", pisos: 1, sistemaX: "Pórticos Ordinarios Resistentes a Momentos (OMF)", sistemaY: "Pórticos Especiales Resistentes a Momentos (SMF)", elementosVerticales: "Columna cuadrada metálica C30x30cm2 e=8mm", elementosHorizontales: "Vigas W 10x45, correas 2x3x3mm, Tijerales tubo HSS 4X4X3mm", techo: "Cobertura parabólica de Aluzinc tipo TR4", imagenes: [], subtitulosImagenes: [] },
                { id: 12, nombre: "MÓDULO XII", uso: "Cuarto de bombas y/o tanque elevado", pisos: 4, sistemaX: "No aplica", sistemaY: "No aplica", elementosVerticales: "Columnas CL 60x60x25x25 cm", elementosHorizontales: "Vigas en X de V25x60cm, Vigas en Y de V25x60cm", techo: "Losa maciza e=20cm", imagenes: [], subtitulosImagenes: [] },
                { id: 13, nombre: "MÓDULO XIII", uso: "Rampa", pisos: 3, sistemaX: "Muros estructurales", sistemaY: "Muros estructurales", elementosVerticales: "Columna rectangular (30x40cm), Placas e=30cm", elementosHorizontales: "Vigas en X de V30x60 cm, Vigas en Y de V30x60cm", techo: "Losa en rampa de 15cm, Losa aligerada de 20cm a dos aguas", imagenes: [], subtitulosImagenes: [] },
                { id: 14, nombre: "MÓDULO XIV", uso: "Guardianía y SS.HH", pisos: 1, sistemaX: "Albañilería Confinada", sistemaY: "Albañilería Confinada", elementosVerticales: "Columnas CL (40x40x25x25 cm)", elementosHorizontales: "Vigas en X de V25x40cm, Vigas en Y de V25x40cm", techo: "Losa aligerada a un agua e=20cm", imagenes: [], subtitulosImagenes: [] },
                { id: 15, nombre: "MÓDULO XV", uso: "SS.HH", pisos: 3, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Albañilería Confinada", elementosVerticales: "Columna CL (50x50x30x30 cm), Placas e=20cm, Albañilería e=24cm", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa maciza e=20cm (1° y 2° Nivel), Losa aligerada dos aguas e=20cm (Techo)", imagenes: [], subtitulosImagenes: [] },
                { id: 16, nombre: "MÓDULO XVI", uso: "SUM EXTERIOR", pisos: 1, sistemaX: "Pórticos", sistemaY: "Pórticos", elementosVerticales: "Columna cuadrada de concreto armado C30x30cm2", elementosHorizontales: "Viga de concreto de 30x40cm2 en X. Tijerales en Y tubo HSS 4X6X3mm", techo: "Cobertura parabólica de Aluzinc tipo TR4", imagenes: [], subtitulosImagenes: [] },
            ];
        },

        getDefaultMarcoNormativo() {
            return [
                "Norma Técnica de Edificaciones E.020 \"Cargas\"",
                "Norma Técnica de Edificaciones E.030 \"Diseño Sismo-Resistente\"",
                "Norma Técnica de Edificaciones E.050 \"Suelos\"",
                "Norma Técnica de Edificaciones E.060 \"Concreto Armado\"",
                "Norma Técnica de Edificaciones E.070 \"Albañilería\"",
                "Norma Técnica de Edificaciones E.090 \"Estructuras Metálicas\"",
                "Norma Técnica de Edificaciones ACI 318",
                "Norma Técnica de Edificaciones ACI 350.3-06",
                "Norma Técnica de Edificaciones ASCE",
                "Norma Técnica de Edificaciones AISC",
                "Norma Técnica de Edificaciones AWS",
            ];
        },

        getDefaultCriteriosEstructurales() {
            return [
                "Simplicidad y simetría: La estructura debe ser regular y simple para prever su comportamiento ante sismos.",
                "Resistencia y ductilidad: Debe tener resistencia adecuada y capacidad de disipar energía mediante rótulas plásticas.",
                "Hiperestaticidad y monolitismo: Permite mayor estabilidad y redistribución de esfuerzos.",
                "Uniformidad y continuidad estructural: Evitar cambios bruscos que concentren esfuerzos.",
                "Rigidez lateral: Controlar deformaciones laterales mediante muros, placas o columnas.",
                "Influencia de elementos no estructurales: Contribuyen al amortiguamiento dinámico y disipación de energía.",
            ];
        },

        getDefaultElementosEstructurales() {
            return [
                "Losa aligerada: Elemento plano que trabaja principalmente a flexión.",
                "Vigas: Elementos lineales que trabajan a flexión, cortante y torsión.",
                "Columnas: Elementos verticales que trabajan a compresión, tracción, corte y flexo compresión.",
                "Muros estructurales o placas: Elementos bidimensionales que absorben esfuerzos cortantes sísmicos.",
                "Vigas de cimentación: Conectan zapatas para controlar asentamientos diferenciales.",
                "Zapatas: Transmiten cargas al suelo verificando que no superen la capacidad admisible.",
            ];
        },

        // ============================================
        // MÉTODOS - Módulos Dinámicos
        // ============================================
        addModulo() {
            const modulos = this.$store.memoriaDescriptiva.sections.descripcionModulos.modulos;
            const nuevoId = modulos.length > 0 ? Math.max(...modulos.map(m => m.id)) + 1 : 1;
            modulos.push({
                id: nuevoId,
                nombre: `MÓDULO ${String(modulos.length + 1).padStart(2, '0')}`,
                uso: "",
                pisos: 1,
                sistemaX: "",
                sistemaY: "",
                elementosVerticales: "",
                elementosHorizontales: "",
                techo: "",
                imagenes: [],
                subtitulosImagenes: []
            });
        },

        removeModulo(index) {
            this.$store.memoriaDescriptiva.sections.descripcionModulos.modulos.splice(index, 1);
        },

        // ============================================
        // MÉTODOS - Imágenes
        // ============================================
        async handleImageChange(key, event) {
            const file = event.target.files?.[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                alert('Por favor seleccione un archivo de imagen válido');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                this.$store.memoriaDescriptiva.updateImage(key, file, e.target.result);
            };
            reader.readAsDataURL(file);
        },

        removeImage(key) {
            this.$store.memoriaDescriptiva.removeImage(key);
        },

        async handleModuloImageChange(moduloIndex, imageIndex, event) {
            const file = event.target.files?.[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                alert('Por favor seleccione un archivo de imagen válido');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                this.$store.memoriaDescriptiva.updateModuloImage(moduloIndex, imageIndex, file, e.target.result);
            };
            reader.readAsDataURL(file);
        },

        removeModuloImage(moduloIndex, imageIndex) {
            this.$store.memoriaDescriptiva.removeModuloImage(moduloIndex, imageIndex);
        },

        // ============================================
        // MÉTODOS - DEMOLICIÓN
        // ============================================

        addModuloADemoler() {
            const store = this.$store.memoriaDescriptiva;
            if (!store.sections.demolicion.modulosADemoler) {
                store.sections.demolicion.modulosADemoler = [];
            }
            store.sections.demolicion.modulosADemoler.push('');
            store.save();
        },

        removeModuloADemoler(idx) {
            const store = this.$store.memoriaDescriptiva;
            if (store.sections.demolicion.modulosADemoler) {
                store.sections.demolicion.modulosADemoler.splice(idx, 1);
            }
            // También eliminar la imagen asociada si existe
            if (store.sections.demolicion.modulosImagenes) {
                store.sections.demolicion.modulosImagenes.splice(idx, 1);
            }
            store.save();
        },

        addObraExteriorADemoler() {
            const store = this.$store.memoriaDescriptiva;
            if (!store.sections.demolicion.obrasExterioresADemoler) {
                store.sections.demolicion.obrasExterioresADemoler = [];
            }
            store.sections.demolicion.obrasExterioresADemoler.push('');
            store.save();
        },

        removeObraExteriorADemoler(idx) {
            const store = this.$store.memoriaDescriptiva;
            if (store.sections.demolicion.obrasExterioresADemoler) {
                store.sections.demolicion.obrasExterioresADemoler.splice(idx, 1);
            }
            store.save();
        },

        openImageUpload(idx) {
            const inputId = `modulo-img-${idx}`;
            const input = document.getElementById(inputId);
            if (input) input.click();
        },

        uploadModuleImage(idx, event) {
            const file = event.target.files?.[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                alert('Por favor seleccione una imagen válida');
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                alert('La imagen no puede superar los 10 MB');
                return;
            }

            const store = this.$store.memoriaDescriptiva;
            const reader = new FileReader();
            reader.onload = (e) => {
                if (!store.sections.demolicion.modulosImagenes) {
                    store.sections.demolicion.modulosImagenes = [];
                }
                store.sections.demolicion.modulosImagenes[idx] = e.target.result;
                store.save();
            };
            reader.readAsDataURL(file);
        },

        getModuleImage(idx) {
            const store = this.$store.memoriaDescriptiva;
            return store?.sections?.demolicion?.modulosImagenes?.[idx] || null;
        },

        removeModuleImage(idx) {
            const store = this.$store.memoriaDescriptiva;
            if (store.sections.demolicion.modulosImagenes) {
                store.sections.demolicion.modulosImagenes[idx] = null;
                store.save();
            }
        },

        // ============================================
        // MÉTODOS - Validación y Exportación
        // ============================================
        validateRequiredFields() {
            const errors = [];
            const store = this.$store.memoriaDescriptiva;

            if (!store.cover.project || store.cover.project.trim() === "") {
                errors.push({ field: "Proyecto", message: "El nombre del proyecto es obligatorio" });
            }

            if (!store.cover.ubigeo.department) {
                errors.push({ field: "Ubicación", message: "Debe seleccionar un departamento" });
            }

            if (!store.cover.ubigeo.province) {
                errors.push({ field: "Ubicación", message: "Debe seleccionar una provincia" });
            }

            if (!store.cover.ubigeo.district) {
                errors.push({ field: "Ubicación", message: "Debe seleccionar un distrito" });
            }

            if (!store.sections.generalidades.objetivos.general || store.sections.generalidades.objetivos.general.trim() === "") {
                errors.push({ field: "Objetivos", message: "El objetivo general es obligatorio" });
            }

            return { valid: errors.length === 0, errors };
        },

        showValidationModal() {
            const validation = this.validateRequiredFields();
            if (!validation.valid) {
                this.validationErrors = validation.errors;
                this.showErrorModal = true;
            } else {
                this.exportWord();
            }
        },

        closeErrorModal() {
            this.showErrorModal = false;
            this.validationErrors = [];
        },

        async exportWord() {
            try {
                console.log('📄 Iniciando exportación de Memoria Descriptiva...');

                const validation = this.validateRequiredFields();
                if (!validation.valid) {
                    this.showValidationModal();
                    return;
                }

                this.$store.memoriaDescriptiva.startExport();

                if (!window.docx) {
                    this.$store.memoriaDescriptiva.addError("libs", "La librería 'docx' no se ha cargado correctamente.");
                    this.$store.memoriaDescriptiva.endExport();
                    return;
                }

                if (!window.saveAs) {
                    this.$store.memoriaDescriptiva.addError("libs", "La librería 'FileSaver' no está disponible.");
                    this.$store.memoriaDescriptiva.endExport();
                    return;
                }

                const exportData = this.$store.memoriaDescriptiva.getExportData();

                const structure = buildContentStructure({
                    cover: exportData.cover,
                    sections: exportData.sections,
                    document: JSON.parse(JSON.stringify(this.document))
                });

                console.log('🔄 Aplicando transformaciones dinámicas...');
                const transformer = new DocumentTransformerMD(exportData, ubigeoData);
                transformer.applyAll(structure);

                console.log('📝 Generando documento Word...');
                const processor = new ContentProcessorMD(window.docx, exportData);
                const allImages = { ...exportData.images, ...exportData.previews };

                const doc = await processor.buildDocument(structure, allImages);

                console.log('💾 Descargando archivo...');
                const blob = await window.docx.Packer.toBlob(doc);
                const fileName = this.generateFileName(exportData.cover);
                window.saveAs(blob, fileName);

                console.log('✅ Exportación completada');
                this.$store.memoriaDescriptiva.endExport();

            } catch (error) {
                console.error('❌ Error en exportación:', error);
                this.$store.memoriaDescriptiva.addError('export', `Error al generar documento: ${error.message}`);
                this.$store.memoriaDescriptiva.endExport();
            }
        },

        generateFileName(cover) {
            const projectName = cover.project || 'memoria_descriptiva';
            const sanitized = projectName
                .toLowerCase()
                .replace(/[áàäâã]/g, 'a')
                .replace(/[éèëê]/g, 'e')
                .replace(/[íìïî]/g, 'i')
                .replace(/[óòöôõ]/g, 'o')
                .replace(/[úùüû]/g, 'u')
                .replace(/ñ/g, 'n')
                .replace(/[^a-z0-9]+/g, '_')
                .substring(0, 50);

            const date = new Date().toISOString().split('T')[0];
            return `${sanitized}_${date}.docx`;
        },

        // Utilidades
        toNumber(value) {
            const parsed = parseFloat(value);
            return Number.isFinite(parsed) ? parsed : 0;
        },

        roundNumber(value, decimals = 0) {
            const factor = Math.pow(10, decimals);
            return Math.round((this.toNumber(value) + Number.EPSILON) * factor) / factor;
        }
    };
}

// Exportar función principal
window.memoriaDescriptiva = memoriaDescriptiva;

export default memoriaDescriptiva;