import { pointDistance, pointDistanceToSegment } from "../utils.js";

/**
 * @mixin referenceGridMixin
 *
 * Sistema de grilla de referencia, vistas y snap en el plano de planta.
 *
 * Construye y mantiene el sistema de ejes (X, Y, generales) que sirve de
 * referencia visual para el dibujo. También gestiona el conjunto de vistas
 * (viewSet): planta por piso, elevaciones en X y en Z.
 *
 * El snap 3D se reconstruye cada vez que cambia la grilla para que los
 * clics en el visor Babylon.js se anclen a los puntos del grid.
 *
 * Responsabilidades:
 *
 * Construcción del grid:
 * - buildXGrids(count, spacing)        → genera líneas de grid en X
 * - buildYGrids(count, spacing)        → genera líneas de grid en Y
 * - buildReferenceGrid(params)         → construye el referenceGrid completo desde params
 * - getXLabels / getYLabels(count)     → etiquetas A,B,C... o 1,2,3...
 *
 * Gestión de vistas:
 * - buildViewSet(params)               → crea el array de vistas (planta + elevaciones)
 * - setViewFromSet(index)              → activa la vista por índice y ajusta el canvas
 * - getActiveViewLabel()               → etiqueta de la vista activa para el badge UI
 * - getActive3DViewLabel()             → etiqueta del panel 3D
 * - getActiveViewBadgeClass()          → clases CSS del badge de vista activa
 *
 * Snap en planta:
 * - updatePlanGridSnap()               → actualiza los puntos de snap del grid 2D en planta
 * - rebuild3DGridSnapPointsSoon(reason) → reconstruye el índice de snap 3D (debounced)
 */
