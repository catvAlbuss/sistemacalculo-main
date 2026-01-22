// import "./bootstrap";

// import.meta.glob(["../img/**", "../fonts/**"]);

// import { Livewire, Alpine } from "../../vendor/livewire/livewire/dist/livewire.esm";

// import "flowbite";

// import * as pdfMake from "pdfmake/build/pdfmake";
// import * as pdfFonts from "pdfmake/build/vfs_fonts";

import "./bootstrap";
import.meta.glob(["../img/**", "../fonts/**"]);

// Importar Livewire y Alpine
import { Livewire, Alpine } from "../../vendor/livewire/livewire/dist/livewire.esm";
import "flowbite";

// Importar pdfMake
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";

// IMPORTANTE: Hacer Alpine disponible globalmente ANTES de importar otros módulos
window.Alpine = Alpine;

// Importar y configurar los componentes de muros AQUÍ
import { MainSystem } from './muros-contencion/mainSystem.js';
import { Predimensionamiento } from './muros-contencion/predimensionamiento.js'
import { Dimensionamiento } from './muros-contencion/dimensionamiento.js'
import { Cargas } from './muros-contencion/cargas.js'
import { Verificaciones } from './muros-contencion/verificaciones.js'
import { AnalisisEstructural } from './muros-contencion/analisisEstructural.js'
import { Desing } from './muros-contencion/desingConcretoArmado.js'
import { Dibujo } from './muros-contencion/dibujo.js'
import { Metrado } from './muros-contencion/metrados.js'
import { memoriacalculo } from './muros-contencion/memoriacalculo.js'
import { StorageManager } from './muros-contencion/utils/storage.js';
import { NotificationManager } from './muros-contencion/utils/notifications.js';

// Configurar utilidades globales
window.StorageManager = StorageManager;
window.NotificationManager = NotificationManager;

console.log('🔧 Configurando Alpine antes del inicio...');

// Configurar Alpine ANTES de que Livewire lo inicie
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
        console.log(data.predimensionamiento);
    },

    cargarDeLocalStorage() {
        const storedData = localStorage.getItem('murosContencionData');
        if (storedData) {
            const data = JSON.parse(storedData);
            this.resultadosPredimensionamiento = data.predimensionamiento;
            this.resultadosDimensionamiento = data.dimensionamiento;
            this.predimensionamientoCompleto = data.systemState?.predimensionamientoCompleto || false;
            this.dimensionamientoCompleto = data.systemState?.dimensionamientoCompleto || false;
        }
    }
});

// Registrar componentes AQUÍ
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

// Configurar eventos globales
document.addEventListener('alpine:initialized', () => {
    console.log('✅ Alpine.js completamente inicializado');

    // Cargar estado almacenado
    const store = Alpine.store('systemState');
    if (store && typeof store.cargarDeLocalStorage === 'function') {
        store.cargarDeLocalStorage();
    }

    setupGlobalEvents();
});

function setupGlobalEvents() {
    console.log('🔧 Configurando eventos globales...');

    // Evento para manejo de errores globales
    window.addEventListener('unhandledrejection', (event) => {
        console.error('❌ Error no manejado:', event.reason);
        if (window.NotificationManager) {
            NotificationManager.showError('Error inesperado en el sistema');
        }
    });

    // Evento para auto-guardado
    setInterval(() => {
        const systemData = Alpine?.store('systemState');
        if (systemData && window.StorageManager) {
            StorageManager.saveData(systemData);
        }
    }, 30000);
}