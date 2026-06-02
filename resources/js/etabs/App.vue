<template>
  <div class="cad-viewer-page h-screen w-full relative">
    <!-- Toolbar -->
    <div class="cad-viewer-toolbar flex items-center gap-3 p-3 bg-slate-900 text-white z-20 relative">
      <label class="cursor-pointer rounded bg-slate-700 px-3 py-2 text-sm font-medium hover:bg-slate-600">
        📁 Cargar CAD
        <input type="file" accept=".dwg,.dxf" @change="onFileChange" class="hidden" />
      </label>

      <div class="w-px h-8 bg-slate-600 mx-2"></div>

      <button
        @click="activateDrawingTool('barra')"
        :class="[
          'rounded px-3 py-2 text-sm font-medium',
          drawingState === 'barra' ? 'bg-blue-600' : 'bg-blue-700 hover:bg-blue-600',
        ]"
        title="Dibujar barra"
      >
        📐 Barra
      </button>
      <button
        @click="toggleSnap"
        :class="['rounded px-3 py-2 text-sm font-medium', snapEnabled ? 'bg-green-600' : 'bg-gray-700']"
        title="Snap a grid"
      >
        🔒 Snap
      </button>
      <button
        @click="toggleGrid"
        :class="['rounded px-3 py-2 text-sm font-medium', showGrid ? 'bg-green-600' : 'bg-gray-700']"
        title="Mostrar/Ocultar grid"
      >
        🔲 Grid
      </button>
      <button
        @click="fitContent"
        class="rounded bg-purple-700 px-3 py-2 text-sm font-medium hover:bg-purple-600"
        title="Centrar contenido"
      >
        🎯 Centrar
      </button>

      <div class="w-px h-8 bg-slate-600 mx-2"></div>

      <button
        @click="calculateForces"
        class="rounded bg-yellow-700 px-3 py-2 text-sm font-medium hover:bg-yellow-600"
        title="Calcular fuerzas"
      >
        ⚡ Calcular
      </button>
      <button
        @click="generateReport"
        class="rounded bg-red-700 px-3 py-2 text-sm font-medium hover:bg-red-600"
        title="Generar reporte"
      >
        📄 Reporte
      </button>
      <button
        @click="calibrateScale"
        class="rounded bg-orange-700 px-3 py-2 text-sm font-medium hover:bg-orange-600"
        title="Calibrar escala"
      >
        📏 Calibrar
      </button>

      <button
        @click="toggleManualDrawing"
        :class="['rounded px-3 py-2 text-sm font-medium', manualDrawing ? 'bg-green-600' : 'bg-gray-700']"
      >
        ✏️ Dibujo Manual
      </button>
    </div>

    <!-- Contenedor principal -->
    <div class="cad-viewer-container relative h-[calc(100%-56px)] w-full">
      <MlCadViewer
        ref="cadViewerRef"
        locale="default"
        :background="0x1a1a2e"
        theme="dark"
        :local-file="selectedFile"
        class="cad-viewer-fullscreen"
      />
    </div>

    <div class="fixed bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-xs z-20 font-mono">
      📊 Nodos: {{ nodeCount }} | Barras: {{ beamCount }}
      <span v-if="drawingState !== 'idle'" class="ml-2 text-yellow-400"> ✏️ Dibujando... </span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { cadEngine } from "./cadEngine.js";

const cadContainerRef = ref(null);

const cadViewerRef = ref(null);
const selectedFile = ref(undefined);
const drawingState = ref("idle");
const snapEnabled = ref(true);
const showGrid = ref(true);
const nodeCount = ref(0);
const beamCount = ref(0);

let cadSys = null;
let updateInterval = null;

const onFileChange = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!["dwg", "dxf"].includes(extension)) {
    alert("Solo se permiten archivos DWG o DXF.");
    event.target.value = "";
    return;
  }

  selectedFile.value = file;

  // Activar grid cuando se carga un CAD
  showGrid.value = true;
  if (cadSys) {
    cadSys.options.showGrid = true;
  }
};

const activateDrawingTool = (tool) => {
  if (!cadSys) return;
  if (tool === "barra") {
    cadSys.setState(cadSys.trussDrawingState);
    drawingState.value = "barra";
  }
};

const toggleSnap = () => {
  snapEnabled.value = !snapEnabled.value;
  if (cadSys) cadSys.snap_enabled = snapEnabled.value;
};

const toggleGrid = () => {
  showGrid.value = !showGrid.value;
  if (cadSys) {
    cadSys.options.showGrid = showGrid.value;
    cadSys.redraw();
  }
};

const fitContent = () => {
  if (cadSys && cadSys.fitContentToScreen) cadSys.fitContentToScreen();
};

const calculateForces = () => {
  if (cadSys && cadSys.calcularFuerzas) {
    cadSys.calcularFuerzas({ preventDefault: () => {} });
  }
};

const generateReport = () => {
  if (cadSys && cadSys.generarReporte) cadSys.generarReporte();
};

const updateCounts = () => {
  if (cadSys) {
    nodeCount.value = cadSys.nodes?.length || 0;
    beamCount.value = cadSys.shapes?.length || 0;
    drawingState.value = cadSys.currentState === cadSys.trussDrawingState ? "barra" : "idle";
  }
};

let isCadSysInitialized = false;

