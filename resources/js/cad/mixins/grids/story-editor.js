/**
 * @mixin storyEditorMixin
 *
 * Editor ÚNICO de datos de piso (estilo "Edit Story Data" de ETABS).
 *
 * Reemplaza a los dos diálogos que hacían lo mismo:
 *   - Editar ▸ Editar Datos de Piso   (Swal, uniforme, reconstruía todo)
 *   - Dibujar ▸ Generar Pisos...      (modal Blade, uniforme, mismo apply)
 *
 * Diferencia clave con el viejo applyStoryData(count, height): acá NO se
 * reconstruye el modelo. La grilla de ejes (xGrids/yGrids) es global y no se
 * toca; sólo se recalculan las elevaciones de los pisos y la geometría que
 * vivía en cada nivel se MUEVE con él (mapeo lineal por tramos). Así se puede
 * cambiar la altura de un piso, renombrarlo o agregar uno arriba sin rehacer
 * la grilla ni volver a dibujar el modelo.
 */

const Z_TOL = 0.02;

export const storyEditorMixin = {
  // ---------------------------------------------------------------
  // Filas para el modal: base→arriba, con la altura de cada tramo.
  // ---------------------------------------------------------------
  getStoryEditorRows() {
    const stories = (Array.isArray(this.stories) ? this.stories : [])
      .map((s, i) => ({
        id: s?.id ?? i,
        name: String(s?.name ?? (i === 0 ? "Base" : `Piso ${i}`)),
        elevation: Number(s?.elevation ?? 0),
      }))
      .sort((a, b) => a.elevation - b.elevation);

    if (!stories.length) return [];

    return stories.map((s, i) => ({
      key: s.id,
      name: s.name,
      elevation: s.elevation,
      height: i === 0 ? 0 : Number((s.elevation - stories[i - 1].elevation).toFixed(4)),
    }));
  },

  openStoryDataDialog() {
    const ref = this.referenceGrid;
    let rows = this.getStoryEditorRows();

    // Modelo recién abierto sin stories: arranca con Base + 1 piso.
    if (!rows.length) {
      const h = Number(ref?.storyHeight) > 0 ? Number(ref.storyHeight) : 3;
      rows = [
        { key: 0, name: "Base", elevation: 0, height: 0 },
        { key: null, name: "Piso 1", elevation: h, height: h },
      ];
    }

    const hasAxes = (ref?.xGrids?.length || 0) > 0 || (ref?.yGrids?.length || 0) > 0;

    window.dispatchEvent(
      new CustomEvent("open-story-data-modal", {
        detail: {
          rows,
          hasAxes,
          typicalHeight: Number(ref?.storyHeight) > 0 ? Number(ref.storyHeight) : 3,
        },
      }),
    );
  },

  // ---------------------------------------------------------------
  // Aplica la tabla del modal.
  // rows viene base→arriba: [{ key, name, height }]  (key = id del piso
  // existente, o null si es un piso nuevo). Los pisos que el usuario borró
  // simplemente no vienen en la lista.
  // ---------------------------------------------------------------
  applyStoryTableFromModal(payload = {}) {
    const rows = Array.isArray(payload.rows) ? payload.rows : [];
    if (rows.length < 1) {
      this.showMessage?.("Debe quedar al menos el nivel Base.", "warning");
      return;
    }

    const oldStories = this.getStoryEditorRows();
    const oldByKey = new Map(oldStories.map((s) => [s.key, s]));

    // --- Nuevas elevaciones acumuladas -----------------------------
    const newRows = [];
    let elevation = 0;

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];

      if (index > 0) {
        const h = Number(row.height);
        if (!Number.isFinite(h) || h <= 0) {
          this.showMessage?.(`La altura del piso "${row.name}" debe ser mayor que cero.`, "warning");
          return;
        }
        elevation += h;
      }

      newRows.push({
        key: row.key ?? null,
        name: String(row.name || (index === 0 ? "Base" : `Piso ${index}`)),
        elevation: Number(elevation.toFixed(6)),
      });
    }

    this.saveUndoState?.("Edit Story Data");

    // --- Pisos eliminados: se borra lo que vivía en ese nivel -------
    const survivingKeys = new Set(newRows.map((r) => r.key).filter((k) => k !== null && k !== undefined));
    const removedStories = oldStories.filter((s) => !survivingKeys.has(s.key));
    let removedObjects = 0;

    removedStories.forEach((s) => {
      removedObjects += this.deleteModelObjectsAtElevation(s.elevation);
    });

    if (removedStories.length) this.reindexModelObjects?.();

    // --- Mapa de elevaciones viejas → nuevas ------------------------
    const pairs = [];
    newRows.forEach((r) => {
      if (r.key === null || r.key === undefined) return;
      const old = oldByKey.get(r.key);
      if (!old) return;
      pairs.push({ from: old.elevation, to: r.elevation });
    });
    pairs.sort((a, b) => a.from - b.from);

    const moved = this.remapModelElevations(pairs);

    // --- Reescribir stories / referenceGrid -------------------------
    this.ensureReferenceGridShape();

    this.stories = newRows.map((r, i) => ({
      id: i,
      name: i === 0 ? r.name || "Base" : r.name,
      elevation: r.elevation,
    }));

    const storyCount = this.stories.length - 1;
    this.referenceGrid.storyCount = storyCount;
    this.referenceGrid.storyHeight = this.getTypicalStoryHeight();

    if (Number(this.activeStory || 0) > storyCount) this.activeStory = 0;

    this.refreshAfterStoryChange();

    const parts = [`${storyCount} piso(s)`];
    if (moved) parts.push(`${moved} objeto(s) reubicados`);
    if (removedObjects) parts.push(`${removedObjects} objeto(s) eliminados`);
    this.showMessage?.(`🏢 Datos de piso aplicados: ${parts.join(", ")}.`);

    console.log("✅ EDIT STORY DATA:", { stories: this.stories, moved, removedObjects });
  },

  // Altura más repetida (la "típica" que siguen usando los helpers
  // que todavía trabajan con storyHeight uniforme).
  getTypicalStoryHeight() {
    const stories = Array.isArray(this.stories) ? this.stories : [];
    if (stories.length < 2) return Number(this.referenceGrid?.storyHeight || 3);

    const counts = new Map();
    for (let i = 1; i < stories.length; i++) {
      const h = Number((Number(stories[i].elevation) - Number(stories[i - 1].elevation)).toFixed(4));
      counts.set(h, (counts.get(h) || 0) + 1);
    }

    let best = null;
    let bestCount = -1;
    counts.forEach((count, h) => {
      if (count > bestCount) {
        bestCount = count;
        best = h;
      }
    });

    return best > 0 ? best : 3;
  },

  ensureReferenceGridShape() {
    if (this.referenceGrid) return;
    this.referenceGrid = {
      xGrids: [],
      yGrids: [],
      generalGrids: [],
      xPositions: [],
      yPositions: [],
      xLabels: [],
      yLabels: [],
      storyCount: 0,
      storyHeight: 0,
    };
  },

  // ---------------------------------------------------------------
  // Mueve la geometría al cambiar las elevaciones.
  // pairs = [{from, to}] ordenado por "from". Un punto entre dos niveles
  // se interpola (un nudo a media altura de un muro mallado sigue a media
  // altura); arriba del último nivel se traslada en bloque.
  // ---------------------------------------------------------------
  remapModelElevations(pairs = []) {
    const usable = pairs.filter((p) => Number.isFinite(p.from) && Number.isFinite(p.to));
    if (!usable.length) return 0;
    if (usable.every((p) => Math.abs(p.to - p.from) < 1e-9)) return 0;

    const mapZ = (z) => {
      const value = Number(z);
      if (!Number.isFinite(value)) return z;

      if (value <= usable[0].from) return value + (usable[0].to - usable[0].from);

      for (let i = 1; i < usable.length; i++) {
        const a = usable[i - 1];
        const b = usable[i];
        if (value <= b.from) {
          const span = b.from - a.from;
          const t = span > 1e-9 ? (value - a.from) / span : 0;
          return a.to + t * (b.to - a.to);
        }
      }

      const last = usable[usable.length - 1];
      return value + (last.to - last.from);
    };

    const round = (v) => Number(Number(v).toFixed(6));
    let moved = 0;

    (this.nodes || []).forEach((node) => {
      if (!node?.position) return;
      const before = Number(node.position.z || 0);
      const after = round(mapZ(before));
      if (Math.abs(after - before) > 1e-9) moved++;
      node.position.z = after;
    });

    (this.areas || []).forEach((area) => {
      if (!area) return;
      let touched = false;
      if (typeof area.z === "number") {
        const after = round(mapZ(area.z));
        if (Math.abs(after - area.z) > 1e-9) touched = true;
        area.z = after;
      }
      (area.points || []).forEach((p) => {
        if (typeof p?.z !== "number") return;
        const after = round(mapZ(p.z));
        if (Math.abs(after - p.z) > 1e-9) touched = true;
        p.z = after;
      });
      if (touched) moved++;
    });

    (this.referencePoints || []).forEach((p) => {
      if (typeof p?.z === "number") p.z = round(mapZ(p.z));
    });

    if (typeof this.currentZ === "number") this.currentZ = round(mapZ(this.currentZ));

    return moved;
  },

  // ---------------------------------------------------------------
  // Borra lo que vive en un nivel (piso eliminado en la tabla).
  // Nudos a esa cota + sus barras, losas a esa cota y los muros/paneles
  // cuyo borde superior es ese nivel.
  // ---------------------------------------------------------------
  deleteModelObjectsAtElevation(z) {
    const target = Number(z);
    let deleted = 0;

    const areas = [...(this.areas || [])];
    areas.forEach((area) => {
      const zs = (area?.points || []).map((p) => Number(p?.z ?? area?.z ?? 0));
      const areaZ = Number(area?.z ?? (zs.length ? Math.max(...zs) : 0));
      const topZ = zs.length ? Math.max(...zs) : areaZ;
      if (Math.abs(topZ - target) < Z_TOL || Math.abs(areaZ - target) < Z_TOL) {
        if (this.removeAreaFromModel?.(area)) deleted++;
      }
    });

    const nodes = (this.nodes || []).filter((n) => Math.abs(Number(n?.position?.z ?? 0) - target) < Z_TOL);
    nodes.forEach((node) => {
      const frames = Array.isArray(node.beams) ? [...node.beams] : [];
      frames.forEach((frame) => {
        if (this.removeFrameFromModel?.(frame)) deleted++;
      });
      if (this.removeNodeFromModel?.(node)) deleted++;
    });

    return deleted;
  },

  // Reconstrucción de vistas/grillas tras cambiar los pisos.
  refreshAfterStoryChange() {
    this.rebuildReferenceGridCaches?.();
    this.rebuildGeneralGrids?.();
    this.rebuildViewSetFromReferenceGrid?.();
    this.rebuildElevationListsFromReferenceGrid?.();

    if (this.activeViewIndex >= (this.viewSet?.length || 0)) this.activeViewIndex = 0;

    this.activeGridPoint = null;

    const activeView = this.viewSet?.[this.activeViewIndex];
    if (activeView?.type === "plan") {
      this.currentViewMode = "plan";
      this.currentZ = Number(activeView.elevation || 0);
    }

    this.grid3DDrawn = false;
    this.redraw?.();
    this.sync3D?.();
    this.recenterCameraOnGrid?.();
    this.rebuild3DGridSnapPointsSoon?.("story data changed");
  },
};
