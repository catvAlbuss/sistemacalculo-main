import "./bootstrap";
import.meta.glob(["../img/**", "../fonts/**"]);

// Importar Livewire y Alpine
import { Livewire, Alpine } from "../../vendor/livewire/livewire/dist/livewire.esm";
import "flowbite";

// Importar pdfMake
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";

// Hacer Alpine disponible globalmente
window.Alpine = Alpine;
window.pdfMake = pdfMake;

console.log('� Aplicación base inicializada');

// Evento para manejo de errores globales (común a todos los módulos)
window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Error no manejado:', event.reason);
    if (window.NotificationManager) {
        window.NotificationManager.showError('Error inesperado en el sistema');
    }
});