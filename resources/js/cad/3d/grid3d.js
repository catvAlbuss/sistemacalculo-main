import * as BABYLON from "@babylonjs/core";
import { MeshBuilder, Vector3, Color3, TransformNode } from "@babylonjs/core";
import { getViewer3DState } from "./viewer3d.js";
// import { createSimpleAxisLabel } from "./axes3d.js";
// Al inicio de grid3d.js, agrega estas importaciones
import { createSimpleAxisLabel, createStoryLabel3D, createElevationLabel3D } from "./axes3d.js";

const COLORS = {
  base: new BABYLON.Color3(0.18, 0.22, 0.32),
  ref: new BABYLON.Color3(0.32, 0.38, 0.5),
  active: new BABYLON.Color3(0.15, 0.55, 1.0),
  axisX: new BABYLON.Color3(1, 0.2, 0.2),
  axisY: new BABYLON.Color3(0.2, 1, 0.2),
  axisZ: new BABYLON.Color3(0.2, 0.8, 1),
  text: new BABYLON.Color3(0.75, 0.85, 1),
};

function getScene() {
  return getViewer3DState().scene;
}

function registerElement(mesh) {
  if (!mesh) return null;
  const viewer = getViewer3DState();
  viewer.elements.push(mesh);
  return mesh;
}

function mapToBabylon(x, y, z = 0) {
  // lógico: x, y, z
  // Babylon: x, z, y
  return new BABYLON.Vector3(x, z, y);
}

function createLine(name, p1, p2, color, alpha = 1) {
  const scene = getScene();
  if (!scene) return null;

  const line = BABYLON.MeshBuilder.CreateLines(name, { points: [p1, p2], updatable: false }, scene);

  line.color = color;
  line.alpha = alpha;
  line.isPickable = false;

  return registerElement(line);
}

function createPolyline(name, points, color, alpha = 1, closed = false) {
  const scene = getScene();
  if (!scene) return null;

  const pts = closed ? [...points, points[0]] : points;

  const line = BABYLON.MeshBuilder.CreateLines(name, { points: pts, updatable: false }, scene);

  line.color = color;
  line.alpha = alpha;
  line.isPickable = false;

  return registerElement(line);
}

function createLabel(name, text, color, position) {
  const scene = getScene();
  if (!scene || !createSimpleAxisLabel) return null;

  let label = null;

  try {
    // Pasar posición correctamente
    label = createSimpleAxisLabel(text, color, scene, position);
  } catch (error) {
    console.warn(`Error creating label ${name}:`, error);
    label = null;
  }

  if (!label) return null;

  label.name = name;
  label.isPickable = false;
  return registerElement(label);
}

function clearByPrefix(prefixes) {
  const viewer = getViewer3DState();

  viewer.elements = viewer.elements.filter((el) => {
    const shouldRemove = prefixes.some((prefix) => el?.name?.startsWith(prefix));

    if (shouldRemove) {
      if (el?.dispose) el.dispose();
      return false;
    }

    return true;
  });
}

// También crea una función específica para limpiar labels
function clearAllLabels() {
  const viewer = getViewer3DState();
  if (!viewer || !viewer.elements) return;

  viewer.elements = viewer.elements.filter((el) => {
    // Eliminar elementos que son labels
    const isStoryLabel = el?.name?.startsWith("story_label_");
    const isElevLabel = el?.name?.startsWith("elev_label_");
    const isRefLabel = el?.name?.startsWith("ref_") && (el?.name?.includes("label") || el?.name?.includes("Label"));
    const isStoryMat = el?.material?.name?.startsWith("story_mat_");
    const isElevMat = el?.material?.name?.startsWith("elev_mat_");

    if (isStoryLabel || isElevLabel || isRefLabel || isStoryMat || isElevMat) {
      if (el?.dispose) el.dispose();
      return false;
    }
    return true;
  });
}

function getReferenceBounds(refGrid) {
  const minX = Math.min(...refGrid.xPositions);
  const maxX = Math.max(...refGrid.xPositions);
  const minY = Math.min(...refGrid.yPositions);
  const maxY = Math.max(...refGrid.yPositions);

  return { minX, maxX, minY, maxY };
}

