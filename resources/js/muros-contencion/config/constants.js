// ===== src/config/constants.js - CONSTANTES DEL SISTEMA =====
export const SYSTEM_CONSTANTS = {
    STORAGE_KEY: 'murosContencionData',
    AUTO_SAVE_INTERVAL: 30000, // 30 segundos
    VERSION: '1.0',

    NOTIFICATION_TIMERS: {
        SUCCESS: 5000,
        WARNING: 7000,
        ERROR: 10000
    },

    VALIDATION_RULES: {
        MIN_HEIGHT: 0.5,
        MAX_HEIGHT: 10,
        MIN_WIDTH: 0.3,
        MAX_WIDTH: 5
    }
}