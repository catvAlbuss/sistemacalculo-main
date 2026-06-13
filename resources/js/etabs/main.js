// resources/js/etabs/main.js
import { createApp } from 'vue'
import { i18n, MlCadViewer } from '@mlightcad/cad-viewer'
import { 
  AcApDocManager, 
  AcApSettingManager,
  AcApLineCmd,
  AcEdCommand,
  AcEdPreviewJig,
  AcEdPromptPointOptions,
  AcEdPromptStatus
} from '@mlightcad/cad-simple-viewer'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'

// Configurar workers
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

// Ocultar toda la UI del CAD desde el inicio
AcApSettingManager.instance.isShowCommandLine = false
AcApSettingManager.instance.isShowToolbar = false
AcApSettingManager.instance.isShowRibbon = false
AcApSettingManager.instance.isShowStatusBar = false

// Crear app
const app = createApp(App)
app.use(i18n)
app.use(ElementPlus)
app.component('MlCadViewer', MlCadViewer)
app.mount('#cad-viewer-app')

console.log('✅ App Vue montada correctamente')