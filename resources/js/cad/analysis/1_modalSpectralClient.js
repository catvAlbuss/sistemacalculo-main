// resources/js/cad/analysis/modalSpectralClient.js

import {
    summarizeModalSpectralResults
} from "./6_modalSpectralResults.js";

import {
    buildDefaultModalSpectralPayload
} from "./4_modalSpectralPayload.js";

export {
    buildDefaultModalSpectralPayload
} from "./4_modalSpectralPayload.js";

const MODAL_SPECTRAL_API_URL = "http://127.0.0.1:5001/api/analyze/modal-spectral";

/**
 * Ejecuta el análisis modal espectral llamando al backend Flask.
 */
export async function runModalSpectralAnalysis(payload = null) {
    const finalPayload = payload || buildDefaultModalSpectralPayload();

    console.log("📤 Enviando análisis modal espectral a Flask:", finalPayload);

    const response = await fetch(MODAL_SPECTRAL_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(finalPayload)
    });

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `Error en Modal Spectral API. Status: ${response.status}. Detalle: ${errorText}`
        );
    }

    const data = await response.json();

    console.log("✅ Respuesta Modal Spectral:", data);

    return data;
}

/**
 * Función de prueba rápida.
 * Sirve para ejecutar desde consola:
 * window.jhackModalSpectral.runDemo()
 */
export async function runModalSpectralDemo() {
    try {
        const data = await runModalSpectralAnalysis();
        const table = summarizeModalSpectralResults(data);

        console.table(table);

        window.jhackModalSpectralLastResult = data;
        window.jhackModalSpectralLastTable = table;

        return data;
    } catch (error) {
        console.error("❌ Error ejecutando Modal Spectral Demo:", error);
        throw error;
    }
}

/**
 * Expone funciones al objeto window para pruebas desde consola.
 */
export function installModalSpectralDebugHelpers() {
    window.jhackModalSpectral = {
        apiUrl: MODAL_SPECTRAL_API_URL,
        buildDefaultPayload: buildDefaultModalSpectralPayload,
        run: runModalSpectralAnalysis,
        runDemo: runModalSpectralDemo,
        summarize: summarizeModalSpectralResults
    };

    console.log("✅ jhackModalSpectral disponible en consola.");
}

export {
    summarizeModalSpectralResults
} from "./6_modalSpectralResults.js";

// Instalación automática para pruebas.
installModalSpectralDebugHelpers();