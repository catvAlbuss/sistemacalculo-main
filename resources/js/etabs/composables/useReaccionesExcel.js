// resources/js/etabs/composables/useReaccionesExcel.js
// Lector limpio de Excel para ETABS2.
// Reemplaza la parte de Excel de adm_safecito.js sin depender del DOM antiguo.

import { computed, ref } from "vue";
import ExcelJS from "exceljs/dist/exceljs.min.js";

export const DEFAULT_REACTION_IMPORT_CONFIG = {
    sheetName: "Joint Reactions",
    startRow: 5,
    pointColumn: "C",
    comboColumn: "D",
    f2Column: "K",
    mxColumn: "L",
    myColumn: "M",
};

export const DEFAULT_COORDINATE_IMPORT_CONFIG = {
    sheetName: "Point Object Connectivity",
    startRow: 5,
    pointColumn: "A",
    xColumn: "F",
    yColumn: "G",
};

const COMBO_FIELD_GROUPS = [
    ["pd1", "pd2", "pd3"],
    ["pl1", "pl2", "pl3"],
    ["sismo1", "sismo2", "sismo3"],
];

export const DUPLICATE_REACTION_POLICIES = [
    {
        id: "absMaxByComponent",
        label: "Mayor absoluto por componente",
    },
    {
        id: "maxByComponent",
        label: "Máximo por componente",
    },
    {
        id: "minByComponent",
        label: "Mínimo por componente",
    },
    {
        id: "first",
        label: "Primera fila",
    },
    {
        id: "last",
        label: "Última fila",
    },
];