// Niveles REALES del modelo (this.stories, respeta alturas de piso distintas)
// con fallback a storyCount*storyHeight uniforme (grilla dibujada a mano, sin
// stories importados). Sin esto, un modelo con pisos de altura distinta (p.ej.
// Story1=3.36m, Story2=2.93m) dibujaba el nivel de Story2 en 2*3.36=6.72 en
// vez de 3.36+2.93=6.29, desalineando la grilla con la geometría importada.
function getStoryLevels(refGrid, stories = []) {
  if (Array.isArray(stories) && stories.length) {
    const map = new Map();

    stories.forEach((s) => {
      const z = Number(s.elevation ?? s.z ?? 0);
      if (!Number.isFinite(z)) return;
      const key = z.toFixed(6);
      if (!map.has(key)) map.set(key, { z, name: String(s.name || "") });
    });

    if (!map.has((0).toFixed(6))) map.set((0).toFixed(6), { z: 0, name: "Base" });

    return [...map.values()].sort((a, b) => a.z - b.z);
  }

  const storyCount = Number(refGrid?.storyCount ?? 0);
  const storyHeight = Number(refGrid?.storyHeight ?? 3);
  const levels = [];

  for (let i = 0; i <= storyCount; i++) {
    levels.push({ z: i * storyHeight, name: i === 0 ? "Base" : `Story ${i}` });
  }

  return levels;
}

function createHorizontalGrid(prefix, xPositions, yPositions, z, color, alpha = 0.3) {
  const minX = Math.min(...xPositions);
  const maxX = Math.max(...xPositions);
  const minY = Math.min(...yPositions);
  const maxY = Math.max(...yPositions);

  xPositions.forEach((x, i) => {
    createLine(`${prefix}_x_${i}`, mapToBabylon(x, minY, z), mapToBabylon(x, maxY, z), color, alpha);
  });

  yPositions.forEach((y, i) => {
    createLine(`${prefix}_y_${i}`, mapToBabylon(minX, y, z), mapToBabylon(maxX, y, z), color, alpha);
  });

  createPolyline(
    `${prefix}_border`,
    [
      mapToBabylon(minX, minY, z),
      mapToBabylon(maxX, minY, z),
      mapToBabylon(maxX, maxY, z),
      mapToBabylon(minX, maxY, z),
    ],
    color,
    alpha + 0.1,
    true,
  );
}

function createVerticalGridX(prefix, xConst, yPositions, maxZ, levels, color, alpha = 0.3) {
  const minY = Math.min(...yPositions);
  const maxY = Math.max(...yPositions);

  // Rungs horizontales en las elevaciones REALES de los niveles (no un paso
  // uniforme) — ver comentario en getStoryLevels. Guarda contra lista vacía
  // (aún no se corrió "Generar Pisos"): dibuja al menos el rung en z=0.
  const zs = Array.isArray(levels) && levels.length ? levels.map((l) => l.z) : [0];
  zs.forEach((z) => {
    createLine(
      `${prefix}_h_${z.toFixed(2)}`,
      mapToBabylon(xConst, minY, z),
      mapToBabylon(xConst, maxY, z),
      color,
      alpha,
    );
  });

  yPositions.forEach((y, i) => {
    createLine(`${prefix}_v_${i}`, mapToBabylon(xConst, y, 0), mapToBabylon(xConst, y, maxZ), color, alpha);
  });

  createPolyline(
    `${prefix}_border`,
    [
      mapToBabylon(xConst, minY, 0),
      mapToBabylon(xConst, maxY, 0),
      mapToBabylon(xConst, maxY, maxZ),
      mapToBabylon(xConst, minY, maxZ),
    ],
    color,
    alpha + 0.1,
    true,
  );
}

