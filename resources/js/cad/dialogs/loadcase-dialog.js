// js/cad/dialogs/loadcase-dialog.js
import Swal from 'sweetalert2';

export const openLoadCaseDialog = async (cadSystem) => {
    const result = await Swal.fire({
        title: 'Static Load Cases',
        html: getLoadCaseHTML(cadSystem),
        width: '650px',
        showConfirmButton: true,
        confirmButtonText: 'OK',
        didOpen: (popup) => {
            setupLoadCaseEvents(popup, cadSystem);
        },
    });
    
    if (result.isConfirmed) {
        cadSystem.showMessage(`✅ Casos de carga: ${cadSystem.loadCases.cases.length} definidos`);
    }
};

const getLoadCaseHTML = (cadSystem) => {
    return `
        <div class="text-left">
            <table class="w-full text-sm">
                <thead class="bg-gray-700">
                    <tr><th class="p-2">Name</th><th class="p-2">Type</th><th class="p-2">Self Weight</th><th class="p-2">Multiplier</th><th></th></tr>
                </thead>
                <tbody id="loadcases-body">
                    ${cadSystem.loadCases.cases.map((c, i) => `
                        <tr class="border-t">
                            <td class="p-1"><input class="w-20 px-1 border rounded" data-field="name" value="${c.name}"></td>
                            <td class="p-1">
                                <select class="border rounded px-1" data-field="type">
                                    <option ${c.type === 'Dead' ? 'selected' : ''}>Dead</option>
                                    <option ${c.type === 'Live' ? 'selected' : ''}>Live</option>
                                    <option ${c.type === 'Wind' ? 'selected' : ''}>Wind</option>
                                    <option ${c.type === 'Snow' ? 'selected' : ''}>Snow</option>
                                </select>
                            </td>
                            <td class="p-1 text-center"><input type="checkbox" data-field="selfWeight" ${c.selfWeight ? 'checked' : ''}></td>
                            <td class="p-1"><input class="w-16 px-1 border rounded" data-field="value" type="number" step="0.1" value="${c.value}"></td>
                            <td class="p-1"><button class="text-red-500 delete-loadcase" data-index="${i}">✕</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="mt-3 flex justify-end">
                <button type="button" id="add-loadcase" class="bg-green-600 text-white px-3 py-1 rounded text-sm">+ Add Load Case</button>
            </div>
        </div>
    `;
};

const setupLoadCaseEvents = (popup, cadSystem) => {
    let caseCount = cadSystem.loadCases.cases.length;
    
    popup.querySelector('#add-loadcase').onclick = () => {
        cadSystem.loadCases.cases.push({ name: `NEW${++caseCount}`, type: "Live", selfWeight: false, value: 1.0 });
        refreshLoadCaseTable(popup, cadSystem);
    };
    
    popup.querySelectorAll('.delete-loadcase').forEach(btn => {
        btn.onclick = (e) => {
            const idx = parseInt(btn.getAttribute('data-index'));
            cadSystem.loadCases.cases.splice(idx, 1);
            refreshLoadCaseTable(popup, cadSystem);
        };
    });
};

const refreshLoadCaseTable = (popup, cadSystem) => {
    const tbody = popup.querySelector('#loadcases-body');
    tbody.innerHTML = cadSystem.loadCases.cases.map((c, i) => `
        <tr class="border-t">
            <td class="p-1"><input class="w-20 px-1 border rounded" data-field="name" value="${c.name}"></td>
            <td class="p-1">
                <select class="border rounded px-1" data-field="type">
                    <option ${c.type === 'Dead' ? 'selected' : ''}>Dead</option>
                    <option ${c.type === 'Live' ? 'selected' : ''}>Live</option>
                    <option ${c.type === 'Wind' ? 'selected' : ''}>Wind</option>
                    <option ${c.type === 'Snow' ? 'selected' : ''}>Snow</option>
                </select>
            </td>
            <td class="p-1 text-center"><input type="checkbox" data-field="selfWeight" ${c.selfWeight ? 'checked' : ''}></td>
            <td class="p-1"><input class="w-16 px-1 border rounded" data-field="value" type="number" step="0.1" value="${c.value}"></td>
            <td class="p-1"><button class="text-red-500 delete-loadcase" data-index="${i}">✕</button></td>
        </tr>
    `).join('');
    
    tbody.querySelectorAll('.delete-loadcase').forEach(btn => {
        btn.onclick = (e) => {
            const idx = parseInt(btn.getAttribute('data-index'));
            cadSystem.loadCases.cases.splice(idx, 1);
            refreshLoadCaseTable(popup, cadSystem);
        };
    });
};