function toFiniteOrZero(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

function pickComponentValue(rows, field, policy) {
    if (!rows.length) return "";

    if (policy === "first") {
        return rows[0][field];
    }

    if (policy === "last") {
        return rows[rows.length - 1][field];
    }

    const values = rows
        .map((row) => toFiniteOrZero(row[field]))
        .filter((value) => Number.isFinite(value));

    if (!values.length) return "";

    if (policy === "maxByComponent") {
        return Math.max(...values);
    }

    if (policy === "minByComponent") {
        return Math.min(...values);
    }

    return values.reduce((best, current) => {
        return Math.abs(current) > Math.abs(best) ? current : best;
    }, values[0]);
}

function aggregateReactionRows(rows, policy = "absMaxByComponent") {
    if (!Array.isArray(rows) || !rows.length) {
        return {
            f2: "",
            mx: "",
            my: "",
        };
    }

    return {
        f2: pickComponentValue(rows, "f2", policy),
        mx: pickComponentValue(rows, "mx", policy),
        my: pickComponentValue(rows, "my", policy),
    };
}

function normalizeText(value) {
    return String(value ?? "").trim();
}

function readCellText(row, columnNumber) {
    const cellValue = row.getCell(columnNumber).value;

    if (cellValue === null || cellValue === undefined) {
        return "";
    }

    if (typeof cellValue === "object") {
        if (cellValue.text !== undefined) {
            return normalizeText(cellValue.text);
        }

        if (cellValue.result !== undefined) {
            return normalizeText(cellValue.result);
        }

        if (Array.isArray(cellValue.richText)) {
            return normalizeText(cellValue.richText.map((item) => item.text).join(""));
        }
    }

    return normalizeText(cellValue);
}

function readCellNumber(row, columnNumber) {
    const value = row.getCell(columnNumber).value;

    if (value === null || value === undefined || value === "") {
        return "";
    }

    if (typeof value === "object" && value.result !== undefined) {
        const resultNumber = Number(value.result);
        return Number.isFinite(resultNumber) ? resultNumber : value.result;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
}

export function columnLabelToNumber(label) {
    const cleanLabel = String(label ?? "")
        .trim()
        .toUpperCase();

    if (/^\d+$/.test(cleanLabel)) {
        const columnNumber = Number(cleanLabel);
        if (columnNumber > 0) {
            return columnNumber;
        }
    }

    if (!/^[A-Z]+$/.test(cleanLabel)) {
        throw new Error(`La columna "${label}" no es válida. Usa letras de Excel, por ejemplo A, C o AA.`);
    }

    return cleanLabel.split("").reduce((columnNumber, letter) => {
        return columnNumber * 26 + letter.charCodeAt(0) - 64;
    }, 0);
}

function normalizeImportConfig(config, defaults) {
    return {
        ...defaults,
        ...(config || {}),
        startRow: Number(config?.startRow ?? defaults.startRow),
    };
}

function normalizeColumnConfig(config) {
    return Object.fromEntries(
        Object.entries(config).map(([key, value]) => {
            if (key === "sheetName" || key === "startRow") {
                return [key, value];
            }

            return [key, columnLabelToNumber(value)];
        })
    );
}

function validateExcelFile(file, label) {
    if (!file) {
        throw new Error(`Selecciona el Excel de ${label} antes de importar.`);
    }

    const validExtensions = [".xlsx", ".xlsm", ".xls"];
    const lowerName = String(file.name || "").toLowerCase();
    const isValid = validExtensions.some((extension) => lowerName.endsWith(extension));

    if (!isValid) {
        throw new Error(`El archivo de ${label} debe ser Excel: .xlsx, .xlsm o .xls.`);
    }
}

async function loadWorkbook(file, label) {
    validateExcelFile(file, label);

    const workbook = new ExcelJS.Workbook();
    const buffer = await file.arrayBuffer();

    try {
        await workbook.xlsx.load(buffer);
    } catch (error) {
        console.error(`Error leyendo Excel de ${label}:`, error);
        throw new Error(
            `No se pudo leer el Excel de ${label}. Verifica que sea un archivo .xlsx válido y que no esté dañado.`
        );
    }

    return workbook;
}

function getWorksheetOrFail(workbook, sheetName) {
    const worksheet = workbook.getWorksheet(sheetName);

    if (!worksheet) {
        const availableSheets = workbook.worksheets.map((item) => item.name).join(", ");
        throw new Error(`No se encontró la hoja "${sheetName}". Hojas disponibles: ${availableSheets || "ninguna"}.`);
    }

    return worksheet;
}

export async function readJointReactionsExcel(file, config = DEFAULT_REACTION_IMPORT_CONFIG) {
    const normalizedConfig = normalizeColumnConfig(
        normalizeImportConfig(config, DEFAULT_REACTION_IMPORT_CONFIG)
    );

    const workbook = await loadWorkbook(file, "reacciones");
    const worksheet = getWorksheetOrFail(workbook, normalizedConfig.sheetName);

    const rows = [];
    const combos = [];
    const seenCombos = new Set();

    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber < normalizedConfig.startRow) {
            return;
        }

        const combo = readCellText(row, normalizedConfig.comboColumn);

        if (!combo) {
            return;
        }

        const column = readCellText(row, normalizedConfig.pointColumn);

        if (!column) {
            return;
        }

        rows.push({
            column,
            combo,
            f2: readCellNumber(row, normalizedConfig.f2Column),
            mx: readCellNumber(row, normalizedConfig.mxColumn),
            my: readCellNumber(row, normalizedConfig.myColumn),
        });

        if (!seenCombos.has(combo)) {
            seenCombos.add(combo);
            combos.push(combo);
        }
    });

    if (!combos.length || !rows.length) {
        throw new Error(
            `No se encontraron reacciones desde la hoja "${normalizedConfig.sheetName}", fila ${normalizedConfig.startRow}.`
        );
    }

    return {
        workbook,
        worksheetName: worksheet.name,
        combos,
        rows,
        totalRows: rows.length,
    };
}

export async function readPointObjectConnectivityExcel(file, config = DEFAULT_COORDINATE_IMPORT_CONFIG) {
    const normalizedConfig = normalizeColumnConfig(
        normalizeImportConfig(config, DEFAULT_COORDINATE_IMPORT_CONFIG)
    );

    const workbook = await loadWorkbook(file, "coordenadas");
    const worksheet = getWorksheetOrFail(workbook, normalizedConfig.sheetName);

    const coordinatesByColumn = new Map();

    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber < normalizedConfig.startRow) {
            return;
        }

        const pointName = readCellText(row, normalizedConfig.pointColumn);

        if (!pointName || coordinatesByColumn.has(pointName)) {
            return;
        }

        coordinatesByColumn.set(pointName, {
            x: readCellNumber(row, normalizedConfig.xColumn),
            y: readCellNumber(row, normalizedConfig.yColumn),
        });
    });

    if (!coordinatesByColumn.size) {
        throw new Error(
            `No se encontraron coordenadas desde la hoja "${normalizedConfig.sheetName}", fila ${normalizedConfig.startRow}.`
        );
    }

    return {
        workbook,
        worksheetName: worksheet.name,
        coordinatesByColumn,
        totalCoordinates: coordinatesByColumn.size,
    };
}