export const referenceGridMixin = {
  // Calcula las cotas (ordinates) de las líneas de grid.
  //   spacing puede ser:
  //     - número  → espaciamiento UNIFORME; genera `count` líneas en 0, s, 2s…
  //     - array   → luces NO uniformes (ej. [6,6,5]); genera N+1 líneas en las
  //                 sumas acumuladas (0, 6, 12, 17). `count` se ignora.
  _gridOrdinates(count, spacing) {
    if (Array.isArray(spacing) && spacing.length) {
      const ords = [0];
      let acc = 0;
      for (const luz of spacing) {
        acc += Number(luz) || 0;
        ords.push(acc);
      }
      return ords; // N luces → N+1 líneas
    }
    const n = Math.max(1, Number(count) || 1);
    const sp = Number(spacing) || 0;
    return Array.from({ length: n }, (_, i) => i * sp);
  },

  buildXGrids(count, spacing) {
    const ordinates = this._gridOrdinates(count, spacing);
    const labels = this.getXLabels(ordinates.length);
    return ordinates.map((ordinate, i) => ({
      id: labels[i],
      ordinate,
      visible: true,
      bubbleLoc: "End",
    }));
  },

  buildYGrids(count, spacing) {
    const ordinates = this._gridOrdinates(count, spacing);
    const labels = this.getYLabels(ordinates.length);
    return ordinates.map((ordinate, i) => ({
      id: String(labels[i]),
      ordinate,
      visible: true,
      bubbleLoc: "Start",
    }));
  },

  rebuildGeneralGrids(targetGrid = this.referenceGrid) {
    if (!targetGrid) return;

    const ref = targetGrid;

    const customLines = Array.isArray(ref.generalGrids) ? ref.generalGrids.filter((g) => g.source === "custom") : [];

    const xValues = Array.isArray(ref.xGrids) ? ref.xGrids.map((g) => Number(g.ordinate) || 0) : [];

    const yValues = Array.isArray(ref.yGrids) ? ref.yGrids.map((g) => Number(g.ordinate) || 0) : [];

    const minX = xValues.length ? Math.min(...xValues) : 0;
    const maxX = xValues.length ? Math.max(...xValues) : 10;
    const minY = yValues.length ? Math.min(...yValues) : 0;
    const maxY = yValues.length ? Math.max(...yValues) : 10;

    const xLines = (ref.xGrids || []).map((g) => ({
      id: g.id,
      x1: Number(g.ordinate) || 0,
      y1: minY,
      x2: Number(g.ordinate) || 0,
      y2: maxY,
      visible: g.visible !== false,
      bubbleLoc: g.bubbleLoc || "End",
      source: "x",
    }));

    const yLines = (ref.yGrids || []).map((g) => ({
      id: g.id,
      x1: minX,
      y1: Number(g.ordinate) || 0,
      x2: maxX,
      y2: Number(g.ordinate) || 0,
      visible: g.visible !== false,
      bubbleLoc: g.bubbleLoc || "Start",
      source: "y",
    }));

    ref.generalGrids = [...xLines, ...yLines, ...customLines];

    // Compatibilidad con tu sistema actual
    ref.xPositions = (ref.xGrids || []).map((g) => Number(g.ordinate) || 0);
    ref.yPositions = (ref.yGrids || []).map((g) => Number(g.ordinate) || 0);
    ref.xLabels = (ref.xGrids || []).map((g) => g.id);
    ref.yLabels = (ref.yGrids || []).map((g) => g.id);
  },

  getReferenceGrid() {
    return this.referenceGrid;
  },

  normalizeGridLine(line = {}, fallbackId = "") {
    return {
      id: String(line.id ?? fallbackId),
      ordinate: Number(line.ordinate ?? 0),
      visible: line.visible !== false,
      bubbleLoc: line.bubbleLoc ?? "End",
    };
  },

  normalizeGeneralGridLine(line = {}, fallbackId = "") {
    return {
      id: String(line.id ?? fallbackId),
      x1: Number(line.x1 ?? 0),
      y1: Number(line.y1 ?? 0),
      x2: Number(line.x2 ?? 0),
      y2: Number(line.y2 ?? 0),
      visible: line.visible !== false,
      bubbleLoc: line.bubbleLoc ?? "End",
      source: line.source ?? "custom",
    };
  },

  sortGridsByOrdinate(lines = []) {
    return [...lines].sort((a, b) => Number(a.ordinate) - Number(b.ordinate));
  },

  rebuildReferenceGridCaches() {
    if (!this.referenceGrid) return;

    const ref = this.referenceGrid;

    ref.xGrids = this.sortGridsByOrdinate((ref.xGrids || []).map((g, i) => this.normalizeGridLine(g, `X${i + 1}`)));

    ref.yGrids = this.sortGridsByOrdinate((ref.yGrids || []).map((g, i) => this.normalizeGridLine(g, `Y${i + 1}`)));

    ref.generalGrids = (ref.generalGrids || []).map((g, i) => this.normalizeGeneralGridLine(g, `G${i + 1}`));

    ref.xPositions = ref.xGrids.map((g) => Number(g.ordinate));
    ref.yPositions = ref.yGrids.map((g) => Number(g.ordinate));
    ref.xLabels = ref.xGrids.map((g) => g.id);
    ref.yLabels = ref.yGrids.map((g) => g.id);
  },

  buildSpacingRowsFromOrdinates(lines = []) {
    const sorted = this.sortGridsByOrdinate(lines);

    return sorted.map((line, index) => {
      const prev = sorted[index - 1];
      const spacing = index === 0 ? Number(line.ordinate) : Number(line.ordinate) - Number(prev.ordinate);

      return {
        id: line.id,
        spacing,
        visible: line.visible !== false,
        bubbleLoc: line.bubbleLoc ?? "End",
      };
    });
  },

  buildOrdinatesFromSpacingRows(rows = []) {
    let cumulative = 0;

    return rows.map((row, index) => {
      cumulative += Number(row.spacing ?? 0);

      return {
        id: String(row.id ?? index + 1),
        ordinate: cumulative,
        visible: row.visible !== false,
        bubbleLoc: row.bubbleLoc ?? "End",
      };
    });
  },

  setGridDisplayMode(mode) {
    if (mode !== "ordinates" && mode !== "spacing") return;
    this.gridDisplayMode = mode;
  },

  rebuildViewSetFromReferenceGrid() {
    if (!this.referenceGrid) return;

    const ref = this.referenceGrid;
    this.viewSet = [];

    this.viewSet.push({
      type: "plan",
      storyId: 0,
      name: "Planta - Base",
      elevation: 0,
    });

    for (let i = 1; i <= (ref.storyCount || 0); i++) {
      this.viewSet.push({
        type: "plan",
        storyId: i,
        name: `Planta - Piso ${i}`,
        elevation: i * (ref.storyHeight || 0),
      });
    }

    // LETRAS => eje X
    (ref.xPositions || []).forEach((x, i) => {
      this.viewSet.push({
        type: "elevation",
        axis: "X",
        label: ref.xLabels?.[i], // A, B, C, D
        value: x,
        name: `Elevación ${ref.xLabels?.[i]}`,
      });
    });

    // NÚMEROS => eje Y
    (ref.yPositions || []).forEach((y, i) => {
      this.viewSet.push({
        type: "elevation",
        axis: "Y",
        label: ref.yLabels?.[i], // 1, 2, 3, 4
        value: y,
        name: `Elevación ${ref.yLabels?.[i]}`,
      });
    });

    if (this.activeViewIndex >= this.viewSet.length) {
      this.activeViewIndex = 0;
    }
  },

  rebuildElevationListsFromReferenceGrid() {
    if (!this.referenceGrid) return;

    const ref = this.referenceGrid;

    // LETRAS => X
    this.xElevations = (ref.xPositions || []).map((x, i) => ({
      label: ref.xLabels?.[i], // A, B, C, D
      value: x,
      name: `Elevación ${ref.xLabels?.[i]}`,
    }));

    // NÚMEROS => Y
    this.zElevations = (ref.yPositions || []).map((y, i) => ({
      label: ref.yLabels?.[i], // 1, 2, 3, 4
      value: y,
      name: `Elevación ${ref.yLabels?.[i]}`,
    }));
  },

  createModelFromDialog(params) {
    console.log("🏗️ Configurando grid de referencia con parámetros:", params);

    // ===============================
    // LIMPIEZA GENERAL DEL MODELO ANTERIOR
    // ===============================
    this.clearAllSelections?.();
    this.clearEditSelectionFlags?.();

    if (this.idleState && typeof this.setState === "function") {
      this.setState(this.idleState);
    }

    this.currentFileName = null;

    this.nodes = [];
    this.shapes = [];
    this.areas = [];

    this.referencePoints = [];
    this.referencePlanes = [];
    this.dimensionLines = [];
    this.parametricModels = [];

    this.selectedObject = null;
    this.activeGridPoint = null;

    this.nextNodeId = 1;
    this.nextBeamId = 1;

    this.undoStack = [];
    this.redoStack = [];

    this.editClipboard = null;
    this.editPasteCount = 0;

    this.K_Global_Reducido = [];
    this.Fuerzas_Globales_Reducidas = [];
    this.D_Global_Reducido = [];
    this.deflecciones = [];
    this.desplazamientosPosition = [];
    this.matrizDesplazamiento = [];

    // Luces no uniformes (array) tienen prioridad sobre el espaciamiento uniforme.
    this.referenceGrid = {
      xGrids: this.buildXGrids(
        params.gridXCount,
        params.gridXSpacings?.length ? params.gridXSpacings : params.gridXSpacing,
      ),
      yGrids: this.buildYGrids(
        params.gridYCount,
        params.gridYSpacings?.length ? params.gridYSpacings : params.gridYSpacing,
      ),
      generalGrids: [],

      xPositions: [],
      yPositions: [],
      xLabels: [],
      yLabels: [],

      storyCount: Number(params.storyCount || 0),
      storyHeight: Number(params.storyHeight || 0),
    };

    this.rebuildReferenceGridCaches();
    this.rebuildGeneralGrids();

    this.stories = [{ id: 0, name: "Base", elevation: 0 }];

    for (let i = 1; i <= params.storyCount; i++) {
      this.stories.push({
        id: i,
        name: `Piso ${i}`,
        elevation: i * params.storyHeight,
      });
    }

    this.activeStory = 0;

    this.rebuildViewSetFromReferenceGrid();
    this.rebuildElevationListsFromReferenceGrid();

    this.activeViewIndex = 0;
    this.currentViewMode = "plan";
    this.currentElevationX = "none";
    this.currentElevationZ = "none";

    if (this.referenceGrid.xPositions.length > 0 && this.referenceGrid.yPositions.length > 0) {
      const minX = Math.min(...this.referenceGrid.xPositions);
      const maxX = Math.max(...this.referenceGrid.xPositions);
      const minY = Math.min(...this.referenceGrid.yPositions);
      const maxY = Math.max(...this.referenceGrid.yPositions);

      this.grid.centerToView({
        cminx: minX - 2,
        cminy: minY - 2,
        cmaxx: maxX + 2,
        cmaxy: maxY + 2,
      });
    }

    this.redraw();

    const viewer = getViewer3DState();

    this.grid3DDrawn = false;

    if (viewer?.initialized && viewer?.scene) {
      this.pendingGrid3D = false;

      // Esperar 2 frames para evitar borrar/redibujar objetos 3D
      // mientras Babylon todavía está renderizando o compilando shaders.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.sync3D?.();

          // =====================================================
          // 3D SNAP > RECONSTRUIR SNAP POINTS DESPUÉS DEL MODELO
          // Necesario para dibujar diagonales 3D sin cambiar de piso.
          // =====================================================
          this.rebuild3DGridSnapPointsSoon?.("createModelFromDialog");
        });
      });
    } else {
      this.pendingGrid3D = true;

      // Si el visor 3D todavía no inició, intentamos reconstruir
      // cuando Babylon ya esté disponible.
      this.rebuild3DGridSnapPointsSoon?.("createModelFromDialog pending viewer");
    }

    this.showMessage(`✅ Grid de referencia: ${params.gridXCount}x${params.gridYCount}, ${params.storyCount} pisos`);
  },

  // Función auxiliar para obtener etiquetas X (A, B, C...)
  getXLabels(count) {
    const letters = [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
    ];
    return letters.slice(0, count);
  },

  // Función auxiliar para obtener etiquetas Y (1, 2, 3...)
  getYLabels(count) {
    return Array.from({ length: count }, (_, i) => i + 1);
  },

  closestBeamAtElevation(searchPoint, targetZ, tolerance = 0.05) {
    let closest = null;
    let shortestDistance = 10;

    for (let i = 0; i < this.shapes.length; i++) {
      const beam = this.shapes[i];
      if (!beam?.node1 || !beam?.node2) continue;

      const z1 = beam.node1.position.z || 0;
      const z2 = beam.node2.position.z || 0;

      // solo barras del mismo piso
      if (Math.abs(z1 - targetZ) > tolerance || Math.abs(z2 - targetZ) > tolerance) {
        continue;
      }

      const p1 = this.grid.worldToScreen(beam.node1.position);
      const p2 = this.grid.worldToScreen(beam.node2.position);

      const dist = pointDistanceToSegment(searchPoint, p1, p2); // helper abajo
      if (dist < shortestDistance) {
        shortestDistance = dist;
        closest = beam;
      }
    }

    return closest;
  },

  closestNodeAtElevation(searchPoint, targetZ, tolerance = 0.05) {
    const shortestDistance = 10;

    for (let index = 0; index < this.nodes.length; index++) {
      const node = this.nodes[index];
      const distance = pointDistance(searchPoint, this.grid.worldToScreen(node.position));
      const nodeZ = node.position.z || 0;

      if (distance <= shortestDistance && Math.abs(nodeZ - targetZ) <= tolerance) {
        return node;
      }
    }
  },

  // nueva función para cambiar de vista según el índice del set
  getNearestValueWithIndex(values, target) {
    if (!Array.isArray(values) || values.length === 0) return null;

    let nearestIndex = 0;
    let nearestValue = values[0];
    let minDist = Math.abs(values[0] - target);

    for (let i = 1; i < values.length; i++) {
      const dist = Math.abs(values[i] - target);
      if (dist < minDist) {
        minDist = dist;
        nearestIndex = i;
        nearestValue = values[i];
      }
    }

    return {
      index: nearestIndex,
      value: nearestValue,
      distance: minDist,
    };
  },

  getNearestPlanGridPoint(mouseWorld, mouseScreen) {
    const ref = this.referenceGrid;
    if (!ref) return null;

    const xValues = Array.isArray(ref.xPositions) ? ref.xPositions : [];
    const yValues = Array.isArray(ref.yPositions) ? ref.yPositions : [];
    const xLabels = Array.isArray(ref.xLabels) ? ref.xLabels : [];
    const yLabels = Array.isArray(ref.yLabels) ? ref.yLabels : [];

    if (!xValues.length || !yValues.length) return null;

    const nearestX = this.getNearestValueWithIndex(xValues, mouseWorld.x);
    const nearestY = this.getNearestValueWithIndex(yValues, mouseWorld.y);

    if (!nearestX || !nearestY) return null;

    const worldPoint = {
      x: nearestX.value,
      y: nearestY.value,
      z: this.getActivePlanElevation(),
    };

    const screenPoint = this.grid.worldToScreen({
      x: worldPoint.x,
      y: worldPoint.y,
    });

    const dxScreen = mouseScreen.x - screenPoint.x;
    const dyScreen = mouseScreen.y - screenPoint.y;
    const screenDistance = Math.sqrt(dxScreen * dxScreen + dyScreen * dyScreen);

    if (screenDistance > this.planGridSnapScreenTolerance) {
      return null;
    }

    return {
      x: worldPoint.x,
      y: worldPoint.y,
      z: worldPoint.z,
      xGridId: xLabels[nearestX.index] ?? String(nearestX.index + 1),
      yGridId: yLabels[nearestY.index] ?? String(nearestY.index + 1),
      label: `Grid Point ${xLabels[nearestX.index] ?? nearestX.index + 1} ${yLabels[nearestY.index] ?? nearestY.index + 1}`,
      source: "grid-xy",
      screenDistance,
    };
  },

  getGeneralGridIntersections() {
    const ref = this.referenceGrid;
    if (!ref?.generalGrids?.length) return [];

    const customLines = ref.generalGrids.filter((g) => g.source === "custom" && g.visible !== false);

    const intersections = [];

    customLines.forEach((line) => {
      const x1 = Number(line.x1 ?? 0);
      const y1 = Number(line.y1 ?? 0);
      const x2 = Number(line.x2 ?? 0);
      const y2 = Number(line.y2 ?? 0);

      const dx = x2 - x1;
      const dy = y2 - y1;

      // Intersección con líneas X (verticales)
      (ref.xPositions || []).forEach((xVal, ix) => {
        if (Math.abs(dx) < 1e-9) return;

        const t = (xVal - x1) / dx;
        if (t >= 0 && t <= 1) {
          const yVal = y1 + t * dy;

          intersections.push({
            x: xVal,
            y: yVal,
            z: this.getActivePlanElevation(),
            label: `Intersection ${line.id} × ${ref.xLabels[ix]}`,
            gridId: line.id,
            baseGridId: ref.xLabels[ix],
            source: "general-grid-intersection",
          });
        }
      });

      // Intersección con líneas Y (horizontales)
      (ref.yPositions || []).forEach((yVal, iy) => {
        if (Math.abs(dy) < 1e-9) return;

        const t = (yVal - y1) / dy;
        if (t >= 0 && t <= 1) {
          const xVal = x1 + t * dx;

          intersections.push({
            x: xVal,
            y: yVal,
            z: this.getActivePlanElevation(),
            label: `Intersection ${line.id} × ${ref.yLabels[iy]}`,
            gridId: line.id,
            baseGridId: ref.yLabels[iy],
            source: "general-grid-intersection",
          });
        }
      });
    });

    return intersections;
  },

  buildSnapDisplayLabel(point) {
    if (!point) return "";

    switch (point.source) {
      case "general-grid-intersection":
        return `Intersection ${point.gridId} × ${point.baseGridId}`;

      case "general-grid-endpoint":
        return `Endpoint ${point.gridId}`;

      case "general-grid":
        return `Grid ${point.gridId}`;

      case "grid-xy":
      default:
        if (point.xGridId && point.yGridId) {
          return `Grid Point ${point.xGridId} ${point.yGridId}`;
        }
        return point.label || "";
    }
  },

  getNearestPlanGeneralGridIntersectionSnap(mouseScreen) {
    const points = this.getGeneralGridIntersections();
    if (!points.length) return null;

    let best = null;

    points.forEach((point) => {
      const sp = this.grid.worldToScreen({ x: point.x, y: point.y });
      const dx = mouseScreen.x - sp.x;
      const dy = mouseScreen.y - sp.y;
      const screenDistance = Math.sqrt(dx * dx + dy * dy);

      if (best === null || screenDistance < best.screenDistance) {
        best = {
          ...point,
          screenDistance,
        };
      }
    });

    if (!best) return null;
    if (best.screenDistance > this.planGridSnapScreenTolerance) return null;

    return best;
  },

  closestPointOnSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;

    if (Math.abs(dx) < 1e-9 && Math.abs(dy) < 1e-9) {
      return { x: x1, y: y1, t: 0 };
    }

    let t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
    t = Math.max(0, Math.min(1, t));

    return {
      x: x1 + t * dx,
      y: y1 + t * dy,
      t,
    };
  },

  getNearestPlanGeneralGridSnap(mouseWorld, mouseScreen) {
    const ref = this.referenceGrid;
    if (!ref?.generalGrids?.length) return null;

    const customLines = ref.generalGrids.filter((g) => g.source === "custom" && g.visible !== false);

    if (!customLines.length) return null;

    let best = null;

    customLines.forEach((line) => {
      const cp = this.closestPointOnSegment(
        mouseWorld.x,
        mouseWorld.y,
        Number(line.x1 ?? 0),
        Number(line.y1 ?? 0),
        Number(line.x2 ?? 0),
        Number(line.y2 ?? 0),
      );

      const sp = this.grid.worldToScreen({ x: cp.x, y: cp.y });
      const dx = mouseScreen.x - sp.x;
      const dy = mouseScreen.y - sp.y;
      const screenDistance = Math.sqrt(dx * dx + dy * dy);

      if (best === null || screenDistance < best.screenDistance) {
        best = {
          x: cp.x,
          y: cp.y,
          z: this.getActivePlanElevation(),
          label: `Grid ${line.id}`,
          gridId: line.id,
          source: "general-grid",
          screenDistance,
        };
      }
    });

    if (!best) return null;
    if (best.screenDistance > this.planGridSnapScreenTolerance) return null;

    return best;
  },

  updatePlanGridSnap(mouseWorld, mouseScreen) {
    const view = this.viewSet?.[this.activeViewIndex];
    this.lastMouseScreen = mouseScreen;

    if (!view || view.type !== "plan") {
      this.activeGridPoint = null;
      return;
    }

    const pointIntersection = this.getNearestPlanGeneralGridIntersectionSnap(mouseScreen);
    const pointEndpoint = this.getNearestPlanGeneralGridEndpointSnap(mouseScreen);
    const pointGeneral = this.getNearestPlanGeneralGridSnap(mouseWorld, mouseScreen);
    const pointXY = this.getNearestPlanGridPoint(mouseWorld, mouseScreen);

    const candidates = [];

    if (pointIntersection) {
      candidates.push({
        ...pointIntersection,
        priorityWeight: 0,
      });
    }

    if (pointEndpoint) {
      candidates.push({
        ...pointEndpoint,
        priorityWeight: 2,
      });
    }

    if (pointGeneral) {
      candidates.push({
        ...pointGeneral,
        priorityWeight: 4,
      });
    }

    if (pointXY) {
      candidates.push({
        ...pointXY,
        priorityWeight: 6,
      });
    }

    if (!candidates.length) {
      this.activeGridPoint = null;
      const z = this.getActivePlanElevation();
      this.statusCoordinates = this.formatCoordinates(mouseWorld.x, mouseWorld.y, z);
      return;
    }

    // Elegir el mejor punto por cercanía real + pequeña prioridad
    candidates.forEach((c) => {
      c.score = (c.screenDistance ?? 9999) + (c.priorityWeight ?? 0);
    });

    candidates.sort((a, b) => a.score - b.score);

    const point = candidates[0];

    point.displayLabel = this.buildSnapDisplayLabel(point);
    this.activeGridPoint = point;
    this.statusCoordinates = this.formatCoordinates(point.x, point.y, point.z);
  },

  getGeneralGridEndpoints() {
    const ref = this.referenceGrid;
    if (!ref?.generalGrids?.length) return [];

    const customLines = ref.generalGrids.filter((g) => g.source === "custom" && g.visible !== false);

    const z = this.getActivePlanElevation();
    const points = [];

    customLines.forEach((line) => {
      points.push({
        x: Number(line.x1 ?? 0),
        y: Number(line.y1 ?? 0),
        z,
        label: `Endpoint ${line.id}`,
        gridId: line.id,
        source: "general-grid-endpoint",
        bubbleLoc: "Start",
      });

      points.push({
        x: Number(line.x2 ?? 0),
        y: Number(line.y2 ?? 0),
        z,
        label: `Endpoint ${line.id}`,
        gridId: line.id,
        source: "general-grid-endpoint",
        bubbleLoc: "End",
      });
    });

    return points;
  },

  getNearestPlanGeneralGridEndpointSnap(mouseScreen) {
    const points = this.getGeneralGridEndpoints();
    if (!points.length) return null;

    let best = null;

    points.forEach((point) => {
      const sp = this.grid.worldToScreen({ x: point.x, y: point.y });
      const dx = mouseScreen.x - sp.x;
      const dy = mouseScreen.y - sp.y;
      const screenDistance = Math.sqrt(dx * dx + dy * dy);

      if (!best || screenDistance < best.screenDistance) {
        best = {
          ...point,
          screenDistance,
        };
      }
    });

    if (!best) return null;
    if (best.screenDistance > this.planGridSnapScreenTolerance) return null;

    return best;
  },

  // buildSnapDisplayLabel(point) {
  //   if (!point) return "";

  //   switch (point.source) {
  //     case "general-grid-intersection":
  //       return `Intersection ${point.gridId} × ${point.baseGridId}`;

  //     case "general-grid-endpoint":
  //       return `Endpoint ${point.gridId}`;

  //     case "general-grid":
  //       return `Grid ${point.gridId}`;

  //     default:
  //       if (point.xGridId && point.yGridId) {
  //         return `Grid Point ${point.xGridId} ${point.yGridId}`;
  //       }
  //       return point.label || "";
  //   }
  // },

  isPlanView() {
    return this.currentViewMode === "plan";
  },

  isNumberElevationView() {
    // Elevaciones 1,2,3,4 -> plano X-Z (Y fijo)
    return this.currentViewMode === "elevation" || this.currentViewMode === "elevationY";
  },

  isLetterElevationView() {
    // Elevaciones A,B,C,D -> plano Y-Z (X fijo)
    return this.currentViewMode === "elevationZ" || this.currentViewMode === "elevationX";
  },

  isAnyElevationView() {
    return this.isNumberElevationView() || this.isLetterElevationView();
  },

  // =====================================================
  // VIEW > CAMBIAR ENTRE PLANTA Y ELEVACIONES
  // Cambia la vista activa sin romper modos especiales,
  // como Frame 3D entre plantas/elevaciones.
  // =====================================================
  setViewFromSet(index) {
    this.activeViewIndex = Number(index);
    const view = this.viewSet?.[this.activeViewIndex];

    if (!view) return;

    // Si hay una barra en proceso con primer punto,
    // no se cancela al cambiar de piso o elevación.
    // =====================================================
    const isFrameDrawingInProgress =
      this.currentState?.isFrameDrawingState === true &&
      this.currentState?.shape?.node1 &&
      !this.currentState?.shape?.node2;

    const shouldPreserveCurrentState = this.currentState?.preserveOnViewChange === true && isFrameDrawingInProgress;

    const preservedState = shouldPreserveCurrentState ? this.currentState : null;

    if (!shouldPreserveCurrentState && this.currentState?.exit) {
      this.currentState.exit();
    }

    if (!shouldPreserveCurrentState) {
      this.clearAllSelections?.();
    }

    this.activeGridPoint = null;

    // =====================================================
    // VIEW > VISTA EN PLANTA
    // Activa una planta y actualiza el piso / nivel actual.
    // =====================================================
    if (view.type === "plan") {
      this.currentViewMode = "plan";
      this.currentElevationX = "none";
      this.currentElevationZ = "none";

      const viewElevation = Number(view.elevation ?? view.z ?? 0);
      const tol = this.getActiveViewTolerance?.() ?? 0.001;

      const storyIndex = this.stories?.findIndex((story) => {
        const storyElevation = Number(story.elevation ?? 0);

        return (
          Math.abs(storyElevation - viewElevation) <= tol || story.name === view.storyName || story.id === view.storyId
        );
      });

      if (storyIndex >= 0) {
        const story = this.stories[storyIndex];

        this.activeStory = storyIndex;
        this.currentStory = story.name;
        this.currentZ = Number(story.elevation ?? viewElevation);
      } else {
        this.currentZ = viewElevation;
      }
    }

    // =====================================================
    // VIEW > ELEVACIÓN X
    // Letras A, B, C... plano Y-Z con X fijo.
    // =====================================================
    else if (view.type === "elevation" && view.axis === "X") {
      this.currentViewMode = "elevationX";
      this.currentElevationZ = view.label;
      this.currentElevationX = "none";
    }

    // =====================================================
    // VIEW > ELEVACIÓN Y
    // Números 1, 2, 3... plano X-Z con Y fijo.
    // =====================================================
    else if (view.type === "elevation" && view.axis === "Y") {
      this.currentViewMode = "elevationY";
      this.currentElevationX = view.label;
      this.currentElevationZ = "none";
    }

    // Si es Frame 3D entre vistas, mantiene el punto inicial.
    // Si es un estado normal, vuelve a selección.
    // =====================================================
    if (shouldPreserveCurrentState && preservedState) {
      this.currentState = preservedState;

      if (typeof this.currentState.onViewChanged === "function") {
        this.currentState.onViewChanged(this, view);
      }
    } else {
      this.currentState = this.idleState;

      if (this.currentState?.enter) {
        this.currentState.enter();
      }
    }

    console.log("👁️ Vista activa cambiada:", {
      activeViewIndex: this.activeViewIndex,
      view,
      currentViewMode: this.currentViewMode,
      activeStory: this.activeStory,
      currentStory: this.currentStory,
      currentZ: this.currentZ,
      currentElevationX: this.currentElevationX,
      currentElevationZ: this.currentElevationZ,
      preservedState: shouldPreserveCurrentState,
      currentState: this.currentState?.constructor?.name,
    });

    this.rebuild3DGridSnapPointsSoon?.("view change");

    this.redraw?.();
    this.refresh3DActiveView?.("setViewFromSet");

    if (typeof this.requestSync3D === "function") {
      this.requestSync3D("setViewFromSet");
    } else {
      this.sync3D?.();
    }
  },

  // =====================================================
  // DRAW > ACTIVAR FRAME 3D ENTRE PLANTAS Y ELEVACIONES
  // Activa el modo especial para dibujar barras entre vistas distintas.
  // =====================================================
  activateCrossViewFrameDrawing() {
    if (!this.crossViewFrameDrawingState) {
      this.showMessage?.("No existe crossViewFrameDrawingState. Revisa el import y la instancia.", "warning");
      return;
    }

    this.clearAllSelections?.();
    this.setState(this.crossViewFrameDrawingState);

    this.showMessage?.("Frame 3D entre vistas activado: haz clic en el primer punto.");

    console.log("✅ Modo CrossViewFrameDrawingState activado:", {
      currentState: this.currentState?.constructor?.name,
      preserveOnViewChange: this.currentState?.preserveOnViewChange,
    });
  },

  findClosestGridValue(values = [], labels = [], target = 0, tolerance = 0.3) {
    if (!values || values.length === 0) return null;

    let bestIndex = -1;
    let bestDistance = Infinity;

    values.forEach((value, index) => {
      const d = Math.abs(Number(value) - Number(target));
      if (d < bestDistance) {
        bestDistance = d;
        bestIndex = index;
      }
    });

    if (bestIndex === -1 || bestDistance > tolerance) return null;

    return {
      index: bestIndex,
      value: Number(values[bestIndex]),
      label: labels?.[bestIndex] ?? String(bestIndex + 1),
      distance: bestDistance,
    };
  },

  findClosestStoryLevel(targetZ = 0, tolerance = 0.3) {
    const ref = this.referenceGrid;
    if (!ref) return null;

    const storyCount = Number(ref.storyCount || 0);
    const storyHeight = Number(ref.storyHeight || 0);

    let levels = [{ label: "BASE", z: 0 }];

    for (let i = 1; i <= storyCount; i++) {
      levels.push({
        label: `STORY${i}`,
        z: i * storyHeight,
      });
    }

    let best = null;
    let bestDistance = Infinity;

    levels.forEach((level) => {
      const d = Math.abs(level.z - Number(targetZ));
      if (d < bestDistance) {
        bestDistance = d;
        best = { ...level, distance: d };
      }
    });

    if (!best || best.distance > tolerance) return null;

    return best;
  },

  getFixedCoordinateForActiveElevation() {
    const view = this.viewSet?.[this.activeViewIndex];
    const ref = this.referenceGrid;
    if (!ref || !view) return 0;

    // NÚMEROS => eje Y fijo
    if (view.axis === "Y") {
      const idx = (ref.yLabels || []).findIndex((label) => String(label) === String(view.label));
      if (idx >= 0) return Number(ref.yPositions[idx] || 0);
    }

    // LETRAS => eje X fijo
    if (view.axis === "X") {
      const idx = (ref.xLabels || []).findIndex((label) => String(label) === String(view.label));
      if (idx >= 0) return Number(ref.xPositions[idx] || 0);
    }

    return 0;
  },

  updateElevationGridSnap(mouseWorld, mouseScreen) {
    const view = this.viewSet?.[this.activeViewIndex];
    const ref = this.referenceGrid;

    if (!view || !ref) {
      this.activeGridPoint = null;
      return;
    }

    const toleranceX = 12 / (this.grid.scaleX || 1);
    const toleranceY = 12 / (this.grid.scaleY || 1);

    const snapZ = this.findClosestStoryLevel(mouseWorld.y, toleranceY);

    if (!snapZ) {
      this.activeGridPoint = null;
      return;
    }

    // ELEVACIÓN NUMÉRICA => plano X-Z => Y fijo
    if (this.currentViewMode === "elevationY") {
      const fixedY = this.getFixedCoordinateForActiveElevation();

      const snapX = this.findClosestGridValue(ref.xPositions || [], ref.xLabels || [], mouseWorld.x, toleranceX);

      if (!snapX) {
        this.activeGridPoint = null;
        return;
      }

      this.activeGridPoint = {
        x: snapX.value,
        y: fixedY,
        z: snapZ.z,
        xGridId: snapX.label,
        yGridId: String(view.label),
        storyLabel: snapZ.label,
        label: `Grid Point ${snapX.label} ${view.label}`,
        source: "elevation-xz",
      };

      this.statusCoordinates = this.formatCoordinates(snapX.value, fixedY, snapZ.z);
      return;
    }

    // ELEVACIÓN POR LETRAS => plano Y-Z => X fijo
    if (this.currentViewMode === "elevationX") {
      const fixedX = this.getFixedCoordinateForActiveElevation();

      const snapY = this.findClosestGridValue(ref.yPositions || [], ref.yLabels || [], mouseWorld.x, toleranceX);

      if (!snapY) {
        this.activeGridPoint = null;
        return;
      }

      this.activeGridPoint = {
        x: fixedX,
        y: snapY.value,
        z: snapZ.z,
        xGridId: String(view.label),
        yGridId: snapY.label,
        storyLabel: snapZ.label,
        label: `Grid Point ${view.label} ${snapY.label}`,
        source: "elevation-yz",
      };

      this.statusCoordinates = this.formatCoordinates(fixedX, snapY.value, snapZ.z);
      return;
    }

    this.activeGridPoint = null;
  },

  // <<<<<<< HEAD
  //   // ------------------------------------------------------------------
  //   // 20. MÉTODOS DE DIBUJO DE ELEVACIONES (2D)
  //   // ------------------------------------------------------------------
  // =======

  setStory(id) {
    const storyIndex = Number(id);
    const story = this.stories?.[storyIndex];

    this.activeStory = storyIndex;

    if (story) {
      this.currentStory = story.name;
      this.currentZ = Number(story.elevation ?? 0);
    }

    // Buscar la vista de planta que corresponde a ese piso
    const activeZ = Number(this.currentZ ?? 0);
    const tol = this.getActiveViewTolerance?.() ?? 0.001;

    const planViewIndex = this.viewSet?.findIndex((view) => {
      if (view.type !== "plan") return false;

      const viewElevation = Number(view.elevation ?? view.z ?? 0);

      return (
        Math.abs(viewElevation - activeZ) <= tol ||
        view.storyIndex === storyIndex ||
        view.storyName === story?.name ||
        view.name === story?.name
      );
    });

    if (planViewIndex >= 0) {
      this.activeViewIndex = planViewIndex;
    }

    this.clearAllSelections?.();

    console.log("Nivel activo:", {
      activeStory: this.activeStory,
      currentStory: this.currentStory,
      currentZ: this.currentZ,
      activeViewIndex: this.activeViewIndex,
      activeView: this.viewSet?.[this.activeViewIndex],
    });

    this.redraw?.();
    this.sync3D?.();
  },

  requestSync3D(reason = "sync3D") {
    if (this.syncPending) return;

    this.syncPending = true;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        try {
          const viewer = getViewer3DState?.();

          if (viewer?.initialized && viewer?.scene) {
            this.sync3D?.();
          }
        } catch (error) {
          console.warn("⚠️ No se pudo sincronizar 3D:", reason, error);
        } finally {
          this.syncPending = false;
        }
      });
    });
  },

  refresh3DActiveView(reason = "refresh3DActiveView") {
    // Cada cambio de vista genera un token nuevo.
    // Si el usuario cambia vistas rápido, los tokens anteriores quedan cancelados.
    this.view3DUpdateToken = Number(this.view3DUpdateToken || 0) + 1;
    const token = this.view3DUpdateToken;

    // Cancelar actualización pendiente anterior
    if (this.view3DUpdateTimer) {
      clearTimeout(this.view3DUpdateTimer);
      this.view3DUpdateTimer = null;
    }

    // Esperar un poco para no reconstruir 3D en cada clic rápido
    this.view3DUpdateTimer = setTimeout(() => {
      requestAnimationFrame(() => {
        try {
          // Si ya hubo otro cambio de vista después, este update queda anulado
          if (token !== this.view3DUpdateToken) return;

          const viewer = getViewer3DState?.();

          if (!viewer?.initialized || !viewer?.scene) {
            return;
          }

          // IMPORTANTE:
          // No llamamos drawReferenceGrid3D aquí directamente.
          // sync3D ya debe encargarse de actualizar lo necesario.
          this.sync3D?.();

          console.log("✅ 3D actualizado por cambio de vista:", {
            reason,
            activeViewIndex: this.activeViewIndex,
            currentViewMode: this.currentViewMode,
            activeStory: this.activeStory,
            currentStory: this.currentStory,
            currentZ: this.currentZ,
            currentElevationX: this.currentElevationX,
            currentElevationZ: this.currentElevationZ,
          });
        } catch (error) {
          console.warn("⚠️ No se pudo actualizar vista 3D:", reason, error);
        } finally {
          this.view3DUpdateTimer = null;
        }
      });
    }, 350);
  },

  // =====================================================
  // 3D SNAP > RECONSTRUIR SNAP POINTS 3D DESDE cad_sys
  // Llama a la función global creada en viewer3d.js.
  // Tiene reintentos por si Babylon todavía no terminó de iniciar.
  // =====================================================
  rebuild3DGridSnapPointsSoon(reason = "manual", attempts = 8) {
    const run = () => {
      const viewer = getViewer3DState?.();

      if (!viewer?.initialized || !viewer?.scene) {
        if (attempts > 0) {
          setTimeout(() => {
            this.rebuild3DGridSnapPointsSoon?.(reason, attempts - 1);
          }, 300);
        }

        return;
      }

      if (typeof window.__jhRebuild3DGridSnapPoints !== "function") {
        console.warn("⚠️ window.__jhRebuild3DGridSnapPoints no está disponible. Revisa viewer3d.js");
        return;
      }

      window.__jhRebuild3DGridSnapPoints(this);

      console.log("✅ Snap Points 3D reconstruidos desde cad_sys:", {
        reason,
        xGrids: this.referenceGrid?.xGrids?.length || 0,
        yGrids: this.referenceGrid?.yGrids?.length || 0,
        stories: this.stories?.length || 0,
      });
    };

    setTimeout(run, 250);
  },

  // =====================================================
  // SELECTION > LIMPIAR TODA LA SELECCIÓN
  // Versión única y activa.
  // Limpia nodos, barras, áreas, dimensiones, estados internos,
  // MoveObjectState, ReshapeObjectState y highlights 3D.
  // =====================================================

};
