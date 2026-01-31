import { TABLE_CONFIG } from "../config/constants.js";
import { showSuccess, showError } from "./domHelpers.js";

/**
 * Sets up a custom paste handler to transpose Excel blocks.
 * Uses the capture phase to ensure it runs before Tabulator's internal handler.
 */
export const setupPasteHandler = (tableInstance) => {
    const tableElement = tableInstance.element;

    tableElement.addEventListener("paste", (e) => {
        // Allow default behavior if user is explicitly editing a text input
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
            return;
        }

        const clipboardData = (e.clipboardData || window.clipboardData).getData("text");
        if (!clipboardData) return;

        // Parse rows - flexible split handling Windows/Unix endings
        let rows = clipboardData.split(/\r?\n/);

        // Remove empty trailing rows
        while (rows.length > 0 && rows[rows.length - 1].trim() === "") {
            rows.pop();
        }

        if (rows.length === 0) return;

        // Validation - Heuristics to detect "Forces Data from Excel"
        // typically 6 columns: P, V2, V3, T, M2, M3
        // But Excel might put empty strings for 0 or trailing tabs.

        // Check standard column count in the first few rows
        const checkRowsToCheck = Math.min(rows.length, 3);
        let matchCount = 0;
        let numericCount = 0;

        for (let i = 0; i < checkRowsToCheck; i++) {
            const cols = rows[i].split("\t");
            // We expect around 6 columns. Allow 5-20 (robustness against extra empty cols)
            if (cols.length >= 5) {
                matchCount++;
                // Check if at least one value is numeric
                if (cols.some(c => !isNaN(parseFloat(c.replace(",", ".").trim())) && c.trim() !== "")) {
                    numericCount++;
                }
            }
        }

        // Relaxed criteria: 
        // 1. Most looked-at rows have >= 5 columns
        // 2. We found numbers
        // 3. Row count is at least 3 (conceptually a block) OR 
        //    if it is less than 3, we still try if it looks really like our data (6 cols of numbers).

        const isBlockFormat = (matchCount === checkRowsToCheck) && (numericCount > 0);

        // Check for Single Column (Transpose) - 1 column, multiple rows
        let isSingleColFormat = false;
        if (!isBlockFormat && rows.length > 1) {
            const firstRowCols = rows[0].split("\t");
            if (firstRowCols.length === 1) {
                // Check if numeric
                if (!isNaN(parseFloat(firstRowCols[0].replace(",", ".").trim()))) {
                    isSingleColFormat = true;
                }
            }
        }

        if (isBlockFormat) {
            //console.log("Custom paste detected (Block Mode). Transposing...");
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            processBlockPaste(tableInstance, rows);
        } else if (isSingleColFormat) {
            //console.log("Custom paste detected (Single Column Transpose).");
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            processTransposePaste(tableInstance, rows);
        } else {
            //console.log("Paste skipped: Format not recognized as transpose target.");
        }
    }, true);
};

const getFlatGroups = () => {
    const { GROUPS } = TABLE_CONFIG;
    if (Array.isArray(GROUPS)) return GROUPS;
    let all = [];
    Object.values(GROUPS).forEach(groupList => {
        if (Array.isArray(groupList)) {
            all = all.concat(groupList);
        }
    });
    return all;
};

const processTransposePaste = (table, rows) => {
    // 1. Get Selection Start
    if (!table.modules || !table.modules.selectRange || !table.modules.selectRange.activeRange) {
        showError("Error", "Seleccione una celda de inicio para pegar la columna transpuesta.");
        return;
    }
    const range = table.modules.selectRange.activeRange;
    const bounds = range.getBounds();
    if (!bounds || !bounds.start) return;

    const startRow = bounds.start.row;
    const startCol = bounds.start.column;
    const startRowData = startRow.getData();

    // Get all field columns
    const fieldColumns = [];
    const collectFields = (cols) => {
        cols.forEach(c => {
            if (c.getSubColumns && c.getSubColumns().length > 0) {
                collectFields(c.getSubColumns());
            } else {
                fieldColumns.push(c);
            }
        });
    };
    collectFields(table.getColumns());

    const startIndex = fieldColumns.findIndex(c => c.getField() === startCol.getField());
    if (startIndex === -1) return;

    const rowId = startRowData.id;
    const rowUpdate = { id: rowId };
    let changesCount = 0;

    rows.forEach((rowStr, i) => {
        const val = rowStr.trim();
        if (val === "") return;

        // Target Column: current + i
        const targetColIndex = startIndex + i;
        if (targetColIndex < fieldColumns.length) {
            const field = fieldColumns[targetColIndex].getField();
            // Update value
            let numericVal = val.replace(",", ".");
            if (!isNaN(numericVal)) {
                rowUpdate[field] = parseFloat(numericVal);
                changesCount++;
            }
        }
    });

    if (changesCount > 0) {
        table.updateData([rowUpdate])
            .then(() => showSuccess("Transposición Completada", `Se pegaron ${changesCount} valores en fila.`))
            .catch(e => showError("Error", "Falló al actualizar fila."));
    }
};