function createVerticalGridY(prefix, yConst, xPositions, maxZ, levels, color, alpha = 0.3) {
  const minX = Math.min(...xPositions);
  const maxX = Math.max(...xPositions);

  // Ver comentario equivalente en createVerticalGridX.
  const zs = Array.isArray(levels) && levels.length ? levels.map((l) => l.z) : [0];
  zs.forEach((z) => {
    createLine(
      `${prefix}_h_${z.toFixed(2)}`,
      mapToBabylon(minX, yConst, z),
      mapToBabylon(maxX, yConst, z),
      color,
      alpha,
    );
  });

  xPositions.forEach((x, i) => {
    createLine(`${prefix}_v_${i}`, mapToBabylon(x, yConst, 0), mapToBabylon(x, yConst, maxZ), color, alpha);
  });

  createPolyline(
    `${prefix}_border`,
    [
      mapToBabylon(minX, yConst, 0),
      mapToBabylon(maxX, yConst, 0),
      mapToBabylon(maxX, yConst, maxZ),
      mapToBabylon(minX, yConst, maxZ),
    ],
    color,
    alpha + 0.1,
    true,
  );
}

function drawStoryLabels(refGrid, maxZ, levels) {
  const { minX, minY } = getReferenceBounds(refGrid);
  const offsetX = minX - refGrid.xSpacing * 0.45;
  const offsetY = minY - refGrid.ySpacing * 0.45;

  levels.forEach((level, i) => {
    const label = i === 0 ? "BASE" : (level.name || `P${i}`);
    // Asegurar que z no supere maxZ
    const finalZ = Math.min(level.z, maxZ);
    createLabel(`ref_story_label_${i}`, label, COLORS.text, mapToBabylon(offsetX, offsetY, finalZ));
  });
}

function drawAxisLabels(refGrid) {
  const { minX, minY } = getReferenceBounds(refGrid);
  const xOffset = refGrid.ySpacing * 0.18;
  const yOffset = refGrid.xSpacing * 0.18;

  refGrid.xPositions.forEach((x, i) => {
    createLabel(`ref_x_label_${i}`, refGrid.xLabels[i], COLORS.text, mapToBabylon(x, minY - xOffset, 0));
  });

  refGrid.yPositions.forEach((y, i) => {
    createLabel(`ref_y_label_${i}`, String(refGrid.yLabels[i]), COLORS.text, mapToBabylon(minX - yOffset, y, 0));
  });
}

function drawWorldAxes(refGrid, maxZ) {
  const { minX, minY } = getReferenceBounds(refGrid);
  const axisLenX = Math.max(...refGrid.xPositions) - minX + refGrid.xSpacing * 0.6;
  const axisLenY = Math.max(...refGrid.yPositions) - minY + refGrid.ySpacing * 0.6;
  const axisLenZ = maxZ + refGrid.storyHeight * 0.5;

  createLine("ref_axis_x", mapToBabylon(minX, minY, 0), mapToBabylon(minX + axisLenX, minY, 0), COLORS.axisX, 0.9);

  createLine("ref_axis_y", mapToBabylon(minX, minY, 0), mapToBabylon(minX, minY + axisLenY, 0), COLORS.axisY, 0.9);

  createLine("ref_axis_z", mapToBabylon(minX, minY, 0), mapToBabylon(minX, minY, axisLenZ), COLORS.axisZ, 0.9);

  createLabel("ref_axis_x_label", "X", COLORS.axisX, mapToBabylon(minX + axisLenX + 0.2, minY, 0));
  createLabel("ref_axis_y_label", "Y", COLORS.axisY, mapToBabylon(minX, minY + axisLenY + 0.2, 0));
  createLabel("ref_axis_z_label", "Z", COLORS.axisZ, mapToBabylon(minX, minY, axisLenZ + 0.2));
}

