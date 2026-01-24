import { createTable } from "./renderers/tableRenderer.js";
import { renderResultTable, clearResults } from "./renderers/resultRenderer.js";
import { collectData } from "./data/dataCollector.js";
import { getIntElementValue, showConfirm, showSuccess, showError } from "./utils/domHelpers.js";
import { DEFAULT_VALUES } from "./config/constants.js";
import { DesignRequirementsCalculator } from "./calculators/designRequirements.js";
import Swal from "sweetalert2";

document.addEventListener("DOMContentLoaded", () => {
    let tabulatorInstance = null;

    // Inicializar tabla
    const initTable = () => {
        const numTramos = getIntElementValue("num_tramos", DEFAULT_VALUES.NUM_TRAMOS);
        tabulatorInstance = createTable("#tablaContainer", numTramos, tabulatorInstance);
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
                console.log("Datos recolectados exitosamente:", datos);

                // Limpiar resultados anteriores
                clearResults("#vigas_general");

                // 1. Calcular Requisitos de Diseño
                const designReqParams = new DesignRequirementsCalculator(datos);
                const results = designReqParams.calculate();

                // 2. Renderizar Tabla
                renderResultTable("#vigas_general", results);

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