const processBlockPaste = (table, rows) => {
    const GROUPS = getFlatGroups(); // Use flattened groups
    const conceptsOrder = ["P", "V2", "V3", "T", "M2", "M3"];
    const tableData = table.getData();
    // Cache row lookups to improve performance: Map<"Group|Concept", RowID>
    const rowLookup = {};
    tableData.forEach(row => {
        if (row._grupo && row._concepto) {
            rowLookup[`${row._grupo}|${row._concepto}`] = row.id;
        }
    });

    const rowsToUpdate = {};
    let changesCount = 0;

    // Detect Starting Context (Beam and Group)
    let currentBeamIndex = 1; // Default to b1
    let currentGroupIndex = 0; // Default to CM (index 0)

    // Try to get context from Tabulator selection
    let selectionFound = false;

    if (table.modules && table.modules.selectRange && table.modules.selectRange.activeRange) {
        const range = table.modules.selectRange.activeRange;
        const bounds = range.getBounds();
        if (bounds && bounds.start) {
            const startColField = bounds.start.column.getField();
            const startRowData = bounds.start.row.getData();

            // Extract Beam from column field, e.g., "b1_a" -> 1
            const beamMatch = startColField.match(/^b(\d+)_/);
            if (beamMatch) {
                currentBeamIndex = parseInt(beamMatch[1]);
            }

            // Extract Group from row data
            if (startRowData._grupo) {
                const grpIdx = GROUPS.findIndex(g => g.grupo === startRowData._grupo);
                if (grpIdx !== -1) {
                    currentGroupIndex = grpIdx;
                }
            }
            selectionFound = true;
            //console.log(`Paste Context Detected: Beam ${currentBeamIndex}, Group ${GROUPS[currentGroupIndex].grupo}`);
        }
    }

    if (!selectionFound) {
        //console.log("No selection detected, defaulting to Beam 1, CM.");
    }

    // Process rows in chunks of 3 (Stations a, b, c)
    const rowsPerBlock = 3;

    for (let i = 0; i < rows.length; i += rowsPerBlock) {
        const groupObj = GROUPS[currentGroupIndex];

        if (!groupObj) break;

        const groupName = groupObj.grupo;

        // Process this block for the current Group/Beam
        for (let offset = 0; offset < rowsPerBlock; offset++) {
            const rowIndex = i + offset;
            if (rowIndex >= rows.length) break;

            const rowString = rows[rowIndex];
            const cols = rowString.split("\t");
            if (cols.length < 6) continue;

            const stationIndex = offset; // 0=a, 1=b, 2=c
            const stationSuffix = ["a", "b", "c"][stationIndex];

            // Map columns P..M3 to Row Concepts
            cols.forEach((val, colIndex) => {
                if (colIndex >= conceptsOrder.length) return;
                const conceptName = conceptsOrder[colIndex];

                // Find target row ID
                const rowKey = `${groupName}|${conceptName}`;
                const targetRowId = rowLookup[rowKey];

                if (targetRowId) {
                    const fieldName = `b${currentBeamIndex}_${stationSuffix}`;

                    if (!rowsToUpdate[targetRowId]) {
                        rowsToUpdate[targetRowId] = { id: targetRowId };
                    }

                    // Clean value
                    let numericVal = val.replace(",", ".");
                    numericVal = numericVal.trim();

                    if (numericVal !== "" && !isNaN(numericVal)) {
                        rowsToUpdate[targetRowId][fieldName] = parseFloat(numericVal);
                        changesCount++;
                    }
                }
            });
        }

        // Advance to next Group for the next chunk
        currentGroupIndex++;
        if (currentGroupIndex >= GROUPS.length) {
            currentGroupIndex = 0;
            currentBeamIndex++; // Move to next beam
        }
    }

    if (changesCount > 0) {
        const updatesArray = Object.values(rowsToUpdate);
        table.updateData(updatesArray)
            .then(() => {
                showSuccess("Datos Importados", `Se procesaron ${rows.length} filas y se actualizaron ${changesCount} valores.\nInicio: Viga ${currentBeamIndex}, Grupo ${GROUPS[(currentGroupIndex - 1 + GROUPS.length) % GROUPS.length].grupo || 'Detectado'}`);
            })
            .catch((err) => {
                //console.error(err);
                showError("Error", "Falló la actualización de la tabla.");
            });
    }
};