function drawActiveView(refGrid, context) {
  const view = context?.viewSet?.[context?.activeViewIndex];
  if (!view) return;

  const levels = getStoryLevels(refGrid, context?.stories);
  const maxZ = levels[levels.length - 1]?.z ?? 0;

  clearByPrefix(["activeview_"]);

  if (view.type === "plan") {
    const z = view.elevation ?? 0;

    createHorizontalGrid("activeview_plan", refGrid.xPositions, refGrid.yPositions, z, COLORS.active, 1);

    createLabel(
      "activeview_label",
      view.name,
      COLORS.active,
      mapToBabylon(Math.min(...refGrid.xPositions), Math.min(...refGrid.yPositions) - refGrid.ySpacing * 0.7, z),
    );
  }

  if (view.type === "elevation") {
    if (view.axis === "X") {
      createVerticalGridX(
        "activeview_elev_x",
        view.value,
        refGrid.yPositions,
        maxZ,
        levels,
        COLORS.active,
        1,
      );

      createLabel(
        "activeview_label",
        view.name,
        COLORS.active,
        mapToBabylon(view.value, Math.min(...refGrid.yPositions) - refGrid.ySpacing * 0.45, maxZ),
      );
    }

    if (view.axis === "Y") {
      createVerticalGridY(
        "activeview_elev_y",
        view.value,
        refGrid.xPositions,
        maxZ,
        levels,
        COLORS.active,
        1,
      );

      createLabel(
        "activeview_label",
        view.name,
        COLORS.active,
        mapToBabylon(Math.min(...refGrid.xPositions) - refGrid.xSpacing * 0.45, view.value, maxZ),
      );
    }
  }
}

function drawReferenceStructure(refGrid, stories) {
  const levels = getStoryLevels(refGrid, stories);
  const maxZ = levels[levels.length - 1]?.z ?? 0;

  // Planos horizontales por nivel (elevación REAL de cada piso)
  levels.forEach((level, i) => {
    createHorizontalGrid(
      `ref_floor_${i}`,
      refGrid.xPositions,
      refGrid.yPositions,
      level.z,
      COLORS.ref,
      0.22,
    );
  });

  // Planos verticales perimetrales
  createVerticalGridX(
    "ref_elev_x_min",
    Math.min(...refGrid.xPositions),
    refGrid.yPositions,
    maxZ,
    levels,
    COLORS.ref,
    0.16,
  );

  createVerticalGridX(
    "ref_elev_x_max",
    Math.max(...refGrid.xPositions),
    refGrid.yPositions,
    maxZ,
    levels,
    COLORS.ref,
    0.16,
  );

  createVerticalGridY(
    "ref_elev_y_min",
    Math.min(...refGrid.yPositions),
    refGrid.xPositions,
    maxZ,
    levels,
    COLORS.ref,
    0.16,
  );

  createVerticalGridY(
    "ref_elev_y_max",
    Math.max(...refGrid.yPositions),
    refGrid.xPositions,
    maxZ,
    levels,
    COLORS.ref,
    0.16,
  );

  // 🔧 Ahora maxZ ya está definido
  drawAxisLabels(refGrid);
  drawStoryLabels(refGrid, maxZ, levels);
  drawWorldAxes(refGrid, maxZ);

  // ========== NUEVO: Dibujar labels de pisos y elevaciones en 3D ==========
  drawStoryElevationLabels(refGrid, levels);
  drawAxisElevationLabels(refGrid);
}

export function clearReferenceGrid3D() {
  clearByPrefix(["ref_", "activeview_"]);

  // Limpiar labels de pisos y elevaciones
  const viewer = getViewer3DState();
  if (viewer && viewer.elements) {
    viewer.elements = viewer.elements.filter((el) => {
      const isStoryLabel = el?.name?.startsWith("story_label_");
      const isElevLabel = el?.name?.startsWith("elev_label_");
      const isStoryMat = el?.material?.name?.startsWith("story_mat_");
      const isElevMat = el?.material?.name?.startsWith("elev_mat_");

      if (isStoryLabel || isElevLabel || isStoryMat || isElevMat) {
        if (el?.dispose) el.dispose();
        return false;
      }
      return true;
    });
  }
}

// Firma de la ESTRUCTURA de la grilla (posiciones, pisos, altura). Solo cambia
// si el usuario edita la grilla/stories, NO al cambiar de vista ni al dibujar.
// Incluye las elevaciones reales (levels) — sin esto, importar un modelo con
// alturas de piso distintas a las anteriores no invalidaba la caché si
// storyCount/storyHeight quedaban iguales.
function referenceStructureSignature(refGrid, levels) {
  return JSON.stringify({
    x: refGrid.xPositions,
    y: refGrid.yPositions,
    n: refGrid.storyCount,
    h: refGrid.storyHeight,
    levels: levels.map((l) => l.z),
  });
}

