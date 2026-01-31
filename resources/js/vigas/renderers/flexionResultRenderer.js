import { StructuralUtils, CONCRETE_CONSTANTS } from "../calculators/SharedCalculatorUtils.js";

const STEEL_OPTIONS = [
    { value: "0", text: 'Ø 0"' },
    { value: "0.283", text: "6mm" },
    { value: "0.503", text: "8mm cm²" },
    { value: "0.713", text: 'Ø 3/8" cm²' },
    { value: "1.131", text: "12mm cm²" },
    { value: "1.267", text: 'Ø 1/2" cm²' },
    { value: "1.979", text: 'Ø 5/8" cm²' },
    { value: "2.850", text: 'Ø 3/4" cm²' },
    { value: "5.067", text: 'Ø 1" cm²' },
    { value: "2.58", text: '2Ø1/2"' },
    { value: "3.87", text: '3Ø1/2"' },
    { value: "3.98", text: '2Ø5/8"' },
    { value: "5.16", text: '4Ø1/2"' },
    { value: "5.27", text: '2Ø5/8"+1Ø1/2"' },
    { value: "5.68", text: '2Ø3/4"' },
    { value: "5.97", text: '3Ø5/8"' },
    { value: "6.45", text: '5Ø1/2"' },
    { value: "6.56", text: '2Ø5/8"+2Ø1/2"' },
    { value: "6.97", text: '2Ø3/4"+1Ø1/2"' },
    { value: "7.67", text: '2Ø3/4"+1Ø5/8"' },
    { value: "7.74", text: '6Ø1/2"' },
    { value: "7.85", text: '2Ø5/8"+3Ø1/2"' },
    { value: "7.916", text: '4Ø5/8"' },
    { value: "8.26", text: '2Ø3/4"+2Ø1/2"' },
    { value: "8.52", text: '3Ø3/4"' },
    { value: "8.55", text: '3Ø5/8"+2Ø1/2"' },
    { value: "9.55", text: '2Ø3/4"+3Ø1/2"' },
    { value: "9.95", text: '5Ø5/8"' },
    { value: "9.66", text: '2Ø3/4"+2Ø5/8"' },
    { value: "10.2", text: '2Ø1"' },
    { value: "10.54", text: '4Ø5/8"+2Ø1/2"' },
    { value: "10.84", text: '2Ø3/4"+4Ø1/2"' },
    { value: "11.1", text: '3Ø3/4"+2Ø1/2"' },
    { value: "11.40", text: '4Ø3/4"' },
    { value: "11.65", text: '2Ø3/4"+3Ø5/8"' },
    { value: "11.94", text: '6Ø5/8"' },
    { value: "12.19", text: '2Ø1"+1Ø5/8"' },
    { value: "12.5", text: '3Ø3/4"+2Ø5/8"' },
    { value: "13.04", text: '2Ø1"+1Ø3/4"' },
    { value: "13.64", text: '2Ø3/4"+4Ø5/8"' },
    { value: "13.94", text: '4Ø3/4"+2Ø1/2"' },
    { value: "14.18", text: '2Ø1"+2Ø5/8"' },
    { value: "14.2", text: '5Ø3/4"' },
    { value: "15.3", text: '3Ø1"' },
    { value: "15.34", text: '4Ø3/4"+2Ø5/8"' },
    { value: "15.88", text: '2Ø1"+2Ø3/4"' },
    { value: "16.17", text: '2Ø1"+3Ø5/8"' },
    { value: "17.04", text: '6Ø3/4"' },
    { value: "18.16", text: '2Ø1"+4Ø5/8"' },
    { value: "18.72", text: '2Ø1"+3Ø3/4"' },
    { value: "19.28", text: '3Ø1"+2Ø5/8"' },
    { value: "20.4", text: '4Ø1"' },
    { value: "20.98", text: '3Ø1"+2Ø3/4"' },
    { value: "21.56", text: '2Ø1"+4Ø3/4"' },
    { value: "24.38", text: '4Ø1"+2Ø5/8"' },
    { value: "25.5", text: '5Ø1"' },
    { value: "26.08", text: '4Ø1"+2Ø3/4"' },
    { value: "30.6", text: '6Ø1"' },
];