export function buildDatosGeneralesRows(
    jointReactionsRows,
    selectedCombos,
    coordinatesByColumn = new Map(),
    duplicatePolicy = "absMaxByComponent"
) {
    if (!Array.isArray(jointReactionsRows) || jointReactionsRows.length === 0) {
        throw new Error("Primero importa las reacciones del Excel.");
    }

    if (!Array.isArray(selectedCombos) || selectedCombos.length !== 3) {
        throw new Error("Selecciona exactamente 3 combinaciones: PD, PL y SISMO.");
    }

    const groupedRows = new Map();

    jointReactionsRows.forEach((sourceRow) => {
        const comboIndex = selectedCombos.indexOf(sourceRow.combo);

        if (comboIndex === -1 || !sourceRow.column) return;

        const key = `${sourceRow.column}__${comboIndex}`;

        if (!groupedRows.has(key)) {
            groupedRows.set(key, {
                column: sourceRow.column,
                comboIndex,
                rows: [],
            });
        }

        groupedRows.get(key).rows.push(sourceRow);
    });

    const rowsByColumn = new Map();

    groupedRows.forEach((group) => {
        if (!rowsByColumn.has(group.column)) {
            const coordinates = coordinatesByColumn.get(group.column) ?? {};

            rowsByColumn.set(group.column, {
                id: rowsByColumn.size + 1,
                column: group.column,
                x: coordinates.x ?? "",
                y: coordinates.y ?? "",
                pd1: "",
                pd2: "",
                pd3: "",
                pl1: "",
                pl2: "",
                pl3: "",
                sismo1: "",
                sismo2: "",
                sismo3: "",
            });
        }

        const targetRow = rowsByColumn.get(group.column);
        const [f2Field, mxField, myField] = COMBO_FIELD_GROUPS[group.comboIndex];
        const aggregated = aggregateReactionRows(group.rows, duplicatePolicy);

        targetRow[f2Field] = aggregated.f2;
        targetRow[mxField] = aggregated.mx;
        targetRow[myField] = aggregated.my;
    });

    const rows = [...rowsByColumn.values()];

    if (!rows.length) {
        throw new Error("Las combinaciones seleccionadas no coinciden con las filas de reacciones importadas.");
    }

    return rows;
}

export function validateDatosGeneralesRows(rows) {
    if (!Array.isArray(rows) || !rows.length) {
        return {
            ok: false,
            message: "No hay columnas importadas.",
            invalidRows: [],
        };
    }

    const requiredFields = [
        "column",
        "x",
        "y",
        "pd1",
        "pd2",
        "pd3",
        "pl1",
        "pl2",
        "pl3",
        "sismo1",
        "sismo2",
        "sismo3",
    ];

    const invalidRows = rows.filter((row) => {
        return requiredFields.some((field) => {
            const value = row[field];
            return value === "" || value === null || value === undefined || !Number.isFinite(Number(value));
        });
    });

    if (invalidRows.length) {
        return {
            ok: false,
            message: `Hay ${invalidRows.length} columna(s) con datos incompletos o no numéricos.`,
            invalidRows,
        };
    }

    return {
        ok: true,
        message: `${rows.length} columna(s) listas para calcular.`,
        invalidRows: [],
    };
}

