import { TABS_CONFIG } from './config/tabs.js';

console.log('📦 MainSystem.js cargando...');
console.log('📋 TABS_CONFIG:', TABS_CONFIG);

export function MainSystem() {
    console.log('🏗️ MainSystem function ejecutándose...');
    
    return {
        activeTab: 'predimensionamiento',
        tabs: TABS_CONFIG,
        systemState: {
            predimensionamientoCalculado: false,
            dimensionamientoCalculado: false
        },

        init() {
            console.log('🚀 MainSystem.init() ejecutándose...');
            console.log('📋 Tabs disponibles:', this.tabs);
            console.log('🎯 Tab activo:', this.activeTab);
            
            this.loadStoredState();
            this.setupEventListeners();
            console.log('✅ MainSystem inicializado correctamente');
        },

        // ... resto del código igual que antes
        loadStoredState() {
            try {
                const storedData = localStorage.getItem('murosContencionData');
                if (storedData) {
                    const data = JSON.parse(storedData);
                    if (data.systemState) {
                        this.systemState = { ...this.systemState, ...data.systemState };
                    }
                    if (data.activeTab && this.canAccessTab(data.activeTab)) {
                        this.activeTab = data.activeTab;
                    }
                    console.log('✅ Estado cargado desde localStorage');
                }
            } catch (error) {
                console.warn('⚠️ Error cargando estado:', error);
            }
        },

        setupEventListeners() {
            document.addEventListener('predimensionamiento-calculated', () => {
                console.log('📐 Predimensionamiento calculado');
                this.systemState.predimensionamientoCalculado = true;
                this.saveState();
            });

            document.addEventListener('dimensionamiento-calculated', () => {
                console.log('📏 Dimensionamiento calculado');
                this.systemState.dimensionamientoCalculado = true;
                this.saveState();
            });
        },

        saveState() {
            try {
                const currentData = this.getCurrentStoredData();
                const updatedData = {
                    ...currentData,
                    systemState: this.systemState,
                    activeTab: this.activeTab
                };
                localStorage.setItem('murosContencionData', JSON.stringify(updatedData));
                console.log('💾 Estado guardado');
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
            console.log(`🔄 Intentando cambiar a tab: ${tabId}`);
            if (this.canAccessTab(tabId)) {
                this.activeTab = tabId;
                this.saveState();
                console.log(`✅ Cambiado a tab: ${tabId}`);
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
            
            if (tab.requiredState && this.systemState[tab.requiredState]) {
                return 'completed';
            }
            
            if (this.canAccessTab(tabId)) {
                return 'available';
            }
            
            return 'locked';
        }
    }
}

console.log('✅ MainSystem.js cargado completamente');