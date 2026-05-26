// Vue app entry for CAD Viewer
import { createApp } from 'vue'
import { i18n, MlCadViewer } from '@mlightcad/cad-viewer'
import { AcApDocManager } from '@mlightcad/cad-simple-viewer'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'

// Ensure CAD worker scripts are loaded from the public root path
const originalCreateInstance = AcApDocManager.createInstance.bind(AcApDocManager)
AcApDocManager.createInstance = (options = {}) => {
  options.webworkerFileUrls = {
    dxfParser: '/assets/dxf-parser-worker.js',
    dwgParser: '/assets/libredwg-parser-worker.js',
    mtextRender: '/assets/mtext-renderer-worker.js',
    ...options.webworkerFileUrls
  }
  return originalCreateInstance(options)
}

// Create Vue app
const app = createApp(App)

// Use plugins
app.use(i18n)
app.use(ElementPlus)

// Register MlCadViewer component
app.component('MlCadViewer', MlCadViewer)

// Mount to #cad-viewer-app
app.mount('#cad-viewer-app')
