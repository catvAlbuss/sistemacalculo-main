// resources/js/etabs/main.js
import { createApp } from 'vue'
import { i18n, MlCadViewer } from '@mlightcad/cad-viewer'
import { AcApDocManager, AcApSettingManager } from '@mlightcad/cad-simple-viewer'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// El paquete no expone su CSS en "exports"; se importa por ruta relativa para
// que el ribbon/toolbar nativo del visor se muestre con su estilo completo.
import '../../../node_modules/@mlightcad/cad-viewer/dist/index.css'
import App from './App.vue'

// Configurar workers (parsers DXF/DWG y render de MText)
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

// Mostrar la UI nativa completa del visor (menú/ribbon, toolbar, barra de estado).
// Se fuerzan a true porque AcApSettingManager persiste en localStorage y una
// configuración previa pudo haberlas dejado ocultas.
AcApSettingManager.instance.isShowRibbon = true
AcApSettingManager.instance.isShowToolbar = true
AcApSettingManager.instance.isShowStatusBar = true
AcApSettingManager.instance.isShowCommandLine = true

// Montar app: visor CAD con su barra de herramientas nativa completa
const app = createApp(App)
app.use(i18n)
app.use(ElementPlus)
app.component('MlCadViewer', MlCadViewer)
app.mount('#cad-viewer-app')

console.log('✅ ETABS: visor CAD montado')
