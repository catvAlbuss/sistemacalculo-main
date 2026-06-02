// cadEngine.js - Singleton para el motor CAD
import { AcApDocManager } from "@mlightcad/cad-simple-viewer";

let _docManager = null;
let _initialized = false;

const WORKER_URLS = {
  dxfParser: "/assets/dxf-parser-worker.js",
  dwgParser: "/assets/libredwg-parser-worker.js",
  mtextRender: "/assets/mtext-renderer-worker.js",
};

export const cadEngine = {
  docManager: null,
  cadView: null,

  init(container) {
    if (_initialized) return;

    _docManager = AcApDocManager.createInstance({
      webworkerFileUrls: WORKER_URLS,
      container,
      autoResize: true,
    });

    this.docManager = _docManager;
    _initialized = true;

    console.log("✅ Motor CAD inicializado");
  },

  // cadEngine.js
  getView() {
    if (this.docManager && this.docManager.curView) {
        this.cadView = this.docManager.curView;
        // console.log("📷 View obtenida - Zoom:", this.cadView.zoom);
        return this.cadView;
    }
    console.log("⚠️ No hay view disponible aún (esperando documento CAD)");
    return null;
},

  worldToScreen(point) {
    const view = this.getView();
    if (view && view.worldToScreen) {
      return view.worldToScreen(point);
    }
    return null;
  },

  screenToWorld(point) {
    const view = this.getView();
    if (view && view.screenToWorld) {
      return view.screenToWorld(point);
    }
    return null;
  },

  getZoom() {
    const view = this.getView();
    return view?.zoom || 1;
  },

  zoomAt(screenPoint, factor) {
    const view = this.getView();
    if (view && view.flyTo && view.center) {
      const currentZoom = view.zoom;
      const nextZoom = currentZoom * factor;
      view.flyTo(view.center, nextZoom);
    }
  },
};
