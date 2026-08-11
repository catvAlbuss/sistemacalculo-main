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
    setFrameForceResultsFromBackend,
} from "./frameForcePersistence.js";

import {
    FRAME_FORCE_COMPONENTS,
    DEFAULT_FRAME_FORCE_UNITS,
} from "./frameForceResultsContract.js";

import { remapCombosToKeptCases } from "../mixins/io/file-io/e2k-load-combos.js";
import { mergeMeshedFrameForces } from "../mixins/analysis/seismic/frameMeshAtIntersections.js";

// Ruta relativa: PythonEngineController reenvía a 127.0.0.1:5001 en Windows
// local o invoca el motor como subproceso corto en producción (Hostinger).
const FRAME_FORCES_API_URL = "/api/backend/frame-forces";

const FF_COMPONENTS = ["P", "V2", "V3", "T", "M2", "M3"];

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
 * Normaliza la respuesta del motor a la forma que consume el visor: casos base
 * Y combos/envolventes, todos calculados por el MOTOR.
 *
 * Antes esto filtraba `comboId == null` y volvía a armar los combos acá con
 * `addDefaultCombosAndEnvelope`. Eso tiraba las combinaciones de E.060 que el
 * motor ya calcula y las reemplazaba por las del mock (1.4CM, 1.2CM+1.6CVE,
 * 1.2CM+SDX), con tres problemas:
 *   - factores de ACI, no de E.060 (y ni siquiera los de ACI completos);
 *   - el combo sísmico tomaba SOLO +SDX. El caso Response Spectrum viene sin
 *     signo (CQC/SRSS da magnitudes), así que la rama −SDX —la que gobierna
 *     tracción en columnas y momento invertido en vigas— NUNCA se evaluaba;
 *   - la "Envelope Max Abs" envolvía los casos SIN factorar, que no
 *     corresponde a nada.
 * El motor los genera bien (ENVELOPE con ramas _Max/_Min), así que se usan tal
 * cual. `addDefaultCombosAndEnvelope` queda solo para el camino del mock.
 */
function normalizeBackendResults(data) {
    // Los nombres de caso viajan tal como los nombró el usuario. Antes había un
    // alias fijo CV→CVE para que casaran con los combos del mock; ahora los
    // combos vienen del motor y referencian el nombre real, así que renombrar
    // solo mentiría sobre el patrón del modelo.
    const frameForces = (data.frameForces || []).map((f) => {
        const { max, min } = buildMinMax(f.stations || []);
        return {
            ...f,
            max: f.max || max,
            min: f.min || min,
        };
    });

    return {
        type: data.type || "jhack_frame_force_results",
        version: data.version || "B-FORCES-01",
        source: "backend_real",
        units: data.units || DEFAULT_FRAME_FORCE_UNITS,
        components: FRAME_FORCE_COMPONENTS,
        cases: data.cases || [],
        // El visor lee `combinations`/`envelopes` (el motor los llama
        // `combos`/`envelopes`) para armar el selector agrupado.
        combinations: data.combos || [],
        envelopes: data.envelopes || [],
        frameForces,
        jointDisplacements: data.jointDisplacements || [],
        summary: data.summary || {},
    };
}

/**
 * Firma del modelo: hash FNV-1a de lo que se le manda al motor.
 *
 * Se hashea el PAYLOAD y no el modelo del CAD a propósito. El payload es una
 * función pura del modelo (no lleva fechas, ids aleatorios ni nada variable),
 * así que es idéntico mientras el modelo no cambie — y como es literalmente la
 * entrada del solver, cualquier cambio que afecte el resultado la cambia:
 * nudos, barras, secciones, cargas, apoyos, diafragmas, espectros. Una firma
 * armada a mano a partir del modelo se arriesga a olvidar un campo y devolver
 * resultados viejos en silencio, que es el peor modo de fallo posible acá.
 */
function computeModelSignature(body) {
    const text = JSON.stringify(body);
    let hash = 0x811c9dc5;

    for (let i = 0; i < text.length; i += 1) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }

    return `${text.length.toString(36)}-${hash.toString(36)}`;
}

/**
 * Descarta los casos Response Spectrum que son el MISMO caso con otro nombre.
 *
 * Un .e2k real suele traer duplicados: MODELO (2)1.e2k define `SDX` y
 * `SDX ESCALADO` con la misma función de espectro y los mismos factores
 * (U1 9.81 · U2 2.943), e igual con SDY. Correrlos todos duplica el trabajo del
 * motor (la base modal se comparte, pero la CQC por estación no) y llena el
 * selector de combos con `1.25(CM+CV)±SDX` y `1.25(CM+CV)±SDX ESCALADO`, que
 * dan exactamente lo mismo.
 *
 * Dos casos son el mismo si coinciden espectro X, espectro Y, tipo de
 * combinación modal, amortiguamiento y unidad del Sa. De cada grupo se queda el
 * de nombre más corto —"SDX" antes que "SDX ESCALADO"—, que es el que el
 * usuario reconoce en la tabla de combos.
 *
 * Se hace SOLO en este camino, no en `_getSeismicRunCases`: ese lo comparte el
 * reporte sísmico, que sí lista los resultados caso por caso y perdería una
 * fila.
 */
