<template>
  <div class="cad-viewer-page h-screen w-full">
    <div class="cad-viewer-toolbar flex items-center gap-3 p-3 bg-slate-900 text-white">
      <label class="cursor-pointer rounded bg-slate-700 px-3 py-2 text-sm font-medium hover:bg-slate-600">
        Seleccionar DWG/DXF
        <input
          type="file"
          accept=".dwg,.dxf"
          @change="onFileChange"
          class="hidden"
        />
      </label>
      <div class="flex-1 text-sm text-slate-200">
        <span v-if="fileName">Archivo seleccionado: {{ fileName }}</span>
        <span v-else>Selecciona un archivo DWG o DXF para cargar en el visor.</span>
      </div>
      <button
        v-if="selectedFile"
        @click="clearFile"
        class="rounded bg-slate-700 px-3 py-2 text-sm font-medium hover:bg-slate-600"
      >
        Limpiar
      </button>
    </div>

    <div class="cad-viewer-container h-[calc(100%-56px)] w-full">
      <MlCadViewer
        locale="es"
        :background="0x808080"
        theme="dark"
        :local-file="selectedFile"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const selectedFile = ref(undefined)
const fileName = ref('')

const onFileChange = (event) => {
  const input = event.target
  const file = input?.files?.[0]

  if (!file) {
    return
  }

  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension || !['dwg', 'dxf'].includes(extension)) {
    alert('Solo se permiten archivos DWG o DXF.')
    input.value = ''
    selectedFile.value = undefined
    fileName.value = ''
    return
  }

  selectedFile.value = file
  fileName.value = file.name
}

const clearFile = () => {
  selectedFile.value = undefined
  fileName.value = ''
}
</script>

<style scoped>
.cad-viewer-page {
  display: flex;
  flex-direction: column;
}

.cad-viewer-container {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
