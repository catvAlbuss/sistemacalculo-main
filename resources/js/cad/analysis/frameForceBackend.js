// resources/js/cad/analysis/frameForceBackend.js
//
// Puente entre el MOTOR (Flask/OpenSeesPy, /api/frame-forces) y el visor de
// diagramas del compañero. Reemplaza el mock por datos reales:
//   - arma el payload del modelo (mismo builder que el análisis sísmico),
//   - llama al endpoint /api/frame-forces (gravedad + sísmico SDX/SDY),
//   - normaliza al contrato que consume el visor (casos base + min/max),
//   - deja que la lógica del frontend calcule combos/envolventes,
//   - inyecta vía setFrameForceResultsFromBackend (provisto por el compañero).

import Swal from "sweetalert2";

import {
    addDefaultCombosAndEnvelope,
} from "./frameForceCombinations.js";

import {
    setFrameForceResultsFromBackend,
} from "./frameForcePersistence.js";

import {
    FRAME_FORCE_COMPONENTS,
    DEFAULT_FRAME_FORCE_UNITS,
} from "./frameForceResultsContract.js";

const FRAME_FORCES_API_URL = "http://127.0.0.1:5001/api/frame-forces";

const FF_COMPONENTS = ["P", "V2", "V3", "T", "M2", "M3"];

// El visor usa "CVE" (carga viva entrepiso) en sus combos/envolvente; el modelo
// del motor manda "CV". Se aliasa para que las combinaciones del frontend casen.
const CASE_ALIAS = { CV: "CVE" };
const aliasCase = (id) => CASE_ALIAS[id] || id;

// Construye max/min por componente a partir de las estaciones (el motor solo
// entrega max; el visor también usa min en algunas vistas).
function buildMinMax(stations = []) {
    const max = {};
    const min = {};

    FF_COMPONENTS.forEach((comp) => {
        let mx = null;
        let mn = null;

        stations.forEach((st) => {
            const value = Number(st[comp] ?? 0);
            const station = Number(st.station ?? 0);

            if (!mx || value > mx.value) mx = { value, station };
            if (!mn || value < mn.value) mn = { value, station };
        });

        max[comp] = mx;
        min[comp] = mn;
    });

    return { max, min };
}

/**
 * Normaliza la respuesta del motor a la forma que consume el visor:
 * solo casos base (CM, CV→CVE, SDX, SDY), con min/max y componentes objeto.
 * Los combos/envolventes los calcula el frontend con su propia lógica.
 */
function normalizeBackendResults(data) {
    const baseFrameForces = (data.frameForces || [])
        .filter((f) => f.caseId != null && f.comboId == null) // solo casos base
        .map((f) => {
            const { max, min } = buildMinMax(f.stations || []);
            return {
                ...f,
                caseId: aliasCase(f.caseId),
                max: f.max || max,
                min: f.min || min,
            };
        });

    const baseCases = (data.cases || []).map((c) => ({
        ...c,
        id: aliasCase(c.id),
        name: aliasCase(c.name || c.id),
    }));

    const baseResults = {
        type: data.type || "jhack_frame_force_results",
        version: data.version || "B-FORCES-01",
        source: "backend_real",
        units: data.units || DEFAULT_FRAME_FORCE_UNITS,
        components: FRAME_FORCE_COMPONENTS,
        cases: baseCases,
        frameForces: baseFrameForces,
        jointDisplacements: data.jointDisplacements || [],
        summary: data.summary || {},
    };

    // El frontend agrega sus combos/envolventes (1.4CM, 1.2CM+1.6CVE,
    // 1.2CM+SDX/SDY, Envelope Max Abs) sobre los casos base reales.
    return addDefaultCombosAndEnvelope(baseResults);
}

/**
 * Arma el payload del modelo, llama al motor y carga los resultados reales en
 * el visor. Devuelve true si se cargaron datos reales; false si hubo fallback.
 *
 * @param {object} cadSystem
 * @param {object} [opts]
 * @param {number} [opts.numStations=5]
 * @param {boolean} [opts.showLoading=true]
 */
export async function loadRealFrameForceResults(cadSystem, opts = {}) {
    const { numStations = 5, showLoading = true } = opts;

    if (!cadSystem) throw new Error("No existe cadSystem.");

    cadSystem._initSeismic?.();

    const cfg = cadSystem.seismicConfig || {};
    const nodes = cadSystem.nodes || [];
    const frames = (cadSystem.shapes || []).filter((f) => f?.node1 && f?.node2);

    if (!nodes.length || !frames.length) {
        throw new Error("El modelo no tiene nodos/elementos para calcular fuerzas.");
    }

    const payload = cadSystem._buildSeismicPayload?.(cfg, nodes, frames);
    if (!payload) throw new Error("No se pudo construir el payload del modelo.");

    const seismicCases = cadSystem._getSeismicRunCases?.() || [];

    if (showLoading) {
        Swal.fire({
            title: "Calculando fuerzas internas...",
            html: "<div style='color:#94a3b8'>Motor: gravedad + sísmico (P, V2, V3, T, M2, M3)</div>",
            allowOutsideClick: false,
            background: "#1a2035",
            color: "#e2e8f0",
            didOpen: () => Swal.showLoading(),
        });
    }

    try {
        const resp = await fetch(FRAME_FORCES_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, seismicCases, numStations }),
        });

        if (!resp.ok) {
            throw new Error(`Motor respondió ${resp.status}: ${await resp.text()}`);
        }

        const data = await resp.json();

        if (!data || data.success === false) {
            throw new Error(data?.error || "El motor no devolvió resultados válidos.");
        }

        const normalized = normalizeBackendResults(data);
        const ok = setFrameForceResultsFromBackend(cadSystem, normalized);

        if (!ok) throw new Error("Los resultados no cumplieron el contrato del visor.");

        if (showLoading) Swal.close();

        cadSystem.showMessage?.(
            `Fuerzas reales cargadas: ${normalized.cases?.length || 0} casos, ${normalized.frameForces?.length || 0} registros.`,
            "success"
        );

        return true;
    } catch (error) {
        if (showLoading) Swal.close();
        console.warn("⚠️ No se pudieron cargar fuerzas reales del motor:", error);

        const offline =
            String(error?.message || "").includes("Failed to fetch") ||
            String(error?.message || "").includes("ERR_CONNECTION");

        cadSystem.showMessage?.(
            offline
                ? "Motor Python (localhost:5001) no disponible. Mostrando datos mock."
                : `No se cargaron fuerzas reales: ${error.message}. Mostrando datos mock.`,
            "warning"
        );

        return false;
    }
}

// Helper de consola, en línea con el `jhackSetBackendFrameForceResults` del compañero.
if (typeof window !== "undefined") {
    window.jhackLoadRealFrameForces = function (opts) {
        const cad = window.cadSystem;
        if (!cad) {
            console.warn("No existe window.cadSystem.");
            return Promise.resolve(false);
        }
        return loadRealFrameForceResults(cad, opts);
    };
}