function dedupeSeismicCases(cases) {
    const round = (spec) =>
        (spec || []).map((p) =>
            Array.isArray(p)
                ? [Number(p[0]).toFixed(6), Number(p[1]).toFixed(6)]
                : [Number(p?.T).toFixed(6), Number(p?.Sa).toFixed(6)],
        );

    const groups = new Map();

    (cases || []).forEach((c) => {
        const key = JSON.stringify([
            round(c.spectrumX),
            round(c.spectrumY),
            String(c.combination || c.modalCombination || "CQC").toUpperCase(),
            Number(c.damping ?? c.dampingRatio ?? 0.05).toFixed(4),
            Boolean(c.saInG),
            // La excentricidad accidental cambia el resultado: dos casos con el
            // mismo espectro pero distinta ecc NO son el mismo caso.
            Number(c.eccRatio ?? 0).toFixed(4),
        ]);

        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(c);
    });

    const kept = [];
    const merged = [];

    groups.forEach((group) => {
        if (group.length === 1) {
            kept.push(group[0]);
            return;
        }

        const sorted = [...group].sort((a, b) => {
            const la = String(a.id || a.name || "").length;
            const lb = String(b.id || b.name || "").length;
            return la !== lb
                ? la - lb
                : String(a.id || "").localeCompare(String(b.id || ""));
        });

        kept.push(sorted[0]);
        merged.push({
            kept: sorted[0].id ?? sorted[0].name,
            descartados: sorted.slice(1).map((c) => c.id ?? c.name),
        });
    });

    return { cases: kept, merged };
}

/**
 * Arma el payload del modelo, llama al motor y carga los resultados reales en
 * el visor. Devuelve true si hay resultados disponibles; false si hubo fallback.
 *
 * Si el modelo no cambió desde el último análisis, NO vuelve a llamar al motor:
 * reusa los resultados que ya están cargados. Abrir el panel para mirar otra
 * componente u otro caso no debe recalcular nada.
 *
 * @param {object} cadSystem
 * @param {object} [opts]
 * @param {number} [opts.numStations=11]
 * @param {boolean} [opts.showLoading=true]
 * @param {boolean} [opts.force=false]  Recalcular aunque la firma coincida.
 */
