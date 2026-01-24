export const renderResultTable = (containerId, data) => {
    const container = document.querySelector(containerId);
    if (!container) {
        console.error(`Container ${containerId} not found`);
        return;
    }

    // Crear tabla HTML
    const tableWrapper = document.createElement("div");
    tableWrapper.className = "mb-8 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700";

    // Titulo
    const titleDiv = document.createElement("div");
    titleDiv.className = "bg-gray-800 px-4 py-2 text-white font-bold";
    titleDiv.textContent = data.title;
    tableWrapper.appendChild(titleDiv);

    const table = document.createElement("table");
    table.className = "min-w-full divide-y divide-gray-300 dark:divide-gray-700 border-collapse"; // Added border-collapse for cleanly merged borders

    // --- HEADERS ---
    const thead = document.createElement("thead");
    thead.className = "bg-gray-700 text-white";

    // Fila 1: Headers Principales (Descripcion, Simb, TRAMO 1, TRAMO 2...)
    const headerRow1 = document.createElement("tr");

    // Columnas fijas
    const thDesc = document.createElement("th");
    thDesc.rowSpan = 2;
    thDesc.className = "px-4 py-2 text-left text-sm font-semibold uppercase tracking-wider border border-gray-600";
    thDesc.textContent = "Descripcion";
    headerRow1.appendChild(thDesc);

    const thSimb = document.createElement("th");
    thSimb.rowSpan = 2;
    thSimb.className = "px-4 py-2 text-center text-sm font-semibold uppercase tracking-wider border border-gray-600";
    thSimb.textContent = "Simb.";
    headerRow1.appendChild(thSimb);

    // Columnas de Tramos (Grupos)
    if (data.columnGroups) {
        data.columnGroups.forEach(group => {
            const thGroup = document.createElement("th");
            thGroup.colSpan = group.columns.length; // Normalmente 3 (S, M, E)
            thGroup.className = "px-4 py-2 text-center text-sm font-semibold uppercase tracking-wider border border-gray-600 bg-gray-600";
            thGroup.textContent = group.title;
            headerRow1.appendChild(thGroup);
        });
    }

    thead.appendChild(headerRow1);

    // Fila 2: Sub-headers (Start, Middle, End...)
    const headerRow2 = document.createElement("tr");
    if (data.columnGroups) {
        data.columnGroups.forEach(group => {
            group.columns.forEach(colName => {
                const thSub = document.createElement("th");
                thSub.className = "px-2 py-1 text-center text-xs font-medium uppercase tracking-wider border border-gray-600";
                thSub.textContent = colName;
                headerRow2.appendChild(thSub);
            });
        });
    }
    thead.appendChild(headerRow2);
    table.appendChild(thead);

    // --- BODY ---
    const tbody = document.createElement("tbody");
    tbody.className = "divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800";

    data.rows.forEach(row => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors";

        // Descripcion
        const tdName = document.createElement("td");
        tdName.className = "whitespace-normal px-4 py-4 text-sm font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700";
        tdName.textContent = row.name;
        tr.appendChild(tdName);

        // Simbolo
        const tdSymbol = document.createElement("td");
        tdSymbol.className = "whitespace-nowrap px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700";
        tdSymbol.textContent = row.symbol;
        tr.appendChild(tdSymbol);

        // Values
        row.values.forEach(item => {
            const td = document.createElement("td");
            td.className = "whitespace-nowrap px-2 py-4 text-center text-sm text-gray-500 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0";
            if (item) {
                td.innerHTML = `<div class="font-bold text-gray-900 dark:text-white">${item.value}</div><div class="text-xs text-gray-500">${item.unit}</div>`;
            } else {
                td.textContent = "-";
            }
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableWrapper.appendChild(table);

    container.appendChild(tableWrapper);
};

export const clearResults = (containerId) => {
    const container = document.querySelector(containerId);
    if (container) {
        container.innerHTML = "";
    }
};
