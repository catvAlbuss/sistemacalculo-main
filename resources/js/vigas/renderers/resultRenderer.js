const renderSingleTable = (data) => {
    // Validar que data tenga la estructura correcta
    if (!data || !data.title) {
        //console.warn("Datos incompletos para renderizar tabla:", data);
        return null;
    }

    // Si no tiene columnGroups ni rows, no se puede renderizar
    if (!data.columnGroups || !data.rows) {
        //console.warn("Tabla sin columnGroups o rows:", data.title);
        return null;
    }

    // Crear tabla HTML
    const tableWrapper = document.createElement("div");
    // Generate a safe ID from the title for reliable lookups/removal
    const safeId = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    tableWrapper.id = `result-table-${safeId}`;
    tableWrapper.className = "mb-8 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-md";

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
        // Soporte para filas de tipo "Header" (Separadores de secciones)
        if (row.isHeader) {
            const trHeader = document.createElement("tr");
            trHeader.className = "bg-gray-100 dark:bg-gray-700";

            const tdHeader = document.createElement("td");
            // Calcular colSpan total: Descripcion + Simbolo + (ColumnGroups * ColumnsPerGroup)
            let totalCols = 2; // Desc + Simb
            if (data.columnGroups) {
                data.columnGroups.forEach(g => totalCols += (g.columns ? g.columns.length : 1));
            }

            tdHeader.colSpan = totalCols;
            tdHeader.className = "px-4 py-2 text-left text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider border-b border-gray-300 dark:border-gray-600";
            tdHeader.textContent = row.name;

            trHeader.appendChild(tdHeader);
            tbody.appendChild(trHeader);
            return; // Continuar con la siguiente fila
        }

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
        if (row.values && Array.isArray(row.values)) {
            row.values.forEach(item => {
                const td = document.createElement("td");
                td.className = "whitespace-normal min-w-[100px] px-2 py-4 text-center text-sm text-gray-500 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0";
                if (item) {
                    if (item.colSpan) {
                        td.colSpan = item.colSpan;
                    }
                    td.innerHTML = `<div class="font-bold text-gray-900 dark:text-white">${item.value}</div><div class="text-xs text-gray-500">${item.unit}</div>`;
                } else {
                    td.textContent = "-";
                }
                tr.appendChild(td);
            });
        } else {
            // Fallback si no hay values para evitar errores, llenar con "-"
            const totalCols = data.columnGroups ? data.columnGroups.reduce((acc, g) => acc + (g.columns ? g.columns.length : 1), 0) : 0;
            const tdEmpty = document.createElement("td");
            tdEmpty.colSpan = totalCols;
            tdEmpty.textContent = "-";
            tr.appendChild(tdEmpty);
        }

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableWrapper.appendChild(table);

    return tableWrapper;
};

export const renderResultTable = (containerId, ...results) => {
    const container = document.querySelector(containerId);
    if (!container) {
        //console.error(`Container ${containerId} not found`);
        return;
    }

    // Filtrar resultados válidos y renderizar
    let tablesRendered = 0;
    results.forEach((data, index) => {
        if (data) {
            //console.log(`Renderizando tabla ${index + 1}:`, data.title);
            const tableElement = renderSingleTable(data);
            if (tableElement) {
                container.appendChild(tableElement);
                tablesRendered++;
            }
        }
    });

    //console.log(`Se renderizaron ${tablesRendered} tablas de ${results.length} resultados`);
};

export const clearResults = (containerId) => {
    const container = document.querySelector(containerId);
    if (container) {
        container.innerHTML = "";
    }
};
