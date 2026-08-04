const FRAME_COMPONENTS = ["P", "V2", "V3", "T", "M2", "M3"];

export const DEFAULT_MOCK_LOAD_COMBINATIONS = [
    {
        id: "COMBO1",
        name: "1.4CM",
        type: "Linear Combo",
        factors: {
            CM: 1.4,
        },
    },
    {
        id: "COMBO2",
        name: "1.2CM + 1.6CVE",
        type: "Linear Combo",
        factors: {
            CM: 1.2,
            CVE: 1.6,
        },
    },
    {
        id: "COMBO3",
        name: "1.2CM + SDX",
        type: "Linear Combo",
        factors: {
            CM: 1.2,
            SDX: 1.0,
        },
    },
    {
        id: "COMBO4",
        name: "1.2CM + SDY",
        type: "Linear Combo",
        factors: {
            CM: 1.2,
            SDY: 1.0,
        },
    },
];

function clonePlain(value) {
    return JSON.parse(JSON.stringify(value ?? null));
}

function getFrameCaseRecord(results, frameId, caseId) {
    return results?.frameForces?.find((record) => {
        return (
            String(record.frameId) === String(frameId) &&
            String(record.caseId) === String(caseId) &&
            !record.comboId
        );
    });
}

function getUniqueFrameIds(results) {
    return [
        ...new Set(
            (results?.frameForces || []).map((record) => String(record.frameId))
        ),
    ];
}

function getStationKey(station) {
    const relative = Number(station?.relativeStation ?? 0);
    return relative.toFixed(8);
}

function buildMaxMin(stations) {
    const max = {};
    const min = {};

    FRAME_COMPONENTS.forEach((component) => {
        let maxItem = null;
        let minItem = null;

        stations.forEach((station) => {
            const value = Number(station[component] ?? 0);

            if (!maxItem || value > maxItem.value) {
                maxItem = {
                    value,
                    station: Number(station.station ?? 0),
                };
            }

            if (!minItem || value < minItem.value) {
                minItem = {
                    value,
                    station: Number(station.station ?? 0),
                };
            }
        });

        max[component] = maxItem;
        min[component] = minItem;
    });

    return { max, min };
}

function buildComboStations(records, factors) {
    const stationMap = new Map();

    records.forEach(({ record, factor }) => {
        const stations = Array.isArray(record?.stations) ? record.stations : [];

        stations.forEach((station) => {
            const key = getStationKey(station);

            if (!stationMap.has(key)) {
                stationMap.set(key, {
                    station: Number(station.station ?? 0),
                    relativeStation: Number(station.relativeStation ?? 0),
                    P: 0,
                    V2: 0,
                    V3: 0,
                    T: 0,
                    M2: 0,
                    M3: 0,
                });
            }

            const target = stationMap.get(key);

            FRAME_COMPONENTS.forEach((component) => {
                target[component] += Number(station[component] ?? 0) * factor;
            });
        });
    });

    return [...stationMap.values()].sort((a, b) => {
        return Number(a.relativeStation) - Number(b.relativeStation);
    });
}

function buildComboRecords(results, comboDefinition) {
    const frameIds = getUniqueFrameIds(results);
    const records = [];

    frameIds.forEach((frameId) => {
        const sourceRecords = [];

        Object.entries(comboDefinition.factors || {}).forEach(([caseId, factor]) => {
            const record = getFrameCaseRecord(results, frameId, caseId);

            if (record) {
                sourceRecords.push({
                    record,
                    factor: Number(factor),
                });
            }
        });

        if (!sourceRecords.length) return;

        const baseRecord = sourceRecords[0].record;
        const stations = buildComboStations(sourceRecords, comboDefinition.factors);
        const extrema = buildMaxMin(stations);

        records.push({
            frameId,
            caseId: null,
            comboId: comboDefinition.id,
            comboName: comboDefinition.name,
            length: baseRecord.length,
            localAxes: clonePlain(baseRecord.localAxes),
            stations,
            max: extrema.max,
            min: extrema.min,
            sourceCases: clonePlain(comboDefinition.factors),
        });
    });

    return records;
}

