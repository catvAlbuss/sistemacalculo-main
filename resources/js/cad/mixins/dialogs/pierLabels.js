// resources/js/cad/mixins/dialogs/pierLabels.js
//
// Etiquetas de PIER, como en ETABS: `Define ▸ Pier Labels` para crearlas y
// `Assign ▸ Shell ▸ Pier Label` para ponérselas a los muros.
//
// QUÉ HACE UNA ETIQUETA DE PIER Y QUÉ NO
//   No fusiona geometría. Los paños siguen siendo objetos separados y el motor
//   los sigue mallando en shells por su cuenta. Lo que hace la etiqueta es
//   AGRUPARLOS para el diseño: los shells de un mismo pier en un mismo piso se
//   integran en un solo P/V2/V3/T/M2/M3 — la tabla Pier Forces.
//
//   Por eso una placa en L, dibujada como dos paños perpendiculares, se diseña
//   como UNA sección: no porque se hayan unido, sino porque comparten etiqueta.
//   La integración vive en python-backend/seismic/pier_forces.py.
//
// DE DÓNDE SALEN
//   Del `.e2k` (`AREAASSIGN ... PIER "P1"`), o creadas acá. La lista visible
//   es la unión de las definidas a mano y las que YA están puestas en algún
//   muro: si un modelo importado trae P1 sin que nadie la haya definido, tiene
//   que aparecer igual — si no, la etiqueta existe en los muros pero no en el
//   selector, y no hay forma de reasignarla.

/** Nombre válido de pier: sin vacíos ni espacios de más. */
function limpiarNombre(nombre) {
  return String(nombre ?? "").trim();
}

