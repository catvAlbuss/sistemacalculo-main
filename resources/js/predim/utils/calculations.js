/**
 * Utility functions for calculations in the predim module
 */

/**
 * Calculate pixel to centimeter conversion
 * @param {number} valorScala - Scale factor
 * @returns {number} Conversion factor
 */
export function getPixelToCm(valorScala) {
    const dpi = 96; // Asumiendo 96 DPI
    return 2.54 / dpi / (115 * valorScala);
}

/**
 * Calculate tributary area from shape dimensions
 * @param {Object} shape - Shape object with width and height
 * @param {number} valorScala - Scale factor
 * @returns {number} Area in m²
 */
export function calculateTributaryArea(shape, valorScala) {
    const pixelToCm = getPixelToCm(valorScala);
    const baseCm = shape.width * pixelToCm;
    const alturaCm = shape.height * pixelToCm;
    return baseCm * alturaCm;
}

/**
 * Calculate column area for rectangular columns
 * @param {number} areaTributaria - Tributary area in m²
 * @param {number} npisos - Number of floors
 * @param {number} fc - Concrete strength in kg/cm²
 * @returns {number} Column area in cm²
 */
export function calculateRectangularColumnArea(areaTributaria, npisos, fc) {
    const pe = parseFloat(npisos) * 1000 * areaTributaria;
    return pe / (0.45 * fc);
}

/**
 * Calculate side dimension for rectangular column
 * @param {number} Ar - Column area in cm²
 * @param {number} minSide - Minimum side dimension (default 0.3m)
 * @returns {number} Side dimension in meters
 */
export function calculateRectangularSide(Ar, minSide = 0.3) {
    const lador = Ar / 30 / 100;
    return lador < minSide ? minSide : lador;
}

/**
 * Calculate column area for square columns
 * @param {number} areaTributaria - Tributary area in m²
 * @param {number} npisos - Number of floors
 * @param {number} fc - Concrete strength in kg/cm²
 * @returns {number} Column area in cm²
 */
export function calculateSquareColumnArea(areaTributaria, npisos, fc) {
    return (parseFloat(areaTributaria) * parseFloat(npisos) * 1000) / (0.45 * fc);
}

/**
 * Calculate side dimension for square column
 * @param {number} Ac - Column area in cm²
 * @param {number} minSide - Minimum side dimension (default 0.3m)
 * @returns {number} Side dimension in meters
 */
export function calculateSquareSide(Ac, minSide = 0.3) {
    const ladoc = Math.sqrt(Ac) / 100;
    return ladoc < minSide ? minSide : ladoc;
}

/**
 * Calculate radius for circular column
 * @param {number} Ac - Column area in cm²
 * @param {number} minRadius - Minimum radius (default 0.15m)
 * @returns {number} Radius in meters
 */
export function calculateCircularRadius(Ac, minRadius = 0.15) {
    const ladora = Math.sqrt(Ac / Math.PI) / 100;
    return ladora < minRadius ? minRadius : ladora;
}

/**
 * Calculate side for T-shaped column
 * @param {number} Ac - Column area in cm²
 * @param {number} minSide - Minimum side dimension (default 0.3m)
 * @returns {number} Side dimension in meters
 */
export function calculateTSide(Ac, minSide = 0.3) {
    const ladote = (Ac + 900) / 60 / 100;
    return ladote < minSide ? minSide : ladote;
}

/**
 * Calculate side for L-shaped column
 * @param {number} Ac - Column area in cm²
 * @param {number} minSide - Minimum side dimension (default 0.3m)
 * @returns {number} Side dimension in meters
 */
export function calculateLSide(Ac, minSide = 0.3) {
    const ladoele = (Ac - 900) / 60 / 100;
    return ladoele < minSide ? minSide : ladoele;
}

/**
 * Calculate beam height
 * @param {number} luz - Beam span in meters
 * @param {number} divisor - Divisor factor (e.g., 14 for main beams, 18.5 for secondary)
 * @param {number} minHeight - Minimum height (default 0.3m)
 * @returns {number} Beam height in meters
 */
export function calculateBeamHeight(luz, divisor, minHeight = 0.3) {
    const altura = luz / divisor;
    return altura < minHeight ? minHeight : altura;
}

/**
 * Calculate slab thickness
 * @param {number} luz - Slab span in meters
 * @param {number} divisor - Divisor factor
 * @param {number} minThickness - Minimum thickness
 * @returns {number} Slab thickness in meters
 */
export function calculateSlabThickness(luz, divisor, minThickness) {
    const espesor = luz / divisor;
    return espesor < minThickness ? minThickness : espesor;
}

/**
 * Calculate footing area
 * @param {number} areaTributaria - Tributary area in m²
 * @param {number} npisos - Number of floors
 * @param {number} capacidadSuelo - Soil capacity in kg/cm²
 * @returns {number} Footing area
 */
export function calculateFootingArea(areaTributaria, npisos, capacidadSuelo) {
    const carga = parseFloat(areaTributaria) * parseFloat(npisos) * 1000;
    return carga / (capacidadSuelo * 10000);
}

/**
 * Calculate maximum span from shape dimensions
 * @param {Object} shape - Shape object with width and height
 * @param {number} valorScala - Scale factor
 * @returns {number} Maximum span in meters
 */
export function calculateMaxSpan(shape, valorScala) {
    const pixelToCm = getPixelToCm(valorScala);
    return Math.max(shape.width * pixelToCm, shape.height * pixelToCm);
}
