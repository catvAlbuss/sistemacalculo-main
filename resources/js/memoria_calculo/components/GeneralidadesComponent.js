// components/GeneralidadesComponent.js - Componente para la sección Generalidades

import { readFileAsDataURL, handleImageChange } from '../utils/imageHandler.js';
import { toNumber, roundNumber, validateCover, validateGeneralidades } from '../utils/dataValidator.js';

/**
 * Componente Alpine.js para la sección Generalidades (Sección 1)
 * Maneja: Info general, ubicación, parámetros sísmicos, tabla resumen, material de diseño
 */
export function createGeneralidadesComponent() {
    return {
        // ============================================
        // INICIALIZACIÓN
        // ============================================
        init() {
            console.log('✅ Componente Generalidades inicializado');

            // Sincronizar con store si existe data previa
            this.syncFromStore();

            // Inicializar número de pisos
            this.updateFloors();

            // Inicializar ubicación y categorías basadas en valores por defecto
            this.updateLocation();
            this.updateBuildingCategory();

            // Inicializar slots de imágenes
            this.initImageSlots();
        },

        /**
         * Inicializa los slots de imágenes
         */
        initImageSlots() {
            const store = this.$store.memoriaCalculo;

            // Asegurar que materialImages existe como array
            if (!Array.isArray(store.images.materialImages)) {
                store.images.materialImages = [];
            }
            if (!Array.isArray(store.previews.materialImages)) {
                store.previews.materialImages = [];
            }

            // Asegurar 3 slots para materiales
            this.ensureArraySize('materialImages', 3);
        },

        /**
         * Asegura que un array de imágenes tenga el tamaño correcto
         */
        ensureArraySize(groupKey, size) {
            const store = this.$store.memoriaCalculo;

            while (store.images[groupKey].length < size) {
                store.images[groupKey].push(null);
                store.previews[groupKey].push(null);
            }

            if (store.images[groupKey].length > size) {
                store.images[groupKey] = store.images[groupKey].slice(0, size);
                store.previews[groupKey] = store.previews[groupKey].slice(0, size);
            }
        },

        // ============================================
        // PROPIEDADES COMPUTADAS
        // ============================================

        /**
         * Obtiene los datos de portada (proxy al store)
         */
        get cover() {
            return this.$store?.memoriaCalculo?.cover || {};
        },

        /**
         * Obtiene los departamentos disponibles
         */
        get departments() {
            return this.$store.memoriaCalculo.ubigeoData?.map(d => d.name).sort() || [];
        },

        /**
         * Obtiene las provincias del departamento seleccionado
         */
        get provinces() {
            const dept = this.$store.memoriaCalculo.cover.ubigeo.department;
            const deptData = this.$store.memoriaCalculo.ubigeoData?.find(d => d.name === dept);
            return deptData ? deptData.provinces.map(p => p.name).sort() : [];
        },

        /**
         * Obtiene los distritos de la provincia seleccionada
         */
        get districts() {
            const dept = this.$store.memoriaCalculo.cover.ubigeo.department;
            const prov = this.$store.memoriaCalculo.cover.ubigeo.province;

            const deptData = this.$store.memoriaCalculo.ubigeoData?.find(d => d.name === dept);
            if (!deptData) return [];

            const provData = deptData.provinces.find(p => p.name === prov);
            return provData ? provData.districts.sort() : [];
        },

        /**
         * Obtiene y establece el número de pisos actual (proxy al store)
         */
        get floors() {
            return this.$store?.memoriaCalculo?.sections?.generalidades?.floors || 1;
        },
        set floors(value) {
            this.$store.memoriaCalculo.updateFloors(value);
        },

        /**
         * Obtiene los detalles estructurales (proxy al store)
         */
        get structuralDetails() {
            const details = this.$store?.memoriaCalculo?.sections?.generalidades?.structuralDetails;
            if (!details) {
                console.warn('⚠️ structuralDetails no encontrado en el store, usando fallback');
                return {
                    materialDesign: {
                        aceroEstructural: {},
                        aceroCorrugado: {},
                        concreto: {}
                    }
                };
            }
            return details;
        },

        /**
         * Valida si la sección está completa
         */
        get isComplete() {
            const coverValid = validateCover(this.$store.memoriaCalculo.cover).valid;
            const generalidadesValid = validateGeneralidades(
                this.$store.memoriaCalculo.sections.generalidades
            ).valid;

            return coverValid && generalidadesValid;
        },

        // ============================================
        // MÉTODOS - Sincronización con Store
        // ============================================

        /**
         * Sincroniza datos desde el store
         */
        syncFromStore() {
            // Los datos ya están en el store, solo necesitamos asegurar reactividad
            console.log('📥 Sincronizando desde store');
        },

        /**
         * Sincroniza datos hacia el store
         */
        syncToStore() {
            console.log('📤 Sincronizando hacia store');
            // Alpine.js se encarga automáticamente de la reactividad con $store
        },

        // ============================================
        // MÉTODOS - Ubicación  
        // ============================================

        /**
         * Actualiza la ubicación cuando cambia el ubigeo
         */
        updateLocation() {
            const ubigeo = this.$store.memoriaCalculo.cover.ubigeo;
            let loc = "";

            if (ubigeo.department) loc += ubigeo.department;
            if (ubigeo.province) loc += `, ${ubigeo.province}`;
            if (ubigeo.district) loc += `, ${ubigeo.district}`;

            this.$store.memoriaCalculo.cover.location = loc;
        },

        // ============================================
        // MÉTODOS - Parámetros Sísmicos
        // ============================================

        /**
         * Actualiza la categoría de edificación y el factor U
         */
        updateBuildingCategory() {
            const factorByCategory = {
                A: "1.50",
                B: "1.30",
                C: "1.00",
                D: "Ver Nota 2"
            };

            const category = String(this.$store.memoriaCalculo.cover.buildingCategory || "").toUpperCase();
            const validCategory = Object.prototype.hasOwnProperty.call(factorByCategory, category) ? category : "C";

            this.$store.memoriaCalculo.cover.buildingCategory = validCategory;
            this.$store.memoriaCalculo.cover.importanceFactorU = factorByCategory[validCategory];
        },

        // ============================================
        // MÉTODOS - Gestión de Pisos
        // ============================================

        /**
         * Actualiza el número de pisos
         */
        updateFloors() {
            const count = parseInt(this.floors) || 1;
            this.$store.memoriaCalculo.updateFloors(count);
        },

        // ============================================
        // MÉTODOS - Gestión de Imágenes
        // ============================================

        /**
         * Maneja el cambio de una imagen individual
         * @param {string} key - Clave de la imagen
         * @param {Event} event - Evento del input file
         */
        async handleImageChange(key, event) {
            await handleImageChange(
                event,
                (file, dataUrl) => {
                    this.$store.memoriaCalculo.updateImage(key, file, dataUrl);
                },
                (error) => {
                    this.$store.memoriaCalculo.addError('images', error);
                }
            );
        },

        /**
         * Elimina una imagen
         * @param {string} key - Clave de la imagen
         */
        removeImage(key) {
            this.$store.memoriaCalculo.removeImage(key);
        },

        /**
         * Maneja el cambio de una imagen de piso
         * @param {number} index - Índice del piso
         * @param {Event} event - Evento del input file
         */
        async handleFloorImageChange(index, event) {
            await handleImageChange(
                event,
                (file, dataUrl) => {
                    this.$store.memoriaCalculo.updateArrayImage('floorImages', index, file, dataUrl);
                },
                (error) => {
                    this.$store.memoriaCalculo.addError('images', error);
                }
            );
        },

        /**
         * Elimina una imagen de piso
         * @param {number} index - Índice del piso
         */
        removeFloorImage(index) {
            this.$store.memoriaCalculo.removeArrayImage('floorImages', index);
        },

        /**
         * Maneja el cambio de una imagen en array
         * @param {string} groupKey - Clave del grupo
         * @param {number} index - Índice
         * @param {Event} event - Evento del input file
         */
        async handleArrayImageChange(groupKey, index, event) {
            await handleImageChange(
                event,
                (file, dataUrl) => {
                    this.$store.memoriaCalculo.updateArrayImage(groupKey, index, file, dataUrl);
                },
                (error) => {
                    this.$store.memoriaCalculo.addError('images', error);
                }
            );
        },

        /**
         * Elimina una imagen de array
         * @param {string} groupKey - Clave del grupo
         * @param {number} index - Índice
         */
        removeArrayImage(groupKey, index) {
            this.$store.memoriaCalculo.removeArrayImage(groupKey, index);
        },

        /**
         * Maneja el cambio de una imagen de material
         * @param {number} index - Índice del material
         * @param {Event} event - Evento del input file
         */
        async handleMaterialImageChange(index, event) {
            await this.handleArrayImageChange('materialImages', index, event);
        },

        /**
         * Elimina una imagen de material
         * @param {number} index - Índice del material
         */
        removeMaterialImage(index) {
            this.removeArrayImage('materialImages', index);
        },

        // ============================================
        // MÉTODOS - Validación
        // ============================================

        /**
         * Valida la sección completa
         * @returns {object} { valid: boolean, errors: string[] }
         */
        validate() {
            const coverValidation = validateCover(this.$store.memoriaCalculo.cover);
            const generalidadesValidation = validateGeneralidades(
                this.$store.memoriaCalculo.sections.generalidades
            );

            const allErrors = [
                ...coverValidation.errors,
                ...generalidadesValidation.errors
            ];

            // Agregar errores al store
            this.$store.memoriaCalculo.clearErrorsByCategory('validation');
            allErrors.forEach(error => {
                this.$store.memoriaCalculo.addError('validation', error);
            });

            return {
                valid: allErrors.length === 0,
                errors: allErrors
            };
        },

        // ============================================
        // MÉTODOS - Utilidades
        // ============================================

        /**
         * Convierte a número
         */
        toNumber,

        /**
         * Redondea número
         */
        roundNumber
    };
}
