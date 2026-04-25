import * as BABYLON from "@babylonjs/core";
import { MeshBuilder, Vector3, Color3, TransformNode } from "@babylonjs/core";
import { getViewer3DState } from "./viewer3d.js";
import { createSimpleAxisLabel } from "./axes3d.js";

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

  const line = BABYLON.MeshBuilder.CreateLines(
    name,
    { points: [p1, p2], updatable: false },
    scene,
  );

  line.color = color;
  line.alpha = alpha;
  line.isPickable = false;

  return registerElement(line);
}

function createPolyline(name, points, color, alpha = 1, closed = false) {
  const scene = getScene();
  if (!scene) return null;

  const pts = closed ? [...points, points[0]] : points;

  const line = BABYLON.MeshBuilder.CreateLines(
    name,
    { points: pts, updatable: false },
    scene,
  );

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
    label = createSimpleAxisLabel(text, color, scene);
  } catch {
    try {
      label = createSimpleAxisLabel(text, color, position, scene);
    } catch {
      label = null;
    }
  }

  if (!label) return null;

  label.name = name;

  if (label.position && position) {
    if (typeof label.position.copyFrom === "function") {
      label.position.copyFrom(position);
    } else {
      label.position = position;
    }
  }

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

function getReferenceBounds(refGrid) {
  const minX = Math.min(...refGrid.xPositions);
  const maxX = Math.max(...refGrid.xPositions);
  const minY = Math.min(...refGrid.yPositions);
  const maxY = Math.max(...refGrid.yPositions);

  return { minX, maxX, minY, maxY };
}