export function drawReferenceGrid3D(context, options = {}) {
  const scene = getScene();
  if (!scene || !context?.referenceGrid) return;

  const rawGrid = context.referenceGrid;
  const hasX = rawGrid.xPositions?.length > 0;
  const hasY = rawGrid.yPositions?.length > 0;

  // Antes se exigía tener AMBAS direcciones para dibujar algo — significaba
  // que si el usuario recién trazó un eje X (a mano, uno a la vez) no se veía
  // NADA en 3D hasta dibujar también un eje Y. Ahora, si falta una dirección,
  // se le da una extensión sintética (NO se persiste, solo para renderizar)
  // así el eje recién dibujado se ve de inmediato.
  if (!hasX && !hasY) return;

  const refGrid = (hasX && hasY) ? rawGrid : (() => {
    const otherPositions = hasX ? rawGrid.xPositions : rawGrid.yPositions;
    const span = otherPositions.length > 1
      ? Math.max(...otherPositions) - Math.min(...otherPositions)
      : 10;
    const fallback = [0, Math.max(span, 5)];
    return {
      ...rawGrid,
      xPositions: hasX ? rawGrid.xPositions : fallback,
      yPositions: hasY ? rawGrid.yPositions : fallback,
    };
  })();

  // ── OPTIMIZACIÓN: la estructura estática (mallas ref_*) es IDÉNTICA en todas
  // las vistas. Solo se reconstruye si cambió la definición de la grilla
  // (firma) o si aún no existe. Así el cambio de vista y el dibujo de vigas
  // NO recrean toda la grilla: únicamente se actualiza el resaltado azul de la
  // vista activa (drawActiveView, que toca solo las mallas activeview_*).
  const levels = getStoryLevels(refGrid, context.stories);
  const signature = referenceStructureSignature(refGrid, levels);
  const structureExists = scene.meshes?.some((m) => m?.name?.startsWith("ref_floor_0"));
  const rebuildStructure =
    options.forceStructure === true ||
    scene.__refGridSignature !== signature ||
    !structureExists;

  if (rebuildStructure) {
    // 🔧 Limpiar completamente antes de redibujar
    clearReferenceGrid3D();

    // También limpiar labels específicos que puedan quedar
    const viewer = getViewer3DState();
    if (viewer && viewer.elements) {
      viewer.elements = viewer.elements.filter((el) => {
        const shouldRemove =
          el?.name?.startsWith("story_label_") ||
          el?.name?.startsWith("elev_label_") ||
          (el?.material && el.material.name && el.material.name.startsWith("story_mat_")) ||
          (el?.material && el.material.name && el.material.name.startsWith("elev_mat_"));
        if (shouldRemove && el?.dispose) {
          el.dispose();
          return false;
        }
        return true;
      });
    }

    drawReferenceStructure(refGrid, context.stories);
    scene.__refGridSignature = signature;
  }

  // El resaltado azul de la vista activa siempre se actualiza (barato).
  drawActiveView(refGrid, context);
}

// Actualiza SOLO el resaltado azul de la vista activa, sin tocar la estructura.
// Útil para el cambio de vista (base ↔ piso N) sin reconstruir la grilla.
export function updateActiveView3D(context) {
  const scene = getScene();
  if (!scene || !context?.referenceGrid) return;
  if (!context.referenceGrid.xPositions?.length) return;
  drawActiveView(context.referenceGrid, context);
}

