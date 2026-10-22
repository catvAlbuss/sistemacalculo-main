import { GENERAL_STEEL_OPTIONS } from '../config/steelOptions.js';

// Áreas nominales en cm², compartidas por los dos módulos de vigas.
export const BAR_SIZES = [
    ['6mm', 0.283], ['8mm', 0.503], ['3/8"', 0.713],
    ['12mm', 1.131], ['1/2"', 1.267], ['5/8"', 1.979],
    ['3/4"', 2.850], ['1"', 5.067], ['1 3/8"', 10.06],
];

export function steelArea(counts) {
    return BAR_SIZES.reduce((sum, [, area], index) => {
        const count = Number(counts[index] ?? 0);
        if (!Number.isSafeInteger(count) || count < 0) {
            throw new RangeError('Ingrese cantidades enteras mayores o iguales a cero.');
        }
        return sum + count * area;
    }, 0);
}

export function createSteelEditor(onChange, label = 'Combinación de acero', options = GENERAL_STEEL_OPTIONS) {
    const editor = document.createElement('div');
    editor.className = 'text-xs text-gray-900 dark:text-white';
    editor.classList.add('steel-combination-editor');
    const select = document.createElement('select');
    select.setAttribute('aria-label', label);
    select.className = 'w-full text-xs p-1 rounded border border-gray-300 bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500';
    for (const { value, text } of [...options, { value: 'custom', text: 'Combinación personalizada…' }]) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        select.appendChild(option);
    }
    const customPanel = document.createElement('div');
    customPanel.hidden = true;
    const table = document.createElement('table');
    table.className = 'w-full text-left';
    table.innerHTML = '<thead><tr><th>Diámetro</th><th>Área cm²</th><th>Cantidad</th></tr></thead>';
    const body = document.createElement('tbody');
    const inputs = BAR_SIZES.map(([diameter, area]) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${diameter}</td><td>${area.toFixed(3)}</td>`;
        const cell = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.step = '1';
        input.value = '0';
        input.disabled = true;
        input.setAttribute('aria-label', `${label}: cantidad de barras ${diameter}`);
        input.className = 'w-20 p-1 rounded border border-gray-300 bg-gray-50 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white';
        cell.appendChild(input);
        row.appendChild(cell);
        body.appendChild(row);
        return input;
    });
    table.appendChild(body);
    const total = document.createElement('div');
    total.className = 'font-bold py-2';
    total.setAttribute('aria-live', 'polite');
    total.textContent = 'Área acumulada: 0.00 cm²';
    customPanel.append(table, total);
    editor.append(select, customPanel);

    const updateCustom = () => {
        let valid = true;
        inputs.forEach(input => {
            const count = Number(input.value);
            const ok = Number.isSafeInteger(count) && count >= 0;
            input.setCustomValidity(ok ? '' : 'Ingrese una cantidad entera mayor o igual a cero.');
            valid = valid && ok;
        });
        // Invalid edits clear the contributed area so previous results cannot remain valid.
        const area = valid ? steelArea(inputs.map(input => input.value)) : 0;
        total.textContent = valid ? `Área acumulada: ${area.toFixed(2)} cm²` : 'Revise las cantidades ingresadas';
        onChange(area);
    };
    customPanel.addEventListener('input', updateCustom);
    select.addEventListener('change', () => {
        const custom = select.value === 'custom';
        customPanel.hidden = !custom;
        inputs.forEach(input => { input.disabled = !custom; });
        if (custom) {
            updateCustom();
        } else {
            onChange(Number(select.value));
        }
    });
    return editor;
}
