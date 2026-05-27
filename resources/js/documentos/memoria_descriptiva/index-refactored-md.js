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
        init() {
            console.log('🚀 Inicializando Memoria Descriptiva');

            // Asegurar que el store tenga los datos de ubigeo
            if (this.$store.memoriaDescriptiva && ubigeoData) {
                this.$store.memoriaDescriptiva.ubigeoData = ubigeoData;
            }

            // Inicializar arrays por defecto
            this.initDefaultArrays();

            // Inicializar datos de ejemplo para la portada
            this.initDefaultData();

            console.log('✅ Inicialización completa');
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
            if (store.sections.descripcionModulos.modulos.length === 0) {
                store.sections.descripcionModulos.modulos = [
                    { id: 1, nombre: "MÓDULO I", uso: "Grupo electrógeno, cuarto de tablero, maestranza", pisos: 1, sistemaX: "Sistema Dual", sistemaY: "Sistema de Albañilería confinada", elementosVerticales: "Placa L, Columnas CT, Muros de albañilería", elementosHorizontales: "Vigas V30", techo: "Losa aligerada" }
                ];
            }

            // Objetivo general por defecto
            if (!store.sections.generalidades.objetivos.general) {
                store.sections.generalidades.objetivos.general = "Realizar el modelamiento, análisis y cálculo estructural de la edificación, así como verificaciones posteriores.";
            }

            // Antecedentes por defecto
            if (!store.sections.generalidades.antecedentes.history) {
                store.sections.generalidades.antecedentes.history = "La I.E 64193 es un centro educativo en Loreto que pertenece a la población Urbana, una institución educativa Escolarizada perteneciente a la DRE Loreto con código 160007 y que está supervisada por la UGEL Ucayali-Contamana.";
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
        },

        initDefaultArrays() {
            const store = this.$store.memoriaDescriptiva;

            // Inicializar módulos si está vacío
            if (!store.sections.descripcionModulos.modulos.length) {
                store.sections.descripcionModulos.modulos = this.getDefaultModulos();
            }

            // Inicializar marcos normativos
            if (!store.sections.generalidades.marcoNormativo.length) {
                store.sections.generalidades.marcoNormativo = this.getDefaultMarcoNormativo();
            }

            // Inicializar criterios estructurales
            if (!store.sections.marcoTeorico.criteriosEstructurales.length) {
                store.sections.marcoTeorico.criteriosEstructurales = this.getDefaultCriteriosEstructurales();
            }

            // Inicializar elementos estructurales
            if (!store.sections.marcoTeorico.elementosEstructurales.length) {
                store.sections.marcoTeorico.elementosEstructurales = this.getDefaultElementosEstructurales();
            }
        },

        getDefaultModulos() {
            // 16 módulos basados en el Word de ejemplo
            return [
                { id: 1, nombre: "MÓDULO I", uso: "Grupo electrógeno, cuarto de tablero, maestranza", pisos: 1, sistemaX: "Sistema Dual", sistemaY: "Sistema de Albañilería confinada", elementosVerticales: "Placa L (100x50x30x30 cm), Columnas CT (70x50x30x30cm), Muros de albañilería e=24cm", elementosHorizontales: "Vigas en X de V30xVar. cm, Vigas en Y de V30x50cm", techo: "Losa aligerada a dos aguas e=20cm", imagenes: [] },
                { id: 2, nombre: "MÓDULO II", uso: "1° Piso: SUM., Comedor / 2° Piso: Módulo de conectividad, depósito AIP y AIP", pisos: 2, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x120x30x30 cm), Placa PT (100x50x30x30cm)", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [] },
                { id: 3, nombre: "MÓDULO III", uso: "1° Piso: Biblioteca / 2° Piso: Taller creativo y depósito", pisos: 2, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x120x30x30 cm), Placa PT (100x50x30x30cm)", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [] },
                { id: 4, nombre: "MÓDULO IV", uso: "Escalera", pisos: 3, sistemaX: "Sistema de Albañilería Confinada", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x100x30x30 cm), Muro Portante e=24cm", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x50 cm", techo: "Losa aligerada e=20cm (1° y 2° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [] },
                { id: 5, nombre: "MÓDULO V", uso: "Aulas", pisos: 3, sistemaX: "Sistema de Albañilería Confinada", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Placa PL (50x100x30x30 cm), Placa PT (50x100x30x30cm), Albañilería portante e=24cm", elementosHorizontales: "Vigas en X de V30x60 cm, Vigas en X de V30x50cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° y 2° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [] },
                { id: 6, nombre: "MÓDULO VI", uso: "Aulas y Escalera", pisos: 3, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Albañilería Confinada", elementosVerticales: "Placa PL (50x50x30x30 cm), Placa PL (65x50x30x30 cm), Placa PT (100x50x30x30cm)", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° y 2° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [] },
                { id: 7, nombre: "MÓDULO VII", uso: "Cocina, Almacén de alimentos, Cuarto de limpieza, Dep. combustible", pisos: 1, sistemaX: "Albañilería Confinada", sistemaY: "Albañilería Confinada", elementosVerticales: "Columnas (30x30 cm), Muro portante e=13cm, Placa e=13cm", elementosHorizontales: "Vigas en X de V30x40cm, Vigas en Y de V30x40cm", techo: "Losa aligerada a una sola agua e=20cm", imagenes: [] },
                { id: 8, nombre: "MÓDULO VIII", uso: "1° Piso: Residuos sólidos, Sala de Docentes, Tópico, secretaria, dirección / 2° Piso: Sala de Docentes, Sala de Reuniones", pisos: 2, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Muros estructurales", elementosVerticales: "Columna CL (50x50x30x30 cm), Placa PT (100x50x30x30cm), Placa 20x200cm", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa aligerada e=20cm (1° Nivel), Losa aligerada a dos aguas e=20cm (Techo)", imagenes: [] },
                { id: 9, nombre: "MÓDULO IX", uso: "Aulas, deposito, almacén, SS.HH", pisos: 1, sistemaX: "Sistema Dual", sistemaY: "Albañilería confinada", elementosVerticales: "Placa PT (100x50x30x30 cm), Columnas CT (70x50x30x30cm)", elementosHorizontales: "Vigas en X de V30xVar. cm, Vigas en Y de V30x50cm", techo: "Losa aligerada a dos aguas e=20cm", imagenes: [] },
                { id: 10, nombre: "MÓDULO X", uso: "Cocina, depósitos, Comedor, SS.HH", pisos: 1, sistemaX: "Sistema de Dual", sistemaY: "Sistema de Muros Estructurales", elementosVerticales: "Placas PL (100x50x30x30 cm), Columnas CT (70x50x30x30cm), Placas e=15cm", elementosHorizontales: "Vigas en X de V30xVar. cm, Vigas en Y de V30x50cm", techo: "Losa aligerada a dos aguas e=20cm", imagenes: [] },
                { id: 11, nombre: "MÓDULO XI", uso: "Área de juego", pisos: 1, sistemaX: "Pórticos Ordinarios Resistentes a Momentos (OMF)", sistemaY: "Pórticos Especiales Resistentes a Momentos (SMF)", elementosVerticales: "Columna cuadrada metálica C30x30cm2 e=8mm", elementosHorizontales: "Vigas W 10x45, correas 2x3x3mm, Tijerales tubo HSS 4X4X3mm", techo: "Cobertura parabólica de Aluzinc tipo TR4", imagenes: [] },
                { id: 12, nombre: "MÓDULO XII", uso: "Cuarto de bombas y/o tanque elevado", pisos: 4, sistemaX: "No aplica", sistemaY: "No aplica", elementosVerticales: "Columnas CL 60x60x25x25 cm", elementosHorizontales: "Vigas en X de V25x60cm, Vigas en Y de V25x60cm", techo: "Losa maciza e=20cm", imagenes: [] },
                { id: 13, nombre: "MÓDULO XIII", uso: "Rampa", pisos: 3, sistemaX: "Muros estructurales", sistemaY: "Muros estructurales", elementosVerticales: "Columna rectangular (30x40cm), Placas e=30cm", elementosHorizontales: "Vigas en X de V30x60 cm, Vigas en Y de V30x60cm", techo: "Losa en rampa de 15cm, Losa aligerada de 20cm a dos aguas", imagenes: [] },
                { id: 14, nombre: "MÓDULO XIV", uso: "Guardianía y SS.HH", pisos: 1, sistemaX: "Albañilería Confinada", sistemaY: "Albañilería Confinada", elementosVerticales: "Columnas CL (40x40x25x25 cm)", elementosHorizontales: "Vigas en X de V25x40cm, Vigas en Y de V25x40cm", techo: "Losa aligerada a un agua e=20cm", imagenes: [] },
                { id: 15, nombre: "MÓDULO XV", uso: "SS.HH", pisos: 3, sistemaX: "Sistema de Muros estructurales", sistemaY: "Sistema de Albañilería Confinada", elementosVerticales: "Columna CL (50x50x30x30 cm), Placas e=20cm, Albañilería e=24cm", elementosHorizontales: "Vigas en X de V30x50 cm, Vigas en Y de V30x60cm, Vigas en Y de V30x50cm", techo: "Losa maciza e=20cm (1° y 2° Nivel), Losa aligerada dos aguas e=20cm (Techo)", imagenes: [] },
                { id: 16, nombre: "MÓDULO XVI", uso: "SUM EXTERIOR", pisos: 1, sistemaX: "Pórticos", sistemaY: "Pórticos", elementosVerticales: "Columna cuadrada de concreto armado C30x30cm2", elementosHorizontales: "Viga de concreto de 30x40cm2 en X. Tijerales en Y tubo HSS 4X6X3mm", techo: "Cobertura parabólica de Aluzinc tipo TR4", imagenes: [] },
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