<template>
  <div class="cad-background h-full w-full">
    <MlCadViewer
      ref="cadViewer"
      locale="en"
      :background="0x1a1a2e"
      theme="dark"
      :local-file="selectedFile"
      :show-grid="false"
      :show-axes="false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const selectedFile = ref(null)

window.cadReference = {
  loadFile: (file) => {
    console.log('Cargando archivo:', file?.name)
    selectedFile.value = file
  },
  clear: () => {
    selectedFile.value = null
  }
}
</script>

<style scoped>
.cad-background {
  background-color: #1a1a2e;
}
</style>