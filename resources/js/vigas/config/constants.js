export const DEFAULT_VALUES = {
    FC: 210,
    FY: 4200,
    NUM_TRAMOS: 1,
    BASE: 0,
    ALTURA: 0
};

export const TABLE_CONFIG = {
    GROUPS: [
        { grupo: "CM", conceptos: ["P", "V2", "V3", "T", "M2", "M3"] },
        { grupo: "CV", conceptos: ["P", "V2", "V3", "T", "M2", "M3"] },
        { grupo: "ENV", conceptos: ["P", "V2", "V3", "T", "M2", "M3"] }
    ],
    UNITS: {
        "P": "tonf",
        "V2": "tonf",
        "V3": "tonf",
        "T": "tonf",
        "M2": "tonf-m",
        "M3": "tonf-m"
    },
    STYLES: {
        GRUPO_BG: '#B2E5FC',
        TEXT_COLOR_SECONDARY: '#666'
    }
};
