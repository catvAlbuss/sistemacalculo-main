// components/SimpleSectionComponent.js - Componente base para secciones simples

/**
 * Factory para crear componentes simples (Análisis Sísmico, Diseño Elementos, etc.)
 * @param {string} sectionId - ID de la sección
 * @param {string} sectionName - Nombre de la sección
 */
export function createSimpleSectionComponent(sectionId, sectionName) {
    return {
        sectionId,
        sectionName,

        init() {
            console.log(`✅ Componente ${this.sectionName} inicializado`);
        },

        /**
         * Actualiza datos de la sección
         * @param {string} field - Campo a actualizar
         * @param {*} value - Valor
         */
        updateData(field, value) {
            const section = this.$store.memoriaCalculo.sections[this.sectionId];
            section[field] = value;
        },

        /**
         * Obtiene datos de la sección
         * @param {string} field - Campo
         * @returns {*} Valor
         */
        getData(field) {
            return this.$store.memoriaCalculo.sections[this.sectionId][field];
        },

        /**
         * Valida la sección
         */
        validate() {
            // Implementación básica - sobreescribir en componentes específicos
            return { valid: true, errors: [] };
        }
    };
}

/**
 * Componente para Análisis Sísmico (Sección 3)
 */
export function createAnalisisSismicoComponent() {
    return {
        ...createSimpleSectionComponent('analisisSismico', 'Análisis Sísmico'),

        // Métodos específicos de esta sección pueden agregarse aquí
    };
}

/**
 * Componente para Diseño de Elementos (Sección 4)
 */
export function createDisenoElementosComponent() {
    return {
        ...createSimpleSectionComponent('disenoElementos', 'Diseño de Elementos'),

        // Métodos específicos de esta sección pueden agregarse aquí
    };
}

/**
 * Componente para Estructura Metálica (Sección 5)
 */
export function createEstructuraMetalicaComponent() {
    return {
        ...createSimpleSectionComponent('estructuraMetalica', 'Estructura Metálica'),

        // Métodos específicos de esta sección pueden agregarse aquí
    };
}

/**
 * Componente para Conclusiones (Sección 6)
 */
export function createConclusionesComponent() {
    return {
        ...createSimpleSectionComponent('conclusiones', 'Conclusiones y Recomendaciones'),

        // Métodos específicos de esta sección pueden agregarse aquí
    };
}
