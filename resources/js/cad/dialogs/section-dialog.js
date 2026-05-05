// js/cad/dialogs/section-dialog.js
import Swal from 'sweetalert2';

export const openSectionDialog = async (cadSystem) => {
    if (cadSystem.frameSections.sections.length === 0) {
        cadSystem.frameSections.sections = getDefaultSections();
    }

    const result = await Swal.fire({
        title: 'Frame Sections',
        html: getSectionDialogHTML(cadSystem),
        width: '650px',
        showConfirmButton: true,
        confirmButtonText: 'OK',
        didOpen: (popup) => {
            setupSectionDialogEvents(popup, cadSystem);
        },
    });
};

const getDefaultSections = () => {
    return [
        { name: "25x25-1.5", width: 25, height: 25, thickness: 1.5, material: "MAT1", color: "#88aaff" },
        { name: "30x30-2.0", width: 30, height: 30, thickness: 2.0, material: "MAT1", color: "#88aaff" },
        { name: "IPE200", shape: "I", height: 200, width: 100, webThick: 5.6, flangeThick: 8.5, material: "ACERO", color: "#ff8888" },
    ];
};

const getSectionDialogHTML = (cadSystem) => {
    return `
        <div class="text-left">
            <div class="grid grid-cols-3 gap-3 mb-4">
                <div>
                    <label class="block text-xs">Section Name</label>
                    <input id="sec-name" class="w-full px-2 py-1 border rounded text-sm" placeholder="Ej: 25x25-1.5">
                </div>
                <div>
                    <label class="block text-xs">Material</label>
                    <select id="sec-material" class="w-full px-2 py-1 border rounded text-sm">
                        ${cadSystem.materialProperties.materials.map(m => `<option value="${m.name}">${m.name}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-xs">Shape</label>
                    <select id="sec-shape" class="w-full px-2 py-1 border rounded text-sm">
                        <option value="rectangular">Rectangular</option>
                        <option value="circular">Circular</option>
                        <option value="I">I Section</option>
                        <option value="box">Box Section</option>
                    </select>
                </div>
            </div>
            
            <div id="rectangular-fields" class="grid grid-cols-2 gap-3 mb-3">
                <div><label class="text-xs">Width (cm)</label><input id="sec-width" class="w-full px-2 py-1 border rounded text-sm" value="25"></div>
                <div><label class="text-xs">Height (cm)</label><input id="sec-height" class="w-full px-2 py-1 border rounded text-sm" value="25"></div>
                <div><label class="text-xs">Thickness (cm)</label><input id="sec-thick" class="w-full px-2 py-1 border rounded text-sm" value="1.5"></div>
            </div>
            
            <div class="flex justify-end gap-2">
                <button type="button" id="btn-add-section" class="bg-green-600 text-white px-3 py-1 rounded text-sm">+ Add Section</button>
            </div>
            
            <div class="mt-3 max-h-40 overflow-y-auto border rounded">
                <table class="w-full text-xs">
                    <thead class="bg-gray-700">
                        <tr><th class="p-1">Name</th><th class="p-1">Material</th><th class="p-1">Dimensions</th><th class="p-1"></th></tr>
                    </thead>
                    <tbody id="section-list-body">
                        ${cadSystem.frameSections.sections.map(sec => `
                            <tr class="border-t">
                                <td class="p-1">${sec.name}</td>
                                <td class="p-1">${sec.material}</td>
                                <td class="p-1">${sec.width ? sec.width + 'x' + sec.height : sec.shape}</td>
                                <td class="p-1"><button class="text-red-500 delete-section" data-name="${sec.name}">✕</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
};

const setupSectionDialogEvents = (popup, cadSystem) => {
    popup.querySelector('#btn-add-section').onclick = () => {
        const newSection = {
            name: popup.querySelector('#sec-name').value,
            material: popup.querySelector('#sec-material').value,
            shape: popup.querySelector('#sec-shape').value,
            width: parseFloat(popup.querySelector('#sec-width')?.value || 0),
            height: parseFloat(popup.querySelector('#sec-height')?.value || 0),
            thickness: parseFloat(popup.querySelector('#sec-thick')?.value || 0),
            color: "#88aaff",
        };
        
        if (!newSection.name) {
            Swal.showValidationMessage('El nombre de la sección es requerido');
            return;
        }
        
        cadSystem.frameSections.sections.push(newSection);
        refreshSectionTable(popup, cadSystem);
    };
    
    popup.querySelectorAll('.delete-section').forEach(btn => {
        btn.onclick = (e) => {
            const name = btn.getAttribute('data-name');
            cadSystem.frameSections.sections = cadSystem.frameSections.sections.filter(s => s.name !== name);
            refreshSectionTable(popup, cadSystem);
        };
    });
};

const refreshSectionTable = (popup, cadSystem) => {
    const tbody = popup.querySelector('#section-list-body');
    tbody.innerHTML = cadSystem.frameSections.sections.map(sec => `
        <tr class="border-t">
            <td class="p-1">${sec.name}</td>
            <td class="p-1">${sec.material}</td>
            <td class="p-1">${sec.width ? sec.width + 'x' + sec.height : sec.shape}</td>
            <td class="p-1"><button class="text-red-500 delete-section" data-name="${sec.name}">✕</button></td>
        </tr>
    `).join('');
    
    tbody.querySelectorAll('.delete-section').forEach(btn => {
        btn.onclick = (e) => {
            const name = btn.getAttribute('data-name');
            cadSystem.frameSections.sections = cadSystem.frameSections.sections.filter(s => s.name !== name);
            refreshSectionTable(popup, cadSystem);
        };
    });
};