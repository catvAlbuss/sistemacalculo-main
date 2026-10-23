import "./bootstrap";
import.meta.glob(["../img/**", "../fonts/**"]);

// Importar Livewire y Alpine
import { Livewire, Alpine } from "../../vendor/livewire/livewire/dist/livewire.esm";
import "flowbite";

// Las herramientas conservan el runtime PDF; las páginas públicas y de cuenta no lo cargan.
export const pdfReady = document.documentElement.dataset.pdfEnabled?.trim() === 'true'
  ? Promise.all([import('pdfmake/build/pdfmake'), import('pdfmake/build/vfs_fonts')])
      .then(([runtime, fonts]) => {
        const pdfMake = runtime.default || runtime;
        pdfMake.addVirtualFileSystem(fonts.default || fonts);
        window.pdfMake = pdfMake;
      })
  : Promise.resolve();

// Hacer Alpine disponible globalmente
window.Alpine = Alpine;

// Back/forward restoration must refresh navigation after login or logout.
window.addEventListener('pageshow', event => {
  if (event.persisted) window.location.reload();
});

console.log("� Aplicación base inicializada");

// Evento para manejo de errores globales (común a todos los módulos)
window.addEventListener("unhandledrejection", (event) => {
  console.error("❌ Error no manejado:", event.reason);
  if (window.NotificationManager) {
    window.NotificationManager.showError("Error inesperado en el sistema");
  }
});
