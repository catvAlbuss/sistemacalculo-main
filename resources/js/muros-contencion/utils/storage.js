export const StorageManager = {
    saveData(data, key = 'murosContencionData') {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            console.log('💾 Datos guardados en localStorage');
            return true;
        } catch (error) {
            console.error('❌ Error guardando datos:', error);
            return false;
        }
    },

    loadData(key = 'murosContencionData') {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
            return null;
        }
    },

    removeData(key = 'murosContencionData') {
        try {
            localStorage.removeItem(key);
            console.log('🗑️ Datos eliminados de localStorage');
            return true;
        } catch (error) {
            console.error('❌ Error eliminando datos:', error);
            return false;
        }
    },

    clearAll() {
        try {
            localStorage.clear();
            sessionStorage.clear();
            console.log('🧹 Storage completamente limpiado');
            return true;
        } catch (error) {
            console.error('❌ Error limpiando storage:', error);
            return false;
        }
    }
};