export const pierLabelsMixin = {
  // ── Definición ───────────────────────────────────────────────────────────

  /** Muros del modelo (los mismos que ve el resto de los diálogos de área). */
  getWallsForPier() {
    return (this.areas || []).filter((a) => (a.areaType || a.type) === "wall");
  },

  /**
   * Todas las etiquetas conocidas: las definidas + las que ya están puestas en
   * algún muro. Ver la nota del encabezado — un modelo importado trae etiquetas
   * que nadie definió, y tienen que salir en el selector igual.
   */
  getPierLabels() {
    const definidas = Array.isArray(this.pierLabels) ? this.pierLabels : [];
    const enUso = this.getWallsForPier().map((w) => limpiarNombre(w.pier)).filter(Boolean);
    return [...new Set([...definidas.map(limpiarNombre).filter(Boolean), ...enUso])].sort();
  },

  /** Cuántos muros usa cada etiqueta — es lo que contesta "¿qué muro tiene cuál?". */
  getPierLabelUsage() {
    const cuenta = new Map();
    for (const w of this.getWallsForPier()) {
      const p = limpiarNombre(w.pier);
      if (!p) continue;
      if (!cuenta.has(p)) cuenta.set(p, []);
      cuenta.get(p).push(w);
    }
    return this.getPierLabels().map((nombre) => {
      const muros = cuenta.get(nombre) || [];
      const pisos = [...new Set(muros.map((w) => w.etabsStory).filter(Boolean))].sort();
      return { nombre, muros: muros.length, pisos, ids: muros.map((w) => w.id) };
    });
  },

  /** Muros SIN etiqueta — los que se quedarían fuera de la tabla Pier Forces. */
  getWallsWithoutPier() {
    return this.getWallsForPier().filter((w) => !limpiarNombre(w.pier));
  },

  agregarPierLabel(nombre) {
    const limpio = limpiarNombre(nombre);
    if (!limpio) return false;
    if (!Array.isArray(this.pierLabels)) this.pierLabels = [];
    if (this.getPierLabels().includes(limpio)) {
      this.showMessage?.(`La etiqueta "${limpio}" ya existe.`, "warning");
      return false;
    }
    this.saveUndoState?.("Crear etiqueta de pier");
    this.pierLabels.push(limpio);
    return true;
  },

  /**
   * Renombrar arrastra a los muros que la usan. Sin eso, la etiqueta vieja
   * seguiría viva en los muros y aparecería sola de nuevo en la lista (por la
   * unión de definidas + en uso) — el rename se vería como si no hubiera pasado.
   */
  renombrarPierLabel(viejo, nuevo) {
    const a = limpiarNombre(viejo);
    const b = limpiarNombre(nuevo);
    if (!a || !b || a === b) return false;
    if (this.getPierLabels().includes(b)) {
      this.showMessage?.(`La etiqueta "${b}" ya existe.`, "warning");
      return false;
    }
    this.saveUndoState?.("Renombrar etiqueta de pier");
    if (Array.isArray(this.pierLabels)) {
      this.pierLabels = this.pierLabels.map((n) => (limpiarNombre(n) === a ? b : n));
      if (!this.pierLabels.includes(b)) this.pierLabels.push(b);
    } else {
      this.pierLabels = [b];
    }
    for (const w of this.getWallsForPier()) {
      if (limpiarNombre(w.pier) === a) w.pier = b;
    }
    this.markAnalysisResultsOutdated?.("Se renombró una etiqueta de pier.");
    this.redraw?.();
    return true;
  },

  /** Borrar también la saca de los muros: una etiqueta huérfana reaparecería. */
  eliminarPierLabel(nombre) {
    const limpio = limpiarNombre(nombre);
    if (!limpio) return false;
    this.saveUndoState?.("Eliminar etiqueta de pier");
    if (Array.isArray(this.pierLabels)) {
      this.pierLabels = this.pierLabels.filter((n) => limpiarNombre(n) !== limpio);
    }
    let tocados = 0;
    for (const w of this.getWallsForPier()) {
      if (limpiarNombre(w.pier) === limpio) { w.pier = null; tocados++; }
    }
    this.markAnalysisResultsOutdated?.("Se eliminó una etiqueta de pier.");
    this.redraw?.();
    this.showMessage?.(
      tocados ? `Etiqueta "${limpio}" eliminada y quitada de ${tocados} muro(s).`
              : `Etiqueta "${limpio}" eliminada.`);
    return true;
  },

  /** Abre el modal de Define ▸ Pier Labels. */
  openPierLabels() {
    if (!Array.isArray(this.pierLabels)) this.pierLabels = [];
    window.dispatchEvent(new CustomEvent("open-pier-labels-modal"));
  },

  // ── Asignación ───────────────────────────────────────────────────────────

  /**
   * Abre el modal de Assign ▸ Shell ▸ Pier Label. Reusa los mismos ámbitos que
   * el resto de los diálogos de muro (seleccionados / por piso / todos), así
   * que se puede etiquetar un piso entero de una.
   */
  openAssignPierLabelDialog() {
    const { allWalls, scopes } = this._wallAssignData();
    if (!allWalls.length) {
      this.showMessage?.("No hay muros en el modelo. Dibuja muros primero.", "warning");
      return;
    }
    window.dispatchEvent(new CustomEvent("open-assign-pier-label-modal", {
      detail: { scopes, labels: this.getPierLabels() },
    }));
  },

  /**
   * Aplica la etiqueta. `__none__` la saca (ese muro deja de aparecer en Pier
   * Forces) y `__new__:Nombre` crea una al vuelo, como el campo de ETABS.
   */
  applyPierLabelFromModal(scope, nombre) {
    const target = this._resolveWallScopeTarget(scope);
    if (!target.length) {
      this.showMessage?.("No hay muros en ese ámbito.", "warning");
      return 0;
    }

    let etiqueta = null;
    if (String(nombre).startsWith("__new__:")) {
      etiqueta = limpiarNombre(String(nombre).slice(8));
      if (!etiqueta) {
        this.showMessage?.("Poné un nombre para la etiqueta.", "warning");
        return 0;
      }
      if (!Array.isArray(this.pierLabels)) this.pierLabels = [];
      if (!this.pierLabels.includes(etiqueta)) this.pierLabels.push(etiqueta);
    } else if (nombre !== "__none__") {
      etiqueta = limpiarNombre(nombre);
    }

    this.saveUndoState?.("Asignar etiqueta de pier");
    for (const wall of target) wall.pier = etiqueta || null;
    this.markAnalysisResultsOutdated?.("Se asignaron etiquetas de pier.");
    this.redraw?.();
    this.showMessage?.(
      etiqueta ? `Etiqueta "${etiqueta}" asignada a ${target.length} muro(s).`
               : `Etiqueta quitada de ${target.length} muro(s).`);
    return target.length;
  },
};
