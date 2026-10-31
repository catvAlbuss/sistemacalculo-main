<div class="wall-workflow">
    <nav class="wall-tabs" aria-label="Etapas del diseño de contención">
        <template x-for="tab in tabs" :key="tab.id">
            <button type="button" @click="changeTab(tab.id)"
                :disabled="getTabStatus(tab.id) === 'locked'"
                :aria-current="activeTab === tab.id ? 'step' : null"
                :title="getTabStatus(tab.id) === 'locked' ? 'Completa la etapa anterior para continuar' : tab.description">
                <i :class="`fa-solid ${tab.icon}`" aria-hidden="true"></i>
                <span x-text="tab.name"></span>
                <i x-show="getTabStatus(tab.id) === 'locked'" class="fas fa-lock" aria-hidden="true"></i>
                <i x-show="getTabStatus(tab.id) === 'completed'" class="fas fa-check" aria-hidden="true"></i>
            </button>
        </template>
    </nav>
    <div class="wall-stage-heading">
        <div>
            <h2 x-text="tabs.find(tab => tab.id === activeTab)?.name"></h2>
            <p x-text="tabs.find(tab => tab.id === activeTab)?.description"></p>
        </div>
        <span>Datos · Análisis · Resultados</span>
    </div>
</div>