export function createFull3DGrid(scene) {
  if (!scene) return;

  console.log("📏 Creando grid 3D base");

  const size = 10;
  const spacing = 1;

  // Solo el plano XY (planta) — antes también dibujaba los planos verticales
  // XZ e YZ (paredes), que el usuario no quiere ver por defecto.
  for (let x = -size; x <= size; x += spacing) {
    createLine(
      `ref_base_xy_x_${x}`,
      new BABYLON.Vector3(x, 0, -size),
      new BABYLON.Vector3(x, 0, size),
      COLORS.base,
      0.12,
    );
  }

  for (let z = -size; z <= size; z += spacing) {
    createLine(
      `ref_base_xy_z_${z}`,
      new BABYLON.Vector3(-size, 0, z),
      new BABYLON.Vector3(size, 0, z),
      COLORS.base,
      0.12,
    );
  }

  // Triada de ejes X/Y/Z SIEMPRE visible en el origen, independiente de si
  // existe una grilla de referencia (drawReferenceStructure/drawAxisLabels
  // requieren xPositions/yPositions no vacíos). Da orientación mínima mientras
  // el usuario arma su grilla a mano sobre un plano importado.
  const axisLen = 2;
  createLine("origin_axis_x", mapToBabylon(0, 0, 0), mapToBabylon(axisLen, 0, 0), COLORS.axisX, 1);
  createLine("origin_axis_y", mapToBabylon(0, 0, 0), mapToBabylon(0, axisLen, 0), COLORS.axisY, 1);
  createLine("origin_axis_z", mapToBabylon(0, 0, 0), mapToBabylon(0, 0, axisLen), COLORS.axisZ, 1);
  createLabel("origin_axis_x_label", "X", COLORS.axisX, mapToBabylon(axisLen + 0.3, 0, 0));
  createLabel("origin_axis_y_label", "Y", COLORS.axisY, mapToBabylon(0, axisLen + 0.3, 0));
  createLabel("origin_axis_z_label", "Z", COLORS.axisZ, mapToBabylon(0, 0, axisLen + 0.3));

  console.log("✅ Grid base 3D creado");
}

function modelToBabylon(x, y, z = 0) {
  // Mantén la misma convención de tu proyecto:
  // modelo estructural: (x, y, z)
  // Babylon:           (x, z, y)
  return new Vector3(x, z, y);
}

function getStoryElevations(referenceGrid, stories = []) {
  if (Array.isArray(stories) && stories.length) {
    const values = [0, ...stories.map((s) => Number(s.elevation ?? 0))];
    return [...new Set(values.map((v) => Number(v.toFixed(6))))];
  }

  const storyCount = Number(referenceGrid?.storyCount ?? 0);
  const storyHeight = Number(referenceGrid?.storyHeight ?? 3);

  const values = [];
  for (let i = 0; i <= storyCount; i++) {
    values.push(i * storyHeight);
  }

  return [...new Set(values.map((v) => Number(v.toFixed(6))))];
}

export function clearCustomGeneralGrids3D(scene) {
  if (!scene) return;

  scene.meshes.filter((m) => m.metadata?.type === "customGeneralGrid3D").forEach((m) => m.dispose());

  scene.transformNodes.filter((n) => n.metadata?.type === "customGeneralGrid3DRoot").forEach((n) => n.dispose());
}

export function drawCustomGeneralGrids3D(scene, referenceGrid, stories = []) {
  if (!scene || !referenceGrid) return;

  const allGeneralGrids = referenceGrid.generalGrids || [];
  const customLines = allGeneralGrids.filter((line) => line.visible !== false && line.source === "custom");
  const elevations = getStoryElevations(referenceGrid, stories);

  // Cache por firma: no disponer+recrear si no cambiaron las líneas custom ni
  // los niveles (evita rehacer estas mallas en cada sync3D/cambio de vista).
  const signature = JSON.stringify({
    lines: customLines.map((l) => [l.id, l.x1, l.y1, l.x2, l.y2]),
    elevations,
  });
  const rootExists = scene.transformNodes?.some((n) => n?.metadata?.type === "customGeneralGrid3DRoot");
  if (scene.__customGridSignature === signature && (rootExists || !customLines.length)) {
    return;
  }

  clearCustomGeneralGrids3D(scene);
  scene.__customGridSignature = signature;

  if (!customLines.length) return;

  const root = new TransformNode("customGeneralGrid3DRoot", scene);
  root.metadata = { type: "customGeneralGrid3DRoot" };

  customLines.forEach((line) => {
    elevations.forEach((elev, index) => {
      const mesh = MeshBuilder.CreateDashedLines(
        `custom-general-grid-${line.id}-${index}`,
        {
          points: [modelToBabylon(line.x1, line.y1, elev), modelToBabylon(line.x2, line.y2, elev)],
          dashSize: 0.35,
          gapSize: 0.2,
          dashNb: 40,
          updatable: false,
        },
        scene,
      );

      mesh.color = new Color3(0.9, 0.9, 0.9);
      mesh.isPickable = false;
      mesh.parent = root;
      mesh.metadata = {
        type: "customGeneralGrid3D",
        gridId: line.id,
        elevation: elev,
      };
    });
  });
}

