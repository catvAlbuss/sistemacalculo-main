// js/cad/dialogs/combination-dialog.js
import Swal from 'sweetalert2';

export const openCombinationDialog = async (cadSystem) => {
    const result = await Swal.fire({
        title: 'Load Combinations',
        html: getCombinationHTML(cadSystem),
        width: '650px',
        showConfirmButton: true,
        confirmButtonText: 'OK',
        didOpen: (popup) => {
            setupCombinationEvents(popup, cadSystem);
        },
    });
};

const getCombinationHTML = (cadSystem) => {
    return `
        <div class="text-left">
            <table class="w-full text-sm">
                <thead class="bg-gray-700">
                    <tr><th class="p-2">Name</th><th class="p-2">Expression</th><th></th></tr>
                </thead>
                <tbody id="combos-body">
                    ${cadSystem.loadCombinations.combinations.map((c, i) => `
                        <tr class="border-t">
                            <td class="p-1"><input class="w-28 px-1 border rounded" data-field="name" value="${c.name}"></td>
                            <td class="p-1"><input class="w-48 px-1 border rounded" data-field="expr" value="${c.expression}"></td>
                            <td class="p-1"><button class="text-red-500 delete-combo" data-index="${i}">✕</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="mt-3 flex justify-end gap-2">
                <button type="button" id="add-combo" class="bg-green-600 text-white px-3 py-1 rounded text-sm">+ Add Combination</button>
                <button type="button" id="add-default-combos" class="bg-blue-600 text-white px-3 py-1 rounded text-sm">Add Default Design Combos</button>
            </div>
        </div>
    `;
};

const setupCombinationEvents = (popup, cadSystem) => {
    popup.querySelector('#add-combo').onclick = () => {
        cadSystem.loadCombinations.combinations.push({ name: "NEW_COMBO", expression: "1.0CM + 1.0CV" });
        refreshCombinationTable(popup, cadSystem);
    };
    
    popup.querySelector('#add-default-combos').onclick = () => {
        const defaultCombos = [
            { name: "1.4CM", expression: "1.4CM" },
            { name: "1.2CM+1.6CV", expression: "1.2CM + 1.6CV" },
            { name: "0.9CM+1.0CVV-", expression: "0.9CM + 1.0CVV-" },
            { name: "1.2CM+1.0CV+1.0CVV+", expression: "1.2CM + 1.0CV + 1.0CVV+" },
        ];
        defaultCombos.forEach(c => cadSystem.loadCombinations.combinations.push(c));
        refreshCombinationTable(popup, cadSystem);
    };
    
    popup.querySelectorAll('.delete-combo').forEach(btn => {
        btn.onclick = (e) => {
            const idx = parseInt(btn.getAttribute('data-index'));
            cadSystem.loadCombinations.combinations.splice(idx, 1);
            refreshCombinationTable(popup, cadSystem);
        };
    });
};

const refreshCombinationTable = (popup, cadSystem) => {
    const tbody = popup.querySelector('#combos-body');
    tbody.innerHTML = cadSystem.loadCombinations.combinations.map((c, i) => `
        <tr class="border-t">
            <td class="p-1"><input class="w-28 px-1 border rounded" data-field="name" value="${c.name}"></td>
            <td class="p-1"><input class="w-48 px-1 border rounded" data-field="expr" value="${c.expression}"></td>
            <td class="p-1"><button class="text-red-500 delete-combo" data-index="${i}">✕</button></td>
        </tr>
    `).join('');
    
    tbody.querySelectorAll('.delete-combo').forEach(btn => {
        btn.onclick = (e) => {
            const idx = parseInt(btn.getAttribute('data-index'));
            cadSystem.loadCombinations.combinations.splice(idx, 1);
            refreshCombinationTable(popup, cadSystem);
        };
    });
};