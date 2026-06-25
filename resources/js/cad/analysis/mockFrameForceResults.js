import {
    FRAME_FORCE_RESULT_TYPE,
    FRAME_FORCE_RESULT_VERSION,
    FRAME_FORCE_COMPONENTS,
    DEFAULT_FRAME_FORCE_UNITS,
} from "./frameForceResultsContract.js";

function getFrameId(frame, index) {
    return String(frame?.id ?? frame?.name ?? `F${index + 1}`);
}

function getFrameLength(frame) {
    const p1 = frame?.node1?.position;
    const p2 = frame?.node2?.position;

    if (p1 && p2) {
        const dx = Number(p2.x ?? 0) - Number(p1.x ?? 0);
        const dy = Number(p2.y ?? 0) - Number(p1.y ?? 0);
        const dz = Number(p2.z ?? 0) - Number(p1.z ?? 0);
        const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (Number.isFinite(length) && length > 0) return length;
    }

    return Number(frame?.length ?? frame?.L ?? 1) || 1;
}

function getSeedFromFrameId(frameId, index) {
    const numeric = Number(String(frameId).replace(/\D/g, ""));
    return Number.isFinite(numeric) && numeric > 0 ? numeric : index + 1;
}

function buildStations(length, base) {
    const L = Number(length) || 1;

    return [
        {
            station: 0,
            relativeStation: 0,
            P: -base,
            V2: base * 0.2,
            V3: -base * 0.6,
            T: base * 0.05,
            M2: base * 0.3,
            M3: -base * 0.8,
        },
        {
            station: L / 2,
            relativeStation: 0.5,
            P: -base,
            V2: 0,
            V3: 0,
            T: base * 0.05,
            M2: base * 0.5,
            M3: base * 0.7,
        },
        {
            station: L,
            relativeStation: 1,
            P: -base,
            V2: -base * 0.2,
            V3: base * 0.6,
            T: base * 0.05,
            M2: base * 0.3,
            M3: -base * 0.8,
        },
    ];
}

function getMaxMin(stations, component) {
    let max = null;
    let min = null;

    stations.forEach((station) => {
        const value = Number(station[component] ?? 0);

        if (!max || value > max.value) {
            max = {
                value,
                station: station.station,
            };
        }

        if (!min || value < min.value) {
            min = {
                value,
                station: station.station,
            };
        }
    });

    return { max, min };
}

function getMockCaseFactor(caseId) {
    const factors = {
        CM: 1.0,
        CVE: 0.65,
        CVT: 0.75,
        SDX: 1.35,
        SDY: 1.15,
    };

    return Number(factors[caseId] ?? 1.0);
}

export function generateMockFrameForceResults(frames = [], caseIds = ["CM"]) {
    const frameForces = [];

    frames.forEach((frame, index) => {
        const frameId = getFrameId(frame, index);
        const length = getFrameLength(frame);
        const seed = getSeedFromFrameId(frameId, index);
        const base = 5 + (seed % 20);

        caseIds.forEach((caseId) => {
            const caseFactor = getMockCaseFactor(caseId);
            const stations = buildStations(length, base * caseFactor);

            const max = {};
            const min = {};

            FRAME_FORCE_COMPONENTS.forEach((component) => {
                const result = getMaxMin(stations, component.id);
                max[component.id] = result.max;
                min[component.id] = result.min;
            });

            frameForces.push({
                frameId,
                caseId,
                comboId: null,
                length,
                localAxes: {
                    axis1: "i_to_j",
                    axis2: "local_2",
                    axis3: "local_3",
                },
                stations,
                max,
                min,
            });
        });
    });

    return {
        type: FRAME_FORCE_RESULT_TYPE,
        version: FRAME_FORCE_RESULT_VERSION,
        source: "mock",
        units: DEFAULT_FRAME_FORCE_UNITS,
        cases: caseIds.map((id) => ({
            id,
            name: id,
            type: "Mock",
        })),
        components: FRAME_FORCE_COMPONENTS,
        frameForces,
    };
}