function createHorizontalGrid(prefix, xPositions, yPositions, z, color, alpha = 0.3) {
  const minX = Math.min(...xPositions);
  const maxX = Math.max(...xPositions);
  const minY = Math.min(...yPositions);
  const maxY = Math.max(...yPositions);

  xPositions.forEach((x, i) => {
    createLine(
      `${prefix}_x_${i}`,
      mapToBabylon(x, minY, z),
      mapToBabylon(x, maxY, z),
      color,
      alpha,
    );
  });

  yPositions.forEach((y, i) => {
    createLine(
      `${prefix}_y_${i}`,
      mapToBabylon(minX, y, z),
      mapToBabylon(maxX, y, z),
      color,
      alpha,
    );
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

function createVerticalGridX(prefix, xConst, yPositions, maxZ, storyHeight, color, alpha = 0.3) {
  const minY = Math.min(...yPositions);
  const maxY = Math.max(...yPositions);

  for (let z = 0; z <= maxZ + 0.0001; z += storyHeight) {
    createLine(
      `${prefix}_h_${z.toFixed(2)}`,
      mapToBabylon(xConst, minY, z),
      mapToBabylon(xConst, maxY, z),
      color,
      alpha,
    );
  }

  yPositions.forEach((y, i) => {
    createLine(
      `${prefix}_v_${i}`,
      mapToBabylon(xConst, y, 0),
      mapToBabylon(xConst, y, maxZ),
      color,
      alpha,
    );
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

function createVerticalGridY(prefix, yConst, xPositions, maxZ, storyHeight, color, alpha = 0.3) {
  const minX = Math.min(...xPositions);
  const maxX = Math.max(...xPositions);

  for (let z = 0; z <= maxZ + 0.0001; z += storyHeight) {
    createLine(
      `${prefix}_h_${z.toFixed(2)}`,
      mapToBabylon(minX, yConst, z),
      mapToBabylon(maxX, yConst, z),
      color,
      alpha,
    );
  }

  xPositions.forEach((x, i) => {
    createLine(
      `${prefix}_v_${i}`,
      mapToBabylon(x, yConst, 0),
      mapToBabylon(x, yConst, maxZ),
      color,
      alpha,
    );
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

function drawStoryLabels(refGrid, maxZ) {
  const { minX, minY } = getReferenceBounds(refGrid);
  const offsetX = minX - refGrid.xSpacing * 0.45;
  const offsetY = minY - refGrid.ySpacing * 0.45;

  for (let i = 0; i <= refGrid.storyCount; i++) {
    const z = i * refGrid.storyHeight;
    const label = i === 0 ? "BASE" : `P${i}`;
    createLabel(
      `ref_story_label_${i}`,
      label,
      COLORS.text,
      mapToBabylon(offsetX, offsetY, Math.min(z, maxZ)),
    );
  }
}

function drawAxisLabels(refGrid) {
  const { minX, minY } = getReferenceBounds(refGrid);
  const xOffset = refGrid.ySpacing * 0.18;
  const yOffset = refGrid.xSpacing * 0.18;

  refGrid.xPositions.forEach((x, i) => {
    createLabel(
      `ref_x_label_${i}`,
      refGrid.xLabels[i],
      COLORS.text,
      mapToBabylon(x, minY - xOffset, 0),
    );
  });

  refGrid.yPositions.forEach((y, i) => {
    createLabel(
      `ref_y_label_${i}`,
      String(refGrid.yLabels[i]),
      COLORS.text,
      mapToBabylon(minX - yOffset, y, 0),
    );
  });
}

function drawWorldAxes(refGrid, maxZ) {
  const { minX, minY } = getReferenceBounds(refGrid);
  const axisLenX = Math.max(...refGrid.xPositions) - minX + refGrid.xSpacing * 0.6;
  const axisLenY = Math.max(...refGrid.yPositions) - minY + refGrid.ySpacing * 0.6;
  const axisLenZ = maxZ + refGrid.storyHeight * 0.5;

  createLine(
    "ref_axis_x",
    mapToBabylon(minX, minY, 0),
    mapToBabylon(minX + axisLenX, minY, 0),
    COLORS.axisX,
    0.9,
  );

  createLine(
    "ref_axis_y",
    mapToBabylon(minX, minY, 0),
    mapToBabylon(minX, minY + axisLenY, 0),
    COLORS.axisY,
    0.9,
  );

  createLine(
    "ref_axis_z",
    mapToBabylon(minX, minY, 0),
    mapToBabylon(minX, minY, axisLenZ),
    COLORS.axisZ,
    0.9,
  );

  createLabel("ref_axis_x_label", "X", COLORS.axisX, mapToBabylon(minX + axisLenX + 0.2, minY, 0));
  createLabel("ref_axis_y_label", "Y", COLORS.axisY, mapToBabylon(minX, minY + axisLenY + 0.2, 0));
  createLabel("ref_axis_z_label", "Z", COLORS.axisZ, mapToBabylon(minX, minY, axisLenZ + 0.2));
}

function drawActiveView(refGrid, context) {
  const view = context?.viewSet?.[context?.activeViewIndex];
  if (!view) return;

  const maxZ = refGrid.storyCount * refGrid.storyHeight;

  clearByPrefix(["activeview_"]);

  if (view.type === "plan") {
    const z = view.elevation ?? 0;

    createHorizontalGrid(
      "activeview_plan",
      refGrid.xPositions,
      refGrid.yPositions,
      z,
      COLORS.active,
      1,
    );

    createLabel(
      "activeview_label",
      view.name,
      COLORS.active,
      mapToBabylon(
        Math.min(...refGrid.xPositions),
        Math.min(...refGrid.yPositions) - refGrid.ySpacing * 0.7,
        z,
      ),
    );
  }

  if (view.type === "elevation") {
    if (view.axis === "X") {
      createVerticalGridX(
        "activeview_elev_x",
        view.value,
        refGrid.yPositions,
        maxZ,
        refGrid.storyHeight,
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
        refGrid.storyHeight,
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

function drawReferenceStructure(refGrid) {
  const maxZ = refGrid.storyCount * refGrid.storyHeight;

  // Planos horizontales por nivel
  for (let i = 0; i <= refGrid.storyCount; i++) {
    createHorizontalGrid(
      `ref_floor_${i}`,
      refGrid.xPositions,
      refGrid.yPositions,
      i * refGrid.storyHeight,
      COLORS.ref,
      0.22,
    );
  }

  // Planos verticales perimetrales
  createVerticalGridX(
    "ref_elev_x_min",
    Math.min(...refGrid.xPositions),
    refGrid.yPositions,
    maxZ,
    refGrid.storyHeight,
    COLORS.ref,
    0.16,
  );

  createVerticalGridX(
    "ref_elev_x_max",
    Math.max(...refGrid.xPositions),
    refGrid.yPositions,
    maxZ,
    refGrid.storyHeight,
    COLORS.ref,
    0.16,
  );

  createVerticalGridY(
    "ref_elev_y_min",
    Math.min(...refGrid.yPositions),
    refGrid.xPositions,
    maxZ,
    refGrid.storyHeight,
    COLORS.ref,
    0.16,
  );

  createVerticalGridY(
    "ref_elev_y_max",
    Math.max(...refGrid.yPositions),
    refGrid.xPositions,
    maxZ,
    refGrid.storyHeight,
    COLORS.ref,
    0.16,
  );

  drawAxisLabels(refGrid);
  drawStoryLabels(refGrid, maxZ);
  drawWorldAxes(refGrid, maxZ);
}

export function clearReferenceGrid3D() {
  clearByPrefix(["ref_", "activeview_"]);
}

export function drawReferenceGrid3D(context) {
  const scene = getScene();
  if (!scene || !context?.referenceGrid) return;

  const refGrid = context.referenceGrid;

  if (!refGrid.xPositions?.length || !refGrid.yPositions?.length) return;

  clearReferenceGrid3D();
  drawReferenceStructure(refGrid);
  drawActiveView(refGrid, context);
}

export function createFull3DGrid(scene) {
  if (!scene) return;

  console.log("📏 Creando grid 3D base");

  const size = 10;
  const spacing = 1;

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

  for (let x = -size; x <= size; x += spacing) {
    createLine(
      `ref_base_xz_x_${x}`,
      new BABYLON.Vector3(x, -size, 0),
      new BABYLON.Vector3(x, size, 0),
      COLORS.base,
      0.06,
    );
  }

  for (let y = -size; y <= size; y += spacing) {
    createLine(
      `ref_base_xz_y_${y}`,
      new BABYLON.Vector3(-size, y, 0),
      new BABYLON.Vector3(size, y, 0),
      COLORS.base,
      0.06,
    );
  }

  for (let z = -size; z <= size; z += spacing) {
    createLine(
      `ref_base_yz_z_${z}`,
      new BABYLON.Vector3(0, -size, z),
      new BABYLON.Vector3(0, size, z),
      COLORS.base,
      0.06,
    );
  }

  for (let y = -size; y <= size; y += spacing) {
    createLine(
      `ref_base_yz_y_${y}`,
      new BABYLON.Vector3(0, y, -size),
      new BABYLON.Vector3(0, y, size),
      COLORS.base,
      0.06,
    );
  }

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

  scene.meshes
    .filter((m) => m.metadata?.type === "customGeneralGrid3D")
    .forEach((m) => m.dispose());

  scene.transformNodes
    .filter((n) => n.metadata?.type === "customGeneralGrid3DRoot")
    .forEach((n) => n.dispose());
}

export function drawCustomGeneralGrids3D(scene, referenceGrid, stories = []) {
  if (!scene || !referenceGrid) return;

  clearCustomGeneralGrids3D(scene);

  const allGeneralGrids = referenceGrid.generalGrids || [];
  const customLines = allGeneralGrids.filter(
    (line) => line.visible !== false && line.source === "custom"
  );

  if (!customLines.length) return;

  const elevations = getStoryElevations(referenceGrid, stories);

  const root = new TransformNode("customGeneralGrid3DRoot", scene);
  root.metadata = { type: "customGeneralGrid3DRoot" };

  customLines.forEach((line) => {
    elevations.forEach((elev, index) => {
      const mesh = MeshBuilder.CreateDashedLines(
        `custom-general-grid-${line.id}-${index}`,
        {
          points: [
            modelToBabylon(line.x1, line.y1, elev),
            modelToBabylon(line.x2, line.y2, elev),
          ],
          dashSize: 0.35,
          gapSize: 0.2,
          dashNb: 40,
          updatable: false,
        },
        scene
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