export const renderFlexionResult = (containerId, flexionData, onUpdate = null) => {
    const container = document.querySelector(containerId);
    if (!container) return;

    if (!flexionData || flexionData.type !== 'FLEXION_INTERACTIVE') {
        console.warn("Datos de flexión inválidos o formato incorrecto");
        return;
    }

    // Shared state callback - NOT USED, handleSteelChange calls onUpdate directly
    // Keeping this for reference but the actual callback is triggered in handleSteelChange

    // Render Negative Section
    if (flexionData.negativo) {
        renderSectionTable(container, flexionData.negativo, flexionData.numTramos, "NEGATIVO", onUpdate);
    }

    // Render Positive Section
    if (flexionData.positivo) {
        renderSectionTable(container, flexionData.positivo, flexionData.numTramos, "POSITIVO", onUpdate);
    }
};

const handleSteelChange = (e, tableState, numTramos, sectionType, onUpdate) => {
    const select = e.target;
    const tramo = parseInt(select.dataset.tramo);
    const pos = parseInt(select.dataset.pos);
    const layerIndex = parseInt(select.dataset.layer);
    const newValue = parseFloat(select.value) || 0;

    // Update state
    if (tableState[tramo] && tableState[tramo][pos]) {
        const cellState = tableState[tramo][pos];

        // Ensure layer exists
        if (!cellState.layers[layerIndex]) {
            cellState.layers[layerIndex] = { value: 0 };
        }
        cellState.layers[layerIndex].value = newValue;

        // Calculate As_real (Sum of all layers)
        let As_real = 0;
        cellState.layers.forEach(l => {
            As_real += (l.value || 0);
        });

        const meta = cellState.meta;
        // Determine numCapas
        const numCapas = cellState.layers.length;

        // Recalculate d
        const d_real = StructuralUtils.calculateEffectiveDepth(meta.h, numCapas);

        // Recalculate a & Mn
        let a_real = 0;
        let phiMn_tonm = 0;

        if (As_real > 0 && meta.b > 0 && meta.fc > 0) {
            // a = (As * fy) / (0.85 * f'c * b)
            a_real = (As_real * meta.fy) / (0.85 * meta.fc * meta.b);
            const phi = 0.9;
            const Mn_kgcm = As_real * meta.fy * (d_real - (a_real / 2));
            phiMn_tonm = (phi * Mn_kgcm) / 100000;
        }

        // Update DOM for Summary Rows
        const updateCell = (key, val, decimals = 2) => {
            const cellId = `cell_${sectionType}_t${tramo}_p${pos}_${key}`;
            const cell = document.getElementById(cellId);
            if (cell) {
                const valContainer = cell.querySelector(".value-container");
                if (valContainer) {
                    valContainer.textContent = StructuralUtils.round(val, decimals);
                } else {
                    cell.textContent = StructuralUtils.round(val, decimals);
                }
            }
        };

        updateCell("As_real_summary", As_real);
        updateCell("PhiMn_summary", phiMn_tonm);

        // Verification
        // User Logic: if (sumas[i] < As_maxs[i] && sumas[i] >= As_usars[i]) { "CUMPLE" } else { "NO CUMPLE" }
        // "sumas[i]" here corresponds to As_real
        // "As_usars[i]" is the required As (As_usar) from the theoretical calculation

        const verifCell = document.getElementById(`cell_${sectionType}_t${tramo}_p${pos}_verif_summary`);

        if (verifCell) {
            const As_max = meta.As_max || 0;
            const As_usar = meta.As_usar || 0;

            let verifText = "NO CUMPLE";
            let verifClass = "px-2 py-2 text-center font-bold text-xs bg-red-50 text-red-600 border-r border-gray-200 dark:border-gray-700 dark:bg-red-900/30 dark:text-red-400";

            // ... verification logic ...
            if (As_real < As_max && As_real >= As_usar) {
                verifText = "CUMPLE";
                verifClass = "px-2 py-2 text-center font-bold text-xs bg-green-50 text-green-700 border-r border-gray-200 dark:border-gray-700 dark:bg-green-900/30 dark:text-green-400";
            }

            verifCell.textContent = verifText;
            verifCell.className = verifClass;
        }

        // --- Trigger Update Callback ---
        if (onUpdate) {
            // Gather all relevant values from the current state
            const gatheredData = {
                phiMn: [],
                asReal: [],
                dReal: []
            };

            for (let i = 1; i <= numTramos; i++) {
                for (let p = 0; p < 3; p++) {
                    const cell = tableState[i][p];

                    let lAs = 0;
                    cell.layers.forEach(l => lAs += (l.value || 0));

                    let pMn = 0;
                    let d_val = 0;

                    if (lAs > 0 && cell.meta.b > 0 && cell.meta.fc > 0) {
                        const nCapas = cell.layers.length;
                        const rd = StructuralUtils.calculateEffectiveDepth(cell.meta.h, nCapas);
                        d_val = rd;

                        const ra = (lAs * cell.meta.fy) / (0.85 * cell.meta.fc * cell.meta.b);
                        const rMn_kgcm = lAs * cell.meta.fy * (rd - (ra / 2));
                        // Return PhiMn in TON-M
                        pMn = (0.9 * rMn_kgcm) / 100000;
                    }

                    gatheredData.phiMn.push(pMn);
                    gatheredData.asReal.push(lAs);
                    gatheredData.dReal.push(d_val);
                }
            }

            onUpdate(gatheredData, sectionType);
        }
    }
};

