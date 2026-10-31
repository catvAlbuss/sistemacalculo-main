import { createSystemState } from './systemState.js';
import { MainSystem } from './mainSystem.js';
import '../../css/retaining-wall-sheet.css';
import './capture.js';
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

    const state = createSystemState();
    state.cargarDeLocalStorage();
    Alpine.store('systemState', state);
    Alpine.store('systemData', {
        predimensionamiento: state.resultadosPredimensionamiento || {},
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


};

// Auto-registro si Alpine ya está disponible o cuando se inicialice
if (window.Alpine) {
    registerMuros(window.Alpine);
} else {
    document.addEventListener('alpine:init', () => {
        registerMuros(window.Alpine);
    });
}
