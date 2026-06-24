// resources/js/cad/analysis/4_modalSpectralPayload.js

export const DEFAULT_RESPONSE_SPECTRUM_POINTS = [
    { T: 0.00, Sa: 0.196875 },
    { T: 0.10, Sa: 0.196875 },
    { T: 0.20, Sa: 0.196875 },
    { T: 0.50, Sa: 0.196875 },
    { T: 1.00, Sa: 0.196875 },
    { T: 1.20, Sa: 0.164063 },
    { T: 1.50, Sa: 0.131250 },
    { T: 2.00, Sa: 0.078750 },
    { T: 3.00, Sa: 0.035000 },
    { T: 5.00, Sa: 0.012600 },
    { T: 15.00, Sa: 0.001400 },
];

export const DEFAULT_MODAL_SPECTRAL_CASES = [
    {
        name: "SDX",
        direction: "X",
        targetPeriodS: null,
        effectiveMassKg: null,
        heightM: null,
        scaleFactor: 1,
        expected: null,
    },
    {
        name: "SDY",
        direction: "Y",
        targetPeriodS: null,
        effectiveMassKg: null,
        heightM: null,
        scaleFactor: 1,
        expected: null,
    },
    {
        name: "SDX ESCALADO",
        direction: "X",
        targetPeriodS: null,
        effectiveMassKg: null,
        heightM: null,
        scaleFactor: 1,
        expected: null,
    },
    {
        name: "SDY ESCALADO",
        direction: "Y",
        targetPeriodS: null,
        effectiveMassKg: null,
        heightM: null,
        scaleFactor: 1,
        expected: null,
    },
    {
        name: "DER XX",
        direction: "X",
        targetPeriodS: null,
        effectiveMassKg: null,
        heightM: null,
        scaleFactor: 1,
        expected: null,
    },
    {
        name: "DER YY",
        direction: "Y",
        targetPeriodS: null,
        effectiveMassKg: null,
        heightM: null,
        scaleFactor: 1,
        expected: null,
    },
];

export function cloneModalSpectralData(data) {
    return JSON.parse(JSON.stringify(data));
}

/**
 * Payload temporal validado contra ETABS.
 *
 * Más adelante este método recibirá datos reales del modelo:
 * nodes, frames, supports, masses, sections y materials.
 */
export function buildDefaultModalSpectralPayload(options = {}) {
    return {
        model: {
            name: options.modelName || "JHACK Modal Spectral Demo",
            description:
                options.description ||
                "Payload temporal para validar conexión frontend -> Flask -> OpenSeesPy",
        },

        nodes: cloneModalSpectralData(options.nodes || []),
        frames: cloneModalSpectralData(options.frames || []),
        supports: cloneModalSpectralData(options.supports || []),
        masses: cloneModalSpectralData(options.masses || []),
        sections: cloneModalSpectralData(options.sections || []),
        materials: cloneModalSpectralData(options.materials || []),

        responseSpectrum: {
            name: options.responseSpectrumName || "ESPECTRO XX / YY - ETABS Excel",
            units: options.responseSpectrumUnits || "Sa en g",
            points: cloneModalSpectralData(
                options.responseSpectrumPoints || DEFAULT_RESPONSE_SPECTRUM_POINTS
            ),
        },

        analysis: {
            numberOfModes: options.numberOfModes ?? 3,
            modalCombination: options.modalCombination || "CQC",
            cases: cloneModalSpectralData(
                options.cases || DEFAULT_MODAL_SPECTRAL_CASES
            ),
        },
    };
}