const renderSectionTable = (container, sectionData, numTramos, sectionType, onUpdate = null) => {
    // Generate a unique ID for this section table to prevent duplicates
    const wrapperId = `flexion-section-${sectionType}`;

    // Check if it already exists and remove it
    const existingWrapper = document.getElementById(wrapperId);
    if (existingWrapper) {
        existingWrapper.remove();
    }

    const tableWrapper = document.createElement("div");
    tableWrapper.id = wrapperId;
    tableWrapper.className = "mb-8 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg";

    // Title
    const titleDiv = document.createElement("div");
    titleDiv.className = "bg-gray-800 dark:bg-gray-950 px-4 py-2 text-white font-bold flex justify-between items-center rounded-t-lg";
    titleDiv.innerHTML = `<span>${sectionData.title}</span>`;
    tableWrapper.appendChild(titleDiv);

    const table = document.createElement("table");
    table.className = "min-w-full divide-y divide-gray-300 dark:divide-gray-700 border-collapse text-sm";

    // State storage for this specific table section
    // Stores current layers and metadata needed for recalculation
    // Structure: state[tramoIndex][posIndex] = { layers: [], meta: {} }
    const tableState = [];

    // Initialize State from Data
    let k = 0;
    for (let i = 1; i <= numTramos; i++) {
        tableState[i] = [];
        for (let pos = 0; pos < 3; pos++) {
            tableState[i][pos] = {
                layers: [{ value: 0 }], // Start with 1 empty layer
                meta: sectionData.data.meta[k] // Store metadata (b, h, fc, etc.)
            };
            k++;
        }
    }

    // --- HEADER ---
    const thead = document.createElement("thead");
    thead.className = "bg-gray-700 dark:bg-gray-900 text-white";

    const trHead1 = document.createElement("tr");
    trHead1.innerHTML = `
        <th rowspan="2" class="px-4 py-2 text-left border border-gray-600">Descripcion</th>
        <th rowspan="2" class="px-4 py-2 text-center border border-gray-600">Simb.</th>
    `;

    for (let i = 1; i <= numTramos; i++) {
        const th = document.createElement("th");
        th.colSpan = 3;
        th.className = "px-4 py-2 text-center border border-gray-600 bg-gray-600 dark:bg-gray-800";
        th.textContent = `TRAMO ${i}`;
        trHead1.appendChild(th);
    }
    thead.appendChild(trHead1);

    const trHead2 = document.createElement("tr");
    for (let i = 1; i <= numTramos; i++) {
        ["START", "MIDDLE", "END"].forEach(sub => {
            const th = document.createElement("th");
            th.className = "px-2 py-1 text-center text-xs font-medium uppercase border border-gray-600";
            th.textContent = sub;
            trHead2.appendChild(th);
        });
    }
    thead.appendChild(trHead2);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    tbody.className = "divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800";

    // --- ROWS GENERATOR ---
    const createRow = (name, symbol, dataKey, unit, decimals = 2, isInput = false, rowIdPrefix = "") => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-gray-50 text-gray-950 dark:text-gray-50 dark:hover:bg-gray-700 transition-colors duration-150";

        tr.innerHTML = `
            <td class="px-4 py-2 font-medium border-r border-gray-200 dark:border-gray-700">${name}</td>
            <td class="px-4 py-2 text-center text-gray-500 border-r border-gray-200 dark:border-gray-700">${symbol}</td>
        `;

        let dataIndex = 0;
        for (let i = 1; i <= numTramos; i++) {
            for (let pos = 0; pos < 3; pos++) {
                const td = document.createElement("td");
                td.className = "px-2 py-2 text-center border-r border-gray-200 dark:border-gray-700";

                const cellId = `${sectionType}_t${i}_p${pos}_${rowIdPrefix || dataKey}`;
                td.id = `cell_${cellId}`;

                if (isInput) {
                    td.innerHTML = `<input type="text" class="w-full text-center bg-gray-50 rounded border" />`;
                } else {
                    // Handle missing data (e.g., As_real which is calculated client-side)
                    let val = 0;
                    if (sectionData.data[dataKey] && sectionData.data[dataKey][dataIndex] !== undefined) {
                        val = sectionData.data[dataKey][dataIndex];
                    }

                    const displayVal = StructuralUtils.round(val, decimals);

                    // Add spans for value and unit to easily update them later
                    td.innerHTML = `
                        <div class="font-bold text-gray-900 dark:text-white value-container">${displayVal}</div>
                        <div class="text-xs text-gray-500">${unit}</div>
                    `;
                }
                tr.appendChild(td);
                dataIndex++;
            }
        }
        return tr;
    };

    // 1. Theoretical Rows
    if (sectionType === 'POSITIVO') {
        tbody.appendChild(createRow("𝑀𝑢(-)=1/3𝑀𝑢(+)", "𝑀𝑢_min", "Mu_derived", "ton-m"));
        tbody.appendChild(createRow("𝑀𝑢 (-) usar", "𝑀𝑢_usar", "Mu_final", "ton-m"));
    }
    tbody.appendChild(createRow("Peralte efectivo", "d", "d", "cm"));
    tbody.appendChild(createRow("Altura del bloque comprimido", "a", "a", "cm"));
    tbody.appendChild(createRow("Refuerzo calculado", "𝐴𝑠", "As", "cm²"));
    tbody.appendChild(createRow("Refuerzo mínimo", "𝐴𝑠_𝑚𝑖𝑛", "As_min", "cm²"));
    tbody.appendChild(createRow("Area de acero balanceado", "𝜌𝑏", "As_bal", "cm²"));
    tbody.appendChild(createRow("Refuerzo máximo", "𝐴𝑠_𝑚á𝑥 75%Asb", "As_max", "cm²"));
    tbody.appendChild(createRow("Acero a Usar", "𝐴𝑠_usar", "As_usar", "cm²")); // Required As
    // tbody.appendChild(createRow("Momento último", "Mu", "Mu", "kg·cm", 0));
    // tbody.appendChild(createRow("Resistencia Diseño", "φMn", "Md", "kg·cm", 0));



    // --- DYNAMIC LAYERS SECTION ---
    const layersContainer = document.createElement("tbody");
    layersContainer.id = `layers_${sectionType}`;
    layersContainer.className = "border-t border-gray-300 dark:border-gray-600";

    // 1. Determine Max Layers for this section
    // 'sectionData.capas' structure depends on 'getValue' logic in calculator, 
    // but usually it's tramo1: {a:1, b:1, c:1}, tramo2: ...
    // We need to find the global maximum of layers to render the rows.
    let maxLayersGlobal = 0;

    // Check structure of sectionData.capas
    const capasData = sectionData.capas || {};

    // Helper to get number of layers for a specific cell
    const getLayerCount = (tramo, pos) => {
        let val = capasData;
        const tramoKey = `tramo${tramo}`;
        if (val && typeof val === 'object' && tramoKey in val) {
            val = val[tramoKey];
        }

        let count = 1; // Default
        if (val && typeof val === 'object' && !Array.isArray(val)) {
            if (pos === 0) count = Number(val.a) || 1;
            if (pos === 1) count = Number(val.b) || 1;
            if (pos === 2) count = Number(val.c) || 1;
        } else if (Array.isArray(val)) {
            count = Number(val[pos]) || 1;
        } else {
            count = Number(val) || 1;
        }
        return count;
    };

    // Calculate Global Max
    for (let i = 1; i <= numTramos; i++) {
        for (let pos = 0; pos < 3; pos++) {
            const count = getLayerCount(i, pos);
            if (count > maxLayersGlobal) maxLayersGlobal = count;

            // Initializing state with correct number of empty layers
            // Reset layers first to be sure
            tableState[i][pos].layers = [];
            for (let L = 0; L < count; L++) {
                tableState[i][pos].layers.push({ value: 0 });
            }
        }
    }

    if (maxLayersGlobal < 1) maxLayersGlobal = 1;

    // Helper to create a Layer Row
    const createLayerRow = (layerIndex) => {
        const tr = document.createElement("tr");
        tr.className = "bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 layer-row transition-colors";
        tr.dataset.layerIndex = layerIndex;

        tr.innerHTML = `
            <td class="px-4 py-2 font-medium text-slate-700 dark:text-slate-300 border-r border-gray-200 dark:border-gray-700">
                Capa ${layerIndex + 1}
            </td>
            <td class="px-4 py-2 text-center text-gray-500 border-r border-gray-200 dark:border-gray-700">
                <!-- No delete button -->
            </td>
        `;

        for (let i = 1; i <= numTramos; i++) {
            for (let pos = 0; pos < 3; pos++) {
                const td = document.createElement("td");
                td.className = "px-1 py-1 border-r border-gray-200";

                // Check if this cell should have this layer
                const cellLayerCount = getLayerCount(i, pos);

                if (layerIndex < cellLayerCount) {
                    const select = document.createElement("select");
                    select.className = "w-full text-xs p-1 rounded border border-gray-300 bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500";
                    select.dataset.tramo = i;
                    select.dataset.pos = pos;
                    select.dataset.layer = layerIndex;

                    OPCIONES_ACERO_HTML.forEach(opt => {
                        select.add(opt.cloneNode(true));
                    });

                    select.addEventListener("change", (e) => handleSteelChange(e, tableState, numTramos, sectionType, onUpdate));

                    td.appendChild(select);
                } else {
                    // Empty cell for easier reading
                    td.className += " bg-gray-100 dark:bg-gray-800/50";
                    td.innerHTML = `<span class="text-gray-300 dark:text-gray-600 text-xs">-</span>`;
                }
                tr.appendChild(td);
            }
        }
        return tr;
    };

    // Pre-build options HTML elements
    const OPCIONES_ACERO_HTML = STEEL_OPTIONS.map(opt => {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.text;
        return option;
    });

    // Create rows based on Global Max
    for (let L = 0; L < maxLayersGlobal; L++) {
        layersContainer.appendChild(createLayerRow(L));
    }

    // Append Rows to Table
    table.appendChild(tbody);
    table.appendChild(layersContainer);

    // --- SUMMARY SECTION (New) ---
    const summaryContainer = document.createElement("tbody");
    summaryContainer.id = `summary_${sectionType}`;
    summaryContainer.className = "bg-gray-50 dark:bg-gray-800/80 border-t border-gray-300 dark:border-gray-600";

    const createSummaryRow = (label, symbol, key, unit, decimals = 2) => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-gray-100 dark:hover:bg-gray-700";
        tr.innerHTML = `
            <td class="px-4 py-2 font-bold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">${label}</td>
            <td class="px-4 py-2 text-center text-gray-500 border-r border-gray-200 dark:border-gray-700">${symbol}</td>
        `;

        for (let i = 1; i <= numTramos; i++) {
            for (let pos = 0; pos < 3; pos++) {
                const td = document.createElement("td");
                td.className = "px-2 py-2 text-center border-r border-gray-200 dark:border-gray-700";
                td.id = `cell_${sectionType}_t${i}_p${pos}_${key}`;

                // Initialize with 0 or default
                td.innerHTML = `
                     <div class="font-bold text-gray-900 dark:text-white value-container">0.00</div>
                     <div class="text-xs text-gray-500">${unit}</div>
                `;
                tr.appendChild(td);
            }
        }
        return tr;
    };

    // 1. Acero Real
    summaryContainer.appendChild(createSummaryRow("Acero Real", "As", "As_real_summary", "cm²"));

    // 2. moment resistente
    summaryContainer.appendChild(createSummaryRow("Momento resistente", "ΦMn", "PhiMn_summary", "tonf-m"));

    // 3. Verificacion Row
    const trVerifSummary = document.createElement("tr");
    trVerifSummary.className = "hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors";
    trVerifSummary.innerHTML = `
        <td class="px-4 py-2 font-bold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">Verificacion</td>
        <td class="px-4 py-2 text-center text-gray-500 border-r border-gray-200 dark:border-gray-700">Verif.</td>
    `;
    for (let i = 1; i <= numTramos; i++) {
        for (let pos = 0; pos < 3; pos++) {
            const td = document.createElement("td");
            td.className = "px-2 py-2 text-center font-bold text-xs border-r border-gray-200 dark:border-gray-700";
            td.id = `cell_${sectionType}_t${i}_p${pos}_verif_summary`;
            td.textContent = "NO CUMPLE"; // Default state before calculation
            td.className += " bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400";
            trVerifSummary.appendChild(td);
        }
    }
    summaryContainer.appendChild(trVerifSummary);

    table.appendChild(summaryContainer);

    tableWrapper.appendChild(table);
    container.appendChild(tableWrapper);
};

// 5. Verification


