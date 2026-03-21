import { MainSystem } from './mainSystem.js';
import { Predimensionamiento } from './predimensionamiento.js'
import { Dimensionamiento } from './dimensionamiento.js'
import { Cargas } from './cargas.js'
import { Verificaciones } from './verificaciones.js'
import { AnalisisEstructural } from './analisisEstructural.js'
import { Desing } from './desingConcretoArmado.js'
import { Dibujo } from './dibujo.js'
import { Metrado } from './metrados.js'
import { memoriacalculo } from './memoriacalculo.js'
import { StorageManager } from './utils/storage.js';
import { NotificationManager } from './utils/notifications.js';

// Configurar utilidades globales
window.StorageManager = StorageManager;
window.NotificationManager = NotificationManager;

const registerMuros = (Alpine) => {
    console.log('🏗️ Registrando componentes de Muros de Contención...');

    Alpine.store('systemState', {
        predimensionamientoCompleto: false,
        dimensionamientoCompleto: false,
        resultadosPredimensionamiento: null,
        resultadosDimensionamiento: null,

        setResultadosPredimensionamiento(data) {
            this.resultadosPredimensionamiento = data;
            this.predimensionamientoCompleto = true;
            this.guardarEnLocalStorage();
        },

        setResultadosDimensionamiento(data) {
            this.resultadosDimensionamiento = data;
            this.dimensionamientoCompleto = true;
            this.guardarEnLocalStorage();
        },

        guardarEnLocalStorage() {
            const data = {
                predimensionamiento: this.resultadosPredimensionamiento,
                dimensionamiento: this.resultadosDimensionamiento,
                systemState: {
                    predimensionamientoCompleto: this.predimensionamientoCompleto,
                    dimensionamientoCompleto: this.dimensionamientoCompleto
                }
            };
            localStorage.setItem('murosContencionData', JSON.stringify(data));
            console.log('💾 Datos de muros guardados');
        },

        cargarDeLocalStorage() {
            const storedData = localStorage.getItem('murosContencionData');
            if (storedData) {
                const data = JSON.parse(storedData);
                this.resultadosPredimensionamiento = data.predimensionamiento;
                this.resultadosDimensionamiento = data.dimensionamiento;
                this.predimensionamientoCompleto = data.systemState?.predimensionamientoCompleto || false;
                this.dimensionamientoCompleto = data.systemState?.dimensionamientoCompleto || false;
                console.log('📂 Datos de muros cargados');
            }
        }
    });

    // Registrar componentes
    Alpine.data('mainSystem', MainSystem)
    Alpine.data('predimensionamiento', Predimensionamiento)
    Alpine.data('dimensionamiento', Dimensionamiento)
    Alpine.data('cargas', Cargas)
    Alpine.data('verificaciones', Verificaciones)
    Alpine.data('analisisestructural', AnalisisEstructural)
    Alpine.data('concretoArmado', Desing)
    Alpine.data('dibujo', Dibujo)
    Alpine.data('metrado', Metrado)
    Alpine.data('memoriacalculo', memoriacalculo)

    // Configurar autoguardado después de la inicialización
    document.addEventListener('alpine:initialized', () => {
        const store = Alpine.store('systemState');
        if (store && typeof store.cargarDeLocalStorage === 'function') {
            store.cargarDeLocalStorage();
        }

        setInterval(() => {
            const systemData = Alpine?.store('systemState');
            if (systemData && window.StorageManager) {
                window.StorageManager.saveData(systemData);
            }
        }, 30000);
    });
};

// Auto-registro si Alpine ya está disponible o cuando se inicialice
if (window.Alpine) {
    registerMuros(window.Alpine);
} else {
    document.addEventListener('alpine:init', () => {
        registerMuros(window.Alpine);
    });
}
