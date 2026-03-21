// stores/memoriaCalculoStore.js - Store centralizado para Memoria de Cálculo

/**
 * Store global de Alpine.js para gestionar el estado de la Memoria de Cálculo
 * Este store centraliza el estado de todas las secciones y facilita la comunicación entre componentes
 */
export function createMemoriaCalculoStore() {
    return {
        // ============================================
        // ESTADO - Datos del Cover/Portada
        // ============================================
        cover: {
            title: "MEMORIA DE CÁLCULO",
            subtitle: "ESPECIALIDAD ESTRUCTURA",
            project: "VIVIENDA MULTIFAMILIAR EN AV. JUAN VELASCO ALVARADO Nro 1493 Mz A Lt 01 URBANIZACIÓN SAN JUAN II, DISTRITO DE PILLCO MARCA, PROVINCIA Y REGION DE HUANUCO",
            code: "",
            client: "",
            location: "",
            ubigeo: {
                department: "HUANUCO",
                province: "",
                district: ""
            },
            date: new Date().toISOString().split("T")[0],
            preparedBy: "",
            extraLines: [],
            soilFactor: "S2",
            soilPeriod: "Tp",
            seismicZone: "2",
            seismicZoneFactor: "0.25",
            buildingCategory: "C",
            importanceFactorU: "1.00",
            structuralSystemDescription: "Dual, Muros de Concreto Armado",
            soilValue: "1.20",
            soilPeriodValue: "0.6",
            reportType: "CASA" // 'CASA' o 'MODULOS'
        },

        // ============================================
        // ESTADO - Secciones del Documento
        // ============================================
        sections: {
            // Sección 1: Generalidades
            generalidades: {
                floors: 1,
                structuralDetails: {
                    usage: "",
                    structuralSystemX: "Sistema Dual",
                    structuralSystemY: "Sistema Dual",
                    verticalElements: "Columnas y Placas de Concreto Armado",
                    horizontalElements: "Vigas de Concreto Armado",
                    roof: "Losa aligerada e=20cm",
                    materialDesign: {
                        aceroEstructural: { fy: "4200", e: "2038901.92", fc: "" },
                        aceroCorrugado: { fy: "4200", e: "2038901.92", fc: "" },
                        concreto: { fy: "", e: "253456.4", fc: "210" }
                    },
                    generalDescription: ""
                }
            },

            // Sección 2: Análisis de Cargas
            analisisCargas: {
                casoscarga: {
                    cargaviento: "75",
                    K5: "10",
                    K10: "20",
                    K11: "10",
                    K17: "15.85",
                    K21: "0.30",
                    K26: "-0.70",
                    K32: "-0.60"
                }
            },

            // Sección 3: Análisis Sísmico
            analisisSismico: {},

            // Sección 4: Diseño de Elementos
            disenoElementos: {},

            // Sección 5: Estructura Metálica
            estructuraMetalica: {},

            // Sección 6: Conclusiones
            conclusiones: {}
        },

        // ============================================
        // ESTADO - Imágenes
        // ============================================
        images: {
            // Imágenes de portada
            coverImage: null,
            coverImage2: null,

            // Imágenes por piso
            floorImages: [],

            // Imágenes de materiales
            materialImages: [null, null, null],

            // Imágenes de análisis
            modeloMatematico3DImages: [null], // Fig 14
            espectroPseudoaceleracionesImages: [null, null], // Fig 15, 16
            metradoCargasImages: [null, null, null, null], // Fig 18-21
            cargasAproximadasImages: [null, null, null, null] // Fig 22-25
        },

        // Previews de imágenes (data URLs)
        previews: {
            coverImage: null,
            coverImage2: null,
            floorImages: [],
            materialImages: [null, null, null],
            modeloMatematico3DImages: [null],
            espectroPseudoaceleracionesImages: [null, null],
            metradoCargasImages: [null, null, null, null],
            cargasAproximadasImages: [null, null, null, null]
        },

        // ============================================
        // ESTADO - UI / Control de Interfaz
        // ============================================
        ui: {
            activeSection: 'section-info-general',
            isExporting: false,
            errors: []
        },

        // ============================================
        // MÉTODOS - Gestión de Secciones
        // ============================================

        /**
         * Actualiza los datos de una sección específica
         * @param {string} sectionId - ID de la sección
         * @param {object} data - Datos a actualizar
         */
        updateSection(sectionId, data) {
            if (this.sections[sectionId]) {
                this.sections[sectionId] = {
                    ...this.sections[sectionId],
                    ...data
                };
            }
        },

        /**
         * Actualiza los datos del cover
         * @param {object} data - Datos a actualizar
         */
        updateCover(data) {
            this.cover = { ...this.cover, ...data };
        },

        /**
         * Cambia la sección activa
         * @param {string} sectionId - ID de la sección
         */
        setActiveSection(sectionId) {
            this.ui.activeSection = sectionId;
        },

        /**
         * Obtiene los datos completos de una sección
         * @param {string} sectionId - ID de la sección
         * @returns {object} Datos de la sección
         */
        getSection(sectionId) {
            return this.sections[sectionId] || {};
        },

        // ============================================
        // MÉTODOS - Gestión de Imágenes
        // ============================================

        /**
         * Actualiza una imagen individual
         * @param {string} key - Clave de la imagen
         * @param {File|null} file - Archivo de imagen
         * @param {string|null} preview - Data URL de preview
         */
        updateImage(key, file, preview) {
            this.images[key] = file;
            this.previews[key] = preview;
        },

        /**
         * Actualiza una imagen en un array
         * @param {string} groupKey - Clave del grupo de imágenes
         * @param {number} index - Índice en el array
         * @param {File|null} file - Archivo de imagen
         * @param {string|null} preview - Data URL de preview
         */
        updateArrayImage(groupKey, index, file, preview) {
            if (!Array.isArray(this.images[groupKey])) {
                this.images[groupKey] = [];
            }
            if (!Array.isArray(this.previews[groupKey])) {
                this.previews[groupKey] = [];
            }

            this.images[groupKey][index] = file;
            this.previews[groupKey][index] = preview;
        },

        /**
         * Elimina una imagen
         * @param {string} key - Clave de la imagen
         */
        removeImage(key) {
            this.images[key] = null;
            this.previews[key] = null;
        },

        /**
         * Elimina una imagen de un array
         * @param {string} groupKey - Clave del grupo
         * @param {number} index - Índice
         */
        removeArrayImage(groupKey, index) {
            if (Array.isArray(this.images[groupKey])) {
                this.images[groupKey][index] = null;
            }
            if (Array.isArray(this.previews[groupKey])) {
                this.previews[groupKey][index] = null;
            }
        },

        // ============================================
        // MÉTODOS - Gestión de Pisos
        // ============================================

        /**
         * Actualiza el número de pisos
         * @param {number} count - Número de pisos
         */
        updateFloors(count) {
            const floorCount = parseInt(count) || 1;
            this.sections.generalidades.floors = floorCount;

            // Ajustar arrays de imágenes de pisos
            while (this.images.floorImages.length < floorCount) {
                this.images.floorImages.push(null);
                this.previews.floorImages.push(null);
            }
            if (this.images.floorImages.length > floorCount) {
                this.images.floorImages = this.images.floorImages.slice(0, floorCount);
                this.previews.floorImages = this.previews.floorImages.slice(0, floorCount);
            }
        },

        // ============================================
        // MÉTODOS - Gestión de Errores
        // ============================================

        /**
         * Agrega un error
         * @param {string} category - Categoría del error
         * @param {string} message - Mensaje de error
         */
        addError(category, message) {
            this.ui.errors.push({ category, message, timestamp: Date.now() });
        },

        /**
         * Limpia todos los errores
         */
        clearErrors() {
            this.ui.errors = [];
        },

        /**
         * Limpia errores de una categoría específica
         * @param {string} category - Categoría
         */
        clearErrorsByCategory(category) {
            this.ui.errors = this.ui.errors.filter(e => e.category !== category);
        },

        // ============================================
        // MÉTODOS - Exportación
        // ============================================

        /**
         * Obtiene todos los datos para exportación
         * @returns {object} Objeto con todos los datos
         */
        getExportData() {
            return {
                cover: this.cover,
                sections: this.sections,
                images: this.images,
                previews: this.previews
            };
        },

        /**
         * Marca el inicio de la exportación
         */
        startExport() {
            this.ui.isExporting = true;
            this.clearErrors();
        },

        /**
         * Marca el fin de la exportación
         */
        endExport() {
            this.ui.isExporting = false;
        }
    };
}
