// js/cad/menus/define-menu.js

import { openMaterialDialog } from '../dialogs/material-dialog.js';
import { openSectionDialog } from '../dialogs/section-dialog.js';
import { openLoadCaseDialog } from '../dialogs/loadcase-dialog.js';
import { openCombinationDialog } from '../dialogs/combination-dialog.js';
import { openMassSourceDialog } from '../dialogs/mass-source-dialog.js';

export const defineMenu = {
    name: 'define',
    label: 'Define',
    
    getContent(cadSystem) {
        return `
            <div class="py-1">
                <div class="dropdown-header">Propiedades de Material</div>
                <button class="dropdown-item" @click="cadSystem.openMaterialProperties()">
                    🧪 Material Properties...
                </button>
                
                <div class="dropdown-divider"></div>
                <div class="dropdown-header">Secciones</div>
                <button class="dropdown-item" @click="cadSystem.openFrameSections()">
                    📐 Frame Sections...
                </button>
                <button class="dropdown-item" @click="cadSystem.openWallSlabSections()">
                    🧱 Wall/Slab/Deck Sections...
                </button>
                <button class="dropdown-item" @click="cadSystem.openLinkProperties()">
                    🔗 Link Properties...
                </button>
                <button class="dropdown-item" @click="cadSystem.openHingeProperties()">
                    🌀 Frame Nonlinear Hinge Properties...
                </button>
                
                <div class="dropdown-divider"></div>
                <div class="dropdown-header">Elementos Estructurales</div>
                <button class="dropdown-item" @click="cadSystem.openDiaphragms()">
                    🏢 Diaphragms...
                </button>
                <button class="dropdown-item" @click="cadSystem.openGroups()">
                    👥 Groups...
                </button>
                <button class="dropdown-item" @click="cadSystem.openSectionCuts()">
                    ✂️ Section Cuts...
                </button>
                
                <div class="dropdown-divider"></div>
                <div class="dropdown-header">Funciones de Carga</div>
                <button class="dropdown-item" @click="cadSystem.openResponseSpectrumFunctions()">
                    📊 Response Spectrum Functions...
                </button>
                <button class="dropdown-item" @click="cadSystem.openTimeHistoryFunctions()">
                    ⏱️ Time History Functions...
                </button>
                
                <div class="dropdown-divider"></div>
                <div class="dropdown-header">Casos de Carga</div>
                <button class="dropdown-item" @click="cadSystem.openLoadCases()">
                    ⚖️ Static Load Cases...
                </button>
                <button class="dropdown-item" @click="cadSystem.openResponseSpectrumCases()">
                    🌊 Response Spectrum Cases...
                </button>
                <button class="dropdown-item" @click="cadSystem.openTimeHistoryCases()">
                    📈 Time History Cases...
                </button>
                <button class="dropdown-item" @click="cadSystem.openPushoverCases()">
                    📉 Static Nonlinear/Pushover Cases...
                </button>
                <button class="dropdown-item" @click="cadSystem.openSequentialConstruction()">
                    🏗️ Add Sequential Construction Case
                </button>
                
                <div class="dropdown-divider"></div>
                <div class="dropdown-header">Combinaciones</div>
                <button class="dropdown-item" @click="cadSystem.openLoadCombinations()">
                    🔢 Load Combinations...
                </button>
                <button class="dropdown-item" @click="cadSystem.addDefaultDesignCombos()">
                    📋 Add Default Design Combos...
                </button>
                <button class="dropdown-item" @click="cadSystem.convertCombosToNonlinear()">
                    🔄 Convert Combos to Nonlinear Cases...
                </button>
                <button class="dropdown-item" @click="cadSystem.openSeismicEffects()">
                    🌍 Special Seismic Load Effects...
                </button>
                
                <div class="dropdown-divider"></div>
                <div class="dropdown-header">Masa</div>
                <button class="dropdown-item" @click="cadSystem.openMassSource()">
                    ⚖️ Mass Source...
                </button>
            </div>
        `;
    },
    
    // Métodos específicos del menú Define
    handlers: {
        openMaterialProperties: (cadSystem) => openMaterialDialog(cadSystem),
        openFrameSections: (cadSystem) => openSectionDialog(cadSystem),
        openWallSlabSections: (cadSystem) => cadSystem.showMessage('🧱 Wall/Slab/Deck Sections - Próximamente'),
        openLinkProperties: (cadSystem) => cadSystem.showMessage('🔗 Link Properties - Próximamente'),
        openHingeProperties: (cadSystem) => cadSystem.showMessage('🌀 Frame Nonlinear Hinge Properties - Próximamente'),
        openDiaphragms: (cadSystem) => cadSystem.showMessage('🏢 Diaphragms - Próximamente'),
        openGroups: (cadSystem) => cadSystem.showMessage('👥 Groups - Próximamente'),
        openSectionCuts: (cadSystem) => cadSystem.showMessage('✂️ Section Cuts - Próximamente'),
        openResponseSpectrumFunctions: (cadSystem) => cadSystem.showMessage('📊 Response Spectrum Functions - Próximamente'),
        openTimeHistoryFunctions: (cadSystem) => cadSystem.showMessage('⏱️ Time History Functions - Próximamente'),
        openLoadCases: (cadSystem) => openLoadCaseDialog(cadSystem),
        openResponseSpectrumCases: (cadSystem) => cadSystem.showMessage('🌊 Response Spectrum Cases - Próximamente'),
        openTimeHistoryCases: (cadSystem) => cadSystem.showMessage('📈 Time History Cases - Próximamente'),
        openPushoverCases: (cadSystem) => cadSystem.showMessage('📉 Static Nonlinear/Pushover Cases - Próximamente'),
        openSequentialConstruction: (cadSystem) => cadSystem.showMessage('🏗️ Add Sequential Construction Case - Próximamente'),
        openLoadCombinations: (cadSystem) => openCombinationDialog(cadSystem),
        addDefaultDesignCombos: (cadSystem) => cadSystem.addDefaultDesignCombos(),
        convertCombosToNonlinear: (cadSystem) => cadSystem.showMessage('🔄 Convert Combos to Nonlinear Cases - Próximamente'),
        openSeismicEffects: (cadSystem) => cadSystem.showMessage('🌍 Special Seismic Load Effects - Próximamente'),
        openMassSource: (cadSystem) => openMassSourceDialog(cadSystem),
    }
};