/**
 * Diseño de Columnas v2.0
 * Index Module - Orchestrates all column design components
 */

import { configA_Inputs, configD_Inputs, configA_Outputs, configD_Outputs } from './config.js';
import { renderCustomInputs, renderCustomOutputs } from './ui.js';
import { initTables } from './tables.js';
import { calcularSeccionA } from './logicA.js';
import { calcularSeccionD } from './logicD.js';

document.addEventListener('DOMContentLoaded', () => {
    // Render inputs y outputs para sección A (dimensiones)
    renderCustomInputs('in-grid-a', configA_Inputs);
    renderCustomOutputs('out-grid-a', configA_Outputs);

    // Render inputs y outputs para sección D (cortante)
    renderCustomInputs('in-grid-d', configD_Inputs, 'D');
    renderCustomOutputs('out-grid-d', configD_Outputs, 'D');

    // Set default values para sección D
    configD_Inputs.forEach((field, index) => {
        if (field.default !== undefined) {
            const elemento = document.getElementById(`in-D-${index}`);
            if (elemento) elemento.value = field.default;
        }
    });

    // Initialize tables
    initTables();

    // Setup event listeners para sección A
    configA_Inputs.forEach((_, index) => {
        const elemento = document.getElementById(`in-A-${index}`);
        if (elemento) {
            elemento.addEventListener('input', () => { 
                calcularSeccionA(); 
                calcularSeccionD(); 
            });
            elemento.addEventListener('change', () => { 
                calcularSeccionA(); 
                calcularSeccionD(); 
            });
        }
    });

    // Setup event listeners para sección D
    configD_Inputs.forEach((_, index) => {
        const elemento = document.getElementById(`in-D-${index}`);
        if (elemento) {
            elemento.addEventListener('input', calcularSeccionD);
            elemento.addEventListener('change', calcularSeccionD);
        }
    });

    // Calculations iniciales
    calcularSeccionA();
    calcularSeccionD();
});
