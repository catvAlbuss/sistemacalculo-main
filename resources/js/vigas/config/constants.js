export const DEFAULT_VALUES = {
    FC: 210,
    FY: 4200,
    NUM_TRAMOS: 1,
    BASE: 0,
    ALTURA: 0
};

export const TABLE_CONFIG = {
    GROUPS: {
        negativo: [
            { grupo: "CM", conceptos: ["M3"] },
            { grupo: "CV", conceptos: ["M3"] },
            { grupo: "ENV max", conceptos: ["V3", "T", "M3"] },
            { grupo: "ENV min", conceptos: ["V3", "T", "M3"] }
        ],
        positivo: [
            { grupo: "CM", conceptos: ["M3"] },
            { grupo: "CV", conceptos: ["M3"] },
            { grupo: "ENV max", conceptos: ["V3", "T", "M3"] },
            { grupo: "ENV min", conceptos: ["V3", "T", "M3"] }
        ]
    },
    UNITS: {
        "V3": "tonf",
        "T": "tonf",
        "M3": "tonf-m"
    },
    STYLES: {
        GRUPO_BG: '#B2E5FC',
        TEXT_COLOR_SECONDARY: '#666'
    }
};
