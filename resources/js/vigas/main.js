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
import { createSheetState } from "../sheets/state.js";
import { bindImageExport } from "../sheets/export.js";

document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector('[data-sheet="vigas-general"]');
    const sheetState = root ? createSheetState(root) : null;
    if (root) bindImageExport(root,{buttonId:'exportImageButton',targetId:'vigasgn',state:sheetState,filename:'vigas_general'});
    let tabulatorInstance = null;

    // Almacenar resultados para exportación PDF
    let currentResults = null;
    let currentProjectData = null;
    let currentFlexionState = null;

    // Inicializar tabla
    const initTable = () => {
        const numTramos = getIntElementValue("num_tramos", DEFAULT_VALUES.NUM_TRAMOS);
        tabulatorInstance = createTable("#tablaContainer", numTramos, tabulatorInstance);

        // Configurar el manejador de pegado especial
        if (tabulatorInstance) {
            setupPasteHandler(tabulatorInstance);
            tabulatorInstance.on('dataChanged', () => sheetState?.markStale());
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
            if (sheetState && !sheetState.validate()) return;
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

                    const updatedCapacidad = new CapacidadCalculator(datos, flexionState).calculate();
                    const updatedDeflection = new DeflectionCalculator(datos, flexionState).calculate();

                    // Cortante no depende del acero longitudinal: conservar su tabla.
                    for (const result of [updatedCapacidad, updatedDeflection]) {
                        const safeId = result.title.toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                        document.getElementById(`result-table-${safeId}`)?.remove();
                    }
                    renderResultTable("#vigas_general", updatedCapacidad, updatedDeflection);
                    if (currentResults) {
                        currentResults.capacity = updatedCapacidad;
                        currentResults.deflection = updatedDeflection;
                    }
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

                // Almacenar resultados para exportación
                currentResults = {
                    designRequirements: resultsDesign,
                    flexionNegativo: resultsFlexion.negativo,
                    flexionPositivo: resultsFlexion.positivo,
                    shear: resultsShear,
                    capacity: resultsCapacidad,
                    deflection: resultsDeflection
                };

                currentProjectData = {
                    fc: datos.parametros.fc,
                    fy: datos.parametros.fy,
                    numTramos: datos.parametros.numTramos
                };

                currentFlexionState = flexionState;

                // Habilitar botón de exportación
                const exportButton = document.getElementById("exportPdfButton");
                if (exportButton) {
                    exportButton.disabled = false;
                    exportButton.classList.remove('opacity-50', 'cursor-not-allowed');
                }

                sheetState?.ready();

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

    // Evento para el botón EXPORTAR PDF
    const exportPdfButton = document.getElementById("exportPdfButton");
    if (exportPdfButton) {
        exportPdfButton.addEventListener("click", async () => {
            if (sheetState && !sheetState.isCurrent()) return;
            if (!currentResults || !currentProjectData) {
                showError("Error", "No hay resultados para exportar. Por favor, ejecuta el cálculo primero.");
                return;
            }

            // Deshabilitar botón durante la generación
            exportPdfButton.disabled = true;
            sheetState?.setBusy(exportPdfButton,true);
            exportPdfButton.textContent = "⏳ Generando PDF...";

            try {
                // Importar dinámicamente el generador de PDF
                const { downloadBeamPDF } = await import("./utils/pdfGenerator.js");

                // Agregar datos de estado de flexión a los resultados
                if (currentFlexionState) {
                    // Agregar resúmenes al resultado de flexión
                    if (currentResults.flexionNegativo && currentResults.flexionNegativo.data) {
                        currentResults.flexionNegativo.data.As_real_summary = currentFlexionState.negativo.asReal;
                        currentResults.flexionNegativo.data.PhiMn_summary = currentFlexionState.negativo.phiMn;
                    }

                    if (currentResults.flexionPositivo && currentResults.flexionPositivo.data) {
                        currentResults.flexionPositivo.data.As_real_summary = currentFlexionState.positivo.asReal;
                        currentResults.flexionPositivo.data.PhiMn_summary = currentFlexionState.positivo.phiMn;
                    }
                }

                await downloadBeamPDF(currentResults, currentProjectData);
                showSuccess("PDF Generado", "El archivo PDF se ha descargado correctamente.");
            } catch (error) {
                console.error("Error al generar PDF:", error);
                showError("Error", error.message || "Hubo un problema al generar el PDF. Por favor, intenta nuevamente.");
            } finally {
                // Rehabilitar botón
                if (sheetState) sheetState.setBusy(exportPdfButton,false);
                else exportPdfButton.disabled = false;
                exportPdfButton.textContent = "Exportar PDF";
            }
        });
    }
});
