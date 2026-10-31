import { TABS_CONFIG } from './config/tabs.js';


export function MainSystem() {
    
    return {
        activeTab: 'predimensionamiento',
        tabs: TABS_CONFIG,
        systemState: {
            predimensionamientoCalculado: false,
            dimensionamientoCalculado: false
        },

        init() {
            
            this.loadStoredState();
            this.setupEventListeners();
        },

        // ... resto del código igual que antes
        loadStoredState() {
            try {
                const storedData = localStorage.getItem('murosContencionData');
                if (storedData) {
                    const data = JSON.parse(storedData);
                    if (data.systemState) {
                        this.systemState = {
                            predimensionamientoCalculado: data.predimensionamiento?.isCalculated === true,
                            dimensionamientoCalculado: data.dimensionamiento?.isCalculated === true,
                        };
                    }
                    if (data.activeTab && this.canAccessTab(data.activeTab)) {
                        this.activeTab = data.activeTab;
                    }
                }
            } catch (error) {
                console.warn('⚠️ Error cargando estado:', error);
            }
        },

        setupEventListeners() {
            document.addEventListener('predimensionamiento-calculated', () => {
                this.systemState.predimensionamientoCalculado = true;
                this.saveState();
            });

            document.addEventListener('dimensionamiento-calculated', () => {
                this.systemState.dimensionamientoCalculado = true;
                this.saveState();
            });
        },

        saveState() {
            try {
                const currentData = this.getCurrentStoredData();
                const updatedData = {
                    ...currentData,
                    systemState: { ...currentData.systemState, ...this.systemState },
                    activeTab: this.activeTab
                };
                localStorage.setItem('murosContencionData', JSON.stringify(updatedData));
            } catch (error) {
                console.error('❌ Error guardando estado:', error);
            }
        },

        getCurrentStoredData() {
            try {
                const stored = localStorage.getItem('murosContencionData');
                return stored ? JSON.parse(stored) : {};
            } catch {
                return {};
            }
        },

        changeTab(tabId) {
            if (this.canAccessTab(tabId)) {
                this.activeTab = tabId;
                this.saveState();
            } else {
                console.warn(`🔒 Acceso denegado a tab: ${tabId}`);
                if (window.NotificationManager) {
                    window.NotificationManager.showWarning('Debe completar los pasos previos antes de acceder a esta sección');
                } else {
                    alert('Debe completar los pasos previos antes de acceder a esta sección');
                }
            }
        },

        canAccessTab(tabId) {
            const tab = this.tabs.find(t => t.id === tabId);
            if (!tab) {
                console.warn(`⚠️ Tab no encontrado: ${tabId}`);
                return false;
            }
            if (!tab.requiredState) {
                return true;
            }
            return this.systemState[tab.requiredState] === true;
        },

        getTabStatus(tabId) {
            const tab = this.tabs.find(t => t.id === tabId);
            if (!tab) return 'locked';
            
            if ((tabId === 'predimensionamiento' && this.systemState.predimensionamientoCalculado) ||
                (tabId === 'dimensionamiento' && this.systemState.dimensionamientoCalculado)) {
                return 'completed';
            }
            
            if (this.canAccessTab(tabId)) {
                return 'available';
            }
            
            return 'locked';
        }
    }
}
