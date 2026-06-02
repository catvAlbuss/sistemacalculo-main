const controlClass = [
    "h-[38px]",
    "rounded",
    "border",
    "border-gray-300",
    "bg-white",
    "p-2",
    "text-sm",
    "text-gray-800",
    "shadow-inner",
    "transition-all",
    "focus:border-blue-500",
    "focus:outline-none",
    "focus:ring-1",
    "focus:ring-blue-500/50",
    "dark:border-gray-600",
    "dark:bg-gray-700",
    "dark:text-gray-200",
].join(" ");

const labelClass = "text-[9px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400";
const unitClass = "rounded border border-gray-200 bg-gray-50 px-1 py-0.5 text-[8px] text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400";
const tableHeaderClass = "border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/60";
const thBaseClass = "px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400";

export function renderCustomInputs(containerId, fields, prefix = "A") {
    let html = "";

    fields.forEach((field, index) => {
        let inputHtml = "";

        if (field.type === "select") {
            const optionsStr = field.options.map((opt) => `<option value="${opt}">${opt}</option>`).join("");
            inputHtml = `<select id="in-${prefix}-${index}" class="${controlClass} cursor-pointer">${optionsStr}</select>`;
        } else {
            inputHtml = `<input id="in-${prefix}-${index}" type="number" class="${controlClass}">`;
        }

        html += `
            <div class="flex flex-col">
                <div class="mb-1 flex items-end justify-between">
                    <label class="${labelClass}">${field.label}</label>
                    <span class="${unitClass}">${field.unit}</span>
                </div>
                ${inputHtml}
            </div>
        `;
    });

    document.getElementById(containerId).innerHTML = html;
}

export function renderCustomOutputs(containerId, fields, prefix = "A") {
    let html = `
        <table class="w-full border-collapse font-sans">
            <thead>
                <tr class="${tableHeaderClass}">
                    <th class="${thBaseClass} text-left">Descripción</th>
                    <th class="${thBaseClass} text-center">Simb.</th>
                    <th class="${thBaseClass} text-right">Valor</th>
                </tr>
            </thead>
            <tbody>
    `;

    fields.forEach((field, index) => {
        html += `
                <tr class="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700/60 dark:hover:bg-gray-700/30">
                    <td class="px-4 py-3 text-xs font-medium text-gray-700 dark:text-gray-300">${field.label}</td>
                    <td class="px-4 py-3 text-center text-xs text-gray-500 dark:text-gray-400">${field.simbolo || "-"}</td>
                    <td class="px-4 py-3 text-right">
                        <div class="flex items-baseline justify-end gap-2">
                            <span id="out-${prefix}-${index}" class="text-sm font-bold text-gray-900 dark:text-white">0.00</span>
                            <span class="text-[9px] font-normal text-gray-500 dark:text-gray-400">${field.unit}</span>
                        </div>
                    </td>
                </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    document.getElementById(containerId).innerHTML = html;
}

export function renderGenericInputs(containerId, prefix, count) {
    let html = "";

    for (let i = 1; i <= count; i++) {
        html += `
            <div class="flex flex-col">
                <div class="mb-1 flex items-end justify-between">
                    <label class="${labelClass}">Dato ${prefix}${i}</label>
                    <span class="${unitClass}">-</span>
                </div>
                <input type="text" class="${controlClass}">
            </div>
        `;
    }

    document.getElementById(containerId).innerHTML = html;
}

export function renderGenericOutputs(containerId, prefix, count) {
    let html = "";

    for (let i = 1; i <= count; i++) {
        html += `
            <tr class="border-b border-gray-100 dark:border-gray-700/60">
                <td class="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">Salida ${prefix}${i}</td>
                <td class="px-4 py-3 text-center text-xs text-gray-500 dark:text-gray-400">-</td>
                <td class="px-4 py-3 text-right">
                    <span class="text-sm font-bold text-gray-900 dark:text-white">0.00</span>
                </td>
            </tr>
        `;
    }

    const container = document.getElementById(containerId);
    if (!container) return;

    const existingTable = container.querySelector("table");
    if (existingTable) {
        existingTable.querySelector("tbody").insertAdjacentHTML("beforeend", html);
        return;
    }

    container.innerHTML = `
        <table class="w-full border-collapse font-sans">
            <thead>
                <tr class="${tableHeaderClass}">
                    <th class="${thBaseClass} text-left">Descripción</th>
                    <th class="${thBaseClass} text-center">Simb.</th>
                    <th class="${thBaseClass} text-right">Valor</th>
                </tr>
            </thead>
            <tbody>${html}</tbody>
        </table>
    `;
}
