// resources/js/etabs/etabs_entry.js
import cadSys from "./drawing-system/cad_sys.js";

// Esperar a que Alpine esté disponible
document.addEventListener('alpine:init', () => {
    console.log('✅ Alpine inicializado, registrando cadSys...');
    Alpine.data("cadSys", cadSys);
});

// También registrar inmediatamente si Alpine ya está disponible
if (window.Alpine) {
    console.log('✅ Alpine ya disponible, registrando cadSys...');
    Alpine.data("cadSys", cadSys);
}

console.log('✅ ETABS: Componente cadSys listo para registrar');