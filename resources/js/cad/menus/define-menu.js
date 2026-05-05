// js/cad/menus/define-menu.js
import { openMaterialDialog } from "../dialogs/material-dialog.js";
import { openSectionDialog } from "../dialogs/section-dialog.js";
import { openLoadCaseDialog } from "../dialogs/loadcase-dialog.js";
import { openCombinationDialog } from "../dialogs/combination-dialog.js";
import { openMassSourceDialog } from "../dialogs/mass-source-dialog.js";

export const defineMenu = {
  name: "define",
  label: "Define",

  getContent(cadSystem) {
    return `
            <div class="py-1">
                <div class="dropdown-header">Propiedades de Materiales</div>
                <button class="dropdown-item" @click="cadSystem.openMaterialProperties()">
                    🧪 Propiedades de Materiales...
                </button>
                
                <div class="dropdown-divider"></div>
                <div class="dropdown-header">Secciones</div>
                <button class="dropdown-item" @click="cadSystem.openFrameSections()">
                    📐 Secciones de Elementos Frame...
                </button>
                <button class="dropdown-item" @click="cadSystem.openWallSlabSections()">
                    🧱 Secciones de Muro/Losa/Deck...
                </button>
                <button class="dropdown-item" @click="cadSystem.openLinkProperties()">
                    🔗 Propiedades de Enlace (Link)...
                </button>
                <button class="dropdown-item" @click="cadSystem.openHingeProperties()">
                    🌀 Propiedades de Rótulas No Lineales...
                </button>
                
                <div class="dropdown-divider"></div>
                <div class="dropdown-header">Elementos Estructurales</div>
                <button class="dropdown-item" @click="cadSystem.openDiaphragms()">
                    🏢 Diafragmas...
                </button>
                <button class="dropdown-item" @click="cadSystem.openGroups()">
                    👥 Grupos...
                </button>
                <button class="dropdown-item" @click="cadSystem.openSectionCuts()">
                    ✂️ Cortes de Sección...
                </button>
                
                <div class="dropdown-divider"></div>
                <div class="dropdown-header">Funciones de Carga</div>
                <button class="dropdown-item" @click="cadSystem.openResponseSpectrumFunctions()">
                    📊 Funciones de Espectro de Respuesta...
                </button>
                <button class="dropdown-item" @click="cadSystem.openTimeHistoryFunctions()">
                    ⏱️ Funciones de Acelerograma (Time History)...
                </button>
                
                <div class="dropdown-divider"></div>
                <div class="dropdown-header">Casos de Carga</div>
                <button class="dropdown-item" @click="cadSystem.openLoadCases()">
                    ⚖️ Casos de Carga Estática...
                </button>
                <button class="dropdown-item" @click="cadSystem.openResponseSpectrumCases()">
                    🌊 Casos de Espectro de Respuesta...
                </button>
                <button class="dropdown-item" @click="cadSystem.openTimeHistoryCases()">
                    📈 Casos de Acelerograma (Time History)...
                </button>
                <button class="dropdown-item" @click="cadSystem.openPushoverCases()">
                    📉 Casos de Análisis No Lineal Estático (Pushover)...
                </button>
                <button class="dropdown-item" @click="cadSystem.openSequentialConstruction()">
                    🏗️ Añadir Caso de Construcción Secuencial
                </button>
                
                <div class="dropdown-divider"></div>
                <div class="dropdown-header">Combinaciones</div>
                <button class="dropdown-item" @click="cadSystem.openLoadCombinations()">
                    🔢 Combinaciones de Carga...
                </button>
                <button class="dropdown-item" @click="cadSystem.addDefaultDesignCombos()">
                    📋 Añadir Combos de Diseño por Defecto...
                </button>
                <button class="dropdown-item" @click="cadSystem.convertCombosToNonlinear()">
                    🔄 Convertir Combos a Casos No Lineales...
                </button>
                <button class="dropdown-item" @click="cadSystem.openSeismicEffects()">
                    🌍 Efectos Especiales de Carga Sísmica...
                </button>
                
                <div class="dropdown-divider"></div>
                <div class="dropdown-header">Masa</div>
                <button class="dropdown-item" @click="cadSystem.openMassSource()">
                    ⚖️ Fuente de Masa...
                </button>
            </div>

        `;
  },

  // Métodos específicos del menú Define
  handlers: {
    openMaterialProperties: (cadSystem) => openMaterialDialog(cadSystem),
    openFrameSections: (cadSystem) => openSectionDialog(cadSystem),
    openWallSlabSections: (cadSystem) => cadSystem.showMessage("🧱 Wall/Slab/Deck Sections - Próximamente"),
    openLinkProperties: (cadSystem) => cadSystem.showMessage("🔗 Link Properties - Próximamente"),
    openHingeProperties: (cadSystem) => cadSystem.showMessage("🌀 Frame Nonlinear Hinge Properties - Próximamente"),
    openDiaphragms: (cadSystem) => cadSystem.showMessage("🏢 Diaphragms - Próximamente"),
    openGroups: (cadSystem) => cadSystem.showMessage("👥 Groups - Próximamente"),
    openSectionCuts: (cadSystem) => cadSystem.showMessage("✂️ Section Cuts - Próximamente"),
    openResponseSpectrumFunctions: (cadSystem) =>
      cadSystem.showMessage("📊 Response Spectrum Functions - Próximamente"),
    openTimeHistoryFunctions: (cadSystem) => cadSystem.showMessage("⏱️ Time History Functions - Próximamente"),
    openLoadCases: (cadSystem) => openLoadCaseDialog(cadSystem),
    openResponseSpectrumCases: (cadSystem) => cadSystem.showMessage("🌊 Response Spectrum Cases - Próximamente"),
    openTimeHistoryCases: (cadSystem) => cadSystem.showMessage("📈 Time History Cases - Próximamente"),
    openPushoverCases: (cadSystem) => cadSystem.showMessage("📉 Static Nonlinear/Pushover Cases - Próximamente"),
    openSequentialConstruction: (cadSystem) =>
      cadSystem.showMessage("🏗️ Add Sequential Construction Case - Próximamente"),
    openLoadCombinations: (cadSystem) => openCombinationDialog(cadSystem),
    addDefaultDesignCombos: (cadSystem) => cadSystem.addDefaultDesignCombos(),
    convertCombosToNonlinear: (cadSystem) =>
      cadSystem.showMessage("🔄 Convert Combos to Nonlinear Cases - Próximamente"),
    openSeismicEffects: (cadSystem) => cadSystem.showMessage("🌍 Special Seismic Load Effects - Próximamente"),
    openMassSource: (cadSystem) => openMassSourceDialog(cadSystem),
  },
};