export async function loadRealFrameForceResults(cadSystem, opts = {}) {
    // 21 estaciones (cada 0.05L). La malla debe ser uniforme e igual en TODOS
    // los casos: los combos del frontend suman estación contra estación por
    // `relativeStation`.
    //
    // Subir la densidad NO cambia el cálculo: el motor resuelve el modelo una
    // sola vez y después evalúa P(s), V2(s), M3(s)… con las fórmulas cerradas
    // de la estática de barra (ver `_ff_stations_from_end_forces`). Más
    // estaciones son más muestras de la MISMA curva exacta, no un mallado más
    // fino del análisis.
    //
    // Lo que sí mejora:
    //  - La interpolación de "Recorrer valores". El error cerca de un pico
    //    escala con el espaciado, así que a la mitad de espaciado, mitad de
    //    error. Importa en los casos SÍSMICOS: como el espectro devuelve
    //    MAGNITUDES, el momento hace un pico en V donde cambia de signo y ahí
    //    interpolar recto sobreestima (con 11 se llegaba a ~20%).
    //  - El MÁXIMO reportado, que se busca sobre las estaciones: si el máximo
    //    real cae entre dos, con malla más fina se lo captura mejor. OJO, esto
    //    SÍ puede mover un poco el máximo que se informa — hacia el valor
    //    correcto, pero se mueve.
    //  - Lo anguloso del diagrama con carga de tramo (el momento es parabólico).
    //
    // Antes eran 11, y antes de eso 5 (con 5 el máximo se corría al cuarto de
    // luz). El costo es el tamaño del resultado, que va lineal con esto.
    const { numStations = 21, showLoading = true, force = false } = opts;

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

    const { cases: seismicCases, merged: seismicMerged } = dedupeSeismicCases(
        cadSystem._getSeismicRunCases?.() || [],
    );

    // Casos sísmicos que `_getSeismicRunCases` DESCARTÓ (su función de espectro
    // no existe o no tiene puntos). Hasta ahora se anotaban en
    // `_seismicCaseSkips` y solo los miraba el reporte sísmico: acá el caso
    // simplemente NO aparecía en el selector de diagramas y no había forma de
    // saber por qué.
    //
    // Pasa de verdad: un .e2k puede referenciar el espectro por ARCHIVO EXTERNO
    // (`FUNCTION "Func1" FUNCTYPE "SPECTRUM" FILE "…\Espectro.txt"`). Los
    // puntos no viajan en el .e2k, así que el caso queda sin espectro utilizable.
    const seismicSkips = cadSystem._seismicCaseSkips || [];
    if (seismicSkips.length) {
        console.warn("⚠️ Casos sísmicos OMITIDOS (sin espectro utilizable):", seismicSkips);
    }

    if (seismicMerged.length) {
        console.log("♻️ Casos sísmicos duplicados (mismo espectro y factores):", seismicMerged);
    }

    // Combinaciones importadas del .e2k. Si hay, se mandan al motor y REEMPLAZAN
    // a las que él genera por defecto (E.060) — el usuario quiere las suyas.
    // Ver _ff_default_design_combos en solver.py: solo genera las suyas cuando
    // `combos` no viene en el payload.
    //
    // El remapeo NO es opcional: `dedupeSeismicCases` fusiona casos con el mismo
    // espectro quedándose con el nombre más corto ("SDX ESCALADO" → "SDX"), y un
    // combo que referencie el descartado saldría en CERO sin avisar.
    const importedCombos = remapCombosToKeptCases(
        cadSystem.loadCombinations?.items || [],
        seismicMerged,
    );

    if (importedCombos.length) {
        console.log(`🧮 Usando ${importedCombos.length} combinaciones importadas del .e2k.`);
    }

    const body = {
        ...payload,
        seismicCases,
        numStations,
        ...(importedCombos.length ? { combos: importedCombos } : {}),
    };
    const signature = computeModelSignature(body);

    const cached = cadSystem.frameForceResults;
    if (
        !force &&
        cached?.source === "backend_real" &&
        cached?.frameForces?.length &&
        cached.modelSignature === signature
    ) {
        console.log("♻️ Fuerzas internas: el modelo no cambió, se reusa el último análisis.");
        return true;
    }

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
            body: JSON.stringify(body),
        });

        if (!resp.ok) {
            throw new Error(`Motor respondió ${resp.status}: ${await resp.text()}`);
        }

        const data = await resp.json();

        if (!data || data.success === false) {
            throw new Error(data?.error || "El motor no devolvió resultados válidos.");
        }

        // Volver a unir los sub-tramos del mallado en su barra original: el
        // visor y las tablas se manejan con el id de la barra del CAD, no con
        // los ids sintéticos que se le mandaron al motor. Va ANTES de normalizar
        // porque el máx/mín tiene que salir de las estaciones ya unidas.
        const frameMesh = cadSystem._frameMeshMap;
        if (frameMesh?.size) {
            data.frameForces = mergeMeshedFrameForces(data.frameForces || [], frameMesh);
        }

        const normalized = normalizeBackendResults(data);
        // Queda guardada con los resultados (y viaja en el JSON del modelo), así
        // que al reabrir un archivo tampoco se recalcula si nada cambió.
        normalized.modelSignature = signature;

        const ok = setFrameForceResultsFromBackend(cadSystem, normalized);

        if (!ok) throw new Error("Los resultados no cumplieron el contrato del visor.");

        if (showLoading) Swal.close();

        const dedup = seismicMerged.length
            ? ` (${seismicMerged.reduce((n, m) => n + m.descartados.length, 0)} caso/s sísmico/s duplicado/s omitido/s)`
            : "";

        cadSystem.showMessage?.(
            `Fuerzas reales cargadas: ${normalized.cases?.length || 0} casos, ` +
                `${normalized.frameForces?.length || 0} registros${dedup}.`,
            "success"
        );

        // Avisar EN PANTALLA, no solo en consola: un caso sísmico que falta se
        // nota tarde y se confunde con un bug del visor.
        if (seismicSkips.length) {
            cadSystem.showMessage?.(
                `⚠️ ${seismicSkips.length} caso/s sísmico/s no se calcularon y NO están en el ` +
                    `selector: ${seismicSkips.join("; ")}.`,
                "warning"
            );
        }

        return true;
    } catch (error) {
        if (showLoading) Swal.close();
        console.warn("⚠️ No se pudieron cargar fuerzas reales del motor:", error);

        const offline =
            String(error?.message || "").includes("Failed to fetch") ||
            String(error?.message || "").includes("ERR_CONNECTION");

        cadSystem.showMessage?.(
            offline
                ? "Motor de cálculo no disponible. Mostrando datos mock."
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
