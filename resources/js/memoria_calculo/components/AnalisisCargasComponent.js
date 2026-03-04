// components/AnalisisCargasComponent.js - Componente para Análisis de Cargas (Sección 2)

import { handleImageChange } from '../utils/imageHandler.js';
import { toNumber, roundNumber } from '../utils/dataValidator.js';

/**
 * Componente Alpine.js para la sección Análisis de Cargas (Sección 2)
 * Maneja: Modelo estructural, casos de carga, combinaciones, metrado
 */
export function createAnalisisCargasComponent() {
    return {
        // ============================================
        // INICIALIZACIÓN
        // ============================================
        init() {
            console.log('✅ Componente Análisis de Cargas inicializado');
            this.initImageSlots();
        },

        // ============================================
        // PROPIEDADES COMPUTADAS
        // ============================================

        /**
         * Obtiene los casos de carga (proxy al store)
         */
        get casoscarga() {
            return this.$store?.memoriaCalculo?.sections?.analisisCargas?.casoscarga || {};
        },

        /**
         * Calcula cargas aproximadas basadas en los casos de carga
         */
        get cargasAproximadas() {
            const casos = this.$store.memoriaCalculo.sections.analisisCargas.casoscarga;

            const cm = toNumber(casos.K5);
            const cv = toNumber(casos.K10) + toNumber(casos.K11);
            const velocidad = toNumber(casos.cargaviento);
            const altura = toNumber(casos.K17);
            const qz = velocidad > 0 ? (velocidad * velocidad) / 18000 : 0;

            return {
                cm: roundNumber(cm),
                cv: roundNumber(cv),
                velocidad: roundNumber(velocidad),
                altura: roundNumber(altura),
                qz: roundNumber(qz, 2),
                cwMas1: roundNumber(qz * toNumber(casos.K21) * 100),
                cwMas2: roundNumber(qz * toNumber(casos.K26) * 100),
                cwMenos: roundNumber(qz * toNumber(casos.K32) * 100)
            };
        },

        // ============================================
        // MÉTODOS - Inicialización
        // ============================================

        /**
         * Inicializa los slots de imágenes para análisis
         */
        initImageSlots() {
            const store = this.$store.memoriaCalculo;

            // Asegurar que los arrays existen
            const imageGroups = [
                'modeloMatematico3DImages',
                'espectroPseudoaceleracionesImages',
                'metradoCargasImages',
                'cargasAproximadasImages'
            ];

            imageGroups.forEach(group => {
                if (!Array.isArray(store.images[group])) {
                    store.images[group] = [];
                }
                if (!Array.isArray(store.previews[group])) {
                    store.previews[group] = [];
                }
            });

            // Inicializar tamaños específicos
            this.ensureArraySize('modeloMatematico3DImages', 1);
            this.ensureArraySize('espectroPseudoaceleracionesImages', 2);
            this.ensureArraySize('metradoCargasImages', 4);
            this.ensureArraySize('cargasAproximadasImages', 4);
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
        // MÉTODOS - Gestión de Imágenes
        // ============================================

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
         * Maneja el cambio de una imagen de análisis (clave simple)
         * @param {string} key - Clave de la imagen
         * @param {Event} event - Evento del input file
         */
        async handleAnalisisImageChange(key, event) {
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
         * Elimina una imagen de análisis (clave simple)
         * @param {string} key - Clave de la imagen
         */
        removeAnalisisImage(key) {
            this.$store.memoriaCalculo.removeImage(key);
        },

        // ============================================
        // MÉTODOS - Validación
        // ============================================

        /**
         * Valida la sección
         * @returns {object} { valid: boolean, errors: string[] }
         */
        validate() {
            const errors = [];
            const casos = this.$store.memoriaCalculo.sections.analisisCargas.casoscarga;

            // Validar que existan valores mínimos
            if (!casos.cargaviento || toNumber(casos.cargaviento) <= 0) {
                errors.push('Carga de viento es requerida');
            }

            return {
                valid: errors.length === 0,
                errors
            };
        },

        // ============================================
        // MÉTODOS - Utilidades
        // ============================================
        toNumber,
        roundNumber
    };
}
