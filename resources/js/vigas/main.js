import { createTable } from "./renderers/tableRenderer.js";
import { renderResultTable, clearResults } from "./renderers/resultRenderer.js";
import { renderFlexionResult } from "./renderers/flexionResultRenderer.js";
import { collectData } from "./data/dataCollector.js";
import { getIntElementValue, showConfirm, showSuccess, showError } from "./utils/domHelpers.js";
import { DEFAULT_VALUES } from "./config/constants.js";
import { DesignRequirementsCalculator } from "./calculators/designRequirements.js";
import { FlexionCalculator } from "./calculators/flexionCalculator.js";
import { ShearCalculator } from "./calculators/shearCalculator.js";
import { CapacidadCalculator } from "./calculators/capacidadCalculator.js";
import { DeflectionCalculator } from "./calculators/deflectionCalculator.js";
import { setupPasteHandler } from "./utils/pasteHandler.js";
import Swal from "sweetalert2";

document.addEventListener("DOMContentLoaded", () => {
    let tabulatorInstance = null;

    // Inicializar tabla
    const initTable = () => {
        const numTramos = getIntElementValue("num_tramos", DEFAULT_VALUES.NUM_TRAMOS);
        tabulatorInstance = createTable("#tablaContainer", numTramos, tabulatorInstance);

        // Configurar el manejador de pegado especial
        if (tabulatorInstance) {
            setupPasteHandler(tabulatorInstance);
        }
    };

    initTable();

    // Evento para cambio de número de tramos
    const numTramosInput = document.getElementById("num_tramos");
    if (numTramosInput) {
        numTramosInput.addEventListener("change", (e) => {
            const nuevoNumTramos = parseInt(e.target.value) || 1;

            showConfirm(
                "¿Actualizar tabla?",
                `Se recreará la tabla con ${nuevoNumTramos} tramos`
            ).then((result) => {
                if (result.isConfirmed) {
                    initTable();
                    showSuccess("Actualizado", `Tabla con ${nuevoNumTramos} tramos creada`);
                } else {
                    const numTramosActual = tabulatorInstance ?
                        (tabulatorInstance.getColumns().length - 1) / 3 : 1;
                    numTramosInput.value = numTramosActual;
                }
            });
        });
    }

    // Evento para el botón DISEÑAR
    const accionButton = document.getElementById("accionButton");
    if (accionButton) {
        accionButton.addEventListener("click", () => {
            const datos = collectData(tabulatorInstance);

            if (datos) {
                //console.log("Datos recolectados exitosamente:", datos);

                // Limpiar resultados anteriores
                clearResults("#vigas_general");

                // 1. Calcular Requisitos de Diseño
                const designReqParams = new DesignRequirementsCalculator(datos);
                const resultsDesign = designReqParams.calculate();

                // 2. Calcular Flexión (Ahora retorna estructura interactiva)
                const designFlexParams = new FlexionCalculator(datos);
                const resultsFlexion = designFlexParams.calculate();

                // Shared State for Flexion Results - INICIAR CON CEROS
                // Solo se actualizará cuando el usuario cambie el acero
                const numTramos = datos.parametros.numTramos;
                const numCells = numTramos * 3; // 3 positions per tramo

                const flexionState = {
                    negativo: {
                        phiMn: new Array(numCells).fill(0),
                        asReal: new Array(numCells).fill(0),
                        dReal: new Array(numCells).fill(0)
                    },
                    positivo: {
                        phiMn: new Array(numCells).fill(0),
                        asReal: new Array(numCells).fill(0),
                        dReal: new Array(numCells).fill(0)
                    }
                };

                // Callback for dynamic updates
                const onFlexionUpdate = (updatedData, sectionType) => {
                    //console.log('Flexion Update:', sectionType, updatedData);

                    // Update the appropriate section
                    if (sectionType === 'NEGATIVO') {
                        flexionState.negativo = updatedData;
                    } else if (sectionType === 'POSITIVO') {
                        flexionState.positivo = updatedData;
                    }

                    //console.log('Current Flexion State:', flexionState);

                    // Re-calculate Capacidad
                    const updatedCapacidad = new CapacidadCalculator(datos, flexionState).calculate();

                    // Re-render all three bottom tables (Cortante, Capacidad, Deflexión) in correct order
                    const container = document.querySelector("#vigas_general");
                    if (!container) return;

                    // Remove all three tables by finding them by title
                    const tableTitles = [
                        "3.- Diseño de cortante",
                        "4.- Diseño por capacidad",
                        "5.- Diseño por deflexión"
                    ];

                    Array.from(container.querySelectorAll(".mb-8")).forEach(w => {
                        if (tableTitles.some(title => w.textContent.includes(title))) {
                            w.remove();
                        }
                    });

                    // Recalculate Shear and Deflection
                    // Recalculate Shear and Deflection
                    const rShear = new ShearCalculator(datos).calculate();
                    const rDef = new DeflectionCalculator(datos, flexionState).calculate();

                    // Render all three tables in correct order
                    renderResultTable("#vigas_general", rShear, updatedCapacidad, rDef);
                };

                // ORDEN CORRECTO DE RENDERIZADO (sin duplicados):
                // 1. Requisitos de Diseño
                renderResultTable("#vigas_general", resultsDesign);

                // 2. Flexión (Negativo y Positivo)
                renderFlexionResult("#vigas_general", resultsFlexion, onFlexionUpdate);

                // 3, 4, 5. Cortante, Capacidad (con ceros iniciales), Deflexión
                const shearParams = new ShearCalculator(datos);
                const resultsShear = shearParams.calculate();

                // Capacidad inicia con flexionState (ceros)
                const capacidadParams = new CapacidadCalculator(datos, flexionState);
                const resultsCapacidad = capacidadParams.calculate();

                const deflectionParams = new DeflectionCalculator(datos, flexionState);
                const resultsDeflection = deflectionParams.calculate();

                renderResultTable(
                    "#vigas_general",
                    resultsShear,
                    resultsCapacidad,
                    resultsDeflection
                );

                showSuccess("Cálculo Completado", "Los resultados se han generado correctamente.");

                /*
                Swal.fire({
                    title: "Datos recolectados",
                    html: `<pre style="text-align: left; max-height: 400px; overflow: auto; font-size: 0.8em;">${JSON.stringify(datos, null, 2)}</pre>`,
                    icon: "success"
                });
                */
            }
        });
    }
});
