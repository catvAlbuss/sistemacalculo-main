<template>
  <div class="etabs-cad-app">
    <!-- Visor CAD con su barra de herramientas nativa completa -->
    <MlCadViewer
      ref="cadViewerRef"
      locale="default"
      :background="0x1a1a2e"
      theme="dark"
      :local-file="selectedFile"
      :mode="writeMode"
      class="etabs-cad-viewer"
    />

    <!-- Dock superior derecho: botón para mostrar/ocultar el panel -->
    <div class="etabs-panel-dock">
      <button class="etabs-panel-toggle" @click="panelVisible = !panelVisible">
        <span>📋 Datos Generales</span>
        <span class="etabs-panel-caret">{{ panelVisible ? "▲" : "▼" }}</span>
      </button>

      <DatosGeneralesPanel
        v-show="panelVisible"
        @capture="onPolygonsCaptured"
        @import-excel="onImportExcel"
        @joint-reactions="onJointReactions"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { MlCadViewer } from "@mlightcad/cad-viewer";
import { AcEdOpenMode } from "@mlightcad/cad-simple-viewer";
import DatosGeneralesPanel from "./components/DatosGeneralesPanel.vue";

const cadViewerRef = ref(null);
// Se puede precargar un archivo aquí; el usuario también puede usar el menú File del visor.
const selectedFile = ref(undefined);

// Abrir con permisos de escritura para habilitar las herramientas de dibujo
const writeMode = AcEdOpenMode.Write;

const panelVisible = ref(true);

const onPolygonsCaptured = ({ polygons, df, gammaE }) => {
  console.log("📐 Polígonos capturados:", { polygons, df, gammaE });
};

// Pendiente de conexión con backend
const onImportExcel = (file) => {
  console.log("📊 Importar Excel de reacciones (pendiente backend):", file?.name);
};

const onJointReactions = () => {
  console.log("📊 Joint Reactions (pendiente backend)");
};
</script>

<style scoped>
.etabs-cad-app {
  position: relative;
  /* Deja visible la barra de navegación del sitio (nav h-16 = 4rem) */
  height: calc(100vh - 4rem);
  width: 100%;
  overflow: hidden;
  background: #1a1a2e;
}

.etabs-cad-viewer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* Dock anclado arriba a la derecha, por debajo del ribbon del visor */
.etabs-panel-dock {
  position: absolute;
  top: 140px;
  right: 12px;
  z-index: 60;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  max-height: calc(100% - 152px);
}

.etabs-panel-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border: 1px solid #334155;
  border-radius: 8px;
  background: #2563eb;
  color: #fff;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.etabs-panel-toggle:hover {
  background: #1d4ed8;
}

.etabs-panel-caret {
  font-size: 10px;
  opacity: 0.85;
}
</style>
