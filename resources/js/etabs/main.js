// resources/js/etabs/main.js
import { createApp } from 'vue'
import { i18n, MlCadViewer } from '@mlightcad/cad-viewer'
import { AcApDocManager, AcApI18n, AcApSettingManager } from '@mlightcad/cad-simple-viewer'
import { AcDbDatabaseConverterManager, AcDbFileType } from '@mlightcad/data-model'
import { AcDbLibreDwgConverter } from '@mlightcad/libredwg-converter'
import ElementPlus from 'element-plus'
import es from 'element-plus/es/locale/lang/es'
import 'element-plus/dist/index.css'
// Desde @mlightcad/cad-viewer 1.7 el propio paquete importa su CSS (dist/cad-viewer.css).
import App from './App.vue'
import { installCadDrawingDefaults } from './cadDrawingDefaults.js'
import { installSpanishCad } from './locale/spanishCad.js'
import { installCadFontMapping } from './cadFonts.js'

// Desde cad-simple-viewer 1.7 el visor ya no registra un lector DWG: sin esto
// solo se podían abrir DXF. LibreDWG (GPL) corre aislado en su propio worker.
AcDbDatabaseConverterManager.instance.register(AcDbFileType.DWG, new AcDbLibreDwgConverter({
  useWorker: true,
  parserWorkerUrl: '/assets/libredwg-parser-worker.js'
}))

// Configurar workers (parsers DXF/DWG y render de MText)
const originalCreateInstance = AcApDocManager.createInstance.bind(AcApDocManager)
AcApDocManager.createInstance = (options = {}) => {
  options.webworkerFileUrls = {
    dxfParser: '/assets/dxf-parser-worker.js',
    dwgParser: '/assets/libredwg-parser-worker.js',
    mtextRender: '/assets/mtext-renderer-worker.js',
    ...options.webworkerFileUrls
  }
  const manager = originalCreateInstance(options)
  installCadDrawingDefaults(manager)
  return manager
}

// Mostrar la UI nativa completa del visor (menú/ribbon, toolbar, barra de estado).
// Se fuerzan a true porque AcApSettingManager persiste en localStorage y una
// configuración previa pudo haberlas dejado ocultas.
AcApSettingManager.instance.isShowRibbon = true
AcApSettingManager.instance.isShowToolbar = true
AcApSettingManager.instance.isShowStatusBar = true
AcApSettingManager.instance.isShowCommandLine = true

// En el menú Archivo, la fila "Abrir dibujo" solo despliega su submenú, pero al
// hacerle clic Element Plus emite su comando por defecto ({}) y el visor falla con
// "startsWith is not a function". Ese clic no tiene acción propia: se descarta.
document.addEventListener('click', (event) => {
  const row = event.target instanceof Element ? event.target.closest('.ml-ribbon-file-menu-submenu') : null
  if (row) event.stopPropagation()
}, true)

// Fuentes ausentes del repositorio (Arial Negrita, Swiss, RomanD "__"…) se dibujan
// con su equivalente más cercana. Debe ir antes de montar: el visor lo lee al crear la vista.
installCadFontMapping(AcApSettingManager.instance)

// Interfaz del visor en español latino (cinta, diálogos, paletas y línea de comandos).
installSpanishCad({ i18n, AcApI18n, settings: AcApSettingManager.instance })

// Montar app: visor CAD con su barra de herramientas nativa completa
const app = createApp(App)
app.use(i18n)
app.use(ElementPlus, { locale: es })
app.component('MlCadViewer', MlCadViewer)
app.mount('#cad-viewer-app')

console.log('✅ ETABS: visor CAD montado')

// AcApDocManager es un singleton: si Vite recarga en caliente un componente, el
// visor se vuelve a montar y el gestor queda atado a una vista ya destruida (el
// plano queda negro y nada de lo dibujado se ve). En esta página se recarga entera.
if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => location.reload())
}
