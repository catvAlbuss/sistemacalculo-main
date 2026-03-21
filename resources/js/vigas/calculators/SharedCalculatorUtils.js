export const CONCRETE_CONSTANTS = {
    PHI_FLEXION: 0.90,
    PHI_CORTANTE: 0.75,
    ESA: 2100000, // Modulo de elasticidad del acero kg/cm2
    ECU: 0.003,   // Deformación unitaria máxima del concreto
    RECUBRIMIENTO_DEFAULT: 6 // cm
};

export class StructuralUtils {
    /**
     * Calcula Beta1 según ACI 318
     * @param {number} fc - Resistencia del concreto en kg/cm²
     * @returns {number} Valor de β1 (adimensional)
     */
    static calculateBeta1(fc) {
        if (fc <= 280) return 0.85;
        if (fc >= 560) return 0.65;
        // 0.05 por cada 70 kg/cm2 de exceso sobre 280
        const beta = 0.85 - (0.05 * (fc - 280) / 70);
        return Math.max(0.65, Math.min(0.85, beta));
    }

    /**
     * Calcula la deformación de fluencia del acero
     * @param {number} fy - Esfuerzo de fluencia en kg/cm²
     * @returns {number} εy (adimensional)
     */
    static calculateEpsilonY(fy) {
        return fy / CONCRETE_CONSTANTS.ESA;
    }

    /**
     * Conversión de tonf-m a kg-cm
     * @param {number} value - Momento en tonf-m
     * @returns {number} Momento en kg-cm
     */
    static tonf_m_to_kg_cm(value) {
        return value * 100000;
    }

    /**
     * Conversión de kg a tonf
     */
    static kg_to_tonf(value) {
        return value / 1000;
    }

    /**
     * Redondeo para mostrar
     */
    static round(value, decimals = 4) {
        if (value === null || value === undefined) return 0;
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }

    /**
     * Calcula el peralte efectivo (d) basado en el número de capas
     * @param {number} h - Altura de la viga en cm
     * @param {number} numCapas - Número de capas de refuerzo (default 1)
     * @returns {number} Peralte efectivo d en cm
     * Formula: d = h - (4 + 2*numCapas)
     * Ejemplo: 1 capa = h-6, 2 capas = h-8, 3 capas = h-10, etc.
     */
    static calculateEffectiveDepth(h, numCapas = 1) {
        const recubrimiento = 4 + (2 * numCapas);
        return Math.max(0, h - recubrimiento);
    }

    /**
     * Calcula Modulo de Elasticidad del Concreto (ACI)
     * Ec = 15100 * sqrt(fc) (kg/cm2)
     */
    static calculateElasticModulus(fc) {
        return 15100 * Math.sqrt(fc);
    }
}