// Coloca estas funciones antes de drawReferenceStructure

function getStoryElevationLabels(refGrid, levels) {
  const labels = [];

  const { minX, minY } = getReferenceBounds(refGrid);
  const offsetX = minX - (refGrid.xSpacing || 1) * 0.6;
  const offsetY = minY - (refGrid.ySpacing || 1) * 0.6;

  levels.forEach((level, i) => {
    const z = level.z;
    const labelName = i === 0 ? "BASE" : (level.name || `PISO ${i}`).toUpperCase();
    const elevationText = `${labelName}\nEL. ${z.toFixed(2)}m`;

    const position = mapToBabylon(offsetX, offsetY, z);

    labels.push({
      text: elevationText,
      position: position,
      z: z,
      storyIndex: i,
    });
  });

  return labels;
}

function getAxisElevationLabels(refGrid) {
  const labels = [];
  const { minX, minY } = getReferenceBounds(refGrid);
  const offset = 1.2;

  // Labels para ejes X (Letras) - SOLO en la base
  if (refGrid.xPositions && refGrid.xLabels) {
    refGrid.xPositions.forEach((x, idx) => {
      const label = refGrid.xLabels[idx];
      labels.push({
        text: label,
        position: mapToBabylon(x, minY - offset, 0),
        type: "x_bottom",
      });
    });
  }

  // Labels para ejes Y (Números) - SOLO en la base
  if (refGrid.yPositions && refGrid.yLabels) {
    refGrid.yPositions.forEach((y, idx) => {
      const label = refGrid.yLabels[idx];
      labels.push({
        text: String(label),
        position: mapToBabylon(minX - offset, y, 0),
        type: "y_bottom",
      });
    });
  }

  return labels;
}

let lastDrawnStories = null;
let lastDrawnGrid = null;

function drawStoryElevationLabels(refGrid, levels) {
  const scene = getScene();
  if (!scene) return;

  // Limpiar labels de pisos anteriores ANTES de crear nuevos
  const viewer = getViewer3DState();
  if (viewer && viewer.elements) {
    viewer.elements = viewer.elements.filter((el) => {
      const isStoryLabel = el?.name?.startsWith("story_label_");
      if (isStoryLabel) {
        if (el?.dispose) el.dispose();
        return false;
      }
      return true;
    });
  }

  const storyLabels = getStoryElevationLabels(refGrid, levels);

  storyLabels.forEach((labelInfo) => {
    const label = createStoryLabel3D(labelInfo.text, labelInfo.position, scene, COLORS.text);
    if (label) {
      registerElement(label);
    }
  });
}

function drawAxisElevationLabels(refGrid) {
  const scene = getScene();
  if (!scene) return;

  const axisLabels = getAxisElevationLabels(refGrid);

  // Limpiar labels anteriores antes de crear nuevos
  const viewer = getViewer3DState();
  if (viewer && viewer.elements) {
    viewer.elements = viewer.elements.filter((el) => {
      const isElevLabel = el?.name?.startsWith("elev_label_");
      if (isElevLabel) {
        if (el?.dispose) el.dispose();
        return false;
      }
      return true;
    });
  }

  axisLabels.forEach((labelInfo) => {
    const label = createElevationLabel3D(labelInfo.text, labelInfo.position, scene, COLORS.text);
    if (label) {
      registerElement(label);
    }
  });
}