const connectToCadSys = () => {
  if (isCadSysInitialized) return;

  const alpineElement = document.getElementById("alpine-cadsys-container");

  if (alpineElement && alpineElement._x_dataStack) {
    cadSys = alpineElement._x_dataStack[0];

    if (cadSys && cadSys.initSys && !isCadSysInitialized) {
      isCadSysInitialized = true;

      cadSys.initSys(null, null);

      const cadCanvas = document.querySelector(".ml-cad-container canvas");
      if (cadCanvas) {
        cadCanvas.addEventListener("click", onCadCanvasClick);
      }

      // Si el motor ya está inicializado, conectar ahora
      if (cadEngine && cadEngine.docManager) {
        cadSys.connectEngine(cadEngine);
      }

      updateInterval = setInterval(updateCounts, 500);
      console.log("✅ cadSys inicializado sobre canvas del CAD");
    }
  } else {
    setTimeout(connectToCadSys, 500);
  }
};

const calibrateScale = () => {
  if (!cadSys || !cadSys.cadEngine) return;

  // Obtener dos puntos de referencia del CAD
  // Por ahora, usamos un factor de escala estimado
  const estimatedScale = 1000; // 1 metro = 1000 unidades CAD (mm)

  cadSys.calibrationFactor = estimatedScale;
  console.log(`Escala calibrada: 1 metro = ${estimatedScale} unidades CAD`);
};

// Estado para dibujo manual
const manualDrawing = ref(false);
let lastNode = null;

const toggleManualDrawing = () => {
  manualDrawing.value = !manualDrawing.value;
  if (manualDrawing.value) {
    lastNode = null;
    alert("Modo dibujo manual activado. Haz clic para crear nodos y vigas.");
  } else {
    alert("Modo dibujo manual desactivado.");
  }
};

// Función que se llamará desde el evento click del canvas del CAD
const onCadCanvasClick = (event) => {
  if (!manualDrawing.value) return;
  if (!cadSys) return;

  // Obtener coordenadas del mouse en el canvas del CAD (evento original)
  const rect = event.target.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const worldPos = cadSys.screenToWorld({ x, y });
  console.log("Click manual en mundo:", worldPos);

  // Crear nuevo nodo
  const newNode = {
    id: cadSys.nodes.length + 1,
    position: { x: worldPos.x, y: worldPos.y },
    beams: [],
  };
  cadSys.nodes.push(newNode);

  // Si hay nodo anterior, crear viga
  if (lastNode) {
    const beam = {
      id: cadSys.shapes.length + 1,
      node1: lastNode,
      node2: newNode,
      length: Math.hypot(worldPos.x - lastNode.position.x, worldPos.y - lastNode.position.y),
    };
    cadSys.shapes.push(beam);
    lastNode.beams.push(beam);
    newNode.beams.push(beam);
  }
  lastNode = newNode;
  cadSys.redraw();
};

onMounted(() => {
  // Inicializar motor CAD
  setTimeout(() => {
    const container = document.querySelector(".ml-cad-viewer-container");
    if (container) {
      cadEngine.init(container);
      console.log("✅ Motor CAD inicializado desde App.vue");

      // Conectar cadSys con el motor
      if (cadSys) {
        cadSys.connectEngine(cadEngine);
        console.log("✅ cadSys conectado al motor CAD");
      }
    }
  }, 1000);

  // Conectar cadSys cuando esté listo
  setTimeout(connectToCadSys, 500);
});

onUnmounted(() => {
  const cadCanvas = document.querySelector(".ml-cad-container canvas");
  if (cadCanvas) {
    cadCanvas.removeEventListener("click", onCadCanvasClick);
  }
  if (updateInterval) clearInterval(updateInterval);
  // Limpiar el intervalo de sincronización si existe
  if (cadSys && cadSys.syncInterval) {
    clearInterval(cadSys.syncInterval);
  }
});
</script>

<style>
.cad-viewer-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.cad-viewer-container {
  position: relative;
  flex: 1;
  overflow: hidden;
  background: #1a1a2e;
}

.cad-viewer-fullscreen {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  z-index: 1 !important;
}

/* Ocultar UI del CAD */
.ml-cad-header,
.ml-ribbon-toolbar-container,
.ml-vertical-toolbar-container,
.ml-cad-footer,
.ml-status-bar,
.ml-cli-container,
.ml-ribbon,
header,
footer,
[class*="ml-ribbon"],
[class*="ml-toolbar"] {
  display: none !important;
}

/* El canvas del CAD debe recibir eventos para dibujar */
.ml-cad-container canvas {
  /* cursor: crosshair !important;
  pointer-events: auto !important; */
  touch-action: none !important;
}

.cad-viewer-toolbar {
  z-index: 20;
  position: relative;
}

/* El canvas del CAD debe recibir eventos para zoom/pan y dibujo */
.ml-cad-container canvas {
  cursor: crosshair !important;
  pointer-events: auto !important;
}

/* Ocultar UI del CAD */
.ml-cad-header,
.ml-ribbon-toolbar-container,
.ml-vertical-toolbar-container,
.ml-cad-footer,
.ml-status-bar,
.ml-cli-container,
.ml-ribbon,
header,
footer,
[class*="ml-ribbon"],
[class*="ml-toolbar"] {
  display: none !important;
}

/* Canvas overlay para dibujo */
#drawing-overlay-canvas {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  background: transparent !important;
  pointer-events: none !important;
  z-index: 20 !important;
}
</style>