function buildEnvelopeRecords(results, envelopeDefinition) {
    const frameIds = getUniqueFrameIds(results);
    const caseIds = envelopeDefinition.caseIds || ["CM", "CVE", "SDX", "SDY"];
    const records = [];

    frameIds.forEach((frameId) => {
        const sourceRecords = caseIds
            .map((caseId) => getFrameCaseRecord(results, frameId, caseId))
            .filter(Boolean);

        if (!sourceRecords.length) return;

        const baseRecord = sourceRecords[0];
        const stationMap = new Map();

        sourceRecords.forEach((record) => {
            record.stations?.forEach((station) => {
                const key = getStationKey(station);

                if (!stationMap.has(key)) {
                    stationMap.set(key, {
                        station: Number(station.station ?? 0),
                        relativeStation: Number(station.relativeStation ?? 0),
                        P: 0,
                        V2: 0,
                        V3: 0,
                        T: 0,
                        M2: 0,
                        M3: 0,
                    });
                }

                const target = stationMap.get(key);

                FRAME_COMPONENTS.forEach((component) => {
                    const current = Number(target[component] ?? 0);
                    const candidate = Number(station[component] ?? 0);

                    if (Math.abs(candidate) > Math.abs(current)) {
                        target[component] = candidate;
                    }
                });
            });
        });

        const stations = [...stationMap.values()].sort((a, b) => {
            return Number(a.relativeStation) - Number(b.relativeStation);
        });

        const extrema = buildMaxMin(stations);

        records.push({
            frameId,
            caseId: null,
            comboId: envelopeDefinition.id,
            comboName: envelopeDefinition.name,
            type: "Envelope",
            length: baseRecord.length,
            localAxes: clonePlain(baseRecord.localAxes),
            stations,
            max: extrema.max,
            min: extrema.min,
            sourceCases: caseIds,
        });
    });

    return records;
}

export function addFrameForceCombinations(results, comboDefinitions = DEFAULT_MOCK_LOAD_COMBINATIONS) {
    if (!results?.frameForces?.length) {
        return results;
    }

    const next = clonePlain(results);

    next.combinations = comboDefinitions.map((combo) => ({
        id: combo.id,
        name: combo.name,
        type: combo.type || "Linear Combo",
        factors: combo.factors,
    }));

    comboDefinitions.forEach((combo) => {
        const comboRecords = buildComboRecords(next, combo);
        next.frameForces.push(...comboRecords);
    });

    return next;
}

export function addFrameForceEnvelope(results, envelopeDefinition = null) {
    if (!results?.frameForces?.length) {
        return results;
    }

    const next = clonePlain(results);

    const definition =
        envelopeDefinition || {
            id: "ENV_MAX",
            name: "Envelope Max Abs",
            type: "Envelope",
            caseIds: ["CM", "CVE", "SDX", "SDY"],
        };

    next.envelopes = [
        ...(next.envelopes || []),
        {
            id: definition.id,
            name: definition.name,
            type: definition.type,
            caseIds: definition.caseIds,
        },
    ];

    const envelopeRecords = buildEnvelopeRecords(next, definition);

    next.frameForces.push(...envelopeRecords);

    return next;
}

export function addDefaultCombosAndEnvelope(results) {
    let next = addFrameForceCombinations(results, DEFAULT_MOCK_LOAD_COMBINATIONS);

    next = addFrameForceEnvelope(next, {
        id: "ENV_MAX",
        name: "Envelope Max Abs",
        type: "Envelope",
        caseIds: ["CM", "CVE", "SDX", "SDY"],
    });

    return next;
}

export function getAvailableFrameForceCases(results) {
    const cases = Array.isArray(results?.cases) ? results.cases : [];
    const combos = Array.isArray(results?.combinations) ? results.combinations : [];
    const envelopes = Array.isArray(results?.envelopes) ? results.envelopes : [];

    return {
        cases,
        combos,
        envelopes,
        all: [
            ...cases.map((item) => ({
                ...item,
                selectorType: "case",
            })),
            ...combos.map((item) => ({
                ...item,
                selectorType: "combo",
            })),
            ...envelopes.map((item) => ({
                ...item,
                selectorType: "envelope",
            })),
        ],
    };
}