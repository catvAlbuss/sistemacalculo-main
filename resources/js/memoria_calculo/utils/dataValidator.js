// utils/dataValidator.js - Utilidades para validación de datos

/**
 * Convierte un valor a número, retorna 0 si no es válido
 * @param {*} value - Valor a convertir
 * @returns {number} Número válido
 */
export function toNumber(value) {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Redondea un número a decimales específicos
 * @param {*} value - Valor a redondear
 * @param {number} decimals - Número de decimales (default: 0)
 * @returns {number} Número redondeado
 */
export function roundNumber(value, decimals = 0) {
    const factor = Math.pow(10, decimals);
    return Math.round((toNumber(value) + Number.EPSILON) * factor) / factor;
}

/**
 * Valida si un string no está vacío
 * @param {string} value - Valor a validar
 * @returns {boolean} True si no está vacío
 */
export function isNotEmpty(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Valida un objeto ubigeo
 * @param {object} ubigeo - Objeto con department, province, district
 * @returns {object} { valid: boolean, errors: string[] }
 */
export function validateUbigeo(ubigeo) {
    const errors = [];

    if (!ubigeo) {
        return { valid: false, errors: ['Ubigeo no proporcionado'] };
    }

    if (!isNotEmpty(ubigeo.department)) {
        errors.push('Debe seleccionar un departamento');
    }

    if (!isNotEmpty(ubigeo.province)) {
        errors.push('Debe seleccionar una provincia');
    }

    if (!isNotEmpty(ubigeo.district)) {
        errors.push('Debe seleccionar un distrito');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Valida datos del cover
 * @param {object} cover - Datos del cover
 * @returns {object} { valid: boolean, errors: string[] }
 */
export function validateCover(cover) {
    const errors = [];

    if (!cover) {
        return { valid: false, errors: ['Datos del cover no proporcionados'] };
    }

    if (!isNotEmpty(cover.title)) {
        errors.push('El título es requerido');
    }

    if (!isNotEmpty(cover.project)) {
        errors.push('La descripción del proyecto es requerida');
    }

    if (!isNotEmpty(cover.date)) {
        errors.push('La fecha es requerida');
    }

    const ubigeoValidation = validateUbigeo(cover.ubigeo);
    if (!ubigeoValidation.valid) {
        errors.push(...ubigeoValidation.errors);
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Valida datos de sección de generalidades
 * @param {object} data - Datos de generalidades
 * @returns {object} { valid: boolean, errors: string[] }
 */
export function validateGeneralidades(data) {
    const errors = [];

    if (!data) {
        return { valid: false, errors: ['Datos de generalidades no proporcionados'] };
    }

    if (!data.floors || data.floors < 1) {
        errors.push('Debe especificar al menos 1 piso');
    }

    if (!data.structuralDetails) {
        errors.push('Detalles estructurales no proporcionados');
    } else {
        if (!isNotEmpty(data.structuralDetails.structuralSystemX)) {
            errors.push('Sistema estructural en X es requerido');
        }
        if (!isNotEmpty(data.structuralDetails.structuralSystemY)) {
            errors.push('Sistema estructural en Y es requerido');
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Valida que al menos una imagen esté cargada
 * @param {object} images - Objeto de imágenes
 * @param {string[]} requiredKeys - Claves requeridas
 * @returns {object} { valid: boolean, errors: string[] }
 */
export function validateImages(images, requiredKeys = []) {
    const errors = [];

    if (!images) {
        return { valid: false, errors: ['Objeto de imágenes no proporcionado'] };
    }

    requiredKeys.forEach(key => {
        if (!images[key]) {
            errors.push(`La imagen '${key}' es requerida`);
        }
    });

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Sanitiza un string para uso en nombres de archivo
 * @param {string} str - String a sanitizar
 * @returns {string} String sanitizado
 */
export function sanitizeFileName(str) {
    if (!str || typeof str !== 'string') {
        return 'documento';
    }

    return str
        .toLowerCase()
        .replace(/[áàäâã]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöôõ]/g, 'o')
        .replace(/[úùüû]/g, 'u')
        .replace(/ñ/g, 'n')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Formatea una fecha para display
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha formateada (DD/MM/YYYY)
 */
export function formatDate(date) {
    if (!date) return '';

    const d = typeof date === 'string' ? new Date(date) : date;

    if (!(d instanceof Date) || isNaN(d)) {
        return '';
    }

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
}