export function useReaccionesExcel() {
    const reactionFile = ref(null);
    const coordinateFile = ref(null);

    const reactionImportConfig = ref({ ...DEFAULT_REACTION_IMPORT_CONFIG });
    const coordinateImportConfig = ref({ ...DEFAULT_COORDINATE_IMPORT_CONFIG });

    const reactionRows = ref([]);
    const availableCombos = ref([]);
    const selectedCombos = ref([]);

    const coordinatesByColumn = ref(new Map());
    const datosGeneralesRows = ref([]);

    const loading = ref(false);
    const error = ref("");
    const status = ref("");
    const duplicatePolicy = ref("absMaxByComponent");

    const hasReactions = computed(() => reactionRows.value.length > 0);
    const hasCoordinates = computed(() => coordinatesByColumn.value.size > 0);
    const hasSelectedCombos = computed(() => selectedCombos.value.length === 3);

    const validation = computed(() => validateDatosGeneralesRows(datosGeneralesRows.value));
    const readyToCalculate = computed(() => validation.value.ok);


    async function importReactionFile(file) {
        loading.value = true;
        error.value = "";
        status.value = "";

        try {
            reactionFile.value = file;

            const result = await readJointReactionsExcel(file, reactionImportConfig.value);

            reactionRows.value = result.rows;
            availableCombos.value = result.combos;
            selectedCombos.value = [];
            coordinatesByColumn.value = new Map();
            datosGeneralesRows.value = [];

            status.value = `Se importaron ${result.totalRows} filas de reacciones y ${result.combos.length} combinaciones.`;
            return result;
        } catch (importError) {
            error.value = importError.message || "No se pudo importar el Excel de reacciones.";
            throw importError;
        } finally {
            loading.value = false;
        }
    }

    function selectCombos(combos) {
        error.value = "";

        if (!Array.isArray(combos) || combos.length !== 3) {
            throw new Error("Selecciona exactamente 3 combinaciones: PD, PL y SISMO.");
        }

        selectedCombos.value = [...combos];

        datosGeneralesRows.value = buildDatosGeneralesRows(
            reactionRows.value,
            selectedCombos.value,
            coordinatesByColumn.value,
            duplicatePolicy.value
        );

        status.value = `${datosGeneralesRows.value.length} columnas importadas. Ahora importa coordenadas.`;
        return datosGeneralesRows.value;
    }

    async function importCoordinateFile(file) {
        loading.value = true;
        error.value = "";
        status.value = "";

        try {
            coordinateFile.value = file;

            const result = await readPointObjectConnectivityExcel(file, coordinateImportConfig.value);

            coordinatesByColumn.value = result.coordinatesByColumn;

            if (selectedCombos.value.length === 3) {
                datosGeneralesRows.value = buildDatosGeneralesRows(
                    reactionRows.value,
                    selectedCombos.value,
                    coordinatesByColumn.value,
                    duplicatePolicy.value
                );
            }

            const rowsWithCoordinates = datosGeneralesRows.value.filter(
                (row) => row.x !== "" && row.y !== ""
            ).length;

            const rowsWithoutCoordinates = datosGeneralesRows.value.length - rowsWithCoordinates;

            status.value = rowsWithoutCoordinates
                ? `Se rellenaron ${rowsWithCoordinates} columnas. ${rowsWithoutCoordinates} quedaron sin coordenadas.`
                : `Se rellenaron coordenadas para ${rowsWithCoordinates} columnas.`;

            return {
                ...result,
                rowsWithCoordinates,
                rowsWithoutCoordinates,
                rows: datosGeneralesRows.value,
            };
        } catch (importError) {
            error.value = importError.message || "No se pudo importar el Excel de coordenadas.";
            throw importError;
        } finally {
            loading.value = false;
        }
    }

    function updateDatosGeneralesRows(rows) {
        datosGeneralesRows.value = Array.isArray(rows) ? rows : [];
    }

    function resetAll() {
        reactionFile.value = null;
        coordinateFile.value = null;
        reactionRows.value = [];
        availableCombos.value = [];
        selectedCombos.value = [];
        coordinatesByColumn.value = new Map();
        datosGeneralesRows.value = [];
        loading.value = false;
        error.value = "";
        status.value = "";
    }

    

    return {
        reactionFile,
        coordinateFile,
        reactionImportConfig,
        coordinateImportConfig,

        reactionRows,
        availableCombos,
        selectedCombos,
        coordinatesByColumn,
        datosGeneralesRows,

        loading,
        error,
        status,

        hasReactions,
        hasCoordinates,
        hasSelectedCombos,
        validation,
        readyToCalculate,

        importReactionFile,
        importCoordinateFile,
        selectCombos,
        updateDatosGeneralesRows,
        resetAll,
        duplicatePolicy,
    };
}